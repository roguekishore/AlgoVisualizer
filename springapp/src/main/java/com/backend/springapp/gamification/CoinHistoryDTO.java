package com.backend.springapp.gamification;

import java.time.LocalDateTime;

/**
 * DTO for paginated coin history.
 */
public record CoinHistoryDTO(
    Long id,
    int amount,
    String source,
    int balanceAfter,
    Long referenceId,
    LocalDateTime createdAt
) {}
