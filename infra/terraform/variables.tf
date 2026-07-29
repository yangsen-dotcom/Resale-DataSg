variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ap-southeast-1"
}

variable "environment" {
  description = "Deployment environment name, used for tagging and naming"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Short name used as a prefix for resource names"
  type        = string
  default     = "resale-datasg"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "AZs to spread public/private subnets across"
  type        = list(string)
  default     = ["ap-southeast-1a", "ap-southeast-1b"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (ALB, NAT gateway)"
  type        = list(string)
  default     = ["10.0.0.0/24", "10.0.1.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (ECS tasks, RDS)"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "db_name" {
  description = "Name of the application database"
  type        = string
  default     = "resale_datasg"
}

variable "db_username" {
  description = "Master username for the RDS instance"
  type        = string
  default     = "resale_datasg"
}

variable "db_instance_class" {
  description = "RDS instance class (single-AZ db.t4g.micro is sized for this demo, not production load)"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage_gb" {
  description = "Allocated storage for RDS, in GB"
  type        = number
  default     = 20
}

variable "redis_node_type" {
  description = "ElastiCache node type (single-node cache.t4g.micro is sized for this demo, not production load)"
  type        = string
  default     = "cache.t4g.micro"
}

variable "backend_image_tag" {
  description = "Tag of the backend image in ECR to deploy"
  type        = string
  default     = "latest"
}

variable "backend_task_cpu" {
  description = "Fargate task CPU units for the backend service (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "backend_task_memory" {
  description = "Fargate task memory in MB for the backend service"
  type        = number
  default     = 512
}

variable "backend_desired_count" {
  description = "Number of backend tasks to run (no autoscaling configured for this demo stack)"
  type        = number
  default     = 1
}

variable "backend_container_port" {
  description = "Port the backend container listens on"
  type        = number
  default     = 9090
}
