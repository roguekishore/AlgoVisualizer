package com.backend.springapp.problem;

import jakarta.persistence.*;
import lombok.*;

import static jakarta.persistence.FetchType.EAGER;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"problem", "stage"})
public class ProblemStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = EAGER)
    @JoinColumn(name = "pid")
    private Problem problem;

    @ManyToOne(fetch = EAGER)
    @JoinColumn(name = "sid")
    private Stage stage;
}
