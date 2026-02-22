package com.backend.springapp.user;

import com.backend.springapp.problem.Problem;
import com.backend.springapp.problem.ProblemRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing user progress.
 * Handles attempt tracking, solve status, and analytics.
 */
@Service
@RequiredArgsConstructor
public class UserProgressService {

    private final UserProgressRepository progressRepository;
    private final ProblemRepository problemRepository;

    /**
     * Get all progress for a user (for app startup).
     * Returns Map<problemId, status> for O(1) lookup in frontend.
     */
    public Map<Long, UserProgressResponseDTO> getAllUserProgress(Long uid) {
        List<UserProgress> progressList = progressRepository.findAllByUserId(uid);
        
        Map<Long, UserProgressResponseDTO> progressMap = new HashMap<>();
        for (UserProgress up : progressList) {
            UserProgressResponseDTO dto = new UserProgressResponseDTO(
                up.getProblem().getPid(),
                up.getStatus().name(),
                up.getAttemptCount(),
                up.getFirstAttemptedAt(),
                up.getSolvedAt()
            );
            progressMap.put(up.getProblem().getPid(), dto);
        }
        
        return progressMap;
    }

    /**
     * Mark a problem as attempted.
     * Creates new record or increments attempt count.
     */
    @Transactional
    public UserProgressResponseDTO markAsAttempted(Long uid, Long pid) {
        Problem problem = problemRepository.findById(pid)
                .orElseThrow(() -> new EntityNotFoundException("Problem not found"));

        UserProgress progress = progressRepository.findByUserIdAndProblemId(uid, pid)
                .orElse(null);

        if (progress == null) {
            // First attempt
            progress = new UserProgress();
            progress.setUser(createUserReference(uid));
            progress.setProblem(problem);
            progress.setStatus(Status.ATTEMPTED);
            progress.setAttemptCount(1);
            progress.setFirstAttemptedAt(LocalDateTime.now());
        } else if (progress.getStatus() != Status.SOLVED) {
            // Increment attempts only if not already solved
            progress.setAttemptCount(progress.getAttemptCount() + 1);
            progress.setStatus(Status.ATTEMPTED);
        }

        UserProgress saved = progressRepository.save(progress);
        return mapToDTO(saved);
    }

    /**
     * Mark a problem as solved.
     * Upgrades from ATTEMPTED to SOLVED or creates new record.
     */
    @Transactional
    public UserProgressResponseDTO markAsSolved(Long uid, Long pid) {
        Problem problem = problemRepository.findById(pid)
                .orElseThrow(() -> new EntityNotFoundException("Problem not found"));

        UserProgress progress = progressRepository.findByUserIdAndProblemId(uid, pid)
                .orElse(null);

        if (progress == null) {
            // Solved on first try
            progress = new UserProgress();
            progress.setUser(createUserReference(uid));
            progress.setProblem(problem);
            progress.setStatus(Status.SOLVED);
            progress.setAttemptCount(1);
            progress.setFirstAttemptedAt(LocalDateTime.now());
            progress.setSolvedAt(LocalDateTime.now());
        } else {
            // Update to solved
            progress.setStatus(Status.SOLVED);
            progress.setSolvedAt(LocalDateTime.now());
        }

        UserProgress saved = progressRepository.save(progress);
        return mapToDTO(saved);
    }

    /**
     * Get user statistics.
     */
    public Map<String, Long> getUserStats(Long uid) {
        long solvedCount = progressRepository.countByUserIdAndStatus(uid, Status.SOLVED);
        long attemptedCount = progressRepository.countByUserIdAndStatus(uid, Status.ATTEMPTED);
        long totalProblems = problemRepository.count();
        long notStarted = totalProblems - solvedCount - attemptedCount;

        Map<String, Long> stats = new HashMap<>();
        stats.put("solved", solvedCount);
        stats.put("attempted", attemptedCount);
        stats.put("notStarted", notStarted);
        stats.put("total", totalProblems);
        
        return stats;
    }

    /**
     * Helper to create User reference without loading full entity.
     */
    private User createUserReference(Long uid) {
        User user = new User();
        user.setUid(uid);
        return user;
    }

    /**
     * Map UserProgress to DTO.
     */
    private UserProgressResponseDTO mapToDTO(UserProgress progress) {
        return new UserProgressResponseDTO(
            progress.getProblem().getPid(),
            progress.getStatus().name(),
            progress.getAttemptCount(),
            progress.getFirstAttemptedAt(),
            progress.getSolvedAt()
        );
    }
}
