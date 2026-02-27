package com.backend.springapp.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByLcusername(String lcusername);

    Optional<User> findBySessionToken(String sessionToken);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByLcusername(String lcusername);

    /**
     * Atomically increments the stored rating of a user by the given points.
     * Called every time a new problem is solved (not already solved).
     */
    @Modifying
    @Query("UPDATE User u SET u.rating = u.rating + :points WHERE u.uid = :uid")
    void addRating(@Param("uid") Long uid, @Param("points") int points);

    /**
     * Loads a user together with their institution in a single query.
     * Avoids LazyInitializationException when accessing institution fields outside a persistence context.
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.institution WHERE u.uid = :uid")
    Optional<User> findByIdWithInstitution(@Param("uid") Long uid);
}
