# 🌐 Domain Setup Guide - rekursing.com

## Current Status

### ✅ What's Working
- **S3 Bucket**: `rekursing.com` is configured as a website
- **Files Deployed**: All build artifacts are uploaded
- **Website Configuration**: 
  - Index Document: `index.html`
  - Error Document: `index.html`

### ⚠️ What Needs Setup
- **CloudFront Distribution**: Not created yet
- **SSL Certificate**: Not configured
- **DNS Configuration**: Domain not pointing to AWS
- **Custom Domain**: rekursing.com not accessible

## 🚀 Step-by-Step Setup Guide

### Step 1: Create SSL Certificate

```bash
# Request SSL certificate for rekursing.com
aws acm request-certificate \
  --domain-name rekursing.com \
  --subject-alternative-names "*.rekursing.com" \
  --validation-method DNS \
  --region us-east-1
```

**Note**: Use `us-east-1` region for CloudFront certificates.

### Step 2: Create CloudFront Distribution

```bash
# Create CloudFront distribution configuration
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

**cloudfront-config.json**:
```json
{
  "CallerReference": "rekursing-distribution-$(date +%s)",
  "Comment": "Rekursing AI Gaming Platform",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-rekursing.com",
        "DomainName": "rekursing.com.s3-website-us-east-1.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-rekursing.com",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "Compress": true
  },
  "Aliases": {
    "Quantity": 1,
    "Items": ["rekursing.com"]
  },
  "ViewerCertificate": {
    "ACMCertificateArn": "arn:aws:acm:us-east-1:YOUR_ACCOUNT_ID:certificate/YOUR_CERT_ID",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  },
  "PriceClass": "PriceClass_100",
  "Enabled": true
}
```

### Step 3: Configure DNS Records

After creating the CloudFront distribution, you'll need to configure DNS records at your domain registrar:

#### **A Record (IPv4)**
```
Type: A
Name: rekursing.com
Value: [CloudFront Distribution Domain]
TTL: 300
```

#### **CNAME Record (www subdomain)**
```
Type: CNAME
Name: www.rekursing.com
Value: rekursing.com
TTL: 300
```

### Step 4: Verify SSL Certificate

```bash
# Check certificate status
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:YOUR_ACCOUNT_ID:certificate/YOUR_CERT_ID

# List validation records
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:YOUR_ACCOUNT_ID:certificate/YOUR_CERT_ID \
  --query "Certificate.DomainValidationOptions[].ResourceRecord"
```

### Step 5: Test the Setup

```bash
# Test CloudFront distribution
curl -I https://rekursing.com

# Test S3 website directly
curl -I http://rekursing.com.s3-website-us-east-1.amazonaws.com
```

## 🔧 Alternative: Manual AWS Console Setup

### 1. **Create SSL Certificate**
1. Go to AWS Certificate Manager (ACM)
2. Select `us-east-1` region
3. Click "Request a certificate"
4. Enter domain: `rekursing.com`
5. Add SAN: `*.rekursing.com`
6. Choose DNS validation
7. Click "Request"

### 2. **Create CloudFront Distribution**
1. Go to CloudFront
2. Click "Create Distribution"
3. **Origin Domain**: `rekursing.com.s3-website-us-east-1.amazonaws.com`
4. **Origin Protocol**: HTTP Only
5. **Default Root Object**: `index.html`
6. **Alternate Domain Names**: `rekursing.com`
7. **SSL Certificate**: Select your ACM certificate
8. **Price Class**: Use Only North America and Europe
9. **Default Cache Behavior**: Redirect HTTP to HTTPS
10. Click "Create Distribution"

### 3. **Configure DNS**
1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Find DNS management for rekursing.com
3. Add A record pointing to CloudFront distribution
4. Add CNAME record for www subdomain

## 🛠️ Quick Setup Script

I can create an automated setup script for you:

```bash
#!/bin/bash
# rekursing-domain-setup.sh

echo "🚀 Setting up rekursing.com domain..."

# 1. Create SSL certificate
echo "📜 Creating SSL certificate..."
CERT_ARN=$(aws acm request-certificate \
  --domain-name rekursing.com \
  --subject-alternative-names "*.rekursing.com" \
  --validation-method DNS \
  --region us-east-1 \
  --query "CertificateArn" \
  --output text)

echo "Certificate ARN: $CERT_ARN"

# 2. Wait for certificate validation
echo "⏳ Waiting for certificate validation..."
aws acm wait certificate-validated \
  --certificate-arn $CERT_ARN \
  --region us-east-1

# 3. Create CloudFront distribution
echo "☁️ Creating CloudFront distribution..."
# (Distribution creation commands)

echo "✅ Domain setup complete!"
echo "🌐 Your site will be available at: https://rekursing.com"
```

## 🔍 Troubleshooting

### Common Issues

1. **Certificate Not Validated**
   - Check DNS validation records
   - Ensure CNAME records are correct
   - Wait up to 24 hours for propagation

2. **CloudFront Not Working**
   - Verify origin domain is correct
   - Check SSL certificate is in us-east-1
   - Ensure distribution is deployed

3. **DNS Not Resolving**
   - Verify A record points to CloudFront
   - Check TTL settings
   - Wait for DNS propagation

### Useful Commands

```bash
# Check S3 bucket website endpoint
aws s3api get-bucket-website --bucket rekursing.com

# List CloudFront distributions
aws cloudfront list-distributions

# Check certificate status
aws acm list-certificates --region us-east-1

# Test domain resolution
nslookup rekursing.com
dig rekursing.com
```

## 📞 Next Steps

1. **Choose your approach**: Manual console setup or automated script
2. **Get your AWS account ID**: Needed for certificate ARN
3. **Access your domain registrar**: For DNS configuration
4. **Test the setup**: Verify everything works

Would you like me to:
- Create the automated setup script?
- Guide you through manual console setup?
- Help troubleshoot any specific issues?

Let me know which approach you prefer! 🚀 