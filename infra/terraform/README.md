# Infrastructure as Code — AWS

Terraform defining the AWS infrastructure this application would run on. **This
stack is intentionally never applied** for this assessment (deployment isn't
required, and `apply` would incur real AWS costs) — it exists to demonstrate the
target architecture and IaC practice. `terraform init`, `validate`, and `plan`
(with valid AWS credentials configured) are the expected ways to review it.

## Architecture

```
                         ┌─────────────────────────┐
 Browser ── HTTPS ──────►│  CloudFront (frontend)   │
                         └────────────┬─────────────┘
                                      │ OAC (private origin)
                                      ▼
                         ┌─────────────────────────┐
                         │  S3 bucket (built SPA)   │
                         └─────────────────────────┘

                         ┌─────────────────────────┐
 Browser ── HTTP ───────►│  ALB (public subnets)    │
                         └────────────┬─────────────┘
                                      │
                          private subnets (2 AZs)
                                      ▼
                         ┌─────────────────────────┐        ┌──────────────────┐
                         │  ECS Fargate: backend    │──────► │ Secrets Manager  │
                         │  (image from ECR)        │        │ (DB credentials) │
                         └────────────┬─────────────┘        └──────────────────┘
                                      ▼
                         ┌─────────────────────────┐
                         │  RDS PostgreSQL          │
                         │  (private subnets)       │
                         └─────────────────────────┘
```

- **Frontend**: S3 (private bucket, no public access) + CloudFront with Origin
  Access Control, so the bucket is only readable through CloudFront. SPA routing
  is handled via 403/404 → `index.html` custom error responses.
- **Backend**: ECS Fargate service running the backend container (built from
  `resale-datasg-backend/Dockerfile`, pushed to the ECR repo this stack creates),
  in private subnets, behind an internet-facing ALB in public subnets.
- **Database**: RDS PostgreSQL, private subnets only, security group restricted to
  inbound 5432 from the ECS service's security group. Credentials are generated
  with `random_password` and stored in Secrets Manager; the ECS task pulls them in
  via `secrets` (not plain environment variables).
- **Networking**: one VPC, 2 AZs, 2 public + 2 private subnets, single NAT gateway
  (cost-conscious default — see below).
- **IAM**: separate ECS task **execution** role (pull from ECR, write CloudWatch
  logs, read the one Secrets Manager secret) and task **role** (empty beyond its
  trust policy — the backend doesn't call other AWS APIs). Neither uses a broad
  managed policy like `AdministratorAccess`.

## Deliberately out of scope

Called out here so it reads as a conscious choice, not an oversight:

- **Custom domain / ACM / HTTPS on the ALB** — this stack is never applied, so
  there's no real domain to attach. The ALB and CloudFront both use their default
  AWS-provided endpoints (CloudFront still terminates TLS on `*.cloudfront.net`).
- **Autoscaling** — `desired_count = 1`, no target-tracking policy. A demo
  workload doesn't need to demonstrate scaling, and an unused scaling policy is
  surface area with nothing to validate it against.
- **RDS Multi-AZ** — single-AZ to halve cost for a database that's never actually
  under production traffic. The DB subnet group already spans 2 AZs, so
  `multi_az = true` is a one-line change later.
- **WAF, VPC flow logs, CloudTrail** — not essential to demonstrating the core
  application architecture pattern.

## Variables

| Variable | Default | Description |
|---|---|---|
| `aws_region` | `ap-southeast-1` | Region to deploy into |
| `environment` | `dev` | Used for tagging/naming |
| `project_name` | `resale-datasg` | Prefix for resource names |
| `vpc_cidr` | `10.0.0.0/16` | VPC CIDR block |
| `availability_zones` | 2 AZs in `ap-southeast-1` | AZs for subnets |
| `public_subnet_cidrs` / `private_subnet_cidrs` | `/24`s | Subnet CIDRs |
| `db_instance_class` | `db.t4g.micro` | RDS instance size |
| `db_allocated_storage_gb` | `20` | RDS storage |
| `backend_task_cpu` / `backend_task_memory` | `256` / `512` | Fargate task sizing |
| `backend_desired_count` | `1` | ECS service size |
| `backend_image_tag` | `latest` | Image tag in ECR to deploy |

## Reviewing this stack

```bash
cd infra/terraform
terraform init
terraform validate
terraform fmt -check
terraform plan   # requires AWS credentials; shows the full resource graph
```

`terraform apply` is intentionally not run as part of this assessment.

## If this were carried further

1. `docker build -t <ecr-repo-url>:<tag> resale-datasg-backend` and
   `docker push`, using the `ecr_repository_url` output.
2. `terraform apply` to roll a new ECS task definition revision referencing that
   tag, and to publish the frontend build to the S3 bucket (`aws s3 sync
   resale-datasg-frontend/dist s3://<frontend_bucket_name>`, then a CloudFront
   invalidation).
3. Extract `network`, `ecs-service`, and `rds` into reusable modules once a second
   environment (e.g. `staging`) is needed — a flat root module was the right call
   for one never-deployed demo environment, but stops paying off once resources
   are duplicated across environments.
