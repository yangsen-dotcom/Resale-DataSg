resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-redis-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = { Name = "${var.project_name}-redis-subnet-group" }
}

resource "aws_elasticache_cluster" "main" {
  cluster_id      = "${var.project_name}-${var.environment}"
  engine          = "redis"
  engine_version  = "7.1"
  node_type       = var.redis_node_type
  num_cache_nodes = 1
  port            = 6379

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  # Single node, no AUTH token / encryption-in-transit — this cache only ever
  # holds derived, non-sensitive chart aggregates (never credentials or PII),
  # so the RDS-grade hardening (Secrets Manager, encryption) isn't warranted
  # here; see the terraform README's "deliberately out of scope" section.
  apply_immediately = true

  tags = { Name = "${var.project_name}-redis" }
}
