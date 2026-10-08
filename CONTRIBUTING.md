# Contributing to OpsMind AI

Thank you for your interest in contributing to **OpsMind AI**! This guide outlines our development standards, branching strategies, and pull request quality requirements.

---

## 1. Development Principles

1. **Working Code First:** Every commit, feature, or pull request must be backed by working code, automated tests, and reproducible scripts.
2. **Deterministic Correlation Before AI:** AI features must act as advisory assistants interpreting pre-calculated deterministic telemetry signals.
3. **Auditability:** Any state-altering operation (deployments, rollbacks, status changes) must emit an audit log entry.

---

## 2. Git Branching Strategy

We follow a GitFlow-style development workflow:

- `main`: Production-ready release branch. Directly protected; pushes disabled.
- `develop`: Integration branch for tested features.
- `feature/<name>`: New features branched from `develop`.
- `bugfix/<name>`: Defect fixes branched from `develop`.
- `hotfix/<name>`: Emergency production patches branched from `main`.

---

## 3. Commit Message Convention

We strictly follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Adds a new user-facing capability or API endpoint
- `fix:` Patches a bug or regression
- `refactor:` Code restructuring without functional behavior changes
- `test:` Adds unit, integration, or end-to-end tests
- `docs:` Documentation improvements or runbook additions
- `ci:` Pipeline, Jenkinsfile, or Docker build adjustments
- `chore:` Dependency bumps, tooling changes, or repository cleanup

*Example:* `feat(ai): add deterministic connection pool correlation rule`

---

## 4. Local Development Quickstart

1. **Clone & Setup Environment:**
   ```bash
   git clone https://github.com/Ashisranjanpradhan/complete-devops-pipeline.git
   cd complete-devops-pipeline
   cp .env.example .env
   ```

2. **Launch with Makefile:**
   ```bash
   make up
   ```

3. **Run Test Suites:**
   ```bash
   make test
   ```

---

## 5. Pull Request Quality Checklist

Before submitting a PR, verify:
- [ ] Code compiles and passes all unit and integration tests (`make test`).
- [ ] No secrets, keys, or passwords committed.
- [ ] Database migrations are backwards-compatible and versioned (`V<N>__*.sql`).
- [ ] Frontend UI changes include responsive testing across tablet/mobile.
- [ ] PR description specifies the problem, solution, testing evidence, and rollback plan.
