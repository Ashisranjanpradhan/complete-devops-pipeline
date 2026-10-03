module "opsmind_prod" {
  source              = "../../"
  environment         = "prod"
  aws_region          = "us-east-1"
  vpc_cidr            = "10.20.0.0/16"
  public_subnet_cidrs = ["10.20.1.0/24", "10.20.2.0/24"]
  private_subnet_cidrs= ["10.20.10.0/24", "10.20.11.0/24"]
  availability_zones  = ["us-east-1a", "us-east-1b"]
  instance_type       = "t3.large"
  min_instances       = 2
  max_instances       = 6
  desired_instances   = 3
  db_instance_class   = "db.r6g.large"
  allocated_storage   = 100
  db_name             = "opsmind_prod"
  db_username         = "opsmind_prod_admin"
  db_password         = "OpsMindProductionSecured2026MasterKey!"
}

output "prod_alb_dns" {
  value = module.opsmind_prod.alb_dns_name
}
