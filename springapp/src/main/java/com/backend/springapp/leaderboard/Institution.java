package com.backend.springapp.leaderboard;

import java.util.List;

import com.backend.springapp.user.User;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = "users")
@Table(name = "institution")
public class Institution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String name;
    private String university;
    private String state;
    private String district;
    private String normalizedName;

    @OneToMany(mappedBy = "institution")
    private List<User> users;
}
