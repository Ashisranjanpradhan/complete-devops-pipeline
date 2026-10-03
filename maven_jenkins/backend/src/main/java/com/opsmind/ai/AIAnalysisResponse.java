package com.opsmind.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIAnalysisResponse {
    private Long id;
    private Long incidentId;
    private String summary;
    private String probableRootCause;
    private List<String> evidence;
    private List<String> investigationSteps;
    private List<String> remediationSuggestions;
    private Double confidence;
    private String riskLevel;
    private String modelName;
    private Instant createdAt;

    public static AIAnalysisResponse fromEntity(AIAnalysis entity) {
        List<String> evidenceList = parseList(entity.getEvidence());
        List<String> stepsList = parseList(entity.getInvestigationSteps());
        List<String> recList = parseList(entity.getRecommendations());

        return AIAnalysisResponse.builder()
                .id(entity.getId())
                .incidentId(entity.getIncident().getId())
                .summary(entity.getSummary())
                .probableRootCause(entity.getProbableRootCause())
                .evidence(evidenceList)
                .investigationSteps(stepsList)
                .remediationSuggestions(recList)
                .confidence(entity.getConfidence())
                .riskLevel(entity.getRiskLevel())
                .modelName(entity.getModelName())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private static List<String> parseList(String raw) {
        if (raw == null || raw.isBlank()) return List.of();
        // Split by newline or delimiter if stored as bullet points or lines
        return Arrays.stream(raw.split("\n"))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(s -> s.replaceFirst("^[-*\\d.]+\\s*", ""))
                .collect(Collectors.toList());
    }
}
