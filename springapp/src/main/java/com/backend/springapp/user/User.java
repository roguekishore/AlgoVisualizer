package com.backend.springapp.user;

import com.backend.springapp.gamification.leaderboard.Institution;

import jakarta.persistence.*;
import lombok.*;

import static jakarta.persistence.FetchType.EAGER;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = "institution")
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long uid;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(unique = true)
    private String lcusername;

    @ManyToOne(fetch = EAGER)
    @JoinColumn(name = "institution_id")
    private Institution institution;

    private Integer graduationYear;

    /** Weighted rating: incremented on each new solve (HARD=3, MEDIUM=2, EASY/BASIC=1). */
    @Column(nullable = false, columnDefinition = "int default 0")
    private int rating = 0;
}
