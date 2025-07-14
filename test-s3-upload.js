/**
 * Test S3 Upload and List Files
 */

import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

console.log('🔍 Testing S3 Upload and Files...');

const s3Client = new S3Client({ region: 'us-east-1' });

async function testS3Files() {
    try {
        // List all objects in the bucket
        const listCommand = new ListObjectsV2Command({
            Bucket: 'rekursing.com',
            Prefix: 'coordinates/'
        });
        
        const response = await s3Client.send(listCommand);
        
        console.log('✅ Files found in S3:');
        console.log('=====================');
        
        if (response.Contents && response.Contents.length > 0) {
            response.Contents.forEach(obj => {
                console.log(`📁 ${obj.Key} (${obj.Size} bytes)`);
            });
            
            // Check if index.html exists
            const indexFile = response.Contents.find(obj => obj.Key === 'coordinates/index.html');
            if (indexFile) {
                console.log('\n✅ coordinates/index.html found!');
                
                // Try to get the content
                const getCommand = new GetObjectCommand({
                    Bucket: 'rekursing.com',
                    Key: 'coordinates/index.html'
                });
                
                const indexResponse = await s3Client.send(getCommand);
                const content = await indexResponse.Body.transformToString();
                
                console.log('\n📄 Index.html content preview:');
                console.log(content.substring(0, 500) + '...');
                
            } else {
                console.log('\n❌ coordinates/index.html not found!');
            }
            
        } else {
            console.log('❌ No files found in coordinates/ directory');
        }
        
        // Also check root level
        console.log('\n🔍 Checking root level files...');
        const rootListCommand = new ListObjectsV2Command({
            Bucket: 'rekursing.com',
            MaxKeys: 10
        });
        
        const rootResponse = await s3Client.send(rootListCommand);
        if (rootResponse.Contents) {
            rootResponse.Contents.forEach(obj => {
                console.log(`📁 ${obj.Key} (${obj.Size} bytes)`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error testing S3 files:', error.message);
    }
}

testS3Files(); 