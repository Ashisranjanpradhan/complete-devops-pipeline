package com.opsmind.service;

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
@RequestMapping("/api/v1/services")
@RequiredArgsConstructor
@Tag(name = "Services", description = "Service Catalog and Registry Management")
public class ServiceController {

    private final ServiceManagementService serviceManagementService;

    @GetMapping
    @Operation(summary = "Get all registered microservices")
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getAllServices() {
        return ResponseEntity.ok(ApiResponse.success(serviceManagementService.getAllServices()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get microservice by ID")
    public ResponseEntity<ApiResponse<ServiceResponse>> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(serviceManagementService.getServiceById(id)));
    }

    @PostMapping
    @Operation(summary = "Register a new service")
    public ResponseEntity<ApiResponse<ServiceResponse>> createService(@Valid @RequestBody ServiceRequest request) {
        return new ResponseEntity<>(
                ApiResponse.success(serviceManagementService.createService(request), "Service registered successfully"),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update service details")
    public ResponseEntity<ApiResponse<ServiceResponse>> updateService(
            @PathVariable Long id,
            @Valid @RequestBody ServiceRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(serviceManagementService.updateService(id, request), "Service updated successfully")
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete service (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable Long id) {
        serviceManagementService.deleteService(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Service deleted successfully"));
    }

    @PatchMapping("/{id}/health")
    @Operation(summary = "Update health status of a service")
    public ResponseEntity<ApiResponse<ServiceResponse>> updateHealthStatus(
            @PathVariable Long id,
            @RequestParam HealthStatus status) {
        return ResponseEntity.ok(
                ApiResponse.success(serviceManagementService.updateHealthStatus(id, status), "Health status updated")
        );
    }
}
