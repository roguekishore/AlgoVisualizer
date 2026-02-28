package com.backend.springapp.gamification;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Immutable audit log for every coin credit / debit.
 */
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Table(name = "coin_transactions", indexes = {
        @Index(name = "idx_cointx_user", columnList = "userId"),
        @Index(name = "idx_cointx_created", columnList = "createdAt")
})
public class CoinTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false)
    private Long userId;

    /** Positive = earn, Negative = spend */
    @Column(nullable = false)
    private int amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionSource source;

    /** Snapshot of coin balance after this transaction */
    @Column(nullable = false)
    private int balanceAfter;

    /** Optional context: problemId, battleId, etc. */
    private Long referenceId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
