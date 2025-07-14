/**
 * Working AWS Deployment Script for Coordinates Project
 * Deploys to existing S3 buckets with CloudFront
 */

import { 
    S3Client, 
    PutObjectCommand,
    ListObjectsV2Command
} from '@aws-sdk/client-s3';
import { 
    CloudFrontClient, 
    ListDistributionsCommand,
    CreateInvalidationCommand
} from '@aws-sdk/client-cloudfront';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WorkingAWSDeployer {
    constructor() {
        this.config = {
            bucketName: 'rekursing.com',
            region: 'us-east-1',
            distributionId: null
        };

        this.s3Client = new S3Client({ region: this.config.region });
        this.cloudFrontClient = new CloudFrontClient({ region: this.config.region });
    }

    async logStep(step, status = 'info', details = {}) {
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
            await this.logStep('Build Application', 'progress', { message: 'Building with Vite' });
            
            const distPath = path.join(__dirname, 'dist');
            if (!fs.existsSync(distPath)) {
                execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
            }
            
            await this.logStep('Build Application', 'success', { message: 'Build completed' });
            return true;
        } catch (error) {
            await this.logStep('Build Application', 'error', { message: error.message });
            throw error;
        }
    }

    async uploadToS3() {
        try {
            await this.logStep('Upload to S3', 'progress', { message: 'Uploading files to S3' });
            
            const distPath = path.join(__dirname, 'dist');
            const files = this.getAllFiles(distPath);
            
            let uploadedCount = 0;
            for (const file of files) {
                const relativePath = path.relative(distPath, file);
                const key = relativePath.replace(/\\/g, '/');
                
                // Skip if it's the root index.html, we'll upload it as coordinates/index.html
                if (key === 'index.html') {
                    continue;
                }
                
                const fileContent = fs.readFileSync(file);
                const contentType = this.getContentType(path.extname(file));
                
                const uploadCommand = new PutObjectCommand({
                    Bucket: this.config.bucketName,
                    Key: `coordinates/${key}`,
                    Body: fileContent,
                    ContentType: contentType,
                    CacheControl: this.getCacheControl(path.extname(file))
                });
                
                await this.s3Client.send(uploadCommand);
                uploadedCount++;
            }
            
            // Upload main index.html as coordinates/index.html
            const mainIndexPath = path.join(distPath, 'index.html');
            if (fs.existsSync(mainIndexPath)) {
                const indexContent = fs.readFileSync(mainIndexPath, 'utf8');
                const uploadCommand = new PutObjectCommand({
                    Bucket: this.config.bucketName,
                    Key: 'coordinates/index.html',
                    Body: indexContent,
                    ContentType: 'text/html',
                    CacheControl: 'no-cache'
                });
                
                await this.s3Client.send(uploadCommand);
                uploadedCount++;
            }
            
            await this.logStep('Upload to S3', 'success', { 
                message: `Uploaded ${uploadedCount} files to S3` 
            });
            
            return true;
        } catch (error) {
            await this.logStep('Upload to S3', 'error', { message: error.message });
            throw error;
        }
    }

    async findCloudFrontDistribution() {
        try {
            await this.logStep('Find CloudFront', 'progress', { message: 'Finding CloudFront distribution' });
            
            const command = new ListDistributionsCommand({});
            const response = await this.cloudFrontClient.send(command);
            
            const distribution = response.DistributionList.Items?.find(
                dist => dist.Origins.Items?.some(origin => 
                    origin.DomainName.includes(this.config.bucketName)
                )
            );
            
            if (distribution) {
                this.config.distributionId = distribution.Id;
                await this.logStep('Find CloudFront', 'success', { 
                    message: `Found distribution: ${distribution.Id}` 
                });
                return true;
            } else {
                await this.logStep('Find CloudFront', 'warning', { 
                    message: 'No CloudFront distribution found for this bucket' 
                });
                return false;
            }
        } catch (error) {
            await this.logStep('Find CloudFront', 'error', { message: error.message });
            return false;
        }
    }

    async invalidateCloudFront() {
        if (!this.config.distributionId) {
            await this.logStep('Invalidate CloudFront', 'warning', { 
                message: 'No distribution ID available' 
            });
            return;
        }
        
        try {
            await this.logStep('Invalidate CloudFront', 'progress', { message: 'Creating invalidation' });
            
            const command = new CreateInvalidationCommand({
                DistributionId: this.config.distributionId,
                InvalidationBatch: {
                    CallerReference: `coordinates-invalidation-${Date.now()}`,
                    Paths: {
                        Quantity: 1,
                        Items: ['/coordinates/*']
                    }
                }
            });
            
            await this.cloudFrontClient.send(command);
            await this.logStep('Invalidate CloudFront', 'success', { message: 'CloudFront invalidation created' });
            
        } catch (error) {
            await this.logStep('Invalidate CloudFront', 'error', { message: error.message });
        }
    }

    async deploy() {
        console.log('🚀 Deploying Coordinates Game to AWS');
        console.log('=====================================\n');
        
        try {
            // Step 1: Build application
            await this.buildApplication();
            
            // Step 2: Upload to S3
            await this.uploadToS3();
            
            // Step 3: Find CloudFront distribution
            await this.findCloudFrontDistribution();
            
            // Step 4: Invalidate CloudFront cache
            await this.invalidateCloudFront();
            
            console.log('\n🎉 Deployment Complete!');
            console.log('=====================');
            console.log(`S3 Bucket: ${this.config.bucketName}`);
            console.log(`CloudFront Distribution: ${this.config.distributionId || 'Not found'}`);
            console.log(`Region: ${this.config.region}`);
            
            if (this.config.distributionId) {
                console.log('\n🌐 Your game will be available at:');
                console.log(`https://rekursing.com/coordinates/`);
                console.log('\nNote: It may take a few minutes for CloudFront to update.');
            } else {
                console.log('\n🌐 Your game is available at:');
                console.log(`https://rekursing.com/coordinates/`);
            }
            
            return true;
        } catch (error) {
            console.error('\n❌ Deployment failed:', error.message);
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

// Run deployment
async function main() {
    const deployer = new WorkingAWSDeployer();
    
    try {
        await deployer.deploy();
    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

main(); 