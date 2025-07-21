#!/bin/bash
# Sprint Terminal Actions Script
# This script contains all terminal commands executed by personas in the last sprint.

# Full Stack Developer Dr
# Switch to main branch, create feature branch, commit and push accessibility fixes
git checkout main
git merge gpu-streaming-deployment
# Scaffold widget system and notification backend
git checkout -b feature/widget-system
npm run generate:widget-scaffold
npm run generate:notification-backend
git add .
git commit -m "Scaffold widget system and notification backend"
git push origin feature/widget-system

# Accessibility Specialist
# Run accessibility audits
npx axe-cli http://localhost:4173
npm run test:accessibility
npx axe-cli http://localhost:4173/widgets
npx axe-cli http://localhost:4173/notifications

# QA Engineer
# Run automated and E2E tests
npm run test
npx cypress run --spec 'cypress/integration/onboarding.spec.js'
npm run test:widgets
npm run test:notifications

# DevOps Engineer
# Deploy static assets and invalidate CloudFront cache
aws s3 sync ./dist s3://rekursing-app-bucket
aws cloudfront create-invalidation --distribution-id XYZ --paths '/*'

# AWS Engineer
# Check EC2 health and review AWS costs
aws ec2 describe-instances
aws cost-explorer get-cost-and-usage
# Prepare infrastructure for real-time updates
aws lambda update-function-code --function-name notificationHandler --zip-file fileb://notification.zip
aws sns create-topic --name user-notifications

# Security Specialist
# Run security audit and IAM checks
npm run audit
aws iam get-account-authorization-details

# Git Specialist
# Merge feature branch, tag release, and push tags
git checkout main
git merge feature/widget-system
git tag v1.4.0
git push --tags

# Data Scientist
# Refine and deploy widget recommendation models
python src/data_science/train_widget_recommender.py
python src/data_science/deploy_model.py

# (Other personas update docs, analytics, and communications via their respective tools) 