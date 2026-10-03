package com.opsmind.monitoring;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MetricsSnapshotRepository extends JpaRepository<MetricsSnapshot, Long> {
    List<MetricsSnapshot> findByServiceIdOrderByCapturedAtDesc(Long serviceId);
    List<MetricsSnapshot> findTop20ByServiceIdOrderByCapturedAtDesc(Long serviceId);
    List<MetricsSnapshot> findTop50ByOrderByCapturedAtDesc();
}
