terraform {
  required_version = ">= 1.7"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Not configured for this assessment (state is local and this stack is never
  # applied). Before running this against a real AWS account, configure a remote
  # backend so state is shared/locked, e.g.:
  #
  # backend "s3" {
  #   bucket         = "resale-datasg-tfstate"
  #   key            = "resale-datasg/terraform.tfstate"
  #   region         = "ap-southeast-1"
  #   dynamodb_table = "resale-datasg-tfstate-lock"
  #   encrypt        = true
  # }
}
