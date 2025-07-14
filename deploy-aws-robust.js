/**
 * Robust AWS Deployment with Self-Healing for rekursing.com
 * Handles AWS CLI path issues, credentials, and full deployment
 * IDX-AWS-ROBUST-001
 */

import { S3Client, CreateBucketCommand, PutBucketWebsiteCommand, PutBucketPolicyCommand, PutObjectCommand, ListBucketsCommand } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateDistributionCommand, GetDistributionCommand, ListDistributionsCommand } from '@aws-sdk/client-cloudfront';
import { ACMClient, RequestCertificateCommand, DescribeCertificateCommand, ListCertificatesCommand } from '@aws-sdk/client-acm';
import { Route53Client, ChangeResourceRecordSetsCommand, ListHostedZonesCommand } from '@aws-sdk/client-route-53';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import readline from 'readline';

const DOMAIN = 'www.rekursing.com';
const ROOT_DOMAIN = 'rekursing.com';
const REGION = 'us-east-1';
const BUILD_DIR = 'dist';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function checkAndFixAWSCLI() {
  console.log('🔧 Step 1: Checking AWS CLI...');
  
  try {
    execSync('aws --version', { stdio: 'pipe' });
    console.log('✅ AWS CLI is available');
    return true;
  } catch (error) {
    console.log('❌ AWS CLI not found. Attempting to fix...');
    
    // Try to add to PATH for current session
    const awsPath = 'C:\\Program Files\\Amazon\\AWSCLIV2\\';
    process.env.PATH += `;${awsPath}`;
    
    try {
      execSync('aws --version', { stdio: 'pipe' });
      console.log('✅ AWS CLI found after PATH fix');
      return true;
    } catch (pathError) {
      console.log('⚠️  AWS CLI still not accessible');
      console.log('Please ensure AWS CLI is installed and restart your terminal');
      console.log('Download from: https://aws.amazon.com/cli/');
      return false;
    }
  }
}

async function checkAndConfigureAWSCredentials() {
  console.log('\n🔧 Step 2: Checking AWS Credentials...');
  
  try {
    const sts = new STSClient({ region: REGION });
    await sts.send(new GetCallerIdentityCommand({}));
    console.log('✅ AWS credentials are configured');
    return true;
  } catch (error) {
    console.log('❌ AWS credentials not configured. Setting up...');
    return await configureAWSCredentials();
  }
}

async function configureAWSCredentials() {
  console.log('\n🔧 AWS Credentials Setup');
  console.log('You need AWS Access Key ID and Secret Access Key');
  console.log('Get them from: https://console.aws.amazon.com/iam/home#/security_credentials');
  
  const accessKey = await question('Enter AWS Access Key ID: ');
  const secretKey = await question('Enter AWS Secret Access Key: ');
  const region = await question('Enter AWS Region (default: us-east-1): ') || 'us-east-1';
  
  try {
    execSync(`aws configure set aws_access_key_id ${accessKey}`, { stdio: 'pipe' });
    execSync(`aws configure set aws_secret_access_key ${secretKey}`, { stdio: 'pipe' });
    execSync(`aws configure set region ${region}`, { stdio: 'pipe' });
    execSync(`aws configure set output json`, { stdio: 'pipe' });
    
    console.log('✅ AWS credentials configured');
    return true;
  } catch (error) {
    console.error('❌ Failed to configure AWS credentials');
    return false;
  }
}

async function buildSite() {
  console.log('\n🔨 Step 3: Building site...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Site built successfully');
    return true;
  } catch (error) {
    console.error('❌ Build failed');
    return false;
  }
}

async function ensureS3Bucket(bucketName) {
  console.log(`\n📦 Step 4: Setting up S3 bucket (${bucketName})...`);
  const s3 = new S3Client({ region: REGION });
  try {
    const buckets = await s3.send(new ListBucketsCommand({}));
    if (!buckets.Buckets.find(b => b.Name === bucketName)) {
      await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
      console.log(`✅ Created S3 bucket: ${bucketName}`);
    } else {
      console.log(`✅ S3 bucket exists: ${bucketName}`);
    }
    return true;
  } catch (error) {
    console.error(`❌ Failed to create S3 bucket: ${error.message}`);
    return false;
  }
}

async function enableS3StaticHosting(bucketName) {
  console.log(`\n🌐 Step 5: Enabling static website hosting...`);
  const s3 = new S3Client({ region: REGION });
  try {
    await s3.send(new PutBucketWebsiteCommand({
      Bucket: bucketName,
      WebsiteConfiguration: {
        IndexDocument: { Suffix: 'index.html' },
        ErrorDocument: { Key: 'index.html' }
      }
    }));
    
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
    
    await s3.send(new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(policy)
    }));
    
    console.log(`✅ Enabled static website hosting for: ${bucketName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to enable static hosting: ${error.message}`);
    return false;
  }
}

async function uploadToS3(bucketName) {
  console.log('\n📤 Step 6: Uploading files to S3...');
  const s3 = new S3Client({ region: REGION });
  try {
    function uploadDirectory(dirPath, prefix = '') {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          uploadDirectory(filePath, prefix ? `${prefix}/${file}` : file);
        } else {
          const key = prefix ? `${prefix}/${file}` : file;
          const contentType = getContentType(filePath);
          
          s3.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: fs.readFileSync(filePath),
            ContentType: contentType,
            ACL: 'public-read'
          })).then(() => {
            console.log(`  📁 Uploaded: ${key}`);
          }).catch(error => {
            console.error(`  ❌ Failed to upload ${key}: ${error.message}`);
          });
        }
      }
    }
    
    uploadDirectory(BUILD_DIR);
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

async function getOrRequestCertificate(domain) {
  console.log('\n🔐 Step 7: Setting up SSL certificate...');
  const acm = new ACMClient({ region: REGION });
  try {
    const certs = await acm.send(new ListCertificatesCommand({ 
      CertificateStatuses: ['ISSUED', 'PENDING_VALIDATION'] 
    }));
    
    let cert = certs.CertificateSummaryList.find(c => c.DomainName === domain);
    
    if (!cert) {
      console.log('📝 Requesting new SSL certificate...');
      const req = await acm.send(new RequestCertificateCommand({
        DomainName: domain,
        ValidationMethod: 'DNS',
        SubjectAlternativeNames: [domain, ROOT_DOMAIN]
      }));
      
      cert = { CertificateArn: req.CertificateArn };
      console.log(`✅ Certificate requested: ${req.CertificateArn}`);
      console.log('⚠️  You need to validate the certificate in AWS Console (ACM)');
      console.log('   Go to: https://console.aws.amazon.com/acm/home');
      console.log('   Find the certificate and add the DNS validation records to Route 53');
      
      return null;
    }
    
    let status = cert.Status;
    while (status === 'PENDING_VALIDATION') {
      const desc = await acm.send(new DescribeCertificateCommand({ 
        CertificateArn: cert.CertificateArn 
      }));
      status = desc.Certificate.Status;
      
      if (status === 'ISSUED') {
        console.log('✅ SSL certificate is ready');
        break;
      }
      
      console.log('⏳ Waiting for certificate validation...');
      await new Promise(r => setTimeout(r, 15000));
    }
    
    return cert.CertificateArn;
  } catch (error) {
    console.error(`❌ Certificate error: ${error.message}`);
    return null;
  }
}

async function createCloudFrontDistribution(bucketName, certArn) {
  console.log('\n🌐 Step 8: Creating CloudFront distribution...');
  const cloudfront = new CloudFrontClient({ region: REGION });
  try {
    const dists = await cloudfront.send(new ListDistributionsCommand({}));
    let dist = dists.DistributionList.Items.find(d => 
      d.Aliases.Items && d.Aliases.Items.includes(DOMAIN)
    );
    
    if (dist) {
      console.log(`✅ CloudFront distribution exists: ${dist.DomainName}`);
      return dist;
    }
    
    const resp = await cloudfront.send(new CreateDistributionCommand({
      DistributionConfig: {
        CallerReference: `${Date.now()}`,
        Aliases: { Quantity: 1, Items: [DOMAIN] },
        DefaultRootObject: 'index.html',
        Origins: {
          Quantity: 1,
          Items: [{
            Id: bucketName,
            DomainName: `${bucketName}.s3.amazonaws.com`,
            S3OriginConfig: { OriginAccessIdentity: '' }
          }]
        },
        DefaultCacheBehavior: {
          TargetOriginId: bucketName,
          ViewerProtocolPolicy: 'redirect-to-https',
          AllowedMethods: { 
            Quantity: 2, 
            Items: ['GET', 'HEAD'], 
            CachedMethods: { Quantity: 2, Items: ['GET', 'HEAD'] } 
          },
          ForwardedValues: { 
            QueryString: false, 
            Cookies: { Forward: 'none' } 
          },
          MinTTL: 0
        },
        ViewerCertificate: {
          ACMCertificateArn: certArn,
          SSLSupportMethod: 'sni-only',
          MinimumProtocolVersion: 'TLSv1.2_2021'
        },
        Enabled: true
      }
    }));
    
    const distId = resp.Distribution.Id;
    let status = resp.Distribution.Status;
    
    while (status !== 'Deployed') {
      const d = await cloudfront.send(new GetDistributionCommand({ Id: distId }));
      status = d.Distribution.Status;
      console.log('⏳ Waiting for CloudFront deployment...');
      await new Promise(r => setTimeout(r, 15000));
    }
    
    console.log(`✅ CloudFront distribution ready: ${resp.Distribution.DomainName}`);
    return resp.Distribution;
  } catch (error) {
    console.error(`❌ CloudFront error: ${error.message}`);
    return null;
  }
}

async function updateRoute53(domain, cfDomain) {
  console.log('\n🌍 Step 9: Updating Route 53 DNS...');
  const route53 = new Route53Client({ region: REGION });
  try {
    const zones = await route53.send(new ListHostedZonesCommand({}));
    const zone = zones.HostedZones.find(z => 
      z.Name === ROOT_DOMAIN + '.' || z.Name === ROOT_DOMAIN
    );
    
    if (!zone) {
      console.error(`❌ Hosted zone not found for ${ROOT_DOMAIN}`);
      console.log('Please create a hosted zone in Route 53 for your domain');
      return false;
    }
    
    const changes = [{
      Action: 'UPSERT',
      ResourceRecordSet: {
        Name: domain,
        Type: 'A',
        AliasTarget: {
          DNSName: cfDomain,
          HostedZoneId: 'Z2FDTNDATAQYW2', // CloudFront hosted zone ID
          EvaluateTargetHealth: false
        }
      }
    }];
    
    await route53.send(new ChangeResourceRecordSetsCommand({
      HostedZoneId: zone.Id,
      ChangeBatch: { Changes: changes }
    }));
    
    console.log(`✅ Route 53 updated: ${domain} -> ${cfDomain}`);
    return true;
  } catch (error) {
    console.error(`❌ Route 53 error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Robust AWS Deployment for rekursing.com');
  console.log('=============================================\n');
  
  // Step 1: Check and fix AWS CLI
  if (!await checkAndFixAWSCLI()) {
    console.log('❌ Cannot proceed without AWS CLI');
    rl.close();
    return;
  }
  
  // Step 2: Check and configure AWS credentials
  if (!await checkAndConfigureAWSCredentials()) {
    console.log('❌ Cannot proceed without AWS credentials');
    rl.close();
    return;
  }
  
  // Step 3: Build the site
  if (!await buildSite()) {
    console.log('❌ Cannot proceed without successful build');
    rl.close();
    return;
  }
  
  // Step 4: Create and configure S3 bucket
  if (!await ensureS3Bucket(DOMAIN)) {
    console.log('❌ Cannot proceed without S3 bucket');
    rl.close();
    return;
  }
  
  if (!await enableS3StaticHosting(DOMAIN)) {
    console.log('❌ Cannot proceed without static hosting');
    rl.close();
    return;
  }
  
  // Step 5: Upload files
  if (!await uploadToS3(DOMAIN)) {
    console.log('❌ Cannot proceed without file upload');
    rl.close();
    return;
  }
  
  // Step 6: Handle SSL certificate
  const certArn = await getOrRequestCertificate(DOMAIN);
  if (!certArn) {
    console.log('\n⚠️  SSL certificate needs manual validation');
    console.log('Please validate the certificate in AWS Console and run this script again');
    rl.close();
    return;
  }
  
  // Step 7: Create CloudFront distribution
  const cf = await createCloudFrontDistribution(DOMAIN, certArn);
  if (!cf) {
    console.log('❌ Cannot proceed without CloudFront distribution');
    rl.close();
    return;
  }
  
  // Step 8: Update DNS
  if (!await updateRoute53(DOMAIN, cf.DomainName)) {
    console.log('❌ Cannot proceed without DNS update');
    rl.close();
    return;
  }
  
  console.log('\n🎉 Deployment Complete!');
  console.log(`🌐 Your site is live at: https://${DOMAIN}`);
  console.log('⏳ DNS propagation may take a few minutes');
  console.log('🔒 SSL certificate is active');
  console.log('\n📊 CloudFront Distribution:');
  console.log(`   Domain: ${cf.DomainName}`);
  console.log(`   Status: ${cf.Status}`);
  
  rl.close();
}

// Run the deployment
main().catch(error => {
  console.error('❌ Deployment failed:', error);
  rl.close();
  process.exit(1);
}); 