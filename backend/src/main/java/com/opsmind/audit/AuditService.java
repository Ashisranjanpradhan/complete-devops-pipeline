package com.opsmind.audit;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void log(String username, AuditAction action, String resource, String details) {
        log(username, action, resource, details, "127.0.0.1");
    }

    @Transactional
    public void log(String username, AuditAction action, String resource, String details, String ipAddress) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .username(username != null ? username : "anonymous")
                    .action(action)
                    .resource(resource)
                    .details(details)
                    .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                    .timestamp(Instant.now())
                    .build();
            auditLogRepository.save(auditLog);
            log.info("[AUDIT] User: {} | Action: {} | Resource: {} | Details: {}", username, action, resource, details);
        } catch (Exception e) {
            log.error("Failed to write audit log: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getRecentAuditLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc().stream()
                .map(AuditLogResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
