# Observability & Metrics Guide — OpsMind AI

## 1. Observability Architecture

OpsMind AI implements a complete three-pillar observability pipeline:

```text
               ┌───────────────────────────────┐
               │    Spring Boot Application    │
               │   (Micrometer + Actuator)     │
               └──────────────┬────────────────┘
                              │
                    /actuator/prometheus
                              │ (15s scrape interval)
                              v
               ┌───────────────────────────────┐
               │      Prometheus Server        │
               │         (:9090)               │
               └──────────────┬────────────────┘
                              │
                    PromQL Datasource
                              │
                              v
               ┌───────────────────────────────┐
               │       Grafana Dashboards      │
               │         (:3000)               │
               └───────────────────────────────┘
```

---

## 2. Core Telemetry Metrics

| Metric Key | Type | Description | Alert Threshold |
|---|---|---|---|
| `http_server_requests_seconds_count` | Counter | Total HTTP requests handled | Spike > 500 rps |
| `http_server_requests_seconds_max` | Gauge | Maximum response latency | > 2000 ms (Critical) |
| `jvm_memory_used_bytes` | Gauge | JVM heap memory consumption | > 85% max heap |
| `hikaricp_connections_active` | Gauge | Active DB connections | > 80% pool capacity |
| `hikaricp_connections_pending` | Gauge | Threads waiting for connection | > 5 pending |
| `system_cpu_usage` | Gauge | System CPU utilization percentage | > 80% CPU |

---

## 3. Prometheus Alerting Rules

Configured alerts in `monitoring/prometheus/alert_rules.yml`:

```yaml
groups:
  - name: opsmind_service_alerts
    rules:
      - alert: HighErrorRateAlert
        expr: sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) / sum(rate(http_server_requests_seconds_count[5m])) * 100 > 5
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "HTTP 5xx error rate exceeded 5% threshold"

      - alert: DatabaseConnectionPoolExhaustion
        expr: hikaricp_connections_active / hikaricp_connections_max * 100 > 85
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "HikariCP database connection pool utilization > 85%"
```

---

## 4. Provisioned Grafana Dashboards

Grafana dashboards are auto-provisioned via Docker Compose:
- **OpsMind Executive Overview:** Global error rate, request volume, p95/p99 response times, and health statuses.
- **JVM & Memory Telemetry:** Heap allocation, GC pause durations, and thread pool activity.
- **Database Connection Pool:** HikariCP active connections, acquire latency, and pending connection queues.
