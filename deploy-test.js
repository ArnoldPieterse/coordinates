/**
 * Simple AWS Deployment Test
 */

import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

console.log('🚀 Testing AWS Deployment...');

try {
    // Create S3 client
    const s3Client = new S3Client({ region: 'us-east-1' });
    console.log('✅ S3 client created');
    
    // List buckets
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    
    console.log('✅ AWS connection successful!');
    console.log('Available buckets:', response.Buckets?.map(b => b.Name) || []);
    
    // Test credentials
    const { execSync } = await import('child_process');
    const identity = execSync('aws sts get-caller-identity', { encoding: 'utf8' });
    console.log('✅ AWS credentials working:');
    console.log(identity);
    
} catch (error) {
    console.error('❌ AWS test failed:', error.message);
} 