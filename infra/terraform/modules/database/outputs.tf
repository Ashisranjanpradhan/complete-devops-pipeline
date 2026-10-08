output "db_instance_id" {
  description = "The RDS instance ID"
  value       = aws_db_instance.postgres.id
}

output "db_endpoint" {
  description = "Connection endpoint of the PostgreSQL database"
  value       = aws_db_instance.postgres.endpoint
}

output "db_host" {
  description = "Host address of the PostgreSQL database"
  value       = aws_db_instance.postgres.address
}

output "db_port" {
  description = "Port of the PostgreSQL database"
  value       = aws_db_instance.postgres.port
}

output "db_name" {
  description = "Name of the default PostgreSQL database"
  value       = aws_db_instance.postgres.db_name
}
