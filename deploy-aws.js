/**
 * AWS Deployment Script for Coordinates Project
 * Deploys the multiplayer planetary shooter to AWS at rekursing.com
 * IDX-DEPLOY-001: AWS Deployment Script
 * 
 * For index reference format, see INDEX_DESCRIBER.md
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AWSDeployer {
    constructor() {
        this.projectName = 'coordinates-game';
        this.domain = 'rekursing.com';
        this.region = 'us-east-1';
        this.bucketName = 'rekursing-game-assets';
        this.distributionId = null;
        this.ecrRepository = 'coordinates-game';
        this.ecsCluster = 'coordinates-cluster';
        this.ecsService = 'coordinates-service';
        this.ecsTaskDefinition = 'coordinates-task';
    }

    // IDX-DEPLOY-002: Build and Package Application
    async buildApplication() {
        console.log('🏗️  Building application...');
        
        try {
            // Install dependencies
            console.log('📦 Installing dependencies...');
            execSync('npm ci --production', { stdio: 'inherit' });
            
            // Build the application
            console.log('🔨 Building with Vite...');
            execSync('npm run build', { stdio: 'inherit' });
            
            // Create production package
            console.log('📦 Creating production package...');
            const distPath = path.join(__dirname, 'dist');
            if (!fs.existsSync(distPath)) {
                throw new Error('Build failed - dist directory not found');
            }
            
            console.log('✅ Build completed successfully');
            return true;
        } catch (error) {
            console.error('❌ Build failed:', error.message);
            return false;
        }
    }

    // IDX-DEPLOY-003: Docker Build and Push
    async buildAndPushDocker() {
        console.log('🐳 Building and pushing Docker image...');
        
        try {
            // Build Docker image
            console.log('🔨 Building Docker image...');
            execSync(`docker build -t ${this.ecrRepository}:latest .`, { stdio: 'inherit' });
            
            // Get ECR login token
            console.log('🔐 Getting ECR login token...');
            const loginCmd = `aws ecr get-login-password --region ${this.region} | docker login --username AWS --password-stdin ${this.accountId}.dkr.ecr.${this.region}.amazonaws.com`;
            execSync(loginCmd, { stdio: 'inherit' });
            
            // Tag image for ECR
            const ecrUri = `${this.accountId}.dkr.ecr.${this.region}.amazonaws.com/${this.ecrRepository}`;
            execSync(`docker tag ${this.ecrRepository}:latest ${ecrUri}:latest`, { stdio: 'inherit' });
            
            // Push to ECR
            console.log('📤 Pushing to ECR...');
            execSync(`docker push ${ecrUri}:latest`, { stdio: 'inherit' });
            
            console.log('✅ Docker image pushed successfully');
            return ecrUri;
        } catch (error) {
            console.error('❌ Docker build/push failed:', error.message);
            return null;
        }
    }

    // IDX-DEPLOY-004: Deploy to ECS
    async deployToECS(ecrUri) {
        console.log('🚀 Deploying to ECS...');
        
        try {
            // Create ECS task definition
            const taskDefinition = {
                family: this.ecsTaskDefinition,
                networkMode: 'awsvpc',
                requiresCompatibilities: ['FARGATE'],
                cpu: '512',
                memory: '1024',
                executionRoleArn: `arn:aws:iam::${this.accountId}:role/ecsTaskExecutionRole`,
                taskRoleArn: `arn:aws:iam::${this.accountId}:role/ecsTaskRole`,
                containerDefinitions: [{
                    name: this.projectName,
                    image: `${ecrUri}:latest`,
                    portMappings: [{
                        containerPort: 3001,
                        protocol: 'tcp'
                    }],
                    environment: [
                        { name: 'NODE_ENV', value: 'production' },
                        { name: 'PORT', value: '3001' }
                    ],
                    logConfiguration: {
                        logDriver: 'awslogs',
                        options: {
                            'awslogs-group': `/ecs/${this.ecsTaskDefinition}`,
                            'awslogs-region': this.region,
                            'awslogs-stream-prefix': 'ecs'
                        }
                    }
                }]
            };
            
            // Write task definition to file
            fs.writeFileSync('task-definition.json', JSON.stringify(taskDefinition, null, 2));
            
            // Register task definition
            console.log('📝 Registering task definition...');
            execSync(`aws ecs register-task-definition --cli-input-json file://task-definition.json --region ${this.region}`, { stdio: 'inherit' });
            
            // Update ECS service
            console.log('🔄 Updating ECS service...');
            execSync(`aws ecs update-service --cluster ${this.ecsCluster} --service ${this.ecsService} --task-definition ${this.ecsTaskDefinition} --region ${this.region}`, { stdio: 'inherit' });
            
            console.log('✅ ECS deployment completed');
            return true;
        } catch (error) {
            console.error('❌ ECS deployment failed:', error.message);
            return false;
        }
    }

    // IDX-DEPLOY-005: Setup CloudFront Distribution
    async setupCloudFront() {
        console.log('☁️  Setting up CloudFront distribution...');
        
        try {
            // Create S3 bucket for assets
            console.log('🪣 Creating S3 bucket...');
            execSync(`aws s3 mb s3://${this.bucketName} --region ${this.region}`, { stdio: 'inherit' });
            
            // Upload static assets
            console.log('📤 Uploading static assets...');
            execSync(`aws s3 sync dist/ s3://${this.bucketName} --delete`, { stdio: 'inherit' });
            
            // Create CloudFront distribution
            const distributionConfig = {
                CallerReference: Date.now().toString(),
                Comment: `Distribution for ${this.domain}`,
                DefaultCacheBehavior: {
                    TargetOriginId: 'S3-Origin',
                    ViewerProtocolPolicy: 'redirect-to-https',
                    AllowedMethods: ['GET', 'HEAD'],
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
                    DomainName: `${this.bucketName}.s3.amazonaws.com`,
                    S3OriginConfig: {
                        OriginAccessIdentity: ''
                    }
                }],
                Aliases: {
                    Quantity: 1,
                    Items: [this.domain]
                }
            };
            
            // Write distribution config to file
            fs.writeFileSync('cloudfront-config.json', JSON.stringify(distributionConfig, null, 2));
            
            // Create CloudFront distribution
            console.log('🌐 Creating CloudFront distribution...');
            const result = execSync(`aws cloudfront create-distribution --distribution-config file://cloudfront-config.json --region ${this.region}`, { encoding: 'utf8' });
            const distribution = JSON.parse(result);
            this.distributionId = distribution.Distribution.Id;
            
            console.log(`✅ CloudFront distribution created: ${this.distributionId}`);
            return true;
        } catch (error) {
            console.error('❌ CloudFront setup failed:', error.message);
            return false;
        }
    }

    // IDX-DEPLOY-006: Setup Route 53 DNS
    async setupRoute53() {
        console.log('🌍 Setting up Route 53 DNS...');
        
        try {
            // Get hosted zone ID
            console.log('🔍 Finding hosted zone...');
            const zones = execSync(`aws route53 list-hosted-zones --region ${this.region}`, { encoding: 'utf8' });
            const hostedZones = JSON.parse(zones);
            const hostedZone = hostedZones.HostedZones.find(zone => zone.Name === `${this.domain}.`);
            
            if (!hostedZone) {
                throw new Error(`Hosted zone for ${this.domain} not found`);
            }
            
            // Create A record pointing to CloudFront
            const changeBatch = {
                Changes: [{
                    Action: 'UPSERT',
                    ResourceRecordSet: {
                        Name: this.domain,
                        Type: 'A',
                        AliasTarget: {
                            HostedZoneId: 'Z2FDTNDATAQYW2', // CloudFront hosted zone ID
                            DNSName: `${this.distributionId}.cloudfront.net`,
                            EvaluateTargetHealth: false
                        }
                    }
                }]
            };
            
            // Write change batch to file
            fs.writeFileSync('route53-changes.json', JSON.stringify(changeBatch, null, 2));
            
            // Apply DNS changes
            console.log('📝 Applying DNS changes...');
            execSync(`aws route53 change-resource-record-sets --hosted-zone-id ${hostedZone.Id} --change-batch file://route53-changes.json --region ${this.region}`, { stdio: 'inherit' });
            
            console.log('✅ Route 53 DNS configured');
            return true;
        } catch (error) {
            console.error('❌ Route 53 setup failed:', error.message);
            return false;
        }
    }

    // IDX-DEPLOY-007: Setup SSL Certificate
    async setupSSLCertificate() {
        console.log('🔒 Setting up SSL certificate...');
        
        try {
            // Request certificate
            console.log('📜 Requesting SSL certificate...');
            const certResult = execSync(`aws acm request-certificate --domain-name ${this.domain} --validation-method DNS --region ${this.region}`, { encoding: 'utf8' });
            const certificate = JSON.parse(certResult);
            const certArn = certificate.CertificateArn;
            
            console.log(`✅ SSL certificate requested: ${certArn}`);
            console.log('⚠️  Please validate the certificate in AWS Console before proceeding');
            
            return certArn;
        } catch (error) {
            console.error('❌ SSL certificate setup failed:', error.message);
            return null;
        }
    }

    // IDX-DEPLOY-008: Health Check and Monitoring
    async healthCheck() {
        console.log('🏥 Performing health check...');
        
        try {
            // Wait for deployment to complete
            console.log('⏳ Waiting for deployment to stabilize...');
            await new Promise(resolve => setTimeout(resolve, 30000));
            
            // Check ECS service status
            console.log('🔍 Checking ECS service status...');
            const serviceStatus = execSync(`aws ecs describe-services --cluster ${this.ecsCluster} --services ${this.ecsService} --region ${this.region}`, { encoding: 'utf8' });
            const service = JSON.parse(serviceStatus);
            
            if (service.services[0].status === 'ACTIVE' && service.services[0].runningCount > 0) {
                console.log('✅ ECS service is healthy');
            } else {
                throw new Error('ECS service is not healthy');
            }
            
            // Test website accessibility
            console.log('🌐 Testing website accessibility...');
            const response = await fetch(`https://${this.domain}`);
            if (response.ok) {
                console.log('✅ Website is accessible');
            } else {
                throw new Error('Website is not accessible');
            }
            
            console.log('🎉 Deployment completed successfully!');
            console.log(`🌐 Your game is now live at: https://${this.domain}`);
            return true;
        } catch (error) {
            console.error('❌ Health check failed:', error.message);
            return false;
        }
    }

    // IDX-DEPLOY-009: Main Deployment Method
    async deploy() {
        console.log('🚀 Starting AWS deployment for Coordinates project...');
        console.log(`🎯 Target: ${this.domain}`);
        console.log(`🌍 Region: ${this.region}`);
        
        try {
            // Get AWS account ID
            const accountResult = execSync('aws sts get-caller-identity --query Account --output text', { encoding: 'utf8' });
            this.accountId = accountResult.trim();
            console.log(`🏦 AWS Account: ${this.accountId}`);
            
            // Step 1: Build application
            if (!await this.buildApplication()) {
                throw new Error('Build failed');
            }
            
            // Step 2: Build and push Docker image
            const ecrUri = await this.buildAndPushDocker();
            if (!ecrUri) {
                throw new Error('Docker build/push failed');
            }
            
            // Step 3: Deploy to ECS
            if (!await this.deployToECS(ecrUri)) {
                throw new Error('ECS deployment failed');
            }
            
            // Step 4: Setup CloudFront
            if (!await this.setupCloudFront()) {
                throw new Error('CloudFront setup failed');
            }
            
            // Step 5: Setup Route 53 DNS
            if (!await this.setupRoute53()) {
                throw new Error('Route 53 setup failed');
            }
            
            // Step 6: Setup SSL certificate
            await this.setupSSLCertificate();
            
            // Step 7: Health check
            if (!await this.healthCheck()) {
                throw new Error('Health check failed');
            }
            
            console.log('🎉 Deployment completed successfully!');
            console.log(`🌐 Your multiplayer planetary shooter is now live at: https://${this.domain}`);
            console.log('🎮 Players can now join and play the game online!');
            
        } catch (error) {
            console.error('❌ Deployment failed:', error.message);
            process.exit(1);
        }
    }
}

// Run deployment if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const deployer = new AWSDeployer();
    deployer.deploy();
}

export default AWSDeployer; 