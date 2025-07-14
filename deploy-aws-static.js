/**
 * Automated AWS Static Site Deployment for rekursing.com
 * - S3 bucket creation and static hosting
 * - Upload build to S3
 * - CloudFront distribution with SSL
 * - Route 53 DNS setup
 * IDX-AWS-STATIC-001
 */

import { S3Client, CreateBucketCommand, PutBucketWebsiteCommand, PutBucketPolicyCommand, PutObjectCommand, ListBucketsCommand } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateDistributionCommand, GetDistributionCommand, ListDistributionsCommand } from '@aws-sdk/client-cloudfront';
import { ACMClient, RequestCertificateCommand, DescribeCertificateCommand, ListCertificatesCommand } from '@aws-sdk/client-acm';
import { Route53Client, ChangeResourceRecordSetsCommand, ListHostedZonesCommand } from '@aws-sdk/client-route-53';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

const DOMAIN = 'www.rekursing.com';
const ROOT_DOMAIN = 'rekursing.com';
const REGION = 'us-east-1'; // Required for CloudFront/ACM
const BUILD_DIR = 'dist';

const s3 = new S3Client({ region: REGION });
const cloudfront = new CloudFrontClient({ region: REGION });
const acm = new ACMClient({ region: REGION });
const route53 = new Route53Client({ region: REGION });

async function ensureS3Bucket(bucketName) {
  const buckets = await s3.send(new ListBucketsCommand({}));
  if (!buckets.Buckets.find(b => b.Name === bucketName)) {
    await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
    console.log(`Created S3 bucket: ${bucketName}`);
  } else {
    console.log(`S3 bucket exists: ${bucketName}`);
  }
}

async function enableS3StaticHosting(bucketName) {
  await s3.send(new PutBucketWebsiteCommand({
    Bucket: bucketName,
    WebsiteConfiguration: {
      IndexDocument: { Suffix: 'index.html' },
      ErrorDocument: { Key: 'index.html' }
    }
  }));
  // Public read policy
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
  console.log(`Enabled static website hosting for: ${bucketName}`);
}

async function uploadDirToS3(localDir, bucketName) {
  const files = fs.readdirSync(localDir);
  for (const file of files) {
    const filePath = path.join(localDir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      await uploadDirToS3(filePath, bucketName);
    } else {
      const key = path.relative(BUILD_DIR, filePath).replace(/\\/g, '/');
      const contentType = mime.lookup(filePath) || 'application/octet-stream';
      await s3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fs.readFileSync(filePath),
        ContentType: contentType,
        ACL: 'public-read'
      }));
      console.log(`Uploaded: ${key}`);
    }
  }
}

async function getOrRequestCertificate(domain) {
  // Check for existing issued cert
  const certs = await acm.send(new ListCertificatesCommand({ CertificateStatuses: ['ISSUED', 'PENDING_VALIDATION'] }));
  let cert = certs.CertificateSummaryList.find(c => c.DomainName === domain);
  if (!cert) {
    const req = await acm.send(new RequestCertificateCommand({
      DomainName: domain,
      ValidationMethod: 'DNS',
      SubjectAlternativeNames: [domain, ROOT_DOMAIN]
    }));
    cert = { CertificateArn: req.CertificateArn };
    console.log(`Requested new ACM certificate for ${domain}. Please validate DNS in AWS Console.`);
    process.exit(1);
  }
  // Wait for validation
  let status = 'PENDING_VALIDATION';
  while (status !== 'ISSUED') {
    const desc = await acm.send(new DescribeCertificateCommand({ CertificateArn: cert.CertificateArn }));
    status = desc.Certificate.Status;
    if (status === 'ISSUED') break;
    console.log('Waiting for ACM certificate validation...');
    await new Promise(r => setTimeout(r, 15000));
  }
  console.log(`ACM certificate ready: ${cert.CertificateArn}`);
  return cert.CertificateArn;
}

async function getOrCreateCloudFront(s3Bucket, certArn) {
  // Check for existing distribution
  const dists = await cloudfront.send(new ListDistributionsCommand({}));
  let dist = dists.DistributionList.Items.find(d => d.Aliases.Items.includes(DOMAIN));
  if (dist) {
    console.log(`CloudFront distribution exists: ${dist.DomainName}`);
    return dist;
  }
  // Create new distribution
  const resp = await cloudfront.send(new CreateDistributionCommand({
    DistributionConfig: {
      CallerReference: `${Date.now()}`,
      Aliases: { Quantity: 1, Items: [DOMAIN] },
      DefaultRootObject: 'index.html',
      Origins: {
        Quantity: 1,
        Items: [{
          Id: s3Bucket,
          DomainName: `${s3Bucket}.s3.amazonaws.com`,
          S3OriginConfig: { OriginAccessIdentity: '' }
        }]
      },
      DefaultCacheBehavior: {
        TargetOriginId: s3Bucket,
        ViewerProtocolPolicy: 'redirect-to-https',
        AllowedMethods: { Quantity: 2, Items: ['GET', 'HEAD'], CachedMethods: { Quantity: 2, Items: ['GET', 'HEAD'] } },
        ForwardedValues: { QueryString: false, Cookies: { Forward: 'none' } },
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
    console.log('Waiting for CloudFront deployment...');
    await new Promise(r => setTimeout(r, 15000));
  }
  console.log(`CloudFront distribution ready: ${resp.Distribution.DomainName}`);
  return resp.Distribution;
}

async function getHostedZoneId(domain) {
  const zones = await route53.send(new ListHostedZonesCommand({}));
  const zone = zones.HostedZones.find(z => z.Name === domain + '.' || z.Name === domain);
  if (!zone) throw new Error(`Hosted zone not found for ${domain}`);
  return zone.Id;
}

async function updateRoute53(domain, cfDomain) {
  const zoneId = await getHostedZoneId(ROOT_DOMAIN);
  const changes = [{
    Action: 'UPSERT',
    ResourceRecordSet: {
      Name: domain,
      Type: 'A',
      AliasTarget: {
        DNSName: cfDomain,
        HostedZoneId: 'Z2FDTNDATAQYW2', // CloudFront hosted zone ID (global)
        EvaluateTargetHealth: false
      }
    }
  }];
  await route53.send(new ChangeResourceRecordSetsCommand({
    HostedZoneId: zoneId,
    ChangeBatch: { Changes: changes }
  }));
  console.log(`Route 53 updated: ${domain} -> ${cfDomain}`);
}

async function main() {
  console.log('=== AWS Static Site Deployment for rekursing.com ===');
  // 1. Build
  console.log('Building site...');
  await new Promise((resolve, reject) => {
    const proc = require('child_process').spawn('npm', ['run', 'build'], { stdio: 'inherit' });
    proc.on('close', code => code === 0 ? resolve() : reject(new Error('Build failed')));
  });
  // 2. S3
  await ensureS3Bucket(DOMAIN);
  await enableS3StaticHosting(DOMAIN);
  await uploadDirToS3(BUILD_DIR, DOMAIN);
  // 3. ACM
  const certArn = await getOrRequestCertificate(DOMAIN);
  // 4. CloudFront
  const cf = await getOrCreateCloudFront(DOMAIN, certArn);
  // 5. Route 53
  await updateRoute53(DOMAIN, cf.DomainName);
  console.log('=== Deployment complete! ===');
  console.log(`Visit: https://${DOMAIN}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(e => { console.error(e); process.exit(1); });
} 