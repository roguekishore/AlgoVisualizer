package com.backend.springapp.entity;

import java.util.Set;

import com.backend.springapp.enums.Tag;

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
    
    @Column(nullable = false, unique = true)
    private String title;
    
    @Column(unique = true)
    private String lcslug;

    @Enumerated(EnumType.STRING)
    private Tag tag;
}
