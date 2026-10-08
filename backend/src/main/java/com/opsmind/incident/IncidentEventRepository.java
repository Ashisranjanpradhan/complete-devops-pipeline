package com.opsmind.incident;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentEventRepository extends JpaRepository<IncidentEvent, Long> {
    List<IncidentEvent> findByIncidentIdOrderByTimestampAsc(Long incidentId);
}
