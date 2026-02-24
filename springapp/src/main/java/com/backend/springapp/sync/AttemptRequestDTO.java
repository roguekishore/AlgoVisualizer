package com.backend.springapp.sync;

import lombok.Data;

/**
 * Request body for POST /api/sync/attempt.
 * Sent by the browser extension for every non-accepted LeetCode submission
 * so the backend can record an ATTEMPTED status for that problem.
 */
@Data
public class AttemptRequestDTO {

    /** The user's LeetCode username stored in our DB (User.lcusername). */
    private String lcusername;

    /** The LeetCode problem slug that was attempted (e.g. "two-sum"). */
    private String lcslug;
}
