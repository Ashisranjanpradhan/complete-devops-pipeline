package com.opsmind.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AIAnalysisRepository extends JpaRepository<AIAnalysis, Long> {
    List<AIAnalysis> findByIncidentIdOrderByCreatedAtDesc(Long incidentId);
    Optional<AIAnalysis> findTopByIncidentIdOrderByCreatedAtDesc(Long incidentId);
}
