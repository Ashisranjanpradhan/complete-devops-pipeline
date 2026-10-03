# CloudWatch Monitoring & Alerting Module for OpsMind

resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/opsmind/${var.environment}/backend"
  retention_in_days = var.environment == "prod" ? 90 : 14

  tags = {
    Environment = var.environment
    Service     = "OpsMind"
  }
}

# CPU Utilization Alarm for Application Auto-Scaling Group
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "${var.environment}-opsmind-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Triggers when OpsMind backend CPU exceeds 80%"

  dimensions = {
    AutoScalingGroupName = var.asg_name
  }

  tags = {
    Environment = var.environment
  }
}

# Database Connection Saturation Alarm
resource "aws_cloudwatch_metric_alarm" "db_connections" {
  alarm_name          = "${var.environment}-opsmind-db-connections-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = 90
  alarm_description   = "Triggers when RDS PostgreSQL connection pool reaches saturation"

  dimensions = {
    DBInstanceIdentifier = var.db_instance_id
  }

  tags = {
    Environment = var.environment
  }
}
