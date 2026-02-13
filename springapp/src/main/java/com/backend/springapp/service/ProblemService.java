package com.backend.springapp.service;

import com.backend.springapp.dto.ProblemRequestDTO;
import com.backend.springapp.dto.ProblemResponseDTO;
import com.backend.springapp.entity.Problem;
import com.backend.springapp.entity.ProblemTopic;
import com.backend.springapp.entity.Topic;
import com.backend.springapp.entity.UserProgress;
import com.backend.springapp.enums.Tag;
import com.backend.springapp.repository.ProblemRepository;
import com.backend.springapp.repository.UserProgressRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for managing Problem entities.
 * Handles CRUD operations, filtering, search, and topic associations.
 */
@Service
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final UserProgressRepository progressRepository;
    private final EntityManager entityManager;

    /**
     * Create a new problem with topic associations.
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

        // Handle topic associations
        if (dto.getTopics() != null && !dto.getTopics().isEmpty()) {
            associateTopics(saved, dto.getTopics());
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

        // Update topic associations
        removeExistingTopics(pid);
        if (dto.getTopics() != null && !dto.getTopics().isEmpty()) {
            associateTopics(updated, dto.getTopics());
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
        removeExistingTopics(pid);
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
    public Page<ProblemResponseDTO> getProblems(Long userId, String topic, String tag,
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
        } else if (topic != null && tag != null) {
            Tag tagEnum = parseTag(tag);
            problems = problemRepository.findByTopicNameAndTag(topic, tagEnum, pageable);
        } else if (topic != null) {
            problems = problemRepository.findByTopicName(topic, pageable);
        } else if (tag != null) {
            Tag tagEnum = parseTag(tag);
            problems = problemRepository.findByTag(tagEnum, pageable);
        } else {
            problems = problemRepository.findAll(pageable);
        }

        return problems.map(p -> mapToResponseDTO(p, userId));
    }

    /**
     * Search problems by title keyword.
     */
    public Page<ProblemResponseDTO> searchProblems(String keyword, Pageable pageable) {
        Page<Problem> problems = problemRepository.searchByTitleKeyword(keyword, pageable);
        return problems.map(p -> mapToResponseDTO(p, null));
    }

    /**
     * Parse tag string to Tag enum safely.
     * Throws IllegalArgumentException if invalid.
     */
    private Tag parseTag(String tagStr) {
        try {
            return Tag.valueOf(tagStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid tag value: " + tagStr + 
                    ". Valid values are: BASIC, EASY, MEDIUM, HARD");
        }
    }

    /**
     * Associate topics with a problem.
     */
    private void associateTopics(Problem problem, List<String> topicNames) {
        for (String topicName : topicNames) {
            Topic topic = findOrCreateTopic(topicName);
            ProblemTopic pt = new ProblemTopic();
            pt.setProblem(problem);
            pt.setTopic(topic);
            entityManager.persist(pt);
        }
    }

    /**
     * Find or create a topic by name.
     */
    private Topic findOrCreateTopic(String topicName) {
        List<Topic> topics = entityManager.createQuery(
                "SELECT t FROM Topic t WHERE t.topicname = :name", Topic.class)
                .setParameter("name", topicName)
                .getResultList();

        if (!topics.isEmpty()) {
            return topics.get(0);
        }

        Topic newTopic = new Topic();
        newTopic.setTopicname(topicName);
        entityManager.persist(newTopic);
        return newTopic;
    }

    /**
     * Remove existing topic associations for a problem.
     */
    private void removeExistingTopics(Long pid) {
        entityManager.createQuery("DELETE FROM ProblemTopic pt WHERE pt.problem.pid = :pid")
                .setParameter("pid", pid)
                .executeUpdate();
    }

    /**
     * Map Problem entity to ProblemResponseDTO.
     * If userId is provided, resolves userStatus. Otherwise leaves it null (guest).
     */
    private ProblemResponseDTO mapToResponseDTO(Problem problem, Long userId) {
        List<String> topicNames = entityManager.createQuery(
                "SELECT t.topicname FROM ProblemTopic pt " +
                "JOIN pt.topic t WHERE pt.problem.pid = :pid", String.class)
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
                topicNames,
                userStatus
        );
    }
}
