package com.backend.springapp.user;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for user progress tracking.
 */
@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class UserProgressController {

    private final UserProgressService progressService;

    /**
     * Get all user progress (for app startup).
     * Returns Map<problemId, status> for localStorage.
     */
    @GetMapping
    public ResponseEntity<Map<Long, UserProgressResponseDTO>> getAllProgress(
            @RequestParam Long userId) {
        Map<Long, UserProgressResponseDTO> progress = progressService.getAllUserProgress(userId);
        return ResponseEntity.ok(progress);
    }

    /**
     * Mark a problem as attempted.
     */
    @PostMapping("/{pid}/attempt")
    public ResponseEntity<UserProgressResponseDTO> markAsAttempted(
            @PathVariable Long pid,
            @RequestParam Long userId) {
        try {
            UserProgressResponseDTO response = progressService.markAsAttempted(userId, pid);
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Mark a problem as solved.
     */
    @PostMapping("/{pid}/solve")
    public ResponseEntity<UserProgressResponseDTO> markAsSolved(
            @PathVariable Long pid,
            @RequestParam Long userId) {
        try {
            UserProgressResponseDTO response = progressService.markAsSolved(userId, pid);
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get user statistics.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getUserStats(@RequestParam Long userId) {
        Map<String, Long> stats = progressService.getUserStats(userId);
        return ResponseEntity.ok(stats);
    }
}
