package com.opsmind.audit;

import com.opsmind.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "System and Security Audit Trail")
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    @Operation(summary = "Get recent audit events (last 100)")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getRecentLogs() {
        return ResponseEntity.ok(ApiResponse.success(auditService.getRecentAuditLogs()));
    }
}
