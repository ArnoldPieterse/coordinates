/**
 * AWS Domain Configuration Script
 * Configures Route 53 to point rekursing.com to Netlify
 * IDX-AWS-001: Domain configuration automation
 */

import { Route53Client, ChangeResourceRecordSetsCommand, ListHostedZonesCommand } from '@aws-sdk/client-route-53';

class AWSDomainConfig {
    constructor() {
        this.route53 = new Route53Client({
            region: 'us-east-1', // Route 53 is global but requires a region
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
        
        this.domain = 'rekursing.com';
        this.netlifySite = 'rekursing-com.netlify.app';
        this.netlifyIP = '75.2.60.5'; // Netlify's load balancer IP
    }

    async listHostedZones() {
        try {
            const command = new ListHostedZonesCommand({});
            const response = await this.route53.send(command);
            
            console.log('Available hosted zones:');
            response.HostedZones.forEach(zone => {
                console.log(`- ${zone.Name} (ID: ${zone.Id})`);
            });
            
            return response.HostedZones;
        } catch (error) {
            console.error('Error listing hosted zones:', error);
            return [];
        }
    }

    async findHostedZone() {
        const zones = await this.listHostedZones();
        return zones.find(zone => zone.Name === `${this.domain}.`);
    }

    async configureDomain() {
        try {
            const hostedZone = await this.findHostedZone();
            
            if (!hostedZone) {
                console.error(`No hosted zone found for ${this.domain}`);
                console.log('Please create a hosted zone in Route 53 first');
                return false;
            }

            console.log(`Found hosted zone: ${hostedZone.Name} (${hostedZone.Id})`);

            // Create DNS records for Netlify
            const changes = [
                // A record for root domain
                {
                    Action: 'UPSERT',
                    ResourceRecordSet: {
                        Name: this.domain,
                        Type: 'A',
                        TTL: 300,
                        ResourceRecords: [{ Value: this.netlifyIP }]
                    }
                },
                // CNAME record for www subdomain
                {
                    Action: 'UPSERT',
                    ResourceRecordSet: {
                        Name: `www.${this.domain}`,
                        Type: 'CNAME',
                        TTL: 300,
                        ResourceRecords: [{ Value: this.netlifySite }]
                    }
                }
            ];

            const command = new ChangeResourceRecordSetsCommand({
                HostedZoneId: hostedZone.Id,
                ChangeBatch: {
                    Changes: changes
                }
            });

            const response = await this.route53.send(command);
            console.log('DNS records updated successfully!');
            console.log('Change ID:', response.ChangeInfo.Id);
            console.log('Status:', response.ChangeInfo.Status);
            
            return true;
        } catch (error) {
            console.error('Error configuring domain:', error);
            return false;
        }
    }

    async verifyConfiguration() {
        console.log('\nVerification Steps:');
        console.log('1. Wait for DNS propagation (up to 48 hours)');
        console.log('2. Test: https://www.rekursing.com');
        console.log('3. Test: https://rekursing.com');
        console.log('4. Check SSL certificate status');
        
        console.log('\nManual verification commands:');
        console.log(`nslookup ${this.domain}`);
        console.log(`nslookup www.${this.domain}`);
        console.log(`dig ${this.domain}`);
        console.log(`dig www.${this.domain}`);
    }
}

// CLI interface
async function main() {
    const config = new AWSDomainConfig();
    
    console.log('🔧 AWS Domain Configuration for rekursing.com');
    console.log('==============================================\n');
    
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.error('❌ AWS credentials not found in environment variables');
        console.log('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
        console.log('Or run: aws configure');
        return;
    }
    
    const success = await config.configureDomain();
    
    if (success) {
        await config.verifyConfiguration();
        console.log('\n✅ Domain configuration completed!');
    } else {
        console.log('\n❌ Domain configuration failed');
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default AWSDomainConfig; 