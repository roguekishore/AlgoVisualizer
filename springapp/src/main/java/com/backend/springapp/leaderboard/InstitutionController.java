package com.backend.springapp.leaderboard;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for institution lookup / autocomplete.
 *
 * GET /api/institutions/search?q=anna&limit=10  → autocomplete suggestions
 * GET /api/institutions/{id}                    → single institution by id
 */
@RestController
@RequestMapping("/api/institutions")
@RequiredArgsConstructor
public class InstitutionController {

    private final InstitutionRepository institutionRepository;

    /**
     * Autocomplete search – returns lightweight DTOs.
     * Searches both the display name and normalizedName fields.
     * Capped at {@code limit} results (default 10, max 50).
     */
    @GetMapping("/search")
    public ResponseEntity<List<InstitutionSummaryDTO>> search(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "10") int limit) {

        limit = Math.min(limit, 50);

        List<Institution> institutions = q.isBlank()
                ? institutionRepository.findAll(PageRequest.of(0, limit)).getContent()
                : institutionRepository
                        .findByNameContainingIgnoreCaseOrNormalizedNameContainingIgnoreCase(q, q)
                        .stream()
                        .limit(limit)
                        .toList();

        List<InstitutionSummaryDTO> results = institutions.stream()
                .map(i -> new InstitutionSummaryDTO(i.getId(), i.getName(), i.getUniversity(),
                        i.getState(), i.getDistrict()))
                .toList();

        return ResponseEntity.ok(results);
    }

    /** Fetch a single institution by id. */
    @GetMapping("/{id}")
    public ResponseEntity<InstitutionSummaryDTO> getById(@PathVariable Long id) {
        return institutionRepository.findById(id)
                .map(i -> ResponseEntity.ok(
                        new InstitutionSummaryDTO(i.getId(), i.getName(), i.getUniversity(),
                                i.getState(), i.getDistrict())))
                .orElse(ResponseEntity.notFound().build());
    }
}
