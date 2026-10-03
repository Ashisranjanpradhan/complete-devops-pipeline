# Complete DevOps Pipeline — OpsMind AI Platform

Welcome to the **Complete DevOps Pipeline** project repository. This repository hosts **OpsMind AI**, an enterprise-grade AI-powered DevOps operations platform that tracks software deployments, monitors service health, manages incidents, correlates observability data, and leverages AI for root-cause analysis and remediation.

## 🚀 Platform Overview

- **Core Application:** [maven_jenkins/](maven_jenkins/)
- **Backend:** Spring Boot 3.3.4 (Java 17/21/25), Spring Security (JWT), Spring Data JPA, Flyway, Actuator, Micrometer.
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons.
- **Database:** PostgreSQL with automated Flyway versioned migrations.
- **AI Correlator:** Incident telemetry correlation engine & benchmark evaluation suite.
- **Observability:** Prometheus metrics scraping + Grafana operational dashboards.
- **CI/CD:** Multi-stage automated pipelines via Jenkins and GitHub Actions.
- **Infrastructure as Code:** Terraform modules (Network VPC, RDS PostgreSQL, EC2 Compute, CloudWatch Monitoring).
- **Containerization:** Multi-stage Docker builds and full 5-service `docker-compose.yml`.

## 📖 Quick Links & Documentation

- [Full Architecture & Documentation](maven_jenkins/README.md)
- [Requirements Specification](maven_jenkins/docs/requirements.md)
- [System Architecture](maven_jenkins/docs/architecture.md)
- [REST API Reference](maven_jenkins/docs/api.md)
- [Database Schema & Backup Guide](maven_jenkins/docs/database.md)
- [Deployment & Operations Guide](maven_jenkins/docs/deployment.md)
- [Security Hardening & RBAC](maven_jenkins/docs/security.md)

## ⚡ Quick Start

```bash
cd maven_jenkins

# Start full 5-container stack (PostgreSQL, Backend, Frontend, Prometheus, Grafana)
docker compose up -d --build
```

Access services:
- **Frontend Dashboard:** http://localhost:80
- **Backend REST API:** http://localhost:8080
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **Prometheus:** http://localhost:9090
- **Grafana Dashboards:** http://localhost:3000 (admin / admin)