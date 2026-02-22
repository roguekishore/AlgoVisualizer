package com.backend.springapp.problem;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for retrieving stages.
 */
@RestController
@RequestMapping("/api/stages")
@RequiredArgsConstructor
public class StageController {

    private final StageRepository stageRepository;

    /**
     * Get all stage names, sorted alphabetically.
     * Example: GET /api/stages → ["Absolute Programming Basics", "Array Index Manipulation", ...]
     */
    @GetMapping
    public ResponseEntity<List<String>> getAllStages() {
        List<String> stages = stageRepository.findAll()
                .stream()
                .map(Stage::getName)
                .sorted()
                .toList();
        return ResponseEntity.ok(stages);
    }
}
