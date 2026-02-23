package com.backend.springapp.user;

import com.backend.springapp.leaderboard.Institution;

import jakarta.persistence.*;
import jakarta.persistence.criteria.CriteriaBuilder.In;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long uid;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(unique = true)
    private String lcusername;

    @ManyToOne
    @JoinColumn(name = "institution_id")
    private Institution institution;

    private Integer graduationYear;

    /** Weighted rating: incremented on each new solve (HARD=3, MEDIUM=2, EASY/BASIC=1). */
    @Column(nullable = false, columnDefinition = "int default 0")
    private int rating = 0;
}
