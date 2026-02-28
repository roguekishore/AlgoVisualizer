package com.backend.springapp.gamification;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST API for gamification stats and coin history.
 *
 * Since there is no Spring Security yet, the "me" endpoints accept
 * userId as a query param. Once auth is added (pre-req P0-#3),
 * these will derive userId from the authenticated principal.
 */
@RestController
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;

    /**
     * Current player's full stats.
     * GET /api/me/stats?userId=1
     */
    @GetMapping("/api/me/stats")
    public ResponseEntity<PlayerStatsDTO> myStats(@RequestParam Long userId) {
        return ResponseEntity.ok(gamificationService.getPlayerStatsDTO(userId));
    }

    /**
     * Paginated coin transaction history.
     * GET /api/me/coin-history?userId=1&page=0&size=20
     */
    @GetMapping("/api/me/coin-history")
    public ResponseEntity<Page<CoinHistoryDTO>> myCoinHistory(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        return ResponseEntity.ok(gamificationService.getCoinHistory(userId, pageable));
    }

    /**
     * Public stats for any player (leaderboard cards, etc.).
     * GET /api/users/{id}/stats
     */
    @GetMapping("/api/users/{id}/stats")
    public ResponseEntity<PlayerStatsDTO> publicStats(@PathVariable("id") Long userId) {
        return ResponseEntity.ok(gamificationService.getPlayerStatsDTO(userId));
    }

    /**
     * Handle InsufficientCoinsException (for Store in Phase 2).
     */
    @ExceptionHandler(InsufficientCoinsException.class)
    public ResponseEntity<Map<String, String>> handleInsufficientCoins(InsufficientCoinsException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }
}
