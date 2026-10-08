package com.opsmind.service;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "repository_url", length = 255)
    private String repositoryUrl;

    @Column(nullable = false, length = 50)
    private String environment;

    @Column(length = 100)
    private String owner;

    @Column(name = "current_version", length = 50)
    private String currentVersion;

    @Enumerated(EnumType.STRING)
    @Column(name = "health_status", nullable = false, length = 30)
    @Builder.Default
    private HealthStatus healthStatus = HealthStatus.HEALTHY;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
