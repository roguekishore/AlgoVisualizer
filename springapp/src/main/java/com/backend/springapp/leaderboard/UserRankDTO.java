package com.backend.springapp.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for a specific user's rank snapshot.
 * Returned by GET /api/leaderboard/rank?userId={uid}.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRankDTO {

    private Long uid;
    private String username;

    /** Global rank among ALL users (standard competition ranking — ties share the same rank). */
    private long globalRank;

    /** Rank within the user's institution. Null if the user has no institution. */
    private Long institutionalRank;

    /** Institution id the user belongs to. Null if none. */
    private Long institutionId;

    /** Institution name. Null if none. */
    private String institutionName;

    private long solvedCount;
    private long rating;
}
