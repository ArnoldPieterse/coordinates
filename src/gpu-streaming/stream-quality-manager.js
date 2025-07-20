/**
 * Stream Quality Manager
 * Manages different quality levels and their impact on performance and pricing
 */

export class StreamQualityManager {
  constructor() {
    this.qualityLevels = {
      low: {
        name: 'Low Quality',
        description: 'Fast inference with basic quality',
        multiplier: 0.7,
        latencyMultiplier: 0.5,
        memoryMultiplier: 0.7,
        costMultiplier: 0.8,
        maxTokens: 2048,
        temperature: 0.9,
        topP: 0.95
      },
      standard: {
        name: 'Standard Quality',
        description: 'Balanced performance and quality',
        multiplier: 1.0,
        latencyMultiplier: 1.0,
        memoryMultiplier: 1.0,
        costMultiplier: 1.0,
        maxTokens: 4096,
        temperature: 0.7,
        topP: 0.9
      },
      high: {
        name: 'High Quality',
        description: 'Enhanced quality with moderate performance impact',
        multiplier: 1.3,
        latencyMultiplier: 1.5,
        memoryMultiplier: 1.3,
        costMultiplier: 1.5,
        maxTokens: 8192,
        temperature: 0.6,
        topP: 0.85
      },
      ultra: {
        name: 'Ultra Quality',
        description: 'Maximum quality with significant performance impact',
        multiplier: 1.6,
        latencyMultiplier: 2.0,
        memoryMultiplier: 1.6,
        costMultiplier: 2.0,
        maxTokens: 16384,
        temperature: 0.5,
        topP: 0.8
      }
    };
    
    this.adaptiveQuality = {
      enabled: true,
      minQuality: 'low',
      maxQuality: 'ultra',
      targetLatency: 1000, // ms
      targetThroughput: 100 // tokens per second
    };
  }

  getQualityLevel(quality) {
    return this.qualityLevels[quality] || this.qualityLevels.standard;
  }

  getQualityMultiplier(quality) {
    const level = this.getQualityLevel(quality);
    return level.multiplier;
  }

  getLatencyMultiplier(quality) {
    const level = this.getQualityLevel(quality);
    return level.latencyMultiplier;
  }

  getMemoryMultiplier(quality) {
    const level = this.getQualityLevel(quality);
    return level.memoryMultiplier;
  }

  getCostMultiplier(quality) {
    const level = this.getQualityLevel(quality);
    return level.costMultiplier;
  }

  calculateAdjustedLatency(baseLatency, quality) {
    const multiplier = this.getLatencyMultiplier(quality);
    return baseLatency * multiplier;
  }

  calculateAdjustedMemory(baseMemory, quality) {
    const multiplier = this.getMemoryMultiplier(quality);
    return Math.ceil(baseMemory * multiplier);
  }

  calculateAdjustedCost(baseCost, quality) {
    const multiplier = this.getCostMultiplier(quality);
    return baseCost * multiplier;
  }

  getModelParameters(quality) {
    const level = this.getQualityLevel(quality);
    return {
      maxTokens: level.maxTokens,
      temperature: level.temperature,
      topP: level.topP
    };
  }

  getAvailableQualities() {
    return Object.keys(this.qualityLevels).map(quality => ({
      id: quality,
      ...this.qualityLevels[quality]
    }));
  }

  suggestOptimalQuality(providerCapabilities, model, targetLatency = null) {
    const modelRequirements = this.getModelRequirements(model);
    const providerMemory = providerCapabilities.gpuInfo.memory;
    
    // Find the highest quality that fits in memory
    const suitableQualities = Object.keys(this.qualityLevels).filter(quality => {
      const requiredMemory = this.calculateAdjustedMemory(modelRequirements.memory, quality);
      return requiredMemory <= providerMemory;
    });
    
    if (suitableQualities.length === 0) {
      return 'low'; // Fallback to lowest quality
    }
    
    // If target latency is specified, consider it
    if (targetLatency && this.adaptiveQuality.enabled) {
      const latencySuitableQualities = suitableQualities.filter(quality => {
        const estimatedLatency = this.calculateAdjustedLatency(modelRequirements.baseLatency, quality);
        return estimatedLatency <= targetLatency;
      });
      
      if (latencySuitableQualities.length > 0) {
        // Return the highest quality that meets latency requirements
        return latencySuitableQualities[latencySuitableQualities.length - 1];
      }
    }
    
    // Return the highest suitable quality
    return suitableQualities[suitableQualities.length - 1];
  }

  getModelRequirements(model) {
    const baseRequirements = {
      'llama-3-70b': { memory: 24, baseLatency: 500 },
      'gpt-4': { memory: 16, baseLatency: 300 },
      'claude-3-opus': { memory: 32, baseLatency: 800 },
      'gemini-pro': { memory: 16, baseLatency: 400 },
      'mistral-7b': { memory: 8, baseLatency: 200 }
    };
    
    return baseRequirements[model] || { memory: 8, baseLatency: 300 };
  }

  getQualityComparison(model, providerCapabilities) {
    const comparisons = [];
    const modelRequirements = this.getModelRequirements(model);
    
    for (const [quality, config] of Object.entries(this.qualityLevels)) {
      const requiredMemory = this.calculateAdjustedMemory(modelRequirements.memory, quality);
      const estimatedLatency = this.calculateAdjustedLatency(modelRequirements.baseLatency, quality);
      const estimatedCost = this.calculateAdjustedCost(0.0001, quality); // Base cost per token
      
      comparisons.push({
        quality,
        name: config.name,
        description: config.description,
        requiredMemory,
        estimatedLatency,
        estimatedCost,
        supported: requiredMemory <= providerCapabilities.gpuInfo.memory,
        parameters: this.getModelParameters(quality)
      });
    }
    
    return comparisons.sort((a, b) => {
      // Sort by quality level priority
      const qualityOrder = { low: 0, standard: 1, high: 2, ultra: 3 };
      return qualityOrder[a.quality] - qualityOrder[b.quality];
    });
  }

  enableAdaptiveQuality(enabled = true) {
    this.adaptiveQuality.enabled = enabled;
  }

  setAdaptiveQualityTargets(targetLatency, targetThroughput) {
    this.adaptiveQuality.targetLatency = targetLatency;
    this.adaptiveQuality.targetThroughput = targetThroughput;
  }

  setAdaptiveQualityRange(minQuality, maxQuality) {
    this.adaptiveQuality.minQuality = minQuality;
    this.adaptiveQuality.maxQuality = maxQuality;
  }

  getAdaptiveQualitySettings() {
    return this.adaptiveQuality;
  }

  addCustomQualityLevel(id, config) {
    this.qualityLevels[id] = {
      name: config.name || 'Custom Quality',
      description: config.description || 'Custom quality level',
      multiplier: config.multiplier || 1.0,
      latencyMultiplier: config.latencyMultiplier || 1.0,
      memoryMultiplier: config.memoryMultiplier || 1.0,
      costMultiplier: config.costMultiplier || 1.0,
      maxTokens: config.maxTokens || 4096,
      temperature: config.temperature || 0.7,
      topP: config.topP || 0.9
    };
  }

  removeQualityLevel(quality) {
    if (quality !== 'standard') { // Don't allow removal of standard quality
      delete this.qualityLevels[quality];
    }
  }

  getQualityStats() {
    const stats = {
      totalLevels: Object.keys(this.qualityLevels).length,
      adaptiveEnabled: this.adaptiveQuality.enabled,
      levels: {}
    };
    
    for (const [quality, config] of Object.entries(this.qualityLevels)) {
      stats.levels[quality] = {
        name: config.name,
        multiplier: config.multiplier,
        costMultiplier: config.costMultiplier,
        maxTokens: config.maxTokens
      };
    }
    
    return stats;
  }
} 