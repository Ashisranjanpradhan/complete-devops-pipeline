-- OpsMind AI V1 Initial Schema
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS services (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    repository_url VARCHAR(255),
    environment VARCHAR(50) NOT NULL DEFAULT 'production',
    owner VARCHAR(100),
    current_version VARCHAR(50),
    health_status VARCHAR(30) NOT NULL DEFAULT 'HEALTHY',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deployments (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    commit_hash VARCHAR(40),
    environment VARCHAR(50) NOT NULL DEFAULT 'production',
    status VARCHAR(30) NOT NULL DEFAULT 'QUEUED',
    triggered_by VARCHAR(100),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    rollback_of_id BIGINT REFERENCES deployments(id)
);

CREATE TABLE IF NOT EXISTS incidents (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    created_by VARCHAR(100),
    assigned_to VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS incident_events (
    id BIGSERIAL PRIMARY KEY,
    incident_id BIGINT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    created_by VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_analyses (
    id BIGSERIAL PRIMARY KEY,
    incident_id BIGINT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    probable_root_cause TEXT NOT NULL,
    evidence TEXT NOT NULL,
    recommendations TEXT NOT NULL,
    investigation_steps TEXT,
    confidence DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    risk_level VARCHAR(30) DEFAULT 'HIGH',
    model_name VARCHAR(100) DEFAULT 'opsmind-ai-correlator',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS metrics_snapshots (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    latency_ms DOUBLE PRECISION NOT NULL,
    error_rate_percent DOUBLE PRECISION NOT NULL,
    cpu_usage_percent DOUBLE PRECISION NOT NULL,
    memory_usage_percent DOUBLE PRECISION NOT NULL,
    db_connections_utilization_percent DOUBLE PRECISION NOT NULL,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_services_env ON services(environment);
CREATE INDEX IF NOT EXISTS idx_deployments_service_id ON deployments(service_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_incidents_service_id ON incidents(service_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incident_events_incident ON incident_events(incident_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_incident ON ai_analyses(incident_id);
CREATE INDEX IF NOT EXISTS idx_metrics_service_time ON metrics_snapshots(service_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_time ON audit_logs(username, timestamp DESC);
