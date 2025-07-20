/**
 * LM Studio Bridge
 * Bridges GPU streaming system with LM Studio instances
 */

import { EventEmitter } from 'events';
import { LMStudioDetector } from './lm-studio-detector.js';

export class LMStudioBridge extends EventEmitter {
  constructor() {
    super();
    this.detector = new LMStudioDetector();
    this.connectedInstances = new Map();
    this.activeConnections = new Map();
    this.loadBalancer = new Map(); // Track load per instance
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.detector.on('instance:discovered', (instance) => {
      this.connectToInstance(instance);
    });
    
    this.detector.on('scan:complete', (instances) => {
      console.log(`🔗 LM Studio Bridge: ${instances.length} instances available`);
      this.emit('instances:updated', instances);
    });
  }

  async start() {
    console.log('🚀 Starting LM Studio Bridge...');
    
    // Start network scanning
    await this.detector.scanNetwork();
    
    // Start continuous monitoring
    this.detector.startMonitoring(60000); // Scan every minute
    
    console.log('✅ LM Studio Bridge started');
  }

  async connectToInstance(instance) {
    const instanceKey = `${instance.host}:${instance.port}`;
    
    if (this.connectedInstances.has(instanceKey)) {
      return this.connectedInstances.get(instanceKey);
    }
    
    try {
      console.log(`🔗 Connecting to LM Studio: ${instance.name} at ${instance.host}:${instance.port}`);
      
      // Test connection and get models
      const models = await this.detector.getInstanceModels(instance.host, instance.port);
      
      const connection = {
        ...instance,
        models,
        status: 'connected',
        connectedAt: new Date(),
        lastUsed: null,
        load: 0,
        totalRequests: 0,
        totalTokens: 0
      };
      
      this.connectedInstances.set(instanceKey, connection);
      this.loadBalancer.set(instanceKey, 0);
      
      console.log(`✅ Connected to ${instance.name} with ${models.length} models`);
      this.emit('instance:connected', connection);
      
      return connection;
      
    } catch (error) {
      console.error(`❌ Failed to connect to ${instance.name}:`, error);
      this.emit('instance:connection:failed', { instance, error });
      return null;
    }
  }

  async routeInference(prompt, model, options = {}) {
    const availableInstances = this.getAvailableInstancesForModel(model);
    
    if (availableInstances.length === 0) {
      throw new Error(`No LM Studio instances available for model: ${model}`);
    }
    
    // Select best instance based on load balancing
    const selectedInstance = this.selectBestInstance(availableInstances);
    
    try {
      console.log(`📤 Routing inference to ${selectedInstance.name} (${selectedInstance.host}:${selectedInstance.port})`);
      
      const result = await this.sendInferenceRequest(selectedInstance, prompt, model, options);
      
      // Update instance stats
      this.updateInstanceStats(selectedInstance, result.tokens || 0);
      
      console.log(`📥 Received response from ${selectedInstance.name} (${result.tokens} tokens)`);
      
      return {
        ...result,
        instance: selectedInstance,
        routedAt: new Date()
      };
      
    } catch (error) {
      console.error(`❌ Inference failed on ${selectedInstance.name}:`, error);
      
      // Mark instance as failed and try another
      this.markInstanceFailed(selectedInstance);
      
      // Retry with another instance
      const remainingInstances = availableInstances.filter(i => i !== selectedInstance);
      if (remainingInstances.length > 0) {
        console.log(`🔄 Retrying with another instance...`);
        return await this.routeInference(prompt, model, options);
      }
      
      throw error;
    }
  }

  async sendInferenceRequest(instance, prompt, model, options) {
    const url = `http://${instance.host}:${instance.port}/v1/chat/completions`;
    
    const requestBody = {
      model: model,
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature || 0.7,
      top_p: options.topP || 0.9,
      stream: options.stream || false
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`LM Studio request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      response: data.choices[0]?.message?.content || '',
      tokens: data.usage?.total_tokens || 0,
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      model: data.model,
      finishReason: data.choices[0]?.finish_reason
    };
  }

  async startStreamingInference(instance, prompt, model, options = {}) {
    const url = `http://${instance.host}:${instance.port}/v1/chat/completions`;
    
    const requestBody = {
      model: model,
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature || 0.7,
      top_p: options.topP || 0.9,
      stream: true
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`LM Studio streaming request failed: ${response.status} ${response.statusText}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    return {
      reader,
      decoder,
      instance,
      model,
      startTime: Date.now()
    };
  }

  async processStreamingResponse(streamData, onToken) {
    const { reader, decoder, instance } = streamData;
    let fullResponse = '';
    let totalTokens = 0;
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              
              if (content) {
                fullResponse += content;
                totalTokens++;
                
                if (onToken) {
                  onToken(content, {
                    instance,
                    totalTokens,
                    fullResponse
                  });
                }
              }
            } catch (parseError) {
              // Skip malformed JSON
            }
          }
        }
      }
      
      return {
        response: fullResponse,
        tokens: totalTokens,
        instance,
        duration: Date.now() - streamData.startTime
      };
      
    } catch (error) {
      console.error('Streaming error:', error);
      throw error;
    }
  }

  getAvailableInstancesForModel(model) {
    return Array.from(this.connectedInstances.values())
      .filter(instance => 
        instance.status === 'connected' &&
        instance.models.some(m => m.id === model || m.id.includes(model))
      );
  }

  selectBestInstance(availableInstances) {
    // Simple load balancing - select instance with lowest load
    return availableInstances.reduce((best, current) => {
      const bestLoad = this.loadBalancer.get(`${best.host}:${best.port}`) || 0;
      const currentLoad = this.loadBalancer.get(`${current.host}:${current.port}`) || 0;
      
      return currentLoad < bestLoad ? current : best;
    });
  }

  updateInstanceStats(instance, tokens) {
    const instanceKey = `${instance.host}:${instance.port}`;
    const connection = this.connectedInstances.get(instanceKey);
    
    if (connection) {
      connection.lastUsed = new Date();
      connection.totalRequests++;
      connection.totalTokens += tokens;
      
      // Update load balancer
      const currentLoad = this.loadBalancer.get(instanceKey) || 0;
      this.loadBalancer.set(instanceKey, currentLoad + 1);
      
      // Decay load over time
      setTimeout(() => {
        const load = this.loadBalancer.get(instanceKey) || 0;
        this.loadBalancer.set(instanceKey, Math.max(0, load - 1));
      }, 60000); // Decay after 1 minute
    }
  }

  markInstanceFailed(instance) {
    const instanceKey = `${instance.host}:${instance.port}`;
    const connection = this.connectedInstances.get(instanceKey);
    
    if (connection) {
      connection.status = 'failed';
      connection.failedAt = new Date();
      
      console.log(`⚠️ Marked ${instance.name} as failed`);
      this.emit('instance:failed', connection);
      
      // Try to reconnect after 5 minutes
      setTimeout(() => {
        this.reconnectInstance(instance);
      }, 300000);
    }
  }

  async reconnectInstance(instance) {
    console.log(`🔄 Attempting to reconnect to ${instance.name}...`);
    
    const isAvailable = await this.detector.testInstanceConnection(instance.host, instance.port);
    
    if (isAvailable) {
      const connection = await this.connectToInstance(instance);
      if (connection) {
        connection.status = 'connected';
        console.log(`✅ Reconnected to ${instance.name}`);
        this.emit('instance:reconnected', connection);
      }
    }
  }

  getConnectedInstances() {
    return Array.from(this.connectedInstances.values());
  }

  getInstanceStats() {
    const stats = {
      totalInstances: this.connectedInstances.size,
      connectedInstances: 0,
      failedInstances: 0,
      totalRequests: 0,
      totalTokens: 0,
      instances: []
    };
    
    for (const instance of this.connectedInstances.values()) {
      if (instance.status === 'connected') stats.connectedInstances++;
      if (instance.status === 'failed') stats.failedInstances++;
      
      stats.totalRequests += instance.totalRequests;
      stats.totalTokens += instance.totalTokens;
      
      stats.instances.push({
        name: instance.name,
        host: instance.host,
        port: instance.port,
        status: instance.status,
        modelCount: instance.modelCount,
        totalRequests: instance.totalRequests,
        totalTokens: instance.totalTokens,
        lastUsed: instance.lastUsed,
        load: this.loadBalancer.get(`${instance.host}:${instance.port}`) || 0
      });
    }
    
    return stats;
  }

  stop() {
    this.detector.stopMonitoring();
    console.log('🛑 LM Studio Bridge stopped');
  }
} 