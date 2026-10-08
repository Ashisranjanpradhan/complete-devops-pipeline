package com.opsmind.incident;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentEventRequest {
    @NotBlank(message = "Event type is required")
    private String eventType;

    @NotBlank(message = "Description is required")
    private String description;

    private String createdBy;
}
