package com.opsmind.incident;

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
@RequestMapping("/api/v1/incidents")
@RequiredArgsConstructor
@Tag(name = "Incidents", description = "Incident Lifecycle Management")
public class IncidentController {

    private final IncidentService incidentService;

    @GetMapping
    @Operation(summary = "Get all incidents")
    public ResponseEntity<ApiResponse<List<IncidentResponse>>> getAllIncidents() {
        return ResponseEntity.ok(ApiResponse.success(incidentService.getAllIncidents()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get incident by ID")
    public ResponseEntity<ApiResponse<IncidentResponse>> getIncidentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(incidentService.getIncidentById(id)));
    }

    @GetMapping("/service/{serviceId}")
    @Operation(summary = "Get incidents for a specific service")
    public ResponseEntity<ApiResponse<List<IncidentResponse>>> getIncidentsByService(@PathVariable Long serviceId) {
        return ResponseEntity.ok(ApiResponse.success(incidentService.getIncidentsByService(serviceId)));
    }

    @PostMapping
    @Operation(summary = "Create a new incident")
    public ResponseEntity<ApiResponse<IncidentResponse>> createIncident(@Valid @RequestBody IncidentRequest request) {
        return new ResponseEntity<>(
                ApiResponse.success(incidentService.createIncident(request), "Incident created successfully"),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update incident status in lifecycle (OPEN -> ACKNOWLEDGED -> INVESTIGATING -> RESOLVED -> CLOSED)")
    public ResponseEntity<ApiResponse<IncidentResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody IncidentStatusUpdateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(incidentService.updateIncidentStatus(id, request), "Incident status updated")
        );
    }

    @PostMapping("/{id}/events")
    @Operation(summary = "Add an event or timeline update to an incident")
    public ResponseEntity<ApiResponse<IncidentEventResponse>> addEvent(
            @PathVariable Long id,
            @Valid @RequestBody IncidentEventRequest request) {
        return new ResponseEntity<>(
                ApiResponse.success(incidentService.addIncidentEvent(id, request), "Event added to incident"),
                HttpStatus.CREATED
        );
    }
}
