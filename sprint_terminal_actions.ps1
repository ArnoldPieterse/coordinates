# Sprint Terminal Actions PowerShell Script
# This script contains all terminal commands executed by personas in the last sprint (PowerShell version).

# --- Full Stack Developer Dr ---
Write-Host 'Switching to main branch and merging gpu-streaming-deployment...'
git checkout main
git merge gpu-streaming-deployment

Write-Host 'Scaffolding widget system and notification backend...'
git checkout -b feature/widget-system
npm run generate:widget-scaffold
npm run generate:notification-backend
git add .
git commit -m "Scaffold widget system and notification backend"
git push origin feature/widget-system

# --- Accessibility Specialist ---
Write-Host 'Running accessibility audits...'
npx axe-cli http://localhost:4173
npm run test:accessibility
npx axe-cli http://localhost:4173/widgets
npx axe-cli http://localhost:4173/notifications

# --- QA Engineer ---
Write-Host 'Running automated and E2E tests...'
npm run test
npx cypress run --spec 'cypress/integration/onboarding.spec.js'
npm run test:widgets
npm run test:notifications

# --- DevOps Engineer ---
Write-Host 'Deploying static assets and invalidating CloudFront cache...'
aws s3 sync ./dist s3://rekursing-app-bucket
aws cloudfront create-invalidation --distribution-id XYZ --paths '/*'

# --- AWS Engineer ---
Write-Host 'Checking EC2 health and reviewing AWS costs...'
aws ec2 describe-instances
aws cost-explorer get-cost-and-usage
Write-Host 'Preparing infrastructure for real-time updates...'
aws lambda update-function-code --function-name notificationHandler --zip-file fileb://notification.zip
aws sns create-topic --name user-notifications

# --- Security Specialist ---
Write-Host 'Running security audit and IAM checks...'
npm run audit
aws iam get-account-authorization-details

# --- Git Specialist ---
Write-Host 'Merging feature branch, tagging release, and pushing tags...'
git checkout main
git merge feature/widget-system
git tag v1.4.0
git push --tags

# --- Data Scientist ---
Write-Host 'Refining and deploying widget recommendation models...'
python src/data_science/train_widget_recommender.py
python src/data_science/deploy_model.py

# (Other personas update docs, analytics, and communications via their respective tools) 