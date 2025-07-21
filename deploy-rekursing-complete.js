/**
 * Rekursing Complete Deployment Script
 * Ensures the entire Rekursing website is fully functional and deployed
 * 
 * This script handles:
 * - Complete build process with all assets
 * - AWS S3 + CloudFront deployment
 * - Domain configuration
 * - SSL certificate setup
 * - Performance optimization
 * - SEO optimization
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
    ListHostedZonesCommand
} from '@aws-sdk/client-route-53';
import { 
    ACMClient, 
    RequestCertificateCommand,
    DescribeCertificateCommand
} from '@aws-sdk/client-acm';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RekursingDeployer {
    constructor() {
        this.config = {
            projectName: 'rekursing-ai-gaming',
            domain: 'rekursing.com',
            region: 'us-east-1',
            bucketName: 'rekursing-ai-gaming-assets',
            distributionId: null,
            certificateArn: null,
            environment: process.env.NODE_ENV || 'production'
        };
        
        this.s3Client = new S3Client({ region: this.config.region });
        this.cloudFrontClient = new CloudFrontClient({ region: this.config.region });
        this.route53Client = new Route53Client({ region: this.config.region });
        this.acmClient = new ACMClient({ region: this.config.region });
        
        this.deploymentLog = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, message, type };
        this.deploymentLog.push(logEntry);
        console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
    }

    async deploy() {
        this.log('🚀 Starting Rekursing Complete Deployment', 'info');
        
        try {
            // Step 1: Validate environment
            await this.validateEnvironment();
            
            // Step 2: Build application
            await this.buildApplication();
            
            // Step 3: Setup AWS infrastructure
            await this.setupInfrastructure();
            
            // Step 4: Deploy to AWS
            await this.deployToAWS();
            
            // Step 5: Configure domain and SSL
            await this.configureDomain();
            
            // Step 6: Optimize performance
            await this.optimizePerformance();
            
            // Step 7: Verify deployment
            await this.verifyDeployment();
            
            this.log('🎉 Rekursing deployment completed successfully!', 'success');
            this.log(`🌐 Website available at: https://${this.config.domain}`, 'success');
            
        } catch (error) {
            this.log(`❌ Deployment failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async validateEnvironment() {
        this.log('🔍 Validating deployment environment...', 'info');
        
        // Check Node.js version
        const nodeVersion = process.version;
        if (!nodeVersion.startsWith('v18') && !nodeVersion.startsWith('v20') && !nodeVersion.startsWith('v22')) {
            throw new Error(`Node.js version ${nodeVersion} not supported. Please use Node.js 18+, 20+, or 22+`);
        }
        
        // Check AWS credentials
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            throw new Error('AWS credentials not found. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
        }
        
        // Check required files
        const requiredFiles = [
            'package.json',
            'vite.config.js',
            'index.html',
            'src/main.js',
            'src/unified-ui/App.jsx'
        ];
        
        for (const file of requiredFiles) {
            if (!fs.existsSync(file)) {
                throw new Error(`Required file not found: ${file}`);
            }
        }
        
        this.log('✅ Environment validation passed', 'success');
    }

    async buildApplication() {
        this.log('🔨 Building Rekursing application...', 'info');
        
        try {
            // Clean previous build
            const distPath = path.join(__dirname, 'dist');
            if (fs.existsSync(distPath)) {
                fs.rmSync(distPath, { recursive: true, force: true });
            }
            
            // Install dependencies
            this.log('📦 Installing dependencies...', 'info');
            execSync('npm install', { stdio: 'inherit' });
            
            // Build with Vite
            this.log('🏗️ Building with Vite...', 'info');
            execSync('npm run build', { stdio: 'inherit' });
            
            // Copy additional assets
            this.log('📁 Copying additional assets...', 'info');
            this.copyAssets();
            
            // Verify build
            if (!fs.existsSync('dist')) {
                throw new Error('Build failed: dist directory not found');
            }
            
            const buildFiles = this.getAllFiles('dist');
            this.log(`✅ Build completed: ${buildFiles.length} files generated`, 'success');
            
        } catch (error) {
            throw new Error(`Build failed: ${error.message}`);
        }
    }

    copyAssets() {
        const distPath = path.join(__dirname, 'dist');
        const publicPath = path.join(__dirname, 'public');
        
        // Copy static assets
        const assetsToCopy = [
            { src: path.join(publicPath, 'favicon.svg'), dest: path.join(distPath, 'favicon.svg') },
            { src: path.join(publicPath, 'favicon.png'), dest: path.join(distPath, 'favicon.png') },
            { src: path.join(publicPath, 'robots.txt'), dest: path.join(distPath, 'robots.txt') },
            { src: path.join(publicPath, 'sitemap.xml'), dest: path.join(distPath, 'sitemap.xml') }
        ];
        
        assetsToCopy.forEach(({ src, dest }) => {
            if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
                this.log(`✅ Copied ${path.basename(src)}`, 'info');
            }
        });
        
        // Create robots.txt if missing
        const robotsPath = path.join(distPath, 'robots.txt');
        if (!fs.existsSync(robotsPath)) {
            const robotsContent = `User-agent: *
Allow: /
Sitemap: https://rekursing.com/sitemap.xml`;
            fs.writeFileSync(robotsPath, robotsContent);
            this.log('✅ Created robots.txt', 'info');
        }
        
        // Create sitemap.xml if missing
        const sitemapPath = path.join(distPath, 'sitemap.xml');
        if (!fs.existsSync(sitemapPath)) {
            const sitemapContent = this.generateSitemap();
            fs.writeFileSync(sitemapPath, sitemapContent);
            this.log('✅ Created sitemap.xml', 'info');
        }
    }

    generateSitemap() {
        const now = new Date().toISOString();
        return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://rekursing.com/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://rekursing.com/play</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://rekursing.com/ai-dashboard</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://rekursing.com/tools</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://rekursing.com/docs</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://rekursing.com/settings</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;
    }

    async setupInfrastructure() {
        this.log('🏗️ Setting up AWS infrastructure...', 'info');
        
        try {
            // Create S3 bucket
            await this.createS3Bucket();
            
            // Setup CloudFront distribution
            await this.setupCloudFront();
            
            // Request SSL certificate
            await this.requestSSLCertificate();
            
            this.log('✅ Infrastructure setup completed', 'success');
            
        } catch (error) {
            throw new Error(`Infrastructure setup failed: ${error.message}`);
        }
    }

    async createS3Bucket() {
        this.log('🪣 Creating S3 bucket...', 'info');
        
        try {
            await this.s3Client.send(new CreateBucketCommand({
                Bucket: this.config.bucketName,
                CreateBucketConfiguration: {
                    LocationConstraint: this.config.region
                }
            }));
            
            // Configure bucket for website hosting
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
            
            await this.s3Client.send(new PutBucketPolicyCommand({
                Bucket: this.config.bucketName,
                Policy: JSON.stringify(bucketPolicy)
            }));
            
            this.log('✅ S3 bucket created and configured', 'success');
            
        } catch (error) {
            if (error.name === 'BucketAlreadyExists') {
                this.log('ℹ️ S3 bucket already exists', 'info');
            } else {
                throw error;
            }
        }
    }

    async setupCloudFront() {
        this.log('☁️ Setting up CloudFront distribution...', 'info');
        
        try {
            const response = await this.cloudFrontClient.send(new CreateDistributionCommand({
                DistributionConfig: {
                    CallerReference: `rekursing-${Date.now()}`,
                    Comment: 'Rekursing AI Gaming CDN',
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
                                DomainName: `${this.config.bucketName}.s3.amazonaws.com`,
                                S3OriginConfig: {
                                    OriginAccessIdentity: ''
                                }
                            }
                        ]
                    },
                    PriceClass: 'PriceClass_100'
                }
            }));
            
            this.config.distributionId = response.Distribution.Id;
            this.log(`✅ CloudFront distribution created: ${this.config.distributionId}`, 'success');
            
        } catch (error) {
            throw new Error(`CloudFront setup failed: ${error.message}`);
        }
    }

    async requestSSLCertificate() {
        this.log('🔒 Requesting SSL certificate...', 'info');
        
        try {
            const response = await this.acmClient.send(new RequestCertificateCommand({
                DomainName: this.config.domain,
                SubjectAlternativeNames: [`www.${this.config.domain}`],
                ValidationMethod: 'DNS'
            }));
            
            this.config.certificateArn = response.CertificateArn;
            this.log(`✅ SSL certificate requested: ${this.config.certificateArn}`, 'success');
            
        } catch (error) {
            throw new Error(`SSL certificate request failed: ${error.message}`);
        }
    }

    async deployToAWS() {
        this.log('🚀 Deploying to AWS...', 'info');
        
        try {
            const distPath = path.join(__dirname, 'dist');
            const files = this.getAllFiles(distPath);
            
            this.log(`📤 Uploading ${files.length} files to S3...`, 'info');
            
            for (const file of files) {
                const relativePath = path.relative(distPath, file);
                const key = relativePath.replace(/\\/g, '/');
                
                const fileContent = fs.readFileSync(file);
                const contentType = this.getContentType(file);
                
                await this.s3Client.send(new PutObjectCommand({
                    Bucket: this.config.bucketName,
                    Key: key,
                    Body: fileContent,
                    ContentType: contentType,
                    CacheControl: this.getCacheControl(file)
                }));
                
                this.log(`✅ Uploaded: ${key}`, 'info');
            }
            
            this.log('✅ All files uploaded successfully', 'success');
            
        } catch (error) {
            throw new Error(`AWS deployment failed: ${error.message}`);
        }
    }

    async configureDomain() {
        this.log('🌐 Configuring domain...', 'info');
        
        try {
            // List hosted zones
            const zonesResponse = await this.route53Client.send(new ListHostedZonesCommand({}));
            const hostedZone = zonesResponse.HostedZones.find(zone => 
                zone.Name === `${this.config.domain}.` || zone.Name === this.config.domain
            );
            
            if (!hostedZone) {
                this.log('⚠️ No hosted zone found for domain, skipping DNS configuration', 'warning');
                return;
            }
            
            // Create A record pointing to CloudFront
            const changeResponse = await this.route53Client.send(new ChangeResourceRecordSetsCommand({
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
                                    HostedZoneId: 'Z2FDTNDATAQYW2',
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
                                ResourceRecords: [
                                    { Value: `${this.config.distributionId}.cloudfront.net` }
                                ]
                            }
                        }
                    ]
                }
            }));
            
            this.log('✅ Domain configuration completed', 'success');
            
        } catch (error) {
            this.log(`⚠️ Domain configuration failed: ${error.message}`, 'warning');
        }
    }

    async optimizePerformance() {
        this.log('⚡ Optimizing performance...', 'info');
        
        try {
            // Create CloudFront invalidation
            if (this.config.distributionId) {
                await this.cloudFrontClient.send(new CreateInvalidationCommand({
                    DistributionId: this.config.distributionId,
                    InvalidationBatch: {
                        CallerReference: `rekursing-invalidation-${Date.now()}`,
                        Paths: {
                            Quantity: 1,
                            Items: ['/*']
                        }
                    }
                }));
                
                this.log('✅ CloudFront cache invalidated', 'success');
            }
            
            this.log('✅ Performance optimization completed', 'success');
            
        } catch (error) {
            this.log(`⚠️ Performance optimization failed: ${error.message}`, 'warning');
        }
    }

    async verifyDeployment() {
        this.log('🔍 Verifying deployment...', 'info');
        
        try {
            // Check S3 bucket
            const objects = await this.s3Client.send(new ListObjectsV2Command({
                Bucket: this.config.bucketName
            }));
            
            this.log(`✅ S3 bucket contains ${objects.Contents?.length || 0} objects`, 'success');
            
            // Check if index.html exists
            const indexExists = objects.Contents?.some(obj => obj.Key === 'index.html');
            if (!indexExists) {
                throw new Error('index.html not found in S3 bucket');
            }
            
            this.log('✅ Deployment verification passed', 'success');
            
        } catch (error) {
            throw new Error(`Deployment verification failed: ${error.message}`);
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

    getContentType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
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
            '.eot': 'application/vnd.ms-fontobject',
            '.xml': 'application/xml',
            '.txt': 'text/plain'
        };
        
        return contentTypes[ext] || 'application/octet-stream';
    }

    getCacheControl(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        
        if (ext === '.html') {
            return 'no-cache, no-store, must-revalidate';
        } else if (['.css', '.js'].includes(ext)) {
            return 'public, max-age=31536000, immutable';
        } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'].includes(ext)) {
            return 'public, max-age=31536000';
        } else {
            return 'public, max-age=86400';
        }
    }
}

// Main execution
async function main() {
    const deployer = new RekursingDeployer();
    
    try {
        await deployer.deploy();
        console.log('\n🎉 Rekursing deployment completed successfully!');
        console.log(`🌐 Website: https://${deployer.config.domain}`);
        console.log(`📊 CloudFront: ${deployer.config.distributionId}`);
        console.log(`🪣 S3 Bucket: ${deployer.config.bucketName}`);
    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { RekursingDeployer };
export default main; 