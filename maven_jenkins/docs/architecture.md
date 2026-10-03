# OpsMind AI — System Architecture

## 1. High-Level Architecture

OpsMind AI is architected as an industry-standard modern DevOps intelligence platform composed of decoupled frontend, backend, database, observability, and container runtime components:

```text
                        ┌────────────────────────┐
                        │      Web Browser       │
                        │ React 18 + Vite + TS   │
                        └───────────┬────────────┘
                                    │ HTTPS / JWT
                                    ▼
                        ┌────────────────────────┐
                        │    Nginx / Gateway     │
                        └───────────┬────────────┘
                                    │
                                    ▼
                        ┌────────────────────────┐
                        │  Spring Boot Backend   │
                        │   (Java 17/21/25)      │
                        │                        │
                        │ ├── Security & JWT     │
                        │ ├── Service Registry   │
                        │ ├── Deployment Engine  │
                        │ ├── Incident Lifecycle │
                        │ ├── AI Analysis Engine │
                        │ └── Micrometer Actuator│
                        └─────┬────────────┬─────┘
                              │            │
             ┌────────────────┘            └────────────────┐
             ▼                                              ▼
┌─────────────────────────┐                    ┌─────────────────────────┐
│       PostgreSQL        │                    │       Prometheus        │
│    (Flyway Migrated)    │                    │ (Scrapes /actuator/...) │
└─────────────────────────┘                    └────────────┬────────────┘
                                                            │
                                                            ▼
                                               ┌─────────────────────────┐
                                               │         Grafana         │
                                               │   (Telemetry & KPI)     │
                                               └─────────────────────────┘
```

---

## 2. Component Descriptions

### 2.1 Frontend
- **Framework:** React 18 with TypeScript and Vite bundler.
- **Styling:** Tailwind CSS with responsive dark UI aesthetic.
- **Visuals:** Lucide icons and Recharts data visualization.
- **State & Routing:** Context API (`AuthContext`), React Router DOM v6 with protected routes and RBAC guards.
- **API Client:** Axios instance with automatic JWT Authorization header injection and 401 redirect handling.

### 2.2 Backend
- **Framework:** Spring Boot 3.3.4.
- **Persistence:** Spring Data JPA with Hibernate and HikariCP connection pool.
- **Security:** Spring Security with stateless `JwtAuthenticationFilter` and BCrypt password encryption.
- **Migrations:** Flyway versioned SQL migrations (`V1__init_schema.sql`, `V2__seed_data.sql`).
- **Observability:** Spring Boot Actuator with Micrometer Prometheus metrics exporter.
- **Documentation:** SpringDoc OpenAPI 3 / Swagger UI (`/swagger-ui.html`).

### 2.3 AI Correlation Engine
- **Context Builder:** Aggregates telemetry across 45-minute incident window (recent deployments, error rates, p99 latency, DB connection utilization, host CPU).
- **Rule Engine / LLM Abstraction:** Evaluates failure patterns (e.g. unindexed query causing pool saturation, thread contention, memory exhaustion).
- **Safe Output Contract:** Standardized JSON payload with confidence, root cause, evidence points, and non-destructive remediation proposals.

---

## 3. Production Deployment & Cloud Architecture

In AWS environments provisioned via Terraform:
- **Networking:** Multi-AZ VPC with public subnets for Application Load Balancers and private subnets for compute instances and database.
- **Compute:** Auto-Scaling Group running Dockerized Spring Boot instances behind an ALB.
- **Database:** Amazon RDS PostgreSQL Multi-AZ with automated snapshots and encryption at rest.
- **Telemetry:** Prometheus & Grafana nodes aggregating system and application metrics.
