package com.backend.springapp.leaderboard;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeaderboardRepository {

    private final EntityManager em;

    // Shared SQL: rating is stored on users.rating — no SUM/CASE aggregation needed.
    private static final String LEADERBOARD_SQL =
            "SELECT u.uid, u.username, u.lcusername, i.name, COUNT(up.id), u.rating " +
            "FROM userprogress up " +
            "JOIN users u ON up.uid = u.uid " +
            "LEFT JOIN institution i ON u.institution_id = i.id " +
            "WHERE up.status = 'SOLVED' ";

    private static final String GROUP_ORDER =
            "GROUP BY u.uid, u.username, u.lcusername, i.name, u.rating " +
            "ORDER BY u.rating DESC, COUNT(up.id) DESC, MAX(up.solved_at) ASC";

    @SuppressWarnings("unchecked")
    public List<LeaderboardEntryDTO> findGlobalLeaderboard(int offset, int limit) {
        return toEntries(em.createNativeQuery(LEADERBOARD_SQL + GROUP_ORDER)
                .setFirstResult(offset)
                .setMaxResults(limit)
                .getResultList());
    }

    // Any user with at least one solve has rating >= 1, so rating > 0 is equivalent.
    public long countGlobalLeaderboard() {
        return ((Number) em.createNativeQuery(
                "SELECT COUNT(*) FROM users WHERE rating > 0")
                .getSingleResult()).longValue();
    }

    @SuppressWarnings("unchecked")
    public List<LeaderboardEntryDTO> findInstitutionLeaderboard(Long institutionId, int offset, int limit) {
        return toEntries(em.createNativeQuery(
                LEADERBOARD_SQL + "AND u.institution_id = :institutionId " + GROUP_ORDER)
                .setParameter("institutionId", institutionId)
                .setFirstResult(offset)
                .setMaxResults(limit)
                .getResultList());
    }

    public long countInstitutionLeaderboard(Long institutionId) {
        return ((Number) em.createNativeQuery(
                "SELECT COUNT(*) FROM users WHERE institution_id = :institutionId AND rating > 0")
                .setParameter("institutionId", institutionId)
                .getSingleResult()).longValue();
    }

    public long countUsersWithHigherRating(long userRating) {
        return ((Number) em.createNativeQuery(
                "SELECT COUNT(*) FROM users WHERE rating > :userRating")
                .setParameter("userRating", userRating)
                .getSingleResult()).longValue();
    }

    public long countUsersWithHigherInstitutionRating(Long institutionId, long userRating) {
        return ((Number) em.createNativeQuery(
                "SELECT COUNT(*) FROM users WHERE rating > :userRating AND institution_id = :institutionId")
                .setParameter("userRating", userRating)
                .setParameter("institutionId", institutionId)
                .getSingleResult()).longValue();
    }

    @SuppressWarnings("unchecked")
    private List<LeaderboardEntryDTO> toEntries(List<Object[]> rows) {
        List<LeaderboardEntryDTO> entries = new ArrayList<>(rows.size());
        for (Object[] r : rows) {
            entries.add(new LeaderboardEntryDTO(
                    0,                               // rank — stamped by service
                    ((Number) r[0]).longValue(),
                    (String)  r[1],
                    (String)  r[2],
                    (String)  r[3],
                    ((Number) r[4]).longValue(),
                    ((Number) r[5]).longValue()
            ));
        }
        return entries;
    }
}
