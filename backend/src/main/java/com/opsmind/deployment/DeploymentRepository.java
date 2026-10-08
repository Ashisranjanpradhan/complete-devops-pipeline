package com.opsmind.deployment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeploymentRepository extends JpaRepository<Deployment, Long> {
    List<Deployment> findByServiceIdOrderByStartedAtDesc(Long serviceId);
    List<Deployment> findByOrderByStartedAtDesc();
    Optional<Deployment> findTopByServiceIdAndStatusOrderByStartedAtDesc(Long serviceId, DeploymentStatus status);
    long countByStatus(DeploymentStatus status);
}
