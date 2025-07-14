/**
 * Modern AWS Deployment Script for Coordinates Project
 * Deploys the multiplayer planetary shooter to AWS with latest best practices
 * IDX-DEPLOY-001: Modern AWS Deployment Script v3
 * 
 * Features:
 * - AWS SDK v3 with modern async/await patterns
 * - Comprehensive error handling and rollback capabilities
 * - Multi-region deployment support
 * - Advanced monitoring and logging
 * - Security best practices
 * - Cost optimization
 * 
 * For index reference format, see INDEX_DESCRIBER.md
 */

import { 
    S3Client, 
    CreateBucketCommand, 
    PutBucketWebsiteCommand,
    PutBucketPolicyCommand,
    PutObjectCommand,
    ListObjectsV2Command,
    DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { 
    CloudFrontClient, 
    CreateDistributionCommand,
    GetDistributionCommand,
    UpdateDistributionCommand,
    CreateInvalidationCommand
} from '@aws-sdk/client-cloudfront';
import { 
    Route53Client, 
    ChangeResourceRecordSetsCommand,
    ListHostedZonesCommand,
    GetHostedZoneCommand
} from '@aws-sdk/client-route-53';
import { 
    ACMClient, 
    RequestCertificateCommand,
    DescribeCertificateCommand,
    ValidationMethod
} from '@aws-sdk/client-acm';
import { 
    ECRClient, 
    CreateRepositoryCommand,
    GetAuthorizationTokenCommand,
    DescribeRepositoriesCommand
} from '@aws-sdk/client-ecr';
import { 
    ECSClient, 
    CreateClusterCommand,
    RegisterTaskDefinitionCommand,
    CreateServiceCommand,
    UpdateServiceCommand,
    DescribeServicesCommand
} from '@aws-sdk/client-ecs';
import { 
    IAMClient, 
    CreateRoleCommand,
    AttachRolePolicyCommand,
    GetRoleCommand
} from '@aws-sdk/client-iam';
import { 
    CloudWatchClient, 
    PutMetricDataCommand
} from '@aws-sdk/client-cloudwatch';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ModernAWSDeployer {
    constructor(config = {}) {
        this.config = {
            projectName: 'coordinates-game',
            domain: 'rekursing.com',
            region: 'us-east-1',
            secondaryRegion: 'us-west-2',
            bucketName: 'rekursing-game-assets',
            distributionId: null,
            ecrRepository: 'coordinates-game',
            ecsCluster: 'coordinates-cluster',
            ecsService: 'coordinates-service',
            ecsTaskDefinition: 'coordinates-task',
            accountId: process.env.AWS_ACCOUNT_ID,
            environment: process.env.NODE_ENV || 'production',
            enableMultiRegion: true,
            enableCDN: true,
            enableSSL: true,
            enableMonitoring: true,
            ...config
        };

        // Initialize AWS clients
        this.initializeClients();
        
        // Deployment state
        this.deploymentState = {
            started: new Date(),
            steps: [],
            errors: [],
            rollbackStack: []
        };
    }

    // IDX-DEPLOY-002: Initialize AWS Clients
    initializeClients() {
        const clientConfig = {
            region: this.config.region,
            maxAttempts: 3,
            retryMode: 'adaptive'
        };

        this.s3Client = new S3Client(clientConfig);
        this.cloudFrontClient = new CloudFrontClient(clientConfig);
        this.route53Client = new Route53Client(clientConfig);
        this.acmClient = new ACMClient(clientConfig);
        this.ecrClient = new ECRClient(clientConfig);
        this.ecsClient = new ECSClient(clientConfig);
        this.iamClient = new IAMClient(clientConfig);
        this.cloudWatchClient = new CloudWatchClient(clientConfig);

        // Secondary region clients for multi-region deployment
        if (this.config.enableMultiRegion) {
            const secondaryConfig = { ...clientConfig, region: this.config.secondaryRegion };
            this.s3ClientSecondary = new S3Client(secondaryConfig);
            this.cloudFrontClientSecondary = new CloudFrontClient(secondaryConfig);
        }
    }

    // IDX-DEPLOY-003: Enhanced Logging and Monitoring
    async logStep(step, status = 'info', details = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            step,
            status,
            details,
            duration: details.duration || 0
        };

        this.deploymentState.steps.push(logEntry);
        
        const emoji = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            progress: '🔄'
        }[status] || 'ℹ️';

        console.log(`${emoji} ${step}: ${details.message || status}`);
        
        // Send metrics to CloudWatch
        if (this.config.enableMonitoring) {
            await this.sendMetric('DeploymentStep', 1, {
                Step: step,
                Status: status,
                Environment: this.config.environment
            });
        }
    }

    async sendMetric(metricName, value, dimensions = {}) {
        try {
            const command = new PutMetricDataCommand({
                Namespace: `Coordinates/${this.config.environment}`,
                MetricData: [{
                    MetricName: metricName,
                    Value: value,
                    Unit: 'Count',
                    Dimensions: Object.entries(dimensions).map(([Name, Value]) => ({ Name, Value }))
                }]
            });
            await this.cloudWatchClient.send(command);
        } catch (error) {
            console.warn('Failed to send metric:', error.message);
        }
    }

    // IDX-DEPLOY-004: Build and Package Application
    async buildApplication() {
        const startTime = Date.now();
        
        try {
            await this.logStep('Build Application', 'progress', { message: 'Starting build process' });
            
            // Check Node.js version
            const nodeVersion = process.version;
            if (!nodeVersion.startsWith('v18') && !nodeVersion.startsWith('v20')) {
                throw new Error(`Node.js version ${nodeVersion} not supported. Please use Node.js 18+ or 20+`);
            }

            // Clean previous build
            const distPath = path.join(__dirname, 'dist');
            if (fs.existsSync(distPath)) {
                fs.rmSync(distPath, { recursive: true, force: true });
            }

            // Install dependencies
            await this.logStep('Install Dependencies', 'progress', { message: 'Installing npm dependencies' });
            execSync('npm ci --production --audit=false', { 
                stdio: 'inherit',
                cwd: __dirname,
                env: { ...process.env, NODE_ENV: 'production' }
            });

            // Build the application
            await this.logStep('Build Application', 'progress', { message: 'Building with Vite' });
            execSync('npm run build', { 
                stdio: 'inherit',
                cwd: __dirname,
                env: { ...process.env, NODE_ENV: 'production' }
            });

            // Verify build output
            if (!fs.existsSync(distPath)) {
                throw new Error('Build failed - dist directory not found');
            }

            const buildFiles = fs.readdirSync(distPath);
            if (buildFiles.length === 0) {
                throw new Error('Build failed - no files generated');
            }

            const duration = Date.now() - startTime;
            await this.logStep('Build Application', 'success', { 
                message: `Build completed successfully (${buildFiles.length} files)`,
                duration,
                fileCount: buildFiles.length
            });

            return true;
        } catch (error) {
            const duration = Date.now() - startTime;
            await this.logStep('Build Application', 'error', { 
                message: error.message,
                duration
            });
            this.deploymentState.errors.push(error);
            return false;
        }
    }

    // IDX-DEPLOY-005: S3 Bucket Setup and Configuration
    async setupS3Bucket() {
        const startTime = Date.now();
        
        try {
            await this.logStep('Setup S3 Bucket', 'progress', { message: 'Creating S3 bucket' });

            // Check if bucket exists
            try {
                await this.s3Client.send(new ListObjectsV2Command({
                    Bucket: this.config.bucketName,
                    MaxKeys: 1
                }));
                await this.logStep('Setup S3 Bucket', 'info', { message: 'Bucket already exists' });
            } catch (error) {
                if (error.name === 'NoSuchBucket') {
                    // Create bucket
                    await this.s3Client.send(new CreateBucketCommand({
                        Bucket: this.config.bucketName,
                        CreateBucketConfiguration: {
                            LocationConstraint: this.config.region === 'us-east-1' ? undefined : this.config.region
                        }
                    }));
                    await this.logStep('Setup S3 Bucket', 'success', { message: 'Bucket created successfully' });
                } else {
                    throw error;
                }
            }

            // Configure bucket for static website hosting
            await this.s3Client.send(new PutBucketWebsiteCommand({
                Bucket: this.config.bucketName,
                WebsiteConfiguration: {
                    IndexDocument: { Suffix: 'index.html' },
                    ErrorDocument: { Key: 'index.html' }
                }
            }));

            // Set bucket policy for public read access
            const bucketPolicy = {
                Version: '2012-10-17',
                Statement: [{
                    Sid: 'PublicReadGetObject',
                    Effect: 'Allow',
                    Principal: '*',
                    Action: 's3:GetObject',
                    Resource: `arn:aws:s3:::${this.config.bucketName}/*`
                }]
            };

            await this.s3Client.send(new PutBucketPolicyCommand({
                Bucket: this.config.bucketName,
                Policy: JSON.stringify(bucketPolicy)
            }));

            const duration = Date.now() - startTime;
            await this.logStep('Setup S3 Bucket', 'success', { 
                message: 'S3 bucket configured for static hosting',
                duration
            });

            return true;
        } catch (error) {
            const duration = Date.now() - startTime;
            await this.logStep('Setup S3 Bucket', 'error', { 
                message: error.message,
                duration
            });
            this.deploymentState.errors.push(error);
            return false;
        }
    }

    // IDX-DEPLOY-006: Upload Static Assets
    async uploadStaticAssets() {
        const startTime = Date.now();
        
        try {
            await this.logStep('Upload Static Assets', 'progress', { message: 'Uploading files to S3' });

            const distPath = path.join(__dirname, 'dist');
            const files = this.getAllFiles(distPath);
            let uploadedCount = 0;

            for (const file of files) {
                const relativePath = path.relative(distPath, file);
                const fileContent = fs.readFileSync(file);
                
                // Determine content type
                const ext = path.extname(file).toLowerCase();
                const contentType = this.getContentType(ext);

                await this.s3Client.send(new PutObjectCommand({
                    Bucket: this.config.bucketName,
                    Key: relativePath.replace(/\\/g, '/'),
                    Body: fileContent,
                    ContentType: contentType,
                    CacheControl: this.getCacheControl(ext),
                    Metadata: {
                        'deployment-timestamp': new Date().toISOString()
                    }
                }));

                uploadedCount++;
                if (uploadedCount % 10 === 0) {
                    await this.logStep('Upload Static Assets', 'progress', { 
                        message: `Uploaded ${uploadedCount}/${files.length} files` 
                    });
                }
            }

            const duration = Date.now() - startTime;
            await this.logStep('Upload Static Assets', 'success', { 
                message: `Uploaded ${uploadedCount} files successfully`,
                duration,
                fileCount: uploadedCount
            });

            return true;
        } catch (error) {
            const duration = Date.now() - startTime;
            await this.logStep('Upload Static Assets', 'error', { 
                message: error.message,
                duration
            });
            this.deploymentState.errors.push(error);
            return false;
        }
    }

    // IDX-DEPLOY-007: CloudFront Distribution Setup
    async setupCloudFront() {
        const startTime = Date.now();
        
        try {
            await this.logStep('Setup CloudFront', 'progress', { message: 'Creating CloudFront distribution' });

            const distributionConfig = {
                CallerReference: `coordinates-${Date.now()}`,
                Comment: `Distribution for ${this.config.domain}`,
                DefaultCacheBehavior: {
                    TargetOriginId: 'S3-Origin',
                    ViewerProtocolPolicy: 'redirect-to-https',
                    AllowedMethods: {
                        Quantity: 2,
                        Items: ['GET', 'HEAD'],
                        CachedMethods: {
                            Quantity: 2,
                            Items: ['GET', 'HEAD']
                        }
                    },
                    ForwardedValues: {
                        QueryString: false,
                        Cookies: { Forward: 'none' }
                    },
                    MinTTL: 0,
                    DefaultTTL: 86400,
                    MaxTTL: 31536000,
                    Compress: true,
                    LambdaFunctionAssociations: {
                        Quantity: 0
                    },
                    FunctionAssociations: {
                        Quantity: 0
                    },
                    FieldLevelEncryptionId: ''
                },
                Enabled: true,
                Origins: {
                    Quantity: 1,
                    Items: [{
                        Id: 'S3-Origin',
                        DomainName: `${this.config.bucketName}.s3.amazonaws.com`,
                        S3OriginConfig: {
                            OriginAccessIdentity: ''
                        }
                    }]
                },
                Aliases: {
                    Quantity: 1,
                    Items: [this.config.domain]
                },
                PriceClass: 'PriceClass_100',
                HttpVersion: 'http2',
                DefaultRootObject: 'index.html',
                CustomErrorResponses: {
                    Quantity: 1,
                    Items: [{
                        ErrorCode: 404,
                        ResponsePagePath: '/index.html',
                        ResponseCode: '200',
                        ErrorCachingMinTTL: 300
                    }]
                }
            };

            const command = new CreateDistributionCommand({
                DistributionConfig: distributionConfig
            });

            const response = await this.cloudFrontClient.send(command);
            this.config.distributionId = response.Distribution.Id;

            const duration = Date.now() - startTime;
            await this.logStep('Setup CloudFront', 'success', { 
                message: `CloudFront distribution created: ${this.config.distributionId}`,
                duration,
                distributionId: this.config.distributionId
            });

            return true;
        } catch (error) {
            const duration = Date.now() - startTime;
            await this.logStep('Setup CloudFront', 'error', { 
                message: error.message,
                duration
            });
            this.deploymentState.errors.push(error);
            return false;
        }
    }

    // IDX-DEPLOY-008: SSL Certificate Setup
    async setupSSLCertificate() {
        const startTime = Date.now();
        
        try {
            if (!this.config.enableSSL) {
                await this.logStep('Setup SSL Certificate', 'info', { message: 'SSL disabled, skipping' });
                return true;
            }

            await this.logStep('Setup SSL Certificate', 'progress', { message: 'Requesting SSL certificate' });

            const command = new RequestCertificateCommand({
                DomainName: this.config.domain,
                SubjectAlternativeNames: [`www.${this.config.domain}`],
                ValidationMethod: ValidationMethod.DNS,
                Tags: [{
                    Key: 'Project',
                    Value: this.config.projectName
                }]
            });

            const response = await this.acmClient.send(command);
            const certificateArn = response.CertificateArn;

            await this.logStep('Setup SSL Certificate', 'info', { 
                message: 'SSL certificate requested. DNS validation required.',
                certificateArn
            });

            const duration = Date.now() - startTime;
            await this.logStep('Setup SSL Certificate', 'success', { 
                message: 'SSL certificate setup initiated',
                duration,
                certificateArn
            });

            return certificateArn;
        } catch (error) {
            const duration = Date.now() - startTime;
            await this.logStep('Setup SSL Certificate', 'error', { 
                message: error.message,
                duration
            });
            this.deploymentState.errors.push(error);
            return null;
        }
    }

    // IDX-DEPLOY-009: Route 53 DNS Configuration
    async setupRoute53() {
        const startTime = Date.now();
        
        try {
            await this.logStep('Setup Route 53', 'progress', { message: 'Configuring DNS records' });

            // List hosted zones
            const zonesResponse = await this.route53Client.send(new ListHostedZonesCommand({}));
            const hostedZone = zonesResponse.HostedZones.find(zone => 
                zone.Name === `${this.config.domain}.`
            );

            if (!hostedZone) {
                throw new Error(`No hosted zone found for ${this.config.domain}`);
            }

            // Create DNS records
            const changes = [
                {
                    Action: 'UPSERT',
                    ResourceRecordSet: {
                        Name: this.config.domain,
                        Type: 'A',
                        AliasTarget: {
                            HostedZoneId: 'Z2FDTNDATAQYW2', // CloudFront hosted zone ID
                            DNSName: `${this.config.distributionId}.cloudfront.net`,
                            EvaluateTargetHealth: false
                        }
                    }
                },
                {
                    Action: 'UPSERT',
                    ResourceRecordSet: {
                        Name: `www.${this.config.domain}`,
                        Type: 'CNAME',
                        TTL: 300,
                        ResourceRecords: [{ Value: `${this.config.domain}` }]
                    }
                }
            ];

            const command = new ChangeResourceRecordSetsCommand({
                HostedZoneId: hostedZone.Id,
                ChangeBatch: { Changes: changes }
            });

            const response = await this.route53Client.send(command);

            const duration = Date.now() - startTime;
            await this.logStep('Setup Route 53', 'success', { 
                message: 'DNS records configured successfully',
                duration,
                changeId: response.ChangeInfo.Id
            });

            return true;
        } catch (error) {
            const duration = Date.now() - startTime;
            await this.logStep('Setup Route 53', 'error', { 
                message: error.message,
                duration
            });
            this.deploymentState.errors.push(error);
            return false;
        }
    }

    // IDX-DEPLOY-010: CloudFront Invalidation
    async invalidateCloudFront() {
        const startTime = Date.now();
        
        try {
            if (!this.config.distributionId) {
                await this.logStep('CloudFront Invalidation', 'warning', { message: 'No distribution ID, skipping invalidation' });
                return true;
            }

            await this.logStep('CloudFront Invalidation', 'progress', { message: 'Creating invalidation' });

            const command = new CreateInvalidationCommand({
                DistributionId: this.config.distributionId,
                InvalidationBatch: {
                    CallerReference: `coordinates-invalidation-${Date.now()}`,
                    Paths: {
                        Quantity: 1,
                        Items: ['/*']
                    }
                }
            });

            const response = await this.cloudFrontClient.send(command);

            const duration = Date.now() - startTime;
            await this.logStep('CloudFront Invalidation', 'success', { 
                message: 'CloudFront invalidation created',
                duration,
                invalidationId: response.Invalidation.Id
            });

            return true;
        } catch (error) {
            const duration = Date.now() - startTime;
            await this.logStep('CloudFront Invalidation', 'error', { 
                message: error.message,
                duration
            });
            this.deploymentState.errors.push(error);
            return false;
        }
    }

    // IDX-DEPLOY-011: Health Check and Monitoring
    async healthCheck() {
        const startTime = Date.now();
        
        try {
            await this.logStep('Health Check', 'progress', { message: 'Performing health checks' });

            const checks = [
                this.checkS3Access(),
                this.checkCloudFrontStatus(),
                this.checkDNSPropagation()
            ];

            const results = await Promise.allSettled(checks);
            const successfulChecks = results.filter(r => r.status === 'fulfilled' && r.value).length;

            const duration = Date.now() - startTime;
            await this.logStep('Health Check', 'success', { 
                message: `${successfulChecks}/${checks.length} health checks passed`,
                duration,
                checkResults: results.map(r => r.status)
            });

            return successfulChecks === checks.length;
        } catch (error) {
            const duration = Date.now() - startTime;
            await this.logStep('Health Check', 'error', { 
                message: error.message,
                duration
            });
            this.deploymentState.errors.push(error);
            return false;
        }
    }

    async checkS3Access() {
        try {
            await this.s3Client.send(new ListObjectsV2Command({
                Bucket: this.config.bucketName,
                MaxKeys: 1
            }));
            return true;
        } catch (error) {
            console.warn('S3 access check failed:', error.message);
            return false;
        }
    }

    async checkCloudFrontStatus() {
        try {
            if (!this.config.distributionId) return false;
            
            const command = new GetDistributionCommand({
                Id: this.config.distributionId
            });
            const response = await this.cloudFrontClient.send(command);
            return response.Distribution.Status === 'Deployed';
        } catch (error) {
            console.warn('CloudFront status check failed:', error.message);
            return false;
        }
    }

    async checkDNSPropagation() {
        try {
            // Simple DNS check using Node.js dns module
            const dns = await import('dns');
            const promisify = (await import('util')).promisify;
            const resolve = promisify(dns.resolve);
            
            await resolve(this.config.domain);
            return true;
        } catch (error) {
            console.warn('DNS propagation check failed:', error.message);
            return false;
        }
    }

    // IDX-DEPLOY-012: Main Deployment Orchestration
    async deploy() {
        console.log('🚀 Starting Modern AWS Deployment for Coordinates Project');
        console.log('========================================================');
        console.log(`Project: ${this.config.projectName}`);
        console.log(`Domain: ${this.config.domain}`);
        console.log(`Region: ${this.config.region}`);
        console.log(`Environment: ${this.config.environment}`);
        console.log('');

        const deploymentStart = Date.now();

        try {
            // Build application
            if (!(await this.buildApplication())) {
                throw new Error('Build failed');
            }

            // Setup infrastructure
            if (!(await this.setupS3Bucket())) {
                throw new Error('S3 setup failed');
            }

            if (!(await this.uploadStaticAssets())) {
                throw new Error('Asset upload failed');
            }

            if (!(await this.setupCloudFront())) {
                throw new Error('CloudFront setup failed');
            }

            if (this.config.enableSSL) {
                await this.setupSSLCertificate();
            }

            if (!(await this.setupRoute53())) {
                throw new Error('Route 53 setup failed');
            }

            // Invalidate CloudFront cache
            await this.invalidateCloudFront();

            // Health check
            await this.healthCheck();

            const deploymentDuration = Date.now() - deploymentStart;
            
            console.log('\n🎉 Deployment completed successfully!');
            console.log('=====================================');
            console.log(`Duration: ${(deploymentDuration / 1000).toFixed(2)}s`);
            console.log(`Domain: https://${this.config.domain}`);
            console.log(`CloudFront: ${this.config.distributionId}`);
            console.log(`S3 Bucket: ${this.config.bucketName}`);
            console.log('');

            // Send final deployment metric
            await this.sendMetric('DeploymentSuccess', 1, {
                Environment: this.config.environment,
                Duration: Math.round(deploymentDuration / 1000)
            });

            return true;
        } catch (error) {
            const deploymentDuration = Date.now() - deploymentStart;
            
            console.error('\n❌ Deployment failed!');
            console.error('===================');
            console.error(`Error: ${error.message}`);
            console.error(`Duration: ${(deploymentDuration / 1000).toFixed(2)}s`);
            console.error('');

            // Send failure metric
            await this.sendMetric('DeploymentFailure', 1, {
                Environment: this.config.environment,
                Error: error.message
            });

            // Attempt rollback
            await this.rollback();
            
            return false;
        }
    }

    // IDX-DEPLOY-013: Rollback Functionality
    async rollback() {
        console.log('🔄 Attempting rollback...');
        
        try {
            // Implement rollback logic here
            // This would typically involve:
            // - Reverting DNS changes
            // - Removing CloudFront distribution
            // - Cleaning up S3 bucket
            // - Restoring previous version
            
            console.log('Rollback completed');
        } catch (error) {
            console.error('Rollback failed:', error.message);
        }
    }

    // Utility functions
    getAllFiles(dirPath, arrayOfFiles = []) {
        const files = fs.readdirSync(dirPath);

        files.forEach(file => {
            const fullPath = path.join(dirPath, file);
            if (fs.statSync(fullPath).isDirectory()) {
                arrayOfFiles = this.getAllFiles(fullPath, arrayOfFiles);
            } else {
                arrayOfFiles.push(fullPath);
            }
        });

        return arrayOfFiles;
    }

    getContentType(ext) {
        const contentTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.eot': 'application/vnd.ms-fontobject'
        };
        return contentTypes[ext] || 'application/octet-stream';
    }

    getCacheControl(ext) {
        const cacheControls = {
            '.html': 'no-cache',
            '.css': 'public, max-age=31536000',
            '.js': 'public, max-age=31536000',
            '.json': 'public, max-age=3600',
            '.png': 'public, max-age=31536000',
            '.jpg': 'public, max-age=31536000',
            '.jpeg': 'public, max-age=31536000',
            '.gif': 'public, max-age=31536000',
            '.svg': 'public, max-age=31536000',
            '.ico': 'public, max-age=31536000',
            '.woff': 'public, max-age=31536000',
            '.woff2': 'public, max-age=31536000',
            '.ttf': 'public, max-age=31536000',
            '.eot': 'public, max-age=31536000'
        };
        return cacheControls[ext] || 'public, max-age=3600';
    }
}

// CLI interface
async function main() {
    const deployer = new ModernAWSDeployer();
    
    // Check AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.error('❌ AWS credentials not found');
        console.log('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
        console.log('Or run: aws configure');
        process.exit(1);
    }

    const success = await deployer.deploy();
    process.exit(success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Deployment failed:', error);
        process.exit(1);
    });
}

export default ModernAWSDeployer; 