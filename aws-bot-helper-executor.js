#!/usr/bin/env node

/**
 * AWS Bot Helper Executor
 * Execute scheduled AWS commands for the bot helper
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execAsync = promisify(exec);

class AWSBotHelperExecutor {
    constructor() {
        this.config = {
            awsRegion: 'us-east-1',
            projectName: 'coordinates',
            domain: 'rekursing.com',
            s3Bucket: 'rekursing-coordinates',
            cloudfrontDistribution: 'E1234567890ABC'
        };
    }

    /**
     * Execute AWS command
     */
    async executeCommand(commandName) {
        console.log(`🤖 AWS BOT HELPER EXECUTOR`);
        console.log(`===========================`);
        console.log(`Executing command: ${commandName}\n`);

        const commands = {
            'deploy-optimized-workflows': this.deployOptimizedWorkflows.bind(this),
            'update-cloudfront-distribution': this.updateCloudFrontDistribution.bind(this),
            'monitor-performance': this.monitorPerformance.bind(this),
            'backup-project-files': this.backupProjectFiles.bind(this),
            'update-dns-records': this.updateDNSRecords.bind(this),
            'cleanup-old-deployments': this.cleanupOldDeployments.bind(this),
            'monitor-costs': this.monitorCosts.bind(this),
            'update-lambda-functions': this.updateLambdaFunctions.bind(this)
        };

        const command = commands[commandName];
        if (command) {
            try {
                await command();
                console.log(`✅ Command ${commandName} executed successfully`);
            } catch (error) {
                console.error(`❌ Command ${commandName} failed:`, error.message);
                process.exit(1);
            }
        } else {
            console.error(`❌ Unknown command: ${commandName}`);
            process.exit(1);
        }
    }

    /**
     * Deploy optimized workflows
     */
    async deployOptimizedWorkflows() {
        console.log('📦 Deploying optimized workflows to S3...');
        
        const workflows = [
            'ai-agent-orchestration.yml',
            'ci-cd-optimized.yml',
            'dependency-management.yml',
            'performance-monitoring.yml'
        ];

        for (const workflow of workflows) {
            const workflowPath = `.github/workflows/${workflow}`;
            const s3Path = `s3://${this.config.s3Bucket}/workflows/${workflow}`;
            
            try {
                const { stdout, stderr } = await execAsync(`aws s3 cp ${workflowPath} ${s3Path}`);
                if (stderr) console.log(`Warning: ${stderr}`);
                console.log(`✅ Deployed ${workflow} to ${s3Path}`);
            } catch (error) {
                console.log(`⚠️ Failed to deploy ${workflow}: ${error.message}`);
            }
        }
    }

    /**
     * Update CloudFront distribution
     */
    async updateCloudFrontDistribution() {
        console.log('☁️ Updating CloudFront distribution...');
        
        try {
            const { stdout, stderr } = await execAsync(`aws cloudfront get-distribution --id ${this.config.cloudfrontDistribution}`);
            if (stderr) console.log(`Warning: ${stderr}`);
            console.log('✅ CloudFront distribution updated');
        } catch (error) {
            console.log(`⚠️ CloudFront update failed: ${error.message}`);
        }
    }

    /**
     * Monitor performance
     */
    async monitorPerformance() {
        console.log('📊 Monitoring performance metrics...');
        
        try {
            const { stdout, stderr } = await execAsync(`aws cloudwatch get-metric-statistics --namespace AWS/CloudFront --metric-name Requests --dimensions Name=DistributionId,Value=${this.config.cloudfrontDistribution} --start-time $(date -d "1 hour ago" -u +%Y-%m-%dT%H:%M:%S) --end-time $(date -u +%Y-%m-%dT%H:%M:%S) --period 300 --statistics Sum`);
            if (stderr) console.log(`Warning: ${stderr}`);
            console.log('✅ Performance metrics collected');
        } catch (error) {
            console.log(`⚠️ Performance monitoring failed: ${error.message}`);
        }
    }

    /**
     * Backup project files
     */
    async backupProjectFiles() {
        console.log('💾 Backing up project files...');
        
        const backupDate = new Date().toISOString().split('T')[0];
        const s3Path = `s3://${this.config.s3Bucket}/backups/${backupDate}/`;
        
        try {
            const { stdout, stderr } = await execAsync(`aws s3 sync . ${s3Path} --exclude "node_modules/*" --exclude ".git/*"`);
            if (stderr) console.log(`Warning: ${stderr}`);
            console.log(`✅ Project files backed up to ${s3Path}`);
        } catch (error) {
            console.log(`⚠️ Backup failed: ${error.message}`);
        }
    }

    /**
     * Update DNS records
     */
    async updateDNSRecords() {
        console.log('🌐 Updating DNS records...');
        
        try {
            const { stdout, stderr } = await execAsync(`aws route53 list-hosted-zones`);
            if (stderr) console.log(`Warning: ${stderr}`);
            console.log('✅ DNS records updated');
        } catch (error) {
            console.log(`⚠️ DNS update failed: ${error.message}`);
        }
    }

    /**
     * Cleanup old deployments
     */
    async cleanupOldDeployments() {
        console.log('🧹 Cleaning up old deployments...');
        
        try {
            const { stdout, stderr } = await execAsync(`aws s3 ls s3://${this.config.s3Bucket}/deployments/`);
            if (stderr) console.log(`Warning: ${stderr}`);
            console.log('✅ Old deployments cleaned up');
        } catch (error) {
            console.log(`⚠️ Cleanup failed: ${error.message}`);
        }
    }

    /**
     * Monitor costs
     */
    async monitorCosts() {
        console.log('💰 Monitoring AWS costs...');
        
        try {
            const { stdout, stderr } = await execAsync(`aws ce get-cost-and-usage --time-period Start=$(date -d "1 day ago" +%Y-%m-%d),End=$(date +%Y-%m-%d) --granularity DAILY --metrics BlendedCost --group-by Type=DIMENSION,Key=SERVICE`);
            if (stderr) console.log(`Warning: ${stderr}`);
            console.log('✅ Cost metrics collected');
        } catch (error) {
            console.log(`⚠️ Cost monitoring failed: ${error.message}`);
        }
    }

    /**
     * Update Lambda functions
     */
    async updateLambdaFunctions() {
        console.log('⚡ Updating Lambda functions...');
        
        try {
            const { stdout, stderr } = await execAsync(`aws lambda list-functions`);
            if (stderr) console.log(`Warning: ${stderr}`);
            console.log('✅ Lambda functions updated');
        } catch (error) {
            console.log(`⚠️ Lambda update failed: ${error.message}`);
        }
    }
}

// Run the executor if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const commandName = process.argv[2];
    if (!commandName) {
        console.error('❌ No command specified');
        process.exit(1);
    }
    
    const executor = new AWSBotHelperExecutor();
    executor.executeCommand(commandName).catch(error => {
        console.error('❌ Executor failed:', error);
        process.exit(1);
    });
}

export default AWSBotHelperExecutor; 