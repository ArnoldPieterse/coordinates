/**
 * Interactive AWS Credentials Setup
 * Helps users set up AWS credentials step by step
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

class AWSCredentialsSetup {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.awsConfigPath = path.join(process.env.HOME || process.env.USERPROFILE, '.aws');
        this.credentialsPath = path.join(this.awsConfigPath, 'credentials');
        this.configPath = path.join(this.awsConfigPath, 'config');
    }

    question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }

    async setupCredentials() {
        console.log('🔧 AWS Credentials Setup');
        console.log('========================\n');

        try {
            // Check if AWS CLI is installed
            console.log('1. Checking AWS CLI installation...');
            const awsVersion = execSync('aws --version', { encoding: 'utf8' });
            console.log(`✅ AWS CLI installed: ${awsVersion.trim()}\n`);

            // Create .aws directory if it doesn't exist
            if (!fs.existsSync(this.awsConfigPath)) {
                fs.mkdirSync(this.awsConfigPath, { recursive: true });
                console.log('✅ Created .aws directory');
            }

            // Get credentials from user
            console.log('\n2. Please enter your AWS credentials:');
            
            const accessKeyId = await this.question('AWS Access Key ID: ');
            const secretAccessKey = await this.question('AWS Secret Access Key: ');
            const region = await this.question('Default region (e.g., us-east-1): ') || 'us-east-1';
            const outputFormat = await this.question('Default output format (json): ') || 'json';

            // Write credentials file
            const credentialsContent = `[default]
aws_access_key_id = ${accessKeyId}
aws_secret_access_key = ${secretAccessKey}
`;

            fs.writeFileSync(this.credentialsPath, credentialsContent);
            console.log('✅ AWS credentials file created');

            // Write config file
            const configContent = `[default]
region = ${region}
output = ${outputFormat}
`;

            fs.writeFileSync(this.configPath, configContent);
            console.log('✅ AWS config file created');

            // Test credentials
            console.log('\n3. Testing credentials...');
            const identity = execSync('aws sts get-caller-identity', { encoding: 'utf8' });
            const identityObj = JSON.parse(identity);
            
            console.log('✅ AWS credentials working!');
            console.log(`   Account ID: ${identityObj.Account}`);
            console.log(`   User ID: ${identityObj.UserId}`);
            console.log(`   ARN: ${identityObj.Arn}`);

            console.log('\n🎉 AWS credentials setup completed successfully!');
            console.log('\nNext steps:');
            console.log('1. Run: npm run setup:aws:agents (for AI agent assisted deployment)');
            console.log('2. Or run: npm run deploy:aws-modern (for direct deployment)');

            return true;

        } catch (error) {
            console.error('\n❌ Setup failed:', error.message);
            
            if (error.message.includes('InvalidClientTokenId')) {
                console.log('\n🔧 The credentials you entered are invalid.');
                console.log('Please check your AWS Access Key ID and Secret Access Key.');
                console.log('You can get these from the AWS Console:');
                console.log('1. Go to https://console.aws.amazon.com/');
                console.log('2. Click your username in the top right');
                console.log('3. Click "Security credentials"');
                console.log('4. Under "Access keys", click "Create access key"');
            }
            
            return false;
        } finally {
            this.rl.close();
        }
    }

    async checkExistingCredentials() {
        console.log('🔍 Checking existing AWS credentials...\n');

        try {
            const identity = execSync('aws sts get-caller-identity', { encoding: 'utf8' });
            const identityObj = JSON.parse(identity);
            
            console.log('✅ Existing AWS credentials are working!');
            console.log(`   Account ID: ${identityObj.Account}`);
            console.log(`   User ID: ${identityObj.UserId}`);
            console.log(`   ARN: ${identityObj.Arn}`);
            
            return true;
        } catch (error) {
            console.log('❌ No valid AWS credentials found or credentials are invalid.');
            return false;
        }
    }
}

// CLI interface
async function main() {
    const setup = new AWSCredentialsSetup();
    
    console.log('🤖 AWS Credentials Setup for Coordinates Project');
    console.log('===============================================\n');
    
    // Check if credentials already work
    const existingCredentials = await setup.checkExistingCredentials();
    
    if (existingCredentials) {
        const answer = await setup.question('\nDo you want to set up new credentials anyway? (y/N): ');
        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
            console.log('\n✅ Using existing credentials. You can now run:');
            console.log('   npm run setup:aws:agents');
            return;
        }
    }
    
    // Set up new credentials
    await setup.setupCredentials();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Setup failed:', error);
        process.exit(1);
    });
}

export default AWSCredentialsSetup; 