# Disaster Recovery & Business Continuity Guide — OpsMind AI

## 1. Objectives & SLA Targets

| Metric | Target SLA | Strategy |
|---|---|---|
| **Recovery Point Objective (RPO)** | 15 Minutes | Automated WAL archiving + daily AWS RDS snapshots |
| **Recovery Time Objective (RTO)** | 60 Minutes | Terraform automated cluster rebuild + RDS PITR |
| **Availability Target** | 99.9% | Multi-AZ ECS Fargate + RDS PostgreSQL standby |

---

## 2. Backup Architecture

### Automated PostgreSQL Snapshots
- Nightly full database backup stored in immutable AWS S3 bucket.
- 30-day retention period with S3 Glacier lifecycle transition after 14 days.
- Transaction logs (WAL) streamed continuously to support Point-In-Time-Recovery (PITR).

### Manual Backup Command
```bash
docker exec -t opsmind-db pg_dump -U opsmind_user opsmind_db | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

---

## 3. Step-by-Step Restoration Procedure

### Scenario A: Local / Staging Container Restoration
1. Stop running application containers:
   ```bash
   docker compose stop backend frontend
   ```
2. Drop and recreate target database:
   ```bash
   docker exec -i opsmind-db psql -U opsmind_user -c "DROP DATABASE opsmind_db; CREATE DATABASE opsmind_db;"
   ```
3. Restore from snapshot:
   ```bash
   gunzip -c backup_latest.sql.gz | docker exec -i opsmind-db psql -U opsmind_user -d opsmind_db
   ```
4. Restart application services:
   ```bash
   docker compose start backend frontend
   ```
5. Execute smoke tests to verify integrity:
   ```bash
   make smoke-test
   ```

### Scenario B: Cloud Infrastructure Loss (AWS Disaster Recovery)
1. Run Terraform against DR secondary region:
   ```bash
   cd infra/terraform/environments/prod
   terraform apply -var="aws_region=us-west-2"
   ```
2. Restore RDS instance from latest cross-region snapshot.
3. Deploy latest immutable container images from ECR.
4. Update Route 53 DNS records to failover to secondary ALB.
