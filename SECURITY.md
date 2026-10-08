# Security Policy & Hardening Guidelines — OpsMind AI

## 1. Supported Versions

| Component | Version | Security Support Status |
|---|---|---|
| OpsMind Platform | `1.0.x` | Supported (Active Maintenance) |
| Spring Boot Backend | `3.3.4` (Java 17/21/25) | Supported |
| React Frontend | `18.3.1` (Vite 5) | Supported |
| PostgreSQL RDS | `15-alpine` | Supported |

---

## 2. Reporting a Vulnerability

We take the security of the OpsMind AI platform and continuous delivery infrastructure seriously.

If you discover a security vulnerability:
1. **Do NOT open a public GitHub issue.**
2. Send an email to `security@opsmind.io` or reach out privately via GitHub Security Advisories.
3. Include detailed steps to reproduce the issue (proof-of-concept payload, affected endpoints, request headers).
4. Our security team will acknowledge receipt within 24 hours and provide an estimated remediation timeline.

---

## 3. Defense-in-Depth Architecture

OpsMind enforces defense-in-depth across the entire application and delivery lifecycle:

### Authentication & Authorization (RBAC)
- **Stateless JWT Tokens:** 256-bit HMAC SHA (`HS256`) signed tokens with strict expiration (`86400000 ms`).
- **BCrypt Password Hashing:** Salted key stretching (`strength = 10`) protecting user credentials.
- **Endpoint Authorization:** Fine-grained role hierarchy enforced via Spring Security `@PreAuthorize`:
  - `ROLE_ADMIN`: User management, system deletion.
  - `ROLE_DEVOPS_ENGINEER`: Trigger deployments, execute rollbacks, infrastructure changes.
  - `ROLE_DEVELOPER`: Register services, create incidents, submit triage notes.
  - `ROLE_VIEWER`: Read-only access to operational metrics and dashboards.

### Supply Chain & Pipeline Hardening
- **Immutable Container Tagging:** Releases tagged uniquely using `${GIT_COMMIT_SHORT}-${BUILD_NUMBER}`. Mutable `latest` tags are prohibited in production.
- **Vulnerability Scanning:** Automated container scanning via Trivy and dependency audit via `npm audit` and OWASP Dependency-Check.
- **Secret Isolation:** Zero hard-coded credentials. All database passwords, tokens, and keys are supplied via environment variables (`.env`) or cloud secret managers.

### Network & Infrastructure Security
- **Least Privilege IAM:** Scoped AWS IAM roles for ECS tasks and EC2 instances.
- **Network Isolation:** PostgreSQL instances deployed within private subnets without public ingress (`0.0.0.0/0`).
- **Actuator Endpoint Protection:** Only `/actuator/health`, `/actuator/info`, and `/actuator/prometheus` exposed; internal management endpoints protected.
- **Audit Trails:** Immutable database logging of all administrative actions, deployments, rollbacks, and incident status transitions.
