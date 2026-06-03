provider "aws" {
  region = "us-west-2"
}

data "aws_s3_bucket" "test" {
  bucket = "test-bucket"
}

# Ref: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudfront_distribution
resource "aws_cloudfront_distribution" "test" {
  origin {
    domain_name = data.aws_s3_bucket.test.bucket_domain_name
    origin_id   = "s3-test-bucket"
  }

  viewer_certificate {}

  restrictions {
    geo_restriction {
      restriction_type = ""
    }
  }

  default_cache_behavior {
    allowed_methods = [ "GET" ]
    cached_methods = [ "GET" ]
    target_origin_id = ""
    viewer_protocol_policy = ""
  }

  enabled = true
}
