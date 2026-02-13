package com.backend.springapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for problem response.
 * userStatus is null for guests, populated for logged-in users.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProblemResponseDTO {

    private Long pid;
    private String title;
    private String lcslug;
    private String tag; // difficulty enum as string
    private boolean hasVisualizer;
    private String description;
    private List<String> topics; // flattened topic names
    private String userStatus; // null=guest, NOT_STARTED, ATTEMPTED, SOLVED
}
