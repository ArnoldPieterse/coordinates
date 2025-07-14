/**
 * Complete Infrastructure Setup for rekursing.com
 * Enables static hosting, sets policies, and configures everything
 * IDX-COMPLETE-SETUP-001
 */

import { S3Client, PutBucketWebsiteCommand, PutBucketPolicyCommand, GetBucketWebsiteCommand, GetBucketPolicyCommand } from '@aws-sdk/client-s3';
import { ACMClient, RequestCertificateCommand, ListCertificatesCommand, DescribeCertificateCommand } from '@aws-sdk/client-acm';
import { CloudFrontClient, CreateDistributionCommand, ListDistributionsCommand, GetDistributionCommand } from '@aws-sdk/client-cloudfront';
import { Route53Client, ListHostedZonesCommand, ChangeResourceRecordSetsCommand } from '@aws-sdk/client-route-53';
import fs from 'fs';

const DOMAIN = 'www.rekursing.com';
const ROOT_DOMAIN = 'rekursing.com';
const REGION = 'ap-southeast-2'; // Your bucket region
const ACM_REGION = 'us-east-1'; // ACM must be in us-east-1 for CloudFront

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
    return true;
  } catch (error) {
    console.error('❌ Failed to read AWS credentials:', error.message);
    return false;
  }
}

async function enableStaticWebsiteHosting() {
  console.log('\n🌐 Step 1: Enabling static website hosting...');
  
  const s3 = new S3Client({ 
    region: REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
  try {
    await s3.send(new PutBucketWebsiteCommand({
      Bucket: DOMAIN,
      WebsiteConfiguration: {
        IndexDocument: { Suffix: 'index.html' },
        ErrorDocument: { Key: 'index.html' }
      }
    }));
    
    console.log('✅ Static website hosting enabled');
    
    // Get the website URL
    const websiteConfig = await s3.send(new GetBucketWebsiteCommand({ Bucket: DOMAIN }));
    const websiteUrl = `http://${DOMAIN}.s3-website-${REGION}.amazonaws.com`;
    console.log(`🌐 Website URL: ${websiteUrl}`);
    
    return websiteUrl;
  } catch (error) {
    console.error(`❌ Failed to enable static hosting: ${error.message}`);
    return null;
  }
}

async function setBucketPolicy() {
  console.log('\n🔒 Step 2: Setting bucket policy for public access...');
  
  const s3 = new S3Client({ 
    region: REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
  try {
    const policy = {
      Version: '2012-10-17',
      Statement: [{
        Sid: 'PublicReadGetObject',
        Effect: 'Allow',
        Principal: '*',
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${DOMAIN}/*`
      }]
    };
    
    await s3.send(new PutBucketPolicyCommand({
      Bucket: DOMAIN,
      Policy: JSON.stringify(policy)
    }));
    
    console.log('✅ Bucket policy set for public access');
    return true;
  } catch (error) {
    console.error(`❌ Failed to set bucket policy: ${error.message}`);
    return false;
  }
}

async function getOrCreateCertificate() {
  console.log('\n🔐 Step 3: Setting up SSL certificate...');
  
  const acm = new ACMClient({ 
    region: ACM_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
  try {
    // Check for existing certificates
    const certs = await acm.send(new ListCertificatesCommand({ 
      CertificateStatuses: ['ISSUED', 'PENDING_VALIDATION'] 
    }));
    
    let cert = certs.CertificateSummaryList.find(c => c.DomainName === DOMAIN);
    
    if (!cert) {
      console.log('📝 Requesting new SSL certificate...');
      const req = await acm.send(new RequestCertificateCommand({
        DomainName: DOMAIN,
        ValidationMethod: 'DNS',
        SubjectAlternativeNames: [DOMAIN, ROOT_DOMAIN]
      }));
      
      cert = { CertificateArn: req.CertificateArn };
      console.log(`✅ Certificate requested: ${req.CertificateArn}`);
      console.log('⚠️  Certificate needs manual validation');
      console.log('   Go to: https://console.aws.amazon.com/acm/home?region=us-east-1');
      console.log('   Find the certificate and add DNS validation records to Route 53');
      
      return null;
    }
    
    console.log(`✅ Found existing certificate: ${cert.CertificateArn}`);
    
    // Check if certificate is ready
    const desc = await acm.send(new DescribeCertificateCommand({ 
      CertificateArn: cert.CertificateArn 
    }));
    
    if (desc.Certificate.Status === 'ISSUED') {
      console.log('✅ SSL certificate is ready');
      return cert.CertificateArn;
    } else {
      console.log(`⏳ Certificate status: ${desc.Certificate.Status}`);
      console.log('⚠️  Certificate needs validation');
      return null;
    }
  } catch (error) {
    console.error(`❌ Certificate error: ${error.message}`);
    return null;
  }
}

async function createCloudFrontDistribution(websiteUrl, certArn) {
  console.log('\n🌐 Step 4: Creating CloudFront distribution...');
  
  const cloudfront = new CloudFrontClient({ 
    region: ACM_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
  try {
    // Check for existing distribution
    const dists = await cloudfront.send(new ListDistributionsCommand({}));
    let dist = dists.DistributionList.Items.find(d => 
      d.Aliases.Items && d.Aliases.Items.includes(DOMAIN)
    );
    
    if (dist) {
      console.log(`✅ CloudFront distribution exists: ${dist.DomainName}`);
      return dist;
    }
    
    console.log('📝 Creating new CloudFront distribution...');
    
    const resp = await cloudfront.send(new CreateDistributionCommand({
      DistributionConfig: {
        CallerReference: `${Date.now()}`,
        Aliases: { Quantity: 1, Items: [DOMAIN] },
        DefaultRootObject: 'index.html',
        Origins: {
          Quantity: 1,
          Items: [{
            Id: 'S3-Website',
            DomainName: websiteUrl.replace('http://', ''),
            CustomOriginConfig: {
              HTTPPort: 80,
              HTTPSPort: 443,
              OriginProtocolPolicy: 'http-only'
            }
          }]
        },
        DefaultCacheBehavior: {
          TargetOriginId: 'S3-Website',
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
          MinTTL: 0,
          DefaultTTL: 86400,
          MaxTTL: 31536000
        },
        ViewerCertificate: certArn ? {
          ACMCertificateArn: certArn,
          SSLSupportMethod: 'sni-only',
          MinimumProtocolVersion: 'TLSv1.2_2021'
        } : {
          CloudFrontDefaultCertificate: true
        },
        Enabled: true,
        PriceClass: 'PriceClass_100' // Use only North America and Europe
      }
    }));
    
    const distId = resp.Distribution.Id;
    let status = resp.Distribution.Status;
    
    console.log(`⏳ CloudFront distribution creating: ${distId}`);
    console.log('⏳ This may take 10-15 minutes...');
    
    while (status !== 'Deployed') {
      const d = await cloudfront.send(new GetDistributionCommand({ Id: distId }));
      status = d.Distribution.Status;
      console.log(`⏳ Status: ${status}`);
      await new Promise(r => setTimeout(r, 30000)); // Wait 30 seconds
    }
    
    console.log(`✅ CloudFront distribution ready: ${resp.Distribution.DomainName}`);
    return resp.Distribution;
  } catch (error) {
    console.error(`❌ CloudFront error: ${error.message}`);
    return null;
  }
}

async function updateRoute53(cfDomain) {
  console.log('\n🌍 Step 5: Updating Route 53 DNS...');
  
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
        Name: DOMAIN,
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
    
    console.log(`✅ Route 53 updated: ${DOMAIN} -> ${cfDomain}`);
    return true;
  } catch (error) {
    console.error(`❌ Route 53 error: ${error.message}`);
    return false;
  }
}

function createFinalGuide(websiteUrl, cfDomain, certArn) {
  console.log('\n🎉 INFRASTRUCTURE SETUP COMPLETE!');
  console.log('==================================');
  console.log('\n🌐 Your site is now accessible at:');
  console.log(`   S3 Website: ${websiteUrl}`);
  if (cfDomain) {
    console.log(`   CloudFront: https://${cfDomain}`);
    console.log(`   Custom Domain: https://${DOMAIN} (once DNS propagates)`);
  }
  
  console.log('\n📋 What was configured:');
  console.log('✅ S3 static website hosting enabled');
  console.log('✅ Bucket policy set for public access');
  if (certArn) {
    console.log('✅ SSL certificate configured');
  } else {
    console.log('⚠️  SSL certificate needs manual validation');
  }
  if (cfDomain) {
    console.log('✅ CloudFront distribution created');
    console.log('✅ Route 53 DNS updated');
  }
  
  console.log('\n📝 Next Steps:');
  if (!certArn) {
    console.log('1. Validate SSL certificate in AWS Console (ACM)');
    console.log('2. Add DNS validation records to Route 53');
  }
  console.log('3. Wait for DNS propagation (may take up to 48 hours)');
  console.log('4. Test your site at all URLs above');
  
  console.log('\n🔧 Manual Configuration (if needed):');
  console.log('- S3 Console: https://console.aws.amazon.com/s3/buckets');
  console.log('- CloudFront Console: https://console.aws.amazon.com/cloudfront/');
  console.log('- Route 53 Console: https://console.aws.amazon.com/route53/');
  console.log('- ACM Console: https://console.aws.amazon.com/acm/home?region=us-east-1');
}

async function main() {
  console.log('🚀 Complete Infrastructure Setup for rekursing.com');
  console.log('=================================================\n');
  
  // Step 1: Read AWS credentials
  if (!readAWSCredentials()) {
    console.log('❌ Cannot proceed without AWS credentials');
    return;
  }
  
  // Step 2: Enable static website hosting
  const websiteUrl = await enableStaticWebsiteHosting();
  if (!websiteUrl) {
    console.log('❌ Cannot proceed without static website hosting');
    return;
  }
  
  // Step 3: Set bucket policy
  await setBucketPolicy();
  
  // Step 4: Get or create SSL certificate
  const certArn = await getOrCreateCertificate();
  
  // Step 5: Create CloudFront distribution
  let cfDomain = null;
  if (certArn) {
    const cf = await createCloudFrontDistribution(websiteUrl, certArn);
    if (cf) {
      cfDomain = cf.DomainName;
      
      // Step 6: Update Route 53
      await updateRoute53(cfDomain);
    }
  } else {
    console.log('⚠️  Skipping CloudFront setup - certificate not ready');
  }
  
  // Step 7: Create final guide
  createFinalGuide(websiteUrl, cfDomain, certArn);
}

// Run the setup
main().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
}); 