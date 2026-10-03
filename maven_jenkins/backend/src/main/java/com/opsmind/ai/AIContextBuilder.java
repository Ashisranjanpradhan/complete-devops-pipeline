package com.opsmind.ai;

import com.opsmind.deployment.Deployment;
import com.opsmind.deployment.DeploymentRepository;
import com.opsmind.incident.Incident;
import com.opsmind.incident.IncidentEvent;
import com.opsmind.monitoring.MetricsSnapshot;
import com.opsmind.monitoring.MetricsSnapshotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AIContextBuilder {

    private final DeploymentRepository deploymentRepository;
    private final MetricsSnapshotRepository metricsSnapshotRepository;

    public IncidentContext buildContext(Incident incident) {
        Long serviceId = incident.getService().getId();

        // Find most recent deployment for this service
        List<Deployment> deployments = deploymentRepository.findByServiceIdOrderByStartedAtDesc(serviceId);
        Deployment latestDeployment = deployments.isEmpty() ? null : deployments.get(0);

        Long minutesSinceDeploy = null;
        if (latestDeployment != null && latestDeployment.getStartedAt() != null) {
            minutesSinceDeploy = Math.max(0, Duration.between(latestDeployment.getStartedAt(), incident.getCreatedAt()).toMinutes());
        }

        // Find most recent metrics snapshots for this service
        List<MetricsSnapshot> snapshots = metricsSnapshotRepository.findTop20ByServiceIdOrderByCapturedAtDesc(serviceId);
        MetricsSnapshot latestMetrics = snapshots.isEmpty() ? null : snapshots.get(0);

        List<String> eventDescriptions = incident.getEvents() != null ?
                incident.getEvents().stream()
                        .map(IncidentEvent::getDescription)
                        .collect(Collectors.toList()) :
                List.of();

        return IncidentContext.builder()
                .incidentId(incident.getId())
                .incidentTitle(incident.getTitle())
                .incidentDescription(incident.getDescription())
                .severity(incident.getSeverity().name())
                .serviceName(incident.getService().getName())
                .environment(incident.getService().getEnvironment())
                .currentVersion(incident.getService().getCurrentVersion())
                .recentDeploymentVersion(latestDeployment != null ? latestDeployment.getVersion() : "N/A")
                .recentDeploymentStatus(latestDeployment != null ? latestDeployment.getStatus().name() : "N/A")
                .minutesSinceLastDeployment(minutesSinceDeploy)
                .currentLatencyMs(latestMetrics != null ? latestMetrics.getLatencyMs() : 180.0)
                .currentErrorRatePercent(latestMetrics != null ? latestMetrics.getErrorRatePercent() : 0.5)
                .currentCpuPercent(latestMetrics != null ? latestMetrics.getCpuUsagePercent() : 35.0)
                .currentMemoryPercent(latestMetrics != null ? latestMetrics.getMemoryUsagePercent() : 48.0)
                .currentDbConnectionUtilization(latestMetrics != null ? latestMetrics.getDbConnectionsUtilizationPercent() : 55.0)
                .recentEvents(eventDescriptions)
                .build();
    }
}
