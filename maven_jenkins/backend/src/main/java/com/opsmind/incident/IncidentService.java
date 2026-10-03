package com.opsmind.incident;

import com.opsmind.audit.AuditAction;
import com.opsmind.audit.AuditService;
import com.opsmind.common.ResourceNotFoundException;
import com.opsmind.service.HealthStatus;
import com.opsmind.service.ServiceEntity;
import com.opsmind.service.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final IncidentEventRepository incidentEventRepository;
    private final ServiceRepository serviceRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<IncidentResponse> getAllIncidents() {
        return incidentRepository.findByOrderByCreatedAtDesc().stream()
                .map(IncidentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public IncidentResponse getIncidentById(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + id));
        return IncidentResponse.fromEntity(incident);
    }

    @Transactional(readOnly = true)
    public List<IncidentResponse> getIncidentsByService(Long serviceId) {
        return incidentRepository.findByServiceIdOrderByCreatedAtDesc(serviceId).stream()
                .map(IncidentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public IncidentResponse createIncident(IncidentRequest request) {
        ServiceEntity service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + request.getServiceId()));

        Incident incident = Incident.builder()
                .service(service)
                .title(request.getTitle())
                .description(request.getDescription())
                .severity(request.getSeverity() != null ? request.getSeverity() : IncidentSeverity.MEDIUM)
                .status(request.getStatus() != null ? request.getStatus() : IncidentStatus.OPEN)
                .createdBy(request.getCreatedBy() != null ? request.getCreatedBy() : "Monitor")
                .assignedTo(request.getAssignedTo())
                .createdAt(Instant.now())
                .build();

        Incident saved = incidentRepository.save(incident);

        // Add initial creation timeline event
        IncidentEvent event = IncidentEvent.builder()
                .incident(saved)
                .eventType("CREATED")
                .description("Incident opened: " + saved.getTitle())
                .createdBy(saved.getCreatedBy())
                .timestamp(Instant.now())
                .build();
        incidentEventRepository.save(event);

        // Degrade service health status
        service.setHealthStatus(saved.getSeverity() == IncidentSeverity.CRITICAL ? HealthStatus.DOWN : HealthStatus.DEGRADED);
        serviceRepository.save(service);

        auditService.log(
                saved.getCreatedBy(),
                AuditAction.INCIDENT_CREATED,
                "incident:" + saved.getId(),
                "Incident opened: " + saved.getTitle() + " (Severity: " + saved.getSeverity() + ")"
        );

        return IncidentResponse.fromEntity(saved);
    }

    @Transactional
    public IncidentResponse updateIncidentStatus(Long id, IncidentStatusUpdateRequest request) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + id));

        IncidentStatus oldStatus = incident.getStatus();
        incident.setStatus(request.getStatus());

        if (request.getStatus() == IncidentStatus.RESOLVED || request.getStatus() == IncidentStatus.CLOSED) {
            incident.setResolvedAt(Instant.now());
            // Restore service health if no other open incidents
            ServiceEntity service = incident.getService();
            service.setHealthStatus(HealthStatus.HEALTHY);
            serviceRepository.save(service);
        }

        Incident updated = incidentRepository.save(incident);

        // Add status change event to timeline
        String desc = "Status changed from " + oldStatus + " to " + request.getStatus();
        if (request.getComment() != null && !request.getComment().isBlank()) {
            desc += " - " + request.getComment();
        }

        IncidentEvent event = IncidentEvent.builder()
                .incident(updated)
                .eventType("STATUS_CHANGE")
                .description(desc)
                .createdBy(request.getUpdatedBy() != null ? request.getUpdatedBy() : "Operator")
                .timestamp(Instant.now())
                .build();
        incidentEventRepository.save(event);

        auditService.log(
                request.getUpdatedBy() != null ? request.getUpdatedBy() : "Operator",
                AuditAction.INCIDENT_UPDATED,
                "incident:" + updated.getId(),
                desc
        );

        return IncidentResponse.fromEntity(updated);
    }

    @Transactional
    public IncidentEventResponse addIncidentEvent(Long incidentId, IncidentEventRequest request) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + incidentId));

        IncidentEvent event = IncidentEvent.builder()
                .incident(incident)
                .eventType(request.getEventType())
                .description(request.getDescription())
                .createdBy(request.getCreatedBy() != null ? request.getCreatedBy() : "Operator")
                .timestamp(Instant.now())
                .build();

        return IncidentEventResponse.fromEntity(incidentEventRepository.save(event));
    }
}
