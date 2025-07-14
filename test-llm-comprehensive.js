/**
 * Comprehensive LLM Integration Test Suite
 * Tests all LLM endpoints, agent thinking, and system functionality
 * IDX-TEST-LLM-001: Comprehensive LLM Testing
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';
const TEST_TIMEOUT = 30000; // 30 seconds

// Test configuration
const TEST_CONFIG = {
    verbose: true,
    parallel: false,
    timeout: TEST_TIMEOUT
};

// Test results tracking
let testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
};

function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
}

async function runTest(testName, testFunction) {
    testResults.total++;
    log(`Running test: ${testName}`, 'info');
    
    try {
        const startTime = Date.now();
        const result = await Promise.race([
            testFunction(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Test timeout')), TEST_TIMEOUT)
            )
        ]);
        const duration = Date.now() - startTime;
        
        testResults.passed++;
        log(`✅ ${testName} passed (${duration}ms)`, 'success');
        testResults.details.push({ name: testName, status: 'passed', duration, result });
        return result;
    } catch (error) {
        testResults.failed++;
        log(`❌ ${testName} failed: ${error.message}`, 'error');
        testResults.details.push({ name: testName, status: 'failed', error: error.message });
        throw error;
    }
}

// ===== LLM SERVICE TESTS =====

async function testLLMServiceStatus() {
    const response = await fetch(`${BASE_URL}/api/llm/status`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    
    const data = await response.json();
    log(`LLM Status: ${JSON.stringify(data, null, 2)}`, 'info');
    
    if (!data.services || !Array.isArray(data.services)) {
        throw new Error('Invalid LLM status response format');
    }
    
    return data;
}

async function testLLMProviders() {
    const response = await fetch(`${BASE_URL}/api/llm/providers`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    
    const data = await response.json();
    log(`Available providers: ${JSON.stringify(data, null, 2)}`, 'info');
    
    if (!data.providers || !Array.isArray(data.providers)) {
        throw new Error('Invalid providers response format');
    }
    
    return data;
}

async function testLLMGeneration() {
    const testPrompt = "Generate a brief analysis of the current project status";
    
    const response = await fetch(`${BASE_URL}/api/llm/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: testPrompt,
            options: {
                maxTokens: 100,
                temperature: 0.7
            }
        })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    
    const data = await response.json();
    log(`LLM Generation: ${JSON.stringify(data, null, 2)}`, 'info');
    
    if (!data.text || !data.provider) {
        throw new Error('Invalid generation response format');
    }
    
    return data;
}

async function testLLMSwitch() {
    const response = await fetch(`${BASE_URL}/api/llm/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'ollama' })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    
    const data = await response.json();
    log(`LLM Switch: ${JSON.stringify(data, null, 2)}`, 'info');
    
    return data;
}

// ===== AGENT THINKING TESTS =====

async function testAgentThinking() {
    const response = await fetch(`${BASE_URL}/api/agents/thinking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            agentId: 'agent_1',
            context: {
                jobType: 'tactical_analysis',
                scenario: 'enemy_encounter',
                priority: 'high'
            }
        })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    
    const data = await response.json();
    log(`Agent Thinking: ${JSON.stringify(data, null, 2)}`, 'info');
    
    if (!data.thinking || !data.agentId) {
        throw new Error('Invalid thinking response format');
    }
    
    return data;
}

async function testThinkingHistory() {
    const response = await fetch(`${BASE_URL}/api/agents/thinking/history/agent_1`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    
    const data = await response.json();
    log(`Thinking History: ${JSON.stringify(data, null, 2)}`, 'info');
    
    if (!data.history || !Array.isArray(data.history)) {
        throw new Error('Invalid thinking history response format');
    }
    
    return data;
}

async function testThinkingAnalysis() {
    const response = await fetch(`${BASE_URL}/api/agents/thinking/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            agentId: 'agent_1',
            analysisType: 'confidence'
        })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    
    const data = await response.json();
    log(`Thinking Analysis: ${JSON.stringify(data, null, 2)}`, 'info');
    
    return data;
}

async function testGlobalThoughts() {
    const response = await fetch(`${BASE_URL}/api/agents/thinking/global`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    
    const data = await response.json();
    log(`Global Thoughts: ${JSON.stringify(data, null, 2)}`, 'info');
    
    if (!data.thoughts || !Array.isArray(data.thoughts)) {
        throw new Error('Invalid global thoughts response format');
    }
    
    return data;
}

// ===== AGENT MANAGEMENT TESTS =====

async function testAgentSpawn() {
    const response = await fetch(`${BASE_URL}/api/agents/spawn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'strategist' })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    
    const data = await response.json();
    log(`Agent Spawn: ${JSON.stringify(data, null, 2)}`, 'info');
    
    if (!data.agent || !data.agent.id) {
        throw new Error('Invalid agent spawn response format');
    }
    
    return data;
}

async function testJobCreation() {
    const response = await fetch(`${BASE_URL}/api/jobs/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'tactical_analysis',
            priority: 'high',
            description: 'Analyze current combat situation',
            estimatedDuration: 5
        })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    
    const data = await response.json();
    log(`Job Creation: ${JSON.stringify(data, null, 2)}`, 'info');
    
    if (!data.job || !data.job.id) {
        throw new Error('Invalid job creation response format');
    }
    
    return data;
}

async function testSystemStatus() {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    
    const data = await response.json();
    log(`System Status: ${JSON.stringify(data, null, 2)}`, 'info');
    
    if (!data.status || data.status !== 'healthy') {
        throw new Error('System not healthy');
    }
    
    return data;
}

// ===== MAIN TEST EXECUTION =====

async function runAllTests() {
    log('🚀 Starting Comprehensive LLM Integration Test Suite', 'info');
    log(`Base URL: ${BASE_URL}`, 'info');
    log(`Timeout: ${TEST_TIMEOUT}ms`, 'info');
    
    try {
        // System health check
        await runTest('System Health Check', testSystemStatus);
        
        // LLM Service tests
        await runTest('LLM Service Status', testLLMServiceStatus);
        await runTest('LLM Providers', testLLMProviders);
        await runTest('LLM Generation', testLLMGeneration);
        await runTest('LLM Provider Switch', testLLMSwitch);
        
        // Agent thinking tests
        await runTest('Agent Thinking', testAgentThinking);
        await runTest('Thinking History', testThinkingHistory);
        await runTest('Thinking Analysis', testThinkingAnalysis);
        await runTest('Global Thoughts', testGlobalThoughts);
        
        // Agent management tests
        await runTest('Agent Spawn', testAgentSpawn);
        await runTest('Job Creation', testJobCreation);
        
    } catch (error) {
        log(`Test suite failed: ${error.message}`, 'error');
    }
    
    // Print summary
    log('\n📊 Test Summary:', 'info');
    log(`Total Tests: ${testResults.total}`, 'info');
    log(`Passed: ${testResults.passed}`, 'success');
    log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success');
    log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, 'info');
    
    if (testResults.failed > 0) {
        log('\n❌ Failed Tests:', 'error');
        testResults.details
            .filter(test => test.status === 'failed')
            .forEach(test => log(`  - ${test.name}: ${test.error}`, 'error'));
    }
    
    if (testResults.passed > 0) {
        log('\n✅ Passed Tests:', 'success');
        testResults.details
            .filter(test => test.status === 'passed')
            .forEach(test => log(`  - ${test.name} (${test.duration}ms)`, 'success'));
    }
    
    return testResults;
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests().then(results => {
        process.exit(results.failed > 0 ? 1 : 0);
    }).catch(error => {
        log(`Test suite execution failed: ${error.message}`, 'error');
        process.exit(1);
    });
}

export { runAllTests, testResults }; 