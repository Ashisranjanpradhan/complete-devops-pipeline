package com.opsmind.deployment;

import com.opsmind.service.ServiceEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "deployments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Deployment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity service;

    @Column(nullable = false, length = 50)
    private String version;

    @Column(name = "commit_hash", length = 40)
    private String commitHash;

    @Column(nullable = false, length = 50)
    private String environment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private DeploymentStatus status = DeploymentStatus.QUEUED;

    @Column(name = "triggered_by", length = 100)
    private String triggeredBy;

    @Builder.Default
    @Column(name = "started_at", nullable = false)
    private Instant startedAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "rollback_of_id")
    private Long rollbackOfId;
}
