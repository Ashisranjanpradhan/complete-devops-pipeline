# OpsMind AI — REST API Reference

Interactive API documentation and OpenAPI 3 schema are available when the backend is running at:
- **Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON:** `http://localhost:8080/api-docs`

---

## 1. Authentication Endpoints

### Register User
- **POST** `/api/auth/register`
- **Request Body:**
```json
{
  "username": "developer",
  "email": "dev@company.com",
  "password": "password123",
  "fullName": "Software Engineer"
}
```
- **Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "username": "developer",
  "email": "dev@company.com",
  "roles": ["ROLE_DEVELOPER"]
}
```

### Login User
- **POST** `/api/auth/login`
- **Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```
- **Response (200 OK):** JWT token and user role profile.

### Current User Profile
- **GET** `/api/auth/me`
- **Headers:** `Authorization: Bearer <TOKEN>`

---

## 2. Service Management Endpoints

- **GET** `/api/services` — List all registered microservices.
- **GET** `/api/services/{id}` — Get single service by ID.
- **POST** `/api/services` — Register new microservice.
```json
{
  "name": "payment-service",
  "description": "Payment transactions",
  "repositoryUrl": "https://github.com/company/payment-service",
  "environment": "production",
  "owner": "payments-team",
  "currentVersion": "v2.8.1"
}
```
- **PUT** `/api/services/{id}` — Update existing service details.
- **DELETE** `/api/services/{id}` — Remove service (Admin only).

---

## 3. Deployment Management Endpoints

- **GET** `/api/deployments` — List all deployments ordered by start time.
- **GET** `/api/deployments/service/{serviceId}` — List deployments for service.
- **POST** `/api/deployments` — Record deployment.
```json
{
  "serviceId": 1,
  "version": "v2.8.2",
  "commitHash": "b83ef91",
  "environment": "production",
  "triggeredBy": "Jenkins"
}
```
- **POST** `/api/deployments/{id}/rollback` — Trigger automatic or targeted rollback.
```json
{
  "targetVersion": "v2.8.0",
  "reason": "Spike in 5xx HTTP timeouts",
  "operator": "devops-engineer"
}
```

---

## 4. Incident Management Endpoints

- **GET** `/api/incidents` — List all incidents.
- **GET** `/api/incidents/{id}` — Retrieve incident details including timeline events.
- **POST** `/api/incidents` — File incident.
```json
{
  "serviceId": 1,
  "title": "Payment gateway latency elevated",
  "description": "p99 latency crossed 2000ms threshold",
  "severity": "HIGH",
  "createdBy": "Alertmanager"
}
```
- **PATCH** `/api/incidents/{id}/status` — Update incident status (`OPEN`, `ACKNOWLEDGED`, `INVESTIGATING`, `RESOLVED`, `CLOSED`).
- **POST** `/api/incidents/{id}/events` — Append timeline event.

---

## 5. AI Incident Intelligence Endpoints

- **POST** `/api/ai/incidents/{incidentId}/analyze` — Run AI correlation and root-cause analysis.
- **GET** `/api/ai/incidents/{incidentId}/latest` — Get latest AI analysis response.
- **Sample AI Response:**
```json
{
  "id": 1,
  "incidentId": 1,
  "summary": "Critical degradation detected on payment-service: HTTP error rate spiked to 14.1% correlated with deployment v2.8.1.",
  "probableRootCause": "Latest deployment appears to have introduced unindexed database queries or connection leaks driving pool utilization to 94%.",
  "evidence": "1. Deployment v2.8.1 completed 21m prior.\n2. Connection pool utilization at 94%.\n3. Latency surged to 2100ms.",
  "investigationSteps": "1. Inspect HikariCP pool metrics.\n2. Review git diff for unindexed queries.",
  "recommendations": "1. Consider rolling back payment-service.\n2. Increase maximum pool size temporarily.",
  "confidence": 0.94,
  "riskLevel": "CRITICAL",
  "modelName": "opsmind-ai-correlator-v1",
  "createdAt": "2026-10-03T09:30:00Z"
}
```

---

## 6. Observability & Monitoring Endpoints

- **GET** `/api/monitoring/dashboard` — High-level KPI summary (services, deployments, active incidents, MTTR).
- **GET** `/api/monitoring/metrics/{serviceId}` — Metric time-series for charts.
- **POST** `/api/monitoring/metrics` — Ingest telemetry snapshot.
- **GET** `/actuator/health` — Spring Boot health indicator.
- **GET** `/actuator/prometheus` — Prometheus metric scrape target.
