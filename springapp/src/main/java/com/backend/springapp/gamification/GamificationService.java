package com.backend.springapp.gamification;

import com.backend.springapp.problem.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Core gamification logic — coins, XP, levels.
 * Phases 1+ will extend this with streak / store / battle methods.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GamificationService {

    private final PlayerStatsRepository statsRepository;
    private final CoinTransactionRepository txRepository;

    /* ═══════════════════════════════════════════════════════════
     * COIN REWARD TABLE
     * ═══════════════════════════════════════════════════════════ */
    private static int baseCoins(Tag tag) {
        return switch (tag) {
            case BASIC  -> 3;
            case EASY   -> 5;
            case MEDIUM -> 15;
            case HARD   -> 30;
        };
    }

    private static int baseXp(Tag tag) {
        return switch (tag) {
            case BASIC  -> 5;
            case EASY   -> 10;
            case MEDIUM -> 25;
            case HARD   -> 50;
        };
    }

    /* ═══════════════════════════════════════════════════════════
     * LEVEL BRACKETS
     * ═══════════════════════════════════════════════════════════ */

    /** Level bracket thresholds — index = level, value = minimum XP for that level. */
    private static final int[][] LEVEL_BRACKETS = {
        // { minXP, maxXP }  — "maxXP" is used only for display
        {     0,   500 },  // Levels 1-10    Initiate
        {   501,  2500 },  // Levels 11-25   Apprentice
        {  2501,  8000 },  // Levels 26-50   Challenger
        {  8001, 20000 },  // Levels 51-75   Veteran
        { 20001, 50000 },  // Levels 76-100  Elite
        { 50001, Integer.MAX_VALUE },  // 100+ Legend
    };

    private static final String[] TITLES = {
        "Initiate", "Apprentice", "Challenger", "Veteran", "Elite", "Legend"
    };

    private static final int[] LEVEL_RANGES = { 10, 25, 50, 75, 100, 200 };

    public static int calculateLevel(int xp) {
        if (xp <= 0) return 1;
        int cumulativeLevel = 0;
        for (int i = 0; i < LEVEL_BRACKETS.length; i++) {
            int bracketMin = LEVEL_BRACKETS[i][0];
            int bracketMax = LEVEL_BRACKETS[i][1];
            int levelsInBracket = (i == 0) ? LEVEL_RANGES[i] : LEVEL_RANGES[i] - LEVEL_RANGES[i - 1];
            if (xp < bracketMin) break;
            int xpInBracket = Math.min(xp, bracketMax) - bracketMin;
            int bracketXpRange = bracketMax - bracketMin;
            int levelsEarned = (int) ((long) xpInBracket * levelsInBracket / bracketXpRange);
            cumulativeLevel += levelsEarned;
            if (xp <= bracketMax) break;
        }
        return Math.max(1, cumulativeLevel + 1);
    }

    public static String getTitle(int level) {
        if (level <= 10) return TITLES[0];
        if (level <= 25) return TITLES[1];
        if (level <= 50) return TITLES[2];
        if (level <= 75) return TITLES[3];
        if (level <= 100) return TITLES[4];
        return TITLES[5];
    }

    /** XP threshold at the start of the player's current level. */
    public static int xpFloorForLevel(int level) {
        if (level <= 1) return 0;
        // Reverse-calculate: walk through brackets
        int remaining = level - 1;
        int xp = 0;
        int prevMaxLevel = 0;
        for (int i = 0; i < LEVEL_BRACKETS.length; i++) {
            int bracketMin = LEVEL_BRACKETS[i][0];
            int bracketMax = LEVEL_BRACKETS[i][1];
            int levelsInBracket = LEVEL_RANGES[i] - prevMaxLevel;
            if (remaining <= 0) break;
            int used = Math.min(remaining, levelsInBracket);
            int bracketXpRange = bracketMax - bracketMin;
            xp = bracketMin + (int) ((long) used * bracketXpRange / levelsInBracket);
            remaining -= used;
            prevMaxLevel = LEVEL_RANGES[i];
        }
        return xp;
    }

    /** XP threshold for the next level. */
    public static int xpCeilingForLevel(int level) {
        return xpFloorForLevel(level + 1);
    }

    /* ═══════════════════════════════════════════════════════════
     * MAIN REWARD METHOD
     * ═══════════════════════════════════════════════════════════ */

    /**
     * Called after a problem is marked as solved (first time only).
     *
     * @param userId        the user who solved the problem
     * @param problemId     the solved problem's PK
     * @param tag           difficulty of the problem
     * @param isFirstAttempt whether the user solved it on their first try
     * @return summary of the reward
     */
    @Transactional
    public RewardSummaryDTO rewardProblemSolve(Long userId, Long problemId, Tag tag, boolean isFirstAttempt) {
        PlayerStats stats = getOrCreateStats(userId);

        int coins = baseCoins(tag);
        int xp = baseXp(tag);

        // Accuracy bonus: +20% coins if solved on first attempt
        boolean accuracyBonus = isFirstAttempt;
        if (accuracyBonus) {
            coins = (int) Math.ceil(coins * 1.2);
        }

        // Credit coins + log transaction
        // MUST use saveAndFlush — a downstream @Modifying(clearAutomatically=true)
        // query (e.g. addRating) can evict unflushed dirty entities from the
        // persistence context, silently losing accumulated coins/XP.
        stats.setCoins(stats.getCoins() + coins);
        stats.setXp(stats.getXp() + xp);
        stats.setLevel(calculateLevel(stats.getXp()));
        statsRepository.saveAndFlush(stats);

        CoinTransaction tx = new CoinTransaction();
        tx.setUserId(userId);
        tx.setAmount(coins);
        tx.setSource(TransactionSource.PROBLEM_SOLVED);
        tx.setBalanceAfter(stats.getCoins());
        tx.setReferenceId(problemId);
        txRepository.saveAndFlush(tx);

        log.info("Rewarded user {} with {} coins + {} XP for problem {} (tag={}, firstAttempt={})",
                userId, coins, xp, problemId, tag, isFirstAttempt);

        return new RewardSummaryDTO(
            coins, xp,
            stats.getCoins(), stats.getXp(),
            stats.getLevel(), getTitle(stats.getLevel()),
            accuracyBonus, false
        );
    }

    /* ═══════════════════════════════════════════════════════════
     * QUERIES
     * ═══════════════════════════════════════════════════════════ */

    /** Get-or-create stats for a user (auto-provisions on first access). */
    @Transactional
    public PlayerStats getOrCreateStats(Long userId) {
        return statsRepository.findByUserId(userId).orElseGet(() -> {
            PlayerStats fresh = new PlayerStats();
            fresh.setUserId(userId);
            return statsRepository.saveAndFlush(fresh);
        });
    }

    /** Build a full DTO for the player's stats. */
    public PlayerStatsDTO getPlayerStatsDTO(Long userId) {
        PlayerStats s = getOrCreateStats(userId);
        int level = calculateLevel(s.getXp());
        return new PlayerStatsDTO(
            s.getUserId(),
            s.getCoins(),
            s.getXp(),
            level,
            getTitle(level),
            xpFloorForLevel(level),
            xpCeilingForLevel(level),
            s.getCurrentStreak(),
            s.getLongestStreak(),
            s.getBattleRating()
        );
    }

    /** Paginated coin history. */
    public Page<CoinHistoryDTO> getCoinHistory(Long userId, Pageable pageable) {
        return txRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(tx -> new CoinHistoryDTO(
                    tx.getId(),
                    tx.getAmount(),
                    tx.getSource().name(),
                    tx.getBalanceAfter(),
                    tx.getReferenceId(),
                    tx.getCreatedAt()
                ));
    }

    /* ═══════════════════════════════════════════════════════════
     * COIN OPERATIONS (for Store in Phase 2)
     * ═══════════════════════════════════════════════════════════ */

    @Transactional
    public void creditCoins(Long userId, int amount, TransactionSource source, Long referenceId) {
        if (amount <= 0) throw new IllegalArgumentException("Credit amount must be positive");
        PlayerStats stats = getOrCreateStats(userId);
        stats.setCoins(stats.getCoins() + amount);
        statsRepository.saveAndFlush(stats);

        CoinTransaction tx = new CoinTransaction();
        tx.setUserId(userId);
        tx.setAmount(amount);
        tx.setSource(source);
        tx.setBalanceAfter(stats.getCoins());
        tx.setReferenceId(referenceId);
        txRepository.saveAndFlush(tx);
    }

    @Transactional
    public void debitCoins(Long userId, int amount, TransactionSource source, Long referenceId) {
        if (amount <= 0) throw new IllegalArgumentException("Debit amount must be positive");
        PlayerStats stats = getOrCreateStats(userId);
        if (stats.getCoins() < amount) {
            throw new InsufficientCoinsException(
                "Insufficient coins: have " + stats.getCoins() + ", need " + amount);
        }
        stats.setCoins(stats.getCoins() - amount);
        statsRepository.saveAndFlush(stats);

        CoinTransaction tx = new CoinTransaction();
        tx.setUserId(userId);
        tx.setAmount(-amount);
        tx.setSource(source);
        tx.setBalanceAfter(stats.getCoins());
        tx.setReferenceId(referenceId);
        txRepository.saveAndFlush(tx);
    }
}
