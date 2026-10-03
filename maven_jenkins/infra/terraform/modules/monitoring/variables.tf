variable "environment" {
  description = "Deployment environment (e.g. dev, prod)"
  type        = string
}

variable "alb_arn_suffix" {
  description = "Target group or ALB ARN suffix for CloudWatch metrics"
  type        = string
  default     = ""
}

variable "asg_name" {
  description = "Auto-scaling group name to monitor"
  type        = string
  default     = ""
}

variable "db_instance_id" {
  description = "RDS instance ID to monitor"
  type        = string
  default     = ""
}
