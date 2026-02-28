package com.backend.springapp.gamification;

/**
 * DTO returned from GET /api/me/stats and GET /api/users/{id}/stats.
 */
public record PlayerStatsDTO(
    Long userId,
    int coins,
    int xp,
    int level,
    String title,
    int xpForCurrentLevel,
    int xpForNextLevel,
    int currentStreak,
    int longestStreak,
    int battleRating
) {}
