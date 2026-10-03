#!/usr/bin/env bash
set -euo pipefail

BACKEND_URL="${BACKEND_URL:-http://localhost:8080/actuator/health}"
MAX_RETRIES=10
SLEEP_SECS=3

echo "Running OpsMind automated health check against: ${BACKEND_URL}"
for ((i=1; i<=MAX_RETRIES; i++)); do
  if curl -sf "${BACKEND_URL}" | grep -q '"status":"UP"'; then
    echo "Health check passed on attempt ${i}."
    exit 0
  fi
  echo "Attempt ${i}/${MAX_RETRIES} failed, retrying in ${SLEEP_SECS}s..."
  sleep "${SLEEP_SECS}"
done

echo "Health check failed after ${MAX_RETRIES} attempts!"
exit 1
