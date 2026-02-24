package com.backend.springapp;

import com.backend.springapp.sync.AttemptRequestDTO;
import com.backend.springapp.sync.SyncRequestDTO;
import com.backend.springapp.sync.SyncResponseDTO;
import com.backend.springapp.sync.SyncService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/sync")
@CrossOrigin(origins = "*") // Allows the browser extension to call this from any origin
@RequiredArgsConstructor
public class SyncController {

    private final SyncService syncService;

    /**
     * Called by the browser extension after the user clicks "Sync".
     * Body: { "lcusername": "john_doe", "leetcodeSlugs": ["two-sum", "..."] }
     * Returns a summary of how many problems were matched and newly marked solved.
     */
    @PostMapping
    public ResponseEntity<?> sync(@RequestBody SyncRequestDTO payload) {
        try {
            SyncResponseDTO result = syncService.syncProgress(
                    payload.getLcusername(),
                    payload.getLeetcodeSlugs()
            );
            return ResponseEntity.ok(result);
        } catch (EntityNotFoundException ex) {
            // lcusername not found in our DB — user hasn't set their LC username in their profile
            return ResponseEntity.status(404).body(ex.getMessage());
        }
    }

    /**
     * Called by the browser extension for every non-accepted submission attempt.
     * Body: { "lcusername": "john_doe", "lcslug": "two-sum" }
     * Upserts an ATTEMPTED status for the problem (no-op if already SOLVED).
     */
    @PostMapping("/attempt")
    public ResponseEntity<?> markAttempted(@RequestBody AttemptRequestDTO payload) {
        try {
            boolean recorded = syncService.markAttempted(payload.getLcusername(), payload.getLcslug());
            return ResponseEntity.ok(Map.of("recorded", recorded, "slug", payload.getLcslug()));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        }
    }
}
