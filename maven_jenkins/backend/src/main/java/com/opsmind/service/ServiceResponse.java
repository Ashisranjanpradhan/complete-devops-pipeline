package com.opsmind.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceResponse {
    private Long id;
    private String name;
    private String description;
    private String repositoryUrl;
    private String environment;
    private String owner;
    private String currentVersion;
    private HealthStatus healthStatus;
    private Instant createdAt;
    private Instant updatedAt;

    public static ServiceResponse fromEntity(ServiceEntity entity) {
        return ServiceResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .repositoryUrl(entity.getRepositoryUrl())
                .environment(entity.getEnvironment())
                .owner(entity.getOwner())
                .currentVersion(entity.getCurrentVersion())
                .healthStatus(entity.getHealthStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
