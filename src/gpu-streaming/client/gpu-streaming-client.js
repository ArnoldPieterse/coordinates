/**
 * GPU Streaming Client
 * Client application for accessing distributed GPU-powered LLM inference
 */

import { EventEmitter } from 'events';

export class GPUStreamingClient extends EventEmitter {
  constructor(serverUrl = 'http://localhost:3002') {
    super();
    this.serverUrl = serverUrl;
    this.socket = null;
    this.userId = null;
    this.isConnected = false;
    this.availableModels = [];
    this.systemStatus = null;
    
    this.connect();
  }

  async connect() {
    try {
      // Connect to WebSocket
      this.socket = new WebSocket(`ws://${this.serverUrl.replace('http', 'ws')}`);
      
      this.socket.onopen = () => {
        this.isConnected = true;
        console.log('🔌 Connected to GPU Streaming Service');
        this.emit('connected');
        this.fetchAvailableModels();
        this.fetchSystemStatus();
      };
      
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleSocketMessage(data);
      };
      
      this.socket.onclose = () => {
        this.isConnected = false;
        console.log('🔌 Disconnected from GPU Streaming Service');
        this.emit('disconnected');
      };
      
      this.socket.onerror = (error) => {
        console.error('🔌 WebSocket error:', error);
        this.emit('error', error);
      };
      
    } catch (error) {
      console.error('Failed to connect to GPU Streaming Service:', error);
      this.emit('error', error);
    }
  }

  handleSocketMessage(data) {
    switch (data.type) {
      case 'gpu:provider:new':
        this.emit('provider:new', data.provider);
        break;
      case 'gpu:stream:new':
        this.emit('stream:new', data.stream);
        break;
      case 'gpu:stream:completed':
        this.emit('stream:completed', data.stream);
        break;
      case 'llm:result':
        this.emit('inference:result', data.result);
        break;
      case 'llm:stream:token':
        this.emit('stream:token', data);
        break;
      case 'llm:stream:complete':
        this.emit('stream:complete', data);
        break;
      case 'ad:injected':
        this.emit('ad:injected', data);
        break;
      case 'revenue:earned':
        this.emit('revenue:earned', data);
        break;
      case 'payment:processed':
        this.emit('payment:processed', data);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  async fetchAvailableModels() {
    try {
      const response = await fetch(`${this.serverUrl}/api/llm/models`);
      const data = await response.json();
      
      if (data.success) {
        this.availableModels = data.models;
        this.emit('models:updated', this.availableModels);
      }
    } catch (error) {
      console.error('Failed to fetch available models:', error);
    }
  }

  async fetchSystemStatus() {
    try {
      const response = await fetch(`${this.serverUrl}/api/llm/status`);
      const data = await response.json();
      
      if (data.success) {
        this.systemStatus = data.status;
        this.emit('status:updated', this.systemStatus);
      }
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    }
  }

  async requestInference(prompt, model, options = {}) {
    if (!this.isConnected) {
      throw new Error('Not connected to GPU Streaming Service');
    }

    const requestData = {
      prompt,
      model,
      userId: this.userId || 'anonymous',
      adPreferences: options.adPreferences || {},
      quality: options.quality || 'standard',
      maxTokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7
    };

    try {
      const response = await fetch(`${this.serverUrl}/api/llm/inference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      
      if (data.success) {
        this.emit('inference:completed', data);
        return data;
      } else {
        throw new Error(data.error || 'Inference failed');
      }
    } catch (error) {
      console.error('Inference request failed:', error);
      this.emit('inference:error', error);
      throw error;
    }
  }

  async startStreamingInference(prompt, model, options = {}) {
    if (!this.isConnected) {
      throw new Error('Not connected to GPU Streaming Service');
    }

    const streamData = {
      prompt,
      model,
      userId: this.userId || 'anonymous',
      adPreferences: options.adPreferences || {},
      quality: options.quality || 'standard'
    };

    return new Promise((resolve, reject) => {
      const streamId = `stream_${Date.now()}`;
      const tokens = [];
      let isComplete = false;

      const onToken = (data) => {
        if (data.streamId === streamId) {
          tokens.push(data.token);
          this.emit('stream:token', data.token);
        }
      };

      const onComplete = (data) => {
        if (data.streamId === streamId && !isComplete) {
          isComplete = true;
          this.removeListener('stream:token', onToken);
          this.removeListener('stream:complete', onComplete);
          this.removeListener('stream:error', onError);
          
          const result = {
            tokens,
            fullText: tokens.join(''),
            ...data.result
          };
          
          resolve(result);
        }
      };

      const onError = (error) => {
        if (!isComplete) {
          isComplete = true;
          this.removeListener('stream:token', onToken);
          this.removeListener('stream:complete', onComplete);
          this.removeListener('stream:error', onError);
          reject(error);
        }
      };

      this.on('stream:token', onToken);
      this.on('stream:complete', onComplete);
      this.on('stream:error', onError);

      // Send streaming request via WebSocket
      this.socket.send(JSON.stringify({
        type: 'llm:stream',
        data: streamData
      }));
    });
  }

  setUserId(userId) {
    this.userId = userId;
    console.log(`👤 User ID set: ${userId}`);
  }

  setAdPreferences(preferences) {
    this.adPreferences = preferences;
    console.log('📢 Ad preferences updated:', preferences);
  }

  getAvailableModels() {
    return this.availableModels;
  }

  getSystemStatus() {
    return this.systemStatus;
  }

  isServiceAvailable() {
    return this.isConnected && this.systemStatus && this.systemStatus.idleProviders > 0;
  }

  getEstimatedCost(model, quality = 'standard', tokens = 1000) {
    if (!this.systemStatus) return null;
    
    // Rough cost estimation
    const baseCostPerToken = 0.0001; // $0.0001 per token
    const qualityMultipliers = {
      low: 0.8,
      standard: 1.0,
      high: 1.5,
      ultra: 2.0
    };
    
    const multiplier = qualityMultipliers[quality] || 1.0;
    const costPerToken = baseCostPerToken * multiplier;
    
    return {
      costPerToken,
      totalCost: costPerToken * tokens,
      quality,
      tokens
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
    this.isConnected = false;
  }
}

// Convenience functions for common use cases
export class GPUStreamingHelper {
  constructor(client) {
    this.client = client;
  }

  async chat(prompt, model = 'llama-3-70b', options = {}) {
    const enhancedPrompt = `You are a helpful AI assistant. Please respond to: ${prompt}`;
    return await this.client.requestInference(enhancedPrompt, model, options);
  }

  async codeCompletion(code, language, model = 'llama-3-70b', options = {}) {
    const prompt = `Complete the following ${language} code:\n\n${code}\n\n`;
    return await this.client.requestInference(prompt, model, {
      ...options,
      temperature: 0.3, // Lower temperature for code
      maxTokens: 2048
    });
  }

  async textGeneration(prompt, style = 'creative', model = 'llama-3-70b', options = {}) {
    const stylePrompts = {
      creative: 'Write a creative and engaging response to:',
      professional: 'Provide a professional and informative response to:',
      casual: 'Give a casual and friendly response to:',
      technical: 'Provide a technical and detailed response to:'
    };
    
    const enhancedPrompt = `${stylePrompts[style] || stylePrompts.creative} ${prompt}`;
    return await this.client.requestInference(enhancedPrompt, model, {
      ...options,
      temperature: style === 'creative' ? 0.8 : 0.7
    });
  }

  async streamingChat(prompt, model = 'llama-3-70b', options = {}) {
    const enhancedPrompt = `You are a helpful AI assistant. Please respond to: ${prompt}`;
    return await this.client.startStreamingInference(enhancedPrompt, model, options);
  }
} 