# Postmortem: PM-001 Payment API Latency Spike & Connection Pool Saturation

- **Date:** October 8, 2026
- **Status:** Resolved
- **Severity:** SEV-1 (Critical)
- **Incident Lead:** On-Call SRE (devops)
- **Affected Services:** `payment-service`

---

## 1. Incident Summary

At 10:25 UTC, deployment `v2.8.1` of `payment-service` was released to production via Jenkins pipeline #142. Within 4 minutes, database connection pool utilization in HikariCP surged from 55% to 94%. By 10:32 UTC, p99 latency surged from 180ms to 2.1s, and HTTP 5xx error rates climbed to 14.1% due to connection acquisition timeouts.

OpsMind AI correlated the error spike with release `v2.8.1` with 94% confidence. At 10:46 UTC, on-call engineers reviewed the AI-correlated evidence, approved an automated controlled rollback to `v2.8.0`, and restored normal operations by 10:50 UTC.

---

## 2. Impact

- **Duration:** 25 minutes (10:25 UTC – 10:50 UTC)
- **User Impact:** ~1,400 checkout transactions failed with HTTP 504 / 500 error codes.
- **Financial Impact:** Estimated $12,500 in delayed transaction volume, recovered following rollback.

---

## 3. Timeline (UTC)

- **10:25:** Jenkins pipeline #142 completes deployment of `v2.8.1`.
- **10:29:** HikariCP active connection pool exceeds 80% saturation threshold.
- **10:31:** Prometheus `HighLatencyAlert` triggers (p99 > 2000ms).
- **10:32:** Prometheus `HighErrorRateAlert` triggers (5xx > 5%); SEV-1 incident automatically created in OpsMind.
- **10:36:** On-call SRE acknowledges incident and clicks **Analyze Incident with AI** in OpsMind console.
- **10:37:** OpsMind AI identifies connection pool saturation correlated with `v2.8.1` with 94% confidence.
- **10:44:** Engineer authorizes controlled rollback to `v2.8.0`.
- **10:48:** Release `v2.8.0` deployed and passes health check.
- **10:50:** DB connection pool drops back to 54%; latency normalizes to 180ms; incident marked **RESOLVED**.

---

## 4. Root Cause & Contributing Factors

- **Root Cause:** Release `v2.8.1` included a new payment auditing query executed on every transaction that lacked a compound index on `(created_at, status)`, triggering sequential table scans in PostgreSQL and holding open connections for over 800ms.
- **Contributing Factor:** Staging integration tests ran against a smaller test dataset where the sequential scan took under 10ms, hiding the performance regression prior to production release.

---

## 5. What Went Well

- OpsMind AI autonomous correlation detected the deployment-to-metric connection within 1.2 seconds of analysis request.
- The controlled rollback workflow completed in under 4 minutes without manual database modifications.
- Complete audit trail of operator authorization and deployment events was preserved.

---

## 6. What Went Wrong

- Staging performance tests did not simulate production table cardinality.
- Pre-deployment risk score was calculated at 78/100 (HIGH), but no mandatory human approval gate was enabled for that pipeline run.

---

## 7. Action Items

| Action Item | Type | Owner | Due Date | Status |
|---|---|---|---|---|
| Enforce mandatory approval gate on Jenkins releases with Risk Score > 70 | Prevention | DevOps Lead | Oct 10, 2026 | Done |
| Add composite index on `audit_logs(created_at, status)` via Flyway V3 | Remediation | Database Lead | Oct 09, 2026 | Done |
| Add synthetic database query latency check to post-deploy smoke tests | Detection | SRE Team | Oct 11, 2026 | Done |
