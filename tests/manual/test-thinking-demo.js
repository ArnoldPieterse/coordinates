/**
 * Agent Thinking History Demo
 * Focused demonstration of thinking history functionality
 */

async function demonstrateThinkingHistory() {
  console.log('🧠 AGENT THINKING HISTORY DEMONSTRATION\n');
  console.log('=' .repeat(60));
  
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
  
  // Step 1: Spawn a test agent
  console.log('👾 STEP 1: Spawning Test Agent');
  console.log('-'.repeat(40));
  
  const spawnResult = await testEndpoint('POST', '/agents/spawn', { role: 'strategist' });
  if (!spawnResult.success) {
    console.log('❌ Failed to spawn agent');
    return;
  }
  
  const agent = spawnResult.data.agent;
  await log(`✅ Spawned ${agent.name} (${agent.role})`, {
    id: agent.id,
    capabilities: agent.capabilities,
    rating: agent.rating
  });
  
  // Step 2: Create a job to generate thinking
  console.log('📋 STEP 2: Creating Job to Generate Thinking');
  console.log('-'.repeat(40));
  
  const jobResult = await testEndpoint('POST', '/jobs/create', {
    type: 'tactical_analysis',
    description: 'Analyze enemy defensive positions and recommend attack strategy',
    priority: 'high'
  });
  
  if (jobResult.success) {
    await log(`✅ Created job: ${jobResult.data.job.description}`, {
      jobId: jobResult.data.job.id,
      status: jobResult.data.job.status,
      assignedTo: jobResult.data.job.assignedTo
    });
  }
  
  // Step 3: Wait for thinking to occur
  console.log('⏳ STEP 3: Waiting for Agent to Generate Thinking');
  console.log('-'.repeat(40));
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Step 4: Retrieve thinking history
  console.log('🧠 STEP 4: Retrieving Agent Thinking History');
  console.log('-'.repeat(40));
  
  const thinkingResult = await testEndpoint('GET', `/agents/${agent.id}/thinking`);
  if (thinkingResult.success) {
    await log(`📊 Thinking History for ${agent.name}:`, {
      totalThoughts: thinkingResult.data.totalThoughts,
      thoughts: thinkingResult.data.thoughts.map(t => ({
        id: t.id,
        type: t.type,
        thought: t.thought,
        reasoning: t.reasoning,
        confidence: t.confidence,
        timestamp: new Date(t.timestamp).toLocaleTimeString(),
        context: t.context
      }))
    });
  }
  
  // Step 5: Get thinking analysis
  console.log('📈 STEP 5: Analyzing Agent Thinking Patterns');
  console.log('-'.repeat(40));
  
  const analysisResult = await testEndpoint('GET', `/agents/${agent.id}/thinking/analysis`);
  if (analysisResult.success) {
    const analysis = analysisResult.data.analysis;
    await log(`📊 Thinking Analysis for ${agent.name}:`, {
      'Total Thoughts': analysis.totalThoughts,
      'Thought Types': analysis.thoughtTypes,
      'Average Confidence': analysis.avgConfidence?.toFixed(2),
      'Decision Quality': analysis.decisionQuality?.toFixed(2),
      'Thinking Patterns': analysis.thinkingPatterns,
      'Learning Progress': `${analysis.learningProgress?.toFixed(1)}%`,
      'Recommendations': analysis.recommendations
    });
  }
  
  // Step 6: Simulate thinking for different scenarios
  console.log('🎭 STEP 6: Simulating Agent Thinking');
  console.log('-'.repeat(40));
  
  const scenarios = [
    {
      scenario: 'Planetary invasion mission',
      jobType: 'tactical_analysis',
      context: 'High-stakes combat situation requiring strategic planning'
    },
    {
      scenario: 'Resource management crisis',
      jobType: 'tactical_analysis',
      context: 'Critical resource shortage requiring optimization'
    }
  ];
  
  for (const scenario of scenarios) {
    await log(`🎭 Simulating thinking for: ${scenario.scenario}`);
    
    const simulationResult = await testEndpoint('POST', `/agents/${agent.id}/thinking/simulate`, scenario);
    if (simulationResult.success) {
      await log(`✅ Simulation Results:`, {
        scenario: simulationResult.data.scenario,
        thoughts: simulationResult.data.simulatedThoughts.map(t => ({
          type: t.type,
          thought: t.thought,
          reasoning: t.reasoning,
          confidence: t.confidence
        }))
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Step 7: Upgrade agent and see thinking change
  console.log('🔧 STEP 7: Upgrading Agent and Observing Thinking Evolution');
  console.log('-'.repeat(40));
  
  const upgradeResult = await testEndpoint('PUT', `/agents/${agent.id}/upgrade`, {
    capability: 'advanced_analysis'
  });
  
  if (upgradeResult.success) {
    await log(`✅ Agent upgraded successfully`, {
      newCapabilities: upgradeResult.data.agent.capabilities,
      newRating: upgradeResult.data.agent.rating
    });
  }
  
  // Step 8: Get updated thinking history
  console.log('🔄 STEP 8: Updated Thinking History After Upgrade');
  console.log('-'.repeat(40));
  
  const updatedThinkingResult = await testEndpoint('GET', `/agents/${agent.id}/thinking?limit=10`);
  if (updatedThinkingResult.success) {
    await log(`📊 Updated Thinking History:`, {
      totalThoughts: updatedThinkingResult.data.totalThoughts,
      recentThoughts: updatedThinkingResult.data.thoughts.slice(-3).map(t => ({
        type: t.type,
        thought: t.thought,
        confidence: t.confidence,
        timestamp: new Date(t.timestamp).toLocaleTimeString()
      }))
    });
  }
  
  // Step 9: Global thinking overview
  console.log('🌍 STEP 9: Global Thinking Overview');
  console.log('-'.repeat(40));
  
  const globalResult = await testEndpoint('GET', '/agents/thinking/global?limit=10');
  if (globalResult.success) {
    await log(`📊 Global Thinking Overview:`, {
      totalThoughts: globalResult.data.totalThoughts,
      recentThoughts: globalResult.data.thoughts.slice(0, 5).map(t => ({
        agent: t.agentName,
        role: t.agentRole,
        type: t.type,
        thought: t.thought.substring(0, 60) + '...',
        timestamp: new Date(t.timestamp).toLocaleTimeString()
      }))
    });
  }
  
  console.log('🎉 THINKING HISTORY DEMONSTRATION COMPLETED');
  console.log('=' .repeat(60));
}

// Run the demonstration
demonstrateThinkingHistory(); 