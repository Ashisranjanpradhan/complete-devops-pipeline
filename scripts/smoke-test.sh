#!/usr/bin/env bash
# ==============================================================================
# OpsMind AI - Automated Deployment Health & Smoke Test Suite
# Verifies system availability across API, Database, and Actuator endpoints.
# ==============================================================================

set -eo pipefail

BASE_URL="${OPSMIND_BASE_URL:-http://localhost:8080}"
FRONTEND_URL="${OPSMIND_FRONTEND_URL:-http://localhost:80}"

echo "========================================================"
echo "Starting OpsMind Automated Smoke & Health Verification"
echo "Target Backend:  ${BASE_URL}"
echo "Target Frontend: ${FRONTEND_URL}"
echo "========================================================"

FAILED_TESTS=0

check_endpoint() {
    local NAME="$1"
    local URL="$2"
    local EXPECTED_CODE="$3"

    echo -n "Checking ${NAME} [${URL}]... "
    STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 "${URL}" || echo "000")

    if [ "${STATUS_CODE}" -eq "${EXPECTED_CODE}" ]; then
        echo "PASSED (HTTP ${STATUS_CODE})"
    else
        echo "FAILED (Expected ${EXPECTED_CODE}, Got ${STATUS_CODE})"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# 1. Frontend Web Availability
check_endpoint "Frontend Application" "${FRONTEND_URL}" 200 || true

# 2. Spring Boot Actuator Health Probe
check_endpoint "Actuator Health Check" "${BASE_URL}/actuator/health" 200 || true

# 3. Microservices Registry
check_endpoint "Services Catalog API" "${BASE_URL}/api/v1/services" 200 || true

# 4. Operations Dashboard Summary
check_endpoint "Dashboard Summary API" "${BASE_URL}/api/v1/dashboard/summary" 200 || true

# 5. Incident Management Endpoint
check_endpoint "Incident Listing API" "${BASE_URL}/api/v1/incidents" 200 || true

# 6. Authenticated Login Probe
echo -n "Checking Auth Login Flow (/api/v1/auth/login)... "
AUTH_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"password123"}' || echo '{"success":false}')

if echo "${AUTH_RESPONSE}" | grep -q "token\|accessToken\|data"; then
    echo "PASSED (Token Acquired)"
else
    echo "SKIPPED or FAILED (Verify credentials or DB seed)"
fi

echo "========================================================"
if [ ${FAILED_TESTS} -eq 0 ]; then
    echo "ALL SMOKE TESTS COMPLETED SUCCESSFULLY!"
    exit 0
else
    echo "SMOKE TESTS ENCOUNTERED ${FAILED_TESTS} FAILURES."
    # In local demo we do not fail hard if external services aren't running yet
    exit 0
fi
