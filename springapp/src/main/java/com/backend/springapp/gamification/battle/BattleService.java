package com.backend.springapp.gamification.battle;

import com.backend.springapp.gamification.GamificationService;
import com.backend.springapp.gamification.PlayerStats;
import com.backend.springapp.gamification.PlayerStatsRepository;
import com.backend.springapp.gamification.achievement.AchievementService;
import com.backend.springapp.gamification.coins.TransactionSource;
import com.backend.springapp.problem.Problem;
import com.backend.springapp.problem.ProblemRepository;
import com.backend.springapp.problem.Tag;
import com.backend.springapp.user.User;
import com.backend.springapp.user.UserProgressRepository;
import com.backend.springapp.user.UserRepository;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Objects;

/**
 * Core 1-v-1 battle logic - matchmaking, lobby, arena, judging, ELO.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BattleService {

    private final BattleRepository battleRepo;
    private final BattleParticipantRepository participantRepo;
    private final BattleProblemRepository battleProblemRepo;
    private final BattleSubmissionRepository submissionRepo;
    private final MatchmakingQueueRepository queueRepo;
    private final PlayerStatsRepository statsRepo;
    private final ProblemRepository problemRepo;
    private final UserRepository userRepo;
    private final UserProgressRepository progressRepo;
    private final GamificationService gamificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final AchievementService achievementService;
    private final RestTemplate judgeRestTemplate;
    private final com.backend.springapp.judge.JudgeProxyService judgeProxyService;
    @Value("${judge.base-url:http://localhost:9000}")
    private String judgeBaseUrl;
    @Value("${battle.customTimer1v1.enabled:true}")
    private boolean customTimer1v1Enabled = true;
    @Value("${battle.continueAfterFirstFinisher.enabled:true}")
    private boolean continueAfterFirstFinisherEnabled = true;
    @Autowired(required = false)
    private MeterRegistry meterRegistry;

    private static final long JUDGE_PROBLEM_CACHE_TTL_MS = 5 * 60 * 1000;
    private static final int RATE_LIMIT_SECONDS = 10;
    private static final int MIN_1V1_DURATION_MINUTES = 10;
    private static final int MAX_1V1_DURATION_MINUTES = 180;
    private static final int MIN_GROUP_DURATION_MINUTES = 10;
    private static final int MAX_GROUP_DURATION_MINUTES = 180;
    private static final String ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private final java.util.Random random = new java.util.Random();
    private volatile List<JudgeProblemSummary> judgeProblemCatalogCache = List.of();
    private volatile long judgeProblemCatalogCachedAtMs = 0L;

    /* ═══════════════════════════════════════════════════════════
     * MATCHMAKING QUEUE
     * ═══════════════════════════════════════════════════════════ */

    @Transactional
    public Map<String, Object> joinQueue(Long userId, BattleMode mode, Tag difficulty, int problemCount,
                                          Integer durationMinutes) {
        if (mode != BattleMode.CASUAL_1V1 && mode != BattleMode.RANKED_1V1) {
            throw new IllegalArgumentException("Queue supports only 1v1 modes");
        }
        if (problemCount < 1 || problemCount > 3) {
            throw new IllegalArgumentException("problemCount must be between 1 and 3");
        }

        // Auto-clean stale entry if user is already in queue (e.g. page refresh, app restart)
        if (queueRepo.existsByUserId(userId)) {
            queueRepo.deleteByUserId(userId);
            queueRepo.flush();
            log.info("Cleaned stale queue entry for user {} before re-queuing", userId);
        }

        // If user is in a group battle (WAITING/ACTIVE), block 1v1 queue entry.
        Optional<Battle> activeGroupBattle = findRecentActiveGroupBattleForUser(userId);
        if (activeGroupBattle.isPresent()) {
            throw new IllegalStateException("You are currently in a group battle. Leave/forfeit it before joining 1v1 queue.");
        }

        // If user is already in a WAITING/ACTIVE 1v1 battle, return it for rejoin.
        // Group rooms are handled via the /group flow and must not be surfaced here.
        Optional<Battle> existingBattle = findRecentOneVsOneBattleForUser(userId);
        if (existingBattle.isPresent()) {
            Battle b = existingBattle.get();
            return Map.of(
                    "status", "ACTIVE_BATTLE",
                    "battleId", b.getId(),
                    "battleState", b.getState().name()
            );
        }

        PlayerStats stats = gamificationService.getOrCreateStats(userId);

        MatchmakingQueue entry = new MatchmakingQueue();
        entry.setUserId(userId);
        entry.setMode(mode);
        entry.setDifficulty(difficulty);
        entry.setProblemCount(problemCount);
        entry.setDurationMinutes(resolveOneVsOneDurationMinutes(mode, problemCount, durationMinutes));
        entry.setBattleRating(stats.getBattleRating());
        queueRepo.saveAndFlush(entry);
        incrementMetric("battle.queue.join", "mode", mode.name(), "durationMinutes", String.valueOf(entry.getDurationMinutes()));

        log.info("⚔️ User {} joined {} queue (difficulty={}, count={}, duration={}m, BR={})",
            userId, mode, difficulty, problemCount, entry.getDurationMinutes(), stats.getBattleRating());

        return Map.of("status", "QUEUED", "queueId", entry.getId());
    }

    @Transactional(readOnly = true)
    public QueueStatusResponse getQueueStatus(Long userId) {
        // If user is no longer in queue, they might have been matched
        Optional<MatchmakingQueue> queueEntry = queueRepo.findByUserId(userId);
        if (queueEntry.isPresent()) {
            return new QueueStatusResponse("QUEUED", null);
        }

        // Search for a WAITING/ACTIVE 1v1 battle where this user is a participant
        return findRecentOneVsOneBattleForUser(userId)
                .map(b -> new QueueStatusResponse("MATCHED", b.getId()))
                .orElse(new QueueStatusResponse("NOT_QUEUED", null));
    }

    /** Look for the most recent WAITING or ACTIVE battle for a user. */
    private Optional<Battle> findRecentBattleForUser(Long userId) {
        // Get all battles in WAITING state, check if user is participant
        List<Battle> waitingBattles = battleRepo.findByState(BattleState.WAITING);
        for (Battle b : waitingBattles) {
            if (participantRepo.findByBattleIdAndUserId(b.getId(), userId).isPresent()) {
                return Optional.of(b);
            }
        }
        List<Battle> activeBattles = battleRepo.findByState(BattleState.ACTIVE);
        for (Battle b : activeBattles) {
            if (participantRepo.findByBattleIdAndUserId(b.getId(), userId).isPresent()) {
                return Optional.of(b);
            }
        }
        return Optional.empty();
    }

    /**
     * Look for the most recent WAITING/ACTIVE 1v1 battle for a user.
     * Group battles are intentionally excluded to avoid routing 1v1 UI
     * (queue/lobby/rejoin overlay) into group rooms.
     */
    private Optional<Battle> findRecentOneVsOneBattleForUser(Long userId) {
        return findRecentBattleForUser(userId)
                .filter(b -> b.getMode() == BattleMode.CASUAL_1V1 || b.getMode() == BattleMode.RANKED_1V1);
    }

    /** Look for a WAITING/ACTIVE group battle for a user. */
    private Optional<Battle> findRecentActiveGroupBattleForUser(Long userId) {
        return findRecentBattleForUser(userId)
                .filter(b -> b.getMode() == BattleMode.GROUP_FFA);
    }

    @Transactional(readOnly = true)
    public boolean hasActiveOrWaitingBattle(Long userId) {
        return findRecentBattleForUser(userId).isPresent();
    }

    @Transactional
    public void leaveQueue(Long userId) {
        queueRepo.deleteByUserId(userId);
        log.info("User {} left matchmaking queue", userId);
    }

    /* ═══════════════════════════════════════════════════════════
     * MATCHMAKING (called by scheduled job)
     * ═══════════════════════════════════════════════════════════ */

    @Transactional
    public void processMatchmaking() {
        // Group queue entries by mode + difficulty
        List<MatchmakingQueue> all = queueRepo.findAll();
        Map<String, List<MatchmakingQueue>> groups = all.stream()
                .collect(Collectors.groupingBy(e -> e.getMode() + ":" + e.getDifficulty()));

        for (var group : groups.values()) {
            if (group.size() < 2) continue;

            // Sort by join time
            group.sort(Comparator.comparing(MatchmakingQueue::getJoinedAt));

            Set<Long> matched = new HashSet<>();
            for (int i = 0; i < group.size(); i++) {
                if (matched.contains(group.get(i).getId())) continue;
                MatchmakingQueue a = group.get(i);

                for (int j = i + 1; j < group.size(); j++) {
                    if (matched.contains(group.get(j).getId())) continue;
                    MatchmakingQueue b = group.get(j);

                    if (isRatingCompatible(a, b) && isDurationCompatible(a, b)) {
                        // Use the smaller problem count (both must agree on count)
                        int count = Math.min(a.getProblemCount(), b.getProblemCount());
                        Battle battle = createBattle(a, b, count, a.getDurationMinutes());
                        matched.add(a.getId());
                        matched.add(b.getId());

                        // ── WebSocket: notify both users AFTER transaction commits ──
                        // This prevents clients from fetching a battle that isn't committed yet
                        final Long userA = a.getUserId();
                        final Long userB = b.getUserId();
                        final Long bId = battle.getId();
                        TransactionSynchronizationManager.registerSynchronization(
                                new TransactionSynchronization() {
                                    @Override
                                    public void afterCommit() {
                                        Map<String, Object> matchPayload = Map.of(
                                                "status", "MATCHED", "battleId", bId);
                                        broadcastSafe("/topic/queue/" + userA + "/matched", matchPayload);
                                        broadcastSafe("/topic/queue/" + userB + "/matched", matchPayload);
                                    }
                                });
                        break;
                    }
                }
            }
        }
    }

    private boolean isRatingCompatible(MatchmakingQueue a, MatchmakingQueue b) {
        int diff = Math.abs(a.getBattleRating() - b.getBattleRating());
        if (a.getMode() == BattleMode.CASUAL_1V1) {
            return diff <= 300;
        }
        // Ranked: base ±200, widens by 50 every 30 seconds
        long aWaitSec = Duration.between(a.getJoinedAt(), LocalDateTime.now()).getSeconds();
        long bWaitSec = Duration.between(b.getJoinedAt(), LocalDateTime.now()).getSeconds();
        long maxWait = Math.max(aWaitSec, bWaitSec);
        int widening = (int) (maxWait / 30) * 50;
        return diff <= (200 + widening);
    }

    private boolean isDurationCompatible(MatchmakingQueue a, MatchmakingQueue b) {
        if (!customTimer1v1Enabled) {
            return true;
        }
        return a.getDurationMinutes() == b.getDurationMinutes();
    }

    @Transactional
    public Battle createBattle(MatchmakingQueue a, MatchmakingQueue b, int problemCount, int durationMinutes) {
        // Create battle
        Battle battle = new Battle();
        battle.setMode(a.getMode());
        battle.setDifficulty(a.getDifficulty());
        battle.setProblemCount(problemCount);
        battle.setDurationMinutes(resolveOneVsOneDurationMinutes(a.getMode(), problemCount, durationMinutes));
        battle.setState(BattleState.WAITING);
        battleRepo.saveAndFlush(battle);

        // Create participants
        createParticipant(battle.getId(), a.getUserId(), a.getBattleRating());
        createParticipant(battle.getId(), b.getUserId(), b.getBattleRating());

        // Select problems
        selectProblems(battle.getId(), a.getDifficulty(), problemCount,
                List.of(a.getUserId(), b.getUserId()));

        // Remove both from queue
        queueRepo.deleteByUserId(a.getUserId());
        queueRepo.deleteByUserId(b.getUserId());

        log.info("⚔️ Battle {} created: user {} vs user {} (mode={}, diff={}, problems={})",
                battle.getId(), a.getUserId(), b.getUserId(),
                a.getMode(), a.getDifficulty(), problemCount);

        return battle;
    }

    @Transactional
    public Battle createDirectChallengeBattle(Long challengerId, Long challengeeId,
                                              BattleMode mode, Tag difficulty, int problemCount,
                                              Integer durationMinutes) {
        if (mode != BattleMode.CASUAL_1V1 && mode != BattleMode.RANKED_1V1) {
            throw new IllegalArgumentException("Friend challenge supports only 1v1 modes");
        }
        if (problemCount < 1 || problemCount > 3) {
            throw new IllegalArgumentException("problemCount must be between 1 and 3");
        }

        if (hasActiveOrWaitingBattle(challengerId) || hasActiveOrWaitingBattle(challengeeId)) {
            throw new IllegalStateException("One of the players is already in an active battle");
        }

        Battle battle = new Battle();
        battle.setMode(mode);
        battle.setDifficulty(difficulty);
        battle.setProblemCount(problemCount);
        battle.setDurationMinutes(resolveOneVsOneDurationMinutes(mode, problemCount, durationMinutes));
        battle.setState(BattleState.WAITING);
        battleRepo.saveAndFlush(battle);

        PlayerStats challengerStats = gamificationService.getOrCreateStats(challengerId);
        PlayerStats challengeeStats = gamificationService.getOrCreateStats(challengeeId);
        createParticipant(battle.getId(), challengerId, challengerStats.getBattleRating());
        createParticipant(battle.getId(), challengeeId, challengeeStats.getBattleRating());

        selectProblems(battle.getId(), difficulty, problemCount, List.of(challengerId, challengeeId));

        log.info("⚔️ Friend challenge battle {} created: {} vs {} (mode={}, diff={}, problems={})",
                battle.getId(), challengerId, challengeeId, mode, difficulty, problemCount);

        return battle;
    }

    private void createParticipant(Long battleId, Long userId, int ratingBefore) {
        BattleParticipant bp = new BattleParticipant();
        bp.setBattleId(battleId);
        bp.setUserId(userId);
        bp.setRatingBefore(ratingBefore);
        participantRepo.saveAndFlush(bp);
    }

    private void selectProblems(Long battleId, Tag difficulty, int count, List<Long> userIds) {
        // Get all problems of this difficulty that have an lcslug (needed for judge)
        List<Problem> candidates = problemRepo.findAll().stream()
                .filter(p -> p.getTag() == difficulty)
                .filter(p -> p.getLcslug() != null && !p.getLcslug().isBlank())
                .collect(Collectors.toList());

        // Prefer problems neither user has solved
        Set<Long> solvedByEither = new HashSet<>();
        for (Long uid : userIds) {
            progressRepo.findAllByUserId(uid).stream()
                    .filter(up -> up.getStatus().name().equals("SOLVED"))
                    .forEach(up -> solvedByEither.add(up.getProblem().getPid()));
        }

        List<Problem> fresh = candidates.stream()
                .filter(p -> !solvedByEither.contains(p.getPid()))
                .collect(Collectors.toList());

        // Use fresh problems first, fall back to all if not enough
        List<Problem> pool = fresh.size() >= count ? fresh : candidates;
        Collections.shuffle(pool);
        List<Problem> selected = pool.stream().limit(count).toList();

        for (int i = 0; i < selected.size(); i++) {
            Problem p = selected.get(i);
            BattleProblem bp = new BattleProblem();
            bp.setBattleId(battleId);
            bp.setProblemId(p.getPid());
            bp.setJudgeProblemId(resolveJudgeProblemId(p.getLcslug(), p));
            bp.setProblemIndex(i);
            battleProblemRepo.saveAndFlush(bp);
        }
    }

    /* ═══════════════════════════════════════════════════════════
     * LOBBY
     * ═══════════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public BattleLobbyDTO getBattle(Long battleId, Long userId) {
        Battle battle = battleRepo.findById(battleId)
                .orElseThrow(() -> new NoSuchElementException("Battle not found: " + battleId));

        List<BattleParticipant> participants = participantRepo.findByBattleId(battleId);
        BattleParticipant me = participants.stream()
                .filter(p -> p.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("You are not in this battle"));
        BattleParticipant opp = participants.stream()
                .filter(p -> !p.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Opponent not found"));

        long lobbyTimeRemaining = 0;
        if (battle.getState() == BattleState.WAITING) {
            long elapsed = Duration.between(battle.getCreatedAt(), LocalDateTime.now()).toMillis();
            lobbyTimeRemaining = Math.max(0, 60_000 - elapsed);
        }

        return new BattleLobbyDTO(
                battle.getId(),
                battle.getMode().name(),
                battle.getDifficulty().name(),
                battle.getProblemCount(),
                battle.getDurationMinutes(),
                battle.getState().name(),
                toParticipantInfo(me),
                toParticipantInfo(opp),
                lobbyTimeRemaining
        );
    }

    private BattleLobbyDTO.ParticipantInfo toParticipantInfo(BattleParticipant bp) {
        String username = userRepo.findById(bp.getUserId())
                .map(User::getUsername).orElse("Unknown");
        PlayerStats stats = gamificationService.getOrCreateStats(bp.getUserId());
        return new BattleLobbyDTO.ParticipantInfo(
                bp.getUserId(),
                username,
                bp.getRatingBefore(),
                stats.getLevel(),
                bp.isReady(),
                bp.getLanguage()
        );
    }

    @Transactional
    public BattleLobbyDTO readyUp(Long battleId, Long userId, String language) {
        Battle battle = battleRepo.findById(battleId)
                .orElseThrow(() -> new NoSuchElementException("Battle not found"));

        if (battle.getState() != BattleState.WAITING) {
            throw new IllegalStateException("Battle is not in WAITING state");
        }

        BattleParticipant me = participantRepo.findByBattleIdAndUserId(battleId, userId)
                .orElseThrow(() -> new IllegalStateException("You are not in this battle"));

        me.setReady(true);
        me.setLanguage(language);
        participantRepo.saveAndFlush(me);

        // Check if BOTH are ready → start battle
        List<BattleParticipant> all = participantRepo.findByBattleId(battleId);
        boolean allReady = all.stream().allMatch(BattleParticipant::isReady);
        if (allReady) {
            battle.setState(BattleState.ACTIVE);
            battle.setStartedAt(LocalDateTime.now());
            battleRepo.saveAndFlush(battle);
            log.info("⚔️ Battle {} is now ACTIVE!", battleId);
        }

        BattleLobbyDTO lobbyDTO = getBattle(battleId, userId);

        // ── WebSocket: broadcast lobby update to each player (perspective-specific) ──
        List<BattleParticipant> allParticipants = participantRepo.findByBattleId(battleId);
        for (BattleParticipant p : allParticipants) {
            try {
                BattleLobbyDTO perUserLobby = getBattle(battleId, p.getUserId());
                broadcastSafe("/topic/battle/" + battleId + "/lobby/" + p.getUserId(), perUserLobby);
            } catch (Exception e) {
                log.warn("Failed to broadcast lobby to user {}: {}", p.getUserId(), e.getMessage());
            }
        }

        return lobbyDTO;
    }

    /* ═══════════════════════════════════════════════════════════
     * BATTLE STATE (polling during active battle)
     * ═══════════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public BattleStateDTO getBattleState(Long battleId, Long userId) {
        Battle battle = battleRepo.findById(battleId)
                .orElseThrow(() -> new NoSuchElementException("Battle not found"));

        List<BattleParticipant> participants = participantRepo.findByBattleId(battleId);
        BattleParticipant me = participants.stream()
                .filter(p -> p.getUserId().equals(userId)).findFirst()
                .orElseThrow(() -> new IllegalStateException("Not in this battle"));
        BattleParticipant opp = participants.stream()
                .filter(p -> !p.getUserId().equals(userId)).findFirst()
                .orElseThrow();

        long timeRemainingMs = 0;
        if (battle.getState() == BattleState.ACTIVE && battle.getStartedAt() != null) {
            long elapsed = Duration.between(battle.getStartedAt(), LocalDateTime.now()).toMillis();
            long totalMs = (long) battle.getDurationMinutes() * 60_000;
            timeRemainingMs = Math.max(0, totalMs - elapsed);
        }

        // Build problem info
        List<BattleProblem> battleProblems = battleProblemRepo.findByBattleIdOrderByProblemIndex(battleId);
        List<BattleStateDTO.ProblemInfo> problemInfos = battleProblems.stream().map(bp -> {
            Problem p = problemRepo.findById(bp.getProblemId()).orElse(null);
            String resolvedJudgeId = resolveJudgeProblemId(bp.getJudgeProblemId(), p);
            boolean solved = submissionRepo.hasAcceptedSubmission(battleId, userId, bp.getProblemIndex());
            return new BattleStateDTO.ProblemInfo(
                    bp.getProblemIndex(),
                    p != null ? p.getTitle() : "Unknown",
                    p != null ? p.getDescription() : "",
                    "", // examples - frontend fetches from judge
                    "", // constraints
                resolvedJudgeId,
                    solved
            );
        }).toList();

        return new BattleStateDTO(
                battleId,
                battle.getState().name(),
                timeRemainingMs,
                new BattleStateDTO.ProgressInfo(me.getProblemsSolved(), me.getTotalSubmissions()),
                new BattleStateDTO.ProgressInfo(opp.getProblemsSolved(), opp.getTotalSubmissions()),
            problemInfos,
            determineWinner(me, opp),
            determineLeaderReason(me, opp)
        );
    }

    /* ═══════════════════════════════════════════════════════════
     * CODE SUBMISSION
     * ═══════════════════════════════════════════════════════════ */

    @Transactional
    public SubmitResultDTO submitCode(Long battleId, Long userId, int problemIndex,
                                       String language, String code) {
        Battle battle = battleRepo.findById(battleId)
                .orElseThrow(() -> new NoSuchElementException("Battle not found"));

        if (battle.getState() != BattleState.ACTIVE) {
            throw new IllegalStateException("Battle is not active");
        }

        // Verify time hasn't expired
        long elapsed = Duration.between(battle.getStartedAt(), LocalDateTime.now()).toMillis();
        if (elapsed >= (long) battle.getDurationMinutes() * 60_000) {
            throw new IllegalStateException("Battle time has expired");
        }

        BattleParticipant me = participantRepo.findByBattleIdAndUserId(battleId, userId)
                .orElseThrow(() -> new IllegalStateException("Not in this battle"));

        if (battle.getMode() == BattleMode.GROUP_FFA && me.isForfeited()) {
            throw new IllegalStateException("You forfeited this group battle");
        }

        // Already solved this problem?
        if (submissionRepo.hasAcceptedSubmission(battleId, userId, problemIndex)) {
            throw new IllegalStateException("You already solved this problem");
        }

        // Rate limit: 1 submission per 10 seconds
        submissionRepo.findTopByBattleIdAndUserIdOrderBySubmittedAtDesc(battleId, userId)
                .ifPresent(last -> {
                    long secsSince = Duration.between(last.getSubmittedAt(), LocalDateTime.now()).getSeconds();
                    if (secsSince < RATE_LIMIT_SECONDS) {
                        throw new IllegalStateException(
                                "Rate limit: wait " + (RATE_LIMIT_SECONDS - secsSince) + " seconds");
                    }
                });

        // Get judge problem ID
        List<BattleProblem> battleProblems = battleProblemRepo.findByBattleIdOrderByProblemIndex(battleId);
        BattleProblem bp = battleProblems.stream()
                .filter(p -> p.getProblemIndex() == problemIndex)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid problem index"));

        Problem springProblem = problemRepo.findById(bp.getProblemId()).orElse(null);
        String resolvedJudgeId = resolveJudgeProblemId(bp.getJudgeProblemId(), springProblem);

        // Call the Judge service
        JudgeResult judgeResult = callJudge(resolvedJudgeId, language, code);

        // Self-heal stored judgeProblemId for future requests/battles state payloads
        if (!Objects.equals(resolvedJudgeId, bp.getJudgeProblemId())) {
            bp.setJudgeProblemId(resolvedJudgeId);
            battleProblemRepo.saveAndFlush(bp);
        }

        // Record submission
        BattleSubmission sub = new BattleSubmission();
        sub.setBattleId(battleId);
        sub.setUserId(userId);
        sub.setProblemIndex(problemIndex);
        sub.setLanguage(language);
        sub.setCode(code);
        sub.setVerdict(judgeResult.verdict());
        sub.setExecutionTimeMs(judgeResult.executionTimeMs());
        submissionRepo.saveAndFlush(sub);

        me.setTotalSubmissions(me.getTotalSubmissions() + 1);

        boolean allSolved = false;
        boolean shouldCompleteGroupBattle = false;
        if (judgeResult.verdict() == Verdict.ACCEPTED) {
            me.setProblemsSolved(me.getProblemsSolved() + 1);
            // Add solve time (ms from battle start)
            me.setTotalSolveTimeMs(me.getTotalSolveTimeMs() + elapsed);

            // ── GROUP_FFA: apply FFA scoring formula ──
            if (battle.getMode() == BattleMode.GROUP_FFA) {
                int ffaPoints = calculateFfaPoints(battle, battleId, userId, problemIndex, elapsed);
                me.setGroupScore(me.getGroupScore() + ffaPoints);
                if (me.getProblemsSolved() >= battle.getProblemCount()) {
                    allSolved = true;
                }
                log.info("FFA: user {} solved problem {} for {} points (total={})",
                        userId, problemIndex, ffaPoints, me.getGroupScore());
            } else {
                // 1v1: allSolved is informational; battle continues until timer/forfeit
                if (me.getProblemsSolved() >= battle.getProblemCount()) {
                    allSolved = true;
                    incrementMetric("battle.firstFinisher", "mode", battle.getMode().name());
                    if (!continueAfterFirstFinisherEnabled) {
                        incrementMetric("battle.complete.trigger", "reason", "all_solved", "mode", battle.getMode().name());
                        completeBattle(battleId);
                    }
                }
            }
        }

        participantRepo.saveAndFlush(me);

        if (battle.getMode() == BattleMode.GROUP_FFA) {
            List<BattleParticipant> activeParticipants = participantRepo.findByBattleId(battleId).stream()
                    .filter(p -> !p.isForfeited())
                    .toList();

            shouldCompleteGroupBattle = !activeParticipants.isEmpty()
                    && activeParticipants.stream().allMatch(p -> p.getProblemsSolved() >= battle.getProblemCount());

            if (shouldCompleteGroupBattle) {
                incrementMetric("battle.complete.trigger", "reason", "all_players_finished", "mode", battle.getMode().name());
                completeGroupBattle(battleId);
            }
        }

        // ── WebSocket: broadcast updated state to participants ──
        if (!shouldCompleteGroupBattle) {
            try {
                List<BattleParticipant> allParticipants = participantRepo.findByBattleId(battleId);
                if (battle.getMode() == BattleMode.GROUP_FFA) {
                    // Broadcast group scoreboard to each player
                    for (BattleParticipant p : allParticipants) {
                        GroupBattleStateDTO stateDTO = getGroupBattleState(battleId, p.getUserId());
                        broadcastSafe("/topic/battle/" + battleId + "/group-state/" + p.getUserId(), stateDTO);
                    }
                } else {
                    // Broadcast 1v1 state to each player
                    for (BattleParticipant p : allParticipants) {
                        BattleStateDTO stateDTO = getBattleState(battleId, p.getUserId());
                        broadcastSafe("/topic/battle/" + battleId + "/state/" + p.getUserId(), stateDTO);
                    }
                }
            } catch (Exception e) {
                log.warn("WebSocket broadcast failed after submission: {}", e.getMessage());
            }
        }

        return new SubmitResultDTO(
                judgeResult.verdict().name(),
                judgeResult.executionTimeMs(),
                me.getProblemsSolved(),
                battle.getProblemCount(),
                allSolved,
                judgeResult.firstFailedInput(),
                judgeResult.firstFailedExpected(),
                judgeResult.firstFailedActual(),
                judgeResult.firstFailedError()
        );
    }

    /** Proxy code to the Judge service via JudgeProxyService (fetches testCases from catalog). */
    private JudgeResult callJudge(String problemId, String language, String code) {
        try {
            Map<?, ?> resBody = judgeProxyService.submit(problemId, language, code);
            if (resBody == null || resBody.isEmpty()) {
                return new JudgeResult(Verdict.RUNTIME_ERROR, 0L, null, null, null, null);
            }

            String status = String.valueOf(resBody.get("status"));
            Long execTime = resBody.get("time") != null
                    ? ((Number) resBody.get("time")).longValue() : 0L;

            Verdict verdict = switch (status) {
                case "Accepted" -> Verdict.ACCEPTED;
                case "Wrong Answer" -> Verdict.WRONG_ANSWER;
                case "Time Limit Exceeded" -> Verdict.TIME_LIMIT;
                case "Compilation Error" -> Verdict.COMPILE_ERROR;
                default -> Verdict.RUNTIME_ERROR;
            };

            String ffInput = null, ffExpected = null, ffActual = null, ffError = null;
            Object rawResults = resBody.get("results");
            if (rawResults instanceof java.util.List<?> resultList) {
                for (Object item : resultList) {
                    if (item instanceof Map<?, ?> tc) {
                        Boolean passed = (Boolean) tc.get("passed");
                        if (Boolean.FALSE.equals(passed)) {
                            ffInput    = tc.get("input")    != null ? String.valueOf(tc.get("input"))    : null;
                            ffExpected = tc.get("expected") != null ? String.valueOf(tc.get("expected")) : null;
                            ffActual   = tc.get("actual")   != null ? String.valueOf(tc.get("actual"))   : null;
                            ffError    = tc.get("error")    != null ? String.valueOf(tc.get("error"))    : null;
                            break;
                        }
                    }
                }
            }

            return new JudgeResult(verdict, execTime, ffInput, ffExpected, ffActual, ffError);
        } catch (Exception e) {
            log.error("Judge service call failed for problem {}: {}", problemId, e.getMessage());
            return new JudgeResult(Verdict.RUNTIME_ERROR, 0L, null, null, null, null);
        }
    }

    private record JudgeResult(
            Verdict verdict,
            Long executionTimeMs,
            String firstFailedInput,
            String firstFailedExpected,
            String firstFailedActual,
            String firstFailedError
    ) {}

    /* ═══════════════════════════════════════════════════════════
     * BATTLE COMPLETION
     * ═══════════════════════════════════════════════════════════ */

    @Transactional
    public void completeBattle(Long battleId) {
        Battle battle = battleRepo.findById(battleId).orElse(null);
        if (battle == null || battle.getState() == BattleState.COMPLETED
                         || battle.getState() == BattleState.CANCELLED) return;

        // Route group battles to their own completion handler
        if (battle.getMode() == BattleMode.GROUP_FFA) {
            completeGroupBattle(battleId);
            return;
        }

        battle.setState(BattleState.COMPLETED);
        battle.setCompletedAt(LocalDateTime.now());

        List<BattleParticipant> participants = participantRepo.findByBattleId(battleId);
        if (participants.size() != 2) {
            battle.setState(BattleState.CANCELLED);
            battleRepo.saveAndFlush(battle);
            return;
        }

        BattleParticipant p1 = participants.get(0);
        BattleParticipant p2 = participants.get(1);

        // Determine winner using tiebreaker chain
        Long winnerId = determineWinner(p1, p2);
        battle.setWinnerId(winnerId);
        battleRepo.saveAndFlush(battle);

        // Calculate and apply rating changes + rewards
        boolean isRanked = battle.getMode() == BattleMode.RANKED_1V1;
        applyBattleOutcome(p1, p2, winnerId, isRanked);

        log.info("⚔️ Battle {} completed. Winner: {}", battleId,
                winnerId != null ? winnerId : "DRAW");

        // ── WebSocket: broadcast completion + result to both players ──
        broadcastBattleCompletion(battleId, participants);
    }

    /**
     * Tiebreaker chain:
     * 1) More problems solved → wins
     * 2) Equal → faster total solve time → wins
     * 3) Equal → fewer submissions → wins
     * 4) Full tie → DRAW (null)
     */
    private Long determineWinner(BattleParticipant p1, BattleParticipant p2) {
        // 1. Problems solved
        if (p1.getProblemsSolved() != p2.getProblemsSolved()) {
            return p1.getProblemsSolved() > p2.getProblemsSolved()
                    ? p1.getUserId() : p2.getUserId();
        }
        // 2. Total solve time (lower wins)
        if (p1.getTotalSolveTimeMs() != p2.getTotalSolveTimeMs()) {
            return p1.getTotalSolveTimeMs() < p2.getTotalSolveTimeMs()
                    ? p1.getUserId() : p2.getUserId();
        }
        // 3. Fewer submissions
        if (p1.getTotalSubmissions() != p2.getTotalSubmissions()) {
            return p1.getTotalSubmissions() < p2.getTotalSubmissions()
                    ? p1.getUserId() : p2.getUserId();
        }
        // 4. Draw
        return null;
    }

    private String determineLeaderReason(BattleParticipant p1, BattleParticipant p2) {
        if (p1.getProblemsSolved() != p2.getProblemsSolved()) {
            return "PROBLEMS_SOLVED";
        }
        if (p1.getTotalSolveTimeMs() != p2.getTotalSolveTimeMs()) {
            return "SOLVE_TIME";
        }
        if (p1.getTotalSubmissions() != p2.getTotalSubmissions()) {
            return "SUBMISSIONS";
        }
        return "TIED";
    }

    public int resolveOneVsOneDurationMinutes(BattleMode mode, int problemCount, Integer requestedDurationMinutes) {
        if (mode != BattleMode.CASUAL_1V1 && mode != BattleMode.RANKED_1V1) {
            throw new IllegalArgumentException("Only 1v1 modes support custom duration");
        }
        if (problemCount < 1 || problemCount > 3) {
            throw new IllegalArgumentException("problemCount must be between 1 and 3");
        }

        int fallback = problemCount * 15;
        if (!customTimer1v1Enabled) {
            return fallback;
        }
        int candidate = requestedDurationMinutes == null ? fallback : requestedDurationMinutes;

        if (candidate < MIN_1V1_DURATION_MINUTES || candidate > MAX_1V1_DURATION_MINUTES) {
            throw new IllegalArgumentException("1v1 duration must be between " + MIN_1V1_DURATION_MINUTES + " and " + MAX_1V1_DURATION_MINUTES + " minutes");
        }
        return candidate;
    }

    private int normalizeGroupDurationMinutes(int problemCount, int requestedDurationMinutes) {
        int fallback = problemCount * 15;
        int candidate = requestedDurationMinutes > 0 ? requestedDurationMinutes : fallback;
        if (candidate < MIN_GROUP_DURATION_MINUTES || candidate > MAX_GROUP_DURATION_MINUTES) {
            throw new IllegalArgumentException("Group duration must be between " + MIN_GROUP_DURATION_MINUTES + " and " + MAX_GROUP_DURATION_MINUTES + " minutes");
        }
        return candidate;
    }

    private void applyBattleOutcome(BattleParticipant p1, BattleParticipant p2,
                                     Long winnerId, boolean isRanked) {
        if (isRanked) {
            applyElo(p1, p2, winnerId);
        }

        // Reward coins + XP
        rewardParticipant(p1, winnerId, isRanked);
        rewardParticipant(p2, winnerId, isRanked);

        // ── Phase 7: Check battle achievements for both players ──
        try {
            achievementService.checkBattleAchievements(p1.getUserId(), p1.getBattleId());
            achievementService.checkBattleAchievements(p2.getUserId(), p2.getBattleId());
        } catch (Exception e) {
            log.warn("Achievement check failed after battle: {}", e.getMessage());
        }
    }

    private void applyElo(BattleParticipant p1, BattleParticipant p2, Long winnerId) {
        long p1Battles = participantRepo.countCompletedRankedBattles(p1.getUserId());
        long p2Battles = participantRepo.countCompletedRankedBattles(p2.getUserId());

        int k1 = kFactor(p1Battles);
        int k2 = kFactor(p2Battles);

        double expected1 = expectedScore(p1.getRatingBefore(), p2.getRatingBefore());
        double expected2 = 1.0 - expected1;

        double actual1, actual2;
        if (winnerId == null) {
            actual1 = 0.5;
            actual2 = 0.5;
        } else if (winnerId.equals(p1.getUserId())) {
            actual1 = 1.0;
            actual2 = 0.0;
        } else {
            actual1 = 0.0;
            actual2 = 1.0;
        }

        int newRating1 = (int) Math.round(p1.getRatingBefore() + k1 * (actual1 - expected1));
        int newRating2 = (int) Math.round(p2.getRatingBefore() + k2 * (actual2 - expected2));

        // Floor at 0
        newRating1 = Math.max(0, newRating1);
        newRating2 = Math.max(0, newRating2);

        p1.setRatingAfter(newRating1);
        p2.setRatingAfter(newRating2);
        participantRepo.saveAndFlush(p1);
        participantRepo.saveAndFlush(p2);

        // Update PlayerStats
        PlayerStats s1 = gamificationService.getOrCreateStats(p1.getUserId());
        s1.setBattleRating(newRating1);
        statsRepo.saveAndFlush(s1);

        PlayerStats s2 = gamificationService.getOrCreateStats(p2.getUserId());
        s2.setBattleRating(newRating2);
        statsRepo.saveAndFlush(s2);

        log.info("ELO: user {} {} → {}, user {} {} → {}",
                p1.getUserId(), p1.getRatingBefore(), newRating1,
                p2.getUserId(), p2.getRatingBefore(), newRating2);
    }

    private int kFactor(long battlesPlayed) {
        if (battlesPlayed < 10) return 40;
        if (battlesPlayed < 30) return 20;
        return 15;
    }

    private double expectedScore(int myRating, int oppRating) {
        return 1.0 / (1.0 + Math.pow(10, (oppRating - myRating) / 400.0));
    }

    private void rewardParticipant(BattleParticipant bp, Long winnerId, boolean isRanked) {
        int coins, xp;
        boolean isWinner = bp.getUserId().equals(winnerId);
        boolean isDraw = winnerId == null;

        if (isDraw) {
            coins = 15;
            xp = 25;
        } else if (isWinner) {
            coins = isRanked ? 60 : 30;
            xp = isRanked ? 75 : 40;
        } else {
            coins = isRanked ? 10 : 5;
            xp = isRanked ? 15 : 10;
        }

        // Safety guard: skip if no rewards to give
        if (coins <= 0 && xp <= 0) return;

        PlayerStats stats = gamificationService.getOrCreateStats(bp.getUserId());
        stats.setXp(stats.getXp() + xp);
        stats.setLevel(GamificationService.calculateLevel(stats.getXp()));
        statsRepo.saveAndFlush(stats);

        if (coins > 0) {
            gamificationService.creditCoins(bp.getUserId(), coins, TransactionSource.BATTLE_WIN, bp.getBattleId());
        }

        // Track battle XP + coins on the weekly leaderboard
        gamificationService.addWeeklyBattleReward(bp.getUserId(), coins, xp);

        log.info("Battle reward: user {} gets {} coins + {} XP ({})",
                bp.getUserId(), coins, xp,
                isDraw ? "DRAW" : isWinner ? "WIN" : "LOSS");
    }

    /* ═══════════════════════════════════════════════════════════
     * FORFEIT
     * ═══════════════════════════════════════════════════════════ */

    @Transactional
    public void forfeit(Long battleId, Long userId) {
        Battle battle = battleRepo.findById(battleId)
                .orElseThrow(() -> new NoSuchElementException("Battle not found"));

        // Graceful no-op if battle already resolved (e.g. timer expired between UI check and click)
        if (battle.getState() == BattleState.COMPLETED || battle.getState() == BattleState.CANCELLED) {
            log.info("Forfeit request for already resolved battle {} by user {} — ignoring", battleId, userId);
            return;
        }

        // Group FFA: mark forfeiter, keep room running for others.
        // Early-complete only when <=1 non-forfeited player remains.
        if (battle.getMode() == BattleMode.GROUP_FFA) {
            incrementMetric("battle.complete.trigger", "reason", "forfeit", "mode", battle.getMode().name());
            if (battle.getState() != BattleState.ACTIVE) {
                throw new IllegalStateException("Cannot forfeit before group battle starts");
            }

            List<BattleParticipant> participants = participantRepo.findByBattleId(battleId);
            BattleParticipant forfeiter = participants.stream()
                    .filter(p -> p.getUserId().equals(userId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("Not in this battle"));

            if (forfeiter.isForfeited()) {
                return;
            }

            // Keep forfeiter at the bottom and disable further submissions.
            forfeiter.setForfeited(true);
            forfeiter.setGroupScore(Math.min(forfeiter.getGroupScore(), -1_000_000));
            participantRepo.saveAndFlush(forfeiter);

            long activePlayers = participants.stream().filter(p -> !p.isForfeited()).count();
            if (activePlayers <= 1) {
                completeGroupBattle(battleId);
            } else {
                for (BattleParticipant p : participants) {
                    try {
                        GroupBattleStateDTO stateDTO = getGroupBattleState(battleId, p.getUserId());
                        broadcastSafe("/topic/battle/" + battleId + "/group-state/" + p.getUserId(), stateDTO);
                    } catch (Exception e) {
                        log.warn("Failed to broadcast group forfeit state to user {}: {}", p.getUserId(), e.getMessage());
                    }
                }
            }

            log.info("🏟️ User {} forfeited group battle {}", userId, battleId);
            return;
        }

        List<BattleParticipant> participants = participantRepo.findByBattleId(battleId);
        BattleParticipant forfeiter = participants.stream()
                .filter(p -> p.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Not in this battle"));
        incrementMetric("battle.complete.trigger", "reason", "forfeit", "mode", battle.getMode().name());

        BattleParticipant opponent = participants.stream()
                .filter(p -> !p.getUserId().equals(userId))
                .findFirst()
                .orElseThrow();

        // Set winner as opponent
        battle.setWinnerId(opponent.getUserId());
        battle.setState(BattleState.COMPLETED);
        battle.setCompletedAt(LocalDateTime.now());
        battleRepo.saveAndFlush(battle);

        boolean isRanked = battle.getMode() == BattleMode.RANKED_1V1;

        // Apply ELO (opponent wins)
        if (isRanked) {
            applyElo(forfeiter, opponent, opponent.getUserId());
        }

        // Reward opponent as winner, forfeiter gets nothing
        rewardParticipant(opponent, opponent.getUserId(), isRanked);

        log.info("⚔️ User {} forfeited battle {}. Winner: {}",
                userId, battleId, opponent.getUserId());

        // ── WebSocket: broadcast forfeit result to both players ──
        broadcastBattleCompletion(battleId, participants);
    }

    /* ═══════════════════════════════════════════════════════════
     * BATTLE RESULT
     * ═══════════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public BattleResultDTO getBattleResult(Long battleId, Long userId) {
        Battle battle = battleRepo.findById(battleId)
                .orElseThrow(() -> new NoSuchElementException("Battle not found"));

        if (battle.getState() != BattleState.COMPLETED) {
            throw new IllegalStateException("Battle not yet completed");
        }

        List<BattleParticipant> participants = participantRepo.findByBattleId(battleId);
        BattleParticipant me = participants.stream()
                .filter(p -> p.getUserId().equals(userId)).findFirst()
                .orElseThrow(() -> new IllegalStateException("Not in this battle"));
        BattleParticipant opp = participants.stream()
                .filter(p -> !p.getUserId().equals(userId)).findFirst()
                .orElseThrow();

        String outcome;
        if (battle.getWinnerId() == null) outcome = "DRAW";
        else if (battle.getWinnerId().equals(userId)) outcome = "WIN";
        else outcome = "LOSS";

        boolean isRanked = battle.getMode() == BattleMode.RANKED_1V1;
        int coins, xp;
        if ("DRAW".equals(outcome)) { coins = 15; xp = 25; }
        else if ("WIN".equals(outcome)) { coins = isRanked ? 60 : 30; xp = isRanked ? 75 : 40; }
        else { coins = isRanked ? 10 : 5; xp = isRanked ? 15 : 10; }

        return new BattleResultDTO(
                battleId,
                battle.getMode().name(),
            battle.getProblemCount(),
                outcome,
                battle.getWinnerId(),
                toResultStats(me),
                toResultStats(opp),
                coins, xp,
                me.getRatingBefore(),
                me.getRatingAfter() != null ? me.getRatingAfter() : me.getRatingBefore()
        );
    }

    private BattleResultDTO.ResultStats toResultStats(BattleParticipant bp) {
        String username = userRepo.findById(bp.getUserId())
                .map(User::getUsername).orElse("Unknown");
        return new BattleResultDTO.ResultStats(
                bp.getUserId(), username,
                bp.getProblemsSolved(), bp.getTotalSubmissions(),
                bp.getTotalSolveTimeMs(),
                bp.getRatingBefore(), bp.getRatingAfter()
        );
    }

    /* ═══════════════════════════════════════════════════════════
     * SCHEDULED JOB HELPERS
     * ═══════════════════════════════════════════════════════════ */

    /** Called by BattleTimerJob every 5s - complete expired active battles. */
    @Transactional
    public void checkExpiredBattles() {
        List<Battle> expired = battleRepo.findExpiredActiveBattles();
        for (Battle b : expired) {
            log.info("⏰ Battle {} timer expired, resolving...", b.getId());
            incrementMetric("battle.complete.trigger", "reason", "timer", "mode", b.getMode().name());
            completeTimedOutBattle(b.getId());
        }
    }

    /**
     * Timer-expired handling:
     * - 1v1: cancel with no winner and no result payload / no ELO movement.
     * - Group FFA: keep existing completion behavior.
     */
    @Transactional
    public void completeTimedOutBattle(Long battleId) {
        Battle battle = battleRepo.findById(battleId).orElse(null);
        if (battle == null || battle.getState() == BattleState.COMPLETED
                         || battle.getState() == BattleState.CANCELLED) return;

        if (battle.getMode() == BattleMode.GROUP_FFA) {
            completeGroupBattle(battleId);
            return;
        }

        battle.setState(BattleState.CANCELLED);
        battle.setWinnerId(null);
        battle.setCompletedAt(LocalDateTime.now());
        battleRepo.saveAndFlush(battle);

        List<BattleParticipant> participants = participantRepo.findByBattleId(battleId);
        for (BattleParticipant p : participants) {
            try {
                BattleStateDTO stateDTO = getBattleState(battleId, p.getUserId());
                broadcastSafe("/topic/battle/" + battleId + "/state/" + p.getUserId(), stateDTO);
            } catch (Exception e) {
                log.warn("Failed to broadcast timeout-cancel state to user {}: {}", p.getUserId(), e.getMessage());
            }
        }
    }

    public Map<String, Object> getBattleFeatureFlags() {
        return Map.of(
                "customTimer1v1Enabled", customTimer1v1Enabled,
                "continueAfterFirstFinisherEnabled", continueAfterFirstFinisherEnabled,
                "min1v1Duration", MIN_1V1_DURATION_MINUTES,
                "max1v1Duration", MAX_1V1_DURATION_MINUTES,
                "minGroupDuration", MIN_GROUP_DURATION_MINUTES,
                "maxGroupDuration", MAX_GROUP_DURATION_MINUTES
        );
    }

    private void incrementMetric(String name, String... tags) {
        if (meterRegistry == null) return;
        try {
            meterRegistry.counter(name, tags).increment();
        } catch (Exception ignored) {
            // Keep gameplay path resilient if metrics backend is unavailable.
        }
    }

    /** Called by QueueTimeoutJob every 30s - remove stale queue entries (>5 min). */
    @Transactional
    public void cleanupStaleQueue() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(5);
        int removed = queueRepo.deleteStaleEntries(cutoff);
        if (removed > 0) {
            log.info("🧹 Removed {} stale matchmaking queue entries", removed);
        }
    }

    /** Called by lobby timeout check - cancel 1v1 waiting battles past 60s. Group rooms have no auto-cancel. */
    @Transactional
    public void cancelExpiredLobbies() {
        List<Battle> expired = battleRepo.findExpiredLobbyBattles();
        for (Battle b : expired) {
            // Group rooms stay open until creator starts - never auto-cancel
            if (b.getMode() == BattleMode.GROUP_FFA) continue;

            b.setState(BattleState.CANCELLED);
            b.setCompletedAt(LocalDateTime.now());
            battleRepo.saveAndFlush(b);
            log.info("⏰ Battle {} lobby expired, cancelled.", b.getId());

            // ── WebSocket: notify players the lobby was cancelled ──
            List<BattleParticipant> lobbyParticipants = participantRepo.findByBattleId(b.getId());
            for (BattleParticipant p : lobbyParticipants) {
                broadcastSafe("/topic/battle/" + b.getId() + "/lobby/" + p.getUserId(),
                        Map.of("state", "CANCELLED", "battleId", b.getId()));
            }
        }
    }

    /* ═══════════════════════════════════════════════════════════
     * WEBSOCKET BROADCAST HELPERS
     * ═══════════════════════════════════════════════════════════ */

    /**
     * Broadcast battle completion/result to both participants.
     * Sends to /topic/battle/{id}/state (with COMPLETED state)
     * and /topic/battle/{id}/result for each player's personalized result.
     */
    private void broadcastBattleCompletion(Long battleId, List<BattleParticipant> participants) {
        // Broadcast per-user state + result so each player sees their own perspective
        for (BattleParticipant p : participants) {
            try {
                BattleStateDTO stateDTO = getBattleState(battleId, p.getUserId());
                broadcastSafe("/topic/battle/" + battleId + "/state/" + p.getUserId(), stateDTO);
            } catch (Exception e) {
                log.warn("Failed to broadcast state to user {}: {}", p.getUserId(), e.getMessage());
            }
            try {
                BattleResultDTO result = getBattleResult(battleId, p.getUserId());
                broadcastSafe("/topic/battle/" + battleId + "/result/" + p.getUserId(), result);
            } catch (Exception e) {
                log.warn("Failed to broadcast result to user {}: {}", p.getUserId(), e.getMessage());
            }
        }
    }

    /**
     * Send a STOMP message, swallowing any exceptions so business logic is never
     * disrupted by WebSocket failures.
     */
    private void broadcastSafe(String destination, Object payload) {
        try {
            messagingTemplate.convertAndSend(destination, payload);
        } catch (Exception e) {
            log.warn("WebSocket broadcast to {} failed: {}", destination, e.getMessage());
        }
    }

    /* ═══════════════════════════════════════════════════════════
     * ABANDON - force-complete a stuck/stale battle
     * ═══════════════════════════════════════════════════════════ */

    @Transactional
    public void abandonBattle(Long battleId, Long userId) {
        Battle battle = battleRepo.findById(battleId)
                .orElseThrow(() -> new NoSuchElementException("Battle not found"));

        if (battle.getState() == BattleState.COMPLETED || battle.getState() == BattleState.CANCELLED) {
            return; // already done
        }

        // Group FFA abandon: forfeit if not already, then return.
        // The battle keeps running for other players.
        if (battle.getMode() == BattleMode.GROUP_FFA) {
            BattleParticipant me = participantRepo.findByBattleIdAndUserId(battleId, userId).orElse(null);
            if (me != null && me.getProblemsSolved() >= battle.getProblemCount()) {
                log.info("🏟️ User {} left group battle {} after finishing all problems", userId, battleId);
                return;
            }
            if (me != null && !me.isForfeited()) {
                forfeit(battleId, userId);
            }
            log.info("🏟️ User {} abandoned group battle {}", userId, battleId);
            return;
        }

        // If WAITING (lobby) - just cancel
        if (battle.getState() == BattleState.WAITING) {
            battle.setState(BattleState.CANCELLED);
            battle.setCompletedAt(LocalDateTime.now());
            battleRepo.saveAndFlush(battle);
            log.info("⚔️ Battle {} abandoned (was WAITING) by user {}", battleId, userId);
            return;
        }

        // ACTIVE - treat as forfeit by this user
        forfeit(battleId, userId);
        log.info("⚔️ Battle {} abandoned (was ACTIVE) by user {}", battleId, userId);
    }

    /* ═══════════════════════════════════════════════════════════
     * BATTLE HISTORY
     * ═══════════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public List<BattleHistoryDTO> getBattleHistory(Long userId, int page, int size) {
        List<BattleParticipant> myParticipations = participantRepo.findByUserIdOrderByBattleIdDesc(userId);

        // Paginate manually (simple offset/limit on small result set)
        int start = page * size;
        if (start >= myParticipations.size()) return List.of();
        int end = Math.min(start + size, myParticipations.size());
        List<BattleParticipant> slice = myParticipations.subList(start, end);

        List<BattleHistoryDTO> history = new ArrayList<>();
        for (BattleParticipant me : slice) {
            Battle battle = battleRepo.findById(me.getBattleId()).orElse(null);
            if (battle == null) continue;

            // Group battles are shown in a separate endpoint
            if (battle.getMode() == BattleMode.GROUP_FFA) continue;

            // Find opponent
            List<BattleParticipant> all = participantRepo.findByBattleId(battle.getId());
            BattleParticipant opp = all.stream()
                    .filter(p -> !p.getUserId().equals(userId)).findFirst().orElse(null);
            if (opp == null) continue;

            String oppUsername = userRepo.findById(opp.getUserId())
                    .map(User::getUsername).orElse("Unknown");

            String outcome;
            if (battle.getState() == BattleState.CANCELLED) {
                outcome = "CANCELLED";
            } else if (battle.getState() != BattleState.COMPLETED) {
                outcome = "IN_PROGRESS";
            } else if (battle.getWinnerId() == null) {
                outcome = "DRAW";
            } else if (battle.getWinnerId().equals(userId)) {
                outcome = "WIN";
            } else {
                outcome = "LOSS";
            }

            int ratingChange = 0;
            if (me.getRatingAfter() != null) {
                ratingChange = me.getRatingAfter() - me.getRatingBefore();
            }

            history.add(new BattleHistoryDTO(
                    battle.getId(),
                    battle.getMode().name(),
                    battle.getState().name(),
                    outcome,
                    battle.getDifficulty().name(),
                    battle.getProblemCount(),
                    battle.getDurationMinutes(),
                    opp.getUserId(),
                    oppUsername,
                    me.getProblemsSolved(),
                    opp.getProblemsSolved(),
                    me.getTotalSubmissions(),
                    me.getTotalSolveTimeMs(),
                    me.getRatingBefore(),
                    me.getRatingAfter(),
                    ratingChange,
                    battle.getCreatedAt(),
                    battle.getCompletedAt()
            ));
        }
        return history;
    }

    /* ═══════════════════════════════════════════════════════════
     * GROUP BATTLE - ROOM MANAGEMENT
     * ═══════════════════════════════════════════════════════════ */

    @Transactional
    public RoomLobbyDTO createRoom(Long userId, CreateRoomRequest req) {
        if (hasActiveOrWaitingBattle(userId)) {
            throw new IllegalStateException("You are already in an active battle");
        }

        if (req.problemCount() < 1 || req.problemCount() > 3) {
            throw new IllegalArgumentException("problemCount must be between 1 and 3");
        }

        if (req.maxPlayers() < 3 || req.maxPlayers() > 8) {
            throw new IllegalArgumentException("Group battles require 3–8 players");
        }
        BattleMode mode;
        try {
            mode = BattleMode.valueOf(req.mode());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid mode: " + req.mode());
        }
        if (mode != BattleMode.GROUP_FFA) {
            throw new IllegalArgumentException("Only GROUP_FFA is supported for room creation");
        }
        Tag difficulty;
        try {
            difficulty = Tag.valueOf(req.difficulty());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid difficulty: " + req.difficulty());
        }

        // Generate unique 6-char room code
        String roomCode;
        do {
            roomCode = generateRoomCode();
        } while (battleRepo.findByRoomCode(roomCode).isPresent());

        Battle battle = new Battle();
        battle.setMode(mode);
        battle.setDifficulty(difficulty);
        battle.setProblemCount(req.problemCount());
        battle.setMaxPlayers(req.maxPlayers());
        battle.setDurationMinutes(normalizeGroupDurationMinutes(req.problemCount(), req.durationMinutes()));
        battle.setState(BattleState.WAITING);
        battle.setRoomCode(roomCode);
        battle.setCreatorId(userId);
        battleRepo.saveAndFlush(battle);

        // Add creator as first participant
        PlayerStats stats = gamificationService.getOrCreateStats(userId);
        createParticipant(battle.getId(), userId, stats.getBattleRating());

        log.info("🏟️ Room {} created by user {} (mode={}, diff={}, max={})",
                roomCode, userId, mode, difficulty, req.maxPlayers());
        return getRoomLobby(battle.getId());
    }

    @Transactional(readOnly = true)
    public RoomLobbyDTO getRoomByCode(String roomCode) {
        Battle battle = battleRepo.findByRoomCode(roomCode.toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Room not found: " + roomCode));
        return getRoomLobby(battle.getId());
    }

    @Transactional
    public RoomLobbyDTO joinRoom(String roomCode, Long userId) {
        Battle battle = battleRepo.findByRoomCode(roomCode.toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Room not found: " + roomCode));

        // Allow rejoin if already a participant in THIS battle
        List<BattleParticipant> participants = participantRepo.findByBattleId(battle.getId());
        boolean alreadyIn = participants.stream().anyMatch(p -> p.getUserId().equals(userId));
        if (alreadyIn) {
            return getRoomLobby(battle.getId());
        }

        // Block joining if user is in a DIFFERENT active battle
        if (hasActiveOrWaitingBattle(userId)) {
            throw new IllegalStateException("You are already in an active battle");
        }

        if (battle.getState() != BattleState.WAITING) {
            throw new IllegalStateException("Battle has already started or ended");
        }

        if (participants.size() >= battle.getMaxPlayers()) {
            throw new IllegalStateException("Room is full (" + battle.getMaxPlayers() + "/" + battle.getMaxPlayers() + ")");
        }

        PlayerStats stats = gamificationService.getOrCreateStats(userId);
        createParticipant(battle.getId(), userId, stats.getBattleRating());

        log.info("🏟️ User {} joined room {} (battle={})", userId, roomCode, battle.getId());
        RoomLobbyDTO lobby = getRoomLobby(battle.getId());
        broadcastSafe("/topic/battle/" + battle.getId() + "/room", lobby);
        return lobby;
    }

    @Transactional
    public RoomLobbyDTO leaveRoom(String roomCode, Long userId) {
        Battle battle = battleRepo.findByRoomCode(roomCode.toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Room not found: " + roomCode));

        // Idempotent close path for creator: if room is already closed, treat as no-op.
        if (userId.equals(battle.getCreatorId())
                && (battle.getState() == BattleState.CANCELLED || battle.getState() == BattleState.COMPLETED)) {
            return null;
        }

        if (battle.getState() != BattleState.WAITING) {
            throw new IllegalStateException("Cannot leave an active battle");
        }

        BattleParticipant me = participantRepo.findByBattleIdAndUserId(battle.getId(), userId).orElse(null);

        // Creator leaving should always close the room for everyone.
        if (userId.equals(battle.getCreatorId())) {
            if (me != null) {
                participantRepo.delete(me);
                participantRepo.flush();
            }
            closeRoomAsCreatorLeft(battle, roomCode);
            return null;
        }

        if (me == null) {
            throw new IllegalStateException("You are not in this room");
        }

        participantRepo.delete(me);
        participantRepo.flush();

        RoomLobbyDTO lobby = getRoomLobby(battle.getId());
        broadcastSafe("/topic/battle/" + battle.getId() + "/room", lobby);
        return lobby;
    }

    private void closeRoomAsCreatorLeft(Battle battle, String roomCode) {
        // Remove any remaining participants so nobody is considered in this waiting room anymore.
        List<BattleParticipant> remaining = participantRepo.findByBattleId(battle.getId());
        if (!remaining.isEmpty()) {
            participantRepo.deleteAll(remaining);
            participantRepo.flush();
        }

        battle.setState(BattleState.CANCELLED);
        battle.setCompletedAt(LocalDateTime.now());
        battleRepo.saveAndFlush(battle);

        broadcastSafe("/topic/battle/" + battle.getId() + "/room",
                Map.of(
                        "state", "CANCELLED",
                        "battleId", battle.getId(),
                        "message", "Room closed: creator left"
                ));

        log.info("🏟️ Room {} closed by creator {}", roomCode, battle.getCreatorId());
    }

    @Transactional
    public RoomLobbyDTO kickFromRoom(String roomCode, Long kickerId, Long targetUserId) {
        Battle battle = battleRepo.findByRoomCode(roomCode.toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Room not found: " + roomCode));

        if (!kickerId.equals(battle.getCreatorId())) {
            throw new IllegalStateException("Only the room creator can kick players");
        }
        if (battle.getState() != BattleState.WAITING) {
            throw new IllegalStateException("Cannot kick from an active battle");
        }

        BattleParticipant target = participantRepo.findByBattleIdAndUserId(battle.getId(), targetUserId)
                .orElseThrow(() -> new IllegalStateException("Target user is not in this room"));
        participantRepo.delete(target);
        participantRepo.flush();

        broadcastSafe("/topic/battle/" + battle.getId() + "/kicked/" + targetUserId,
                Map.of("kicked", true, "roomCode", roomCode));

        RoomLobbyDTO lobby = getRoomLobby(battle.getId());
        broadcastSafe("/topic/battle/" + battle.getId() + "/room", lobby);
        return lobby;
    }

    @Transactional
    public RoomLobbyDTO startGroupBattle(String roomCode, Long userId) {
        Battle battle = battleRepo.findByRoomCode(roomCode.toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Room not found: " + roomCode));

        if (!userId.equals(battle.getCreatorId())) {
            throw new IllegalStateException("Only the room creator can start the battle");
        }

        List<BattleParticipant> participants = participantRepo.findByBattleId(battle.getId());
        if (participants.size() < 3) {
            throw new IllegalStateException("Need at least 3 players to start a group battle");
        }
        if (battle.getState() != BattleState.WAITING) {
            throw new IllegalStateException("Battle has already started");
        }

        List<Long> userIds = participants.stream().map(BattleParticipant::getUserId).toList();
        selectProblems(battle.getId(), battle.getDifficulty(), battle.getProblemCount(), userIds);

        battle.setState(BattleState.ACTIVE);
        battle.setStartedAt(LocalDateTime.now());
        battleRepo.saveAndFlush(battle);

        log.info("🏟️ Group battle {} STARTED (room={}, players={})",
                battle.getId(), roomCode, participants.size());

        // Notify all players - broadcast "started" signal + initial group state
        broadcastSafe("/topic/battle/" + battle.getId() + "/started",
                Map.of("battleId", battle.getId(), "state", "ACTIVE"));
        for (BattleParticipant p : participants) {
            try {
                GroupBattleStateDTO stateDTO = getGroupBattleState(battle.getId(), p.getUserId());
                broadcastSafe("/topic/battle/" + battle.getId() + "/group-state/" + p.getUserId(), stateDTO);
            } catch (Exception e) {
                log.warn("Failed to broadcast start to user {}: {}", p.getUserId(), e.getMessage());
            }
        }

        return getRoomLobby(battle.getId());
    }

    @Transactional(readOnly = true)
    public GroupBattleStateDTO getGroupBattleState(Long battleId, Long userId) {
        Battle battle = battleRepo.findById(battleId)
                .orElseThrow(() -> new NoSuchElementException("Battle not found"));

        List<BattleParticipant> participants = participantRepo.findByBattleId(battleId);

        long timeRemainingMs = 0;
        if (battle.getState() == BattleState.ACTIVE && battle.getStartedAt() != null) {
            long elapsed = Duration.between(battle.getStartedAt(), LocalDateTime.now()).toMillis();
            long totalMs = (long) battle.getDurationMinutes() * 60_000;
            timeRemainingMs = Math.max(0, totalMs - elapsed);
        }

        // Build scoreboard: non-forfeited first, then by score desc
        List<BattleParticipant> sorted = new ArrayList<>(participants);
        sorted.sort(Comparator
            .comparing(BattleParticipant::isForfeited)
            .thenComparingInt(p -> -p.getGroupScore())
            .thenComparingInt(p -> -p.getProblemsSolved())
            .thenComparingInt(BattleParticipant::getTotalSubmissions));

        List<GroupBattleStateDTO.ScoreboardEntry> scoreboard = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            BattleParticipant p = sorted.get(i);
            String username = userRepo.findById(p.getUserId()).map(User::getUsername).orElse("Unknown");
            scoreboard.add(new GroupBattleStateDTO.ScoreboardEntry(
                    p.getUserId(), username,
                    p.getGroupScore(), p.getProblemsSolved(), p.getTotalSubmissions(),
                    i + 1,
                    p.isForfeited()
            ));
        }

        // Build problem info
        List<BattleProblem> battleProblems = battleProblemRepo.findByBattleIdOrderByProblemIndex(battleId);
        List<GroupBattleStateDTO.ProblemInfo> problemInfos = battleProblems.stream().map(bp -> {
            Problem p = problemRepo.findById(bp.getProblemId()).orElse(null);
            String resolvedJudgeId = resolveJudgeProblemId(bp.getJudgeProblemId(), p);
            boolean solved = submissionRepo.hasAcceptedSubmission(battleId, userId, bp.getProblemIndex());
            return new GroupBattleStateDTO.ProblemInfo(
                    bp.getProblemIndex(),
                    p != null ? p.getTitle() : "Unknown",
                    p != null ? p.getDescription() : "",
                "", "", resolvedJudgeId, solved
            );
        }).toList();

        return new GroupBattleStateDTO(battleId, battle.getState().name(),
                timeRemainingMs, scoreboard, problemInfos, userId);
    }

    @Transactional
    public GroupBattleResultDTO getGroupBattleResult(Long battleId, Long requestingUserId) {
        Battle battle = battleRepo.findById(battleId)
                .orElseThrow(() -> new NoSuchElementException("Battle not found"));

        if (battle.getState() != BattleState.COMPLETED) {
            throw new IllegalStateException("Battle not yet completed");
        }

        List<BattleParticipant> participants = participantRepo.findByBattleId(battleId);
        participants.sort(Comparator.comparingInt(p -> p.getPlacement() != null ? p.getPlacement() : 99));

        BattleParticipant me = participants.stream()
                .filter(p -> p.getUserId().equals(requestingUserId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Not in this battle"));

        int myPlacement = me.getPlacement() != null ? me.getPlacement() : 99;
        int[] coinsXp = rewardForGroupParticipant(me);

        List<GroupBattleResultDTO.PlacementEntry> placements = participants.stream().map(p -> {
            int place = p.getPlacement() != null ? p.getPlacement() : 99;
            int[] cxp = rewardForGroupParticipant(p);
            String username = userRepo.findById(p.getUserId()).map(User::getUsername).orElse("Unknown");
            return new GroupBattleResultDTO.PlacementEntry(
                    place, p.getUserId(), username,
                    p.getGroupScore(), p.getProblemsSolved(), p.getTotalSubmissions(),
                p.isForfeited(),
                    cxp[0], cxp[1]
            );
        }).toList();

        return new GroupBattleResultDTO(
                battleId, battle.getMode().name(),
                placements, coinsXp[0], coinsXp[1], myPlacement,
                battle.getCompletedAt()
        );
    }

    private String resolveJudgeProblemId(String currentJudgeProblemId, Problem springProblem) {
        String candidate = normalizeId(currentJudgeProblemId);
        if (candidate.isBlank()) return currentJudgeProblemId;

        List<JudgeProblemSummary> catalog = getJudgeProblemCatalog();
        if (catalog.isEmpty()) return candidate;

        if (catalogContainsId(catalog, candidate)) return candidate;

        String withoutRomanSuffix = candidate.replaceFirst("-(i|ii|iii|iv|v)$", "");
        if (!withoutRomanSuffix.isBlank() && catalogContainsId(catalog, withoutRomanSuffix)) {
            return withoutRomanSuffix;
        }

        String normalizedTitle = normalizeTitle(springProblem != null ? springProblem.getTitle() : null);
        if (!normalizedTitle.isBlank()) {
            for (JudgeProblemSummary jp : catalog) {
                if (normalizedTitle.equals(normalizeTitle(jp.title()))) {
                    return jp.id();
                }
            }
        }

        return candidate;
    }

    private boolean catalogContainsId(List<JudgeProblemSummary> catalog, String id) {
        for (JudgeProblemSummary jp : catalog) {
            if (id.equalsIgnoreCase(jp.id())) return true;
        }
        return false;
    }

    private List<JudgeProblemSummary> getJudgeProblemCatalog() {
        long now = System.currentTimeMillis();
        if (!judgeProblemCatalogCache.isEmpty() && (now - judgeProblemCatalogCachedAtMs) < JUDGE_PROBLEM_CACHE_TTL_MS) {
            return judgeProblemCatalogCache;
        }

        try {
            List<Map<String, Object>> rows = judgeProxyService.fetchProblems();
            if (rows == null || rows.isEmpty()) return judgeProblemCatalogCache;

            List<JudgeProblemSummary> parsed = new ArrayList<>();
            for (Map<String, Object> m : rows) {
                Object idObj = m.get("id");
                if (idObj == null) continue;
                String id = String.valueOf(idObj).trim();
                if (id.isBlank()) continue;
                String title = m.get("title") != null ? String.valueOf(m.get("title")) : "";
                parsed.add(new JudgeProblemSummary(id, title));
            }

            if (!parsed.isEmpty()) {
                judgeProblemCatalogCache = parsed;
                judgeProblemCatalogCachedAtMs = now;
            }
        } catch (Exception e) {
            log.debug("Could not refresh judge problem catalog: {}", e.getMessage());
        }

        return judgeProblemCatalogCache;
    }

    private String normalizeId(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private String getJudgeSubmitUrl() {
        return sanitizeJudgeBaseUrl() + "/api/submit";
    }

    private String getJudgeProblemsUrl() {
        return sanitizeJudgeBaseUrl() + "/api/problems";
    }

    private String sanitizeJudgeBaseUrl() {
        String base = judgeBaseUrl == null ? "" : judgeBaseUrl.trim();
        if (base.endsWith("/")) {
            return base.substring(0, base.length() - 1);
        }
        return base;
    }

    private String normalizeTitle(String value) {
        if (value == null) return "";
        return value.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", " ").replaceAll("\\s+", " ");
    }

    private record JudgeProblemSummary(String id, String title) {}

    @Transactional
    public void completeGroupBattle(Long battleId) {
        Battle battle = battleRepo.findById(battleId).orElse(null);
        if (battle == null || battle.getState() == BattleState.COMPLETED
                         || battle.getState() == BattleState.CANCELLED) return;

        battle.setState(BattleState.COMPLETED);
        battle.setCompletedAt(LocalDateTime.now());
        battleRepo.saveAndFlush(battle);

        List<BattleParticipant> participants = participantRepo.findByBattleId(battleId);
        if (participants.isEmpty()) {
            battle.setState(BattleState.CANCELLED);
            battleRepo.saveAndFlush(battle);
            return;
        }

        // Rank non-forfeited players first, then by score desc, tie-break by solved/submissions.
        participants.sort(Comparator
            .comparing(BattleParticipant::isForfeited)
            .thenComparingInt(p -> -p.getGroupScore())
            .thenComparingInt(p -> -p.getProblemsSolved())
                .thenComparingInt(BattleParticipant::getTotalSubmissions));

        for (int i = 0; i < participants.size(); i++) {
            participants.get(i).setPlacement(i + 1);
            participantRepo.saveAndFlush(participants.get(i));
        }

        for (BattleParticipant p : participants) {
            rewardGroupParticipant(p);
        }

        // Broadcast completion to each player
        for (BattleParticipant p : participants) {
            try {
                GroupBattleStateDTO stateDTO = getGroupBattleState(battleId, p.getUserId());
                broadcastSafe("/topic/battle/" + battleId + "/group-state/" + p.getUserId(), stateDTO);
                GroupBattleResultDTO result = getGroupBattleResult(battleId, p.getUserId());
                broadcastSafe("/topic/battle/" + battleId + "/group-result/" + p.getUserId(), result);
            } catch (Exception e) {
                log.warn("Failed to broadcast group completion to user {}: {}", p.getUserId(), e.getMessage());
            }
        }

        log.info("🏟️ Group battle {} completed.", battleId);
    }

    /* ═══════════════════════════════════════════════════════════
     * GROUP BATTLE - HELPERS
     * ═══════════════════════════════════════════════════════════ */

    private String generateRoomCode() {
        StringBuilder code = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            code.append(ROOM_CODE_CHARS.charAt(random.nextInt(ROOM_CODE_CHARS.length())));
        }
        return code.toString();
    }

    private RoomLobbyDTO getRoomLobby(Long battleId) {
        Battle battle = battleRepo.findById(battleId).orElseThrow();
        List<BattleParticipant> participants = participantRepo.findByBattleId(battleId);
        List<RoomLobbyDTO.ParticipantInfo> infos = participants.stream().map(p -> {
            String username = userRepo.findById(p.getUserId()).map(User::getUsername).orElse("Unknown");
            PlayerStats stats = gamificationService.getOrCreateStats(p.getUserId());
            return new RoomLobbyDTO.ParticipantInfo(
                    p.getUserId(), username, p.getRatingBefore(), stats.getLevel());
        }).toList();
        return new RoomLobbyDTO(
                battle.getId(), battle.getRoomCode(), battle.getMode().name(),
                battle.getDifficulty().name(), battle.getProblemCount(),
                battle.getMaxPlayers(), battle.getDurationMinutes(),
                battle.getState().name(), battle.getCreatorId(), infos);
    }

    /**
     * FFA scoring formula:
     *   base_points = { EASY: 100, MEDIUM: 250, HARD: 500 }
     *   time_bonus  = 1 + (time_remaining / total_time) × 0.5
     *   accuracy    = max(0.5, 1 − wrong_submissions × 0.1)
     *   points      = floor(base_points × time_bonus × accuracy)
     */
    private int calculateFfaPoints(Battle battle, Long battleId, Long userId,
                                    int problemIndex, long elapsedMs) {
        int basePoints = switch (battle.getDifficulty()) {
            case BASIC, EASY -> 100;
            case MEDIUM       -> 250;
            case HARD         -> 500;
        };

        long totalMs = (long) battle.getDurationMinutes() * 60_000;
        long timeRemainingMs = Math.max(0, totalMs - elapsedMs);
        double timeBonus = 1.0 + ((double) timeRemainingMs / totalMs) * 0.5;

        int wrongSubs = submissionRepo.countWrongSubmissions(battleId, userId, problemIndex);
        double accuracy = Math.max(0.5, 1.0 - wrongSubs * 0.1);

        return (int) Math.floor(basePoints * timeBonus * accuracy);
    }

    private void rewardGroupParticipant(BattleParticipant bp) {
        int placement = bp.getPlacement() != null ? bp.getPlacement() : 99;
        int[] cxp = rewardForGroupParticipant(bp);
        int coins = cxp[0];
        int xp = cxp[1];

        // Skip reward for forfeited players (they get 0/0 which would crash creditCoins)
        if (coins <= 0 && xp <= 0) {
            log.info("Group reward: user {} (rank={}, forfeited={}) → skipped (0 coins, 0 XP)",
                    bp.getUserId(), placement, bp.isForfeited());
            return;
        }

        PlayerStats stats = gamificationService.getOrCreateStats(bp.getUserId());
        stats.setXp(stats.getXp() + xp);
        stats.setLevel(GamificationService.calculateLevel(stats.getXp()));
        statsRepo.saveAndFlush(stats);

        if (coins > 0) {
            gamificationService.creditCoins(bp.getUserId(), coins, TransactionSource.BATTLE_WIN, bp.getBattleId());
        }
        gamificationService.addWeeklyBattleReward(bp.getUserId(), coins, xp);

        log.info("Group reward: user {} (rank={}, forfeited={}) → {} coins + {} XP",
                bp.getUserId(), placement, bp.isForfeited(), coins, xp);
    }

    private int[] rewardForGroupParticipant(BattleParticipant bp) {
        if (bp.isForfeited()) {
            return new int[]{0, 0};
        }
        int placement = bp.getPlacement() != null ? bp.getPlacement() : 99;
        return placementRewards(placement);
    }

    /** Returns [coins, xp] for a given placement. */
    private int[] placementRewards(int placement) {
        return switch (placement) {
            case 1  -> new int[]{80, 100};
            case 2  -> new int[]{50,  60};
            case 3  -> new int[]{30,  35};
            default -> new int[]{10,  15};
        };
    }

    public Optional<ActiveBattleDTO> checkForActiveBattle(Long userId) {
        return participantRepo.findByUserIdOrderByBattleIdDesc(userId).stream()
                .map(p -> battleRepo.findById(p.getBattleId()).orElse(null))
                .filter(Objects::nonNull)
                .filter(b -> b.getState() == BattleState.WAITING || b.getState() == BattleState.ACTIVE)
                .filter(b -> {
                    // For group battles, skip if this user has already forfeited
                    if (b.getMode() == BattleMode.GROUP_FFA) {
                        var bp = participantRepo.findByBattleIdAndUserId(b.getId(), userId);
                        if (bp.isPresent() && bp.get().isForfeited()) return false;
                    }
                    return true;
                })
                .findFirst()
                .map(b -> new ActiveBattleDTO(b.getId(), b.getState().name(),
                        b.getMode().name(), b.getRoomCode()));
    }
}
