package com.backend.springapp.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for UserProgress entity.
 */
@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {

    /**
     * Get all progress for a specific user.
     * Used on app startup to load into localStorage.
     */
    @Query("SELECT up FROM UserProgress up WHERE up.user.uid = :uid")
    List<UserProgress> findAllByUserId(@Param("uid") Long uid);

    /**
     * Find user progress for specific problem.
     */
    @Query("SELECT up FROM UserProgress up WHERE up.user.uid = :uid AND up.problem.pid = :pid")
    Optional<UserProgress> findByUserIdAndProblemId(@Param("uid") Long uid, @Param("pid") Long pid);

    /**
     * Check if user has attempted a problem.
     */
    @Query("SELECT COUNT(up) > 0 FROM UserProgress up WHERE up.user.uid = :uid AND up.problem.pid = :pid")
    boolean existsByUserIdAndProblemId(@Param("uid") Long uid, @Param("pid") Long pid);

    /**
     * Get count of solved problems for a user.
     */
    @Query("SELECT COUNT(up) FROM UserProgress up WHERE up.user.uid = :uid AND up.status = :status")
    long countByUserIdAndStatus(@Param("uid") Long uid, @Param("status") Status status);
}
