module "opsmind_dev" {
  source              = "../../"
  environment         = "dev"
  aws_region          = "us-east-1"
  vpc_cidr            = "10.10.0.0/16"
  public_subnet_cidrs = ["10.10.1.0/24", "10.10.2.0/24"]
  private_subnet_cidrs= ["10.10.10.0/24", "10.10.11.0/24"]
  availability_zones  = ["us-east-1a", "us-east-1b"]
  instance_type       = "t3.medium"
  min_instances       = 1
  max_instances       = 3
  desired_instances   = 1
  db_instance_class   = "db.t4g.micro"
  allocated_storage   = 20
  db_name             = "opsmind_dev"
  db_username         = "opsmind_dev_user"
  db_password         = "DevOpsMind2026Password!"
}

output "dev_alb_dns" {
  value = module.opsmind_dev.alb_dns_name
}
