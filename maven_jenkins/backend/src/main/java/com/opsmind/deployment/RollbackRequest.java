package com.opsmind.deployment;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RollbackRequest {
    private String targetVersion;
    @NotBlank(message = "Reason for rollback is required")
    private String reason;
    private String operator;
}
