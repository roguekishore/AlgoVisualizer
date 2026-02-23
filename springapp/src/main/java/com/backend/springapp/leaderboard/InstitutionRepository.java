package com.backend.springapp.leaderboard;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InstitutionRepository extends JpaRepository<Institution, Long> {
    List<Institution> findByNameContainingIgnoreCase(String name);

    List<Institution> findByNameContainingIgnoreCaseOrNormalizedNameContainingIgnoreCase(
            String name, String normalizedName);
}
