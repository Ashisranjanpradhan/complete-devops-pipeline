package com.opsmind.monitoring;

import com.opsmind.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Operations Overview and DORA Metrics")
public class DashboardController {

    private final MonitoringService monitoringService;

    @GetMapping("/summary")
    @Operation(summary = "Get high-level operations dashboard summary and DORA metrics")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(monitoringService.getDashboardSummary()));
    }
}
