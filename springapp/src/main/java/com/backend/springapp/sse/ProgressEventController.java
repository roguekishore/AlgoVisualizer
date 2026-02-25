package com.backend.springapp.sse;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * SSE streaming endpoint for live progress updates.
 *
 * The React client opens:
 *   new EventSource("http://localhost:8080/api/progress/stream?userId=1")
 *
 * Events pushed:
 *   name: "connected"        — initial heartbeat
 *   name: "progress-update"  — { pid, status, slug, attemptCount }
 */
@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"},
             allowCredentials = "true")
@RequiredArgsConstructor
public class ProgressEventController {

    private final ProgressEventService progressEventService;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestParam Long userId) {
        return progressEventService.subscribe(userId);
    }
}
