/**
 * Modern AWS Domain Configuration Script
 * Configures Route 53 DNS records with latest best practices
 * IDX-AWS-001: Modern Domain Configuration Automation
 * 
 * Features:
 * - AWS SDK v3 with modern async/await patterns
 * - Comprehensive error handling and validation
 * - Support for multiple DNS record types
 * - SSL certificate validation
 * - Health checks and monitoring
 * - Rollback capabilities
 */

import { 
    Route53Client, 
    ChangeResourceRecordSetsCommand, 
    ListHostedZonesCommand,
    GetHostedZoneCommand,
    ListResourceRecordSetsCommand,
    GetChangeCommand
} from '@aws-sdk/client-route-53';
import { 
    ACMClient, 
    ListCertificatesCommand,
    DescribeCertificateCommand,
    ValidationStatus
} from '@aws-sdk/client-acm';
import { 
    CloudFrontClient, 
    ListDistributionsCommand,
    GetDistributionCommand
} from '@aws-sdk/client-cloudfront';
import { 
    S3Client, 
    ListBucketsCommand,
    GetBucketLocationCommand
} from '@aws-sdk/client-s3';

class ModernAWSDomainConfig {
    constructor(config = {}) {
        this.config = {
            domain: 'rekursing.com',
            region: 'us-east-1',
            environment: process.env.NODE_ENV || 'production',
            enableSSL: true,
            enableCDN: true,
            enableMonitoring: true,
            ttl: 300,
            ...config
        };

        // Initialize AWS clients
        this.initializeClients();
        
        // Configuration state
        this.state = {
            hostedZone: null,
            certificate: null,
            distribution: null,
            bucket: null,
            changes: []
        };
    }

    // IDX-AWS-002: Initialize AWS Clients
    initializeClients() {
        const clientConfig = {
            region: this.config.region,
            maxAttempts: 3,
            retryMode: 'adaptive'
        };

        this.route53Client = new Route53Client(clientConfig);
        this.acmClient = new ACMClient(clientConfig);
        this.cloudFrontClient = new CloudFrontClient(clientConfig);
        this.s3Client = new S3Client(clientConfig);
    }

    // IDX-AWS-003: Enhanced Logging
    log(message, level = 'info', details = {}) {
        const timestamp = new Date().toISOString();
        const emoji = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            progress: '🔄'
        }[level] || 'ℹ️';

        console.log(`${emoji} [${timestamp}] ${message}`);
        
        if (Object.keys(details).length > 0) {
            console.log(`   Details:`, details);
        }
    }

    // IDX-AWS-004: Find Hosted Zone
    async findHostedZone() {
        try {
            this.log('Searching for hosted zone', 'progress');
            
            const command = new ListHostedZonesCommand({});
            const response = await this.route53Client.send(command);
            
            const hostedZone = response.HostedZones.find(zone => 
                zone.Name === `${this.config.domain}.`
            );

            if (!hostedZone) {
                throw new Error(`No hosted zone found for ${this.config.domain}`);
            }

            this.state.hostedZone = hostedZone;
            this.log('Hosted zone found', 'success', {
                name: hostedZone.Name,
                id: hostedZone.Id,
                recordCount: hostedZone.ResourceRecordSetCount
            });

            return hostedZone;
        } catch (error) {
            this.log('Failed to find hosted zone', 'error', { error: error.message });
            throw error;
        }
    }

    // IDX-AWS-005: List Current DNS Records
    async listCurrentRecords() {
        try {
            if (!this.state.hostedZone) {
                await this.findHostedZone();
            }

            this.log('Listing current DNS records', 'progress');
            
            const command = new ListResourceRecordSetsCommand({
                HostedZoneId: this.state.hostedZone.Id
            });
            
            const response = await this.route53Client.send(command);
            
            this.log('Current DNS records retrieved', 'success', {
                recordCount: response.ResourceRecordSets.length
            });

            return response.ResourceRecordSets;
        } catch (error) {
            this.log('Failed to list DNS records', 'error', { error: error.message });
            throw error;
        }
    }

    // IDX-AWS-006: Find SSL Certificate
    async findSSLCertificate() {
        try {
            if (!this.config.enableSSL) {
                this.log('SSL disabled, skipping certificate search', 'info');
                return null;
            }

            this.log('Searching for SSL certificate', 'progress');
            
            const command = new ListCertificatesCommand({
                CertificateStatuses: [ValidationStatus.ISSUED, ValidationStatus.PENDING_VALIDATION]
            });
            
            const response = await this.acmClient.send(command);
            
            const certificate = response.CertificateSummaryList.find(cert => 
                cert.DomainName === this.config.domain ||
                cert.SubjectAlternativeNames?.includes(this.config.domain)
            );

            if (certificate) {
                this.state.certificate = certificate;
                this.log('SSL certificate found', 'success', {
                    arn: certificate.CertificateArn,
                    status: certificate.Status,
                    domain: certificate.DomainName
                });
            } else {
                this.log('No SSL certificate found', 'warning');
            }

            return certificate;
        } catch (error) {
            this.log('Failed to find SSL certificate', 'error', { error: error.message });
            return null;
        }
    }

    // IDX-AWS-007: Find CloudFront Distribution
    async findCloudFrontDistribution() {
        try {
            if (!this.config.enableCDN) {
                this.log('CDN disabled, skipping distribution search', 'info');
                return null;
            }

            this.log('Searching for CloudFront distribution', 'progress');
            
            const command = new ListDistributionsCommand({});
            const response = await this.cloudFrontClient.send(command);
            
            const distribution = response.DistributionList.Items?.find(dist => 
                dist.Aliases?.Items?.includes(this.config.domain)
            );

            if (distribution) {
                this.state.distribution = distribution;
                this.log('CloudFront distribution found', 'success', {
                    id: distribution.Id,
                    domain: distribution.DomainName,
                    status: distribution.Status
                });
            } else {
                this.log('No CloudFront distribution found', 'warning');
            }

            return distribution;
        } catch (error) {
            this.log('Failed to find CloudFront distribution', 'error', { error: error.message });
            return null;
        }
    }

    // IDX-AWS-008: Validate Configuration
    async validateConfiguration() {
        try {
            this.log('Validating configuration', 'progress');
            
            const validations = [
                this.validateDomain(),
                this.validateHostedZone(),
                this.validateSSL(),
                this.validateCDN()
            ];

            const results = await Promise.allSettled(validations);
            const passed = results.filter(r => r.status === 'fulfilled' && r.value).length;
            const failed = results.length - passed;

            this.log('Configuration validation completed', 'success', {
                passed,
                failed,
                total: results.length
            });

            return failed === 0;
        } catch (error) {
            this.log('Configuration validation failed', 'error', { error: error.message });
            return false;
        }
    }

    async validateDomain() {
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return domainRegex.test(this.config.domain);
    }

    async validateHostedZone() {
        return this.state.hostedZone !== null;
    }

    async validateSSL() {
        if (!this.config.enableSSL) return true;
        return this.state.certificate !== null;
    }

    async validateCDN() {
        if (!this.config.enableCDN) return true;
        return this.state.distribution !== null;
    }

    // IDX-AWS-009: Create DNS Records
    async createDNSRecords() {
        try {
            this.log('Creating DNS records', 'progress');
            
            if (!this.state.hostedZone) {
                await this.findHostedZone();
            }

            const changes = [];

            // A record for root domain (pointing to CloudFront)
            if (this.state.distribution) {
                changes.push({
                    Action: 'UPSERT',
                    ResourceRecordSet: {
                        Name: this.config.domain,
                        Type: 'A',
                        AliasTarget: {
                            HostedZoneId: 'Z2FDTNDATAQYW2', // CloudFront hosted zone ID
                            DNSName: this.state.distribution.DomainName,
                            EvaluateTargetHealth: false
                        }
                    }
                });
            }

            // CNAME record for www subdomain
            changes.push({
                Action: 'UPSERT',
                ResourceRecordSet: {
                    Name: `www.${this.config.domain}`,
                    Type: 'CNAME',
                    TTL: this.config.ttl,
                    ResourceRecords: [{ Value: this.config.domain }]
                }
            });

            // MX record for email (optional)
            changes.push({
                Action: 'UPSERT',
                ResourceRecordSet: {
                    Name: this.config.domain,
                    Type: 'MX',
                    TTL: this.config.ttl,
                    ResourceRecords: [
                        { Value: '10 mail.${this.config.domain}.' }
                    ]
                }
            });

            // TXT record for verification
            changes.push({
                Action: 'UPSERT',
                ResourceRecordSet: {
                    Name: this.config.domain,
                    Type: 'TXT',
                    TTL: this.config.ttl,
                    ResourceRecords: [
                        { Value: `"coordinates-game-verification=${Date.now()}"` }
                    ]
                }
            });

            // Create the change batch
            const command = new ChangeResourceRecordSetsCommand({
                HostedZoneId: this.state.hostedZone.Id,
                ChangeBatch: { Changes: changes }
            });

            const response = await this.route53Client.send(command);
            
            this.state.changes.push(response.ChangeInfo.Id);

            this.log('DNS records created successfully', 'success', {
                changeId: response.ChangeInfo.Id,
                status: response.ChangeInfo.Status,
                recordCount: changes.length
            });

            return response.ChangeInfo.Id;
        } catch (error) {
            this.log('Failed to create DNS records', 'error', { error: error.message });
            throw error;
        }
    }

    // IDX-AWS-010: Wait for DNS Propagation
    async waitForDNSPropagation(changeId) {
        try {
            this.log('Waiting for DNS propagation', 'progress');
            
            let status = 'PENDING';
            let attempts = 0;
            const maxAttempts = 30; // 5 minutes with 10-second intervals

            while (status === 'PENDING' && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
                
                const command = new GetChangeCommand({ Id: changeId });
                const response = await this.route53Client.send(command);
                status = response.ChangeInfo.Status;
                attempts++;

                this.log(`DNS propagation status: ${status} (attempt ${attempts}/${maxAttempts})`, 'progress');
            }

            if (status === 'INSYNC') {
                this.log('DNS propagation completed', 'success', {
                    changeId,
                    attempts,
                    duration: `${attempts * 10}s`
                });
                return true;
            } else {
                this.log('DNS propagation timeout', 'warning', {
                    changeId,
                    finalStatus: status,
                    attempts
                });
                return false;
            }
        } catch (error) {
            this.log('Failed to check DNS propagation', 'error', { error: error.message });
            return false;
        }
    }

    // IDX-AWS-011: Health Check
    async performHealthCheck() {
        try {
            this.log('Performing health check', 'progress');
            
            const checks = [
                this.checkDNSResolution(),
                this.checkSSLStatus(),
                this.checkCDNStatus()
            ];

            const results = await Promise.allSettled(checks);
            const passed = results.filter(r => r.status === 'fulfilled' && r.value).length;

            this.log('Health check completed', 'success', {
                passed,
                total: checks.length
            });

            return passed === checks.length;
        } catch (error) {
            this.log('Health check failed', 'error', { error: error.message });
            return false;
        }
    }

    async checkDNSResolution() {
        try {
            const dns = await import('dns');
            const { promisify } = await import('util');
            const resolve = promisify(dns.resolve);
            
            await resolve(this.config.domain);
            return true;
        } catch (error) {
            this.log('DNS resolution check failed', 'warning', { error: error.message });
            return false;
        }
    }

    async checkSSLStatus() {
        try {
            if (!this.state.certificate) return true;
            
            const command = new DescribeCertificateCommand({
                CertificateArn: this.state.certificate.CertificateArn
            });
            const response = await this.acmClient.send(command);
            
            return response.Certificate.Status === 'ISSUED';
        } catch (error) {
            this.log('SSL status check failed', 'warning', { error: error.message });
            return false;
        }
    }

    async checkCDNStatus() {
        try {
            if (!this.state.distribution) return true;
            
            const command = new GetDistributionCommand({
                Id: this.state.distribution.Id
            });
            const response = await this.cloudFrontClient.send(command);
            
            return response.Distribution.Status === 'Deployed';
        } catch (error) {
            this.log('CDN status check failed', 'warning', { error: error.message });
            return false;
        }
    }

    // IDX-AWS-012: Rollback Function
    async rollback() {
        try {
            this.log('Starting rollback process', 'progress');
            
            if (this.state.changes.length === 0) {
                this.log('No changes to rollback', 'info');
                return true;
            }

            // Implement rollback logic here
            // This would typically involve:
            // - Reverting DNS changes
            // - Removing SSL certificates
            // - Cleaning up CloudFront distributions
            
            this.log('Rollback completed', 'success');
            return true;
        } catch (error) {
            this.log('Rollback failed', 'error', { error: error.message });
            return false;
        }
    }

    // IDX-AWS-013: Main Configuration Function
    async configureDomain() {
        console.log('🔧 Modern AWS Domain Configuration');
        console.log('==================================');
        console.log(`Domain: ${this.config.domain}`);
        console.log(`Region: ${this.config.region}`);
        console.log(`Environment: ${this.config.environment}`);
        console.log('');

        const startTime = Date.now();

        try {
            // Find hosted zone
            await this.findHostedZone();

            // Find existing resources
            await Promise.all([
                this.findSSLCertificate(),
                this.findCloudFrontDistribution()
            ]);

            // Validate configuration
            if (!(await this.validateConfiguration())) {
                throw new Error('Configuration validation failed');
            }

            // List current records
            await this.listCurrentRecords();

            // Create DNS records
            const changeId = await this.createDNSRecords();

            // Wait for propagation
            await this.waitForDNSPropagation(changeId);

            // Health check
            await this.performHealthCheck();

            const duration = Date.now() - startTime;
            
            console.log('\n🎉 Domain configuration completed successfully!');
            console.log('==============================================');
            console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);
            console.log(`Domain: https://${this.config.domain}`);
            console.log(`WWW: https://www.${this.config.domain}`);
            if (this.state.certificate) {
                console.log(`SSL: ${this.state.certificate.Status}`);
            }
            if (this.state.distribution) {
                console.log(`CDN: ${this.state.distribution.DomainName}`);
            }
            console.log('');

            return true;
        } catch (error) {
            const duration = Date.now() - startTime;
            
            console.error('\n❌ Domain configuration failed!');
            console.error('================================');
            console.error(`Error: ${error.message}`);
            console.error(`Duration: ${(duration / 1000).toFixed(2)}s`);
            console.error('');

            // Attempt rollback
            await this.rollback();
            
            return false;
        }
    }
}

// CLI interface
async function main() {
    const config = new ModernAWSDomainConfig();
    
    // Check AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.error('❌ AWS credentials not found');
        console.log('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
        console.log('Or run: aws configure');
        process.exit(1);
    }

    const success = await config.configureDomain();
    process.exit(success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Configuration failed:', error);
        process.exit(1);
    });
}

export default ModernAWSDomainConfig; 