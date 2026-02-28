package com.backend.springapp.gamification;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Core gamification profile for a user.
 * Auto-created on first problem solve.
 */
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Table(name = "player_stats", indexes = {
        @Index(name = "idx_playerstats_user", columnList = "userId")
})
public class PlayerStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    /** FK → users.uid — one stats row per user */
    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false, columnDefinition = "int default 0")
    private int coins = 0;

    @Column(nullable = false, columnDefinition = "int default 0")
    private int xp = 0;

    @Column(nullable = false, columnDefinition = "int default 1")
    private int level = 1;

    /* ── Streak fields (Phase 1 will use these) ── */

    @Column(nullable = false, columnDefinition = "int default 0")
    private int currentStreak = 0;

    @Column(nullable = false, columnDefinition = "int default 0")
    private int longestStreak = 0;

    @Column
    private LocalDate lastActivityDate;

    /* ── Battle fields (Phase 5 will use this) ── */

    @Column(nullable = false, columnDefinition = "int default 1200")
    private int battleRating = 1200;

    /* ── Timestamps ── */

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
