package com.backend.springapp.repository;

import com.backend.springapp.entity.ProblemStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProblemStageRepository extends JpaRepository<ProblemStage, Long> {
}
