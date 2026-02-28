package com.backend.springapp.sync;

import com.backend.springapp.problem.Problem;
import com.backend.springapp.problem.ProblemRepository;
import com.backend.springapp.sse.ProgressEvent;
import com.backend.springapp.sse.ProgressEventService;
import com.backend.springapp.user.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Handles the LeetCode → backend progress sync flow:
 *  1. Resolve lcusername → User
 *  2. For each slug, resolve lcslug → Problem
 *  3. Upsert UserProgress to SOLVED (idempotent — skips already-solved)
 *  4. Increment the user's rating for each newly solved problem
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SyncService {

    private final UserRepository userRepository;
    private final UserProgressRepository progressRepository;
    private final ProblemRepository problemRepository;
    private final ProgressEventService progressEventService;

    @Transactional
    public SyncResponseDTO syncProgress(String lcusername, List<String> slugs) {

        // ── 1. Resolve user ──────────────────────────────────────────────────
        User user = userRepository.findByLcusername(lcusername)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No user with lcusername '" + lcusername + "'. " +
                        "Make sure your LeetCode username is saved in your profile."));

        int matched = 0;
        int updated = 0;
        List<String> notFound = new ArrayList<>();

        // ── 2. Process each slug ─────────────────────────────────────────────
        for (String slug : slugs) {

            Optional<Problem> problemOpt = problemRepository.findByLcslug(slug);

            if (problemOpt.isEmpty()) {
                // Slug exists on LC but not in our problem set — skip silently
                notFound.add(slug);
                continue;
            }

            matched++;
            Problem problem = problemOpt.get();
            Long uid = user.getUid();
            Long pid = problem.getPid();

            Optional<UserProgress> existingOpt = progressRepository.findByUserIdAndProblemId(uid, pid);

            // ── 3. Skip if already solved (idempotent) ───────────────────────
            if (existingOpt.isPresent() && existingOpt.get().getStatus() == Status.SOLVED) {
                continue;
            }

            // ── 4. Upsert to SOLVED ──────────────────────────────────────────
            UserProgress progress = existingOpt.orElseGet(() -> {
                UserProgress up = new UserProgress();
                up.setUser(user);
                up.setProblem(problem);
                up.setAttemptCount(1);
                up.setFirstAttemptedAt(LocalDateTime.now());
                return up;
            });

            progress.setStatus(Status.SOLVED);
            progress.setSolvedAt(LocalDateTime.now());
            progressRepository.save(progress);

            // ── 5. Award rating points ───────────────────────────────────────
            int points = switch (problem.getTag()) {
                case HARD   -> 3;
                case MEDIUM -> 2;
                default     -> 1; // EASY, BASIC
            };
            userRepository.addRating(uid, points);

            // Push live update to any open React tabs
            progressEventService.publish(uid, new ProgressEvent(
                    pid, "SOLVED", slug,
                    progress.getAttemptCount() != null ? progress.getAttemptCount() : 1));

            updated++;
            log.info("Synced: user={} problem={} ({})", lcusername, slug, problem.getTag());
        }

        log.info("Sync complete for {}: matched={}, updated={}, notFound={}", lcusername, matched, updated, notFound.size());
        return new SyncResponseDTO(matched, updated, notFound);
    }

    /**
     * Records a single ATTEMPTED status for a problem identified by its LeetCode slug.
     * Idempotent — skips if the problem is already marked SOLVED (no downgrade).
     * Called by the browser extension for every non-accepted submission.
     *
     * @return true if a new record was created or an existing one was incremented,
     *         false if the slug wasn't in our problem set or was already SOLVED.
     */
    @Transactional
    public boolean markAttempted(String lcusername, String lcslug) {

        User user = userRepository.findByLcusername(lcusername)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No user with lcusername '" + lcusername + "'. " +
                        "Make sure your LeetCode username is saved in your profile."));

        Optional<Problem> problemOpt = problemRepository.findByLcslug(lcslug);
        if (problemOpt.isEmpty()) {
            log.debug("Attempt ignored — slug '{}' not in problem set", lcslug);
            return false;
        }

        Problem problem = problemOpt.get();
        Long uid = user.getUid();
        Long pid = problem.getPid();

        Optional<UserProgress> existingOpt = progressRepository.findByUserIdAndProblemId(uid, pid);

        // Never downgrade a SOLVED problem to ATTEMPTED
        if (existingOpt.isPresent() && existingOpt.get().getStatus() == Status.SOLVED) {
            log.debug("Attempt ignored — problem {} already SOLVED for user {}", lcslug, lcusername);
            return false;
        }

        UserProgress progress;
        if (existingOpt.isPresent()) {
            // Existing ATTEMPTED record — increment the counter
            progress = existingOpt.get();
        } else {
            // First attempt — create a new record
            progress = new UserProgress();
            progress.setUser(user);
            progress.setProblem(problem);
            progress.setAttemptCount(0);       // explicit; field initialiser may not run on proxy
            progress.setFirstAttemptedAt(LocalDateTime.now());
        }

        progress.setStatus(Status.ATTEMPTED);
        // Null-safe increment — guards against legacy rows with a NULL attempt_count
        int prev = (progress.getAttemptCount() != null) ? progress.getAttemptCount() : 0;
        progress.setAttemptCount(prev + 1);

        progressRepository.save(progress);

        // Push live update to any open React tabs
        progressEventService.publish(uid, new ProgressEvent(
                pid, "ATTEMPTED", lcslug, progress.getAttemptCount()));

        log.info("Attempt recorded: user={} slug={} attempts={}", lcusername, lcslug, progress.getAttemptCount());
        return true;
    }
}
