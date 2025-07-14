/**
 * Working Deployment Script for rekursing.com
 * Uploads without ACLs for bucket with Object Ownership enabled
 * IDX-WORKING-001
 */

import { S3Client, PutObjectCommand, GetBucketLocationCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DOMAIN = 'www.rekursing.com';
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
    process.env.AWS_DEFAULT_REGION = 'us-east-1';
    
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

async function getBucketRegion(bucketName) {
  console.log(`\n🔍 Step 2: Detecting bucket region for ${bucketName}...`);
  
  const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'ap-southeast-2'];
  
  for (const region of regions) {
    try {
      const s3 = new S3Client({ 
        region: region,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });
      
      const location = await s3.send(new GetBucketLocationCommand({ Bucket: bucketName }));
      const bucketRegion = location.LocationConstraint || 'us-east-1';
      console.log(`✅ Bucket found in region: ${bucketRegion}`);
      return bucketRegion;
    } catch (error) {
      // Continue to next region
    }
  }
  
  console.log('⚠️  Could not detect bucket region, using default: us-east-1');
  return 'us-east-1';
}

async function uploadToS3(bucketName, region) {
  console.log(`\n📤 Step 3: Uploading files to S3 (${bucketName}) in region ${region}...`);
  
  const s3 = new S3Client({ 
    region: region,
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
            // Upload without ACL since bucket has Object Ownership enabled
            await s3.send(new PutObjectCommand({
              Bucket: bucketName,
              Key: key,
              Body: fs.readFileSync(filePath),
              ContentType: contentType
              // No ACL - bucket owner enforced
            }));
            console.log(`  📁 Uploaded: ${key}`);
          } catch (error) {
            console.error(`  ❌ Failed to upload ${key}: ${error.message}`);
            return false;
          }
        }
      }
      return true;
    }
    
    const success = await uploadDirectory(BUILD_DIR);
    if (success) {
      console.log('✅ Upload completed successfully');
      return true;
    } else {
      console.log('❌ Upload failed');
      return false;
    }
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

function createSuccessGuide() {
  console.log('\n🎉 SUCCESS! Your site is deployed!');
  console.log('==================================');
  console.log(`🌐 Files uploaded to: s3://${DOMAIN}`);
  console.log('📁 All files from the "dist" folder are now in your S3 bucket');
  console.log('\n📝 Next Steps:');
  console.log('1. Go to AWS Console: https://console.aws.amazon.com/s3/');
  console.log(`2. Select bucket: ${DOMAIN}`);
  console.log('3. Go to Properties > Static website hosting');
  console.log('4. Enable static website hosting with:');
  console.log('   - Index document: index.html');
  console.log('   - Error document: index.html');
  console.log('5. Copy the website endpoint URL (it will look like:');
  console.log('   http://www.rekursing.com.s3-website-ap-southeast-2.amazonaws.com)');
  console.log('\n🌐 For Custom Domain (www.rekursing.com):');
  console.log('1. Go to AWS Certificate Manager (ACM) in us-east-1 region');
  console.log('2. Request a certificate for www.rekursing.com');
  console.log('3. Validate the certificate (DNS validation)');
  console.log('4. Create a CloudFront distribution:');
  console.log('   - Origin: Your S3 bucket website endpoint');
  console.log('   - Alternate domain names: www.rekursing.com');
  console.log('   - SSL certificate: Your ACM certificate');
  console.log('5. Update Route 53 DNS records to point to CloudFront');
  console.log('\n🔗 Your site should be accessible at the S3 website endpoint once you enable static hosting!');
}

async function main() {
  console.log('🚀 Working Deployment for rekursing.com');
  console.log('=======================================\n');
  
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
  
  // Step 3: Get bucket region
  const bucketRegion = await getBucketRegion(DOMAIN);
  
  // Step 4: Upload files without ACLs
  const uploadSuccess = await uploadToS3(DOMAIN, bucketRegion);
  
  if (uploadSuccess) {
    createSuccessGuide();
  } else {
    console.log('\n❌ Upload failed. Please try manual upload:');
    console.log('1. Go to AWS Console: https://console.aws.amazon.com/s3/');
    console.log(`2. Select bucket: ${DOMAIN}`);
    console.log('3. Upload all files from the "dist" folder');
  }
}

// Run the deployment
main().catch(error => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
}); 