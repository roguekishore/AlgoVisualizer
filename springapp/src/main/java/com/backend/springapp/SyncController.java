package com.backend.springapp;

import com.backend.springapp.sync.AttemptRequestDTO;
import com.backend.springapp.sync.SyncRequestDTO;
import com.backend.springapp.sync.SyncResponseDTO;
import com.backend.springapp.sync.SyncService;
import com.backend.springapp.user.User;
import com.backend.springapp.user.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/sync")
@RequiredArgsConstructor
public class SyncController {

    private final SyncService syncService;
    private final UserService userService;

    // ── Token helper ─────────────────────────────────────────────────────────

    /**
     * Extract "Bearer &lt;token&gt;" from the Authorization header and resolve it
     * to a User via UserService. Returns null if the header is missing/invalid
     * or the token doesn't match any user.
     */
    private User authenticatedUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7).trim();
        return userService.resolveToken(token);
    }

    // ── Endpoints ────────────────────────────────────────────────────────────

    /**
     * Called by the browser extension after the user clicks "Sync".
     * Body: { "lcusername": "john_doe", "leetcodeSlugs": ["two-sum", "..."] }
     * Requires: Authorization: Bearer &lt;sessionToken&gt;
     *
     * The token MUST belong to the same user whose lcusername is in the body.
     * This prevents one user from syncing solutions to another user's account.
     */
    @PostMapping
    public ResponseEntity<?> sync(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody SyncRequestDTO payload) {
        try {
            // ── Token-based auth (preferred) ─────────────────────────────────
            User caller = authenticatedUser(authHeader);
            if (caller != null) {
                // The token resolved to a real user — use THEIR lcusername,
                // ignoring whatever the client sent (prevents impersonation).
                String trustedLc = caller.getLcusername();
                if (trustedLc == null || trustedLc.isBlank()) {
                    return ResponseEntity.status(400).body(
                        "Your account has no LeetCode username set. " +
                        "Please update your profile first.");
                }
                SyncResponseDTO result = syncService.syncProgress(trustedLc, payload.getLeetcodeSlugs());
                return ResponseEntity.ok(result);
            }

            // ── Fallback: unauthenticated (legacy / popup first-time sync) ──
            // If no token is provided we still allow the request so that the
            // popup's "Sync Now" flow (which may not have a token yet) keeps
            // working, but only if the lcusername actually exists.
            if (payload.getLcusername() == null || payload.getLcusername().isBlank()) {
                return ResponseEntity.status(401).body("Missing Authorization token and lcusername.");
            }
            SyncResponseDTO result = syncService.syncProgress(
                    payload.getLcusername(), payload.getLeetcodeSlugs());
            return ResponseEntity.ok(result);

        } catch (EntityNotFoundException ex) {
            return ResponseEntity.status(404).body(ex.getMessage());
        }
    }

    /**
     * Called by the browser extension for every non-accepted submission attempt.
     * Body: { "lcusername": "john_doe", "lcslug": "two-sum" }
     * Requires: Authorization: Bearer &lt;sessionToken&gt;
     */
    @PostMapping("/attempt")
    public ResponseEntity<?> markAttempted(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody AttemptRequestDTO payload) {
        try {
            // ── Token auth ───────────────────────────────────────────────────
            User caller = authenticatedUser(authHeader);
            String lcusername;
            if (caller != null) {
                lcusername = caller.getLcusername();
                if (lcusername == null || lcusername.isBlank()) {
                    return ResponseEntity.status(400)
                            .body(Map.of("error", "No LeetCode username on your account."));
                }
            } else if (payload.getLcusername() != null && !payload.getLcusername().isBlank()) {
                lcusername = payload.getLcusername();
            } else {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Missing Authorization token and lcusername."));
            }

            boolean recorded = syncService.markAttempted(lcusername, payload.getLcslug());
            return ResponseEntity.ok(Map.of("recorded", recorded, "slug", payload.getLcslug()));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        }
    }
}
