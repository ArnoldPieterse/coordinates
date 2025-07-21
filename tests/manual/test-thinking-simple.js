/**
 * Simple Agent Thinking Test
 * Basic verification of thinking API functionality
 */

async function testThinkingAPI() {
  console.log('🧠 SIMPLE AGENT THINKING API TEST\n');
  console.log('=' .repeat(50));
  
  const baseUrl = 'http://localhost:3001/api';
  
  async function testEndpoint(method, endpoint, body = null) {
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      if (body) options.body = JSON.stringify(body);
      
      const response = await fetch(`${baseUrl}${endpoint}`, options);
      const data = await response.json();
      
      return { success: response.ok, data, status: response.status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async function log(message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
    console.log('');
  }
  
  // Test 1: Spawn agent
  console.log('👾 TEST 1: Spawn Agent');
  console.log('-'.repeat(30));
  
  const spawnResult = await testEndpoint('POST', '/agents/spawn', { role: 'navigator' });
  if (!spawnResult.success) {
    console.log('❌ Failed to spawn agent');
    return;
  }
  
  const agent = spawnResult.data.agent;
  await log(`✅ Spawned ${agent.name}`, { id: agent.id, role: agent.role });
  
  // Test 2: Check initial thinking history
  console.log('🧠 TEST 2: Check Initial Thinking History');
  console.log('-'.repeat(30));
  
  const initialThinking = await testEndpoint('GET', `/agents/${agent.id}/thinking`);
  await log(`📊 Initial thinking history:`, {
    success: initialThinking.success,
    totalThoughts: initialThinking.success ? initialThinking.data.totalThoughts : 'N/A',
    thoughts: initialThinking.success ? initialThinking.data.thoughts.length : 'N/A'
  });
  
  // Test 3: Create job to trigger thinking
  console.log('📋 TEST 3: Create Job to Trigger Thinking');
  console.log('-'.repeat(30));
  
  const jobResult = await testEndpoint('POST', '/jobs/create', {
    type: 'pathfinding',
    description: 'Find optimal route to target',
    priority: 'high'
  });
  
  if (jobResult.success) {
    await log(`✅ Job created:`, {
      jobId: jobResult.data.job.id,
      status: jobResult.data.job.status,
      assignedTo: jobResult.data.job.assignedTo
    });
  }
  
  // Test 4: Wait and check thinking again
  console.log('⏳ TEST 4: Wait and Check Thinking Again');
  console.log('-'.repeat(30));
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const thinkingAfterJob = await testEndpoint('GET', `/agents/${agent.id}/thinking`);
  await log(`📊 Thinking after job:`, {
    success: thinkingAfterJob.success,
    totalThoughts: thinkingAfterJob.success ? thinkingAfterJob.data.totalThoughts : 'N/A',
    thoughts: thinkingAfterJob.success ? thinkingAfterJob.data.thoughts : 'N/A'
  });
  
  // Test 5: Test thinking analysis
  console.log('📈 TEST 5: Test Thinking Analysis');
  console.log('-'.repeat(30));
  
  const analysisResult = await testEndpoint('GET', `/agents/${agent.id}/thinking/analysis`);
  await log(`📊 Analysis result:`, {
    success: analysisResult.success,
    analysis: analysisResult.success ? analysisResult.data.analysis : 'N/A'
  });
  
  // Test 6: Test thinking simulation
  console.log('🎭 TEST 6: Test Thinking Simulation');
  console.log('-'.repeat(30));
  
  const simulationResult = await testEndpoint('POST', `/agents/${agent.id}/thinking/simulate`, {
    scenario: 'Test scenario',
    jobType: 'pathfinding',
    context: 'Test context'
  });
  
  await log(`📊 Simulation result:`, {
    success: simulationResult.success,
    simulatedThoughts: simulationResult.success ? simulationResult.data.simulatedThoughts : 'N/A'
  });
  
  // Test 7: Test global thinking
  console.log('🌍 TEST 7: Test Global Thinking');
  console.log('-'.repeat(30));
  
  const globalResult = await testEndpoint('GET', '/agents/thinking/global?limit=5');
  await log(`📊 Global thinking:`, {
    success: globalResult.success,
    totalThoughts: globalResult.success ? globalResult.data.totalThoughts : 'N/A',
    thoughts: globalResult.success ? globalResult.data.thoughts.length : 'N/A'
  });
  
  console.log('🎉 SIMPLE THINKING API TEST COMPLETED');
  console.log('=' .repeat(50));
}

// Run the test
testThinkingAPI(); 