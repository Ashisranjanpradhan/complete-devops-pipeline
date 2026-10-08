# OpsMind AI — Intelligent DevOps Incident, Deployment & Reliability Platform

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-Jenkins%20%7C%20GitHub%20Actions-blue.svg)](Jenkinsfile)
[![Backend](https://img.shields.io/badge/Backend-Spring%20Boot%203.3.4%20%7C%20Java%2017%2F21%2F25-green.svg)](backend/)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite-cyan.svg)](frontend/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2015%20%7C%20Flyway-blue.svg)](docs/database.md)
[![Observability](https://img.shields.io/badge/Observability-Prometheus%20%7C%20Grafana-orange.svg)](monitoring/)
[![IaC](https://img.shields.io/badge/Infrastructure-Terraform%20%7C%20AWS-purple.svg)](infra/terraform/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

> **OpsMind AI** is an enterprise-grade internal DevOps & SRE operations workspace built to reduce Mean Time to Recovery (MTTR). It correlates software deployments, service health, and real-time observability telemetry, then leverages an autonomous AI investigation assistant to produce evidence-backed root-cause hypotheses and human-approved rollback remediation.

---

## 📌 The Engineering Narrative

> *"When a production service degrades, engineering teams waste critical minutes manually correlating Jenkins pipelines, metric anomalies, error logs, and service dependencies. OpsMind AI unifies this entire operational lifecycle: from automated code commit → multi-stage CI verification → immutable container deployment → Prometheus telemetry scraping → automated incident correlation → autonomous AI root-cause investigation → human-authorized rollback → post-incident audit logging."*

---

## 🏗️ System Architecture

```text
                                     USERS / SREs
                                          │
                                          ▼
                                   HTTPS / ALB (:80)
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    ▼                                           ▼
          React Console (Vite SPA)                   Spring Boot REST API (:8080)
          • Workspace Multi-Tabs                     • JWT & RBAC Endpoint Security
          • Real-time Telemetry                      • Flyway Schema Migrations
          • Flagship Demo Simulator                  • Micrometer Actuator Metrics
                    │                                           │
                    │                         ┌─────────────────┼─────────────────┐
                    ▼                         ▼                 ▼                 ▼
          PostgreSQL Database         AI Assistant        Prometheus (:9090)   Audit Trail
          • Services & Dependencies   • Statistical RCA   • Metrics Scraper    • Immutable Log
          • Deployments & History     • Context Builder   • Alertmanager       • Compliance
          • Incidents & Timelines     • Structured JSON         │
                                                                ▼
                                                        Grafana (:3000)
                                                        • Service Health
                                                        • JVM / HikariCP
```

---

## ⚡ Quick Start (One Command)

### Prerequisites
- Docker & Docker Compose (`v2.20+`)
- Make (`make` utility)
- Java 17+ & Maven (for local backend compilation)
- Node.js 18+ (for local frontend development)

### Launch Complete 5-Container Stack

```bash
# 1. Clone repository
git clone https://github.com/Ashisranjanpradhan/complete-devops-pipeline.git
cd complete-devops-pipeline

# 2. Copy environment template
cp .env.example .env

# 3. Start all services via Makefile
make up
```

Once running, access the services:
- **OpsMind Web Console:** [http://localhost:80](http://localhost:80)
- **Spring Boot REST API:** [http://localhost:8080](http://localhost:8080)
- **OpenAPI Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Prometheus Metrics:** [http://localhost:9090](http://localhost:9090)
- **Grafana Dashboards:** [http://localhost:3000](http://localhost:3000) *(admin / admin)*

---

## 🔑 Default RBAC Credentials

| Role | Username | Password | Permitted Operations |
|---|---|---|---|
| **Administrator** | `admin` | `password123` | Full administrative control, user roles, system settings |
| **DevOps / SRE** | `devops` | `password123` | Trigger deployments, authorize rollbacks, manage infrastructure |
| **Developer** | `developer` | `password123` | Register services, create incidents, post investigation notes |
| **Viewer** | `viewer` | `password123` | Read-only access to operational dashboards and telemetry |

---

## 🎬 Flagship Interview Demonstration (The 18-Step Story)

OpsMind features an interactive, end-to-end operational scenario: **"A bad deployment causes production degradation."**

Click **"Flagship Demo Outage"** in the top navigation bar or run `./scripts/demo-incident.sh`:

1. **Deploy Release v2.8.1:** Jenkins builds and deploys `payment-service:v2.8.1` introducing an unindexed query leak.
2. **Telemetry Degradation:** Database connection pool utilization in HikariCP surges to **94%**, p99 latency spikes from **180ms to 2.1s**, and HTTP 5xx error rate reaches **14.1%**.
3. **Automated SEV-1 Incident Opened:** Alertmanager detects SLO breach and triggers a critical incident.
4. **Open in Workspace Tab:** Inspect incident in persistent multi-tab workspace with deep-link URL.
5. **Autonomous AI Correlation:** Click **"Analyze Incident with AI"**. The correlation engine evaluates deployment proximity, latency deviation, and connection saturation:
   - **Confidence Score:** `94%`
   - **Probable Root Cause:** Database connection exhaustion correlated with deployment `v2.8.1`.
   - **Correlated Evidence:** Bullet points linking exact deployment timestamp to metric spike.
6. **Human-Approved Rollback:** Operator reviews recommendation and clicks **"Execute Rollback"** with justification.
7. **Known-Good Release Restored:** Known-good artifact `v2.8.0` is deployed. Health checks pass, connection pool normalizes to 54%, and latency recovers to 180ms.
8. **Audit Trail Logged:** Every state change, authorization, and event is immutably recorded in the compliance audit trail.

---

## 🛠️ Developer & DevOps Commands

```bash
make help            # Display list of available commands
make up              # Start full Docker Compose stack
make down            # Stop and remove containers
make test            # Run all backend and frontend test suites
make backend-test    # Run Spring Boot JUnit 5 & integration tests
make frontend-test   # Run frontend TypeScript & unit tests
make build           # Package backend JAR and bundle frontend assets
make smoke-test      # Execute post-deployment API health verification
make clean           # Clean build targets and temporary files
```

---

## 🔄 CI/CD & Delivery Pipeline (Jenkins)

The pipeline defined in [Jenkinsfile](Jenkinsfile) enforces rigorous quality gates across 13 stages:

```text
1. Checkout & Environment Validation
   ↓
2. Backend Compile & Unit Tests (mvn test)
   ↓
3. Backend Package & JaCoCo Coverage
   ↓
4. Frontend Install, Lint & Production Build
   ↓
5. Static Analysis & Dependency Vulnerability Audits
   ↓
6. Build Container Images with Immutable Tags (${GIT_COMMIT_SHORT}-${BUILD_NUMBER})
   ↓
7. Trivy Container Vulnerability Scan
   ↓
8. Publish Images to Container Registry
   ↓
9. Terraform IaC Format & Validation
   ↓
10. Deploy to Dev Environment
   ↓
11. Health Checks & Automated Smoke Tests
   ↓
12. Publish Deployment Record to OpsMind API (POST /api/v1/deployments)
   ↓
13. Manual Approval Gate for Production Release
```

---

## 📚 Comprehensive Documentation Suite

- [System Architecture](docs/architecture.md) — Comprehensive technical design, components, and data flow
- [REST API Reference](docs/api.md) — OpenAPI v1 specifications, endpoints, and response models
- [Database Schema & Migrations](docs/database.md) — Flyway versioned migrations, ER diagrams, and indexing
- [Deployment & Operations Guide](docs/deployment.md) — Docker Compose, Jenkins, and AWS ECS guidelines
- [Observability & Metrics](docs/observability.md) — Prometheus scraping configs, alerts, and Grafana dashboards
- [AI Assistant & Correlation Engine](docs/ai.md) — Deterministic correlation, structured JSON contracts, and benchmarks
- [Testing Strategy & QA](docs/testing.md) — Unit tests, integration tests, smoke tests, and Playwright E2E
- [SRE Operational Runbooks](docs/runbook.md) — Standardized incident mitigation and rollback procedures
- [Disaster Recovery & Business Continuity](docs/disaster-recovery.md) — Backup procedures, RTO/RPO targets, and failover
- [Incident Postmortem Example](docs/postmortems/PM-001-payment-api-latency.md) — Real-world SEV-1 postmortem report
- [Security Policy & RBAC](SECURITY.md) — Defense-in-depth principles, JWT rotation, and vulnerability disclosure
- [Contribution Guidelines](CONTRIBUTING.md) — Git branching models, conventional commits, and PR standards