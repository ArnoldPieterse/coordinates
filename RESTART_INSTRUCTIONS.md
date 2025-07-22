# Computer Restart Instructions

## 🚀 Quick Restart (Recommended)

For immediate restart with essential backup:

```bash
node quick-restart.js
```

This will:
- ✅ Quick Git backup and push
- ✅ Quick AWS backup
- ✅ Stop local services
- ✅ Restart computer in 10 seconds

## 🔄 Complete Restart (Full Backup)

For comprehensive restart with full backup:

```bash
node complete-restart-script.js
```

This will:
- ✅ Complete Git operations and backup
- ✅ Full AWS operations and backup
- ✅ Deploy workflows to AWS S3
- ✅ Setup restart monitoring
- ✅ Stop all local services
- ✅ Restart computer in 30 seconds

## 📋 Custom AWS Commands Included

### S3 Operations
```bash
# Backup S3 bucket status
aws s3 ls s3://rekursing-coordinates --recursive --summarize

# Deploy workflows to S3
aws s3 cp .github/workflows/ci-cd-pipeline.yml s3://rekursing-coordinates/workflows/
aws s3 cp .github/workflows/dependency-update.yml s3://rekursing-coordinates/workflows/
```

### CloudFront Operations
```bash
# Backup CloudFront distribution
aws cloudfront get-distribution --id E1234567890ABC

# Update CloudFront distribution
aws cloudfront update-distribution --id E1234567890ABC --distribution-config file://cloudfront-config.json
```

### Route53 Operations
```bash
# Backup Route53 hosted zone
aws route53 get-hosted-zone --id Z1234567890ABC

# Update DNS records
aws route53 change-resource-record-sets --hosted-zone-id Z1234567890ABC --change-batch file://dns-update.json
```

### Lambda Operations
```bash
# Backup Lambda function
aws lambda get-function --function-name coordinates-api

# Update Lambda function
aws lambda update-function-code --function-name coordinates-api --zip-file fileb://deployment.zip
```

### Cost Monitoring
```bash
# Monitor AWS costs
aws ce get-cost-and-usage --time-period Start=2024-12-01,End=2024-12-31 --granularity DAILY --metrics BlendedCost
```

## 📚 Custom Git Commands Included

### Pre-Restart Git Operations
```bash
# Check Git status
git status --porcelain

# Get current branch and commit
git branch --show-current
git rev-parse HEAD

# Create backup commit if needed
git add -A
git commit -m "backup: pre-restart backup commit"

# Push to remote
git push origin main
```

### Post-Restart Git Operations
```bash
# Verify Git repository status
git status --porcelain

# Check for any issues
git log --oneline -5
git branch -a
```

## 🔧 Manual Restart Commands

If you prefer manual execution:

### 1. Git Backup
```bash
git add -A
git commit -m "backup: manual restart backup"
git push origin main
```

### 2. AWS Backup
```bash
# Create AWS backup file
echo '{"timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%S)'","status":"manual_backup"}' > aws-manual-backup.json
```

### 3. Stop Services
```bash
# Stop Node.js processes
taskkill /f /im node.exe
```

### 4. Restart Computer
```bash
# Windows restart
shutdown /r /t 30 /c "Coordinates project manual restart"

# Or immediate restart
shutdown /r /t 0
```

## 📊 Post-Restart Recovery

After restart, the system will automatically:

1. **Verify Git repository status**
2. **Check AWS service connectivity**
3. **Restart enhanced bot helper**
4. **Restart test bot helper**
5. **Validate workflow deployments**

### Manual Post-Restart Commands
```bash
# Run post-restart recovery
node post-restart-recovery.js

# Or manually restart services
node enhanced-bot-helper-with-frequent-prompts.js
node test-enhanced-bot-helper.js
```

## 🛡️ Safety Features

### Backup Files Created
- `git-backup.json` - Git repository backup
- `aws-backup.json` - AWS configuration backup
- `workflow-deployment-status.json` - Workflow deployment status
- `restart-monitoring-config.json` - Monitoring configuration
- `service-status.json` - Service status
- `restart-summary.json` - Complete restart summary

### Emergency Recovery
- `emergency-backup.json` - Created if restart fails
- `restart-marker.json` - Quick restart marker
- `post-restart-recovery.js` - Automatic recovery script

## ⚠️ Important Notes

1. **Always backup before restart** - The scripts handle this automatically
2. **Check AWS credentials** - Ensure AWS CLI is configured
3. **Verify Git remote** - Ensure remote repository is accessible
4. **Monitor post-restart** - Check that all services restart correctly
5. **Review backup files** - Verify all backups were created successfully

## 🎯 Quick Commands Summary

| Action | Command |
|--------|---------|
| Quick Restart | `node quick-restart.js` |
| Complete Restart | `node complete-restart-script.js` |
| Manual Git Backup | `git add -A && git commit -m "backup" && git push` |
| Manual AWS Backup | `aws sts get-caller-identity` |
| Stop Services | `taskkill /f /im node.exe` |
| Restart Computer | `shutdown /r /t 30` |
| Post-Restart Recovery | `node post-restart-recovery.js` |

## 🚀 Ready to Restart!

Choose your restart method:

**For immediate restart:**
```bash
node quick-restart.js
```

**For comprehensive restart:**
```bash
node complete-restart-script.js
```

Both scripts include all necessary AWS and Git commands to safely restart your computer while maintaining all automation and monitoring systems! 🎉 