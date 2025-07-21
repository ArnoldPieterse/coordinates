import fetch from 'node-fetch';

async function testLMStudio() {
    try {
        console.log('Testing LM Studio connection...');
        
        // Test models endpoint
        const modelsResponse = await fetch('http://localhost:1234/v1/models');
        if (modelsResponse.ok) {
            const models = await modelsResponse.json();
            console.log('✅ Models endpoint working:', models.data?.length || 0, 'models available');
            
            if (models.data && models.data.length > 0) {
                // Find a chat model (not embedding model)
                const chatModel = models.data.find(m => !m.id.includes('embedding')) || models.data[0];
                console.log('Using model:', chatModel.id);
                
                // Test chat completion
                const chatResponse = await fetch('http://localhost:1234/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: chatModel.id,
                        messages: [{ role: 'user', content: 'Hello' }],
                        max_tokens: 10,
                        temperature: 0.7
                    })
                });
                
                if (chatResponse.ok) {
                    const result = await chatResponse.json();
                    console.log('✅ Chat completion working:', result.choices?.[0]?.message?.content);
                } else {
                    console.log('❌ Chat completion failed:', chatResponse.status, chatResponse.statusText);
                }
            }
        } else {
            console.log('❌ Models endpoint failed:', modelsResponse.status, modelsResponse.statusText);
        }
    } catch (error) {
        console.error('❌ LM Studio test failed:', error.message);
    }
}

testLMStudio(); 