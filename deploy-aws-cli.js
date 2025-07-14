/**
 * AWS CLI Deployment for rekursing.com
 * Uses AWS CLI commands directly for deployment
 * IDX-AWS-CLI-001
 */

import { execSync } from 'child_process';
import fs from 'fs';

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

async function uploadToS3WithCLI(bucketName) {
  console.log('\n📤 Step 2: Uploading files to S3 using AWS CLI...');
  
  try {
    // Use AWS CLI to sync the dist folder to S3
    const syncCommand = `aws s3 sync ${BUILD_DIR} s3://${bucketName} --delete --acl public-read`;
    console.log(`Running: ${syncCommand}`);
    
    execSync(syncCommand, { 
      stdio: 'inherit',
      env: {
        ...process.env,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_DEFAULT_REGION: process.env.AWS_DEFAULT_REGION
      }
    });
    
    console.log('✅ Upload completed successfully');
    return true;
  } catch (error) {
    console.error(`❌ Upload failed: ${error.message}`);
    return false;
  }
}

async function enableStaticHosting(bucketName) {
  console.log('\n🌐 Step 3: Enabling static website hosting...');
  
  try {
    // Enable static website hosting
    const websiteCommand = `aws s3 website s3://${bucketName} --index-document index.html --error-document index.html`;
    console.log(`Running: ${websiteCommand}`);
    
    execSync(websiteCommand, { 
      stdio: 'inherit',
      env: {
        ...process.env,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_DEFAULT_REGION: process.env.AWS_DEFAULT_REGION
      }
    });
    
    console.log('✅ Static website hosting enabled');
    return true;
  } catch (error) {
    console.error(`❌ Failed to enable static hosting: ${error.message}`);
    return false;
  }
}

async function setBucketPolicy(bucketName) {
  console.log('\n🔒 Step 4: Setting bucket policy for public access...');
  
  try {
    const policy = {
      Version: '2012-10-17',
      Statement: [{
        Sid: 'PublicReadGetObject',
        Effect: 'Allow',
        Principal: '*',
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${bucketName}/*`
      }]
    };
    
    // Write policy to temporary file
    const policyFile = 'temp-bucket-policy.json';
    fs.writeFileSync(policyFile, JSON.stringify(policy, null, 2));
    
    const policyCommand = `aws s3api put-bucket-policy --bucket ${bucketName} --policy file://${policyFile}`;
    console.log(`Running: ${policyCommand}`);
    
    execSync(policyCommand, { 
      stdio: 'inherit',
      env: {
        ...process.env,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_DEFAULT_REGION: process.env.AWS_DEFAULT_REGION
      }
    });
    
    // Clean up temporary file
    fs.unlinkSync(policyFile);
    
    console.log('✅ Bucket policy set successfully');
    return true;
  } catch (error) {
    console.error(`❌ Failed to set bucket policy: ${error.message}`);
    return false;
  }
}

async function getWebsiteURL(bucketName) {
  console.log('\n🌐 Step 5: Getting website URL...');
  
  try {
    const urlCommand = `aws s3api get-bucket-website --bucket ${bucketName}`;
    const result = execSync(urlCommand, { 
      encoding: 'utf8',
      env: {
        ...process.env,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_DEFAULT_REGION: process.env.AWS_DEFAULT_REGION
      }
    });
    
    console.log('✅ Website URL retrieved');
    return result;
  } catch (error) {
    console.error(`❌ Failed to get website URL: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🚀 AWS CLI Deployment for rekursing.com');
  console.log('========================================\n');
  
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
  
  // Step 3: Upload files using AWS CLI
  if (!await uploadToS3WithCLI(DOMAIN)) {
    console.log('❌ Cannot proceed without file upload');
    return;
  }
  
  // Step 4: Enable static website hosting
  if (!await enableStaticHosting(DOMAIN)) {
    console.log('⚠️  Static hosting setup failed, but files are uploaded');
  }
  
  // Step 5: Set bucket policy
  if (!await setBucketPolicy(DOMAIN)) {
    console.log('⚠️  Bucket policy setup failed, but files are uploaded');
  }
  
  // Step 6: Get website URL
  const websiteInfo = await getWebsiteURL(DOMAIN);
  
  console.log('\n🎉 AWS CLI Deployment Complete!');
  console.log(`🌐 Your files are uploaded to: s3://${DOMAIN}`);
  
  if (websiteInfo) {
    console.log('📋 Website configuration:');
    console.log(websiteInfo);
  }
  
  console.log('\n📝 Next steps:');
  console.log('1. Go to AWS Console: https://console.aws.amazon.com/s3/buckets');
  console.log(`2. Select bucket: ${DOMAIN}`);
  console.log('3. Go to Properties > Static website hosting');
  console.log('4. Note the website endpoint URL');
  console.log('5. Configure CloudFront and Route 53 for custom domain');
}

// Run the deployment
main().catch(error => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
}); 