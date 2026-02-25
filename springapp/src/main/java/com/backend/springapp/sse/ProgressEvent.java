package com.backend.springapp.sse;

/**
 * Lightweight event payload pushed to the React frontend via SSE
 * whenever a user's progress changes (solved/attempted via extension or in-app).
 */
public record ProgressEvent(
        Long   pid,        // backend problem ID
        String status,     // "SOLVED" | "ATTEMPTED"
        String slug,       // LC slug (nullable for in-app solves)
        int    attemptCount
) {}
