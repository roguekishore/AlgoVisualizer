package com.backend.springapp.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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

    @Query("SELECT up FROM UserProgress up JOIN FETCH up.problem WHERE up.user.uid = :uid")
    List<UserProgress> findAllByUserId(@Param("uid") Long uid);

    @Query("SELECT up FROM UserProgress up WHERE up.user.uid = :uid AND up.problem.pid = :pid")
    Optional<UserProgress> findByUserIdAndProblemId(@Param("uid") Long uid, @Param("pid") Long pid);

    @Query("SELECT up FROM UserProgress up JOIN FETCH up.problem WHERE up.user.uid = :uid AND up.problem.pid IN :pids")
    List<UserProgress> findByUserIdAndProblemIds(@Param("uid") Long uid, @Param("pids") List<Long> pids);

    @Query("SELECT COUNT(up) > 0 FROM UserProgress up WHERE up.user.uid = :uid AND up.problem.pid = :pid")
    boolean existsByUserIdAndProblemId(@Param("uid") Long uid, @Param("pid") Long pid);

    @Query("SELECT COUNT(up) FROM UserProgress up WHERE up.user.uid = :uid AND up.status = :status")
    long countByUserIdAndStatus(@Param("uid") Long uid, @Param("status") Status status);

    @Modifying
    @Query("DELETE FROM UserProgress up WHERE up.user.uid = :uid")
    void deleteAllByUserId(@Param("uid") Long uid);

    @Modifying
    @Query("DELETE FROM UserProgress up WHERE up.problem.pid = :pid")
    void deleteAllByProblemId(@Param("pid") Long pid);
}
