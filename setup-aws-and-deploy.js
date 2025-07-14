/**
 * AWS Setup and Deployment Script
 * Helps set up AWS credentials and deploy with AI agent assistance
 * IDX-AWS-SETUP-001: AWS Setup and Deployment Automation
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class AWSSetupAndDeploy {
    constructor() {
        this.awsConfigPath = path.join(process.env.HOME || process.env.USERPROFILE, '.aws');
        this.credentialsPath = path.join(this.awsConfigPath, 'credentials');
        this.configPath = path.join(this.awsConfigPath, 'config');
    }

    async checkAWSSetup() {
        console.log('🔍 Checking AWS Setup...');
        
        try {
            // Check if AWS CLI is installed
            const awsVersion = execSync('aws --version', { encoding: 'utf8' });
            console.log(`✅ AWS CLI installed: ${awsVersion.trim()}`);
            
            // Check if credentials file exists
            if (fs.existsSync(this.credentialsPath)) {
                console.log('✅ AWS credentials file found');
                const credentials = fs.readFileSync(this.credentialsPath, 'utf8');
                if (credentials.includes('[default]')) {
                    console.log('✅ Default AWS profile configured');
                }
            } else {
                console.log('⚠️ AWS credentials file not found');
                return false;
            }
            
            // Check if config file exists
            if (fs.existsSync(this.configPath)) {
                console.log('✅ AWS config file found');
            } else {
                console.log('⚠️ AWS config file not found');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('❌ AWS CLI not found or not working:', error.message);
            return false;
        }
    }

    async testAWSCredentials() {
        console.log('\n🔐 Testing AWS Credentials...');
        
        try {
            const result = execSync('aws sts get-caller-identity', { encoding: 'utf8' });
            const identity = JSON.parse(result);
            
            console.log('✅ AWS credentials working!');
            console.log(`   Account ID: ${identity.Account}`);
            console.log(`   User ID: ${identity.UserId}`);
            console.log(`   ARN: ${identity.Arn}`);
            
            return identity;
        } catch (error) {
            console.error('❌ AWS credentials test failed:', error.message);
            return null;
        }
    }

    async setupAWSCredentials() {
        console.log('\n🔧 Setting up AWS Credentials...');
        
        try {
            // Create .aws directory if it doesn't exist
            if (!fs.existsSync(this.awsConfigPath)) {
                fs.mkdirSync(this.awsConfigPath, { recursive: true });
                console.log('✅ Created .aws directory');
            }
            
            console.log('📝 Please configure your AWS credentials:');
            console.log('1. Run: aws configure');
            console.log('2. Enter your AWS Access Key ID');
            console.log('3. Enter your AWS Secret Access Key');
            console.log('4. Enter your default region (e.g., us-east-1)');
            console.log('5. Enter your default output format (json)');
            
            // Wait for user to configure
            console.log('\n⏳ Waiting for AWS configuration...');
            console.log('Please run "aws configure" in a separate terminal and then press Enter here...');
            
            // In a real scenario, you might want to use a different approach
            // For now, we'll just check if credentials are working
            return await this.testAWSCredentials();
            
        } catch (error) {
            console.error('❌ Failed to setup AWS credentials:', error.message);
            return null;
        }
    }

    async buildProject() {
        console.log('\n🏗️ Building Project...');
        
        try {
            // Check if build is needed
            if (!fs.existsSync('dist')) {
                console.log('📦 Building application...');
                execSync('npm run build', { stdio: 'inherit' });
                console.log('✅ Build completed successfully');
            } else {
                console.log('✅ Build already exists');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Build failed:', error.message);
            return false;
        }
    }

    async deployToAWS() {
        console.log('\n🚀 Deploying to AWS...');
        
        try {
            // Test credentials again before deployment
            const identity = await this.testAWSCredentials();
            if (!identity) {
                throw new Error('AWS credentials not working');
            }
            
            console.log('📤 Starting AWS deployment...');
            
            // Run the modern AWS deployment script
            execSync('npm run deploy:aws-modern', { stdio: 'inherit' });
            
            console.log('✅ AWS deployment completed successfully!');
            return true;
        } catch (error) {
            console.error('❌ AWS deployment failed:', error.message);
            return false;
        }
    }

    async runFullProcess() {
        console.log('🤖 AWS Setup and Deployment with AI Agent Assistance');
        console.log('==================================================\n');
        
        // Step 1: Check AWS setup
        const awsSetup = await this.checkAWSSetup();
        
        // Step 2: Test credentials
        let credentials = await this.testAWSCredentials();
        
        // Step 3: Setup credentials if needed
        if (!credentials) {
            console.log('\n⚠️ AWS credentials not working. Setting up...');
            credentials = await this.setupAWSCredentials();
            
            if (!credentials) {
                console.log('\n❌ Cannot proceed without valid AWS credentials');
                console.log('Please configure AWS credentials and try again');
                return false;
            }
        }
        
        // Step 4: Build project
        const buildSuccess = await this.buildProject();
        if (!buildSuccess) {
            console.log('\n❌ Build failed, cannot deploy');
            return false;
        }
        
        // Step 5: Deploy to AWS
        const deploySuccess = await this.deployToAWS();
        if (!deploySuccess) {
            console.log('\n❌ Deployment failed');
            return false;
        }
        
        console.log('\n🎉 AWS Setup and Deployment completed successfully!');
        console.log('==================================================');
        console.log('Your application should now be deployed to AWS');
        console.log('Check the deployment output above for the final URL');
        
        return true;
    }

    async runWithAIAgents() {
        console.log('🤖 Starting AI Agent Assisted Deployment...');
        
        try {
            // Import and initialize AI agents
            const { AIAgentManager } = await import('./src/ai-agent-system.js');
            const agentManager = new AIAgentManager();
            
            console.log('🚀 Initializing AI Agents...');
            await agentManager.initializeLLM();
            await agentManager.spawnAllAgents();
            
            console.log(`✅ AI Agents initialized: ${agentManager.getAgentCount()} agents ready`);
            
            // Queue deployment jobs
            console.log('📋 Queuing deployment jobs...');
            
            // AWS Specialist job
            await agentManager.queueJob(
                'aws_deployment',
                'Prepare and execute AWS deployment',
                { projectPath: process.cwd() },
                'high',
                'aws_specialist'
            );
            
            // Deployment Engineer job
            await agentManager.queueJob(
                'deployment_check',
                'Validate deployment configuration',
                { projectPath: process.cwd() },
                'high',
                'deployment_engineer'
            );
            
            // Security Analyst job
            await agentManager.queueJob(
                'security_audit',
                'Audit deployment security',
                { projectPath: process.cwd() },
                'normal',
                'security_analyst'
            );
            
            console.log('✅ Deployment jobs queued for AI agents');
            
            // Run the actual deployment
            return await this.runFullProcess();
            
        } catch (error) {
            console.error('❌ AI Agent deployment failed:', error.message);
            console.log('Falling back to manual deployment...');
            return await this.runFullProcess();
        }
    }
}

// CLI interface
async function main() {
    const setup = new AWSSetupAndDeploy();
    
    const args = process.argv.slice(2);
    
    if (args.includes('--ai-agents')) {
        await setup.runWithAIAgents();
    } else {
        await setup.runFullProcess();
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Setup and deployment failed:', error);
        process.exit(1);
    });
}

export default AWSSetupAndDeploy; 