package com.backend.springapp.problem;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "stages")
public class Stage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sid;
    
    @Column(nullable = false, unique = true)
    private String name;
}
