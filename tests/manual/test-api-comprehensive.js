/**
 * Comprehensive API Test Suite for AI Agent System
 * Tests all endpoints and functionality
 */

const BASE_URL = 'http://localhost:3001';

// Test utilities
function log(message, data = null) {
    console.log(`[${new Date().toISOString()}] ${message}`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
}

async function makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    const requestOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, requestOptions);
        const data = await response.json();
        
        return {
            success: response.ok,
            status: response.status,
            data
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Test functions
async function testHealthCheck() {
    log('🧪 Testing Health Check...');
    const result = await makeRequest('/api/health');
    
    if (result.success && result.data.status === 'healthy') {
        log('✅ Health check passed', result.data);
        return true;
    } else {
        log('❌ Health check failed', result);
        return false;
    }
}

async function testStatus() {
    log('🧪 Testing Status Endpoint...');
    const result = await makeRequest('/api/status');
    
    if (result.success && result.data.status === 'running') {
        log('✅ Status endpoint passed', result.data);
        return true;
    } else {
        log('❌ Status endpoint failed', result);
        return false;
    }
}

async function testGetAgents() {
    log('🧪 Testing Get Agents...');
    const result = await makeRequest('/api/agents');
    
    if (result.success && Array.isArray(result.data.agents)) {
        log(`✅ Get agents passed - Found ${result.data.agents.length} agents`, result.data.agents);
        return result.data.agents;
    } else {
        log('❌ Get agents failed', result);
        return [];
    }
}

async function testSpawnAgent() {
    log('🧪 Testing Spawn Agent...');
    const result = await makeRequest('/api/agents/spawn', {
        method: 'POST',
        body: JSON.stringify({
            role: 'navigator'
        })
    });
    
    if (result.success && result.data.success) {
        log('✅ Spawn agent passed', result.data.agent);
        return result.data.agent;
    } else {
        log('❌ Spawn agent failed', result);
        return null;
    }
}

async function testGetAgent(agentId) {
    log(`🧪 Testing Get Agent ${agentId}...`);
    const result = await makeRequest(`/api/agents/${agentId}`);
    
    if (result.success && result.data.agent) {
        log('✅ Get agent passed', result.data.agent);
        return result.data.agent;
    } else {
        log('❌ Get agent failed', result);
        return null;
    }
}

async function testUpgradeAgent(agentId) {
    log(`🧪 Testing Upgrade Agent ${agentId}...`);
    const result = await makeRequest(`/api/agents/${agentId}/upgrade`, {
        method: 'POST',
        body: JSON.stringify({
            capability: 'advanced_navigation',
            rating: 0.2
        })
    });
    
    if (result.success && result.data.success) {
        log('✅ Upgrade agent passed', result.data.agent);
        return result.data.agent;
    } else {
        log('❌ Upgrade agent failed', result);
        return null;
    }
}

async function testCreateJob() {
    log('🧪 Testing Create Job...');
    const result = await makeRequest('/api/jobs', {
        method: 'POST',
        body: JSON.stringify({
            type: 'pathfinding',
            description: 'Find optimal route to target location',
            data: { target: { x: 100, y: 50, z: 200 } },
            priority: 'high'
        })
    });
    
    if (result.success && result.data.success) {
        log('✅ Create job passed', result.data.job);
        return result.data.job;
    } else {
        log('❌ Create job failed', result);
        return null;
    }
}

async function testGetJobs() {
    log('🧪 Testing Get Jobs...');
    const result = await makeRequest('/api/jobs');
    
    if (result.success && Array.isArray(result.data.jobs)) {
        log(`✅ Get jobs passed - Found ${result.data.jobs.length} jobs`, result.data.jobs);
        return result.data.jobs;
    } else {
        log('❌ Get jobs failed', result);
        return [];
    }
}

async function testGetJob(jobId) {
    log(`🧪 Testing Get Job ${jobId}...`);
    const result = await makeRequest(`/api/jobs/${jobId}`);
    
    if (result.success && result.data.job) {
        log('✅ Get job passed', result.data.job);
        return result.data.job;
    } else {
        log('❌ Get job failed', result);
        return null;
    }
}

async function testLLMStatus() {
    log('🧪 Testing LLM Status...');
    const result = await makeRequest('/api/llm/status');
    
    if (result.success) {
        log('✅ LLM status passed', result.data);
        return result.data;
    } else {
        log('❌ LLM status failed', result);
        return null;
    }
}

async function testLLMGenerate() {
    log('🧪 Testing LLM Generate...');
    const result = await makeRequest('/api/llm/generate', {
        method: 'POST',
        body: JSON.stringify({
            prompt: 'Hello, how are you?',
            maxTokens: 50
        })
    });
    
    if (result.success) {
        log('✅ LLM generate passed', result.data);
        return result.data;
    } else {
        log('❌ LLM generate failed', result);
        return null;
    }
}

async function testGetAgentThinking(agentId) {
    log(`🧪 Testing Get Agent Thinking ${agentId}...`);
    const result = await makeRequest(`/api/agents/${agentId}/thinking`);
    
    if (result.success) {
        log('✅ Get agent thinking passed', result.data);
        return result.data;
    } else {
        log('❌ Get agent thinking failed', result);
        return null;
    }
}

async function testAddAgentThinking(agentId) {
    log(`🧪 Testing Add Agent Thinking ${agentId}...`);
    const result = await makeRequest(`/api/agents/${agentId}/thinking`, {
        method: 'POST',
        body: JSON.stringify({
            thought: 'I should analyze the current situation more carefully',
            reasoning: 'The complexity of the task requires deeper analysis',
            confidence: 0.8,
            context: { phase: 'analysis', priority: 'high' }
        })
    });
    
    if (result.success && result.data.success) {
        log('✅ Add agent thinking passed', result.data.thinkingRecord);
        return result.data.thinkingRecord;
    } else {
        log('❌ Add agent thinking failed', result);
        return null;
    }
}

async function testJobProgress() {
    log('🧪 Testing Job Progress Simulation...');
    
    // Create a job
    const job = await testCreateJob();
    if (!job) return false;
    
    // Wait for job to be assigned and progress
    log('⏳ Waiting for job progress...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check job status
    const updatedJob = await testGetJob(job.id);
    if (updatedJob && updatedJob.progress > 0) {
        log('✅ Job progress simulation passed', { 
            originalProgress: job.progress, 
            currentProgress: updatedJob.progress 
        });
        return true;
    } else {
        log('❌ Job progress simulation failed');
        return false;
    }
}

async function testAgentWorkflow() {
    log('🧪 Testing Complete Agent Workflow...');
    
    // Get initial agents
    const initialAgents = await testGetAgents();
    if (initialAgents.length === 0) return false;
    
    // Spawn a new agent
    const newAgent = await testSpawnAgent();
    if (!newAgent) return false;
    
    // Upgrade the agent
    const upgradedAgent = await testUpgradeAgent(newAgent.id);
    if (!upgradedAgent) return false;
    
    // Create a job
    const job = await testCreateJob();
    if (!job) return false;
    
    // Wait for job processing
    log('⏳ Waiting for job processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check final status
    const finalJob = await testGetJob(job.id);
    const finalAgent = await testGetAgent(newAgent.id);
    
    if (finalJob && finalAgent) {
        log('✅ Complete agent workflow passed', {
            jobStatus: finalJob.status,
            agentStatus: finalAgent.status,
            agentJobsCompleted: finalAgent.jobsCompleted
        });
        return true;
    } else {
        log('❌ Complete agent workflow failed');
        return false;
    }
}

async function testThinkingHistory() {
    log('🧪 Testing Thinking History...');
    
    // Get an agent
    const agents = await testGetAgents();
    if (agents.length === 0) return false;
    
    const agent = agents[0];
    
    // Add thinking record
    const thinkingRecord = await testAddAgentThinking(agent.id);
    if (!thinkingRecord) return false;
    
    // Get thinking history
    const thinkingHistory = await testGetAgentThinking(agent.id);
    if (!thinkingHistory) return false;
    
    if (thinkingHistory.thinkingHistory && thinkingHistory.thinkingHistory.length > 0) {
        log('✅ Thinking history test passed', {
            agentId: agent.id,
            thinkingCount: thinkingHistory.thinkingHistory.length,
            latestThought: thinkingHistory.thinkingHistory[thinkingHistory.thinkingHistory.length - 1]
        });
        return true;
    } else {
        log('❌ Thinking history test failed');
        return false;
    }
}

// Main test runner
async function runAllTests() {
    log('🚀 Starting Comprehensive API Test Suite...');
    log('=' * 60);
    
    const results = {
        healthCheck: false,
        status: false,
        getAgents: false,
        spawnAgent: false,
        getAgent: false,
        upgradeAgent: false,
        createJob: false,
        getJobs: false,
        getJob: false,
        llmStatus: false,
        llmGenerate: false,
        getAgentThinking: false,
        addAgentThinking: false,
        jobProgress: false,
        agentWorkflow: false,
        thinkingHistory: false
    };
    
    try {
        // Basic health checks
        results.healthCheck = await testHealthCheck();
        results.status = await testStatus();
        
        // Agent tests
        const agents = await testGetAgents();
        results.getAgents = agents.length > 0;
        
        const newAgent = await testSpawnAgent();
        results.spawnAgent = newAgent !== null;
        
        if (newAgent) {
            results.getAgent = await testGetAgent(newAgent.id) !== null;
            results.upgradeAgent = await testUpgradeAgent(newAgent.id) !== null;
        }
        
        // Job tests
        const job = await testCreateJob();
        results.createJob = job !== null;
        
        const jobs = await testGetJobs();
        results.getJobs = jobs.length > 0;
        
        if (job) {
            results.getJob = await testGetJob(job.id) !== null;
        }
        
        // LLM tests
        results.llmStatus = await testLLMStatus() !== null;
        results.llmGenerate = await testLLMGenerate() !== null;
        
        // Thinking tests
        if (agents.length > 0) {
            results.getAgentThinking = await testGetAgentThinking(agents[0].id) !== null;
            results.addAgentThinking = await testAddAgentThinking(agents[0].id) !== null;
        }
        
        // Complex workflow tests
        results.jobProgress = await testJobProgress();
        results.agentWorkflow = await testAgentWorkflow();
        results.thinkingHistory = await testThinkingHistory();
        
    } catch (error) {
        log('❌ Test suite error:', error);
    }
    
    // Results summary
    log('=' * 60);
    log('📊 Test Results Summary:');
    log('=' * 60);
    
    const passed = Object.values(results).filter(r => r).length;
    const total = Object.keys(results).length;
    
    Object.entries(results).forEach(([test, result]) => {
        const status = result ? '✅ PASS' : '❌ FAIL';
        log(`${status} ${test}`);
    });
    
    log('=' * 60);
    log(`🎯 Overall Result: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    
    if (passed === total) {
        log('🎉 All tests passed! The AI agent system is working correctly.');
    } else {
        log('⚠️ Some tests failed. Check the logs above for details.');
    }
    
    return results;
}

// Run the tests
runAllTests().catch(console.error); 