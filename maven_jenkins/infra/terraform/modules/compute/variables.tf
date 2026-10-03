variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "alb_security_group_id" {
  type = string
}

variable "app_security_group_id" {
  type = string
}

variable "ami_id" {
  type    = string
  default = "ami-0c55b159cbfafe1f0"
}

variable "instance_type" {
  type    = string
  default = "t3.medium"
}

variable "min_instances" {
  type    = number
  default = 2
}

variable "max_instances" {
  type    = number
  default = 6
}

variable "desired_instances" {
  type    = number
  default = 2
}

variable "db_host" {
  type    = string
  default = "localhost"
}

variable "db_name" {
  type    = string
  default = "opsmind"
}

variable "db_username" {
  type    = string
  default = "opsmind"
}

variable "db_password" {
  type      = string
  sensitive = true
}
