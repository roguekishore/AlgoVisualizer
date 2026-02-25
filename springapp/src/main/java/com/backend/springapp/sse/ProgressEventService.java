package com.backend.springapp.sse;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Manages per-user SSE emitters and broadcasts {@link ProgressEvent}s.
 *
 * Thread-safe: multiple extension-sync requests can fire concurrently for the
 * same user; each event is pushed to every open emitter for that userId.
 */
@Slf4j
@Service
public class ProgressEventService {

    /** userId → list of live SSE emitters (one per browser tab) */
    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    /** Timeout for each SSE connection (30 minutes, then client auto-reconnects) */
    private static final long SSE_TIMEOUT = 30 * 60 * 1000L;

    /**
     * Register a new SSE connection for a user.
     * Called by the controller when the React client opens an EventSource.
     */
    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);

        emitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        // Remove emitter on completion / timeout / error
        Runnable cleanup = () -> {
            List<SseEmitter> list = emitters.get(userId);
            if (list != null) {
                list.remove(emitter);
                if (list.isEmpty()) emitters.remove(userId);
            }
        };
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        // Send an initial "connected" event so the client knows the stream is alive
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("{\"status\":\"connected\"}", MediaType.APPLICATION_JSON));
        } catch (IOException e) {
            log.warn("Failed to send initial SSE event to user {}", userId, e);
            emitter.completeWithError(e);
        }

        log.info("SSE subscribed: userId={} (active emitters={})", userId,
                emitters.getOrDefault(userId, List.of()).size());

        return emitter;
    }

    /**
     * Broadcast a progress event to all open SSE connections for a user.
     * Uses a simple JSON string to avoid Jackson dependency issues.
     */
    public void publish(Long userId, ProgressEvent event) {
        List<SseEmitter> list = emitters.get(userId);
        if (list == null || list.isEmpty()) {
            log.debug("No SSE subscribers for userId={}, skipping event", userId);
            return;
        }

        // Build JSON manually to avoid ObjectMapper dependency issues
        String slug = event.slug() != null ? "\"" + event.slug().replace("\"", "\\\"") + "\"" : "null";
        String json = String.format(
                "{\"pid\":%d,\"status\":\"%s\",\"slug\":%s,\"attemptCount\":%d}",
                event.pid(), event.status(), slug, event.attemptCount());

        List<SseEmitter> dead = new java.util.ArrayList<>();
        for (SseEmitter emitter : list) {
            try {
                emitter.send(SseEmitter.event()
                        .name("progress-update")
                        .data(json, MediaType.APPLICATION_JSON));
            } catch (IOException e) {
                log.debug("SSE send failed for userId={}, removing emitter", userId);
                dead.add(emitter);
            }
        }
        if (!dead.isEmpty()) {
            list.removeAll(dead);
            if (list.isEmpty()) emitters.remove(userId);
        }

        log.debug("Published SSE event to {} emitter(s) for userId={}: {}", list.size(), userId, event);
    }
}
