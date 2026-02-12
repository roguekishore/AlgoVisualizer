package com.backend.springapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "userprogress", uniqueConstraints = { @UniqueConstraint(columnNames = { "uid", "pid" }) }, indexes = {
        @Index(name = "idx_userprogress_user", columnList = "uid"),
        @Index(name = "idx_userprogress_problem", columnList = "pid")
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

}
