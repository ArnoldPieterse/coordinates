/**
 * GPU Streaming Manager
 * Manages distributed GPU providers and load balancing for LLM inference
 */

import { EventEmitter } from 'events';
import { GPUProvider } from './gpu-provider.js';
import { StreamQualityManager } from './stream-quality-manager.js';

export class GPUStreamingManager extends EventEmitter {
  constructor() {
    super();
    this.providers = new Map();
    this.activeStreams = new Map();
    this.qualityManager = new StreamQualityManager();
    this.nextProviderId = 1;
    this.nextStreamId = 1;
    
    // Performance tracking
    this.usageStats = {
      totalInference: 0,
      totalTokens: 0,
      totalRevenue: 0,
      averageLatency: 0
    };
  }

  async registerProvider(gpuInfo, capabilities, pricing) {
    const providerId = `provider_${this.nextProviderId++}`;
    
    const provider = new GPUProvider(providerId, {
      gpuInfo,
      capabilities,
      pricing,
      status: 'idle',
      registeredAt: new Date(),
      totalEarnings: 0,
      totalInference: 0
    });

    this.providers.set(providerId, provider);
    
    console.log(`🖥️ GPU Provider registered: ${providerId}`);
    console.log(`   GPU: ${gpuInfo.name} (${gpuInfo.memory}GB VRAM)`);
    console.log(`   Models: ${capabilities.models.join(', ')}`);
    console.log(`   Pricing: $${pricing.perToken}/token`);
    
    this.emit('provider:registered', provider);
    return providerId;
  }

  async startStream(providerId, model, quality = 'standard') {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error('Provider not found');
    }

    if (provider.status !== 'idle') {
      throw new Error('Provider is not available');
    }

    if (!provider.capabilities.models.includes(model)) {
      throw new Error('Model not supported by this provider');
    }

    const streamId = `stream_${this.nextStreamId++}`;
    const stream = {
      id: streamId,
      providerId,
      model,
      quality,
      status: 'active',
      startedAt: new Date(),
      tokensProcessed: 0,
      revenue: 0,
      latency: 0
    };

    provider.status = 'streaming';
    provider.currentStream = streamId;
    this.activeStreams.set(streamId, stream);
    
    console.log(`📡 GPU Stream started: ${streamId}`);
    console.log(`   Provider: ${providerId}`);
    console.log(`   Model: ${model}`);
    console.log(`   Quality: ${quality}`);
    
    this.emit('stream:started', stream);
    return streamId;
  }

  async stopStream(providerId, streamId) {
    const provider = this.providers.get(providerId);
    const stream = this.activeStreams.get(streamId);
    
    if (!provider || !stream) {
      throw new Error('Provider or stream not found');
    }

    if (stream.providerId !== providerId) {
      throw new Error('Stream does not belong to this provider');
    }

    // Calculate final metrics
    const duration = Date.now() - stream.startedAt.getTime();
    const tokensPerSecond = stream.tokensProcessed / (duration / 1000);
    
    // Update provider earnings
    const earnings = stream.tokensProcessed * provider.pricing.perToken;
    provider.totalEarnings += earnings;
    provider.totalInference += stream.tokensProcessed;
    
    // Update global stats
    this.usageStats.totalInference += stream.tokensProcessed;
    this.usageStats.totalRevenue += earnings;
    this.usageStats.averageLatency = (this.usageStats.averageLatency + stream.latency) / 2;

    // Cleanup
    provider.status = 'idle';
    provider.currentStream = null;
    this.activeStreams.delete(streamId);
    
    console.log(`🛑 GPU Stream stopped: ${streamId}`);
    console.log(`   Tokens processed: ${stream.tokensProcessed}`);
    console.log(`   Earnings: $${earnings.toFixed(4)}`);
    console.log(`   Tokens/sec: ${tokensPerSecond.toFixed(2)}`);
    
    this.emit('stream:completed', { ...stream, earnings, duration });
  }

  async findAvailableProvider(model, quality = 'standard') {
    const availableProviders = Array.from(this.providers.values())
      .filter(provider => 
        provider.status === 'idle' && 
        provider.capabilities.models.includes(model)
      );

    if (availableProviders.length === 0) {
      return null;
    }

    // Score providers based on performance, pricing, and quality
    const scoredProviders = availableProviders.map(provider => {
      const score = this.calculateProviderScore(provider, model, quality);
      return { provider, score };
    });

    // Return the best provider
    scoredProviders.sort((a, b) => b.score - a.score);
    return scoredProviders[0].provider;
  }

  calculateProviderScore(provider, model, quality) {
    let score = 0;
    
    // Base score from GPU performance
    score += provider.gpuInfo.memory * 10; // More VRAM = better
    score += provider.gpuInfo.cores * 5;   // More cores = better
    
    // Pricing factor (lower price = higher score)
    const priceFactor = 1 / provider.pricing.perToken;
    score += priceFactor * 1000;
    
    // Quality factor
    const qualityMultiplier = this.qualityManager.getQualityMultiplier(quality);
    score *= qualityMultiplier;
    
    // Reliability factor (based on historical performance)
    const reliabilityFactor = provider.totalInference > 0 ? 
      (provider.totalEarnings / provider.totalInference) : 1;
    score *= reliabilityFactor;
    
    return score;
  }

  async trackUsage(providerId, model, tokens) {
    const provider = this.providers.get(providerId);
    if (!provider) return;

    const stream = this.activeStreams.get(provider.currentStream);
    if (stream) {
      stream.tokensProcessed += tokens;
      stream.revenue += tokens * provider.pricing.perToken;
    }

    provider.totalInference += tokens;
    this.usageStats.totalTokens += tokens;
  }

  getProviderCount() {
    return this.providers.size;
  }

  getActiveStreamCount() {
    return this.activeStreams.size;
  }

  async getAvailableModels() {
    const models = new Set();
    for (const provider of this.providers.values()) {
      provider.capabilities.models.forEach(model => models.add(model));
    }
    return Array.from(models);
  }

  async getSystemStatus() {
    const idleProviders = Array.from(this.providers.values())
      .filter(p => p.status === 'idle').length;
    
    const streamingProviders = Array.from(this.providers.values())
      .filter(p => p.status === 'streaming').length;

    return {
      totalProviders: this.providers.size,
      idleProviders,
      streamingProviders,
      activeStreams: this.activeStreams.size,
      totalInference: this.usageStats.totalInference,
      totalRevenue: this.usageStats.totalRevenue,
      averageLatency: this.usageStats.averageLatency
    };
  }

  async getUsageAnalytics() {
    const providers = Array.from(this.providers.values());
    const totalEarnings = providers.reduce((sum, p) => sum + p.totalEarnings, 0);
    const totalInference = providers.reduce((sum, p) => sum + p.totalInference, 0);
    
    return {
      totalProviders: providers.length,
      totalEarnings,
      totalInference,
      averageEarningsPerProvider: totalEarnings / providers.length,
      averageInferencePerProvider: totalInference / providers.length,
      topProviders: providers
        .sort((a, b) => b.totalEarnings - a.totalEarnings)
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          earnings: p.totalEarnings,
          inference: p.totalInference,
          gpu: p.gpuInfo.name
        }))
    };
  }

  getProvider(providerId) {
    return this.providers.get(providerId);
  }

  getStream(streamId) {
    return this.activeStreams.get(streamId);
  }

  removeProvider(providerId) {
    const provider = this.providers.get(providerId);
    if (provider && provider.currentStream) {
      this.stopStream(providerId, provider.currentStream);
    }
    this.providers.delete(providerId);
    console.log(`🗑️ GPU Provider removed: ${providerId}`);
  }
} 