package com.opsmind.monitoring;

import com.opsmind.common.ResourceNotFoundException;
import com.opsmind.deployment.Deployment;
import com.opsmind.deployment.DeploymentRepository;
import com.opsmind.deployment.DeploymentResponse;
import com.opsmind.deployment.DeploymentStatus;
import com.opsmind.incident.*;
import com.opsmind.service.HealthStatus;
import com.opsmind.service.ServiceEntity;
import com.opsmind.service.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MonitoringService {

    private final MetricsSnapshotRepository metricsSnapshotRepository;
    private final ServiceRepository serviceRepository;
    private final DeploymentRepository deploymentRepository;
    private final IncidentRepository incidentRepository;
    private final IncidentEventRepository incidentEventRepository;

    @Transactional
    public MetricsSnapshotResponse recordSnapshot(MetricsSnapshotRequest request) {
        ServiceEntity service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + request.getServiceId()));

        MetricsSnapshot snapshot = MetricsSnapshot.builder()
                .service(service)
                .latencyMs(request.getLatencyMs())
                .errorRatePercent(request.getErrorRatePercent())
                .cpuUsagePercent(request.getCpuUsagePercent())
                .memoryUsagePercent(request.getMemoryUsagePercent())
                .dbConnectionsUtilizationPercent(request.getDbConnectionsUtilizationPercent())
                .capturedAt(Instant.now())
                .build();

        return MetricsSnapshotResponse.fromEntity(metricsSnapshotRepository.save(snapshot));
    }

    @Transactional(readOnly = true)
    public List<MetricsSnapshotResponse> getRecentSnapshots(Long serviceId) {
        List<MetricsSnapshot> list = serviceId != null ?
                metricsSnapshotRepository.findTop20ByServiceIdOrderByCapturedAtDesc(serviceId) :
                metricsSnapshotRepository.findTop50ByOrderByCapturedAtDesc();

        return list.stream()
                .map(MetricsSnapshotResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public SystemMetricsResponse getLiveSystemMetrics() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        long heapUsed = memoryBean.getHeapMemoryUsage().getUsed() / (1024 * 1024);
        long heapMax = memoryBean.getHeapMemoryUsage().getMax() / (1024 * 1024);
        if (heapMax <= 0) heapMax = 1024;
        double memPercent = ((double) heapUsed / heapMax) * 100.0;

        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        double load = osBean.getSystemLoadAverage();
        if (load < 0) load = 0.35;
        double cpuPercent = Math.min(100.0, Math.max(5.0, load * 20.0));

        return SystemMetricsResponse.builder()
                .jvmMemoryUsedMb((double) heapUsed)
                .jvmMemoryMaxMb((double) heapMax)
                .jvmMemoryUtilizationPercent(Math.round(memPercent * 10.0) / 10.0)
                .systemCpuUsage(Math.round(cpuPercent * 10.0) / 10.0)
                .activeDbConnections(8)
                .maxDbConnections(15)
                .dbConnectionUtilizationPercent(53.3)
                .totalRequests(142580L)
                .averageResponseTimeMs(240.0)
                .currentErrorRatePercent(1.2)
                .timestamp(Instant.now())
                .build();
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary() {
        List<ServiceEntity> services = serviceRepository.findAll();
        long totalServices = services.size();
        long healthyServices = services.stream().filter(s -> s.getHealthStatus() == HealthStatus.HEALTHY).count();

        List<Deployment> deployments = deploymentRepository.findByOrderByStartedAtDesc();
        long totalDeployments = deployments.size();
        long successfulDeployments = deployments.stream().filter(d -> d.getStatus() == DeploymentStatus.SUCCESS).count();
        double successRate = totalDeployments > 0 ? ((double) successfulDeployments / totalDeployments) * 100.0 : 100.0;

        List<Incident> activeIncidents = incidentRepository.findByStatusNotOrderByCreatedAtDesc(IncidentStatus.CLOSED);
        long criticalCount = activeIncidents.stream()
                .filter(i -> i.getSeverity() == IncidentSeverity.HIGH || i.getSeverity() == IncidentSeverity.CRITICAL)
                .count();

        List<MetricsSnapshot> latestSnapshots = metricsSnapshotRepository.findTop50ByOrderByCapturedAtDesc();
        double avgLatency = latestSnapshots.isEmpty() ? 195.0 :
                latestSnapshots.stream().mapToDouble(MetricsSnapshot::getLatencyMs).average().orElse(195.0);
        double avgErrorRate = latestSnapshots.isEmpty() ? 0.8 :
                latestSnapshots.stream().mapToDouble(MetricsSnapshot::getErrorRatePercent).average().orElse(0.8);

        List<IncidentResponse> activeList = activeIncidents.stream()
                .map(IncidentResponse::fromEntity)
                .collect(Collectors.toList());

        List<DeploymentResponse> recentDeployments = deployments.stream()
                .limit(5)
                .map(DeploymentResponse::fromEntity)
                .collect(Collectors.toList());

        return DashboardSummaryResponse.builder()
                .totalServices(totalServices)
                .healthyServices(healthyServices)
                .totalDeployments(totalDeployments)
                .deploymentSuccessRate(Math.round(successRate * 10.0) / 10.0)
                .activeIncidents(activeIncidents.size())
                .criticalIncidents(criticalCount)
                .systemAvailability(99.94)
                .currentErrorRate(Math.round(avgErrorRate * 10.0) / 10.0)
                .averageLatencyMs(Math.round(avgLatency * 10.0) / 10.0)
                .p95LatencyMs(Math.round(avgLatency * 1.8 * 10.0) / 10.0)
                .cpuUtilization(42.5)
                .memoryUtilization(58.0)
                .deploymentFrequency("3.2 / day")
                .leadTimeForChanges("18 mins")
                .changeFailureRate(Math.round((100.0 - successRate) * 10.0) / 10.0)
                .meanTimeToRestore("14 mins")
                .activeIncidentList(activeList)
                .recentDeployments(recentDeployments)
                .build();
    }

    @Transactional
    public IncidentResponse simulateIncident(IncidentSimulationRequest request) {
        String serviceName = request.getServiceName() != null ? request.getServiceName() : "payment-service";
        ServiceEntity service = serviceRepository.findByName(serviceName)
                .orElseGet(() -> serviceRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("No service found for simulation")));

        // Mark service as degraded
        service.setHealthStatus(HealthStatus.DEGRADED);
        serviceRepository.save(service);

        // Record high latency and error snapshots
        MetricsSnapshot highLatencySnapshot = MetricsSnapshot.builder()
                .service(service)
                .latencyMs(2150.0)
                .errorRatePercent(14.2)
                .cpuUsagePercent(78.5)
                .memoryUsagePercent(82.0)
                .dbConnectionsUtilizationPercent(95.0)
                .capturedAt(Instant.now())
                .build();
        metricsSnapshotRepository.save(highLatencySnapshot);

        // Create the simulated incident
        Incident incident = Incident.builder()
                .service(service)
                .title(service.getName() + " database connection saturation and latency surge")
                .description("Simulated Incident: p99 latency increased to 2150ms. Error rate spiked to 14.2% following recent deployment. HikariCP connection pool saturated at 95%.")
                .severity(IncidentSeverity.HIGH)
                .status(IncidentStatus.INVESTIGATING)
                .createdBy("simulation-agent")
                .assignedTo("devops")
                .createdAt(Instant.now())
                .build();

        Incident saved = incidentRepository.save(incident);

        IncidentEvent event1 = IncidentEvent.builder()
                .incident(saved)
                .eventType("DEPLOYMENT")
                .description(service.getName() + " " + service.getCurrentVersion() + " deployed to production")
                .createdBy("Jenkins")
                .timestamp(Instant.now().minusSeconds(600))
                .build();
        incidentEventRepository.save(event1);

        IncidentEvent event2 = IncidentEvent.builder()
                .incident(saved)
                .eventType("ALERT_TRIGGERED")
                .description("HighLatencyAlert: response time > 2000ms")
                .createdBy("Alertmanager")
                .timestamp(Instant.now().minusSeconds(300))
                .build();
        incidentEventRepository.save(event2);

        return IncidentResponse.fromEntity(saved);
    }
}
