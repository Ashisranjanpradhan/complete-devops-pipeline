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
public class SystemMetricsResponse {
    private Double jvmMemoryUsedMb;
    private Double jvmMemoryMaxMb;
    private Double jvmMemoryUtilizationPercent;
    private Double systemCpuUsage;
    private Integer activeDbConnections;
    private Integer maxDbConnections;
    private Double dbConnectionUtilizationPercent;
    private Long totalRequests;
    private Double averageResponseTimeMs;
    private Double currentErrorRatePercent;
    private Instant timestamp;
}
