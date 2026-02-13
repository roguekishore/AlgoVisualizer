package com.backend.springapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for user progress response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProgressResponseDTO {

    private Long pid;
    private String status; // ATTEMPTED or SOLVED
    private Integer attemptCount;
    private LocalDateTime firstAttemptedAt;
    private LocalDateTime solvedAt;
}
