package com.backend.springapp.sync;

import com.backend.springapp.problem.Problem;
import com.backend.springapp.problem.ProblemRepository;
import com.backend.springapp.user.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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

            updated++;
            log.info("Synced: user={} problem={} ({})", lcusername, slug, problem.getTag());
        }

        log.info("Sync complete for {}: matched={}, updated={}, notFound={}", lcusername, matched, updated, notFound.size());
        return new SyncResponseDTO(matched, updated, notFound);
    }
}
