/**
 * Simple AWS Test Script
 */

import { execSync } from 'child_process';

console.log('🔍 Testing AWS Setup...');

try {
    // Test AWS CLI
    console.log('1. Testing AWS CLI...');
    const awsVersion = execSync('aws --version', { encoding: 'utf8' });
    console.log(`✅ AWS CLI: ${awsVersion.trim()}`);
    
    // Test AWS credentials
    console.log('\n2. Testing AWS credentials...');
    const identity = execSync('aws sts get-caller-identity', { encoding: 'utf8' });
    console.log('✅ AWS credentials working!');
    console.log(identity);
    
    // Test AWS regions
    console.log('\n3. Testing AWS regions...');
    const regions = execSync('aws ec2 describe-regions --query "Regions[].RegionName" --output table', { encoding: 'utf8' });
    console.log('✅ AWS regions accessible');
    console.log(regions);
    
    console.log('\n🎉 AWS setup is working correctly!');
    
} catch (error) {
    console.error('❌ AWS test failed:', error.message);
    
    if (error.message.includes('Unauthorized')) {
        console.log('\n🔧 AWS Credentials Issue:');
        console.log('Please run: aws configure');
        console.log('Enter your AWS Access Key ID and Secret Access Key');
    } else if (error.message.includes('not found')) {
        console.log('\n🔧 AWS CLI Issue:');
        console.log('Please install AWS CLI: https://aws.amazon.com/cli/');
    }
} 