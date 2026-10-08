-- ==============================================================================
-- OpsMind AI - Comprehensive Demo Seed Dataset (Section 89)
-- 10 Microservices, 20 Deployments, 8 Incidents, Metrics, Audit, Roles & Users
-- ==============================================================================

-- 1. Ensure Roles
INSERT INTO roles (name, description) VALUES
    ('ROLE_ADMIN', 'Platform Administrator with full control'),
    ('ROLE_DEVOPS_ENGINEER', 'DevOps & SRE Engineer with deployment and rollback authority'),
    ('ROLE_DEVELOPER', 'Developer with service and incident triage access'),
    ('ROLE_VIEWER', 'Read-only observer for executive dashboards and telemetry')
ON CONFLICT (name) DO NOTHING;

-- 2. Ensure Users (Password: password123)
-- BCrypt hash for 'password123': $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG
INSERT INTO users (username, email, password_hash, full_name, enabled) VALUES
    ('admin', 'admin@opsmind.io', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'OpsMind Admin', true),
    ('devops', 'devops@opsmind.io', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'DevOps Specialist', true),
    ('developer', 'developer@opsmind.io', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Software Engineer', true),
    ('viewer', 'viewer@opsmind.io', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'SRE Operations Viewer', true)
ON CONFLICT (username) DO NOTHING;

-- Map User Roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'admin' AND r.name IN ('ROLE_ADMIN', 'ROLE_DEVOPS_ENGINEER')
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'devops' AND r.name = 'ROLE_DEVOPS_ENGINEER'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'developer' AND r.name = 'ROLE_DEVELOPER'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'viewer' AND r.name = 'ROLE_VIEWER'
ON CONFLICT DO NOTHING;

-- 3. Insert 10 Microservices
INSERT INTO services (name, description, repository_url, environment, owner, current_version, health_status) VALUES
    ('payment-service', 'Core billing gateway, stripe webhooks, and ledger transactions', 'github.com/opsmind/payment-service', 'production', 'payments-team', 'v2.8.1', 'DEGRADED'),
    ('auth-service', 'OAuth2, JWT authentication, and IAM credentials broker', 'github.com/opsmind/auth-service', 'production', 'security-team', 'v1.4.2', 'HEALTHY'),
    ('order-service', 'Checkout funnel, order lifecycle, and basket persistence', 'github.com/opsmind/order-service', 'production', 'checkout-team', 'v3.1.0', 'HEALTHY'),
    ('notification-service', 'Dispatch email, SMS alerts, and Slack operational webhooks', 'github.com/opsmind/notification-service', 'production', 'core-team', 'v1.0.5', 'HEALTHY'),
    ('inventory-service', 'Real-time stock reservation and warehouse SKU lookup', 'github.com/opsmind/inventory-service', 'production', 'logistics-team', 'v2.0.1', 'HEALTHY'),
    ('shipping-service', 'Carrier routing, parcel tracking, and postal rate evaluation', 'github.com/opsmind/shipping-service', 'production', 'logistics-team', 'v1.2.4', 'HEALTHY'),
    ('customer-service', 'Customer profile data, GDPR compliance, and preferences', 'github.com/opsmind/customer-service', 'production', 'core-team', 'v2.3.0', 'HEALTHY'),
    ('analytics-service', 'Clickstream ingestion and business metrics aggregation', 'github.com/opsmind/analytics-service', 'production', 'bi-team', 'v1.9.0', 'HEALTHY'),
    ('reporting-service', 'Monthly financial exports and PDF compliance generators', 'github.com/opsmind/reporting-service', 'staging', 'finance-team', 'v0.8.2', 'HEALTHY'),
    ('fraud-detection-service', 'ML-based transaction scoring and risk classification', 'github.com/opsmind/fraud-detection-service', 'production', 'risk-team', 'v2.1.0', 'HEALTHY')
ON CONFLICT (name) DO NOTHING;

-- 4. Insert 20 Deployments across services
INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v2.7.9', 'a1b2c3d', 'production', 'SUCCESS', 'Jenkins #139', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '3 minutes' FROM services WHERE name = 'payment-service';
INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v2.8.0', 'e5c9b12', 'production', 'SUCCESS', 'Jenkins #140', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '4 minutes' FROM services WHERE name = 'payment-service';
INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v2.8.1', 'a72f93c', 'production', 'SUCCESS', 'Jenkins #142', NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '21 minutes' FROM services WHERE name = 'payment-service';

INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v1.4.1', 'f3d4e5a', 'production', 'SUCCESS', 'Jenkins #120', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '2 minutes' FROM services WHERE name = 'auth-service';
INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v1.4.2', 'c398a10', 'production', 'SUCCESS', 'Jenkins #133', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '3 minutes' FROM services WHERE name = 'auth-service';

INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v3.0.9', 'b8c9d0e', 'staging', 'SUCCESS', 'Jenkins #201', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '4 minutes' FROM services WHERE name = 'order-service';
INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v3.1.0', '98a7f6e', 'production', 'SUCCESS', 'Jenkins #204', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours' + INTERVAL '5 minutes' FROM services WHERE name = 'order-service';

INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v1.0.4', '1122334', 'production', 'SUCCESS', 'Jenkins #89', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '2 minutes' FROM services WHERE name = 'notification-service';
INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v1.0.5', '5566778', 'production', 'SUCCESS', 'Jenkins #95', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '2 minutes' FROM services WHERE name = 'notification-service';

INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v2.0.0', 'a9b8c7d', 'production', 'SUCCESS', 'Jenkins #150', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '3 minutes' FROM services WHERE name = 'inventory-service';
INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v2.0.1', 'd7e6f5a', 'production', 'SUCCESS', 'Jenkins #158', NOW() - INTERVAL '18 hours', NOW() - INTERVAL '18 hours' + INTERVAL '3 minutes' FROM services WHERE name = 'inventory-service';

INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v1.2.3', '9988776', 'production', 'SUCCESS', 'Jenkins #72', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days' + INTERVAL '4 minutes' FROM services WHERE name = 'shipping-service';
INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v1.2.4', '3344556', 'production', 'SUCCESS', 'Jenkins #79', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '4 minutes' FROM services WHERE name = 'shipping-service';

INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v2.2.9', 'fa1b2c3', 'production', 'SUCCESS', 'Jenkins #110', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days' + INTERVAL '3 minutes' FROM services WHERE name = 'customer-service';
INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v2.3.0', '7c8d9e0', 'production', 'SUCCESS', 'Jenkins #115', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '3 minutes' FROM services WHERE name = 'customer-service';

INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v1.8.9', '8877665', 'production', 'SUCCESS', 'Jenkins #60', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days' + INTERVAL '5 minutes' FROM services WHERE name = 'analytics-service';
INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v1.9.0', '2233445', 'production', 'SUCCESS', 'Jenkins #67', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '5 minutes' FROM services WHERE name = 'analytics-service';

INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v0.8.1', 'bbccdde', 'staging', 'FAILED', 'Jenkins #40', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '1 minute' FROM services WHERE name = 'reporting-service';
INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v0.8.2', 'eeddccb', 'staging', 'SUCCESS', 'Jenkins #41', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '3 minutes' FROM services WHERE name = 'reporting-service';

INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v2.1.0', '5a6b7c8', 'production', 'SUCCESS', 'Jenkins #180', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours' + INTERVAL '4 minutes' FROM services WHERE name = 'fraud-detection-service';

-- 5. Insert 8 Realistic Incidents
INSERT INTO incidents (service_id, title, description, severity, status, created_by, assigned_to, created_at)
SELECT id, 'Payment API 5xx errors spiked to 14% with high DB connection utilization', 'Payment API p99 latency surged from 180ms to 2.1s. 5xx errors reached 14.1%. HikariCP pool saturated at 94% following deployment v2.8.1.', 'CRITICAL', 'INVESTIGATING', 'alertmanager@opsmind.io', 'devops', NOW() - INTERVAL '18 minutes'
FROM services WHERE name = 'payment-service';

INSERT INTO incidents (service_id, title, description, severity, status, created_by, assigned_to, created_at, resolved_at)
SELECT id, 'Redis cache eviction caused temporary p95 latency elevation in auth tokens', 'Cache node memory pressure led to early evictions of session cache; DB fallback handled requests safely.', 'MEDIUM', 'RESOLVED', 'monitor@opsmind.io', 'security-team', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '45 minutes'
FROM services WHERE name = 'auth-service';

INSERT INTO incidents (service_id, title, description, severity, status, created_by, assigned_to, created_at, resolved_at)
SELECT id, 'Checkout webhook retries delayed due to upstream third-party bank gateway', 'Downstream bank gateway responded with 504 gateway timeout for card pre-authorizations.', 'HIGH', 'RESOLVED', 'alertmanager@opsmind.io', 'payments-team', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '1 hour'
FROM services WHERE name = 'order-service';

INSERT INTO incidents (service_id, title, description, severity, status, created_by, assigned_to, created_at, resolved_at)
SELECT id, 'SMS delivery queue backlog during marketing campaign push', 'Twilio API rate limits throttled SMS dispatch rate; queue drained after 35 minutes.', 'LOW', 'RESOLVED', 'oncall@opsmind.io', 'core-team', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '2 hours'
FROM services WHERE name = 'notification-service';

INSERT INTO incidents (service_id, title, description, severity, status, created_by, assigned_to, created_at, resolved_at)
SELECT id, 'PostgreSQL read replica replication lag exceeded 15 seconds', 'WAL sender process on master encountered I/O bottleneck during daily snapshot backup.', 'MEDIUM', 'RESOLVED', 'alertmanager@opsmind.io', 'devops', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '30 minutes'
FROM services WHERE name = 'inventory-service';

INSERT INTO incidents (service_id, title, description, severity, status, created_by, assigned_to, created_at)
SELECT id, 'FedEx API rate limit breached during peak packing hours', 'Carrier rate-limiting caused retry delays in barcode dispatch queue.', 'MEDIUM', 'OPEN', 'alertmanager@opsmind.io', 'logistics-team', NOW() - INTERVAL '40 minutes'
FROM services WHERE name = 'shipping-service';

INSERT INTO incidents (service_id, title, description, severity, status, created_by, assigned_to, created_at, resolved_at)
SELECT id, 'Memory leak detected in report PDF renderer worker pool', 'Worker pool memory consumption scaled linearly until pod OOM restart was initiated.', 'HIGH', 'RESOLVED', 'alertmanager@opsmind.io', 'finance-team', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '3 hours'
FROM services WHERE name = 'reporting-service';

INSERT INTO incidents (service_id, title, description, severity, status, created_by, assigned_to, created_at, resolved_at)
SELECT id, 'High model inference latency during spike in holiday transaction traffic', 'GPU inference node auto-scaling lagged by 8 minutes before extra capacity attached.', 'LOW', 'RESOLVED', 'risk-oncall@opsmind.io', 'risk-team', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days' + INTERVAL '20 minutes'
FROM services WHERE name = 'fraud-detection-service';

-- 6. Insert Timeline Events for active Flagship Incident
INSERT INTO incident_events (incident_id, event_type, description, created_by, timestamp)
SELECT id, 'DEPLOYMENT', 'payment-service v2.8.1 deployed to production by Jenkins pipeline #142', 'Jenkins', NOW() - INTERVAL '21 minutes'
FROM incidents WHERE title LIKE 'Payment API 5xx errors spiked%';

INSERT INTO incident_events (incident_id, event_type, description, created_by, timestamp)
SELECT id, 'ALERT_TRIGGERED', 'HighLatencyAlert: p99 latency exceeded 2000ms threshold (measured 2100ms)', 'Alertmanager', NOW() - INTERVAL '19 minutes'
FROM incidents WHERE title LIKE 'Payment API 5xx errors spiked%';

INSERT INTO incident_events (incident_id, event_type, description, created_by, timestamp)
SELECT id, 'ALERT_TRIGGERED', 'HighErrorRateAlert: 5xx error rate exceeded 5% threshold (measured 14.1%)', 'Alertmanager', NOW() - INTERVAL '18 minutes'
FROM incidents WHERE title LIKE 'Payment API 5xx errors spiked%';

INSERT INTO incident_events (incident_id, event_type, description, created_by, timestamp)
SELECT id, 'STATUS_CHANGE', 'Incident status escalated to INVESTIGATING by on-call SRE engineer', 'devops', NOW() - INTERVAL '14 minutes'
FROM incidents WHERE title LIKE 'Payment API 5xx errors spiked%';

-- 7. Insert Metrics Telemetry for payment-service
INSERT INTO metrics_snapshots (service_id, latency_ms, error_rate_percent, cpu_usage_percent, memory_usage_percent, db_connections_utilization_percent, captured_at)
SELECT id, 180.0, 0.4, 32.5, 48.0, 55.0, NOW() - INTERVAL '30 minutes' FROM services WHERE name = 'payment-service';
INSERT INTO metrics_snapshots (service_id, latency_ms, error_rate_percent, cpu_usage_percent, memory_usage_percent, db_connections_utilization_percent, captured_at)
SELECT id, 185.0, 0.4, 34.0, 49.5, 56.0, NOW() - INTERVAL '25 minutes' FROM services WHERE name = 'payment-service';
INSERT INTO metrics_snapshots (service_id, latency_ms, error_rate_percent, cpu_usage_percent, memory_usage_percent, db_connections_utilization_percent, captured_at)
SELECT id, 850.0, 4.2, 58.0, 65.0, 78.0, NOW() - INTERVAL '20 minutes' FROM services WHERE name = 'payment-service';
INSERT INTO metrics_snapshots (service_id, latency_ms, error_rate_percent, cpu_usage_percent, memory_usage_percent, db_connections_utilization_percent, captured_at)
SELECT id, 2100.0, 14.1, 74.0, 78.5, 94.0, NOW() - INTERVAL '15 minutes' FROM services WHERE name = 'payment-service';
INSERT INTO metrics_snapshots (service_id, latency_ms, error_rate_percent, cpu_usage_percent, memory_usage_percent, db_connections_utilization_percent, captured_at)
SELECT id, 2150.0, 14.3, 76.0, 81.0, 95.0, NOW() - INTERVAL '5 minutes' FROM services WHERE name = 'payment-service';

-- 8. Insert Audit Logs
INSERT INTO audit_logs (username, action, resource, details, ip_address, timestamp) VALUES
    ('jenkins', 'DEPLOYMENT_COMPLETED', 'payment-service:v2.8.1', 'Automated release deployed to production cluster', '10.0.1.5', NOW() - INTERVAL '21 minutes'),
    ('system', 'INCIDENT_CREATED', 'incident:payment-service', 'Prometheus high error rate rule triggered SEV-1 incident', '127.0.0.1', NOW() - INTERVAL '18 minutes'),
    ('devops', 'INCIDENT_STATUS_UPDATED', 'incident:payment-service', 'Status updated to INVESTIGATING', '192.168.1.50', NOW() - INTERVAL '14 minutes');
