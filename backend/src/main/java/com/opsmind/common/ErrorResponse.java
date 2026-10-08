package com.opsmind.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private boolean success;
    private String code;
    private String message;
    private Map<String, String> errors;
    @Builder.Default
    private Instant timestamp = Instant.now();
    @Builder.Default
    private String traceId = UUID.randomUUID().toString().substring(0, 8);
}
