package com.opsmind.monitoring;

import com.opsmind.common.ApiResponse;
import com.opsmind.incident.IncidentResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/metrics")
@RequiredArgsConstructor
@Tag(name = "Monitoring & Observability", description = "Metrics, Telemetry, and Incident Simulation")
public class MonitoringController {

    private final MonitoringService monitoringService;

    @GetMapping("/live")
    @Operation(summary = "Get live JVM and application telemetry")
    public ResponseEntity<ApiResponse<SystemMetricsResponse>> getLiveMetrics() {
        return ResponseEntity.ok(ApiResponse.success(monitoringService.getLiveSystemMetrics()));
    }

    @GetMapping("/snapshots")
    @Operation(summary = "Get recent metrics snapshots (optional serviceId filter)")
    public ResponseEntity<ApiResponse<List<MetricsSnapshotResponse>>> getSnapshots(
            @RequestParam(required = false) Long serviceId) {
        return ResponseEntity.ok(ApiResponse.success(monitoringService.getRecentSnapshots(serviceId)));
    }

    @PostMapping("/snapshots")
    @Operation(summary = "Record a new metrics snapshot")
    public ResponseEntity<ApiResponse<MetricsSnapshotResponse>> recordSnapshot(
            @Valid @RequestBody MetricsSnapshotRequest request) {
        return new ResponseEntity<>(
                ApiResponse.success(monitoringService.recordSnapshot(request), "Snapshot recorded"),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/simulate-incident")
    @Operation(summary = "Simulate an application incident with elevated latency and error rate")
    public ResponseEntity<ApiResponse<IncidentResponse>> simulateIncident(
            @RequestBody(required = false) IncidentSimulationRequest request) {
        IncidentSimulationRequest req = request != null ? request : new IncidentSimulationRequest();
        return ResponseEntity.ok(
                ApiResponse.success(monitoringService.simulateIncident(req), "Incident simulated successfully")
        );
    }
}
