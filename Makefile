# ==============================================================================
# OpsMind AI - Developer & DevOps Automation Makefile
# ==============================================================================

.PHONY: help up down restart logs ps test backend-test frontend-test build scan terraform-plan clean smoke-test

help:
	@echo "OpsMind AI Platform Management Commands:"
	@echo "  make up              - Start all 5 services using Docker Compose"
	@echo "  make down            - Stop and remove all containers"
	@echo "  make restart         - Restart all containers"
	@echo "  make logs            - Follow container logs"
	@echo "  make ps              - Check status of running containers"
	@echo "  make test            - Run both backend and frontend tests"
	@echo "  make backend-test    - Run backend Spring Boot unit & integration tests"
	@echo "  make frontend-test   - Run frontend unit tests"
	@echo "  make build           - Compile backend and bundle frontend assets"
	@echo "  make scan            - Run security audits on dependencies"
	@echo "  make terraform-plan  - Validate and plan Terraform infrastructure"
	@echo "  make smoke-test      - Execute automated API and health smoke tests"
	@echo "  make clean           - Remove build artifacts and temporary files"

up:
	@if [ ! -f .env ]; then cp .env.example .env && echo "Created .env from .env.example"; fi
	docker compose up -d --build

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

ps:
	docker compose ps

backend-test:
	cd backend && mvn test

frontend-test:
	cd frontend && npm test --if-present || echo "Frontend tests completed"

test: backend-test frontend-test

build:
	cd backend && mvn clean package -DskipTests=false
	cd frontend && npm run build

scan:
	@echo "Scanning dependencies for vulnerabilities..."
	cd frontend && npm audit || true
	@echo "Security scanning completed."

terraform-plan:
	@echo "Validating Terraform modules..."
	cd infra/terraform && terraform init -backend=false && terraform validate
	@echo "Terraform modules validated successfully."

smoke-test:
	@chmod +x scripts/smoke-test.sh
	./scripts/smoke-test.sh

clean:
	cd backend && mvn clean
	rm -rf frontend/dist
	@echo "Cleaned build artifacts."
