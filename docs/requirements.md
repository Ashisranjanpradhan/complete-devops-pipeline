# OpsMind AI — System Requirements

## 1. Functional Requirements

### 1.1 Authentication & Authorization
- **User Registration & Login:** Support secure self-registration and credential-based login.
- **Role-Based Access Control (RBAC):**
  - `ROLE_ADMIN`: Full system access, user administration, tenant configuration.
  - `ROLE_DEVOPS_ENGINEER`: Deployment execution, rollback, infrastructure triggers, incident remediation.
  - `ROLE_DEVELOPER`: Service registry management, deployment observation, incident filing and analysis.
  - `ROLE_VIEWER`: Read-only access to metrics, dashboards, and audit summaries.
- **Token Management:** Stateless JWT token issuance with configurable TTL and secret key verification.

### 1.2 Service Registry
- Maintain microservice catalog with attributes: `name`, `description`, `repository_url`, `environment`, `owner`, `current_version`, `health_status`.
- Automatic health state transitions (`HEALTHY`, `DEGRADED`, `DOWN`).

### 1.3 Deployment Tracking
- Track deployment lifecycle stages: `QUEUED`, `BUILDING`, `TESTING`, `DEPLOYING`, `SUCCESS`, `FAILED`, `ROLLED_BACK`.
- Store commit hash, operator/tool (`Jenkins`, `Operator`), start/completion timestamps.
- Support 1-click rollback: mark failing release as `ROLLED_BACK` and automatically redeploy the last stable version.

### 1.4 Incident Management & Audit
- Lifecycle stages: `OPEN` -> `ACKNOWLEDGED` -> `INVESTIGATING` -> `RESOLVED` -> `CLOSED`.
- Severity classification: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- Append-only incident timeline events (`CREATED`, `DEPLOYMENT`, `ALERT_TRIGGERED`, `STATUS_CHANGE`).
- Comprehensive audit trail recording user, action, affected resource, and timestamp.

### 1.5 AI Incident Root-Cause Analysis
- Correlate incidents with recent deployments (within 45-minute window), error rate spikes, latency surges, and HikariCP connection pool saturation.
- Generate structured intelligence:
  - Incident summary
  - Probable root cause
  - Supporting evidence
  - Recommended investigation steps
  - Recommended remediation actions
  - Confidence score (0.0 to 1.0) and Risk level
- Non-destructive execution policy: AI outputs recommendations for human review rather than executing unverified actions.

---

## 2. Non-Functional Requirements

- **Performance:** REST API p99 latency < 200ms under normal load.
- **Scalability:** Horizontal container scaling with stateless backend design and connection pooling.
- **Availability:** Auto-healing health checks via Spring Boot Actuator (`/actuator/health`).
- **Observability:** Metrics exposition through Micrometer and Prometheus (`/actuator/prometheus`).
- **Security:** Password hashing using BCrypt (cost factor 10), HTTPS/TLS in production, SQL injection protection via Hibernate parameterized queries.
- **Data Integrity:** Flyway managed relational schema migrations with baseline support.
