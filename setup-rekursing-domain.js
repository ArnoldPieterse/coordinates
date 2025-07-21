#!/usr/bin/env node

/**
 * Automated Domain Setup Script for rekursing.com
 * Sets up CloudFront distribution, SSL certificate, and DNS configuration
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class DomainSetup {
  constructor() {
    this.domain = 'rekursing.com';
    this.bucketName = 'rekursing.com';
    this.region = 'us-east-1'; // CloudFront requires us-east-1 for certificates
  }

  async run() {
    console.log('🚀 Starting automated domain setup for rekursing.com...\n');

    try {
      // Step 1: Check current status
      await this.checkCurrentStatus();

      // Step 2: Create SSL certificate
      const certArn = await this.createSSLCertificate();

      // Step 3: Wait for certificate validation
      await this.waitForCertificateValidation(certArn);

      // Step 4: Create CloudFront distribution
      const distributionId = await this.createCloudFrontDistribution(certArn);

      // Step 5: Get distribution domain
      const distributionDomain = await this.getDistributionDomain(distributionId);

      // Step 6: Generate DNS configuration
      await this.generateDNSConfig(distributionDomain);

      // Step 7: Test the setup
      await this.testSetup(distributionDomain);

      console.log('\n✅ Domain setup completed successfully!');
      console.log(`🌐 Your site will be available at: https://${this.domain}`);
      console.log(`📊 CloudFront Distribution ID: ${distributionId}`);
      console.log(`🔒 SSL Certificate ARN: ${certArn}`);

    } catch (error) {
      console.error('❌ Domain setup failed:', error.message);
      process.exit(1);
    }
  }

  async checkCurrentStatus() {
    console.log('📋 Checking current setup status...');

    // Check S3 bucket
    try {
      const bucketConfig = execSync(`aws s3api get-bucket-website --bucket ${this.bucketName}`, { encoding: 'utf8' });
      console.log('✅ S3 bucket is configured as a website');
    } catch (error) {
      console.error('❌ S3 bucket not properly configured');
      throw new Error('S3 bucket must be configured as a website first');
    }

    // Check for existing CloudFront distributions
    try {
      const distributions = execSync('aws cloudfront list-distributions --output json', { encoding: 'utf8' });
      const distList = JSON.parse(distributions);
      
      if (distList.DistributionList.Items.length > 0) {
        console.log('⚠️  Existing CloudFront distributions found');
        distList.DistributionList.Items.forEach(dist => {
          console.log(`   - ${dist.Id}: ${dist.DomainName}`);
        });
      } else {
        console.log('✅ No existing CloudFront distributions');
      }
    } catch (error) {
      console.log('✅ No CloudFront distributions found');
    }
  }

  async createSSLCertificate() {
    console.log('\n📜 Creating SSL certificate...');

    try {
      // Check if certificate already exists
      const existingCerts = execSync(`aws acm list-certificates --region ${this.region} --output json`, { encoding: 'utf8' });
      const certs = JSON.parse(existingCerts);
      
      const existingCert = certs.CertificateSummaryList.find(cert => 
        cert.DomainName === this.domain || 
        (cert.SubjectAlternativeNames && cert.SubjectAlternativeNames.includes(this.domain))
      );

      if (existingCert) {
        console.log(`✅ Found existing certificate: ${existingCert.CertificateArn}`);
        return existingCert.CertificateArn;
      }

      // Create new certificate
      const certResponse = execSync(
        `aws acm request-certificate --domain-name ${this.domain} --subject-alternative-names "*.${this.domain}" --validation-method DNS --region ${this.region} --output json`,
        { encoding: 'utf8' }
      );

      const cert = JSON.parse(certResponse);
      console.log(`✅ Certificate created: ${cert.CertificateArn}`);
      
      return cert.CertificateArn;

    } catch (error) {
      console.error('❌ Failed to create SSL certificate:', error.message);
      throw error;
    }
  }

  async waitForCertificateValidation(certArn) {
    console.log('\n⏳ Waiting for certificate validation...');

    try {
      // Get validation records
      const certDetails = execSync(`aws acm describe-certificate --certificate-arn ${certArn} --region ${this.region} --output json`, { encoding: 'utf8' });
      const cert = JSON.parse(certDetails);

      const validationOption = cert.Certificate.DomainValidationOptions.find(opt => opt.DomainName === this.domain);
      
      if (validationOption && validationOption.ResourceRecord) {
        console.log('📝 DNS validation records needed:');
        console.log(`   Name: ${validationOption.ResourceRecord.Name}`);
        console.log(`   Type: ${validationOption.ResourceRecord.Type}`);
        console.log(`   Value: ${validationOption.ResourceRecord.Value}`);
        console.log('\n⚠️  Please add these DNS records to your domain registrar and wait for validation.');
        console.log('   This may take up to 24 hours, but usually completes within 30 minutes.');
      }

      // Wait for validation (with timeout)
      console.log('⏳ Waiting for certificate validation (this may take a while)...');
      
      let attempts = 0;
      const maxAttempts = 60; // 30 minutes with 30-second intervals
      
      while (attempts < maxAttempts) {
        try {
          execSync(`aws acm wait certificate-validated --certificate-arn ${certArn} --region ${this.region}`, { timeout: 30000 });
          console.log('✅ Certificate validated successfully!');
          return;
        } catch (error) {
          attempts++;
          console.log(`⏳ Still waiting... (attempt ${attempts}/${maxAttempts})`);
          await this.sleep(30000); // Wait 30 seconds
        }
      }

      console.log('⚠️  Certificate validation timeout. Please check DNS records manually.');
      console.log('   You can continue with the setup and validate later.');

    } catch (error) {
      console.error('❌ Certificate validation failed:', error.message);
      throw error;
    }
  }

  async createCloudFrontDistribution(certArn) {
    console.log('\n☁️ Creating CloudFront distribution...');

    try {
      // Create distribution configuration
      const config = {
        CallerReference: `rekursing-distribution-${Date.now()}`,
        Comment: 'Rekursing AI Gaming Platform',
        DefaultRootObject: 'index.html',
        Origins: {
          Quantity: 1,
          Items: [
            {
              Id: `S3-${this.bucketName}`,
              DomainName: `${this.bucketName}.s3-website-${this.region}.amazonaws.com`,
              CustomOriginConfig: {
                HTTPPort: 80,
                HTTPSPort: 443,
                OriginProtocolPolicy: 'http-only'
              }
            }
          ]
        },
        DefaultCacheBehavior: {
          TargetOriginId: `S3-${this.bucketName}`,
          ViewerProtocolPolicy: 'redirect-to-https',
          TrustedSigners: {
            Enabled: false,
            Quantity: 0
          },
          ForwardedValues: {
            QueryString: false,
            Cookies: {
              Forward: 'none'
            }
          },
          MinTTL: 0,
          Compress: true
        },
        Aliases: {
          Quantity: 1,
          Items: [this.domain]
        },
        ViewerCertificate: {
          ACMCertificateArn: certArn,
          SSLSupportMethod: 'sni-only',
          MinimumProtocolVersion: 'TLSv1.2_2021'
        },
        PriceClass: 'PriceClass_100',
        Enabled: true
      };

      // Write config to file
      const configFile = 'cloudfront-config.json';
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

      // Create distribution
      const response = execSync(`aws cloudfront create-distribution --distribution-config file://${configFile} --output json`, { encoding: 'utf8' });
      const distribution = JSON.parse(response);

      // Clean up config file
      fs.unlinkSync(configFile);

      console.log(`✅ CloudFront distribution created: ${distribution.Distribution.Id}`);
      console.log(`   Domain: ${distribution.Distribution.DomainName}`);
      console.log(`   Status: ${distribution.Distribution.Status}`);

      return distribution.Distribution.Id;

    } catch (error) {
      console.error('❌ Failed to create CloudFront distribution:', error.message);
      throw error;
    }
  }

  async getDistributionDomain(distributionId) {
    console.log('\n🌐 Getting distribution domain...');

    try {
      const response = execSync(`aws cloudfront get-distribution --id ${distributionId} --output json`, { encoding: 'utf8' });
      const distribution = JSON.parse(response);
      
      const domain = distribution.Distribution.DomainName;
      console.log(`✅ Distribution domain: ${domain}`);
      
      return domain;

    } catch (error) {
      console.error('❌ Failed to get distribution domain:', error.message);
      throw error;
    }
  }

  async generateDNSConfig(distributionDomain) {
    console.log('\n📝 Generating DNS configuration...');

    const dnsConfig = `
# DNS Configuration for rekursing.com
# Add these records to your domain registrar

# A Record (IPv4) - Point to CloudFront
Type: A
Name: rekursing.com
Value: ${distributionDomain}
TTL: 300

# CNAME Record (www subdomain)
Type: CNAME
Name: www.rekursing.com
Value: rekursing.com
TTL: 300

# Note: CloudFront will handle the A record automatically
# You may only need to add the CNAME record for www subdomain
`;

    fs.writeFileSync('dns-config.txt', dnsConfig);
    console.log('✅ DNS configuration saved to dns-config.txt');
    console.log('📋 Please add these records to your domain registrar');
  }

  async testSetup(distributionDomain) {
    console.log('\n🧪 Testing setup...');

    try {
      // Test CloudFront distribution
      console.log(`🌐 Testing CloudFront: https://${distributionDomain}`);
      
      // Note: We can't actually test HTTPS until DNS is configured
      console.log('⚠️  HTTPS testing requires DNS configuration to be complete');
      console.log('   You can test the S3 website directly:');
      console.log(`   http://${this.bucketName}.s3-website-${this.region}.amazonaws.com`);

    } catch (error) {
      console.error('❌ Setup testing failed:', error.message);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the setup
const setup = new DomainSetup();
setup.run().catch(console.error); 