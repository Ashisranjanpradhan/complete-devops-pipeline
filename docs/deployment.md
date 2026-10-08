# OpsMind AI — Deployment & Operations Guide

## 1. Local Development Quickstart

### Prerequisites
- Java 17+ (or 21/25)
- Node.js 18+ and npm
- Docker and Docker Compose
- Maven 3.9+

### Running with Docker Compose (Full 5-Container Stack)
To run the entire system including PostgreSQL, Spring Boot backend, Vite React frontend, Prometheus, and Grafana:

```bash
cd /path/to/opsmind-ai
docker compose up -d --build
```

Verify service statuses:
```bash
docker compose ps
```

| Service | Port | Description |
|---|---|---|
| Frontend | `http://localhost:80` | Web UI Dashboard |
| Backend | `http://localhost:8080` | Spring Boot REST API |
| Swagger Docs | `http://localhost:8080/swagger-ui.html` | Interactive API documentation |
| Prometheus | `http://localhost:9090` | Metrics Collector |
| Grafana | `http://localhost:3000` | Operational Dashboards (admin/admin) |
| PostgreSQL | `localhost:5432` | Database |

---

## 2. Running Services Locally Without Docker

### 2.1 Backend
```bash
cd backend
mvn clean spring-boot:run
```
By default, the backend runs against the in-memory H2 database profile with full seed data pre-populated, making local development instantaneous without needing local PostgreSQL installed.

### 2.2 Frontend
```bash
cd frontend
npm install
npm run dev
```
Access at `http://localhost:5173`.

---

## 3. Jenkins CI/CD Pipeline

The automated pipeline defined in `Jenkinsfile` runs:
1. **Checkout:** Pulls latest commit from Git branch.
2. **Backend Build & Test:** Compiles Spring Boot application and executes JUnit 5 test suite (`mvn clean package`).
3. **Frontend Build & Test:** Runs TypeScript verification and production build (`npm install && npm run build`).
4. **Docker Image Build:** Containers are packaged with Git build numbers.
5. **Image Push:** Deploys artifacts to container registry using securely stored Jenkins credentials.
6. **Health Check:** Automatically validates `/actuator/health` on deployed instance.

---

## 4. Terraform Cloud Deployment (AWS)

```bash
cd infra/terraform/environments/dev # or prod
terraform init
terraform plan
terraform apply
```

To tear down development environments:
```bash
terraform destroy
```

---

## 5. Rollback Strategy

OpsMind supports zero-downtime rollback:
1. **Via UI:** Navigate to the Deployments page, locate the degraded service release, and click **Rollback**.
2. **Via REST API:**
   ```bash
   curl -X POST http://localhost:8080/api/deployments/{id}/rollback \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"reason": "Performance degradation detected by AI correlator"}'
   ```
3. **Via Jenkins:** Trigger rollback pipeline with previous stable version parameter.
