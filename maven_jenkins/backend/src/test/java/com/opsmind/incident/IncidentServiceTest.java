package com.opsmind.incident;

import com.opsmind.audit.AuditService;
import com.opsmind.service.HealthStatus;
import com.opsmind.service.ServiceEntity;
import com.opsmind.service.ServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncidentServiceTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private IncidentEventRepository incidentEventRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private IncidentService incidentService;

    private ServiceEntity service;

    @BeforeEach
    void setUp() {
        service = ServiceEntity.builder()
                .id(1L)
                .name("payment-service")
                .environment("production")
                .healthStatus(HealthStatus.HEALTHY)
                .build();
    }

    @Test
    void createIncident_ShouldCreateIncidentAndDegradeService() {
        IncidentRequest request = new IncidentRequest();
        request.setServiceId(1L);
        request.setTitle("High error rate");
        request.setDescription("5xx spike");
        request.setSeverity(IncidentSeverity.HIGH);
        request.setCreatedBy("admin");

        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> {
            Incident inc = invocation.getArgument(0);
            inc.setId(10L);
            return inc;
        });

        IncidentResponse response = incidentService.createIncident(request);

        assertNotNull(response);
        assertEquals("High error rate", response.getTitle());
        assertEquals(IncidentSeverity.HIGH, response.getSeverity());
        assertEquals(HealthStatus.DEGRADED, service.getHealthStatus());
        verify(incidentEventRepository, times(1)).save(any(IncidentEvent.class));
        verify(auditService, times(1)).log(any(), any(), any(), any());
    }

    @Test
    void updateIncidentStatus_WhenResolved_ShouldRestoreServiceHealth() {
        Incident incident = Incident.builder()
                .id(10L)
                .service(service)
                .title("High error rate")
                .status(IncidentStatus.INVESTIGATING)
                .createdAt(Instant.now())
                .build();

        when(incidentRepository.findById(10L)).thenReturn(Optional.of(incident));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IncidentStatusUpdateRequest updateRequest = new IncidentStatusUpdateRequest();
        updateRequest.setStatus(IncidentStatus.RESOLVED);
        updateRequest.setComment("Fixed pool leak");
        updateRequest.setUpdatedBy("devops");

        IncidentResponse response = incidentService.updateIncidentStatus(10L, updateRequest);

        assertNotNull(response);
        assertEquals(IncidentStatus.RESOLVED, response.getStatus());
        assertEquals(HealthStatus.HEALTHY, service.getHealthStatus());
        assertNotNull(incident.getResolvedAt());
        verify(incidentEventRepository, times(1)).save(any(IncidentEvent.class));
    }
}
