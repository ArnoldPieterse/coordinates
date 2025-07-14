/**
 * Simple S3 Deployment for rekursing.com
 * Just uploads files to existing S3 bucket
 * IDX-S3-SIMPLE-001
 */

import { S3Client, PutObjectCommand, ListBucketsCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DOMAIN = 'www.rekursing.com';
const REGION = 'us-east-1';
const BUILD_DIR = 'dist';

function readAWSCredentials() {
  console.log('🔧 Reading AWS credentials from rootkey.csv...');
  try {
    const csvContent = fs.readFileSync('rootkey.csv', 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    const accessKeyLine = lines[0];
    const secretKeyLine = lines[1];
    
    const accessKey = accessKeyLine.split(',')[1];
    const secretKey = secretKeyLine.split(',')[1];
    
    if (!accessKey || !secretKey) {
      throw new Error('Invalid credential format in rootkey.csv');
    }
    
    process.env.AWS_ACCESS_KEY_ID = accessKey.trim();
    process.env.AWS_SECRET_ACCESS_KEY = secretKey.trim();
    process.env.AWS_DEFAULT_REGION = REGION;
    
    console.log('✅ AWS credentials loaded successfully');
    console.log(`   Access Key: ${accessKey.substring(0, 10)}...`);
    console.log(`   Secret Key: ${secretKey.substring(0, 10)}...`);
    return true;
  } catch (error) {
    console.error('❌ Failed to read AWS credentials:', error.message);
    return false;
  }
}

async function buildSite() {
  console.log('\n🔨 Step 1: Building site...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Site built successfully');
    return true;
  } catch (error) {
    console.error('❌ Build failed');
    return false;
  }
}

async function uploadToS3(bucketName) {
  console.log('\n📤 Step 2: Uploading files to S3...');
  const s3 = new S3Client({ 
    region: REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
  try {
    async function uploadDirectory(dirPath, prefix = '') {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          await uploadDirectory(filePath, prefix ? `${prefix}/${file}` : file);
        } else {
          const key = prefix ? `${prefix}/${file}` : file;
          const contentType = getContentType(filePath);
          
          try {
            await s3.send(new PutObjectCommand({
              Bucket: bucketName,
              Key: key,
              Body: fs.readFileSync(filePath),
              ContentType: contentType,
              ACL: 'public-read'
            }));
            console.log(`  📁 Uploaded: ${key}`);
          } catch (error) {
            console.error(`  ❌ Failed to upload ${key}: ${error.message}`);
          }
        }
      }
    }
    
    await uploadDirectory(BUILD_DIR);
    console.log('✅ Upload completed');
    return true;
  } catch (error) {
    console.error(`❌ Upload failed: ${error.message}`);
    return false;
  }
}

function getContentType(filePath) {
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

async function main() {
  console.log('🚀 Simple S3 Deployment for rekursing.com');
  console.log('==========================================\n');
  
  // Step 1: Read AWS credentials
  if (!readAWSCredentials()) {
    console.log('❌ Cannot proceed without AWS credentials');
    return;
  }
  
  // Step 2: Build the site
  if (!await buildSite()) {
    console.log('❌ Cannot proceed without successful build');
    return;
  }
  
  // Step 3: Upload files
  if (!await uploadToS3(DOMAIN)) {
    console.log('❌ Cannot proceed without file upload');
    return;
  }
  
  console.log('\n🎉 Simple S3 Deployment Complete!');
  console.log(`🌐 Your files are uploaded to: s3://${DOMAIN}`);
  console.log('📝 Note: You may need to configure static website hosting manually in AWS Console');
  console.log('   Go to: https://console.aws.amazon.com/s3/buckets');
  console.log(`   Select bucket: ${DOMAIN}`);
  console.log('   Go to Properties > Static website hosting > Enable');
}

// Run the deployment
main().catch(error => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
}); 