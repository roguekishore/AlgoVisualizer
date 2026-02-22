package com.backend.springapp.leaderboard;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for leaderboard endpoints.
 *
 * GET /api/leaderboard/global                      → paginated global ranking
 * GET /api/leaderboard/institution/{institutionId} → paginated institution ranking
 * GET /api/leaderboard/rank?userId={uid}           → personal rank snapshot
 */
@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    /**
     * Global leaderboard across all users.
     *
     * Query params (Spring Pageable): page, size, sort (ignored — ordering is fixed by score).
     * Default: page=0, size=20.
     *
     * Example: GET /api/leaderboard/global?page=0&size=50
     */
    @GetMapping("/global")
    public ResponseEntity<Page<LeaderboardEntryDTO>> getGlobalLeaderboard(Pageable pageable) {
        return ResponseEntity.ok(leaderboardService.getGlobalLeaderboard(pageable));
    }

    /**
     * Institutional leaderboard — only users belonging to the given institution.
     *
     * Example: GET /api/leaderboard/institution/3?page=0&size=20
     */
    @GetMapping("/institution/{institutionId}")
    public ResponseEntity<Page<LeaderboardEntryDTO>> getInstitutionLeaderboard(
            @PathVariable Long institutionId,
            Pageable pageable) {
        try {
            return ResponseEntity.ok(leaderboardService.getInstitutionLeaderboard(institutionId, pageable));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Personal rank snapshot for a specific user.
     * Returns both global and institutional rank (institutional is null when user has no institution).
     *
     * Example: GET /api/leaderboard/rank?userId=1
     */
    @GetMapping("/rank")
    public ResponseEntity<UserRankDTO> getUserRank(@RequestParam Long userId) {
        return ResponseEntity.ok(leaderboardService.getUserRank(userId));
    }
}
