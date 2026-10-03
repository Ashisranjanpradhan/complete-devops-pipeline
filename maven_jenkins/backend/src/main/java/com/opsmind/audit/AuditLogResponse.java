package com.opsmind.audit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private String username;
    private AuditAction action;
    private String resource;
    private String details;
    private String ipAddress;
    private Instant timestamp;

    public static AuditLogResponse fromEntity(AuditLog entity) {
        return AuditLogResponse.builder()
                .id(entity.getId())
                .username(entity.getUsername())
                .action(entity.getAction())
                .resource(entity.getResource())
                .details(entity.getDetails())
                .ipAddress(entity.getIpAddress())
                .timestamp(entity.getTimestamp())
                .build();
    }
}
