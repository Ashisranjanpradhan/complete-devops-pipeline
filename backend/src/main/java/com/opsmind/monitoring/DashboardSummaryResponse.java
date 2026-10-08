package com.opsmind.monitoring;

import com.opsmind.deployment.DeploymentResponse;
import com.opsmind.incident.IncidentResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {
    private long totalServices;
    private long healthyServices;
    private long totalDeployments;
    private double deploymentSuccessRate;
    private long activeIncidents;
    private long criticalIncidents;
    private double systemAvailability;
    private double currentErrorRate;
    private double averageLatencyMs;
    private double p95LatencyMs;
    private double cpuUtilization;
    private double memoryUtilization;

    // DORA Metrics
    private String deploymentFrequency;
    private String leadTimeForChanges;
    private double changeFailureRate;
    private String meanTimeToRestore;

    // Recent feeds
    private List<IncidentResponse> activeIncidentList;
    private List<DeploymentResponse> recentDeployments;
}
