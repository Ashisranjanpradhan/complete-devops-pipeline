output "log_group_name" {
  description = "Name of the application CloudWatch log group"
  value       = aws_cloudwatch_log_group.app_logs.name
}

output "log_group_arn" {
  description = "ARN of the application CloudWatch log group"
  value       = aws_cloudwatch_log_group.app_logs.arn
}

output "cpu_alarm_arn" {
  description = "ARN of high CPU CloudWatch alarm"
  value       = aws_cloudwatch_metric_alarm.high_cpu.arn
}

output "db_connections_alarm_arn" {
  description = "ARN of RDS database connections CloudWatch alarm"
  value       = aws_cloudwatch_metric_alarm.db_connections.arn
}
