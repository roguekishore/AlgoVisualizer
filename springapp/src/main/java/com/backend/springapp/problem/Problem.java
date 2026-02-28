package com.backend.springapp.problem;

import jakarta.persistence.*;
import lombok.*;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Table(name = "problems")
public class Problem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
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
