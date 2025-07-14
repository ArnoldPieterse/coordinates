# AWS Credentials Setup Guide

## Current Issue
The AWS credentials are invalid (InvalidClientTokenId error). This means the access key ID or secret access key is incorrect or expired.

## Quick Fix Steps

### 1. Check Current AWS Configuration
```bash
aws configure list
```

### 2. Set Up New AWS Credentials
```bash
aws configure
```

You'll be prompted for:
- **AWS Access Key ID**: Your AWS access key (starts with AKIA...)
- **AWS Secret Access Key**: Your AWS secret key (40 characters)
- **Default region name**: e.g., `us-east-1`
- **Default output format**: `json`

### 3. Get AWS Credentials

#### Option A: AWS Console (Recommended)
1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Click your username in top right
3. Click "Security credentials"
4. Under "Access keys", click "Create access key"
5. Choose "Command Line Interface (CLI)"
6. Copy the Access Key ID and Secret Access Key

#### Option B: AWS CLI (if you have admin access)
```bash
aws iam create-access-key --user-name YOUR_USERNAME
```

### 4. Test Credentials
```bash
aws sts get-caller-identity
```

Should return:
```json
{
    "UserId": "AIDACKCEVSQ6C2EXAMPLE",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/YourUsername"
}
```

## Deployment Commands

### With AI Agents (Recommended)
```bash
npm run setup:aws:agents
```

### Manual Deployment
```bash
npm run setup:aws
```

### Direct AWS Deployment
```bash
npm run deploy:aws-modern
```

## Troubleshooting

### Invalid Credentials
- Check if credentials are correct
- Ensure no extra spaces or characters
- Verify the access key is active in AWS Console

### Permission Issues
- Ensure your IAM user has necessary permissions:
  - S3:FullAccess
  - CloudFront:FullAccess
  - IAM:PassRole
  - Lambda:FullAccess (if using Lambda@Edge)

### Region Issues
- Make sure you're using the correct region
- Some services may not be available in all regions

## Security Best Practices

1. **Use IAM Users**: Don't use root account credentials
2. **Principle of Least Privilege**: Only grant necessary permissions
3. **Rotate Keys Regularly**: Change access keys every 90 days
4. **Use AWS Profiles**: For multiple accounts/environments
5. **Enable MFA**: For additional security

## Example IAM Policy for Deployment

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:CreateBucket",
                "s3:DeleteBucket",
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket",
                "s3:PutBucketPolicy",
                "s3:PutBucketWebsite",
                "cloudfront:CreateDistribution",
                "cloudfront:UpdateDistribution",
                "cloudfront:GetDistribution",
                "cloudfront:ListDistributions",
                "iam:PassRole",
                "lambda:CreateFunction",
                "lambda:UpdateFunctionCode",
                "lambda:GetFunction"
            ],
            "Resource": "*"
        }
    ]
}
```

## Next Steps

1. Set up AWS credentials using the steps above
2. Test with: `node test-aws-simple.js`
3. Run deployment: `npm run setup:aws:agents`
4. Check deployment status in AWS Console

## Support

If you continue to have issues:
1. Check AWS Console for account status
2. Verify billing is set up
3. Ensure services are available in your region
4. Contact AWS Support if needed 