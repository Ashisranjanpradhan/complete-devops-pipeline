output "alb_dns_name" {
  description = "Public URL / DNS of Application Load Balancer"
  value       = module.compute.alb_dns_name
}

output "database_endpoint" {
  description = "PostgreSQL RDS endpoint"
  value       = module.database.db_endpoint
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group name for application logs"
  value       = module.monitoring.log_group_name
}
