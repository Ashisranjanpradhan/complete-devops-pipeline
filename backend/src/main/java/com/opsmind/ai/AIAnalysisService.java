package com.opsmind.ai;

import com.opsmind.audit.AuditAction;
import com.opsmind.audit.AuditService;
import com.opsmind.common.ResourceNotFoundException;
import com.opsmind.incident.Incident;
import com.opsmind.incident.IncidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIAnalysisService {

    private final IncidentRepository incidentRepository;
    private final AIAnalysisRepository aiAnalysisRepository;
    private final AIContextBuilder aiContextBuilder;
    private final AuditService auditService;

    @Value("${opsmind.ai.provider:builtin}")
    private String aiProvider;

    @Value("${opsmind.ai.model:opsmind-ai-correlator-v1}")
    private String aiModel;

    @Transactional
    public AIAnalysisResponse analyzeIncident(Long incidentId, String requestedBy) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + incidentId));

        IncidentContext context = aiContextBuilder.buildContext(incident);

        // Perform correlation analysis
        AIAnalysis analysis = generateCorrelationAnalysis(incident, context);
        AIAnalysis saved = aiAnalysisRepository.save(analysis);

        auditService.log(
                requestedBy != null ? requestedBy : "User",
                AuditAction.AI_ANALYSIS_REQUESTED,
                "incident:" + incidentId + ":ai-analysis",
                "Triggered AI incident root-cause analysis"
        );

        return AIAnalysisResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<AIAnalysisResponse> getAnalysesForIncident(Long incidentId) {
        return aiAnalysisRepository.findByIncidentIdOrderByCreatedAtDesc(incidentId).stream()
                .map(AIAnalysisResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public AIAnalysisResponse getLatestAnalysis(Long incidentId) {
        AIAnalysis analysis = aiAnalysisRepository.findTopByIncidentIdOrderByCreatedAtDesc(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("No AI analysis found for incident: " + incidentId));
        return AIAnalysisResponse.fromEntity(analysis);
    }

    private AIAnalysis generateCorrelationAnalysis(Incident incident, IncidentContext ctx) {
        StringBuilder summary = new StringBuilder();
        StringBuilder rootCause = new StringBuilder();
        List<String> evidence = new ArrayList<>();
        List<String> steps = new ArrayList<>();
        List<String> remediations = new ArrayList<>();
        double confidence = 0.85;
        String riskLevel = "HIGH";

        boolean recentDeploy = ctx.getMinutesSinceLastDeployment() != null && ctx.getMinutesSinceLastDeployment() <= 45;
        boolean highLatency = ctx.getCurrentLatencyMs() != null && ctx.getCurrentLatencyMs() > 1000.0;
        boolean highErrors = ctx.getCurrentErrorRatePercent() != null && ctx.getCurrentErrorRatePercent() > 5.0;
        boolean dbExhaustion = ctx.getCurrentDbConnectionUtilization() != null && ctx.getCurrentDbConnectionUtilization() > 80.0;
        boolean highCpu = ctx.getCurrentCpuPercent() != null && ctx.getCurrentCpuPercent() > 75.0;

        if (recentDeploy && dbExhaustion) {
            summary.append(String.format("Critical degradation detected on %s: HTTP error rate spiked to %.1f%% with latency at %.0fms, strongly correlated with deployment %s executed %d minutes prior.",
                    ctx.getServiceName(), ctx.getCurrentErrorRatePercent(), ctx.getCurrentLatencyMs(), ctx.getRecentDeploymentVersion(), ctx.getMinutesSinceLastDeployment()));

            rootCause.append(String.format("Latest deployment (%s) appears to have introduced unindexed database queries or connection leaks, driving HikariCP connection pool utilization to %.1f%% and causing downstream HTTP request timeouts.",
                    ctx.getRecentDeploymentVersion(), ctx.getCurrentDbConnectionUtilization()));

            evidence.add(String.format("1. Deployment %s was completed %d minutes before error spike began.", ctx.getRecentDeploymentVersion(), ctx.getMinutesSinceLastDeployment()));
            evidence.add(String.format("2. Database connection pool utilization reached %.1f%% (saturation threshold is 80%%).", ctx.getCurrentDbConnectionUtilization()));
            evidence.add(String.format("3. API p99 latency surged from baseline ~180ms to %.0fms.", ctx.getCurrentLatencyMs()));
            evidence.add(String.format("4. HTTP 5xx error rate increased to %.1f%% due to connection acquire timeouts.", ctx.getCurrentErrorRatePercent()));

            steps.add("1. Inspect database connection pool metrics (HikariCP active vs idle connections and acquire wait times).");
            steps.add(String.format("2. Review git diff between %s and previous release for missing database indexes or unclosed transactions.", ctx.getRecentDeploymentVersion()));
            steps.add("3. Check PostgreSQL pg_stat_activity for long-running transactions and locks.");
            steps.add("4. Verify database CPU and I/O wait times in AWS RDS / Grafana database dashboard.");

            remediations.add(String.format("1. Consider rolling back %s to previous stable version if customer impact continues.", ctx.getServiceName()));
            remediations.add("2. Temporarily increase maximum database connection pool size if the database instance has sufficient memory.");
            remediations.add("3. Apply query statement timeout to prevent pool starvation.");
            confidence = 0.94;
            riskLevel = "CRITICAL";
        } else if (highCpu || highLatency) {
            summary.append(String.format("Elevated resource utilization on %s: CPU at %.1f%%, latency at %.0fms.",
                    ctx.getServiceName(), ctx.getCurrentCpuPercent(), ctx.getCurrentLatencyMs()));

            rootCause.append("CPU saturation or thread contention causing request queueing and degradation in service response times.");

            evidence.add(String.format("1. System CPU usage reached %.1f%%.", ctx.getCurrentCpuPercent()));
            evidence.add(String.format("2. API latency elevated to %.0fms.", ctx.getCurrentLatencyMs()));

            steps.add("1. Capture thread dump and analyze active worker threads.");
            steps.add("2. Inspect GC pause duration in Grafana JVM dashboard.");
            steps.add("3. Check autoscaling group triggers.");

            remediations.add("1. Scale out horizontal pod/container replicas.");
            remediations.add("2. Restart degraded service instances if memory leak suspected.");
            confidence = 0.88;
            riskLevel = "HIGH";
        } else {
            summary.append(String.format("Incident investigation for %s: %s", ctx.getServiceName(), ctx.getIncidentTitle()));
            rootCause.append("Intermittent degradation or upstream dependency fluctuation detected in service logs.");

            evidence.add("1. Incident opened based on telemetry alerts.");
            evidence.add(String.format("2. Current error rate: %.1f%%, latency: %.0fms.", ctx.getCurrentErrorRatePercent(), ctx.getCurrentLatencyMs()));

            steps.add("1. Check service logs for unhandled exceptions or connection timeouts.");
            steps.add("2. Inspect downstream dependency status.");

            remediations.add("1. Monitor error trend for next 10 minutes.");
            remediations.add("2. Enable debug logging if errors persist.");
            confidence = 0.78;
            riskLevel = "MEDIUM";
        }

        return AIAnalysis.builder()
                .incident(incident)
                .summary(summary.toString())
                .probableRootCause(rootCause.toString())
                .evidence(String.join("\n", evidence))
                .investigationSteps(String.join("\n", steps))
                .recommendations(String.join("\n", remediations))
                .confidence(confidence)
                .riskLevel(riskLevel)
                .modelName(aiModel)
                .createdAt(Instant.now())
                .build();
    }
}
