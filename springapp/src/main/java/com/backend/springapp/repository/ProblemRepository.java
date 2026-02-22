package com.backend.springapp.repository;

import com.backend.springapp.entity.Problem;
import com.backend.springapp.enums.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository for Problem entity with custom filtering queries.
 */
@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {

    /**
     * Find problems by stage name.
     * Uses DISTINCT to avoid duplicates from join.
     */
    @Query("SELECT DISTINCT p FROM Problem p " +
           "JOIN ProblemStage ps ON ps.problem.pid = p.pid " +
           "JOIN Stage s ON ps.stage.sid = s.sid " +
           "WHERE s.name = :stageName")
    Page<Problem> findByStageName(@Param("stageName") String stageName, Pageable pageable);

    /**
     * Find problems by tag (difficulty).
     */
    Page<Problem> findByTag(Tag tag, Pageable pageable);

    /**
     * Find problems by both stage name and tag.
     * Uses DISTINCT to avoid duplicates.
     */
    @Query("SELECT DISTINCT p FROM Problem p " +
           "JOIN ProblemStage ps ON ps.problem.pid = p.pid " +
           "JOIN Stage s ON ps.stage.sid = s.sid " +
           "WHERE s.name = :stageName AND p.tag = :tag")
    Page<Problem> findByStageNameAndTag(@Param("stageName") String stageName, 
                                         @Param("tag") Tag tag, 
                                         Pageable pageable);

    /**
     * Search problems by title keyword (case-insensitive).
     */
    @Query("SELECT p FROM Problem p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Problem> searchByTitleKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Find NOT_STARTED problems for a user (no progress record exists).
     */
    @Query("SELECT p FROM Problem p WHERE p.pid NOT IN " +
           "(SELECT up.problem.pid FROM UserProgress up WHERE up.user.uid = :uid)")
    Page<Problem> findNotStartedByUser(@Param("uid") Long uid, Pageable pageable);

    /**
     * Find ATTEMPTED problems for a user.
     */
    @Query("SELECT p FROM Problem p JOIN UserProgress up ON p.pid = up.problem.pid " +
           "WHERE up.user.uid = :uid AND up.status = 'ATTEMPTED'")
    Page<Problem> findAttemptedByUser(@Param("uid") Long uid, Pageable pageable);

    /**
     * Find SOLVED problems for a user.
     */
    @Query("SELECT p FROM Problem p JOIN UserProgress up ON p.pid = up.problem.pid " +
           "WHERE up.user.uid = :uid AND up.status = 'SOLVED'")
    Page<Problem> findSolvedByUser(@Param("uid") Long uid, Pageable pageable);
}
