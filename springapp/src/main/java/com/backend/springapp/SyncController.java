package com.backend.springapp;

import com.backend.springapp.sync.SyncRequestDTO;
import com.backend.springapp.sync.SyncResponseDTO;
import com.backend.springapp.sync.SyncService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
