/**
 * GPU Provider
 * Represents an individual GPU provider in the distributed network
 */

export class GPUProvider {
  constructor(id, config) {
    this.id = id;
    this.gpuInfo = config.gpuInfo;
    this.capabilities = config.capabilities;
    this.pricing = config.pricing;
    this.status = config.status || 'idle';
    this.registeredAt = config.registeredAt || new Date();
    this.totalEarnings = config.totalEarnings || 0;
    this.totalInference = config.totalInference || 0;
    
    // Performance tracking
    this.performance = {
      averageLatency: 0,
      totalRequests: 0,
      successRate: 1.0,
      uptime: 100,
      lastHeartbeat: new Date()
    };
    
    // Current stream info
    this.currentStream = null;
    this.streamStartTime = null;
    
    // GPU monitoring
    this.gpuMetrics = {
      temperature: 0,
      memoryUsage: 0,
      utilization: 0,
      powerDraw: 0
    };
  }

  updateStatus(newStatus) {
    this.status = newStatus;
    this.lastStatusUpdate = new Date();
  }

  startStream(streamId, model, quality) {
    if (this.status !== 'idle') {
      throw new Error('Provider is not available');
    }
    
    this.status = 'streaming';
    this.currentStream = streamId;
    this.streamStartTime = new Date();
    this.currentModel = model;
    this.currentQuality = quality;
    
    console.log(`🖥️ GPU Provider ${this.id} started streaming ${model}`);
  }

  stopStream() {
    if (this.status !== 'streaming') {
      throw new Error('Provider is not streaming');
    }
    
    const streamDuration = Date.now() - this.streamStartTime.getTime();
    
    this.status = 'idle';
    this.currentStream = null;
    this.streamStartTime = null;
    this.currentModel = null;
    this.currentQuality = null;
    
    console.log(`🖥️ GPU Provider ${this.id} stopped streaming (duration: ${streamDuration}ms)`);
    
    return {
      duration: streamDuration,
      model: this.currentModel,
      quality: this.currentQuality
    };
  }

  updatePerformance(metrics) {
    this.performance = {
      ...this.performance,
      ...metrics,
      lastUpdate: new Date()
    };
  }

  updateGPUMetrics(metrics) {
    this.gpuMetrics = {
      ...this.gpuMetrics,
      ...metrics,
      timestamp: new Date()
    };
  }

  addEarnings(amount) {
    this.totalEarnings += amount;
  }

  addInference(tokens) {
    this.totalInference += tokens;
  }

  getUptime() {
    const now = new Date();
    const uptimeMs = now.getTime() - this.registeredAt.getTime();
    const totalUptimeMs = 24 * 60 * 60 * 1000; // 24 hours
    return Math.min((uptimeMs / totalUptimeMs) * 100, 100);
  }

  getEfficiency() {
    if (this.totalInference === 0) return 0;
    
    // Calculate efficiency based on earnings per token
    const efficiency = this.totalEarnings / this.totalInference;
    return Math.min(efficiency * 1000, 100); // Normalize to 0-100
  }

  getHealthScore() {
    let score = 100;
    
    // Temperature penalty
    if (this.gpuMetrics.temperature > 80) {
      score -= (this.gpuMetrics.temperature - 80) * 2;
    }
    
    // Memory usage penalty
    if (this.gpuMetrics.memoryUsage > 90) {
      score -= (this.gpuMetrics.memoryUsage - 90) * 1.5;
    }
    
    // Uptime penalty
    const uptime = this.getUptime();
    if (uptime < 95) {
      score -= (95 - uptime) * 2;
    }
    
    // Success rate penalty
    if (this.performance.successRate < 0.95) {
      score -= (0.95 - this.performance.successRate) * 100;
    }
    
    return Math.max(score, 0);
  }

  isHealthy() {
    return this.getHealthScore() > 70;
  }

  canHandleModel(model, quality = 'standard') {
    // Check if model is supported
    if (!this.capabilities.models.includes(model)) {
      return false;
    }
    
    // Check GPU memory requirements
    const modelRequirements = this.getModelRequirements(model, quality);
    if (this.gpuInfo.memory < modelRequirements.memory) {
      return false;
    }
    
    // Check if provider is available
    if (this.status !== 'idle') {
      return false;
    }
    
    // Check health
    if (!this.isHealthy()) {
      return false;
    }
    
    return true;
  }

  getModelRequirements(model, quality) {
    const baseRequirements = {
      'llama-3-70b': { memory: 24, cores: 4000 },
      'gpt-4': { memory: 16, cores: 3000 },
      'claude-3-opus': { memory: 32, cores: 5000 },
      'gemini-pro': { memory: 16, cores: 3000 },
      'mistral-7b': { memory: 8, cores: 2000 }
    };
    
    const base = baseRequirements[model] || { memory: 8, cores: 2000 };
    
    // Adjust for quality
    const qualityMultipliers = {
      'low': 0.7,
      'standard': 1.0,
      'high': 1.3,
      'ultra': 1.6
    };
    
    const multiplier = qualityMultipliers[quality] || 1.0;
    
    return {
      memory: Math.ceil(base.memory * multiplier),
      cores: Math.ceil(base.cores * multiplier)
    };
  }

  getPricingForModel(model, quality = 'standard') {
    const basePrice = this.pricing.perToken;
    const qualityMultipliers = {
      'low': 0.8,
      'standard': 1.0,
      'high': 1.5,
      'ultra': 2.0
    };
    
    const multiplier = qualityMultipliers[quality] || 1.0;
    return basePrice * multiplier;
  }

  getStats() {
    return {
      id: this.id,
      status: this.status,
      gpu: this.gpuInfo.name,
      memory: this.gpuInfo.memory,
      totalEarnings: this.totalEarnings,
      totalInference: this.totalInference,
      uptime: this.getUptime(),
      efficiency: this.getEfficiency(),
      healthScore: this.getHealthScore(),
      currentStream: this.currentStream,
      registeredAt: this.registeredAt,
      lastHeartbeat: this.performance.lastHeartbeat
    };
  }

  getDetailedStats() {
    return {
      ...this.getStats(),
      performance: this.performance,
      gpuMetrics: this.gpuMetrics,
      capabilities: this.capabilities,
      pricing: this.pricing
    };
  }

  heartbeat() {
    this.performance.lastHeartbeat = new Date();
  }

  isAlive() {
    const now = new Date();
    const timeSinceHeartbeat = now.getTime() - this.performance.lastHeartbeat.getTime();
    return timeSinceHeartbeat < 60000; // 1 minute timeout
  }

  toJSON() {
    return {
      id: this.id,
      gpuInfo: this.gpuInfo,
      capabilities: this.capabilities,
      pricing: this.pricing,
      status: this.status,
      totalEarnings: this.totalEarnings,
      totalInference: this.totalInference,
      performance: this.performance,
      gpuMetrics: this.gpuMetrics,
      registeredAt: this.registeredAt
    };
  }
} 