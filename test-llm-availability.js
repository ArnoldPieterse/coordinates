#!/usr/bin/env node

/**
 * Test LLM Availability
 * Simple test to check if the local LLM is available
 */

const llmUrl = 'http://10.3.129.26:1234';

async function testLLMAvailability() {
    console.log('🔍 TESTING LLM AVAILABILITY');
    console.log('============================');
    console.log(`Testing LLM at: ${llmUrl}\n`);

    try {
        // Test 1: Check if LLM is reachable
        console.log('📡 Test 1: Checking LLM connectivity...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(`${llmUrl}/v1/models`, {
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            console.log('✅ LLM is reachable');
            
            const models = await response.json();
            console.log(`📋 Available models: ${models.data?.length || 0}`);
            
            if (models.data && models.data.length > 0) {
                console.log('📝 Model details:');
                models.data.forEach((model, index) => {
                    console.log(`  ${index + 1}. ${model.id}`);
                });
            }
            
            // Test 2: Try a simple completion
            console.log('\n🧪 Test 2: Testing simple completion...');
            const testPrompt = {
                model: models.data?.[0]?.id || 'unknown',
                messages: [
                    {
                        role: 'user',
                        content: 'Hello, can you respond with "LLM is working" if you receive this message?'
                    }
                ],
                max_tokens: 50,
                temperature: 0.7
            };
            
            const completionResponse = await fetch(`${llmUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testPrompt),
                signal: controller.signal
            });
            
            if (completionResponse.ok) {
                const result = await completionResponse.json();
                console.log('✅ Completion test successful');
                console.log(`📝 Response: ${result.choices?.[0]?.message?.content || 'No response'}`);
            } else {
                console.log(`❌ Completion test failed: ${completionResponse.status}`);
            }
            
        } else {
            console.log(`❌ LLM error: ${response.status} ${response.statusText}`);
        }
        
    } catch (error) {
        console.log(`❌ LLM unavailable: ${error.message}`);
        
        if (error.name === 'AbortError') {
            console.log('⏱️ Request timed out after 10 seconds');
        }
    }
    
    console.log('\n📊 SUMMARY');
    console.log('===========');
    console.log('LLM Status: Check the results above');
    console.log('Next Steps:');
    console.log('1. If LLM is available, the automated prompt service should work');
    console.log('2. If LLM is unavailable, check the LLM server at http://10.3.129.26:1234');
    console.log('3. Ensure the LLM server is running and accessible');
}

// Run the test
testLLMAvailability().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
}); 