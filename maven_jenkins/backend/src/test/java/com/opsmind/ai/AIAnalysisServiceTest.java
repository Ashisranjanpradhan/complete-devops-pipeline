package com.opsmind.ai;

import com.opsmind.audit.AuditService;
import com.opsmind.incident.Incident;
import com.opsmind.incident.IncidentRepository;
import com.opsmind.incident.IncidentSeverity;
import com.opsmind.incident.IncidentStatus;
import com.opsmind.service.HealthStatus;
import com.opsmind.service.ServiceEntity;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AIAnalysisServiceTest {

    @Mock
    private IncidentRepository incidentRepository;
    @Mock
    private AIAnalysisRepository aiAnalysisRepository;
    @Mock
    private AIContextBuilder aiContextBuilder;
    @Mock
    private AuditService auditService;

    @InjectMocks
    private AIAnalysisService aiAnalysisService;

    @Test
    void analyzeIncident_ShouldProduceEvidenceAndRecommendations() {
        ServiceEntity service = ServiceEntity.builder()
                .id(1L)
                .name("payment-service")
                .healthStatus(HealthStatus.DEGRADED)
                .build();

        Incident incident = Incident.builder()
                .id(100L)
                .service(service)
                .title("5xx error spike")
                .description("Error rate surged after release")
                .severity(IncidentSeverity.HIGH)
                .status(IncidentStatus.INVESTIGATING)
                .createdAt(Instant.now())
                .build();

        IncidentContext context = IncidentContext.builder()
                .incidentId(100L)
                .incidentTitle("5xx error spike")
                .serviceName("payment-service")
                .recentDeploymentVersion("v2.8.1")
                .minutesSinceLastDeployment(10L)
                .currentLatencyMs(2100.0)
                .currentErrorRatePercent(14.0)
                .currentDbConnectionUtilization(94.0)
                .currentCpuPercent(70.0)
                .recentEvents(List.of("Deployment completed", "High latency alert"))
                .build();

        when(incidentRepository.findById(100L)).thenReturn(Optional.of(incident));
        when(aiContextBuilder.buildContext(incident)).thenReturn(context);
        when(aiAnalysisRepository.save(any(AIAnalysis.class))).thenAnswer(invocation -> {
            AIAnalysis a = invocation.getArgument(0);
            a.setId(500L);
            return a;
        });

        AIAnalysisResponse response = aiAnalysisService.analyzeIncident(100L, "test-user");

        assertNotNull(response);
        assertNotNull(response.getProbableRootCause());
        assertFalse(response.getEvidence().isEmpty());
        assertFalse(response.getRemediationSuggestions().isEmpty());
        assertTrue(response.getConfidence() > 0.8);
        assertEquals("CRITICAL", response.getRiskLevel());
        verify(auditService, times(1)).log(any(), any(), any(), any());
    }
}
