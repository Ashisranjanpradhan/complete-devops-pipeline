# OpsMind AI — Security Architecture & Hardening

## 1. Authentication & Token Security

- **JWT Tokens:** Issued using HMAC-SHA256 (`io.jsonwebtoken.jjwt`), signed with a 256-bit cryptographically secure key (`JWT_SECRET`).
- **Expiration:** Default token validity is 24 hours (86,400,000 ms).
- **Stateless Verification:** Every incoming HTTP request passes through `JwtAuthenticationFilter`, which parses and verifies the Bearer token before setting the `SecurityContextHolder`.

---

## 2. Role-Based Access Control (RBAC)

OpsMind enforces least-privilege authorization at both URL pattern level (`SecurityConfig.java`) and method level:

| Feature / Resource | ADMIN | DEVOPS_ENGINEER | DEVELOPER | VIEWER |
|---|:---:|:---:|:---:|:---:|
| User Management | Read / Write | No Access | No Access | No Access |
| Service Registry | Full Access | Full Access | Full Access | Read-Only |
| Deployments | Full Access | Full Access | Create / Read | Read-Only |
| Incident Creation & Updates | Full Access | Full Access | Full Access | Read-Only |
| AI Incident Analysis | Execute & View | Execute & View | Execute & View | View-Only |
| Audit Logs | Full Access | View-Only | No Access | No Access |
| Actuator Prometheus Scrape | Protected | Protected | Protected | Protected |

---

## 3. Data Protection & Password Hashing

- **Password Storage:** One-way password hashing using `BCryptPasswordEncoder` with strength factor 10. Raw passwords are never stored in memory or persisted.
- **Database Security:**
  - Parameterized queries via Spring Data JPA prevent SQL injection.
  - In production AWS RDS, storage is encrypted using AWS KMS (`storage_encrypted = true`).
  - Database subnet groups are in private subnets with no public IP allocation.

---

## 4. AI Guardrails & Safety Architecture

- **Human-in-the-Loop:** OpsMind AI engine only provides actionable recommendations and probable root causes. It does not automatically execute destructive production actions (such as dropping databases, deleting pods, or force-terminating instances).
- **Sanitized Telemetry:** AI context builder strips secrets, database credentials, authentication tokens, and user PII before context analysis.

---

## 5. Audit Logging & Compliance

All sensitive actions trigger an append-only entry in `audit_logs`:
- User registration and login attempts
- Service creations, updates, deletions
- Deployment recordings and rollbacks
- Incident status transitions
- AI root cause analysis invocations
- Each audit log captures: `username`, `action`, `resource`, `details`, `ip_address`, and `timestamp`.
