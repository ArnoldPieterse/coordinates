/**
 * Frontend API Connection Test
 * Tests if the frontend can connect to the backend APIs
 */

const BASE_URL = 'http://localhost:3001';

// Test the AI dashboard API endpoints
async function testAIDashboardAPIs() {
    console.log('🧪 Testing AI Dashboard API Connections...');
    
    try {
        // Test 1: Get all agents
        console.log('\n1. Testing GET /api/agents...');
        const agentsResponse = await fetch(`${BASE_URL}/api/agents`);
        const agentsData = await agentsResponse.json();
        console.log(`✅ Found ${agentsData.agents.length} agents`);
        
        // Test 2: Get all jobs
        console.log('\n2. Testing GET /api/jobs...');
        const jobsResponse = await fetch(`${BASE_URL}/api/jobs`);
        const jobsData = await jobsResponse.json();
        console.log(`✅ Found ${jobsData.jobs.length} jobs`);
        
        // Test 3: Get LLM status
        console.log('\n3. Testing GET /api/llm/status...');
        const llmResponse = await fetch(`${BASE_URL}/api/llm/status`);
        const llmData = await llmResponse.json();
        console.log(`✅ LLM Status: ${llmData.enabled ? 'Enabled' : 'Disabled'}`);
        
        // Test 4: Get agent thinking history
        if (agentsData.agents.length > 0) {
            console.log('\n4. Testing GET /api/agents/:id/thinking...');
            const agentId = agentsData.agents[0].id;
            const thinkingResponse = await fetch(`${BASE_URL}/api/agents/${agentId}/thinking`);
            const thinkingData = await thinkingResponse.json();
            console.log(`✅ Agent ${agentId} has ${thinkingData.thinkingHistory.length} thinking records`);
        }
        
        // Test 5: Create a test job
        console.log('\n5. Testing POST /api/jobs...');
        const createJobResponse = await fetch(`${BASE_URL}/api/jobs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'tactical_analysis',
                description: 'Test job for frontend connection',
                data: { test: true },
                priority: 'medium'
            })
        });
        const createJobData = await createJobResponse.json();
        console.log(`✅ Created job: ${createJobData.job.id}`);
        
        // Test 6: Spawn a test agent
        console.log('\n6. Testing POST /api/agents/spawn...');
        const spawnAgentResponse = await fetch(`${BASE_URL}/api/agents/spawn`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                role: 'scout'
            })
        });
        const spawnAgentData = await spawnAgentResponse.json();
        console.log(`✅ Spawned agent: ${spawnAgentData.agent.id}`);
        
        console.log('\n🎉 All AI Dashboard API tests passed!');
        console.log('The frontend should be able to connect to all backend APIs successfully.');
        
        return {
            agents: agentsData.agents.length,
            jobs: jobsData.jobs.length,
            llmEnabled: llmData.enabled,
            testJobCreated: createJobData.success,
            testAgentSpawned: spawnAgentData.success
        };
        
    } catch (error) {
        console.error('❌ API test failed:', error.message);
        return null;
    }
}

// Test the game API endpoints
async function testGameAPIs() {
    console.log('\n🧪 Testing Game API Connections...');
    
    try {
        // Test 1: Health check
        console.log('\n1. Testing GET /api/health...');
        const healthResponse = await fetch(`${BASE_URL}/api/health`);
        const healthData = await healthResponse.json();
        console.log(`✅ Health: ${healthData.status}`);
        
        // Test 2: Status
        console.log('\n2. Testing GET /api/status...');
        const statusResponse = await fetch(`${BASE_URL}/api/status`);
        const statusData = await statusResponse.json();
        console.log(`✅ Status: ${statusData.status}`);
        
        console.log('\n🎉 All Game API tests passed!');
        
        return {
            health: healthData.status,
            status: statusData.status,
            players: statusData.players
        };
        
    } catch (error) {
        console.error('❌ Game API test failed:', error.message);
        return null;
    }
}

// Test Socket.IO connection
async function testSocketIO() {
    console.log('\n🧪 Testing Socket.IO Connection...');
    
    try {
        // Note: Socket.IO testing requires a client library
        // This is a basic connectivity test
        const response = await fetch(`${BASE_URL}/socket.io/`);
        console.log(`✅ Socket.IO endpoint accessible: ${response.status}`);
        
        return true;
    } catch (error) {
        console.error('❌ Socket.IO test failed:', error.message);
        return false;
    }
}

// Main test runner
async function runFrontendAPITests() {
    console.log('🚀 Starting Frontend API Connection Tests...');
    console.log('=' * 60);
    
    const results = {
        aiDashboard: null,
        gameAPIs: null,
        socketIO: false
    };
    
    try {
        results.aiDashboard = await testAIDashboardAPIs();
        results.gameAPIs = await testGameAPIs();
        results.socketIO = await testSocketIO();
        
    } catch (error) {
        console.error('❌ Test suite error:', error);
    }
    
    // Results summary
    console.log('\n' + '=' * 60);
    console.log('📊 Frontend API Test Results:');
    console.log('=' * 60);
    
    if (results.aiDashboard) {
        console.log('✅ AI Dashboard APIs: Working');
        console.log(`   - Agents: ${results.aiDashboard.agents}`);
        console.log(`   - Jobs: ${results.aiDashboard.jobs}`);
        console.log(`   - LLM: ${results.aiDashboard.llmEnabled ? 'Enabled' : 'Disabled'}`);
        console.log(`   - Test Job: ${results.aiDashboard.testJobCreated ? 'Created' : 'Failed'}`);
        console.log(`   - Test Agent: ${results.aiDashboard.testAgentSpawned ? 'Spawned' : 'Failed'}`);
    } else {
        console.log('❌ AI Dashboard APIs: Failed');
    }
    
    if (results.gameAPIs) {
        console.log('✅ Game APIs: Working');
        console.log(`   - Health: ${results.gameAPIs.health}`);
        console.log(`   - Status: ${results.gameAPIs.status}`);
        console.log(`   - Players: ${results.gameAPIs.players}`);
    } else {
        console.log('❌ Game APIs: Failed');
    }
    
    console.log(`Socket.IO: ${results.socketIO ? '✅ Working' : '❌ Failed'}`);
    
    console.log('\n' + '=' * 60);
    
    const allWorking = results.aiDashboard && results.gameAPIs && results.socketIO;
    
    if (allWorking) {
        console.log('🎉 All frontend API connections are working!');
        console.log('The frontend should be able to connect to the backend successfully.');
    } else {
        console.log('⚠️ Some API connections failed. Check the logs above for details.');
    }
    
    return results;
}

// Run the tests
runFrontendAPITests().catch(console.error); 