package com.opsmind.incident;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentRequest {
    @NotNull(message = "Service ID is required")
    private Long serviceId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @Builder.Default
    private IncidentSeverity severity = IncidentSeverity.MEDIUM;

    @Builder.Default
    private IncidentStatus status = IncidentStatus.OPEN;

    private String createdBy;
    private String assignedTo;
}
