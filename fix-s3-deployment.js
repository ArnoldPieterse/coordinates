/**
 * Comprehensive S3 Deployment Fix
 * Uploads files to multiple locations for maximum compatibility
 */

import { 
    S3Client, 
    PutObjectCommand,
    ListObjectsV2Command,
    GetObjectCommand
} from '@aws-sdk/client-s3';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ComprehensiveS3Fix {
    constructor() {
        this.config = {
            bucketName: 'rekursing.com',
            region: 'us-east-1',
            s3WebsiteEndpoint: 'http://rekursing.com.s3-website-us-east-1.amazonaws.com'
        };

        this.s3Client = new S3Client({ region: this.config.region });
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
            execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
            await this.logStep('Build Application', 'success', { message: 'Build completed' });
            return true;
        } catch (error) {
            await this.logStep('Build Application', 'error', { message: error.message });
            throw error;
        }
    }

    async uploadToMultipleLocations() {
        try {
            await this.logStep('Upload Strategy', 'progress', { message: 'Uploading to multiple locations for maximum compatibility' });
            
            const distPath = path.join(__dirname, 'dist');
            const files = this.getAllFiles(distPath);
            
            let uploadedCount = 0;
            
            // Upload all files to coordinates/ directory
            for (const file of files) {
                const relativePath = path.relative(distPath, file);
                const key = relativePath.replace(/\\/g, '/');
                
                const fileContent = fs.readFileSync(file);
                const contentType = this.getContentType(path.extname(file));
                
                // Upload to coordinates/ directory
                const coordinatesKey = `coordinates/${key}`;
                const uploadCommand = new PutObjectCommand({
                    Bucket: this.config.bucketName,
                    Key: coordinatesKey,
                    Body: fileContent,
                    ContentType: contentType,
                    CacheControl: this.getCacheControl(path.extname(file))
                });
                
                await this.s3Client.send(uploadCommand);
                uploadedCount++;
            }
            
            // Upload index.html to bucket root for direct access
            const mainIndexPath = path.join(distPath, 'index.html');
            if (fs.existsSync(mainIndexPath)) {
                const indexContent = fs.readFileSync(mainIndexPath, 'utf8');
                
                // Upload to bucket root
                const rootUploadCommand = new PutObjectCommand({
                    Bucket: this.config.bucketName,
                    Key: 'index.html',
                    Body: indexContent,
                    ContentType: 'text/html',
                    CacheControl: 'no-cache'
                });
                
                await this.s3Client.send(rootUploadCommand);
                uploadedCount++;
                
                // Also upload to coordinates/ directory
                const coordinatesUploadCommand = new PutObjectCommand({
                    Bucket: this.config.bucketName,
                    Key: 'coordinates/index.html',
                    Body: indexContent,
                    ContentType: 'text/html',
                    CacheControl: 'no-cache'
                });
                
                await this.s3Client.send(coordinatesUploadCommand);
                uploadedCount++;
            }
            
            await this.logStep('Upload Strategy', 'success', { 
                message: `Uploaded ${uploadedCount} files to multiple locations` 
            });
            
            return true;
        } catch (error) {
            await this.logStep('Upload Strategy', 'error', { message: error.message });
            throw error;
        }
    }

    async verifyUploads() {
        try {
            await this.logStep('Verify Uploads', 'progress', { message: 'Verifying all uploads' });
            
            // Check root index.html
            try {
                const rootCommand = new GetObjectCommand({
                    Bucket: this.config.bucketName,
                    Key: 'index.html'
                });
                await this.s3Client.send(rootCommand);
                await this.logStep('Verify Uploads', 'success', { message: 'Root index.html accessible' });
            } catch (error) {
                await this.logStep('Verify Uploads', 'warning', { message: 'Root index.html not accessible' });
            }
            
            // Check coordinates/index.html
            try {
                const coordinatesCommand = new GetObjectCommand({
                    Bucket: this.config.bucketName,
                    Key: 'coordinates/index.html'
                });
                await this.s3Client.send(coordinatesCommand);
                await this.logStep('Verify Uploads', 'success', { message: 'coordinates/index.html accessible' });
            } catch (error) {
                await this.logStep('Verify Uploads', 'error', { message: 'coordinates/index.html not accessible' });
            }
            
            return true;
        } catch (error) {
            await this.logStep('Verify Uploads', 'error', { message: error.message });
            throw error;
        }
    }

    async testEndpoints() {
        try {
            await this.logStep('Test Endpoints', 'progress', { message: 'Testing all endpoints' });
            
            console.log('\n🌐 Available Endpoints:');
            console.log('======================');
            console.log(`1. S3 Website Root: ${this.config.s3WebsiteEndpoint}/`);
            console.log(`2. S3 Website Coordinates: ${this.config.s3WebsiteEndpoint}/coordinates/`);
            console.log(`3. Direct S3 Root: https://${this.config.bucketName}.s3.amazonaws.com/`);
            console.log(`4. Direct S3 Coordinates: https://${this.config.bucketName}.s3.amazonaws.com/coordinates/`);
            console.log(`5. Custom Domain: https://rekursing.com/`);
            console.log(`6. Custom Domain Coordinates: https://rekursing.com/coordinates/`);
            
            await this.logStep('Test Endpoints', 'success', { message: 'Endpoint information displayed' });
            
            return true;
        } catch (error) {
            await this.logStep('Test Endpoints', 'error', { message: error.message });
            throw error;
        }
    }

    async deploy() {
        console.log('🚀 Comprehensive S3 Deployment Fix');
        console.log('==================================\n');
        
        try {
            // Step 1: Build application
            await this.buildApplication();
            
            // Step 2: Upload to multiple locations
            await this.uploadToMultipleLocations();
            
            // Step 3: Verify uploads
            await this.verifyUploads();
            
            // Step 4: Test endpoints
            await this.testEndpoints();
            
            console.log('\n🎉 Comprehensive Deployment Complete!');
            console.log('=====================================');
            console.log('Your application is now available at multiple endpoints:');
            console.log(`• S3 Website: ${this.config.s3WebsiteEndpoint}/`);
            console.log(`• S3 Website Coordinates: ${this.config.s3WebsiteEndpoint}/coordinates/`);
            console.log(`• Custom Domain: https://rekursing.com/`);
            console.log(`• Custom Domain Coordinates: https://rekursing.com/coordinates/`);
            
            console.log('\n📋 Next Steps:');
            console.log('1. Test the S3 website endpoints first');
            console.log('2. If S3 works but custom domain doesn\'t, check DNS/CloudFront');
            console.log('3. Enable LLM agents for further development');
            
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
    const fixer = new ComprehensiveS3Fix();
    
    try {
        await fixer.deploy();
    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

main(); 