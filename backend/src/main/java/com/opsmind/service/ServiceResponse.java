package com.opsmind.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

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
    private List<String> dependencies;
    private Instant createdAt;
    private Instant updatedAt;

    public static ServiceResponse fromEntity(ServiceEntity entity) {
        return fromEntity(entity, resolveDependencies(entity.getName()));
    }

    public static ServiceResponse fromEntity(ServiceEntity entity, List<String> dependencies) {
        return ServiceResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .repositoryUrl(entity.getRepositoryUrl())
                .environment(entity.getEnvironment())
                .owner(entity.getOwner())
                .currentVersion(entity.getCurrentVersion())
                .healthStatus(entity.getHealthStatus())
                .dependencies(dependencies != null ? dependencies : resolveDependencies(entity.getName()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static List<String> resolveDependencies(String serviceName) {
        if (serviceName == null) return Collections.emptyList();
        return switch (serviceName) {
            case "payment-service" -> List.of("payment-db", "fraud-detection-service", "notification-service");
            case "order-service" -> List.of("payment-service", "inventory-service", "notification-service");
            case "inventory-service" -> List.of("inventory-db", "shipping-service");
            case "shipping-service" -> List.of("carrier-api", "notification-service");
            case "auth-service" -> List.of("auth-db", "redis-cache");
            default -> List.of("postgres-db", "internal-gateway");
        };
    }
}
