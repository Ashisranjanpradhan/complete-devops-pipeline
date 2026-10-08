#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:-dev}"
echo "Deploying OpsMind stack for environment: ${ENVIRONMENT}"

if command -v docker compose &> /dev/null; then
  echo "Pulling latest images..."
  docker compose pull backend frontend || true
  echo "Restarting containers..."
  docker compose up -d --remove-orphans
  echo "Deployment to ${ENVIRONMENT} complete."
else
  echo "Docker compose not found on host."
fi
