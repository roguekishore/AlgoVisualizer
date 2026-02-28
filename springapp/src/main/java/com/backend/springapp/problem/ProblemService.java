package com.backend.springapp.problem;

import com.backend.springapp.user.UserProgress;
import com.backend.springapp.user.UserProgressRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service for managing Problem entities.
 * Handles CRUD operations, filtering, search, and stage associations.
 */
@Service
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final UserProgressRepository progressRepository;
    private final EntityManager entityManager;

    /**
     * Create a new problem with stage associations.
     */
    @Transactional
    public ProblemResponseDTO createProblem(ProblemRequestDTO dto) {
        Problem problem = new Problem();
        problem.setTitle(dto.getTitle());
        problem.setLcslug(dto.getLcslug());
        problem.setTag(parseTag(dto.getTag()));
        problem.setHasVisualizer(dto.getHasVisualizer());
        problem.setDescription(dto.getDescription());

        Problem saved = problemRepository.save(problem);

        // Handle stage associations
        if (dto.getStages() != null && !dto.getStages().isEmpty()) {
            associateStages(saved, dto.getStages());
        }

        return mapToResponseDTO(saved, null);
    }

    /**
     * Update an existing problem.
     */
    @Transactional
    public ProblemResponseDTO updateProblem(Long pid, ProblemRequestDTO dto) {
        Problem problem = problemRepository.findById(pid)
                .orElseThrow(() -> new EntityNotFoundException("Problem not found with id: " + pid));

        problem.setTitle(dto.getTitle());
        problem.setLcslug(dto.getLcslug());
        problem.setTag(parseTag(dto.getTag()));
        problem.setHasVisualizer(dto.getHasVisualizer());
        problem.setDescription(dto.getDescription());

        Problem updated = problemRepository.save(problem);

        // Update stage associations
        removeExistingStages(pid);
        if (dto.getStages() != null && !dto.getStages().isEmpty()) {
            associateStages(updated, dto.getStages());
        }

        return mapToResponseDTO(updated, null);
    }

    /**
     * Delete a problem by ID.
     */
    @Transactional
    public void deleteProblem(Long pid) {
        if (!problemRepository.existsById(pid)) {
            throw new EntityNotFoundException("Problem not found with id: " + pid);
        }
        progressRepository.deleteAllByProblemId(pid);
        removeExistingStages(pid);
        problemRepository.deleteById(pid);
    }

    /**
     * Get a problem by ID.
     */
    public ProblemResponseDTO getProblemById(Long pid) {
        Problem problem = problemRepository.findById(pid)
                .orElseThrow(() -> new EntityNotFoundException("Problem not found with id: " + pid));
        return mapToResponseDTO(problem, null);
    }

    /**
     * Get paginated problems with optional filters.
     * If userId is provided, each problem includes userStatus (NOT_STARTED, ATTEMPTED, SOLVED).
     * If userId is null (guest), userStatus is null.
     */
    public Page<ProblemResponseDTO> getProblems(Long userId, String stage, String tag,
                                                 String status, Pageable pageable) {
        Page<Problem> problems;

        // Status filter only applies for logged-in users
        if (userId != null && status != null) {
            switch (status.toUpperCase()) {
                case "NOT_STARTED":
                    problems = problemRepository.findNotStartedByUser(userId, pageable);
                    break;
                case "ATTEMPTED":
                    problems = problemRepository.findAttemptedByUser(userId, pageable);
                    break;
                case "SOLVED":
                    problems = problemRepository.findSolvedByUser(userId, pageable);
                    break;
                default:
                    throw new IllegalArgumentException("Invalid status: " + status);
            }
        } else if (stage != null && tag != null) {
            Tag tagEnum = parseTag(tag);
            problems = problemRepository.findByStageNameAndTag(stage, tagEnum, pageable);
        } else if (stage != null) {
            problems = problemRepository.findByStageName(stage, pageable);
        } else if (tag != null) {
            Tag tagEnum = parseTag(tag);
            problems = problemRepository.findByTag(tagEnum, pageable);
        } else {
            problems = problemRepository.findAll(pageable);
        }

        return mapPageToDTO(problems, userId);
    }

    /**
     * Search problems by title keyword.
     */
    public Page<ProblemResponseDTO> searchProblems(String keyword, Pageable pageable) {
        Page<Problem> problems = problemRepository.searchByTitleKeyword(keyword, pageable);
        return mapPageToDTO(problems, null);
    }

    /**
     * Parse tag string to Tag enum safely.
     * Throws IllegalArgumentException if invalid.
     */
    private Tag parseTag(String tagStr) {
        if (tagStr == null || tagStr.isBlank()) return null;
        try {
            return Tag.valueOf(tagStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid tag value: " + tagStr + 
                    ". Valid values are: BASIC, EASY, MEDIUM, HARD");
        }
    }

    /**
     * Associate stages with a problem.
     */
    private void associateStages(Problem problem, List<String> stageNames) {
        for (String stageName : stageNames) {
            Stage stage = findOrCreateStage(stageName);
            ProblemStage ps = new ProblemStage();
            ps.setProblem(problem);
            ps.setStage(stage);
            entityManager.persist(ps);
        }
    }

    /**
     * Find or create a stage by name.
     */
    private Stage findOrCreateStage(String stageName) {
        List<Stage> stages = entityManager.createQuery(
                "SELECT s FROM Stage s WHERE s.name = :name", Stage.class)
                .setParameter("name", stageName)
                .getResultList();

        if (!stages.isEmpty()) {
            return stages.get(0);
        }

        Stage newStage = new Stage();
        newStage.setName(stageName);
        entityManager.persist(newStage);
        return newStage;
    }

    /**
     * Remove existing stage associations for a problem.
     */
    private void removeExistingStages(Long pid) {
        entityManager.createQuery("DELETE FROM ProblemStage ps WHERE ps.problem.pid = :pid")
                .setParameter("pid", pid)
                .executeUpdate();
    }

    /**
     * Map Problem entity to ProblemResponseDTO.
     * If userId is provided, resolves userStatus. Otherwise leaves it null (guest).
     */
    private ProblemResponseDTO mapToResponseDTO(Problem problem, Long userId) {
        List<String> stageNames = entityManager.createQuery(
                "SELECT s.name FROM ProblemStage ps " +
                "JOIN ps.stage s WHERE ps.problem.pid = :pid", String.class)
                .setParameter("pid", problem.getPid())
                .getResultList();

        // Resolve user status only for logged-in users
        String userStatus = null;
        if (userId != null) {
            userStatus = "NOT_STARTED";
            Optional<UserProgress> progress = progressRepository.findByUserIdAndProblemId(userId, problem.getPid());
            if (progress.isPresent()) {
                userStatus = progress.get().getStatus().name();
            }
        }

        return new ProblemResponseDTO(
                problem.getPid(),
                problem.getTitle(),
                problem.getLcslug(),
                problem.getTag() != null ? problem.getTag().name() : null,
                problem.isHasVisualizer(),
                problem.getDescription(),
                stageNames,
                userStatus
        );
    }

    @SuppressWarnings("unchecked")
    private Page<ProblemResponseDTO> mapPageToDTO(Page<Problem> problems, Long userId) {
        List<Long> pids = problems.getContent().stream().map(Problem::getPid).toList();

        // Batch fetch all stage names in ONE query (instead of N)
        Map<Long, List<String>> stageMap = new HashMap<>();
        if (!pids.isEmpty()) {
            List<Object[]> stageRows = entityManager.createQuery(
                    "SELECT ps.problem.pid, s.name FROM ProblemStage ps " +
                    "JOIN ps.stage s WHERE ps.problem.pid IN :pids")
                    .setParameter("pids", pids)
                    .getResultList();
            for (Object[] row : stageRows) {
                stageMap.computeIfAbsent((Long) row[0], k -> new ArrayList<>()).add((String) row[1]);
            }
        }

        // Batch fetch all user progress in ONE query (instead of N)
        Map<Long, String> statusMap = new HashMap<>();
        if (userId != null && !pids.isEmpty()) {
            List<UserProgress> progressList = progressRepository.findByUserIdAndProblemIds(userId, pids);
            for (UserProgress up : progressList) {
                statusMap.put(up.getProblem().getPid(), up.getStatus().name());
            }
        }

        return problems.map(p -> new ProblemResponseDTO(
                p.getPid(), p.getTitle(), p.getLcslug(),
                p.getTag() != null ? p.getTag().name() : null,
                p.isHasVisualizer(), p.getDescription(),
                stageMap.getOrDefault(p.getPid(), List.of()),
                userId != null ? statusMap.getOrDefault(p.getPid(), "NOT_STARTED") : null
        ));
    }
}
