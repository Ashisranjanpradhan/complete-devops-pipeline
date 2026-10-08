# Testing Strategy & Quality Assurance — OpsMind AI

## 1. Multi-Tier Testing Pyramid

OpsMind AI employs a comprehensive testing strategy across all architectural layers:

```text
                  ┌───────────────┐
                  │ Playwright E2E│
                  ├───────────────┤
                  │  Smoke Tests  │
                  ├───────────────┤
                  │Integration (IT│
                  ├───────────────┤
                  │Unit Test Suite│
                  └───────────────┘
```

---

## 2. Backend Unit & Integration Tests

- **Framework:** JUnit 5, Mockito, Spring Boot Test (`@SpringBootTest`).
- **In-Memory Verification:** H2 dialect profile for rapid unit test validation (`application-test.yml`).
- **Repository Constraints:** Foreign key cascading and uniqueness constraint tests.
- **Service Layer Coverage:**
  - `AuthServiceTest`: User credential verification and JWT generation.
  - `AIAnalysisServiceTest`: Telemetry correlation and evidence builder logic.
  - `DeploymentServiceTest`: Release lifecycle transitions and rollback tracking.
  - `IncidentServiceTest`: Event logging and status state machine verification.
  - `ServiceManagementTest`: Microservice registry operations.

Run Backend Tests:
```bash
make backend-test
# Or: cd backend && mvn test
```

---

## 3. Frontend Validation & Build

- **Type Checking:** Strict TypeScript compiler verification (`tsc --noEmit`).
- **Production Bundle:** Vite multi-chunk optimization (`npm run build`).

Run Frontend Tests:
```bash
make frontend-test
# Or: cd frontend && npm run build
```

---

## 4. Automated Post-Deployment Smoke Tests

Located in `scripts/smoke-test.sh`:
- Health check verification against `/actuator/health`.
- Registry listing probe against `/api/v1/services`.
- Dashboard summary probe against `/api/v1/dashboard/summary`.
- Authenticated JWT credential exchange against `/api/v1/auth/login`.

Run Smoke Tests:
```bash
make smoke-test
```

---

## 5. End-to-End Playwright Testing

Located in `e2e/playwright/incident-workflow.spec.ts`:
Validates the entire flagship user journey:
1. Login with RBAC credentials
2. Open Dashboard and inspect telemetry curve
3. Navigate to Incidents
4. Trigger AI Incident Assistant
5. Review evidence bullets & confidence score
6. Authorize controlled rollback
7. Verify incident status moves to RESOLVED
