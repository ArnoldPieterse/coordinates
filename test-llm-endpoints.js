#!/usr/bin/env node

/**
 * Test LLM Endpoints
 * Test different endpoints to find the correct one for completions
 */

const llmUrl = 'http://10.3.129.26:1234';

async function testEndpoints() {
    console.log('🔍 TESTING LLM ENDPOINTS');
    console.log('=========================');
    console.log(`Testing LLM at: ${llmUrl}\n`);

    const endpoints = [
        '/v1/chat/completions',
        '/v1/completions',
        '/chat/completions',
        '/completions',
        '/api/chat/completions',
        '/api/completions'
    ];

    for (const endpoint of endpoints) {
        console.log(`📡 Testing endpoint: ${endpoint}`);
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`${llmUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'meta-llama-3-70b-instruct-smashed',
                    messages: [
                        {
                            role: 'user',
                            content: 'Hello'
                        }
                    ],
                    max_tokens: 10
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                console.log(`✅ Endpoint ${endpoint} is working!`);
                const result = await response.json();
                console.log(`📝 Response: ${JSON.stringify(result, null, 2)}`);
                return endpoint;
            } else {
                console.log(`❌ Endpoint ${endpoint} failed: ${response.status}`);
            }
            
        } catch (error) {
            console.log(`❌ Endpoint ${endpoint} error: ${error.message}`);
        }
    }
    
    console.log('\n❌ No working completion endpoints found');
    return null;
}

// Run the test
testEndpoints().then(endpoint => {
    if (endpoint) {
        console.log(`\n🎯 Working endpoint found: ${endpoint}`);
        console.log('Update the AutomatedPromptService to use this endpoint');
    }
}).catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
}); 