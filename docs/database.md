# OpsMind AI — Database Architecture & Schema

## 1. Overview

OpsMind AI utilizes **PostgreSQL 15+** with version-controlled schema evolution managed via **Flyway**.
In development and automated integration testing, an in-memory **H2** database runs with PostgreSQL dialect compatibility.

---

## 2. Entity-Relationship Diagram

```text
       ┌───────────┐         ┌──────────────┐         ┌───────────┐
       │   users   │◄───────►│  user_roles  │◄───────►│   roles   │
       └─────┬─────┘         └──────────────┘         └───────────┘
             │
             ▼
     ┌──────────────┐
     │  audit_logs  │
     └──────────────┘

     ┌──────────────┐         ┌──────────────┐
     │   services   │◄───┐    │  deployments │
     └───────┬──────┘    │    └──────────────┘
             │           │
             ├───────────┼────┐
             │           │    │
             ▼           │    ▼
      ┌────────────┐     │ ┌───────────────────┐
      │ incidents  │     │ │ metrics_snapshots │
      └─────┬──────┘     │ └───────────────────┘
            │            │
            ├────────────┘
            ▼
     ┌──────────────┐
     │ ai_analyses  │
     └──────────────┘
```

---

## 3. Tables & Schema Specifications

### `users`
- Primary key: `id` (BIGSERIAL)
- `username`: VARCHAR(100) UNIQUE NOT NULL
- `email`: VARCHAR(150) UNIQUE NOT NULL
- `password_hash`: VARCHAR(255) NOT NULL (BCrypt)
- `full_name`: VARCHAR(150)
- `enabled`: BOOLEAN DEFAULT TRUE
- `created_at`, `updated_at`: TIMESTAMPTZ

### `roles` & `user_roles`
- `roles`: `id`, `name` (`ROLE_ADMIN`, `ROLE_DEVOPS_ENGINEER`, `ROLE_DEVELOPER`, `ROLE_VIEWER`), `description`
- `user_roles`: Composite primary key `(user_id, role_id)` with cascading foreign keys.

### `services`
- `id` (BIGSERIAL)
- `name` VARCHAR(100) UNIQUE NOT NULL
- `environment` VARCHAR(50) DEFAULT 'production'
- `repository_url`, `owner`, `current_version`
- `health_status`: `HEALTHY`, `DEGRADED`, `DOWN`

### `deployments`
- `id` (BIGSERIAL), `service_id` (FK -> services.id)
- `version`, `commit_hash`, `environment`
- `status`: `QUEUED`, `BUILDING`, `TESTING`, `DEPLOYING`, `SUCCESS`, `FAILED`, `ROLLED_BACK`
- `triggered_by`, `started_at`, `completed_at`
- `rollback_of_id`: Self-referencing FK -> deployments.id

### `incidents` & `incident_events`
- `incidents`: `id`, `service_id` (FK), `title`, `description`, `severity` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), `status` (`OPEN`, `ACKNOWLEDGED`, `INVESTIGATING`, `RESOLVED`, `CLOSED`), `created_by`, `assigned_to`, `created_at`, `resolved_at`
- `incident_events`: `id`, `incident_id` (FK), `event_type`, `description`, `created_by`, `timestamp`

### `ai_analyses`
- `id` (BIGSERIAL), `incident_id` (FK -> incidents.id)
- `summary`, `probable_root_cause`, `evidence`, `recommendations`, `investigation_steps`
- `confidence` DOUBLE PRECISION, `risk_level` VARCHAR(30), `model_name` VARCHAR(100)

### `metrics_snapshots`
- `id` (BIGSERIAL), `service_id` (FK -> services.id)
- `latency_ms`, `error_rate_percent`, `cpu_usage_percent`, `memory_usage_percent`, `db_connections_utilization_percent`, `captured_at`

### `audit_logs`
- `id` (BIGSERIAL), `username`, `action`, `resource`, `details`, `ip_address`, `timestamp`

---

## 4. Database Performance & Indexing

Critical indexes defined in `V1__init_schema.sql`:
```sql
CREATE INDEX idx_services_env ON services(environment);
CREATE INDEX idx_deployments_service_id ON deployments(service_id);
CREATE INDEX idx_deployments_status ON deployments(status);
CREATE INDEX idx_incidents_service_id ON incidents(service_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incident_events_incident ON incident_events(incident_id);
CREATE INDEX idx_ai_analyses_incident ON ai_analyses(incident_id);
CREATE INDEX idx_metrics_service_time ON metrics_snapshots(service_id, captured_at DESC);
CREATE INDEX idx_audit_logs_user_time ON audit_logs(username, timestamp DESC);
```

---

## 5. Backup & Recovery Strategy

1. **Continuous Automated Snapshots:**
   - In AWS RDS, automated backups are retained for 30 days in Production with Point-In-Time-Recovery (PITR) up to the last 5 minutes.
2. **Logical Dump Backup (pg_dump):**
   ```bash
   pg_dump -h localhost -U opsmind_user -d opsmind_db -F c -b -v -f opsmind_backup_$(date +%Y%m%d_%H%M%S).dump
   ```
3. **Restoration Command:**
   ```bash
   pg_restore -h localhost -U opsmind_user -d opsmind_db -v opsmind_backup_<timestamp>.dump
   ```
4. **Disaster Recovery (DR) RPO & RTO:**
   - **RPO (Recovery Point Objective):** < 5 minutes (via RDS Multi-AZ transaction log replication).
   - **RTO (Recovery Time Objective):** < 15 minutes (automated RDS failover).
