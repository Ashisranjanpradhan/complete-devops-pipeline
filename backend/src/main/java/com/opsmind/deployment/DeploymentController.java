package com.opsmind.deployment;

import com.opsmind.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/deployments")
@RequiredArgsConstructor
@Tag(name = "Deployments", description = "Deployment Tracking and Rollback Management")
public class DeploymentController {

    private final DeploymentService deploymentService;

    @GetMapping
    @Operation(summary = "Get all deployment records")
    public ResponseEntity<ApiResponse<List<DeploymentResponse>>> getAllDeployments() {
        return ResponseEntity.ok(ApiResponse.success(deploymentService.getAllDeployments()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get deployment by ID")
    public ResponseEntity<ApiResponse<DeploymentResponse>> getDeploymentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(deploymentService.getDeploymentById(id)));
    }

    @GetMapping("/service/{serviceId}")
    @Operation(summary = "Get deployments for a specific service")
    public ResponseEntity<ApiResponse<List<DeploymentResponse>>> getDeploymentsByService(@PathVariable Long serviceId) {
        return ResponseEntity.ok(ApiResponse.success(deploymentService.getDeploymentsByService(serviceId)));
    }

    @PostMapping
    @Operation(summary = "Record a new deployment")
    public ResponseEntity<ApiResponse<DeploymentResponse>> recordDeployment(@Valid @RequestBody DeploymentRequest request) {
        return new ResponseEntity<>(
                ApiResponse.success(deploymentService.recordDeployment(request), "Deployment recorded successfully"),
                HttpStatus.CREATED
        );
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update deployment status (e.g. from CI/CD pipeline)")
    public ResponseEntity<ApiResponse<DeploymentResponse>> updateDeploymentStatus(
            @PathVariable Long id,
            @RequestParam DeploymentStatus status) {
        return ResponseEntity.ok(
                ApiResponse.success(deploymentService.updateDeploymentStatus(id, status), "Deployment status updated")
        );
    }

    @PostMapping("/{id}/rollback")
    @Operation(summary = "Trigger a controlled rollback to previous stable version")
    public ResponseEntity<ApiResponse<DeploymentResponse>> rollbackDeployment(
            @PathVariable Long id,
            @Valid @RequestBody RollbackRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(deploymentService.rollbackDeployment(id, request), "Rollback initiated successfully")
        );
    }
}
