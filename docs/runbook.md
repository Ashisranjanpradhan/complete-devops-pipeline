# SRE Operational Runbooks — OpsMind AI

This directory contains standardized incident response runbooks for on-call engineers managing the OpsMind AI platform.

---

## Runbook Index

1. [RUNBOOK-01: Database Connection Pool Saturation (HikariCP)](#runbook-01-database-connection-pool-saturation)
2. [RUNBOOK-02: HTTP 5xx High Error Rate Spikes](#runbook-02-http-5xx-high-error-rate-spikes)
3. [RUNBOOK-03: Failed CI/CD Deployment & Controlled Rollback](#runbook-03-failed-cicd-deployment--controlled-rollback)

---

### RUNBOOK-01: Database Connection Pool Saturation

- **Symptoms:** API response latency surges > 2000ms, HTTP 500 errors spike, HikariCP pool utilization > 90%.
- **Impact:** Critical degradation on billing, checkout, and webhook ingestion.
- **Detection:** Prometheus alert `DatabaseConnectionPoolExhaustion` fires.

#### Immediate Checks
1. Check active database connections in Grafana Database Dashboard.
2. Query active queries in PostgreSQL:
   ```sql
   SELECT pid, age(clock_timestamp(), query_start), usename, query, state 
   FROM pg_stat_activity 
   WHERE state != 'idle' 
   ORDER BY query_start ASC LIMIT 10;
   ```
3. Check time of last deployment:
   ```bash
   curl -s http://localhost:8080/api/v1/deployments | jq '.[0]'
   ```

#### Mitigation & Rollback
1. If correlated with a recent release (< 45 minutes), trigger an immediate rollback:
   - Navigate to **Deployments** or **Incident Details**.
   - Click **Execute Rollback**.
   - Input justification and confirm.
2. If database CPU is spiking due to a locked transaction, terminate the blocking query:
   ```sql
   SELECT pg_terminate_backend(<pid>);
   ```

#### Verification
- Confirm HikariCP pool saturation drops below 60%.
- Verify p95 response time returns to < 200ms.
- Mark incident as **RESOLVED**.

---

### RUNBOOK-02: HTTP 5xx High Error Rate Spikes

- **Symptoms:** HTTP 500 / 502 error percentage exceeds 5% of total request traffic.
- **Impact:** User requests fail; customer drop-off.
- **Detection:** Alert `HighErrorRateAlert` triggers.

#### Immediate Checks
1. Review recent application logs:
   ```bash
   docker compose logs --tail=100 -f backend
   ```
2. Open OpsMind Incident Assistant:
   - Navigate to `/incidents/:id`.
   - Click **Analyze Incident with AI**.
   - Review correlated evidence bullets.

#### Mitigation
1. Inspect if an external payment gateway or dependency is down.
2. If internal regression, initiate rollback to known-good image.
3. Once error rate drops below 0.5%, mark incident as resolved.

---

### RUNBOOK-03: Failed CI/CD Deployment & Controlled Rollback

- **Symptoms:** Jenkins pipeline build fails during health check or smoke test phase.
- **Impact:** New release stopped; cluster may have intermediate state.

#### Action
1. Inspect Jenkins pipeline console log for failed stage.
2. If deployment stage already swapped traffic, execute automated rollback:
   ```bash
   ./jenkins/scripts/deploy.sh rollback
   ```
3. Run smoke test suite:
   ```bash
   make smoke-test
   ```
