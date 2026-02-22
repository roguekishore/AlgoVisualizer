package com.backend.springapp.problem;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "problems")
public class Problem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pid;
    
    @Column(nullable = false)
    private String title;
    
    private String lcslug;

    @Enumerated(EnumType.STRING)
    private Tag tag;

    @Column(nullable = false)
    private boolean hasVisualizer; 

    private String description;
}
