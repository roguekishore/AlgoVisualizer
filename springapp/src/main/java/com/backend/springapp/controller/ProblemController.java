package com.backend.springapp.controller;

import com.backend.springapp.dto.ProblemRequestDTO;
import com.backend.springapp.dto.ProblemResponseDTO;
import com.backend.springapp.service.ProblemService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for Problem CRUD operations and filtering.
 */
@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;

    /**
     * Get paginated problems with optional filters.
     * Guest: userId omitted → userStatus is null in response.
     * Logged-in: userId provided → userStatus is NOT_STARTED/ATTEMPTED/SOLVED.
     */
    @GetMapping
    public ResponseEntity<Page<ProblemResponseDTO>> getProblems(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        try {
            Page<ProblemResponseDTO> problems = problemService.getProblems(userId, topic, tag, status, pageable);
            return ResponseEntity.ok(problems);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get a single problem by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProblemResponseDTO> getProblemById(@PathVariable Long id) {
        try {
            ProblemResponseDTO problem = problemService.getProblemById(id);
            return ResponseEntity.ok(problem);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Create a new problem.
     */
    @PostMapping
    public ResponseEntity<ProblemResponseDTO> createProblem(@Valid @RequestBody ProblemRequestDTO dto) {
        try {
            ProblemResponseDTO created = problemService.createProblem(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            // Invalid enum value
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update an existing problem.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProblemResponseDTO> updateProblem(
            @PathVariable Long id,
            @Valid @RequestBody ProblemRequestDTO dto) {
        try {
            ProblemResponseDTO updated = problemService.updateProblem(id, dto);
            return ResponseEntity.ok(updated);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            // Invalid enum value
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete a problem by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProblem(@PathVariable Long id) {
        try {
            problemService.deleteProblem(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Search problems by title keyword.
     * Example: GET /api/problems/search?keyword=two
     */
    @GetMapping("/search")
    public ResponseEntity<Page<ProblemResponseDTO>> searchProblems(
            @RequestParam String keyword,
            Pageable pageable) {
        Page<ProblemResponseDTO> problems = problemService.searchProblems(keyword, pageable);
        return ResponseEntity.ok(problems);
    }
}
