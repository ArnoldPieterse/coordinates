#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 GPU Streaming System - Immediate Deployment\n');
console.log('Executing all git and AWS commands to deploy your system...\n');

// Configuration
const config = {
    projectName: 'gpu-streaming-system',
    awsRegion: 'us-east-1',
    domain: 'rekursing.com',
    lmStudioUrl: 'http://10.3.129.26:1234',
    deploymentPort: 3000
};

function runCommand(command, description) {
    console.log(`📋 ${description}...`);
    try {
        execSync(command, { stdio: 'inherit', shell: true });
        console.log(`✅ ${description} completed`);
        return true;
    } catch (error) {
        console.error(`❌ ${description} failed:`, error.message);
        return false;
    }
}

function main() {
    console.log('🚀 Starting deployment...\n');
    
    // Step 1: Git operations
    console.log('📦 Git Operations:');
    runCommand('git add .', 'Adding all files to git');
    runCommand('git commit -m "Deploy GPU streaming system with LM Studio integration"', 'Committing changes');
    runCommand('git push origin main', 'Pushing to remote repository');
    
    // Step 2: Install dependencies
    console.log('\n📦 Installing Dependencies:');
    runCommand('npm install', 'Installing npm dependencies');
    
    // Step 3: AWS Infrastructure
    console.log('\n☁️  AWS Infrastructure:');
    runCommand(`aws ecr create-repository --repository-name ${config.projectName} --region ${config.awsRegion}`, 'Creating ECR repository');
    runCommand(`aws s3 mb s3://${config.projectName}-assets-${Date.now()} --region ${config.awsRegion}`, 'Creating S3 bucket');
    
    // Step 4: Build and deploy
    console.log('\n🐳 Building and Deploying:');
    runCommand('docker build -t gpu-streaming-app .', 'Building Docker image');
    runCommand('docker-compose up -d', 'Starting with Docker Compose');
    
    // Step 5: Test LM Studio connection
    console.log('\n🔍 Testing LM Studio:');
    try {
        const response = execSync(`curl -s -o /dev/null -w "%{http_code}" ${config.lmStudioUrl}`, { encoding: 'utf8' });
        console.log(`✅ LM Studio connection test: ${response.trim()}`);
    } catch (error) {
        console.log(`⚠️  LM Studio not accessible yet: ${config.lmStudioUrl}`);
    }
    
    // Step 6: Start the application
    console.log('\n🚀 Starting Application:');
    runCommand('node launch-gpu-streaming.js', 'Starting GPU streaming app');
    
    console.log('\n🎉 Deployment completed!');
    console.log(`🌐 Your GPU streaming system is running at: http://localhost:${config.deploymentPort}`);
    console.log(`🔗 LM Studio integration: ${config.lmStudioUrl}`);
    console.log(`🌍 Domain: https://${config.domain}`);
    
    console.log('\n📋 Next steps:');
    console.log('1. Test the application at the URL above');
    console.log('2. Configure your GPU providers');
    console.log('3. Set up your domain DNS');
    console.log('4. Monitor the logs and performance');
}

main(); 