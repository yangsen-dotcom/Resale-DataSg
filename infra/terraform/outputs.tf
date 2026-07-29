output "alb_dns_name" {
  description = "Public DNS name of the backend load balancer"
  value       = aws_lb.backend.dns_name
}

output "cloudfront_domain_name" {
  description = "Public domain name serving the frontend SPA"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "rds_endpoint" {
  description = "RDS Postgres endpoint (non-sensitive; credentials live in Secrets Manager)"
  value       = aws_db_instance.main.endpoint
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint used for backend response caching"
  value       = aws_elasticache_cluster.main.cache_nodes[0].address
}

output "ecr_repository_url" {
  description = "ECR repository URL to push the backend image to before applying"
  value       = aws_ecr_repository.backend.repository_url
}

output "frontend_bucket_name" {
  description = "S3 bucket holding the built frontend assets"
  value       = aws_s3_bucket.frontend.bucket
}

output "db_credentials_secret_arn" {
  description = "Secrets Manager ARN holding the RDS master credentials"
  value       = aws_secretsmanager_secret.db_credentials.arn
}
