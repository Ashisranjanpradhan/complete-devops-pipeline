package com.opsmind.deployment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeploymentResponse {
    private Long id;
    private Long serviceId;
    private String serviceName;
    private String version;
    private String commitHash;
    private String environment;
    private DeploymentStatus status;
    private String triggeredBy;
    private Instant startedAt;
    private Instant completedAt;
    private Long rollbackOfId;

    public static DeploymentResponse fromEntity(Deployment entity) {
        return DeploymentResponse.builder()
                .id(entity.getId())
                .serviceId(entity.getService().getId())
                .serviceName(entity.getService().getName())
                .version(entity.getVersion())
                .commitHash(entity.getCommitHash())
                .environment(entity.getEnvironment())
                .status(entity.getStatus())
                .triggeredBy(entity.getTriggeredBy())
                .startedAt(entity.getStartedAt())
                .completedAt(entity.getCompletedAt())
                .rollbackOfId(entity.getRollbackOfId())
                .build();
    }
}
