package com.opsmind.deployment;

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
public class DeploymentRequest {
    @NotNull(message = "Service ID is required")
    private Long serviceId;

    @NotBlank(message = "Version is required")
    private String version;

    private String commitHash;

    @Builder.Default
    private String environment = "production";

    @Builder.Default
    private DeploymentStatus status = DeploymentStatus.DEPLOYING;

    private String triggeredBy;
}
