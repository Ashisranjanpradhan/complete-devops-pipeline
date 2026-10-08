package com.opsmind.monitoring;

import com.opsmind.service.ServiceEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "metrics_snapshots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MetricsSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity service;

    @Column(name = "latency_ms", nullable = false)
    private Double latencyMs;

    @Column(name = "error_rate_percent", nullable = false)
    private Double errorRatePercent;

    @Column(name = "cpu_usage_percent", nullable = false)
    private Double cpuUsagePercent;

    @Column(name = "memory_usage_percent", nullable = false)
    private Double memoryUsagePercent;

    @Column(name = "db_connections_utilization_percent", nullable = false)
    private Double dbConnectionsUtilizationPercent;

    @Builder.Default
    @Column(name = "captured_at", nullable = false)
    private Instant capturedAt = Instant.now();
}
