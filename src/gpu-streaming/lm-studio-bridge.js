/**
 * LM Studio Bridge
 * Handles connection and communication with LM Studio instances
 */

import fetch from 'node-fetch';

export class LMStudioBridge {
  constructor() {
    this.connections = new Map();
    this.defaultUrl = 'http://10.3.129.26:1234';
    this.healthCheckInterval = 30000; // 30 seconds
    this.initializeConnections();
  }

  /**
   * Initialize connections to LM Studio instances
   */
  async initializeConnections() {
    try {
      // Connect to default LM Studio instance
      await this.addConnection('default', this.defaultUrl);
      
      // Start health check
      this.startHealthCheck();
      
      console.log('🔗 LM Studio Bridge initialized');
    } catch (error) {
      console.error('Failed to initialize LM Studio Bridge:', error);
    }
  }

  /**
   * Add a new LM Studio connection
   */
  async addConnection(name, url) {
    try {
      const connection = {
        name,
        url,
        status: 'connecting',
        lastHealthCheck: null,
        models: [],
        capabilities: []
      };

      // Test connection
      await this.testConnection(connection);
      
      this.connections.set(name, connection);
      console.log(`🔗 LM Studio connection added: ${name} (${url})`);
      
      return connection;
    } catch (error) {
      console.error(`Failed to add LM Studio connection ${name}:`, error);
      throw error;
    }
  }

  /**
   * Test connection to LM Studio
   */
  async testConnection(connection) {
    try {
      const response = await fetch(`${connection.url}/v1/models`, {
        method: 'GET',
        timeout: 5000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      connection.status = 'connected';
      connection.lastHealthCheck = new Date();
      connection.models = data.data || [];
      connection.capabilities = this.extractCapabilities(data.data || []);

      console.log(`✅ LM Studio ${connection.name} connected with ${connection.models.length} models`);
      return true;
    } catch (error) {
      connection.status = 'disconnected';
      connection.lastHealthCheck = new Date();
      console.error(`❌ LM Studio ${connection.name} connection failed:`, error.message);
      return false;
    }
  }

  /**
   * Extract model capabilities from LM Studio response
   */
  extractCapabilities(models) {
    const capabilities = [];
    
    for (const model of models) {
      const modelName = model.id.toLowerCase();
      
      if (modelName.includes('llama')) {
        capabilities.push('llama-3-70b', 'llama-3-8b', 'llama-2-70b', 'llama-2-13b', 'llama-2-7b');
      }
      
      if (modelName.includes('gpt')) {
        capabilities.push('gpt-4', 'gpt-3.5-turbo');
      }
      
      if (modelName.includes('mistral')) {
        capabilities.push('mistral-7b', 'mistral-8x7b');
      }
      
      if (modelName.includes('gemini')) {
        capabilities.push('gemini-pro');
      }
      
      if (modelName.includes('claude')) {
        capabilities.push('claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus');
      }
    }
    
    return [...new Set(capabilities)]; // Remove duplicates
  }

  /**
   * Get available connections
   */
  getConnections() {
    return Array.from(this.connections.values());
  }

  /**
   * Get connection by name
   */
  getConnection(name) {
    return this.connections.get(name);
  }

  /**
   * Get best connection for a model
   */
  getBestConnection(model) {
    const availableConnections = Array.from(this.connections.values())
      .filter(conn => conn.status === 'connected' && conn.capabilities.includes(model));
    
    if (availableConnections.length === 0) {
      return null;
    }
    
    // Return the first available connection (could be enhanced with load balancing)
    return availableConnections[0];
  }

  /**
   * Make inference request to LM Studio
   */
  async makeInferenceRequest(connection, prompt, model, options = {}) {
    try {
      const requestBody = {
        model: model,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 1.0,
        stream: options.stream || false
      };

      const response = await fetch(`${connection.url}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        timeout: options.timeout || 30000
      });

      if (!response.ok) {
        throw new Error(`LM Studio API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        response: data.choices[0].message.content,
        model: data.model,
        usage: data.usage,
        finishReason: data.choices[0].finish_reason
      };
    } catch (error) {
      console.error(`LM Studio inference failed for ${connection.name}:`, error);
      throw error;
    }
  }

  /**
   * Stream inference request to LM Studio
   */
  async streamInferenceRequest(connection, prompt, model, options = {}) {
    try {
      const requestBody = {
        model: model,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 1.0,
        stream: true
      };

      const response = await fetch(`${connection.url}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        timeout: options.timeout || 30000
      });

      if (!response.ok) {
        throw new Error(`LM Studio API error: ${response.status} ${response.statusText}`);
      }

      return response.body;
    } catch (error) {
      console.error(`LM Studio streaming failed for ${connection.name}:`, error);
      throw error;
    }
  }

  /**
   * Get models from LM Studio
   */
  async getModels(connection) {
    try {
      const response = await fetch(`${connection.url}/v1/models`, {
        method: 'GET',
        timeout: 5000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error(`Failed to get models from ${connection.name}:`, error);
      return [];
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus() {
    const status = {
      totalConnections: this.connections.size,
      connectedConnections: 0,
      totalModels: 0,
      connections: []
    };

    for (const [name, connection] of this.connections) {
      status.connections.push({
        name,
        url: connection.url,
        status: connection.status,
        lastHealthCheck: connection.lastHealthCheck,
        modelCount: connection.models.length
      });

      if (connection.status === 'connected') {
        status.connectedConnections++;
        status.totalModels += connection.models.length;
      }
    }

    return status;
  }

  /**
   * Start health check interval
   */
  startHealthCheck() {
    setInterval(async () => {
      for (const [name, connection] of this.connections) {
        await this.testConnection(connection);
      }
    }, this.healthCheckInterval);
  }

  /**
   * Remove connection
   */
  removeConnection(name) {
    const connection = this.connections.get(name);
    if (connection) {
      this.connections.delete(name);
      console.log(`🔗 LM Studio connection removed: ${name}`);
      return true;
    }
    return false;
  }

  /**
   * Update connection URL
   */
  async updateConnectionUrl(name, newUrl) {
    const connection = this.connections.get(name);
    if (!connection) {
      throw new Error(`Connection ${name} not found`);
    }

    connection.url = newUrl;
    await this.testConnection(connection);
    
    console.log(`🔗 LM Studio connection updated: ${name} -> ${newUrl}`);
    return connection;
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    const stats = {
      total: this.connections.size,
      connected: 0,
      disconnected: 0,
      totalModels: 0,
      averageResponseTime: 0
    };

    for (const connection of this.connections.values()) {
      if (connection.status === 'connected') {
        stats.connected++;
        stats.totalModels += connection.models.length;
      } else {
        stats.disconnected++;
      }
    }

    return stats;
  }
} 