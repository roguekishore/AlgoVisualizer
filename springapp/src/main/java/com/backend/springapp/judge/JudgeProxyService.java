package com.backend.springapp.judge;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Single point of contact for all outbound judge/catalog calls.
 * - Catalog (problems list, problem detail, test cases)
 * - Lambda executor (run, trace, submit)
 *
 * BattleService and JudgeController both delegate here.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class JudgeProxyService {

    private final RestTemplate judgeRestTemplate;

    @Value("${judge.base-url:http://localhost:9000}")
    private String judgeBaseUrl;

    @Value("${judge.token:}")
    private String judgeToken;

    @Value("${catalog.base-url:http://localhost:3001}")
    private String catalogBaseUrl;

    // ─── Catalog ──────────────────────────────────────────────────────────

    public List<Map<String, Object>> fetchProblems() {
        ResponseEntity<List<Map<String, Object>>> res = judgeRestTemplate.exchange(
                catalog("/api/problems"), HttpMethod.GET, HttpEntity.EMPTY,
                new ParameterizedTypeReference<>() {});
        return res.getBody() != null ? res.getBody() : List.of();
    }

    public Map<String, Object> fetchProblem(String id) {
        ResponseEntity<Map<String, Object>> res = judgeRestTemplate.exchange(
                catalog("/api/problems/" + id), HttpMethod.GET, HttpEntity.EMPTY,
                new ParameterizedTypeReference<>() {});
        return res.getBody() != null ? res.getBody() : Map.of();
    }

    // ─── Lambda executor ──────────────────────────────────────────────────

    public Map<String, Object> run(String language, String code, String input) {
        Map<String, String> body = Map.of("language", language, "code", code,
                "input", input != null ? input : "");
        return postToJudge("/api/run", body);
    }

    public Map<String, Object> trace(String language, String code, String input) {
        Map<String, String> body = Map.of("language", language, "code", code,
                "input", input != null ? input : "");
        return postToJudge("/api/trace", body);
    }

    /**
     * Fetches test cases from the catalog, then submits to the Lambda executor.
     * This is the correct path for both the JudgeController and BattleService.
     */
    public Map<String, Object> submit(String problemId, String language, String code) {
        Object testCases = fetchTestCases(problemId);
        if (!(testCases instanceof List<?> cases) || cases.isEmpty()) {
            log.error("Problem {} returned no test cases from the catalog", problemId);
            return Map.of("error", "Problem not found or has no test cases");
        }
        Map<String, Object> body = Map.of("language", language, "code", code, "testCases", cases);
        return postToJudge("/api/submit", body);
    }

    /**
     * Fetches the full hidden test cases from the catalog's token-guarded
     * internal route. The public {@code /api/problems/{id}} deliberately strips
     * them (only {@code sampleTestCases} survives), and the executor carries no
     * catalog of its own, so this is the only source of real grading data.
     */
    private Object fetchTestCases(String problemId) {
        HttpHeaders headers = new HttpHeaders();
        if (judgeToken != null && !judgeToken.isBlank()) {
            headers.set("x-judge-token", judgeToken);
        }
        try {
            ResponseEntity<Map<String, Object>> res = judgeRestTemplate.exchange(
                    catalog("/api/internal/problems/" + problemId), HttpMethod.GET,
                    new HttpEntity<>(headers), new ParameterizedTypeReference<>() {});
            Map<String, Object> body = res.getBody();
            return body != null ? body.get("testCases") : null;
        } catch (RestClientResponseException e) {
            // 403 here almost always means JUDGE_TOKEN is missing or mismatched
            // on the catalog container.
            log.error("Catalog internal route rejected the test-case fetch for {}: {}",
                    problemId, e.getStatusCode());
            return null;
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Map<String, Object> postToJudge(String path, Object body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (judgeToken != null && !judgeToken.isBlank()) {
            headers.set("x-judge-token", judgeToken);
        }
        ResponseEntity<Map<String, Object>> res = judgeRestTemplate.exchange(
                judge(path), HttpMethod.POST, new HttpEntity<>(body, headers),
                new ParameterizedTypeReference<>() {});
        return res.getBody() != null ? res.getBody() : Map.of();
    }

    private String judge(String path) {
        String base = judgeBaseUrl == null ? "" : judgeBaseUrl.trim();
        if (base.endsWith("/")) base = base.substring(0, base.length() - 1);
        return base + path;
    }

    private String catalog(String path) {
        String base = catalogBaseUrl == null ? "" : catalogBaseUrl.trim();
        if (base.endsWith("/")) base = base.substring(0, base.length() - 1);
        return base + path;
    }
}
