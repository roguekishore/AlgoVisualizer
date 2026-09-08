package com.backend.springapp.judge;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Proxy controller — browser calls /api/judge/*, Spring validates the JWT,
 * then forwards to the Lambda executor or catalog service.
 *
 * GET  /api/judge/problems        — public (no JWT required)
 * GET  /api/judge/problems/{id}   — public
 * POST /api/judge/run             — protected
 * POST /api/judge/trace           — protected
 * POST /api/judge/submit          — protected
 */
@RestController
@RequestMapping("/api/judge")
@RequiredArgsConstructor
public class JudgeController {

    private final JudgeProxyService proxy;

    @GetMapping("/problems")
    public ResponseEntity<List<Map<String, Object>>> getProblems() {
        return ResponseEntity.ok(proxy.fetchProblems());
    }

    @GetMapping("/problems/{id}")
    public ResponseEntity<Map<String, Object>> getProblem(@PathVariable String id) {
        Map<String, Object> problem = proxy.fetchProblem(id);
        if (problem.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(problem);
    }

    @PostMapping("/run")
    public ResponseEntity<Map<String, Object>> run(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(proxy.run(body.get("language"), body.get("code"), body.get("input")));
    }

    @PostMapping("/trace")
    public ResponseEntity<Map<String, Object>> trace(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(proxy.trace(body.get("language"), body.get("code"), body.get("input")));
    }

    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submit(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(proxy.submit(body.get("problemId"), body.get("language"), body.get("code")));
    }
}
