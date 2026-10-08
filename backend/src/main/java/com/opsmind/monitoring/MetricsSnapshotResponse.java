package com.opsmind.monitoring;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetricsSnapshotResponse {
    private Long id;
    private Long serviceId;
    private String serviceName;
    private Double latencyMs;
    private Double errorRatePercent;
    private Double cpuUsagePercent;
    private Double memoryUsagePercent;
    private Double dbConnectionsUtilizationPercent;
    private Instant capturedAt;

    public static MetricsSnapshotResponse fromEntity(MetricsSnapshot entity) {
        return MetricsSnapshotResponse.builder()
                .id(entity.getId())
                .serviceId(entity.getService().getId())
                .serviceName(entity.getService().getName())
                .latencyMs(entity.getLatencyMs())
                .errorRatePercent(entity.getErrorRatePercent())
                .cpuUsagePercent(entity.getCpuUsagePercent())
                .memoryUsagePercent(entity.getMemoryUsagePercent())
                .dbConnectionsUtilizationPercent(entity.getDbConnectionsUtilizationPercent())
                .capturedAt(entity.getCapturedAt())
                .build();
    }
}
