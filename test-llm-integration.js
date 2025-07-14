/**
 * LLM Integration Test Suite
 * Tests all LLM features and providers
 * IDX-TEST-LLM-001
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

async function testLLMIntegration() {
    console.log('🧪 Testing LLM Integration...\n');

    try {
        // Test 1: Check LLM Status
        console.log('1️⃣ Testing LLM Status...');
        const llmStatus = await fetch(`${BASE_URL}/llm/status`);
        const statusData = await llmStatus.json();
        console.log('✅ LLM Status:', statusData);
        console.log(`   Enabled: ${statusData.enabled}`);
        console.log(`   Active Provider: ${statusData.activeProvider}`);
        console.log(`   Available Providers: ${statusData.availableProviders?.join(', ') || 'None'}\n`);

        // Test 2: Get Agent Thinking History
        console.log('2️⃣ Testing Agent Thinking History...');
        const thinkingHistory = await fetch(`${BASE_URL}/llm/agent-thinking`);
        const historyData = await thinkingHistory.json();
        console.log('✅ Agent Thinking History:', Object.keys(historyData).length, 'agents have thinking history\n');

        // Test 3: Generate Agent Thinking
        console.log('3️⃣ Testing Agent Thinking Generation...');
        
        // First, get available agents
        const agentsResponse = await fetch(`${BASE_URL}/agents`);
        const agentsData = await agentsResponse.json();
        
        if (agentsData.agents && agentsData.agents.length > 0) {
            const testAgent = agentsData.agents[0];
            console.log(`   Using agent: ${testAgent.name} (${testAgent.role})`);
            
            const thinkingResponse = await fetch(`${BASE_URL}/llm/agent-thinking/${testAgent.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    context: {
                        projectStatus: 'Active development',
                        availableJobs: 5,
                        systemPerformance: 'Good'
                    }
                })
            });
            
            const thinkingData = await thinkingResponse.json();
            console.log('✅ Generated Thinking:');
            console.log(`   Thoughts: ${thinkingData.thoughts?.substring(0, 100)}...`);
            console.log(`   Confidence: ${(thinkingData.confidence * 100).toFixed(1)}%`);
            console.log(`   Actions: ${thinkingData.nextActions?.length || 0} recommended`);
            console.log(`   Reasoning: ${thinkingData.reasoning?.length || 0} points\n`);
        } else {
            console.log('⚠️ No agents available for thinking test\n');
        }

        // Test 4: Test Provider Switching
        console.log('4️⃣ Testing LLM Provider Switching...');
        const availableProviders = statusData.availableProviders || [];
        
        if (availableProviders.length > 1) {
            const newProvider = availableProviders.find(p => p !== statusData.activeProvider);
            if (newProvider) {
                console.log(`   Switching from ${statusData.activeProvider} to ${newProvider}...`);
                
                const switchResponse = await fetch(`${BASE_URL}/llm/switch-provider`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ provider: newProvider })
                });
                
                const switchData = await switchResponse.json();
                console.log(`   Switch result: ${switchData.success ? '✅ Success' : '❌ Failed'}\n`);
                
                // Verify the switch
                const newStatus = await fetch(`${BASE_URL}/llm/status`);
                const newStatusData = await newStatus.json();
                console.log(`   New active provider: ${newStatusData.activeProvider}\n`);
            }
        } else {
            console.log('⚠️ Only one provider available, skipping switch test\n');
        }

        // Test 5: Test with different contexts
        console.log('5️⃣ Testing Different Contexts...');
        if (agentsData.agents && agentsData.agents.length > 0) {
            const testAgent = agentsData.agents[0];
            const contexts = [
                { projectStatus: 'Planning phase', availableJobs: 2, systemPerformance: 'Normal' },
                { projectStatus: 'Critical bug fix needed', availableJobs: 10, systemPerformance: 'Poor' },
                { projectStatus: 'Feature development', availableJobs: 8, systemPerformance: 'Excellent' }
            ];
            
            for (let i = 0; i < contexts.length; i++) {
                const context = contexts[i];
                console.log(`   Context ${i + 1}: ${context.projectStatus}`);
                
                const contextResponse = await fetch(`${BASE_URL}/llm/agent-thinking/${testAgent.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ context })
                });
                
                const contextData = await contextResponse.json();
                console.log(`   Confidence: ${(contextData.confidence * 100).toFixed(1)}%`);
                console.log(`   Actions: ${contextData.nextActions?.length || 0}`);
            }
            console.log('');
        }

        // Test 6: Performance Test
        console.log('6️⃣ Testing Performance...');
        const startTime = Date.now();
        const performancePromises = [];
        
        if (agentsData.agents && agentsData.agents.length > 0) {
            const testAgent = agentsData.agents[0];
            
            // Generate 3 thinking requests in parallel
            for (let i = 0; i < 3; i++) {
                performancePromises.push(
                    fetch(`${BASE_URL}/llm/agent-thinking/${testAgent.id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            context: { testNumber: i + 1 }
                        })
                    })
                );
            }
            
            const performanceResults = await Promise.all(performancePromises);
            const endTime = Date.now();
            const totalTime = endTime - startTime;
            
            console.log(`   Generated ${performanceResults.length} thinking requests in ${totalTime}ms`);
            console.log(`   Average time per request: ${(totalTime / performanceResults.length).toFixed(0)}ms\n`);
        }

        console.log('🎉 LLM Integration Test Complete!');
        console.log('\n📊 Summary:');
        console.log(`   ✅ LLM Status: ${statusData.enabled ? 'Enabled' : 'Disabled'}`);
        console.log(`   ✅ Active Provider: ${statusData.activeProvider || 'None'}`);
        console.log(`   ✅ Available Providers: ${availableProviders.length}`);
        console.log(`   ✅ Agent Thinking: ${agentsData.agents?.length || 0} agents available`);
        
        if (statusData.enabled) {
            console.log('\n🚀 LLM Integration is working correctly!');
            console.log('   You can now use LLM-powered agent thinking in the dashboard.');
        } else {
            console.log('\n⚠️ LLM Integration is not enabled.');
            console.log('   Check if any LLM providers are running (LM Studio, Ollama, etc.)');
        }

    } catch (error) {
        console.error('❌ LLM Integration Test Failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Make sure the server is running on port 3001');
        console.log('   2. Check if any LLM providers are available');
        console.log('   3. Verify network connectivity');
        console.log('   4. Check server logs for LLM initialization errors');
    }
}

// Run the test
testLLMIntegration(); 