package com.opsmind.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentContext {
    private Long incidentId;
    private String incidentTitle;
    private String incidentDescription;
    private String severity;
    private String serviceName;
    private String environment;
    private String currentVersion;
    private String recentDeploymentVersion;
    private String recentDeploymentStatus;
    private Long minutesSinceLastDeployment;
    private Double currentLatencyMs;
    private Double currentErrorRatePercent;
    private Double currentCpuPercent;
    private Double currentMemoryPercent;
    private Double currentDbConnectionUtilization;
    private List<String> recentEvents;
}
