package com.opsmind.service;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceRequest {
    @NotBlank(message = "Service name is required")
    private String name;

    private String description;
    private String repositoryUrl;

    @Builder.Default
    private String environment = "production";

    private String owner;
    private String currentVersion;
    private HealthStatus healthStatus;
}
