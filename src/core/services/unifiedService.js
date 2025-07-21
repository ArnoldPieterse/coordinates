/**
 * Unified Service - Single Service Layer for Rekursing
 * Consolidates AI, Game, and System services into one unified interface
 * Eliminates duplication and provides consistent API
 */

class UnifiedService {
  constructor() {
    this.baseUrl = 'http://localhost:3001/api';
    this.lmStudioUrl = 'http://10.3.129.26:1234';
    this.isConnected = false;
    this.listeners = new Map();
    this.currentPlayer = null;
    
    // Core systems
    this.llmManager = null;
    this.aiAgentSystem = null;
    this.gameSystem = null;
  }

  // ===== CONNECTION MANAGEMENT =====
  
  async connect() {
    try {
      console.log('🔌 Connecting to Rekursing services...');
      
      // Connect to main API
      const apiResponse = await fetch(`${this.baseUrl}/health`);
      if (!apiResponse.ok) {
        throw new Error('Main API unavailable');
      }
      
      // Connect to LM Studio
      const lmResponse = await fetch(`${this.lmStudioUrl}/v1/models`);
      const lmConnected = lmResponse.ok;
      
      this.isConnected = true;
      console.log('✅ Connected to Rekursing services');
      
      return {
        api: true,
        lmStudio: lmConnected,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ Connection failed:', error);
      this.isConnected = false;
      return {
        api: false,
        lmStudio: false,
        error: error.message
      };
    }
  }

  // ===== AI AGENT SYSTEM =====
  
  async getAgents() {
    if (!this.isConnected) return [];
    
    try {
      const response = await fetch(`${this.baseUrl}/agents`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Failed to get agents:', error);
      return [];
    }
  }

  async spawnAgent(role, config = {}) {
    if (!this.isConnected) throw new Error('Not connected');
    
    try {
      const response = await fetch(`${this.baseUrl}/agents/spawn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, config })
      });
      
      if (!response.ok) throw new Error('Failed to spawn agent');
      return await response.json();
    } catch (error) {
      console.error('Failed to spawn agent:', error);
      throw error;
    }
  }

  async dismissAgent(agentId) {
    if (!this.isConnected) throw new Error('Not connected');
    
    try {
      const response = await fetch(`${this.baseUrl}/agents/${agentId}/dismiss`, {
        method: 'DELETE'
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to dismiss agent:', error);
      return false;
    }
  }

  async getJobs() {
    if (!this.isConnected) return [];
    
    try {
      const response = await fetch(`${this.baseUrl}/jobs`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Failed to get jobs:', error);
      return [];
    }
  }

  async createJob(type, description, priority = 'normal') {
    if (!this.isConnected) throw new Error('Not connected');
    
    try {
      const response = await fetch(`${this.baseUrl}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, description, priority })
      });
      
      if (!response.ok) throw new Error('Failed to create job');
      return await response.json();
    } catch (error) {
      console.error('Failed to create job:', error);
      throw error;
    }
  }

  async cancelJob(jobId) {
    if (!this.isConnected) throw new Error('Not connected');
    
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}/cancel`, {
        method: 'PUT'
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to cancel job:', error);
      return false;
    }
  }

  // ===== LLM INTEGRATION =====
  
  async getLLMStatus() {
    try {
      const response = await fetch(`${this.lmStudioUrl}/v1/models`);
      return {
        connected: response.ok,
        models: response.ok ? await response.json() : [],
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        connected: false,
        models: [],
        error: error.message
      };
    }
  }

  async generateResponse(prompt, options = {}) {
    try {
      const response = await fetch(`${this.lmStudioUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: options.model || 'default',
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 1000,
          stream: options.stream || false
        })
      });
      
      if (!response.ok) throw new Error('LLM request failed');
      
      const data = await response.json();
      return {
        text: data.choices?.[0]?.message?.content || '',
        usage: data.usage,
        model: data.model
      };
    } catch (error) {
      console.error('LLM generation failed:', error);
      throw error;
    }
  }

  async generateAgentThinking(agentId, context) {
    const prompt = `As AI Agent ${agentId}, analyze this context and provide your thinking process:
    
Context: ${context}

Please provide your analysis, reasoning, and next steps:`;

    try {
      const result = await this.generateResponse(prompt, {
        temperature: 0.3,
        maxTokens: 500
      });
      
      return {
        agentId,
        context,
        thinking: result.text,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Failed to generate agent thinking:', error);
      throw error;
    }
  }

  // ===== GAME SYSTEM =====
  
  async joinGame(playerName) {
    if (!this.isConnected) throw new Error('Not connected');
    
    try {
      const response = await fetch(`${this.baseUrl}/players/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName })
      });
      
      if (!response.ok) throw new Error('Failed to join game');
      
      const result = await response.json();
      this.currentPlayer = result.player;
      return this.currentPlayer;
    } catch (error) {
      console.error('Failed to join game:', error);
      throw error;
    }
  }

  async getPlayers() {
    if (!this.isConnected) return [];
    
    try {
      const response = await fetch(`${this.baseUrl}/players`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Failed to get players:', error);
      return [];
    }
  }

  async updatePosition(position, rotation, planet) {
    if (!this.currentPlayer) throw new Error('No player joined');
    
    try {
      const response = await fetch(`${this.baseUrl}/players/${this.currentPlayer.id}/position`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position, rotation, planet })
      });
      
      if (!response.ok) throw new Error('Failed to update position');
      
      const result = await response.json();
      this.currentPlayer = result.player;
      return this.currentPlayer;
    } catch (error) {
      console.error('Failed to update position:', error);
      throw error;
    }
  }

  async shoot(targetId, damage, weaponType) {
    if (!this.currentPlayer) throw new Error('No player joined');
    
    try {
      const response = await fetch(`${this.baseUrl}/players/${this.currentPlayer.id}/shoot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, damage, weaponType })
      });
      
      if (!response.ok) throw new Error('Failed to shoot');
      
      return await response.json();
    } catch (error) {
      console.error('Failed to shoot:', error);
      throw error;
    }
  }

  // ===== SYSTEM STATISTICS =====
  
  async getSystemStats() {
    if (!this.isConnected) return {};
    
    try {
      const [agents, jobs, players, llmStatus] = await Promise.all([
        this.getAgents(),
        this.getJobs(),
        this.getPlayers(),
        this.getLLMStatus()
      ]);
      
      return {
        agents: {
          total: agents.length,
          active: agents.filter(a => a.status === 'active').length,
          idle: agents.filter(a => a.status === 'idle').length
        },
        jobs: {
          total: jobs.length,
          pending: jobs.filter(j => j.status === 'pending').length,
          completed: jobs.filter(j => j.status === 'completed').length
        },
        players: {
          total: players.length,
          online: players.filter(p => p.status === 'online').length
        },
        llm: llmStatus,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Failed to get system stats:', error);
      return {};
    }
  }

  // ===== EVENT SYSTEM =====
  
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  removeListener(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  notifyListeners(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Listener error:', error);
        }
      });
    }
  }

  // ===== UTILITY METHODS =====
  
  getCurrentPlayer() {
    return this.currentPlayer;
  }

  isConnected() {
    return this.isConnected;
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
const unifiedService = new UnifiedService();

// Export singleton
export default unifiedService; 