# AI Operations Assistant & Correlation Engine — OpsMind AI

## 1. Architectural Philosophy: Deterministic Signals Before AI

OpsMind AI does **not** rely on raw unconstrained LLM hallucinations for root cause detection.

We enforce a two-stage investigative pipeline:

```text
Telemetry & Logs
       ↓
Deterministic Statistical Engine (Rule Evaluation)
  - Time elapsed since last release (< 45 min)
  - Latency deviation from baseline (> 1000 ms)
  - HTTP 5xx surge (> 5.0%)
  - Connection pool saturation (> 80%)
       ↓
Evidence Context Package (IncidentContext)
       ↓
AI Analysis Provider (Structured Prompt + Few-Shot Exemplars)
       ↓
Validated Structured JSON Response Contract
       ↓
Advisory Presentation to On-Call SRE
```

---

## 2. Structured Output Contract (Section 21)

Every AI response adheres to a strict JSON schema:

```json
{
  "summary": "High latency and 5xx errors on payment-service strongly correlated with deployment v2.8.1.",
  "probableRootCause": "Database connection pool saturation caused by unindexed queries introduced in v2.8.1.",
  "confidence": 0.94,
  "evidence": [
    "Deployment v2.8.1 completed 21 minutes prior to latency spike.",
    "Database connection pool saturation reached 94.0%.",
    "API p99 latency surged from 180ms to 2100ms.",
    "HTTP 5xx errors increased to 14.1%."
  ],
  "investigationSteps": [
    "Inspect active queries in pg_stat_activity.",
    "Compare git diff between v2.8.0 and v2.8.1 for transaction leaks.",
    "Inspect HikariCP connection wait times."
  ],
  "remediationSuggestions": [
    "Authorize controlled rollback to previous stable release v2.8.0.",
    "Temporarily increase maximum connection pool size if memory permits."
  ]
}
```

---

## 3. Safety Guardrails (Section 22)

- **Advisory-Only:** All AI suggestions are strictly advisory.
- **No Direct Shell Execution:** The AI model is physically decoupled from shell and execution layers.
- **Human-In-The-Loop:** Remediation workflows (such as Rollback) require explicit operator authorization via RBAC credentials.

---

## 4. Evaluation Benchmark Suite (Section 24)

OpsMind includes an automated evaluation benchmark located in `ai/evaluation/incident-evaluation.json` and `ai/evaluation/evaluate_ai.py`.

Key Benchmark Targets:
- **Root-Cause Accuracy:** > 92% across standard incident archetypes.
- **Hallucination Rate:** 0.0% through deterministic ground-truth anchoring.
- **Average Response Latency:** < 2.0 seconds.
