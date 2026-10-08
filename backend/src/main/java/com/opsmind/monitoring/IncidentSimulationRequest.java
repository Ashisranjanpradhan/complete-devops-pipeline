package com.opsmind.monitoring;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentSimulationRequest {
    @Builder.Default
    private String serviceName = "payment-service";
    @Builder.Default
    private String scenario = "DB_LATENCY_EXHAUSTION"; // DB_LATENCY_EXHAUSTION, MEMORY_LEAK, BAD_DEPLOYMENT
}
