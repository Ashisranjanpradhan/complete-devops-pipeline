package com.opsmind.incident;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentEventResponse {
    private Long id;
    private Long incidentId;
    private String eventType;
    private String description;
    private String createdBy;
    private Instant timestamp;

    public static IncidentEventResponse fromEntity(IncidentEvent entity) {
        return IncidentEventResponse.builder()
                .id(entity.getId())
                .incidentId(entity.getIncident().getId())
                .eventType(entity.getEventType())
                .description(entity.getDescription())
                .createdBy(entity.getCreatedBy())
                .timestamp(entity.getTimestamp())
                .build();
    }
}
