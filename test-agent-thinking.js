/**
 * Agent Thinking History Test
 * Demonstrates agent thinking patterns, history tracking, and analysis
 */

class AgentThinkingTester {
  constructor() {
    this.baseUrl = 'http://localhost:3001/api';
  }

  async log(message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
    console.log('');
  }

  async testEndpoint(method, endpoint, body = null) {
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      if (body) options.body = JSON.stringify(body);
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      const data = await response.json();
      
      return { success: response.ok, data, status: response.status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async runThinkingTest() {
    console.log('🧠 AGENT THINKING HISTORY TEST\n');
    console.log('=' .repeat(60));
    
    // Test 1: Spawn agents and create jobs to generate thinking history
    await this.testThinkingGeneration();
    
    // Test 2: Retrieve and analyze individual agent thinking
    await this.testIndividualAgentThinking();
    
    // Test 3: Global thinking analysis
    await this.testGlobalThinking();
    
    // Test 4: Thinking simulation
    await this.testThinkingSimulation();
    
    // Test 5: Real-time thinking monitoring
    await this.testRealTimeThinking();
    
    console.log('🎉 THINKING HISTORY TEST COMPLETED');
    console.log('=' .repeat(60));
  }

  async testThinkingGeneration() {
    console.log('🧠 TEST 1: Generating Agent Thinking History');
    console.log('-'.repeat(40));
    
    // Spawn different types of agents
    const agentRoles = ['navigator', 'strategist', 'engineer', 'scout', 'coordinator'];
    const spawnedAgents = [];
    
    for (const role of agentRoles) {
      const result = await this.testEndpoint('POST', '/agents/spawn', { role });
      if (result.success) {
        spawnedAgents.push(result.data.agent);
        await this.log(`✅ Spawned ${result.data.agent.name} (${role})`);
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Create various jobs to generate thinking
    const testJobs = [
      { type: 'pathfinding', description: 'Find route to enemy base', priority: 'high' },
      { type: 'tactical_analysis', description: 'Analyze battlefield situation', priority: 'high' },
      { type: 'system_repair', description: 'Repair damaged systems', priority: 'medium' },
      { type: 'exploration', description: 'Scout unknown territory', priority: 'medium' },
      { type: 'team_coordination', description: 'Coordinate team assault', priority: 'high' }
    ];
    
    await this.log('📋 Creating jobs to generate thinking history...');
    
    for (const job of testJobs) {
      const result = await this.testEndpoint('POST', '/jobs/create', job);
      if (result.success) {
        await this.log(`✅ Created job: ${job.description}`);
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Wait for some thinking to occur
    await this.log('⏳ Waiting for agents to generate thinking history...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    return spawnedAgents;
  }

  async testIndividualAgentThinking() {
    console.log('🧠 TEST 2: Individual Agent Thinking Analysis');
    console.log('-'.repeat(40));
    
    // Get all agents
    const agentsResult = await this.testEndpoint('GET', '/agents');
    if (!agentsResult.success) {
      await this.log('❌ Failed to get agents');
      return;
    }
    
    const agents = agentsResult.data.agents;
    if (agents.length === 0) {
      await this.log('⚠️ No agents available for thinking analysis');
      return;
    }
    
    // Analyze thinking for each agent
    for (const agent of agents) {
      await this.log(`🧠 Analyzing thinking for ${agent.name} (${agent.role})...`);
      
      // Get thinking history
      const thinkingResult = await this.testEndpoint('GET', `/agents/${agent.id}/thinking`);
      if (thinkingResult.success) {
        await this.log(`📊 Thinking History for ${agent.name}:`, {
          totalThoughts: thinkingResult.data.totalThoughts,
          recentThoughts: thinkingResult.data.thoughts.slice(-3).map(t => ({
            type: t.type,
            thought: t.thought.substring(0, 50) + '...',
            confidence: t.confidence,
            timestamp: new Date(t.timestamp).toLocaleTimeString()
          }))
        });
      }
      
      // Get thinking analysis
      const analysisResult = await this.testEndpoint('GET', `/agents/${agent.id}/thinking/analysis`);
      if (analysisResult.success) {
        const analysis = analysisResult.data.analysis;
        await this.log(`📈 Thinking Analysis for ${agent.name}:`, {
          'Total Thoughts': analysis.totalThoughts,
          'Average Confidence': analysis.avgConfidence?.toFixed(2),
          'Decision Quality': analysis.decisionQuality?.toFixed(2),
          'Thinking Patterns': analysis.thinkingPatterns,
          'Learning Progress': `${analysis.learningProgress?.toFixed(1)}%`,
          'Recommendations': analysis.recommendations
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  async testGlobalThinking() {
    console.log('🌍 TEST 3: Global Thinking Analysis');
    console.log('-'.repeat(40));
    
    // Get global thinking history
    const globalResult = await this.testEndpoint('GET', '/agents/thinking/global');
    if (globalResult.success) {
      await this.log('📊 Global Thinking Overview:', {
        totalThoughts: globalResult.data.totalThoughts,
        recentThoughts: globalResult.data.thoughts.slice(0, 5).map(t => ({
          agent: t.agentName,
          role: t.agentRole,
          type: t.type,
          thought: t.thought.substring(0, 40) + '...',
          timestamp: new Date(t.timestamp).toLocaleTimeString()
        }))
      });
    }
    
    // Get thinking by role
    const roles = ['navigator', 'strategist', 'engineer', 'scout', 'coordinator'];
    
    for (const role of roles) {
      const roleResult = await this.testEndpoint('GET', `/agents/thinking/global?role=${role}&limit=10`);
      if (roleResult.success && roleResult.data.thoughts.length > 0) {
        await this.log(`🧠 ${role.charAt(0).toUpperCase() + role.slice(1)} Thinking Patterns:`, {
          totalThoughts: roleResult.data.thoughts.length,
          thoughtTypes: roleResult.data.thoughts.reduce((acc, t) => {
            acc[t.type] = (acc[t.type] || 0) + 1;
            return acc;
          }, {}),
          sampleThought: roleResult.data.thoughts[0].thought.substring(0, 50) + '...'
        });
      }
    }
  }

  async testThinkingSimulation() {
    console.log('🎭 TEST 4: Agent Thinking Simulation');
    console.log('-'.repeat(40));
    
    // Get an agent to simulate thinking for
    const agentsResult = await this.testEndpoint('GET', '/agents');
    if (!agentsResult.success || agentsResult.data.agents.length === 0) {
      await this.log('⚠️ No agents available for simulation');
      return;
    }
    
    const agent = agentsResult.data.agents[0];
    
    // Simulate different scenarios
    const scenarios = [
      {
        scenario: 'Planetary invasion mission',
        jobType: 'tactical_analysis',
        context: 'High-stakes combat situation'
      },
      {
        scenario: 'Emergency system failure',
        jobType: 'system_repair',
        context: 'Critical infrastructure damage'
      },
      {
        scenario: 'Resource exploration mission',
        jobType: 'exploration',
        context: 'Unknown territory reconnaissance'
      }
    ];
    
    for (const scenario of scenarios) {
      await this.log(`🎭 Simulating ${agent.name}'s thinking for: ${scenario.scenario}`);
      
      const simulationResult = await this.testEndpoint('POST', `/agents/${agent.id}/thinking/simulate`, scenario);
      if (simulationResult.success) {
        await this.log(`✅ Simulation Results:`, {
          scenario: simulationResult.data.scenario,
          thoughts: simulationResult.data.simulatedThoughts.map(t => ({
            type: t.type,
            thought: t.thought.substring(0, 40) + '...',
            confidence: t.confidence
          }))
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  async testRealTimeThinking() {
    console.log('⚡ TEST 5: Real-time Thinking Monitoring');
    console.log('-'.repeat(40));
    
    // Get an agent to monitor
    const agentsResult = await this.testEndpoint('GET', '/agents');
    if (!agentsResult.success || agentsResult.data.agents.length === 0) {
      await this.log('⚠️ No agents available for monitoring');
      return;
    }
    
    const agent = agentsResult.data.agents[0];
    
    await this.log(`📊 Monitoring ${agent.name}'s thinking in real-time...`);
    
    // Monitor thinking for 10 seconds
    for (let i = 0; i < 5; i++) {
      const thinkingResult = await this.testEndpoint('GET', `/agents/${agent.id}/thinking?limit=5`);
      
      if (thinkingResult.success) {
        const recentThoughts = thinkingResult.data.thoughts;
        await this.log(`📈 Real-time Update ${i + 1}/5:`, {
          'Total Thoughts': thinkingResult.data.totalThoughts,
          'Recent Activity': recentThoughts.length > 0 ? 
            recentThoughts[0].thought.substring(0, 40) + '...' : 'No recent activity',
          'Current Thought': thinkingResult.data.thoughtProcess.currentThought ? 
            thinkingResult.data.thoughtProcess.currentThought.thought.substring(0, 40) + '...' : 'None'
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Run the thinking test
const tester = new AgentThinkingTester();
tester.runThinkingTest(); 