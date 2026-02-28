package com.backend.springapp.leaderboard;

import com.backend.springapp.user.Status;
import com.backend.springapp.user.User;
import com.backend.springapp.user.UserProgressRepository;
import com.backend.springapp.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Business logic for global and institutional leaderboards.
 */
@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final LeaderboardRepository leaderboardRepository;
    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;
    private final UserProgressRepository userProgressRepository;

    // ─── global leaderboard ──────────────────────────────────────────────────

    /**
     * Returns a paginated global leaderboard across all users.
     * Rank = position in the ordered list (1-based, page-aware).
     */
    public Page<LeaderboardEntryDTO> getGlobalLeaderboard(Pageable pageable) {
        int offset = (int) pageable.getOffset();
        int limit  = pageable.getPageSize();

        List<LeaderboardEntryDTO> rows = leaderboardRepository.findGlobalLeaderboard(offset, limit);
        long total                     = leaderboardRepository.countGlobalLeaderboard();

        return new PageImpl<>(applyRanks(rows, offset), pageable, total);
    }

    // ─── institutional leaderboard ───────────────────────────────────────────

    /**
     * Returns a paginated leaderboard scoped to one institution.
     * Only users who have that institution set appear.
     */
    public Page<LeaderboardEntryDTO> getInstitutionLeaderboard(Long institutionId, Pageable pageable) {
        if (!institutionRepository.existsById(institutionId)) {
            throw new EntityNotFoundException("Institution not found with id: " + institutionId);
        }

        int offset = (int) pageable.getOffset();
        int limit  = pageable.getPageSize();

        List<LeaderboardEntryDTO> rows = leaderboardRepository.findInstitutionLeaderboard(institutionId, offset, limit);
        long total                     = leaderboardRepository.countInstitutionLeaderboard(institutionId);

        return new PageImpl<>(applyRanks(rows, offset), pageable, total);
    }

    // ─── personal rank snapshot ──────────────────────────────────────────────

    /**
     * Returns the given user's global rank and institutional rank (if applicable).
     * Uses standard competition ranking: all users with the same score share the same rank.
     */
    public UserRankDTO getUserRank(Long uid) {
        User user = userRepository.findByIdWithInstitution(uid)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + uid));

        long solvedCount = userProgressRepository.countByUserIdAndStatus(uid, Status.SOLVED);
        long globalRank  = leaderboardRepository.countUsersWithHigherRating(user.getRating()) + 1;

        Institution institution    = user.getInstitution();
        Long institutionId         = institution != null ? institution.getId() : null;
        String institutionName     = institution != null ? institution.getName() : null;
        Long institutionalRank     = null;

        if (institutionId != null) {
            institutionalRank = leaderboardRepository
                    .countUsersWithHigherInstitutionRating(institutionId, user.getRating()) + 1;
        }

        return new UserRankDTO(
                user.getUid(),
                user.getUsername(),
                globalRank,
                institutionalRank,
                institutionId,
                institutionName,
                solvedCount,
                user.getRating()
        );
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    /**
     * Assigns competition-style ranks (users with the same rating share the same rank).
     * Consistent with getUserRank which uses "count higher + 1".
     */
    private List<LeaderboardEntryDTO> applyRanks(List<LeaderboardEntryDTO> entries, int offset) {
        for (int i = 0; i < entries.size(); i++) {
            if (i == 0) {
                entries.get(i).setRank(offset + 1);
            } else {
                LeaderboardEntryDTO prev = entries.get(i - 1);
                LeaderboardEntryDTO curr = entries.get(i);
                // Same rating → same rank; otherwise sequential
                if (curr.getRating() == prev.getRating()) {
                    curr.setRank(prev.getRank());
                } else {
                    curr.setRank(offset + i + 1);
                }
            }
        }
        return entries;
    }
}
