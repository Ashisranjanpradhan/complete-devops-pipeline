package com.opsmind.incident;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentResponse {
    private Long id;
    private Long serviceId;
    private String serviceName;
    private String title;
    private String description;
    private IncidentSeverity severity;
    private IncidentStatus status;
    private String createdBy;
    private String assignedTo;
    private Instant createdAt;
    private Instant resolvedAt;
    @Builder.Default
    private List<IncidentEventResponse> events = new ArrayList<>();

    public static IncidentResponse fromEntity(Incident entity) {
        List<IncidentEventResponse> eventResponses = entity.getEvents() != null ?
                entity.getEvents().stream().map(IncidentEventResponse::fromEntity).collect(Collectors.toList()) :
                new ArrayList<>();

        return IncidentResponse.builder()
                .id(entity.getId())
                .serviceId(entity.getService().getId())
                .serviceName(entity.getService().getName())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .severity(entity.getSeverity())
                .status(entity.getStatus())
                .createdBy(entity.getCreatedBy())
                .assignedTo(entity.getAssignedTo())
                .createdAt(entity.getCreatedAt())
                .resolvedAt(entity.getResolvedAt())
                .events(eventResponses)
                .build();
    }
}
