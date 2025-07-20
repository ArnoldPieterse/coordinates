#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 GPU Streaming System - Complete AWS Deployment\n');
console.log('This script will deploy your GPU streaming system with LM Studio integration\n');

// Configuration
const config = {
    projectName: 'gpu-streaming-system',
    awsRegion: 'us-east-1',
    domain: 'rekursing.com',
    lmStudioUrl: 'http://10.3.129.26:1234',
    deploymentPort: 3000,
    gitRepo: 'https://github.com/your-username/gpu-streaming-system.git' // Update this
};

// Utility functions
function runCommand(command, description, options = {}) {
    console.log(`📋 ${description}...`);
    try {
        const result = execSync(command, { 
            encoding: 'utf8', 
            stdio: options.silent ? 'pipe' : 'inherit',
            shell: true,
            ...options
        });
        console.log(`✅ ${description} completed successfully`);
        return result;
    } catch (error) {
        console.error(`❌ Error in ${description}:`, error.message);
        if (!options.continueOnError) {
            throw error;
        }
        return null;
    }
}

function checkAwsCredentials() {
    console.log('🔍 Checking AWS credentials...\n');
    
    try {
        const identity = execSync('aws sts get-caller-identity --query "Account" --output text', { 
            encoding: 'utf8', 
            stdio: 'pipe' 
        });
        console.log(`✅ AWS credentials valid - Account: ${identity.trim()}`);
        return true;
    } catch (error) {
        console.error('❌ AWS credentials not configured or invalid');
        console.log('Please run: aws configure');
        return false;
    }
}

function setupGitAndPush() {
    console.log('📦 Setting up Git repository and pushing to remote...\n');
    
    // Initialize git if not already done
    if (!fs.existsSync('.git')) {
        runCommand('git init', 'Initializing Git repository');
    }
    
    // Add all files
    runCommand('git add .', 'Adding all files to Git');
    
    // Check if we have commits
    try {
        execSync('git log --oneline -1', { stdio: 'pipe' });
        console.log('✅ Repository has commits');
    } catch (error) {
        runCommand('git commit -m "Initial GPU streaming system deployment with LM Studio integration"', 'Creating initial commit');
    }
    
    // Add remote if not exists
    try {
        execSync('git remote get-url origin', { stdio: 'pipe' });
        console.log('✅ Remote origin already configured');
    } catch (error) {
        console.log('⚠️  Please configure your git remote:');
        console.log(`   git remote add origin ${config.gitRepo}`);
        console.log('   Then run this script again');
        process.exit(1);
    }
    
    // Push to remote
    runCommand('git push -u origin main', 'Pushing to remote repository', { continueOnError: true });
    
    console.log('');
}

function createAwsInfrastructure() {
    console.log('☁️  Creating AWS infrastructure...\n');
    
    // Create ECR repository for Docker images
    runCommand(`aws ecr create-repository --repository-name ${config.projectName} --region ${config.awsRegion}`, 
        'Creating ECR repository', { continueOnError: true });
    
    // Get ECR login token
    const ecrLogin = execSync(`aws ecr get-login-password --region ${config.awsRegion}`, { encoding: 'utf8' });
    console.log('✅ ECR login token obtained');
    
    // Create S3 bucket for static assets
    const bucketName = `${config.projectName}-assets-${Date.now()}`;
    runCommand(`aws s3 mb s3://${bucketName} --region ${config.awsRegion}`, 
        'Creating S3 bucket for assets', { continueOnError: true });
    
    // Create CloudFormation stack
    const stackName = `${config.projectName}-stack`;
    runCommand(`aws cloudformation create-stack --stack-name ${stackName} --template-body file://aws-infrastructure.json --capabilities CAPABILITY_IAM --region ${config.awsRegion}`, 
        'Creating CloudFormation stack', { continueOnError: true });
    
    // Wait for stack creation
    console.log('⏳ Waiting for CloudFormation stack to complete...');
    runCommand(`aws cloudformation wait stack-create-complete --stack-name ${stackName} --region ${config.awsRegion}`, 
        'Waiting for stack completion', { continueOnError: true });
    
    // Get stack outputs
    const outputs = execSync(`aws cloudformation describe-stacks --stack-name ${stackName} --region ${config.awsRegion} --query 'Stacks[0].Outputs' --output json`, 
        { encoding: 'utf8', stdio: 'pipe' });
    
    console.log('📊 Stack outputs:', outputs);
    
    console.log('');
}

function buildAndPushDockerImage() {
    console.log('🐳 Building and pushing Docker image...\n');
    
    // Get ECR repository URI
    const ecrUri = execSync(`aws ecr describe-repositories --repository-names ${config.projectName} --region ${config.awsRegion} --query 'repositories[0].repositoryUri' --output text`, 
        { encoding: 'utf8', stdio: 'pipe' }).trim();
    
    // Build Docker image
    runCommand(`docker build -t ${config.projectName} .`, 'Building Docker image');
    
    // Tag for ECR
    runCommand(`docker tag ${config.projectName}:latest ${ecrUri}:latest`, 'Tagging Docker image');
    
    // Login to ECR
    runCommand(`aws ecr get-login-password --region ${config.awsRegion} | docker login --username AWS --password-stdin ${ecrUri.split('/')[0]}`, 
        'Logging into ECR');
    
    // Push to ECR
    runCommand(`docker push ${ecrUri}:latest`, 'Pushing Docker image to ECR');
    
    console.log('');
}

function deployToEcs() {
    console.log('🚀 Deploying to ECS...\n');
    
    // Create ECS cluster
    runCommand(`aws ecs create-cluster --cluster-name ${config.projectName}-cluster --region ${config.awsRegion}`, 
        'Creating ECS cluster', { continueOnError: true });
    
    // Create task definition
    const taskDefinition = {
        family: `${config.projectName}-task`,
        networkMode: 'awsvpc',
        requiresCompatibilities: ['FARGATE'],
        cpu: '512',
        memory: '1024',
        executionRoleArn: 'ecsTaskExecutionRole',
        containerDefinitions: [{
            name: `${config.projectName}-container`,
            image: `${config.projectName}:latest`,
            portMappings: [{
                containerPort: config.deploymentPort,
                protocol: 'tcp'
            }],
            environment: [
                { name: 'NODE_ENV', value: 'production' },
                { name: 'PORT', value: config.deploymentPort.toString() },
                { name: 'LM_STUDIO_URL', value: config.lmStudioUrl },
                { name: 'DOMAIN', value: config.domain }
            ],
            logConfiguration: {
                logDriver: 'awslogs',
                options: {
                    'awslogs-group': `/ecs/${config.projectName}`,
                    'awslogs-region': config.awsRegion,
                    'awslogs-stream-prefix': 'ecs'
                }
            }
        }]
    };
    
    fs.writeFileSync('task-definition.json', JSON.stringify(taskDefinition, null, 2));
    
    // Register task definition
    runCommand(`aws ecs register-task-definition --cli-input-json file://task-definition.json --region ${config.awsRegion}`, 
        'Registering ECS task definition');
    
    // Create service
    runCommand(`aws ecs create-service --cluster ${config.projectName}-cluster --service-name ${config.projectName}-service --task-definition ${config.projectName}-task --desired-count 1 --launch-type FARGATE --network-configuration "awsvpcConfiguration={subnets=[subnet-12345678],securityGroups=[sg-12345678],assignPublicIp=ENABLED}" --region ${config.awsRegion}`, 
        'Creating ECS service', { continueOnError: true });
    
    console.log('');
}

function setupDomainAndSsl() {
    console.log('🌐 Setting up domain and SSL...\n');
    
    // Request SSL certificate
    runCommand(`aws acm request-certificate --domain-name ${config.domain} --validation-method DNS --region ${config.awsRegion}`, 
        'Requesting SSL certificate', { continueOnError: true });
    
    // Create Route53 hosted zone if needed
    runCommand(`aws route53 create-hosted-zone --name ${config.domain} --caller-reference ${Date.now()} --region ${config.awsRegion}`, 
        'Creating Route53 hosted zone', { continueOnError: true });
    
    // Create CloudFront distribution
    const distributionConfig = {
        CallerReference: Date.now().toString(),
        Comment: `GPU Streaming System for ${config.domain}`,
        DefaultCacheBehavior: {
            TargetOriginId: 'S3-Origin',
            ViewerProtocolPolicy: 'redirect-to-https',
            AllowedMethods: ['GET', 'HEAD', 'OPTIONS'],
            CachedMethods: ['GET', 'HEAD'],
            ForwardedValues: {
                QueryString: false,
                Cookies: { Forward: 'none' }
            },
            MinTTL: 0,
            DefaultTTL: 86400,
            MaxTTL: 31536000
        },
        Enabled: true,
        Origins: [{
            Id: 'S3-Origin',
            DomainName: `${config.projectName}-assets-${Date.now()}.s3.amazonaws.com`,
            S3OriginConfig: {
                OriginAccessIdentity: ''
            }
        }]
    };
    
    fs.writeFileSync('cloudfront-config.json', JSON.stringify(distributionConfig, null, 2));
    
    runCommand(`aws cloudfront create-distribution --distribution-config file://cloudfront-config.json --region ${config.awsRegion}`, 
        'Creating CloudFront distribution', { continueOnError: true });
    
    console.log('');
}

function testLmStudioConnection() {
    console.log('🔍 Testing LM Studio connection...\n');
    
    try {
        const response = execSync(`curl -s -o /dev/null -w "%{http_code}" ${config.lmStudioUrl}/health`, { encoding: 'utf8' });
        if (response.trim() === '200') {
            console.log(`✅ LM Studio is accessible at ${config.lmStudioUrl}`);
        } else {
            console.log(`⚠️  LM Studio responded with status ${response.trim()}`);
        }
    } catch (error) {
        console.log(`⚠️  Could not connect to LM Studio at ${config.lmStudioUrl}`);
        console.log('   This is expected if LM Studio is not running yet');
    }
    
    console.log('');
}

function createMonitoringAndAlerts() {
    console.log('📊 Setting up monitoring and alerts...\n');
    
    // Create CloudWatch log group
    runCommand(`aws logs create-log-group --log-group-name /aws/ecs/${config.projectName} --region ${config.awsRegion}`, 
        'Creating CloudWatch log group', { continueOnError: true });
    
    // Create CloudWatch dashboard
    const dashboardConfig = {
        DashboardName: `${config.projectName}-dashboard`,
        DashboardBody: JSON.stringify({
            widgets: [{
                type: 'metric',
                properties: {
                    metrics: [
                        ['AWS/ECS', 'CPUUtilization', 'ServiceName', `${config.projectName}-service`, 'ClusterName', `${config.projectName}-cluster`],
                        ['.', 'MemoryUtilization', '.', '.', '.', '.']
                    ],
                    period: 300,
                    stat: 'Average',
                    region: config.awsRegion,
                    title: 'GPU Streaming System Metrics'
                }
            }]
        })
    };
    
    fs.writeFileSync('dashboard-config.json', JSON.stringify(dashboardConfig, null, 2));
    
    runCommand(`aws cloudwatch put-dashboard --cli-input-json file://dashboard-config.json --region ${config.awsRegion}`, 
        'Creating CloudWatch dashboard', { continueOnError: true });
    
    // Create SNS topic for alerts
    runCommand(`aws sns create-topic --name ${config.projectName}-alerts --region ${config.awsRegion}`, 
        'Creating SNS topic for alerts', { continueOnError: true });
    
    console.log('');
}

function finalizeDeployment() {
    console.log('🎉 Finalizing deployment...\n');
    
    // Get service URL
    try {
        const serviceUrl = execSync(`aws cloudformation describe-stacks --stack-name ${config.projectName}-stack --region ${config.awsRegion} --query 'Stacks[0].Outputs[?OutputKey==LoadBalancerDNS].OutputValue' --output text`, 
            { encoding: 'utf8', stdio: 'pipe' }).trim();
        
        console.log('🌐 Your GPU Streaming System is now deployed!');
        console.log(`📱 Service URL: http://${serviceUrl}`);
        console.log(`🔗 LM Studio: ${config.lmStudioUrl}`);
        console.log(`🌍 Domain: https://${config.domain}`);
        
    } catch (error) {
        console.log('🌐 Deployment completed!');
        console.log('📱 Check your AWS console for the service URL');
    }
    
    console.log('\n📋 Next steps:');
    console.log('1. Update your DNS to point to the load balancer');
    console.log('2. Test the LM Studio connection');
    console.log('3. Monitor the application logs');
    console.log('4. Set up your GPU providers');
    
    console.log('\n🔧 Useful commands:');
    console.log(`- View logs: aws logs tail /aws/ecs/${config.projectName} --follow`);
    console.log(`- Check service: aws ecs describe-services --cluster ${config.projectName}-cluster --services ${config.projectName}-service`);
    console.log(`- Scale service: aws ecs update-service --cluster ${config.projectName}-cluster --service ${config.projectName}-service --desired-count 2`);
    
    console.log('');
}

function main() {
    console.log('🚀 Starting complete GPU Streaming System deployment...\n');
    
    try {
        // Check AWS credentials
        if (!checkAwsCredentials()) {
            process.exit(1);
        }
        
        // Setup Git and push
        setupGitAndPush();
        
        // Create AWS infrastructure
        createAwsInfrastructure();
        
        // Build and push Docker image
        buildAndPushDockerImage();
        
        // Deploy to ECS
        deployToEcs();
        
        // Setup domain and SSL
        setupDomainAndSsl();
        
        // Test LM Studio connection
        testLmStudioConnection();
        
        // Setup monitoring and alerts
        createMonitoringAndAlerts();
        
        // Finalize deployment
        finalizeDeployment();
        
        console.log('🎉 Deployment completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check AWS credentials: aws configure');
        console.log('2. Verify git remote: git remote -v');
        console.log('3. Check AWS permissions');
        console.log('4. Review CloudFormation stack events');
        process.exit(1);
    }
}

// Run the deployment
main(); 