# AWS Deployment Guide - Coordinates Project
## IDX-AWS-GUIDE-001: Comprehensive AWS Deployment Guide

This guide provides step-by-step instructions for deploying the Coordinates multiplayer planetary shooter game to AWS using modern best practices and the latest AWS services.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Initial Setup](#initial-setup)
4. [Infrastructure as Code](#infrastructure-as-code)
5. [Application Deployment](#application-deployment)
6. [Domain Configuration](#domain-configuration)
7. [SSL Certificate Setup](#ssl-certificate-setup)
8. [CDN Configuration](#cdn-configuration)
9. [Monitoring & Logging](#monitoring--logging)
10. [Security Configuration](#security-configuration)
11. [Cost Optimization](#cost-optimization)
12. [Troubleshooting](#troubleshooting)
13. [Maintenance](#maintenance)

---

## 🔧 Prerequisites

### Required Tools
```bash
# AWS CLI v2.27.50 or later
aws --version

# Node.js 18+ and npm
node --version
npm --version

# Docker (for containerized deployment)
docker --version

# Git
git --version
```

### AWS Account Setup
1. **Create AWS Account**: Sign up at [aws.amazon.com](https://aws.amazon.com)
2. **Enable MFA**: Set up multi-factor authentication for root account
3. **Create IAM User**: Create a deployment user with appropriate permissions
4. **Configure AWS CLI**: Set up credentials and default region

### Required AWS Services
- **S3**: Static asset storage
- **CloudFront**: Content delivery network
- **Route 53**: DNS management
- **ACM**: SSL certificate management
- **ECS**: Container orchestration
- **ECR**: Container registry
- **IAM**: Identity and access management
- **CloudWatch**: Monitoring and logging
- **Lambda**: Serverless functions (optional)
- **API Gateway**: API management (optional)

---

## 🏗️ Architecture Overview

### Production Architecture
```
Internet
    ↓
CloudFront (CDN)
    ↓
Route 53 (DNS)
    ↓
S3 (Static Assets)
    ↓
ECS Fargate (Application)
    ↓
RDS/ElastiCache (Database/Cache)
```

### Components
- **Frontend**: Static files served from S3 via CloudFront
- **Backend**: Node.js application running on ECS Fargate
- **Database**: PostgreSQL on RDS (optional)
- **Cache**: Redis on ElastiCache (optional)
- **CDN**: CloudFront for global content delivery
- **DNS**: Route 53 for domain management
- **SSL**: ACM for certificate management

---

## 🚀 Initial Setup

### 1. Configure AWS CLI
```bash
# Configure AWS CLI with your credentials
aws configure

# Set default region
aws configure set region us-east-1

# Set default output format
aws configure set output json

# Verify configuration
aws sts get-caller-identity
```

### 2. Install Dependencies
```bash
# Install project dependencies
npm install

# Install AWS SDK dependencies
npm install @aws-sdk/client-s3 @aws-sdk/client-cloudfront @aws-sdk/client-route-53 @aws-sdk/client-acm @aws-sdk/client-ecs @aws-sdk/client-ecr @aws-sdk/client-iam @aws-sdk/client-cloudwatch @aws-sdk/client-logs
```

### 3. Environment Configuration
```bash
# Create environment file
cp .env.example .env

# Configure environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCOUNT_ID=123456789012
export DOMAIN_NAME=rekursing.com
export PROJECT_NAME=coordinates-game
```

---

## 🏗️ Infrastructure as Code

### 1. Create Infrastructure Scripts

#### S3 Bucket Setup
```javascript
// Create S3 bucket for static assets
aws s3 mb s3://rekursing-game-assets --region us-east-1

// Configure bucket for static website hosting
aws s3 website s3://rekursing-game-assets \
    --index-document index.html \
    --error-document index.html

// Set bucket policy for public read access
aws s3api put-bucket-policy \
    --bucket rekursing-game-assets \
    --policy file://bucket-policy.json
```

#### ECS Cluster Setup
```javascript
// Create ECS cluster
aws ecs create-cluster \
    --cluster-name coordinates-cluster \
    --capacity-providers FARGATE \
    --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1

// Create ECR repository
aws ecr create-repository \
    --repository-name coordinates-game \
    --image-scanning-configuration scanOnPush=true
```

### 2. IAM Roles and Policies

#### ECS Task Execution Role
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

#### ECS Task Role
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::rekursing-game-assets/*"
    }
  ]
}
```

---

## 📦 Application Deployment

### 1. Build Application
```bash
# Build the application
npm run build

# Verify build output
ls -la dist/
```

### 2. Docker Build and Push
```bash
# Build Docker image
docker build -t coordinates-game:latest .

# Get ECR login token
aws ecr get-login-password --region us-east-1 | \
docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Tag image for ECR
docker tag coordinates-game:latest \
$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/coordinates-game:latest

# Push to ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/coordinates-game:latest
```

### 3. Deploy to ECS
```bash
# Register task definition
aws ecs register-task-definition \
    --cli-input-json file://task-definition.json

# Create ECS service
aws ecs create-service \
    --cluster coordinates-cluster \
    --service-name coordinates-service \
    --task-definition coordinates-task:1 \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-12345678],securityGroups=[sg-12345678],assignPublicIp=ENABLED}"
```

### 4. Upload Static Assets
```bash
# Upload static assets to S3
aws s3 sync dist/ s3://rekursing-game-assets/ --delete

# Set cache headers for different file types
aws s3 cp dist/css/ s3://rekursing-game-assets/css/ \
    --recursive \
    --cache-control "public, max-age=31536000"

aws s3 cp dist/js/ s3://rekursing-game-assets/js/ \
    --recursive \
    --cache-control "public, max-age=31536000"
```

---

## 🌐 Domain Configuration

### 1. Route 53 Setup
```bash
# Create hosted zone
aws route53 create-hosted-zone \
    --name rekursing.com \
    --caller-reference $(date +%s)

# Get nameservers
aws route53 get-hosted-zone --id Z1234567890ABCD
```

### 2. Configure DNS Records
```json
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "rekursing.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "d1234567890.cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "www.rekursing.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "rekursing.com"
          }
        ]
      }
    }
  ]
}
```

### 3. Apply DNS Changes
```bash
# Apply DNS changes
aws route53 change-resource-record-sets \
    --hosted-zone-id Z1234567890ABCD \
    --change-batch file://dns-changes.json

# Monitor change status
aws route53 get-change --id C1234567890ABCD
```

---

## 🔒 SSL Certificate Setup

### 1. Request Certificate
```bash
# Request SSL certificate
aws acm request-certificate \
    --domain-name rekursing.com \
    --subject-alternative-names www.rekursing.com \
    --validation-method DNS

# Get certificate ARN
aws acm list-certificates --certificate-statuses ISSUED PENDING_VALIDATION
```

### 2. Validate Certificate
```bash
# Get validation records
aws acm describe-certificate \
    --certificate-arn arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012

# Add validation records to Route 53
aws route53 change-resource-record-sets \
    --hosted-zone-id Z1234567890ABCD \
    --change-batch file://validation-records.json
```

### 3. Monitor Validation
```bash
# Check certificate status
aws acm describe-certificate \
    --certificate-arn arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012 \
    --query 'Certificate.Status'
```

---

## ☁️ CDN Configuration

### 1. Create CloudFront Distribution
```json
{
  "CallerReference": "coordinates-distribution-2025",
  "Comment": "Distribution for rekursing.com",
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-Origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true
  },
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-Origin",
        "DomainName": "rekursing-game-assets.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "Aliases": {
    "Quantity": 1,
    "Items": ["rekursing.com"]
  },
  "PriceClass": "PriceClass_100",
  "HttpVersion": "http2",
  "DefaultRootObject": "index.html"
}
```

### 2. Create Distribution
```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
    --distribution-config file://cloudfront-config.json

# Get distribution ID
aws cloudfront list-distributions \
    --query 'DistributionList.Items[?Aliases.Items[?contains(@, `rekursing.com`)]]'
```

### 3. Invalidate Cache
```bash
# Create invalidation
aws cloudfront create-invalidation \
    --distribution-id E1234567890ABCD \
    --paths "/*"

# Monitor invalidation status
aws cloudfront get-invalidation \
    --distribution-id E1234567890ABCD \
    --id I1234567890ABCD
```

---

## 📊 Monitoring & Logging

### 1. CloudWatch Logs
```bash
# Create log group
aws logs create-log-group --log-group-name /ecs/coordinates-task

# Set retention policy
aws logs put-retention-policy \
    --log-group-name /ecs/coordinates-task \
    --retention-in-days 30
```

### 2. CloudWatch Alarms
```bash
# Create CPU utilization alarm
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

# Create memory utilization alarm
aws cloudwatch put-metric-alarm \
    --alarm-name coordinates-memory-alarm \
    --alarm-description "Memory utilization alarm" \
    --metric-name MemoryUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --alarm-actions arn:aws:sns:us-east-1:123456789012:coordinates-alerts
```

### 3. Custom Metrics
```javascript
// Send custom metrics
aws cloudwatch put-metric-data \
    --namespace Coordinates/Production \
    --metric-data MetricName=ActivePlayers,Value=150,Unit=Count

aws cloudwatch put-metric-data \
    --namespace Coordinates/Production \
    --metric-data MetricName=GameSessions,Value=25,Unit=Count
```

---

## 🔐 Security Configuration

### 1. Security Groups
```bash
# Create security group for ECS tasks
aws ec2 create-security-group \
    --group-name coordinates-ecs-sg \
    --description "Security group for Coordinates ECS tasks" \
    --vpc-id vpc-12345678

# Authorize inbound traffic
aws ec2 authorize-security-group-ingress \
    --group-id sg-12345678 \
    --protocol tcp \
    --port 3001 \
    --cidr 0.0.0.0/0
```

### 2. IAM Best Practices
```bash
# Create deployment user
aws iam create-user --user-name coordinates-deployer

# Create deployment policy
aws iam create-policy \
    --policy-name CoordinatesDeploymentPolicy \
    --policy-document file://deployment-policy.json

# Attach policy to user
aws iam attach-user-policy \
    --user-name coordinates-deployer \
    --policy-arn arn:aws:iam::123456789012:policy/CoordinatesDeploymentPolicy
```

### 3. WAF Configuration (Optional)
```bash
# Create WAF web ACL
aws wafv2 create-web-acl \
    --name coordinates-waf \
    --scope REGIONAL \
    --default-action Allow={} \
    --description "WAF for Coordinates game" \
    --region us-east-1
```

---

## 💰 Cost Optimization

### 1. Cost Monitoring
```bash
# Create cost budget
aws budgets create-budget \
    --account-id 123456789012 \
    --budget file://cost-budget.json \
    --notifications-with-subscribers file://budget-notifications.json

# Get cost and usage
aws ce get-cost-and-usage \
    --time-period Start=2024-01-01,End=2024-01-31 \
    --granularity MONTHLY \
    --metrics BlendedCost \
    --group-by Type=DIMENSION,Key=SERVICE
```

### 2. Resource Optimization
```bash
# Set up auto-scaling
aws application-autoscaling register-scalable-target \
    --service-namespace ecs \
    --scalable-dimension ecs:service:DesiredCount \
    --resource-id service/coordinates-cluster/coordinates-service \
    --min-capacity 1 \
    --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
    --service-namespace ecs \
    --scalable-dimension ecs:service:DesiredCount \
    --resource-id service/coordinates-cluster/coordinates-service \
    --policy-name coordinates-cpu-scaling \
    --policy-type TargetTrackingScaling \
    --target-tracking-scaling-policy-configuration file://scaling-config.json
```

### 3. Storage Optimization
```bash
# Set S3 lifecycle policy
aws s3api put-bucket-lifecycle-configuration \
    --bucket rekursing-game-assets \
    --lifecycle-configuration file://lifecycle-policy.json

# Enable S3 Intelligent Tiering
aws s3api put-bucket-intelligent-tiering-configuration \
    --bucket rekursing-game-assets \
    --id coordinates-tiering \
    --intelligent-tiering-configuration file://tiering-config.json
```

---

## 🔧 Troubleshooting

### 1. Common Issues

#### ECS Service Issues
```bash
# Check service status
aws ecs describe-services \
    --cluster coordinates-cluster \
    --services coordinates-service

# Check task events
aws ecs describe-tasks \
    --cluster coordinates-cluster \
    --tasks task-12345678-1234-1234-1234-123456789012

# Check service logs
aws logs describe-log-streams \
    --log-group-name /ecs/coordinates-task \
    --order-by LastEventTime \
    --descending
```

#### CloudFront Issues
```bash
# Check distribution status
aws cloudfront get-distribution \
    --id E1234567890ABCD \
    --query 'Distribution.Status'

# Check invalidation status
aws cloudfront list-invalidations \
    --distribution-id E1234567890ABCD
```

#### DNS Issues
```bash
# Check hosted zone
aws route53 get-hosted-zone --id Z1234567890ABCD

# Check DNS records
aws route53 list-resource-record-sets \
    --hosted-zone-id Z1234567890ABCD

# Test DNS resolution
nslookup rekursing.com
dig rekursing.com
```

### 2. Performance Issues
```bash
# Monitor CloudFront metrics
aws cloudwatch get-metric-statistics \
    --namespace AWS/CloudFront \
    --metric-name Requests \
    --dimensions Name=DistributionId,Value=E1234567890ABCD \
    --start-time 2024-01-01T00:00:00Z \
    --end-time 2024-01-02T00:00:00Z \
    --period 3600 \
    --statistics Sum

# Monitor ECS metrics
aws cloudwatch get-metric-statistics \
    --namespace AWS/ECS \
    --metric-name CPUUtilization \
    --dimensions Name=ClusterName,Value=coordinates-cluster \
    --start-time 2024-01-01T00:00:00Z \
    --end-time 2024-01-02T00:00:00Z \
    --period 300 \
    --statistics Average Maximum
```

### 3. Security Issues
```bash
# Check IAM user permissions
aws iam get-user --user-name coordinates-deployer

# Check role permissions
aws iam get-role --role-name ecsTaskExecutionRole

# Check security group rules
aws ec2 describe-security-groups --group-ids sg-12345678
```

---

## 🛠️ Maintenance

### 1. Regular Maintenance Tasks

#### Update Application
```bash
# Build new version
npm run build

# Build and push new Docker image
docker build -t coordinates-game:latest .
docker tag coordinates-game:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/coordinates-game:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/coordinates-game:latest

# Update ECS service
aws ecs update-service \
    --cluster coordinates-cluster \
    --service coordinates-service \
    --task-definition coordinates-task:2
```

#### Update Static Assets
```bash
# Upload new static assets
aws s3 sync dist/ s3://rekursing-game-assets/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
    --distribution-id E1234567890ABCD \
    --paths "/*"
```

#### Monitor Costs
```bash
# Check monthly costs
aws ce get-cost-and-usage \
    --time-period Start=2024-01-01,End=2024-01-31 \
    --granularity MONTHLY \
    --metrics BlendedCost

# Check cost forecast
aws ce get-cost-forecast \
    --time-period Start=2024-02-01,End=2024-03-31 \
    --metric BLENDED_COST \
    --granularity MONTHLY
```

### 2. Backup and Recovery
```bash
# Backup S3 bucket
aws s3 sync s3://rekursing-game-assets/ s3://rekursing-game-assets-backup/

# Backup ECS task definition
aws ecs describe-task-definition --task-definition coordinates-task:1 > task-definition-backup.json

# Backup Route 53 records
aws route53 list-resource-record-sets --hosted-zone-id Z1234567890ABCD > dns-records-backup.json
```

### 3. Security Updates
```bash
# Update IAM policies
aws iam update-role-policy \
    --role-name CoordinatesDeploymentRole \
    --policy-name CoordinatesDeploymentPolicy \
    --policy-document file://updated-policy.json

# Rotate access keys
aws iam create-access-key --user-name coordinates-deployer
aws iam delete-access-key --user-name coordinates-deployer --access-key-id AKIA1234567890ABCDEF
```

---

## 📚 Additional Resources

### Documentation
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [AWS Best Practices](https://aws.amazon.com/architecture/best-practices/)
- [AWS CLI User Guide](https://docs.aws.amazon.com/cli/latest/userguide/)
- [ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)

### Tools
- [AWS Pricing Calculator](https://calculator.aws/)
- [AWS Cost Explorer](https://console.aws.amazon.com/costexplorer/)
- [AWS CloudFormation](https://aws.amazon.com/cloudformation/)
- [AWS CDK](https://aws.amazon.com/cdk/)

### Support
- [AWS Support](https://aws.amazon.com/support/)
- [AWS Forums](https://forums.aws.amazon.com/)
- [AWS Documentation](https://docs.aws.amazon.com/)

---

## 🎯 Quick Start Commands

### Complete Deployment
```bash
# 1. Configure AWS CLI
aws configure

# 2. Set environment variables
export AWS_ACCOUNT_ID=123456789012
export DOMAIN_NAME=rekursing.com

# 3. Run modern deployment
npm run deploy:aws-modern

# 4. Configure domain
npm run domain:configure-modern

# 5. Verify deployment
curl -I https://rekursing.com
```

### Update Application
```bash
# Build and deploy updates
npm run build
npm run deploy:aws-modern

# Invalidate cache
aws cloudfront create-invalidation \
    --distribution-id E1234567890ABCD \
    --paths "/*"
```

---

*Last updated: January 2025 - AWS CLI v2.27.50* 