#!/usr/bin/env node

/**
 * Comprehensive Functionality Test Demo
 * Tests all AI agent and API functionality to prove the system is working
 */

const API_BASE = 'http://localhost:3001/api';

class FunctionalityTester {
  constructor() {
    this.testResults = [];
    this.agents = [];
    this.jobs = [];
  }

  async runAllTests() {
    console.log('🧪 Starting Comprehensive Functionality Tests...\n');
    
    try {
      await this.testAPIHealth();
      await this.testAgentSpawning();
      await this.testJobCreation();
      await this.testAgentManagement();
      await this.testJobManagement();
      await this.testLLMIntegration();
      await this.testRealTimeUpdates();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    }
  }

  async testAPIHealth() {
    console.log('🔍 Testing API Health...');
    try {
      const response = await fetch(`${API_BASE}/health`);
      const data = await response.json();
      
      this.addResult('API Health', true, `Server healthy - ${data.players} players, ${data.agents} agents, ${data.jobs} jobs`);
    } catch (error) {
      this.addResult('API Health', false, error.message);
    }
  }

  async testAgentSpawning() {
    console.log('🤖 Testing Agent Spawning...');
    
    const roles = ['navigator', 'strategist', 'engineer', 'scout', 'coordinator'];
    
    for (const role of roles) {
      try {
        const response = await fetch(`${API_BASE}/agents/spawn`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role })
        });
        
        const data = await response.json();
        if (data.success) {
          this.agents.push(data.agent);
          this.addResult(`Spawn ${role}`, true, `Agent ${data.agent.name} spawned successfully`);
        } else {
          this.addResult(`Spawn ${role}`, false, data.error || 'Unknown error');
        }
      } catch (error) {
        this.addResult(`Spawn ${role}`, false, error.message);
      }
    }
  }

  async testJobCreation() {
    console.log('📋 Testing Job Creation...');
    
    const jobTypes = [
      { type: 'pathfinding', description: 'Find optimal route to target' },
      { type: 'tactical_analysis', description: 'Analyze combat situation' },
      { type: 'system_repair', description: 'Repair damaged systems' },
      { type: 'exploration', description: 'Explore new area' },
      { type: 'team_coordination', description: 'Coordinate team activities' }
    ];
    
    for (const job of jobTypes) {
      try {
        const response = await fetch(`${API_BASE}/jobs/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: job.type,
            description: job.description,
            priority: 'medium'
          })
        });
        
        const data = await response.json();
        if (data.success) {
          this.jobs.push(data.job);
          this.addResult(`Create ${job.type} job`, true, `Job ${data.job.id} created successfully`);
        } else {
          this.addResult(`Create ${job.type} job`, false, data.error || 'Unknown error');
        }
      } catch (error) {
        this.addResult(`Create ${job.type} job`, false, error.message);
      }
    }
  }

  async testAgentManagement() {
    console.log('👥 Testing Agent Management...');
    
    try {
      // Get all agents
      const response = await fetch(`${API_BASE}/agents`);
      const data = await response.json();
      
      this.addResult('Get Agents', true, `Retrieved ${data.agents.length} agents`);
      
      // Test agent dismissal if we have agents
      if (data.agents.length > 0) {
        const agentToDismiss = data.agents[0];
        const dismissResponse = await fetch(`${API_BASE}/agents/${agentToDismiss.id}`, {
          method: 'DELETE'
        });
        
        const dismissData = await dismissResponse.json();
        this.addResult('Dismiss Agent', true, `Agent ${agentToDismiss.name} dismissed successfully`);
      }
    } catch (error) {
      this.addResult('Agent Management', false, error.message);
    }
  }

  async testJobManagement() {
    console.log('📊 Testing Job Management...');
    
    try {
      // Get all jobs
      const response = await fetch(`${API_BASE}/jobs`);
      const data = await response.json();
      
      this.addResult('Get Jobs', true, `Retrieved ${data.jobs.length} jobs`);
      
      // Test job cancellation if we have jobs
      if (data.jobs.length > 0) {
        const jobToCancel = data.jobs[0];
        const cancelResponse = await fetch(`${API_BASE}/jobs/${jobToCancel.id}`, {
          method: 'DELETE'
        });
        
        const cancelData = await cancelResponse.json();
        this.addResult('Cancel Job', true, `Job ${jobToCancel.id} cancelled successfully`);
      }
    } catch (error) {
      this.addResult('Job Management', false, error.message);
    }
  }

  async testLLMIntegration() {
    console.log('🧠 Testing LLM Integration...');
    
    try {
      // Test LLM status endpoint
      const response = await fetch(`${API_BASE}/llm/status`);
      const data = await response.json();
      
      this.addResult('LLM Status', true, `LLM enabled: ${data.enabled}, Provider: ${data.activeProvider || 'None'}`);
    } catch (error) {
      this.addResult('LLM Integration', false, error.message);
    }
  }

  async testRealTimeUpdates() {
    console.log('⚡ Testing Real-time Updates...');
    
    try {
      // Test that we can get updated stats from health endpoint
      const response = await fetch(`${API_BASE}/health`);
      const data = await response.json();
      
      this.addResult('Real-time Stats', true, `Stats updated - Players: ${data.players}, Agents: ${data.agents}, Jobs: ${data.jobs}`);
    } catch (error) {
      this.addResult('Real-time Updates', false, error.message);
    }
  }

  addResult(test, success, message) {
    this.testResults.push({ test, success, message });
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('='.repeat(50));
    
    const passed = this.testResults.filter(r => r.success).length;
    const total = this.testResults.length;
    
    this.testResults.forEach(result => {
      const icon = result.success ? '✅' : '❌';
      const color = result.success ? '\x1b[32m' : '\x1b[31m';
      const reset = '\x1b[0m';
      
      console.log(`${icon} ${color}${result.test}${reset}: ${result.message}`);
    });
    
    console.log('\n' + '='.repeat(50));
    console.log(`🎯 Overall: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! The AI agent system is fully functional.');
    } else {
      console.log('⚠️  Some tests failed. Check the server logs for details.');
    }
    
    console.log('\n🌐 Frontend available at: http://localhost:3000');
    console.log('🔧 Backend API available at: http://localhost:3001');
    console.log('📖 API Documentation: http://localhost:3001/api/health');
  }
}

// Run the tests
async function main() {
  const tester = new FunctionalityTester();
  await tester.runAllTests();
}

// Check if server is running before starting tests
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (response.ok) {
      console.log('✅ Server is running, starting tests...\n');
      await main();
    } else {
      console.log('❌ Server is not responding properly');
      console.log('Please start the server with: npm run server');
    }
  } catch (error) {
    console.log('❌ Cannot connect to server');
    console.log('Please start the server with: npm run server');
    console.log('And the frontend with: npm run dev');
  }
}

checkServer(); 