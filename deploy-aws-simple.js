/**
 * Simple AWS Deployment Script for Coordinates Project
 * Deploys the multiplayer planetary shooter to AWS S3 + CloudFront
 * IDX-DEPLOY-002: Simple AWS Deployment Script
 */

import { 
    S3Client, 
    CreateBucketCommand, 
    PutBucketWebsiteCommand,
    PutBucketPolicyCommand,
    PutObjectCommand,
    ListObjectsV2Command
} from '@aws-sdk/client-s3';
import { 
    CloudFrontClient, 
    CreateDistributionCommand,
    GetDistributionCommand,
    CreateInvalidationCommand
} from '@aws-sdk/client-cloudfront';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SimpleAWSDeployer {
    constructor(config = {}) {
        this.config = {
            projectName: 'coordinates-game',
            region: 'us-east-1',
            bucketName: 'coordinates-game-assets',
            distributionId: null,
            environment: 'production',
            ...config
        };

        // Initialize AWS clients
        this.s3Client = new S3Client({ region: this.config.region });
        this.cloudFrontClient = new CloudFrontClient({ region: this.config.region });
        
        // Deployment state
        this.deploymentState = {
            started: new Date(),
            steps: [],
            errors: []
        };
    }

    async logStep(step, status = 'info', details = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            step,
            status,
            details
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
    }

    async buildApplication() {
        try {
            await this.logStep('Build Application', 'progress', { message: 'Starting build process' });
            
            // Check if dist directory exists
            const distPath = path.join(__dirname, 'dist');
            if (!fs.existsSync(distPath)) {
                await this.logStep('Build Application', 'info', { message: 'Building with Vite' });
                execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
            } else {
                await this.logStep('Build Application', 'info', { message: 'Build already exists' });
            }
            
            await this.logStep('Build Application', 'success', { message: 'Build completed' });
            return true;
        } catch (error) {
            await this.logStep('Build Application', 'error', { message: error.message });
            throw error;
        }
    }

    async setupS3Bucket() {
        try {
            await this.logStep('Setup S3 Bucket', 'progress', { message: 'Creating S3 bucket' });
            
            // Create bucket
            const createCommand = new CreateBucketCommand({
                Bucket: this.config.bucketName,
                CreateBucketConfiguration: {
                    LocationConstraint: this.config.region === 'us-east-1' ? undefined : this.config.region
                }
            });
            
            await this.s3Client.send(createCommand);
            await this.logStep('Setup S3 Bucket', 'success', { message: 'S3 bucket created' });
            
            // Configure bucket for static website hosting
            const websiteCommand = new PutBucketWebsiteCommand({
                Bucket: this.config.bucketName,
                WebsiteConfiguration: {
                    IndexDocument: { Suffix: 'index.html' },
                    ErrorDocument: { Key: 'index.html' }
                }
            });
            
            await this.s3Client.send(websiteCommand);
            await this.logStep('Setup S3 Bucket', 'success', { message: 'Static website hosting configured' });
            
            // Set bucket policy for public read access
            const bucketPolicy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Sid: 'PublicReadGetObject',
                        Effect: 'Allow',
                        Principal: '*',
                        Action: 's3:GetObject',
                        Resource: `arn:aws:s3:::${this.config.bucketName}/*`
                    }
                ]
            };
            
            const policyCommand = new PutBucketPolicyCommand({
                Bucket: this.config.bucketName,
                Policy: JSON.stringify(bucketPolicy)
            });
            
            await this.s3Client.send(policyCommand);
            await this.logStep('Setup S3 Bucket', 'success', { message: 'Public read access configured' });
            
            return true;
        } catch (error) {
            if (error.name === 'BucketAlreadyExists') {
                await this.logStep('Setup S3 Bucket', 'info', { message: 'Bucket already exists' });
                return true;
            }
            await this.logStep('Setup S3 Bucket', 'error', { message: error.message });
            throw error;
        }
    }

    async uploadStaticAssets() {
        try {
            await this.logStep('Upload Assets', 'progress', { message: 'Uploading static assets' });
            
            const distPath = path.join(__dirname, 'dist');
            const files = this.getAllFiles(distPath);
            
            let uploadedCount = 0;
            for (const file of files) {
                const relativePath = path.relative(distPath, file);
                const key = relativePath.replace(/\\/g, '/');
                
                const fileContent = fs.readFileSync(file);
                const contentType = this.getContentType(path.extname(file));
                
                const uploadCommand = new PutObjectCommand({
                    Bucket: this.config.bucketName,
                    Key: key,
                    Body: fileContent,
                    ContentType: contentType,
                    CacheControl: this.getCacheControl(path.extname(file))
                });
                
                await this.s3Client.send(uploadCommand);
                uploadedCount++;
            }
            
            await this.logStep('Upload Assets', 'success', { 
                message: `Uploaded ${uploadedCount} files to S3` 
            });
            
            return true;
        } catch (error) {
            await this.logStep('Upload Assets', 'error', { message: error.message });
            throw error;
        }
    }

    async setupCloudFront() {
        try {
            await this.logStep('Setup CloudFront', 'progress', { message: 'Creating CloudFront distribution' });
            
            const distributionCommand = new CreateDistributionCommand({
                DistributionConfig: {
                    CallerReference: `${this.config.projectName}-${Date.now()}`,
                    Comment: `Coordinates Game - ${this.config.environment}`,
                    DefaultCacheBehavior: {
                        TargetOriginId: 'S3Origin',
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
                        MaxTTL: 31536000
                    },
                    Enabled: true,
                    Origins: {
                        Quantity: 1,
                        Items: [
                            {
                                Id: 'S3Origin',
                                DomainName: `${this.config.bucketName}.s3.amazonaws.com`,
                                S3OriginConfig: {
                                    OriginAccessIdentity: ''
                                }
                            }
                        ]
                    },
                    PriceClass: 'PriceClass_100'
                }
            });
            
            const result = await this.cloudFrontClient.send(distributionCommand);
            this.config.distributionId = result.Distribution.Id;
            
            await this.logStep('Setup CloudFront', 'success', { 
                message: `CloudFront distribution created: ${this.config.distributionId}` 
            });
            
            return true;
        } catch (error) {
            await this.logStep('Setup CloudFront', 'error', { message: error.message });
            throw error;
        }
    }

    async invalidateCloudFront() {
        if (!this.config.distributionId) {
            await this.logStep('Invalidate CloudFront', 'warning', { 
                message: 'No distribution ID available for invalidation' 
            });
            return;
        }
        
        try {
            await this.logStep('Invalidate CloudFront', 'progress', { message: 'Creating invalidation' });
            
            const invalidationCommand = new CreateInvalidationCommand({
                DistributionId: this.config.distributionId,
                InvalidationBatch: {
                    CallerReference: `invalidation-${Date.now()}`,
                    Paths: {
                        Quantity: 1,
                        Items: ['/*']
                    }
                }
            });
            
            await this.cloudFrontClient.send(invalidationCommand);
            await this.logStep('Invalidate CloudFront', 'success', { message: 'CloudFront invalidation created' });
            
        } catch (error) {
            await this.logStep('Invalidate CloudFront', 'error', { message: error.message });
        }
    }

    async healthCheck() {
        try {
            await this.logStep('Health Check', 'progress', { message: 'Performing health check' });
            
            // Check S3 bucket
            const listCommand = new ListObjectsV2Command({
                Bucket: this.config.bucketName,
                MaxKeys: 1
            });
            
            await this.s3Client.send(listCommand);
            await this.logStep('Health Check', 'success', { message: 'S3 bucket accessible' });
            
            // Check CloudFront distribution
            if (this.config.distributionId) {
                const getCommand = new GetDistributionCommand({
                    Id: this.config.distributionId
                });
                
                const result = await this.cloudFrontClient.send(getCommand);
                const status = result.Distribution.Status;
                
                if (status === 'Deployed') {
                    await this.logStep('Health Check', 'success', { 
                        message: `CloudFront distribution deployed: ${result.Distribution.DomainName}` 
                    });
                } else {
                    await this.logStep('Health Check', 'warning', { 
                        message: `CloudFront distribution status: ${status}` 
                    });
                }
            }
            
            return true;
        } catch (error) {
            await this.logStep('Health Check', 'error', { message: error.message });
            throw error;
        }
    }

    async deploy() {
        console.log('🚀 Starting AWS Deployment for Coordinates Project');
        console.log('================================================\n');
        
        try {
            // Step 1: Build application
            await this.buildApplication();
            
            // Step 2: Setup S3 bucket
            await this.setupS3Bucket();
            
            // Step 3: Upload static assets
            await this.uploadStaticAssets();
            
            // Step 4: Setup CloudFront
            await this.setupCloudFront();
            
            // Step 5: Invalidate CloudFront cache
            await this.invalidateCloudFront();
            
            // Step 6: Health check
            await this.healthCheck();
            
            const duration = Date.now() - this.deploymentState.started.getTime();
            await this.logStep('Deployment Complete', 'success', { 
                message: `Deployment completed in ${(duration / 1000).toFixed(2)}s` 
            });
            
            console.log('\n🎉 Deployment Summary');
            console.log('===================');
            console.log(`S3 Bucket: ${this.config.bucketName}`);
            console.log(`CloudFront Distribution: ${this.config.distributionId}`);
            console.log(`Region: ${this.config.region}`);
            console.log(`Environment: ${this.config.environment}`);
            
            if (this.config.distributionId) {
                console.log('\n🌐 Your application will be available at:');
                console.log(`https://${this.config.distributionId}.cloudfront.net`);
                console.log('\nNote: It may take a few minutes for CloudFront to fully deploy.');
            }
            
            return true;
        } catch (error) {
            const duration = Date.now() - this.deploymentState.started.getTime();
            await this.logStep('Deployment Failed', 'error', { 
                message: `Deployment failed after ${(duration / 1000).toFixed(2)}s: ${error.message}` 
            });
            throw error;
        }
    }

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
        
        return contentTypes[ext.toLowerCase()] || 'application/octet-stream';
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
        
        return cacheControls[ext.toLowerCase()] || 'public, max-age=3600';
    }
}

// CLI interface
async function main() {
    const deployer = new SimpleAWSDeployer();
    
    try {
        await deployer.deploy();
    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default SimpleAWSDeployer; 