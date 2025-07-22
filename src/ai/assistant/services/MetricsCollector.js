import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

export class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byEndpoint: new Map()
      },
      ai: {
        generations: 0,
        modelsUsed: new Map(),
        averageResponseTime: 0,
        totalTokens: 0
      },
      sessions: {
        active: 0,
        total: 0,
        averageDuration: 0
      },
      performance: {
        averageResponseTime: 0,
        peakResponseTime: 0,
        requestsPerMinute: 0
      },
      errors: {
        total: 0,
        byType: new Map(),
        recent: []
      },
      system: {
        memoryUsage: 0,
        cpuUsage: 0,
        uptime: 0
      }
    };
    
    this.startTime = Date.now();
    this.requestTimes = [];
    this.errorHistory = [];
  }

  recordRequest(endpoint, method, statusCode, responseTime) {
    try {
      // Update total requests
      this.metrics.requests.total++;
      
      if (statusCode >= 200 && statusCode < 400) {
        this.metrics.requests.successful++;
      } else {
        this.metrics.requests.failed++;
      }

      // Update endpoint-specific metrics
      const endpointKey = `${method} ${endpoint}`;
      if (!this.metrics.requests.byEndpoint.has(endpointKey)) {
        this.metrics.requests.byEndpoint.set(endpointKey, {
          total: 0,
          successful: 0,
          failed: 0,
          averageResponseTime: 0,
          totalResponseTime: 0
        });
      }

      const endpointMetrics = this.metrics.requests.byEndpoint.get(endpointKey);
      endpointMetrics.total++;
      endpointMetrics.totalResponseTime += responseTime;
      endpointMetrics.averageResponseTime = endpointMetrics.totalResponseTime / endpointMetrics.total;

      if (statusCode >= 200 && statusCode < 400) {
        endpointMetrics.successful++;
      } else {
        endpointMetrics.failed++;
      }

      // Update performance metrics
      this.requestTimes.push(responseTime);
      if (this.requestTimes.length > 1000) {
        this.requestTimes.shift(); // Keep only last 1000 requests
      }

      this.metrics.performance.averageResponseTime = 
        this.requestTimes.reduce((sum, time) => sum + time, 0) / this.requestTimes.length;
      
      this.metrics.performance.peakResponseTime = 
        Math.max(this.metrics.performance.peakResponseTime, responseTime);

      logger.debug(`Request recorded: ${endpointKey} - ${statusCode} - ${responseTime}ms`);
    } catch (error) {
      logger.error('Error recording request metrics:', error);
    }
  }

  recordAIGeneration(modelId, responseTime, tokensUsed) {
    try {
      this.metrics.ai.generations++;
      this.metrics.ai.totalTokens += tokensUsed || 0;

      // Update model usage
      if (!this.metrics.ai.modelsUsed.has(modelId)) {
        this.metrics.ai.modelsUsed.set(modelId, {
          generations: 0,
          totalTokens: 0,
          averageResponseTime: 0,
          totalResponseTime: 0
        });
      }

      const modelMetrics = this.metrics.ai.modelsUsed.get(modelId);
      modelMetrics.generations++;
      modelMetrics.totalTokens += tokensUsed || 0;
      modelMetrics.totalResponseTime += responseTime;
      modelMetrics.averageResponseTime = modelMetrics.totalResponseTime / modelMetrics.generations;

      // Update overall AI average response time
      const totalGenerations = Array.from(this.metrics.ai.modelsUsed.values())
        .reduce((sum, metrics) => sum + metrics.generations, 0);
      
      const totalResponseTime = Array.from(this.metrics.ai.modelsUsed.values())
        .reduce((sum, metrics) => sum + metrics.totalResponseTime, 0);
      
      this.metrics.ai.averageResponseTime = totalResponseTime / totalGenerations;

      logger.debug(`AI generation recorded: ${modelId} - ${responseTime}ms - ${tokensUsed} tokens`);
    } catch (error) {
      logger.error('Error recording AI generation metrics:', error);
    }
  }

  recordSession(sessionId, action, duration = 0) {
    try {
      if (action === 'created') {
        this.metrics.sessions.total++;
        this.metrics.sessions.active++;
      } else if (action === 'ended') {
        this.metrics.sessions.active = Math.max(0, this.metrics.sessions.active - 1);
        
        // Update average session duration
        const currentTotal = this.metrics.sessions.total;
        const currentAverage = this.metrics.sessions.averageDuration;
        this.metrics.sessions.averageDuration = 
          ((currentAverage * (currentTotal - 1)) + duration) / currentTotal;
      }

      logger.debug(`Session ${action}: ${sessionId} - duration: ${duration}ms`);
    } catch (error) {
      logger.error('Error recording session metrics:', error);
    }
  }

  recordError(error, context = {}) {
    try {
      this.metrics.errors.total++;
      
      const errorType = error.name || 'Unknown';
      if (!this.metrics.errors.byType.has(errorType)) {
        this.metrics.errors.byType.set(errorType, 0);
      }
      this.metrics.errors.byType.set(errorType, this.metrics.errors.byType.get(errorType) + 1);

      // Add to recent errors (keep last 100)
      const errorRecord = {
        timestamp: new Date(),
        type: errorType,
        message: error.message,
        stack: error.stack,
        context
      };

      this.metrics.errors.recent.push(errorRecord);
      if (this.metrics.errors.recent.length > 100) {
        this.metrics.errors.recent.shift();
      }

      logger.error(`Error recorded: ${errorType} - ${error.message}`, { context });
    } catch (err) {
      logger.error('Error recording error metrics:', err);
    }
  }

  updateSystemMetrics() {
    try {
      const memUsage = process.memoryUsage();
      this.metrics.system.memoryUsage = memUsage.heapUsed / 1024 / 1024; // MB
      this.metrics.system.uptime = process.uptime();

      // Calculate requests per minute
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      const recentRequests = this.requestTimes.filter(time => time > oneMinuteAgo);
      this.metrics.performance.requestsPerMinute = recentRequests.length;

      logger.debug('System metrics updated');
    } catch (error) {
      logger.error('Error updating system metrics:', error);
    }
  }

  async collectMetrics() {
    try {
      this.updateSystemMetrics();
      
      // Calculate additional derived metrics
      const uptime = Date.now() - this.startTime;
      const requestsPerSecond = this.metrics.requests.total / (uptime / 1000);
      
      const enhancedMetrics = {
        ...this.metrics,
        derived: {
          uptime: uptime,
          requestsPerSecond: requestsPerSecond,
          successRate: this.metrics.requests.total > 0 ? 
            (this.metrics.requests.successful / this.metrics.requests.total) * 100 : 0,
          errorRate: this.metrics.requests.total > 0 ? 
            (this.metrics.requests.failed / this.metrics.requests.total) * 100 : 0
        },
        timestamp: new Date()
      };

      logger.info('Metrics collection completed', {
        totalRequests: this.metrics.requests.total,
        successRate: enhancedMetrics.derived.successRate.toFixed(2) + '%',
        averageResponseTime: this.metrics.performance.averageResponseTime.toFixed(2) + 'ms'
      });

      return enhancedMetrics;
    } catch (error) {
      logger.error('Error collecting metrics:', error);
      throw error;
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      derived: {
        uptime: Date.now() - this.startTime,
        requestsPerSecond: this.metrics.requests.total / ((Date.now() - this.startTime) / 1000),
        successRate: this.metrics.requests.total > 0 ? 
          (this.metrics.requests.successful / this.metrics.requests.total) * 100 : 0,
        errorRate: this.metrics.requests.total > 0 ? 
          (this.metrics.requests.failed / this.metrics.requests.total) * 100 : 0
      },
      timestamp: new Date()
    };
  }

  getEndpointMetrics() {
    const endpointMetrics = {};
    for (const [endpoint, metrics] of this.metrics.requests.byEndpoint) {
      endpointMetrics[endpoint] = {
        ...metrics,
        successRate: metrics.total > 0 ? (metrics.successful / metrics.total) * 100 : 0
      };
    }
    return endpointMetrics;
  }

  getModelMetrics() {
    const modelMetrics = {};
    for (const [modelId, metrics] of this.metrics.ai.modelsUsed) {
      modelMetrics[modelId] = {
        ...metrics,
        tokenEfficiency: metrics.generations > 0 ? metrics.totalTokens / metrics.generations : 0
      };
    }
    return modelMetrics;
  }

  getErrorMetrics() {
    const errorMetrics = {};
    for (const [errorType, count] of this.metrics.errors.byType) {
      errorMetrics[errorType] = {
        count,
        percentage: this.metrics.errors.total > 0 ? (count / this.metrics.errors.total) * 100 : 0
      };
    }
    return errorMetrics;
  }

  resetMetrics() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byEndpoint: new Map()
      },
      ai: {
        generations: 0,
        modelsUsed: new Map(),
        averageResponseTime: 0,
        totalTokens: 0
      },
      sessions: {
        active: 0,
        total: 0,
        averageDuration: 0
      },
      performance: {
        averageResponseTime: 0,
        peakResponseTime: 0,
        requestsPerMinute: 0
      },
      errors: {
        total: 0,
        byType: new Map(),
        recent: []
      },
      system: {
        memoryUsage: 0,
        cpuUsage: 0,
        uptime: 0
      }
    };
    
    this.startTime = Date.now();
    this.requestTimes = [];
    this.errorHistory = [];
    
    logger.info('Metrics reset');
  }

  exportMetrics() {
    return {
      metrics: this.getMetrics(),
      endpointMetrics: this.getEndpointMetrics(),
      modelMetrics: this.getModelMetrics(),
      errorMetrics: this.getErrorMetrics(),
      exportTime: new Date()
    };
  }
} 