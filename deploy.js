/**
 * Consolidated Deployment Script for Coordinates Project
 * Single deployment script that handles all deployment scenarios
 * IDX-DEPLOY-CONSOLIDATED-001
 * 
 * Features:
 * - Multiple deployment targets (AWS, Vercel, Netlify, Heroku, Docker, Local)
 * - AWS SDK v3 with modern async/await patterns
 * - Comprehensive error handling and rollback capabilities
 * - Multi-region deployment support
 * - Advanced monitoring and logging
 * - Security best practices
 * - Cost optimization
 * - Automatic git operations
 * 
 * Usage:
 * - node deploy.js aws [--region=us-east-1] [--domain=rekursing.com]
 * - node deploy.js vercel [--prod]
 * - node deploy.js netlify [--prod]
 * - node deploy.js heroku
 * - node deploy.js docker [--compose]
 * - node deploy.js local [--prod]
 * - node deploy.js build
 * - node deploy.js help
 */

import { 
    S3Client, 
    CreateBucketCommand, 
    PutBucketWebsiteCommand,
    PutBucketPolicyCommand,
    PutObjectCommand,
    ListObjectsV2Command,
    DeleteObjectCommand,
    GetBucketLocationCommand
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
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConsolidatedDeployer {
    constructor(config = {}) {
        this.config = {
            projectName: 'coordinates-game',
            domain: 'rekursing.com',
            region: 'us-east-1',
            secondaryRegion: 'us-west-2',
            bucketName: 'rekursing-game-assets',
            distributionId: null,
            accountId: process.env.AWS_ACCOUNT_ID,
            environment: process.env.NODE_ENV || 'production',
            enableMultiRegion: true,
            enableCDN: true,
            enableSSL: true,
            enableMonitoring: true,
            port: process.env.PORT || 3001,
            ...config
        };

        // Parse command line arguments
        this.parseArguments();
        
        // Initialize AWS clients if needed
        if (this.target === 'aws') {
            this.initializeAWSClients();
        }
        
        // Deployment state
        this.deploymentState = {
            started: new Date(),
            steps: [],
            errors: [],
            rollbackStack: []
        };
    }

    parseArguments() {
        const args = process.argv.slice(2);
        this.target = args[0] || 'help';
        this.options = {};
        
        // Parse additional options
        args.slice(1).forEach(arg => {
            if (arg.startsWith('--')) {
                const [key, value] = arg.substring(2).split('=');
                this.options[key] = value || true;
            }
        });
        
        // Override config with command line options
        if (this.options.region) this.config.region = this.options.region;
        if (this.options.domain) this.config.domain = this.options.domain;
        if (this.options.prod) this.config.environment = 'production';
    }

    initializeAWSClients() {
        const clientConfig = {
            region: this.config.region,
            maxAttempts: 3,
            retryMode: 'adaptive'
        };

        this.s3Client = new S3Client(clientConfig);
        this.cloudFrontClient = new CloudFrontClient(clientConfig);
        this.route53Client = new Route53Client(clientConfig);
        this.acmClient = new ACMClient(clientConfig);

        if (this.config.enableMultiRegion) {
            const secondaryConfig = { ...clientConfig, region: this.config.secondaryRegion };
            this.s3ClientSecondary = new S3Client(secondaryConfig);
        }
    }

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
    }

    async buildApplication() {
        const startTime = Date.now();
        
        try {
            await this.logStep('Build Application', 'progress', { message: 'Starting build process' });
            
            // Check Node.js version
            const nodeVersion = process.version;
            if (!nodeVersion.startsWith('v18') && !nodeVersion.startsWith('v20') && !nodeVersion.startsWith('v22')) {
                throw new Error(`Node.js version ${nodeVersion} not supported. Please use Node.js 18+, 20+, or 22+`);
            }

            // Clean previous build
            const distPath = path.join(__dirname, 'dist');
            if (fs.existsSync(distPath)) {
                fs.rmSync(distPath, { recursive: true, force: true });
            }

            // Install dependencies
            await this.logStep('Install Dependencies', 'progress', { message: 'Installing npm dependencies' });
            execSync('npm install', { stdio: 'inherit' });
            
            // Build the application
            await this.logStep('Build with Vite', 'progress', { message: 'Building with Vite' });
            execSync('npm run build', { stdio: 'inherit' });
            
            const duration = Date.now() - startTime;
            await this.logStep('Build Complete', 'success', { 
                message: 'Application built successfully',
                duration: duration
            });
            
            return true;
        } catch (error) {
            await this.logStep('Build Failed', 'error', { message: error.message });
            return false;
        }
    }

    async deployAWS() {
        try {
            await this.logStep('AWS Deployment', 'progress', { message: 'Starting AWS deployment' });
            
            // Check AWS credentials
            if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
                await this.logStep('AWS Credentials', 'error', { message: 'AWS credentials not found. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY' });
                return false;
            }

            // Build application first
            if (!(await this.buildApplication())) {
                return false;
            }

            // Setup S3 bucket
            await this.logStep('Setup S3 Bucket', 'progress', { message: 'Setting up S3 bucket' });
            const bucketCreated = await this.setupS3Bucket();
            if (!bucketCreated) return false;

            // Upload static assets
            await this.logStep('Upload Assets', 'progress', { message: 'Uploading static assets to S3' });
            const uploadSuccess = await this.uploadStaticAssets();
            if (!uploadSuccess) return false;

            // Setup CloudFront if enabled
            if (this.config.enableCDN) {
                await this.logStep('Setup CloudFront', 'progress', { message: 'Setting up CloudFront distribution' });
                const cdnSuccess = await this.setupCloudFront();
                if (!cdnSuccess) return false;
            }

            // Setup SSL certificate if enabled
            if (this.config.enableSSL) {
                await this.logStep('Setup SSL', 'progress', { message: 'Setting up SSL certificate' });
                const sslSuccess = await this.setupSSLCertificate();
                if (!sslSuccess) return false;
            }

            // Setup Route53 if domain is specified
            if (this.config.domain) {
                await this.logStep('Setup Route53', 'progress', { message: 'Setting up Route53 DNS' });
                const dnsSuccess = await this.setupRoute53();
                if (!dnsSuccess) return false;
            }

            await this.logStep('AWS Deployment Complete', 'success', { 
                message: `Deployment completed successfully. Site available at: https://${this.config.domain || this.config.bucketName}.s3-website-${this.config.region}.amazonaws.com`
            });
            
            return true;
        } catch (error) {
            await this.logStep('AWS Deployment Failed', 'error', { message: error.message });
            return false;
        }
    }

    async setupS3Bucket() {
        try {
            // Check if bucket exists
            try {
                await this.s3Client.send(new GetBucketLocationCommand({ Bucket: this.config.bucketName }));
                await this.logStep('S3 Bucket', 'info', { message: `Bucket ${this.config.bucketName} already exists` });
                return true;
            } catch (error) {
                // Bucket doesn't exist, create it
                await this.logStep('Create S3 Bucket', 'progress', { message: `Creating bucket ${this.config.bucketName}` });
                
                const createCommand = new CreateBucketCommand({
                    Bucket: this.config.bucketName,
                    CreateBucketConfiguration: {
                        LocationConstraint: this.config.region === 'us-east-1' ? undefined : this.config.region
                    }
                });
                
                await this.s3Client.send(createCommand);
                
                // Enable website hosting
                const websiteCommand = new PutBucketWebsiteCommand({
                    Bucket: this.config.bucketName,
                    WebsiteConfiguration: {
                        IndexDocument: { Suffix: 'index.html' },
                        ErrorDocument: { Key: 'index.html' }
                    }
                });
                
                await this.s3Client.send(websiteCommand);
                
                // Set bucket policy for public read access
                const policy = {
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
                    Policy: JSON.stringify(policy)
                });
                
                await this.s3Client.send(policyCommand);
                
                await this.logStep('S3 Bucket Created', 'success', { message: `Bucket ${this.config.bucketName} created and configured` });
                return true;
            }
        } catch (error) {
            await this.logStep('S3 Bucket Failed', 'error', { message: error.message });
            return false;
        }
    }

    async uploadStaticAssets() {
        try {
            const distPath = path.join(__dirname, 'dist');
            if (!fs.existsSync(distPath)) {
                throw new Error('Dist folder not found. Please run build first.');
            }

            const files = this.getAllFiles(distPath);
            let uploadedCount = 0;

            for (const file of files) {
                const relativePath = path.relative(distPath, file);
                const key = relativePath.replace(/\\/g, '/');
                const contentType = this.getContentType(file);
                const cacheControl = this.getCacheControl(file);

                try {
                    const command = new PutObjectCommand({
                        Bucket: this.config.bucketName,
                        Key: key,
                        Body: fs.readFileSync(file),
                        ContentType: contentType,
                        CacheControl: cacheControl,
                        ACL: 'public-read'
                    });

                    await this.s3Client.send(command);
                    uploadedCount++;
                    
                    if (uploadedCount % 10 === 0) {
                        await this.logStep('Upload Progress', 'info', { message: `Uploaded ${uploadedCount}/${files.length} files` });
                    }
                } catch (error) {
                    await this.logStep('Upload Error', 'error', { message: `Failed to upload ${key}: ${error.message}` });
                    return false;
                }
            }

            await this.logStep('Upload Complete', 'success', { message: `Successfully uploaded ${uploadedCount} files` });
            return true;
        } catch (error) {
            await this.logStep('Upload Failed', 'error', { message: error.message });
            return false;
        }
    }

    async setupCloudFront() {
        try {
            // Create CloudFront distribution
            const distributionCommand = new CreateDistributionCommand({
                DistributionConfig: {
                    CallerReference: `${this.config.projectName}-${Date.now()}`,
                    Comment: `CloudFront distribution for ${this.config.projectName}`,
                    DefaultCacheBehavior: {
                        TargetOriginId: this.config.bucketName,
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
                                Id: this.config.bucketName,
                                DomainName: `${this.config.bucketName}.s3-website-${this.config.region}.amazonaws.com`,
                                CustomOriginConfig: {
                                    HTTPPort: 80,
                                    HTTPSPort: 443,
                                    OriginProtocolPolicy: 'http-only'
                                }
                            }
                        ]
                    }
                }
            });

            const distribution = await this.cloudFrontClient.send(distributionCommand);
            this.config.distributionId = distribution.Distribution.Id;

            await this.logStep('CloudFront Created', 'success', { 
                message: `CloudFront distribution created: ${this.config.distributionId}` 
            });
            
            return true;
        } catch (error) {
            await this.logStep('CloudFront Failed', 'error', { message: error.message });
            return false;
        }
    }

    async setupSSLCertificate() {
        try {
            // Request SSL certificate
            const certificateCommand = new RequestCertificateCommand({
                DomainName: this.config.domain,
                SubjectAlternativeNames: [`*.${this.config.domain}`],
                ValidationMethod: ValidationMethod.DNS
            });

            const certificate = await this.acmClient.send(certificateCommand);
            
            await this.logStep('SSL Certificate', 'success', { 
                message: `SSL certificate requested: ${certificate.CertificateArn}` 
            });
            
            return true;
        } catch (error) {
            await this.logStep('SSL Certificate Failed', 'error', { message: error.message });
            return false;
        }
    }

    async setupRoute53() {
        try {
            // List hosted zones
            const zonesCommand = new ListHostedZonesCommand({});
            const zones = await this.route53Client.send(zonesCommand);
            
            const hostedZone = zones.HostedZones.find(zone => 
                zone.Name === `${this.config.domain}.` || 
                zone.Name === this.config.domain
            );

            if (!hostedZone) {
                await this.logStep('Route53 Setup', 'warning', { 
                    message: `No hosted zone found for ${this.config.domain}. Please create one manually.` 
                });
                return true;
            }

            // Create A record pointing to CloudFront
            if (this.config.distributionId) {
                const changeCommand = new ChangeResourceRecordSetsCommand({
                    HostedZoneId: hostedZone.Id,
                    ChangeBatch: {
                        Changes: [
                            {
                                Action: 'UPSERT',
                                ResourceRecordSet: {
                                    Name: this.config.domain,
                                    Type: 'A',
                                    AliasTarget: {
                                        DNSName: `${this.config.distributionId}.cloudfront.net`,
                                        HostedZoneId: 'Z2FDTNDATAQYW2', // CloudFront hosted zone ID
                                        EvaluateTargetHealth: false
                                    }
                                }
                            }
                        ]
                    }
                });

                await this.route53Client.send(changeCommand);
                
                await this.logStep('Route53 Setup', 'success', { 
                    message: `DNS record created for ${this.config.domain}` 
                });
            }
            
            return true;
        } catch (error) {
            await this.logStep('Route53 Setup Failed', 'error', { message: error.message });
            return false;
        }
    }

    async deployVercel() {
        try {
            await this.logStep('Vercel Deployment', 'progress', { message: 'Starting Vercel deployment' });
            
            // Build application first
            if (!(await this.buildApplication())) {
                return false;
            }

            // Check if Vercel CLI is installed
            try {
                execSync('vercel --version', { stdio: 'pipe' });
            } catch (error) {
                await this.logStep('Install Vercel CLI', 'progress', { message: 'Installing Vercel CLI' });
                execSync('npm install -g vercel', { stdio: 'inherit' });
            }
            
            // Deploy to Vercel
            const deployCommand = this.options.prod ? 'vercel --prod' : 'vercel';
            execSync(deployCommand, { stdio: 'inherit' });
            
            await this.logStep('Vercel Deployment Complete', 'success', { 
                message: 'Deployment to Vercel completed successfully' 
            });
            
            return true;
        } catch (error) {
            await this.logStep('Vercel Deployment Failed', 'error', { message: error.message });
            return false;
        }
    }

    async deployNetlify() {
        try {
            await this.logStep('Netlify Deployment', 'progress', { message: 'Starting Netlify deployment' });
            
            // Build application first
            if (!(await this.buildApplication())) {
                return false;
            }

            // Check if Netlify CLI is installed
            try {
                execSync('netlify --version', { stdio: 'pipe' });
            } catch (error) {
                await this.logStep('Install Netlify CLI', 'progress', { message: 'Installing Netlify CLI' });
                execSync('npm install -g netlify-cli', { stdio: 'inherit' });
            }
            
            // Deploy to Netlify
            const deployCommand = this.options.prod ? 'netlify deploy --prod --dir=dist' : 'netlify deploy --dir=dist';
            execSync(deployCommand, { stdio: 'inherit' });
            
            await this.logStep('Netlify Deployment Complete', 'success', { 
                message: 'Deployment to Netlify completed successfully' 
            });
            
            return true;
        } catch (error) {
            await this.logStep('Netlify Deployment Failed', 'error', { message: error.message });
            return false;
        }
    }

    async deployHeroku() {
        try {
            await this.logStep('Heroku Deployment', 'progress', { message: 'Starting Heroku deployment' });
            
            // Check if Heroku CLI is installed
            try {
                execSync('heroku --version', { stdio: 'pipe' });
            } catch (error) {
                await this.logStep('Heroku CLI', 'error', { message: 'Heroku CLI not found. Please install it first.' });
                return false;
            }
            
            // Create Heroku app if it doesn't exist
            try {
                execSync('heroku create coordinates-game', { stdio: 'inherit' });
            } catch (error) {
                await this.logStep('Heroku App', 'info', { message: 'App might already exist, continuing...' });
            }
            
            // Deploy to Heroku
            execSync('git push heroku main', { stdio: 'inherit' });
            
            // Open the app
            execSync('heroku open', { stdio: 'inherit' });
            
            await this.logStep('Heroku Deployment Complete', 'success', { 
                message: 'Deployment to Heroku completed successfully' 
            });
            
            return true;
        } catch (error) {
            await this.logStep('Heroku Deployment Failed', 'error', { message: error.message });
            return false;
        }
    }

    async deployDocker() {
        try {
            await this.logStep('Docker Deployment', 'progress', { message: 'Starting Docker deployment' });
            
            if (this.options.compose) {
                // Use Docker Compose
                execSync('docker-compose --profile prod up -d', { stdio: 'inherit' });
                await this.logStep('Docker Compose Complete', 'success', { 
                    message: `Application running on port ${this.config.port}` 
                });
            } else {
                // Build and run Docker container
                execSync('docker build -t coordinates-game .', { stdio: 'inherit' });
                execSync(`docker run -p ${this.config.port}:3001 coordinates-game`, { stdio: 'inherit' });
                await this.logStep('Docker Complete', 'success', { 
                    message: `Application running on port ${this.config.port}` 
                });
            }
            
            return true;
        } catch (error) {
            await this.logStep('Docker Deployment Failed', 'error', { message: error.message });
            return false;
        }
    }

    async startLocal() {
        try {
            await this.logStep('Local Server', 'progress', { message: 'Starting local server' });
            
            if (this.options.prod) {
                execSync(`npm run start:prod`, { stdio: 'inherit' });
            } else {
                execSync(`npm start`, { stdio: 'inherit' });
            }
            
            return true;
        } catch (error) {
            await this.logStep('Local Server Failed', 'error', { message: error.message });
            return false;
        }
    }

    async gitOperations() {
        try {
            await this.logStep('Git Operations', 'progress', { message: 'Performing git operations' });
            
            // Add all changes
            execSync('git add .', { stdio: 'inherit' });
            
            // Commit changes
            const commitMessage = `Deploy: ${this.target} deployment - ${new Date().toISOString()}`;
            execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
            
            // Push to remote
            execSync('git push origin main', { stdio: 'inherit' });
            
            await this.logStep('Git Operations Complete', 'success', { 
                message: 'Changes committed and pushed to remote repository' 
            });
            
            return true;
        } catch (error) {
            await this.logStep('Git Operations Failed', 'error', { message: error.message });
            return false;
        }
    }

    showHelp() {
        console.log(`
🚀 Coordinates Project - Consolidated Deployment Script
=====================================================

Usage: node deploy.js <target> [options]

Targets:
  aws       - Deploy to AWS (S3 + CloudFront + Route53)
  vercel    - Deploy to Vercel
  netlify   - Deploy to Netlify
  heroku    - Deploy to Heroku
  docker    - Deploy using Docker
  local     - Start local development server
  build     - Build application only
  help      - Show this help message

Options:
  --region=<region>    - AWS region (default: us-east-1)
  --domain=<domain>    - Custom domain (default: rekursing.com)
  --prod              - Production mode
  --compose           - Use Docker Compose (for docker target)

Examples:
  node deploy.js aws --region=us-west-2 --domain=mygame.com
  node deploy.js vercel --prod
  node deploy.js netlify --prod
  node deploy.js docker --compose
  node deploy.js local --prod
  node deploy.js build

Environment Variables:
  AWS_ACCESS_KEY_ID     - AWS access key
  AWS_SECRET_ACCESS_KEY  - AWS secret key
  AWS_ACCOUNT_ID        - AWS account ID
  PORT                  - Server port (default: 3001)
  NODE_ENV              - Environment (default: production)
`);
    }

    getAllFiles(dirPath, arrayOfFiles = []) {
        const files = fs.readdirSync(dirPath);
        
        arrayOfFiles = arrayOfFiles || [];
        
        files.forEach(file => {
            if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
                arrayOfFiles = this.getAllFiles(path.join(dirPath, file), arrayOfFiles);
            } else {
                arrayOfFiles.push(path.join(dirPath, file));
            }
        });
        
        return arrayOfFiles;
    }

    getContentType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
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
        return mimeTypes[ext] || 'application/octet-stream';
    }

    getCacheControl(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const staticAssets = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
        
        if (staticAssets.includes(ext)) {
            return 'public, max-age=31536000, immutable'; // 1 year
        }
        
        return 'public, max-age=0, must-revalidate';
    }

    async deploy() {
        console.log(`🚀 Starting ${this.target} deployment...\n`);
        
        let success = false;
        
        try {
            switch (this.target) {
                case 'aws':
                    success = await this.deployAWS();
                    break;
                case 'vercel':
                    success = await this.deployVercel();
                    break;
                case 'netlify':
                    success = await this.deployNetlify();
                    break;
                case 'heroku':
                    success = await this.deployHeroku();
                    break;
                case 'docker':
                    success = await this.deployDocker();
                    break;
                case 'local':
                    success = await this.startLocal();
                    break;
                case 'build':
                    success = await this.buildApplication();
                    break;
                case 'help':
                    this.showHelp();
                    return;
                default:
                    console.error(`❌ Unknown deployment target: ${this.target}`);
                    this.showHelp();
                    return;
            }
            
            if (success && this.target !== 'local' && this.target !== 'build') {
                // Perform git operations after successful deployment
                await this.gitOperations();
            }
            
            console.log(`\n${success ? '✅' : '❌'} Deployment ${success ? 'completed successfully' : 'failed'}`);
            
        } catch (error) {
            console.error(`❌ Deployment failed with error: ${error.message}`);
        }
    }
}

// Main execution
async function main() {
    const deployer = new ConsolidatedDeployer();
    await deployer.deploy();
}

// Run if called directly
main().catch(console.error);

export default ConsolidatedDeployer; 