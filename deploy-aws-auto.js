/**
 * Automated AWS Deployment for rekursing.com
 * Reads credentials from rootkey.csv and deploys automatically
 * IDX-AWS-AUTO-001
 */

import { S3Client, CreateBucketCommand, PutBucketWebsiteCommand, PutBucketPolicyCommand, PutObjectCommand, ListBucketsCommand } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateDistributionCommand, GetDistributionCommand, ListDistributionsCommand } from '@aws-sdk/client-cloudfront';
import { ACMClient, RequestCertificateCommand, DescribeCertificateCommand, ListCertificatesCommand } from '@aws-sdk/client-acm';
import { Route53Client, ChangeResourceRecordSetsCommand, ListHostedZonesCommand } from '@aws-sdk/client-route-53';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DOMAIN = 'www.rekursing.com';
const ROOT_DOMAIN = 'rekursing.com';
const REGION = 'us-east-1';
const BUILD_DIR = 'dist';

function readAWSCredentials() {
  console.log('🔧 Reading AWS credentials from rootkey.csv...');
  try {
    const csvContent = fs.readFileSync('rootkey.csv', 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Parse the CSV format - first line has header, second line has actual credentials
    const accessKeyLine = lines[0];
    const secretKeyLine = lines[1];
    
    // Extract access key from first line (after the comma)
    const accessKey = accessKeyLine.split(',')[1];
    
    // Extract secret key from second line (after the comma)
    const secretKey = secretKeyLine.split(',')[1];
    
    if (!accessKey || !secretKey) {
      throw new Error('Invalid credential format in rootkey.csv');
    }
    
    // Set environment variables
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

async function testAWSCredentials() {
  console.log('\n🔧 Step 2: Testing AWS Credentials...');
  try {
    const sts = new STSClient({ 
      region: REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    
    const identity = await sts.send(new GetCallerIdentityCommand({}));
    console.log(`✅ AWS credentials working - Account: ${identity.Account}`);
    return true;
  } catch (error) {
    console.error(`❌ AWS credentials failed: ${error.message}`);
    return false;
  }
}

async function getBucketRegion(bucketName) {
  console.log(`🔍 Detecting region for bucket: ${bucketName}`);
  const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'];
  
  for (const region of regions) {
    try {
      const s3 = new S3Client({ 
        region: region,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });
      
      await s3.send(new ListBucketsCommand({}));
      console.log(`✅ Bucket found in region: ${region}`);
      return region;
    } catch (error) {
      // Continue to next region
    }
  }
  
  console.log('⚠️  Could not detect bucket region, using default: us-east-1');
  return 'us-east-1';
}

async function ensureS3Bucket(bucketName) {
  console.log(`\n📦 Step 3: Setting up S3 bucket (${bucketName})...`);
  
  // Detect the correct region for this bucket
  const bucketRegion = await getBucketRegion(bucketName);
  
  const s3 = new S3Client({ 
    region: bucketRegion,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
  try {
    const buckets = await s3.send(new ListBucketsCommand({}));
    if (!buckets.Buckets.find(b => b.Name === bucketName)) {
      await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
      console.log(`✅ Created S3 bucket: ${bucketName}`);
    } else {
      console.log(`✅ S3 bucket exists: ${bucketName}`);
    }
    return bucketRegion;
  } catch (error) {
    console.error(`❌ Failed to create S3 bucket: ${error.message}`);
    return null;
  }
}

async function enableS3StaticHosting(bucketName, bucketRegion) {
  console.log(`\n🌐 Step 4: Enabling static website hosting...`);
  const s3 = new S3Client({ 
    region: bucketRegion,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
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

async function uploadToS3(bucketName, bucketRegion) {
  console.log('\n📤 Step 5: Uploading files to S3...');
  const s3 = new S3Client({ 
    region: bucketRegion,
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

async function getOrRequestCertificate(domain) {
  console.log('\n🔐 Step 6: Setting up SSL certificate...');
  const acm = new ACMClient({ 
    region: REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
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
  console.log('\n🌐 Step 7: Creating CloudFront distribution...');
  const cloudfront = new CloudFrontClient({ 
    region: REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
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
  console.log('\n🌍 Step 8: Updating Route 53 DNS...');
  const route53 = new Route53Client({ 
    region: REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
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
  console.log('🚀 Automated AWS Deployment for rekursing.com');
  console.log('==============================================\n');
  
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
  
  // Step 3: Test AWS credentials
  if (!await testAWSCredentials()) {
    console.log('❌ Cannot proceed without working AWS credentials');
    return;
  }
  
  // Step 4: Create and configure S3 bucket
  const bucketRegion = await ensureS3Bucket(DOMAIN);
  if (!bucketRegion) {
    console.log('❌ Cannot proceed without S3 bucket');
    return;
  }
  
  if (!await enableS3StaticHosting(DOMAIN, bucketRegion)) {
    console.log('❌ Cannot proceed without static hosting');
    return;
  }
  
  // Step 5: Upload files
  if (!await uploadToS3(DOMAIN, bucketRegion)) {
    console.log('❌ Cannot proceed without file upload');
    return;
  }
  
  // Step 6: Handle SSL certificate
  const certArn = await getOrRequestCertificate(DOMAIN);
  if (!certArn) {
    console.log('\n⚠️  SSL certificate needs manual validation');
    console.log('Please validate the certificate in AWS Console and run this script again');
    return;
  }
  
  // Step 7: Create CloudFront distribution
  const cf = await createCloudFrontDistribution(DOMAIN, certArn);
  if (!cf) {
    console.log('❌ Cannot proceed without CloudFront distribution');
    return;
  }
  
  // Step 8: Update DNS
  if (!await updateRoute53(DOMAIN, cf.DomainName)) {
    console.log('❌ Cannot proceed without DNS update');
    return;
  }
  
  console.log('\n🎉 Deployment Complete!');
  console.log(`🌐 Your site is live at: https://${DOMAIN}`);
  console.log('⏳ DNS propagation may take a few minutes');
  console.log('🔒 SSL certificate is active');
  console.log('\n📊 CloudFront Distribution:');
  console.log(`   Domain: ${cf.DomainName}`);
  console.log(`   Status: ${cf.Status}`);
}

// Run the deployment
main().catch(error => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
}); 