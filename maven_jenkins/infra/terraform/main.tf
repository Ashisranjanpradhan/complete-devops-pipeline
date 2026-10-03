module "network" {
  source               = "./modules/network"
  environment          = var.environment
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = var.availability_zones
}

module "database" {
  source                = "./modules/database"
  environment           = var.environment
  private_subnet_ids    = module.network.private_subnet_ids
  db_security_group_id  = module.network.db_security_group_id
  db_instance_class     = var.db_instance_class
  allocated_storage     = var.allocated_storage
  db_name               = var.db_name
  db_username           = var.db_username
  db_password           = var.db_password
  multi_az              = var.environment == "prod"
}

module "compute" {
  source                = "./modules/compute"
  environment           = var.environment
  vpc_id                = module.network.vpc_id
  public_subnet_ids     = module.network.public_subnet_ids
  private_subnet_ids    = module.network.private_subnet_ids
  alb_security_group_id = module.network.alb_security_group_id
  app_security_group_id = module.network.app_security_group_id
  instance_type         = var.instance_type
  ami_id                = var.ami_id
  min_instances         = var.min_instances
  max_instances         = var.max_instances
  desired_instances     = var.desired_instances
  db_host               = module.database.db_host
  db_name               = module.database.db_name
  db_username           = var.db_username
  db_password           = var.db_password
}

module "monitoring" {
  source         = "./modules/monitoring"
  environment    = var.environment
  asg_name       = module.compute.asg_name
  db_instance_id = module.database.db_instance_id
}
