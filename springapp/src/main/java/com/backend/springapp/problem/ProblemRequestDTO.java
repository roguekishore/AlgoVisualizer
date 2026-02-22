package com.backend.springapp.problem;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for creating or updating a problem.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProblemRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    private String lcslug;

    @NotBlank(message = "Tag (difficulty) is required")
    private String tag;

    @NotNull(message = "hasVisualizer is required")
    private Boolean hasVisualizer;

    private String description;

    private List<String> stages; // stage names
}
