package com.backend.springapp.entity;

import com.backend.springapp.enums.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "userprogress", uniqueConstraints = { @UniqueConstraint(columnNames = { "uid", "pid" }) }, indexes = {
        @Index(name = "idx_userprogress_user", columnList = "uid"),
        @Index(name = "idx_userprogress_problem", columnList = "pid"),
        @Index(name = "idx_userprogress_status", columnList = "status")
})
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "uid")
    private User user;

    @ManyToOne
    @JoinColumn(name = "pid")
    private Problem problem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "attempt_count", nullable = false)
    private Integer attemptCount = 0;

    @Column(name = "first_attempted_at")
    private LocalDateTime firstAttemptedAt;

    @Column(name = "solved_at")
    private LocalDateTime solvedAt;
}
