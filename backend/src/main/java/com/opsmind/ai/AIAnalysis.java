package com.opsmind.ai;

import com.opsmind.incident.Incident;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "ai_analyses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "incident_id", nullable = false)
    private Incident incident;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Column(name = "probable_root_cause", nullable = false, columnDefinition = "TEXT")
    private String probableRootCause;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String evidence;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String recommendations;

    @Column(name = "investigation_steps", columnDefinition = "TEXT")
    private String investigationSteps;

    @Column(nullable = false)
    @Builder.Default
    private Double confidence = 0.85;

    @Column(name = "risk_level", length = 30)
    @Builder.Default
    private String riskLevel = "HIGH";

    @Column(name = "model_name", length = 100)
    @Builder.Default
    private String modelName = "opsmind-ai-correlator-v1";

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
