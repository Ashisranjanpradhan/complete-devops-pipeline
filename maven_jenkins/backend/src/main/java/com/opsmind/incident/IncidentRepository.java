package com.opsmind.incident;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByOrderByCreatedAtDesc();
    List<Incident> findByServiceIdOrderByCreatedAtDesc(Long serviceId);
    List<Incident> findByStatusNotOrderByCreatedAtDesc(IncidentStatus status);
    long countByStatus(IncidentStatus status);
    long countBySeverity(IncidentSeverity severity);
}
