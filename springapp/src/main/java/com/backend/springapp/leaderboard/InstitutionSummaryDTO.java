package com.backend.springapp.leaderboard;

/**
 * Lightweight projection used for institution autocomplete responses.
 */
public record InstitutionSummaryDTO(
        Long id,
        String name,
        String university,
        String state,
        String district
) {}
