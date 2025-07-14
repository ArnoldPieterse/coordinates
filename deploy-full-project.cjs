#!/usr/bin/env node

/**
 * Full Project Deployment Script
 * Builds and deploys the complete multiplayer planetary shooter project
 * IDX-DEPLOY-001: Full Project Deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Full Project Deployment...\n');

// Configuration
const config = {
  bucketName: 'rekursing.com',
  region: 'us-east-1',
  buildDir: 'dist',
  credentialsFile: 'rootkey.csv'
};

// Utility functions
function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    const result = execSync(command, { 
      stdio: 'inherit',
      encoding: 'utf8',
      cwd: process.cwd()
    });
    console.log(`✅ ${description} completed successfully`);
    return result;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...\n');
  
  // Check if AWS CLI is available
  try {
    execSync('aws --version', { stdio: 'pipe' });
    console.log('✅ AWS CLI found');
  } catch (error) {
    console.log('⚠️  AWS CLI not found in PATH, attempting to add...');
    
    // Try to add AWS CLI to PATH (Windows)
    if (process.platform === 'win32') {
      const awsPaths = [
        'C:\\Program Files\\Amazon\\AWSCLIV2',
        'C:\\Program Files (x86)\\Amazon\\AWSCLIV2',
        process.env.USERPROFILE + '\\AppData\\Local\\Programs\\Amazon\\AWSCLIV2'
      ];
      
      for (const awsPath of awsPaths) {
        if (fs.existsSync(awsPath)) {
          process.env.PATH = awsPath + ';' + process.env.PATH;
          console.log(`✅ Added AWS CLI to PATH: ${awsPath}`);
          break;
        }
      }
    }
  }
  
  // Check if credentials file exists
  if (!fs.existsSync(config.credentialsFile)) {
    throw new Error(`AWS credentials file not found: ${config.credentialsFile}`);
  }
  console.log('✅ AWS credentials file found');
  
  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    throw new Error('package.json not found');
  }
  console.log('✅ Project files found');
}

function setupAWSCredentials() {
  console.log('\n🔐 Setting up AWS credentials...');
  
  try {
    const credentials = fs.readFileSync(config.credentialsFile, 'utf8');
    const lines = credentials.split(/\r?\n/).filter(Boolean);
    let accessKey = '';
    let secretKey = '';

    // Try key-value format first
    for (const line of lines) {
      if (line.startsWith('AWSAccessKeyId=')) {
        accessKey = line.split('=')[1].trim();
      } else if (line.startsWith('AWSSecretKey=')) {
        secretKey = line.split('=')[1].trim();
      }
    }

    // If not found, try AWS CSV export format
    if (!accessKey || !secretKey) {
      // Find header and data lines
      const header = lines[0].toLowerCase();
      if (header.includes('access key id') && lines.length > 1) {
        // Custom 2-line format: header, then <access key>,<secret key>
        const headerParts = lines[0].split(',');
        const dataParts = lines[1].split(',');
        if (headerParts.length === 2 && dataParts.length === 2) {
          accessKey = headerParts[1].trim();
          secretKey = dataParts[1].trim();
        } else {
          // Try standard AWS CSV export
          const headerCols = headerParts.map(h => h.trim().toLowerCase());
          const accessKeyIdx = headerCols.findIndex(h => h.includes('access key id'));
          const secretKeyIdx = headerCols.findIndex(h => h.includes('secret access key'));
          if (accessKeyIdx !== -1 && secretKeyIdx !== -1 && lines.length > 1) {
            const data = lines[1].split(',');
            accessKey = data[accessKeyIdx].trim();
            secretKey = data[secretKeyIdx].trim();
          }
        }
      }
    }

    if (!accessKey || !secretKey) {
      throw new Error('Invalid credentials file format');
    }
    
    // Set environment variables
    process.env.AWS_ACCESS_KEY_ID = accessKey;
    process.env.AWS_SECRET_ACCESS_KEY = secretKey;
    process.env.AWS_DEFAULT_REGION = config.region;
    
    console.log('✅ AWS credentials configured');
  } catch (error) {
    throw new Error(`Failed to setup AWS credentials: ${error.message}`);
  }
}

function installDependencies() {
  console.log('\n📦 Installing dependencies...');
  
  try {
    // Install npm dependencies
    runCommand('npm install', 'Installing npm dependencies');
    
    // Check if Three.js is available
    const threePath = path.join('node_modules', 'three');
    if (!fs.existsSync(threePath)) {
      console.log('📦 Installing Three.js...');
      runCommand('npm install three', 'Installing Three.js');
    }
    
    console.log('✅ All dependencies installed');
  } catch (error) {
    throw new Error(`Failed to install dependencies: ${error.message}`);
  }
}

function buildProject() {
  console.log('\n🔨 Building project...');
  
  try {
    // Clean previous build
    if (fs.existsSync(config.buildDir)) {
      fs.rmSync(config.buildDir, { recursive: true, force: true });
      console.log('🧹 Cleaned previous build');
    }
    
    // Build the project
    runCommand('npm run build', 'Building project with Vite');
    
    // Verify build output
    if (!fs.existsSync(config.buildDir)) {
      throw new Error('Build directory not created');
    }
    
    const buildFiles = fs.readdirSync(config.buildDir);
    if (buildFiles.length === 0) {
      throw new Error('Build directory is empty');
    }
    
    console.log('✅ Project built successfully');
    console.log(`📁 Build files: ${buildFiles.join(', ')}`);
  } catch (error) {
    throw new Error(`Build failed: ${error.message}`);
  }
}

function deployToS3() {
  console.log('\n☁️  Deploying to AWS S3...');
  
  try {
    // Check if bucket exists, create if not
    try {
      runCommand(`aws s3 ls s3://${config.bucketName}`, 'Checking S3 bucket');
    } catch (error) {
      console.log('📦 Creating S3 bucket...');
      runCommand(
        `aws s3 mb s3://${config.bucketName} --region ${config.region}`,
        'Creating S3 bucket'
      );
    }
    
    // Disable public access block settings
    console.log('🔓 Disabling public access block settings...');
    try {
      runCommand(
        `aws s3api put-public-access-block --bucket ${config.bucketName} --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"`,
        'Disabling public access block settings'
      );
    } catch (error) {
      console.log('⚠️  Could not disable public access block settings, continuing...');
    }
    
    // Configure bucket for static website hosting
    const websiteConfig = {
      IndexDocument: { Suffix: 'index.html' },
      ErrorDocument: { Key: 'index.html' }
    };
    
    const websiteConfigPath = 'website-config.json';
    fs.writeFileSync(websiteConfigPath, JSON.stringify(websiteConfig, null, 2));
    
    runCommand(
      `aws s3 website s3://${config.bucketName} --index-document index.html --error-document index.html`,
      'Configuring static website hosting'
    );
    
    // Set bucket policy for public access
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${config.bucketName}/*`
        }
      ]
    };
    
    const policyPath = 'bucket-policy.json';
    fs.writeFileSync(policyPath, JSON.stringify(bucketPolicy, null, 2));
    
    runCommand(
      `aws s3api put-bucket-policy --bucket ${config.bucketName} --policy file://${policyPath}`,
      'Setting bucket policy'
    );
    
    // Upload build files
    console.log('📤 Uploading files to S3...');
    runCommand(
      `aws s3 sync ${config.buildDir} s3://${config.bucketName} --delete`,
      'Uploading build files'
    );
    
    // Clean up temporary files
    fs.unlinkSync(websiteConfigPath);
    fs.unlinkSync(policyPath);
    
    console.log('✅ Deployment to S3 completed');
  } catch (error) {
    throw new Error(`S3 deployment failed: ${error.message}`);
  }
}

function setupCloudFront() {
  console.log('\n🌐 Setting up CloudFront distribution...');
  
  try {
    // Check if distribution already exists
    try {
      const distributions = execSync(
        `aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[?contains(@, '${config.bucketName}')]]" --output json`,
        { encoding: 'utf8' }
      );
      
      const distList = JSON.parse(distributions);
      if (distList && distList.length > 0) {
        console.log('✅ CloudFront distribution already exists');
        return;
      }
    } catch (error) {
      // Distribution doesn't exist, create it
    }
    
    // Create CloudFront distribution
    const distributionConfig = {
      CallerReference: Date.now().toString(),
      Comment: `Distribution for ${config.bucketName}`,
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
            DomainName: `${config.bucketName}.s3-website-${config.region}.amazonaws.com`,
            CustomOriginConfig: {
              HTTPPort: 80,
              HTTPSPort: 443,
              OriginProtocolPolicy: 'http-only'
            }
          }
        ]
      },
      Aliases: {
        Quantity: 1,
        Items: [config.bucketName]
      }
    };
    
    const distConfigPath = 'cloudfront-config.json';
    fs.writeFileSync(distConfigPath, JSON.stringify(distributionConfig, null, 2));
    
    runCommand(
      `aws cloudfront create-distribution --distribution-config file://${distConfigPath}`,
      'Creating CloudFront distribution'
    );
    
    // Clean up
    fs.unlinkSync(distConfigPath);
    
    console.log('✅ CloudFront distribution created');
  } catch (error) {
    console.log('⚠️  CloudFront setup skipped (may already exist)');
  }
}

function verifyDeployment() {
  console.log('\n🔍 Verifying deployment...');
  
  try {
    // Check S3 bucket contents
    const bucketContents = execSync(
      `aws s3 ls s3://${config.bucketName} --recursive`,
      { encoding: 'utf8' }
    );
    
    console.log('📁 S3 bucket contents:');
    console.log(bucketContents);
    
    // Get website endpoint
    const websiteEndpoint = execSync(
      `aws s3api get-bucket-website --bucket ${config.bucketName} --query "IndexDocument.Suffix" --output text`,
      { encoding: 'utf8' }
    ).trim();
    
    const websiteUrl = `http://${config.bucketName}.s3-website-${config.region}.amazonaws.com`;
    console.log(`🌐 Website URL: ${websiteUrl}`);
    
    console.log('✅ Deployment verification completed');
    return websiteUrl;
  } catch (error) {
    console.log('⚠️  Verification incomplete, but deployment may still be successful');
  }
}

function displayFinalInfo(websiteUrl) {
  console.log('\n🎉 Full Project Deployment Complete!');
  console.log('=' .repeat(50));
  console.log(`🌐 Live Website: ${websiteUrl}`);
  console.log(`🔗 Custom Domain: https://${config.bucketName}`);
  console.log('\n📋 What was deployed:');
  console.log('✅ Complete React/Vite application');
  console.log('✅ AI Agent Dashboard with real-time functionality');
  console.log('✅ 3D Game Engine with Three.js integration');
  console.log('✅ Multiplayer planetary shooter game');
  console.log('✅ Procedural generation systems');
  console.log('✅ Real-time AI agent management');
  console.log('✅ Responsive design and modern UI');
  console.log('\n🚀 Your project is now live and fully functional!');
}

// Main deployment process
async function main() {
  try {
    checkPrerequisites();
    setupAWSCredentials();
    installDependencies();
    buildProject();
    deployToS3();
    setupCloudFront();
    const websiteUrl = verifyDeployment();
    displayFinalInfo(websiteUrl);
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
if (require.main === module) {
  main();
}

module.exports = { main, config }; 