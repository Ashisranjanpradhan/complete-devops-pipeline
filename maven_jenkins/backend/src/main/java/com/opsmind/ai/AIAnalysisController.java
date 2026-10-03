package com.opsmind.ai;

import com.opsmind.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/incidents/{incidentId}/ai-analysis")
@RequiredArgsConstructor
@Tag(name = "AI Incident Analysis", description = "AI-assisted incident root-cause analysis and remediation suggestions")
public class AIAnalysisController {

    private final AIAnalysisService aiAnalysisService;

    @PostMapping
    @Operation(summary = "Trigger AI-assisted incident analysis and root-cause correlation")
    public ResponseEntity<ApiResponse<AIAnalysisResponse>> runAnalysis(
            @PathVariable Long incidentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "anonymous";
        AIAnalysisResponse response = aiAnalysisService.analyzeIncident(incidentId, username);
        return new ResponseEntity<>(
                ApiResponse.success(response, "AI analysis generated successfully"),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    @Operation(summary = "Get historical AI analyses for this incident")
    public ResponseEntity<ApiResponse<List<AIAnalysisResponse>>> getAnalyses(@PathVariable Long incidentId) {
        return ResponseEntity.ok(ApiResponse.success(aiAnalysisService.getAnalysesForIncident(incidentId)));
    }

    @GetMapping("/latest")
    @Operation(summary = "Get latest AI analysis for this incident")
    public ResponseEntity<ApiResponse<AIAnalysisResponse>> getLatestAnalysis(@PathVariable Long incidentId) {
        return ResponseEntity.ok(ApiResponse.success(aiAnalysisService.getLatestAnalysis(incidentId)));
    }
}
