/**
 * AI Agent Service - Real API Integration
 * Manages AI agents, job queuing, memory, and real-time operations via REST API
 * IDX-AI-SERVICE-002
 */

class AIAgentService {
  constructor() {
    this.baseUrl = 'http://localhost:3001/api';
    this.listeners = new Set();
    this.isConnected = false;
    this.updateInterval = null;
    
    // Agent roles and capabilities
    this.agentRoles = {
      navigator: {
        name: 'Navigator',
        description: 'Handles pathfinding and spatial awareness',
        capabilities: ['pathfinding', 'spatial_analysis', 'route_optimization'],
        baseMemory: { shortTerm: 50, longTerm: 200 },
        baseRating: 4.2
      },
      strategist: {
        name: 'Strategist',
        description: 'Develops tactical plans and combat strategies',
        capabilities: ['tactical_planning', 'combat_analysis', 'resource_management'],
        baseMemory: { shortTerm: 75, longTerm: 300 },
        baseRating: 4.5
      },
      engineer: {
        name: 'Engineer',
        description: 'Manages systems, repairs, and technical operations',
        capabilities: ['system_repair', 'technical_analysis', 'equipment_optimization'],
        baseMemory: { shortTerm: 60, longTerm: 250 },
        baseRating: 4.3
      },
      scout: {
        name: 'Scout',
        description: 'Explores and gathers intelligence',
        capabilities: ['exploration', 'intelligence_gathering', 'threat_assessment'],
        baseMemory: { shortTerm: 40, longTerm: 150 },
        baseRating: 4.0
      },
      coordinator: {
        name: 'Coordinator',
        description: 'Manages team coordination and communication',
        capabilities: ['team_coordination', 'communication', 'priority_management'],
        baseMemory: { shortTerm: 80, longTerm: 400 },
        baseRating: 4.4
      }
    };
    
    // Job types and requirements
    this.jobTypes = {
      pathfinding: {
        name: 'Pathfinding',
        description: 'Find optimal route to destination',
        requiredCapability: 'pathfinding',
        estimatedDuration: 2,
        priority: 'medium'
      },
      tactical_analysis: {
        name: 'Tactical Analysis',
        description: 'Analyze combat situation and recommend strategy',
        requiredCapability: 'tactical_planning',
        estimatedDuration: 5,
        priority: 'high'
      },
      system_repair: {
        name: 'System Repair',
        description: 'Repair damaged systems or equipment',
        requiredCapability: 'system_repair',
        estimatedDuration: 8,
        priority: 'high'
      },
      exploration: {
        name: 'Exploration',
        description: 'Explore new area and gather intelligence',
        requiredCapability: 'exploration',
        estimatedDuration: 10,
        priority: 'medium'
      },
      team_coordination: {
        name: 'Team Coordination',
        description: 'Coordinate team activities and resources',
        requiredCapability: 'team_coordination',
        estimatedDuration: 3,
        priority: 'high'
      }
    };
  }

  async connect() {
    try {
      // Test connection to API
      const response = await fetch(`${this.baseUrl}/health`);
      if (response.ok) {
        this.isConnected = true;
        this.startUpdateLoop();
        console.log('AI Agent Service connected to API successfully');
        return true;
      } else {
        throw new Error('API health check failed');
      }
    } catch (error) {
      console.error('Failed to connect to AI Agent Service API:', error);
      return false;
    }
  }

  disconnect() {
    this.isConnected = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    console.log('AI Agent Service disconnected');
  }

  startUpdateLoop() {
    this.updateInterval = setInterval(() => {
      this.notifyListeners();
    }, 2000); // Update every 2 seconds
  }

  async spawnAgent(role) {
    try {
      const response = await fetch(`${this.baseUrl}/agents/spawn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        throw new Error(`Failed to spawn agent: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`Agent spawned: ${result.agent.name}`);
      return result.agent;
    } catch (error) {
      console.error('Failed to spawn agent:', error);
      throw error;
    }
  }

  async dismissAgent(agentId) {
    try {
      const response = await fetch(`${this.baseUrl}/agents/${agentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to dismiss agent: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`Agent dismissed: ${result.message}`);
      return result;
    } catch (error) {
      console.error('Failed to dismiss agent:', error);
      throw error;
    }
  }

  async upgradeAgent(agentId, capability) {
    try {
      const response = await fetch(`${this.baseUrl}/agents/${agentId}/upgrade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ capability })
      });

      if (!response.ok) {
        throw new Error(`Failed to upgrade agent: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`Agent upgraded: ${result.message}`);
      return result.agent;
    } catch (error) {
      console.error('Failed to upgrade agent:', error);
      throw error;
    }
  }

  async createJob(type, description, priority = 'medium') {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, description, priority })
      });

      if (!response.ok) {
        throw new Error(`Failed to create job: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`Job created: ${result.job.type}`);
      return result.job;
    } catch (error) {
      console.error('Failed to create job:', error);
      throw error;
    }
  }

  async cancelJob(jobId) {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel job: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`Job cancelled: ${result.message}`);
      return result;
    } catch (error) {
      console.error('Failed to cancel job:', error);
      throw error;
    }
  }

  async prioritizeJob(jobId, priority) {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}/priority`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority })
      });

      if (!response.ok) {
        throw new Error(`Failed to update job priority: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`Job priority updated: ${result.message}`);
      return result.job;
    } catch (error) {
      console.error('Failed to update job priority:', error);
      throw error;
    }
  }

  async getAgents() {
    try {
      const response = await fetch(`${this.baseUrl}/agents`);
      if (!response.ok) {
        throw new Error(`Failed to get agents: ${response.statusText}`);
      }
      const result = await response.json();
      return result.agents || [];
    } catch (error) {
      console.error('Failed to get agents:', error);
      return [];
    }
  }

  async getJobs() {
    try {
      const response = await fetch(`${this.baseUrl}/jobs`);
      if (!response.ok) {
        throw new Error(`Failed to get jobs: ${response.statusText}`);
      }
      const result = await response.json();
      return result.jobs || [];
    } catch (error) {
      console.error('Failed to get jobs:', error);
      return [];
    }
  }

  async getStats() {
    try {
      const response = await fetch(`${this.baseUrl}/game/status`);
      if (!response.ok) {
        throw new Error(`Failed to get stats: ${response.statusText}`);
      }
      const result = await response.json();
      return result.stats || {};
    } catch (error) {
      console.error('Failed to get stats:', error);
      return {};
    }
  }

  addListener(callback) {
    this.listeners.add(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  async notifyListeners() {
    try {
      const [agents, jobs, stats] = await Promise.all([
        this.getAgents(),
        this.getJobs(),
        this.getStats()
      ]);

      const data = { agents, jobs, stats };
      this.listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in listener callback:', error);
        }
      });
    } catch (error) {
      console.error('Error updating listeners:', error);
    }
  }

  // Get available roles and job types for UI
  getAgentRoles() {
    return this.agentRoles;
  }

  getJobTypes() {
    return this.jobTypes;
  }

  // ===== LLM INTEGRATION METHODS =====
  
  async getLLMStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/llm/status`);
      if (!response.ok) {
        throw new Error(`Failed to get LLM status: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get LLM status:', error);
      return { enabled: false, message: 'LLM service unavailable' };
    }
  }

  async getAgentThinkingHistory() {
    try {
      const response = await fetch(`${this.baseUrl}/llm/agent-thinking`);
      if (!response.ok) {
        throw new Error(`Failed to get agent thinking history: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get agent thinking history:', error);
      return {};
    }
  }

  async generateAgentThinking(agentId, context = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/llm/agent-thinking/${agentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate agent thinking: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`Generated thinking for agent ${agentId}`);
      return result;
    } catch (error) {
      console.error('Failed to generate agent thinking:', error);
      throw error;
    }
  }

  async switchLLMProvider(provider) {
    try {
      const response = await fetch(`${this.baseUrl}/llm/switch-provider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider })
      });

      if (!response.ok) {
        throw new Error(`Failed to switch LLM provider: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`Switched to LLM provider: ${provider}`);
      return result.success;
    } catch (error) {
      console.error('Failed to switch LLM provider:', error);
      throw error;
    }
  }
}

// Export singleton instance
const aiAgentService = new AIAgentService();
export default aiAgentService; 