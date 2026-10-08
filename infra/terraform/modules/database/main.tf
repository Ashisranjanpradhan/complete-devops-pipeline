# PostgreSQL Database Module (AWS RDS)

resource "aws_db_subnet_group" "main" {
  name        = "${var.environment}-opsmind-db-subnet-group"
  subnet_ids  = var.private_subnet_ids
  description = "Subnet group for OpsMind PostgreSQL database"

  tags = {
    Environment = var.environment
  }
}

resource "aws_db_instance" "postgres" {
  identifier           = "${var.environment}-opsmind-postgres"
  engine               = "postgres"
  engine_version       = "16.3"
  instance_class       = var.db_instance_class
  allocated_storage    = var.allocated_storage
  max_allocated_storage = 100
  storage_type         = "gp3"
  storage_encrypted    = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  port     = 5432

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.db_security_group_id]

  multi_az            = var.multi_az
  publicly_accessible = false
  skip_final_snapshot = var.environment != "prod"
  final_snapshot_identifier = "${var.environment}-opsmind-final-snapshot"

  backup_retention_period = var.environment == "prod" ? 30 : 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Sun:04:30-Sun:05:30"

  auto_minor_version_upgrade = true
  deletion_protection        = var.environment == "prod"

  tags = {
    Name        = "${var.environment}-opsmind-postgres"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
