package com.backend.springapp.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for a single leaderboard entry.
 * Rating weights: HARD = 3 pts, MEDIUM = 2 pts, EASY/BASIC = 1 pt.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntryDTO {

    /** 1-based rank position within the requested leaderboard scope. */
    private int rank;

    private Long uid;
    private String username;

    /** LeetCode username — may be null. */
    private String lcusername;

    /** Institution name — null when the user has not set an institution. */
    private String institutionName;

    /** Number of problems with status = SOLVED. */
    private long solvedCount;

    /** Weighted rating: HARD×3 + MEDIUM×2 + (EASY|BASIC)×1. Stored on the User row. */
    private long rating;
}
