package com.opsmind.monitoring;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetricsSnapshotRequest {
    @NotNull(message = "Service ID is required")
    private Long serviceId;

    @NotNull(message = "Latency is required")
    private Double latencyMs;

    @NotNull(message = "Error rate is required")
    private Double errorRatePercent;

    @NotNull(message = "CPU usage is required")
    private Double cpuUsagePercent;

    @NotNull(message = "Memory usage is required")
    private Double memoryUsagePercent;

    @NotNull(message = "DB connection utilization is required")
    private Double dbConnectionsUtilizationPercent;
}
