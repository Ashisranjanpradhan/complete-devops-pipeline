-- OpsMind AI V2 Initial Seed Data

-- Insert Roles
INSERT INTO roles (name, description) VALUES
    ('ROLE_ADMIN', 'Platform Administrator with full access'),
    ('ROLE_DEVOPS_ENGINEER', 'DevOps Engineer with deployment and infrastructure controls'),
    ('ROLE_DEVELOPER', 'Developer with service, deployment and incident access'),
    ('ROLE_VIEWER', 'Read-only viewer for metrics, dashboards and reports')
ON CONFLICT (name) DO NOTHING;

-- Insert Default Demo Users (Password: admin123 / password123)
-- BCrypt for 'admin123': $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi (standard test hash for 'password')
-- Or BCrypt for 'password123': $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG
INSERT INTO users (username, email, password_hash, full_name, enabled) VALUES
    ('admin', 'admin@opsmind.io', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'OpsMind Admin', true),
    ('devops', 'devops@opsmind.io', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'DevOps Specialist', true),
    ('developer', 'developer@opsmind.io', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Software Engineer', true),
    ('viewer', 'viewer@opsmind.io', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Operations Viewer', true)
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

-- Insert Seed Services
INSERT INTO services (name, description, repository_url, environment, owner, current_version, health_status) VALUES
    ('payment-service', 'Handles billing, subscriptions, and payment gateway webhooks', 'github.com/company/payment-service', 'production', 'payments-team', 'v2.8.1', 'DEGRADED'),
    ('auth-service', 'Authentication, OAuth2 tokens, and user credentials provider', 'github.com/company/auth-service', 'production', 'security-team', 'v1.4.2', 'HEALTHY'),
    ('order-service', 'Order lifecycle processing, cart management, and inventory checkout', 'github.com/company/order-service', 'staging', 'orders-team', 'v3.1.0', 'HEALTHY'),
    ('notification-service', 'Transactional emails, SMS dispatch, and Slack alert integrations', 'github.com/company/notification-service', 'production', 'core-team', 'v1.0.5', 'HEALTHY')
ON CONFLICT (name) DO NOTHING;

-- Insert Deployments for payment-service
INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v2.8.0', 'e5c9b12', 'production', 'SUCCESS', 'Jenkins', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '4 minutes'
FROM services WHERE name = 'payment-service';

INSERT INTO deployments (service_id, version, commit_hash, environment, status, triggered_by, started_at, completed_at)
SELECT id, 'v2.8.1', 'a72f93c', 'production', 'SUCCESS', 'Jenkins', NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '21 minutes'
FROM services WHERE name = 'payment-service';

-- Insert Active Incident
INSERT INTO incidents (service_id, title, description, severity, status, created_by, assigned_to, created_at)
SELECT id, 'Payment API 5xx errors spiked to 14% with high DB connection utilization', 'Payment API latency increased from 180ms to 2.1s. 5xx errors increased from 0.4% to 14%. HikariCP connection pool saturated at 94%.', 'HIGH', 'INVESTIGATING', 'alertmanager@opsmind.io', 'devops', NOW() - INTERVAL '18 minutes'
FROM services WHERE name = 'payment-service';

-- Insert Incident Events
INSERT INTO incident_events (incident_id, event_type, description, created_by, timestamp)
SELECT id, 'DEPLOYMENT', 'payment-service v2.8.1 deployed to production by Jenkins pipeline #142', 'Jenkins', NOW() - INTERVAL '21 minutes'
FROM incidents WHERE title LIKE 'Payment API 5xx errors spiked%';

INSERT INTO incident_events (incident_id, event_type, description, created_by, timestamp)
SELECT id, 'ALERT_TRIGGERED', 'HighLatencyAlert: p99 latency exceeded 2000ms threshold (measured 2100ms)', 'Alertmanager', NOW() - INTERVAL '19 minutes'
FROM incidents WHERE title LIKE 'Payment API 5xx errors spiked%';

INSERT INTO incident_events (incident_id, event_type, description, created_by, timestamp)
SELECT id, 'ALERT_TRIGGERED', 'HighErrorRateAlert: 5xx error rate exceeded 5% threshold (measured 14%)', 'Alertmanager', NOW() - INTERVAL '18 minutes'
FROM incidents WHERE title LIKE 'Payment API 5xx errors spiked%';

INSERT INTO incident_events (incident_id, event_type, description, created_by, timestamp)
SELECT id, 'STATUS_CHANGE', 'Incident status moved to INVESTIGATING by on-call engineer', 'devops', NOW() - INTERVAL '12 minutes'
FROM incidents WHERE title LIKE 'Payment API 5xx errors spiked%';

-- Insert Metrics Snapshots for payment-service
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

-- Insert Audit Logs
INSERT INTO audit_logs (username, action, resource, details, ip_address, timestamp) VALUES
    ('jenkins', 'DEPLOYMENT_COMPLETED', 'payment-service:v2.8.1', 'Automated deployment succeeded in 4 minutes', '10.0.1.5', NOW() - INTERVAL '21 minutes'),
    ('system', 'INCIDENT_CREATED', 'incident:payment-service', 'Incident opened due to prometheus high error rate alert', '127.0.0.1', NOW() - INTERVAL '18 minutes'),
    ('devops', 'INCIDENT_UPDATED', 'incident:payment-service', 'Status changed from OPEN to INVESTIGATING', '192.168.1.100', NOW() - INTERVAL '12 minutes');
