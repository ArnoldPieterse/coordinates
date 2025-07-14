# AWS CLI Commands Reference - Latest Best Practices
## IDX-AWS-REF-001: Comprehensive AWS CLI v2 Commands Guide

This document provides a comprehensive reference for AWS CLI commands used in the Coordinates project, updated for AWS CLI v2.27.50 and following latest best practices.

---

## 📋 Table of Contents

1. [Authentication & Configuration](#authentication--configuration)
2. [S3 Storage](#s3-storage)
3. [CloudFront CDN](#cloudfront-cdn)
4. [Route 53 DNS](#route-53-dns)
5. [ACM SSL Certificates](#acm-ssl-certificates)
6. [ECS Container Service](#ecs-container-service)
7. [ECR Container Registry](#ecr-container-registry)
8. [IAM Identity & Access](#iam-identity--access)
9. [CloudWatch Monitoring](#cloudwatch-monitoring)
10. [Lambda Functions](#lambda-functions)
11. [API Gateway](#api-gateway)
12. [VPC & Networking](#vpc--networking)
13. [Security Groups](#security-groups)
14. [Load Balancers](#load-balancers)
15. [Cost Optimization](#cost-optimization)
16. [Troubleshooting](#troubleshooting)

---

## 🔐 Authentication & Configuration

### Configure AWS CLI
```bash
# Configure AWS CLI with credentials
aws configure

# Configure with specific profile
aws configure --profile coordinates-prod

# Set default region
aws configure set region us-east-1

# Set default output format
aws configure set output json

# Verify configuration
aws sts get-caller-identity
```

### Environment Variables
```bash
# Set credentials via environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
export AWS_PROFILE=coordinates-prod

# For Windows PowerShell
$env:AWS_ACCESS_KEY_ID="your_access_key"
$env:AWS_SECRET_ACCESS_KEY="your_secret_key"
$env:AWS_DEFAULT_REGION="us-east-1"
```

### Assume Role
```bash
# Assume IAM role
aws sts assume-role \
    --role-arn arn:aws:iam::123456789012:role/CoordinatesDeploymentRole \
    --role-session-name coordinates-deployment

# Use temporary credentials
export AWS_ACCESS_KEY_ID=temp_access_key
export AWS_SECRET_ACCESS_KEY=temp_secret_key
export AWS_SESSION_TOKEN=temp_session_token
```

---

## 🪣 S3 Storage

### Bucket Management
```bash
# Create S3 bucket
aws s3 mb s3://rekursing-game-assets --region us-east-1

# Create bucket with specific region
aws s3 mb s3://rekursing-game-assets \
    --region us-west-2 \
    --create-bucket-configuration LocationConstraint=us-west-2

# List buckets
aws s3 ls

# Delete bucket (must be empty)
aws s3 rb s3://rekursing-game-assets --force

# Check bucket location
aws s3api get-bucket-location --bucket rekursing-game-assets
```

### Bucket Configuration
```bash
# Configure bucket for static website hosting
aws s3 website s3://rekursing-game-assets \
    --index-document index.html \
    --error-document index.html

# Set bucket policy
aws s3api put-bucket-policy \
    --bucket rekursing-game-assets \
    --policy file://bucket-policy.json

# Enable versioning
aws s3api put-bucket-versioning \
    --bucket rekursing-game-assets \
    --versioning-configuration Status=Enabled

# Configure CORS
aws s3api put-bucket-cors \
    --bucket rekursing-game-assets \
    --cors-configuration file://cors-config.json
```

### File Operations
```bash
# Upload single file
aws s3 cp index.html s3://rekursing-game-assets/

# Upload directory recursively
aws s3 sync dist/ s3://rekursing-game-assets/ --delete

# Upload with specific content type
aws s3 cp file.js s3://rekursing-game-assets/ \
    --content-type application/javascript \
    --cache-control "public, max-age=31536000"

# Download file
aws s3 cp s3://rekursing-game-assets/index.html ./

# Download directory
aws s3 sync s3://rekursing-game-assets/ ./download/

# List objects
aws s3 ls s3://rekursing-game-assets/ --recursive

# Delete object
aws s3 rm s3://rekursing-game-assets/old-file.html

# Delete multiple objects
aws s3 rm s3://rekursing-game-assets/ --recursive --exclude "*" --include "*.tmp"
```

### Performance Optimization
```bash
# Upload with multipart (large files)
aws s3 cp large-file.zip s3://rekursing-game-assets/ \
    --multipart-chunk-size 64MB

# Use transfer acceleration
aws s3 cp file.zip s3://rekursing-game-assets/ \
    --endpoint-url https://s3-accelerate.amazonaws.com

# Set storage class
aws s3 cp file.zip s3://rekursing-game-assets/ \
    --storage-class STANDARD_IA
```

---

## ☁️ CloudFront CDN

### Distribution Management
```bash
# List distributions
aws cloudfront list-distributions

# Get distribution details
aws cloudfront get-distribution --id E1234567890ABCD

# Create distribution
aws cloudfront create-distribution \
    --distribution-config file://cloudfront-config.json

# Update distribution
aws cloudfront update-distribution \
    --id E1234567890ABCD \
    --distribution-config file://updated-config.json \
    --if-match ETAG_VALUE
```

### Cache Management
```bash
# Create invalidation
aws cloudfront create-invalidation \
    --distribution-id E1234567890ABCD \
    --paths "/*"

# Create specific invalidation
aws cloudfront create-invalidation \
    --distribution-id E1234567890ABCD \
    --paths "/css/*" "/js/*"

# List invalidations
aws cloudfront list-invalidations --distribution-id E1234567890ABCD

# Get invalidation status
aws cloudfront get-invalidation \
    --distribution-id E1234567890ABCD \
    --id I1234567890ABCD
```

### Function Management
```bash
# Create function
aws cloudfront create-function \
    --name coordinates-function \
    --function-config file://function-config.json

# Publish function
aws cloudfront publish-function \
    --name coordinates-function \
    --if-match ETAG_VALUE

# Test function
aws cloudfront test-function \
    --name coordinates-function \
    --event-object file://test-event.json \
    --stage LIVE
```

---

## 🌐 Route 53 DNS

### Hosted Zone Management
```bash
# List hosted zones
aws route53 list-hosted-zones

# Get hosted zone details
aws route53 get-hosted-zone --id Z1234567890ABCD

# Create hosted zone
aws route53 create-hosted-zone \
    --name rekursing.com \
    --caller-reference $(date +%s)

# Delete hosted zone
aws route53 delete-hosted-zone --id Z1234567890ABCD
```

### Record Management
```bash
# List resource record sets
aws route53 list-resource-record-sets --hosted-zone-id Z1234567890ABCD

# Change resource record sets
aws route53 change-resource-record-sets \
    --hosted-zone-id Z1234567890ABCD \
    --change-batch file://dns-changes.json

# Get change status
aws route53 get-change --id C1234567890ABCD
```

### Health Checks
```bash
# Create health check
aws route53 create-health-check \
    --health-check-config file://health-check-config.json

# List health checks
aws route53 list-health-checks

# Get health check status
aws route53 get-health-check --health-check-id HC1234567890ABCD
```

---

## 🔒 ACM SSL Certificates

### Certificate Management
```bash
# List certificates
aws acm list-certificates --certificate-statuses ISSUED PENDING_VALIDATION

# Request certificate
aws acm request-certificate \
    --domain-name rekursing.com \
    --subject-alternative-names www.rekursing.com \
    --validation-method DNS

# Get certificate details
aws acm describe-certificate --certificate-arn arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012

# Delete certificate
aws acm delete-certificate --certificate-arn arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012
```

### Certificate Validation
```bash
# List certificate validation records
aws acm describe-certificate \
    --certificate-arn arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012 \
    --query 'Certificate.DomainValidationOptions'

# Resend validation email
aws acm resend-validation-email \
    --certificate-arn arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012 \
    --domain rekursing.com \
    --validation-domain rekursing.com
```

---

## 🐳 ECS Container Service

### Cluster Management
```bash
# List clusters
aws ecs list-clusters

# Create cluster
aws ecs create-cluster \
    --cluster-name coordinates-cluster \
    --capacity-providers FARGATE \
    --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1

# Delete cluster
aws ecs delete-cluster --cluster coordinates-cluster
```

### Task Definition Management
```bash
# Register task definition
aws ecs register-task-definition \
    --cli-input-json file://task-definition.json

# List task definitions
aws ecs list-task-definitions --family-prefix coordinates

# Deregister task definition
aws ecs deregister-task-definition --task-definition coordinates-task:1
```

### Service Management
```bash
# Create service
aws ecs create-service \
    --cluster coordinates-cluster \
    --service-name coordinates-service \
    --task-definition coordinates-task:1 \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-12345678],securityGroups=[sg-12345678],assignPublicIp=ENABLED}"

# Update service
aws ecs update-service \
    --cluster coordinates-cluster \
    --service coordinates-service \
    --task-definition coordinates-task:2

# Scale service
aws ecs update-service \
    --cluster coordinates-cluster \
    --service coordinates-service \
    --desired-count 3

# Delete service
aws ecs delete-service \
    --cluster coordinates-cluster \
    --service coordinates-service \
    --force
```

### Task Management
```bash
# List tasks
aws ecs list-tasks --cluster coordinates-cluster

# Run task
aws ecs run-task \
    --cluster coordinates-cluster \
    --task-definition coordinates-task:1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-12345678],securityGroups=[sg-12345678],assignPublicIp=ENABLED}"

# Stop task
aws ecs stop-task \
    --cluster coordinates-cluster \
    --task task-12345678-1234-1234-1234-123456789012

# Describe task
aws ecs describe-tasks \
    --cluster coordinates-cluster \
    --tasks task-12345678-1234-1234-1234-123456789012
```

---

## 📦 ECR Container Registry

### Repository Management
```bash
# List repositories
aws ecr describe-repositories

# Create repository
aws ecr create-repository \
    --repository-name coordinates-game \
    --image-scanning-configuration scanOnPush=true

# Delete repository
aws ecr delete-repository \
    --repository-name coordinates-game \
    --force
```

### Image Management
```bash
# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag coordinates-game:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/coordinates-game:latest

# Push image
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/coordinates-game:latest

# List images
aws ecr list-images --repository-name coordinates-game

# Delete image
aws ecr batch-delete-image \
    --repository-name coordinates-game \
    --image-ids imageTag=latest
```

### Lifecycle Policies
```bash
# Set lifecycle policy
aws ecr put-lifecycle-policy \
    --repository-name coordinates-game \
    --lifecycle-policy-text file://lifecycle-policy.json

# Get lifecycle policy
aws ecr get-lifecycle-policy --repository-name coordinates-game
```

---

## 👤 IAM Identity & Access

### User Management
```bash
# List users
aws iam list-users

# Create user
aws iam create-user --user-name coordinates-deployer

# Delete user
aws iam delete-user --user-name coordinates-deployer

# Get user details
aws iam get-user --user-name coordinates-deployer
```

### Role Management
```bash
# Create role
aws iam create-role \
    --role-name CoordinatesDeploymentRole \
    --assume-role-policy-document file://trust-policy.json

# Attach policy to role
aws iam attach-role-policy \
    --role-name CoordinatesDeploymentRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# List attached policies
aws iam list-attached-role-policies --role-name CoordinatesDeploymentRole

# Delete role
aws iam delete-role --role-name CoordinatesDeploymentRole
```

### Policy Management
```bash
# Create policy
aws iam create-policy \
    --policy-name CoordinatesDeploymentPolicy \
    --policy-document file://policy-document.json

# Get policy
aws iam get-policy --policy-arn arn:aws:iam::123456789012:policy/CoordinatesDeploymentPolicy

# Delete policy
aws iam delete-policy --policy-arn arn:aws:iam::123456789012:policy/CoordinatesDeploymentPolicy
```

---

## 📊 CloudWatch Monitoring

### Metrics
```bash
# Put metric data
aws cloudwatch put-metric-data \
    --namespace Coordinates/Production \
    --metric-data MetricName=DeploymentSuccess,Value=1,Unit=Count

# Get metric statistics
aws cloudwatch get-metric-statistics \
    --namespace AWS/ECS \
    --metric-name CPUUtilization \
    --dimensions Name=ClusterName,Value=coordinates-cluster \
    --start-time 2024-01-01T00:00:00Z \
    --end-time 2024-01-02T00:00:00Z \
    --period 3600 \
    --statistics Average Maximum Minimum
```

### Logs
```bash
# Create log group
aws logs create-log-group --log-group-name /ecs/coordinates-task

# Put log events
aws logs put-log-events \
    --log-group-name /ecs/coordinates-task \
    --log-stream-name ecs/coordinates-service/12345678-1234-1234-1234-123456789012 \
    --log-events timestamp=1640995200000,message="Application started"

# Describe log groups
aws logs describe-log-groups --log-group-name-prefix /ecs
```

### Alarms
```bash
# Create alarm
aws cloudwatch put-metric-alarm \
    --alarm-name coordinates-cpu-alarm \
    --alarm-description "CPU utilization alarm" \
    --metric-name CPUUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --alarm-actions arn:aws:sns:us-east-1:123456789012:coordinates-alerts

# List alarms
aws cloudwatch describe-alarms --alarm-names coordinates-cpu-alarm
```

---

## ⚡ Lambda Functions

### Function Management
```bash
# List functions
aws lambda list-functions

# Create function
aws lambda create-function \
    --function-name coordinates-api \
    --runtime nodejs18.x \
    --role arn:aws:iam::123456789012:role/lambda-execution-role \
    --handler index.handler \
    --zip-file fileb://function.zip

# Update function code
aws lambda update-function-code \
    --function-name coordinates-api \
    --zip-file fileb://updated-function.zip

# Update function configuration
aws lambda update-function-configuration \
    --function-name coordinates-api \
    --timeout 30 \
    --memory-size 512

# Delete function
aws lambda delete-function --function-name coordinates-api
```

### Invocation
```bash
# Invoke function
aws lambda invoke \
    --function-name coordinates-api \
    --payload file://payload.json \
    response.json

# Invoke function asynchronously
aws lambda invoke \
    --function-name coordinates-api \
    --invocation-type Event \
    --payload file://payload.json \
    response.json
```

---

## 🌉 API Gateway

### API Management
```bash
# List APIs
aws apigateway get-rest-apis

# Create API
aws apigateway create-rest-api \
    --name coordinates-api \
    --description "Coordinates Game API"

# Delete API
aws apigateway delete-rest-api --rest-api-id abc123def4
```

### Resource Management
```bash
# Get resources
aws apigateway get-resources --rest-api-id abc123def4

# Create resource
aws apigateway create-resource \
    --rest-api-id abc123def4 \
    --parent-id abc123def4 \
    --path-part "game"

# Create method
aws apigateway put-method \
    --rest-api-id abc123def4 \
    --resource-id abc123def4 \
    --http-method GET \
    --authorization-type NONE
```

---

## 🌐 VPC & Networking

### VPC Management
```bash
# List VPCs
aws ec2 describe-vpcs

# Create VPC
aws ec2 create-vpc \
    --cidr-block 10.0.0.0/16 \
    --tag-specifications ResourceType=vpc,Tags=[{Key=Name,Value=coordinates-vpc}]

# Delete VPC
aws ec2 delete-vpc --vpc-id vpc-12345678
```

### Subnet Management
```bash
# Create subnet
aws ec2 create-subnet \
    --vpc-id vpc-12345678 \
    --cidr-block 10.0.1.0/24 \
    --availability-zone us-east-1a

# List subnets
aws ec2 describe-subnets --filters Name=vpc-id,Values=vpc-12345678
```

---

## 🔒 Security Groups

### Security Group Management
```bash
# Create security group
aws ec2 create-security-group \
    --group-name coordinates-sg \
    --description "Security group for Coordinates game" \
    --vpc-id vpc-12345678

# Authorize ingress
aws ec2 authorize-security-group-ingress \
    --group-id sg-12345678 \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

# List security groups
aws ec2 describe-security-groups --group-ids sg-12345678
```

---

## ⚖️ Load Balancers

### Application Load Balancer
```bash
# Create load balancer
aws elbv2 create-load-balancer \
    --name coordinates-alb \
    --subnets subnet-12345678 subnet-87654321 \
    --security-groups sg-12345678

# Create target group
aws elbv2 create-target-group \
    --name coordinates-tg \
    --protocol HTTP \
    --port 3001 \
    --vpc-id vpc-12345678 \
    --target-type ip

# Create listener
aws elbv2 create-listener \
    --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/coordinates-alb/1234567890123456 \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/coordinates-tg/1234567890123456
```

---

## 💰 Cost Optimization

### Cost Explorer
```bash
# Get cost and usage
aws ce get-cost-and-usage \
    --time-period Start=2024-01-01,End=2024-01-31 \
    --granularity MONTHLY \
    --metrics BlendedCost \
    --group-by Type=DIMENSION,Key=SERVICE

# Get cost forecast
aws ce get-cost-forecast \
    --time-period Start=2024-02-01,End=2024-03-31 \
    --metric BLENDED_COST \
    --granularity MONTHLY
```

### Budgets
```bash
# Create budget
aws budgets create-budget \
    --account-id 123456789012 \
    --budget file://budget.json \
    --notifications-with-subscribers file://notifications.json
```

---

## 🔧 Troubleshooting

### General Debugging
```bash
# Enable debug mode
export AWS_CLI_DEBUG=1

# Check AWS CLI version
aws --version

# Check configuration
aws configure list

# Test credentials
aws sts get-caller-identity

# Check service quotas
aws service-quotas get-service-quota \
    --service-code ecs \
    --quota-code L-21C621EB
```

### Service-Specific Debugging
```bash
# Check ECS service events
aws ecs describe-services \
    --cluster coordinates-cluster \
    --services coordinates-service \
    --query 'services[0].events'

# Check CloudFront distribution status
aws cloudfront get-distribution \
    --id E1234567890ABCD \
    --query 'Distribution.Status'

# Check S3 bucket policy
aws s3api get-bucket-policy --bucket rekursing-game-assets

# Check Route 53 health check
aws route53 get-health-check \
    --health-check-id HC1234567890ABCD \
    --query 'HealthCheck.HealthCheckConfig'
```

### Performance Monitoring
```bash
# Monitor API Gateway latency
aws cloudwatch get-metric-statistics \
    --namespace AWS/ApiGateway \
    --metric-name Latency \
    --dimensions Name=ApiName,Value=coordinates-api \
    --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%SZ) \
    --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
    --period 300 \
    --statistics Average

# Monitor ECS CPU utilization
aws cloudwatch get-metric-statistics \
    --namespace AWS/ECS \
    --metric-name CPUUtilization \
    --dimensions Name=ClusterName,Value=coordinates-cluster \
    --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%SZ) \
    --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
    --period 300 \
    --statistics Average Maximum
```

---

## 📝 Best Practices

### Security
- Use IAM roles instead of access keys when possible
- Implement least privilege access
- Enable CloudTrail for audit logging
- Use VPC endpoints for private communication
- Regularly rotate credentials

### Performance
- Use CloudFront for global content delivery
- Implement proper caching strategies
- Use auto-scaling for dynamic workloads
- Monitor and optimize resource usage
- Use appropriate instance types

### Cost Management
- Set up billing alerts and budgets
- Use reserved instances for predictable workloads
- Implement auto-scaling to optimize costs
- Monitor and clean up unused resources
- Use cost allocation tags

### Reliability
- Implement health checks
- Use multiple availability zones
- Set up proper monitoring and alerting
- Implement backup and disaster recovery
- Test failover procedures regularly

---

## 🔗 Useful Resources

- [AWS CLI User Guide](https://docs.aws.amazon.com/cli/latest/userguide/)
- [AWS CLI Command Reference](https://docs.aws.amazon.com/cli/latest/reference/)
- [AWS Best Practices](https://aws.amazon.com/architecture/best-practices/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [AWS Pricing Calculator](https://calculator.aws/)

---

*Last updated: January 2025 - AWS CLI v2.27.50* 