import winston from 'winston';
import os from 'os';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'gateway-metrics' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        byEndpoint: {},
        byMethod: {},
        byStatus: {}
      },
      responseTimes: {
        average: 0,
        min: Infinity,
        max: 0,
        total: 0,
        count: 0
      },
      errors: {
        total: 0,
        byType: {},
        byEndpoint: {}
      },
      system: {
        memory: {},
        cpu: {},
        uptime: 0
      },
      services: {
        aiAssistant: { requests: 0, errors: 0, avgResponseTime: 0 },
        aiModelRunner: { requests: 0, errors: 0, avgResponseTime: 0 }
      },
      circuitBreakers: {},
      startTime: Date.now()
    };
  }

  recordRequest(endpoint, method, statusCode, responseTime) {
    // Update total requests
    this.metrics.requests.total++;

    // Update endpoint metrics
    if (!this.metrics.requests.byEndpoint[endpoint]) {
      this.metrics.requests.byEndpoint[endpoint] = { total: 0, byMethod: {}, byStatus: {} };
    }
    this.metrics.requests.byEndpoint[endpoint].total++;

    // Update method metrics
    if (!this.metrics.requests.byMethod[method]) {
      this.metrics.requests.byMethod[method] = 0;
    }
    this.metrics.requests.byMethod[method]++;

    // Update status code metrics
    if (!this.metrics.requests.byStatus[statusCode]) {
      this.metrics.requests.byStatus[statusCode] = 0;
    }
    this.metrics.requests.byStatus[statusCode]++;

    // Update response time metrics
    this.updateResponseTimeMetrics(responseTime);
  }

  recordServiceRequest(serviceName, responseTime, success = true) {
    if (!this.metrics.services[serviceName]) {
      this.metrics.services[serviceName] = { requests: 0, errors: 0, avgResponseTime: 0 };
    }

    const service = this.metrics.services[serviceName];
    service.requests++;

    if (!success) {
      service.errors++;
    }

    // Update average response time
    const totalTime = service.avgResponseTime * (service.requests - 1) + responseTime;
    service.avgResponseTime = totalTime / service.requests;
  }

  recordError(error, context = 'unknown') {
    this.metrics.errors.total++;

    // Update error type metrics
    const errorType = error.constructor.name || 'UnknownError';
    if (!this.metrics.errors.byType[errorType]) {
      this.metrics.errors.byType[errorType] = 0;
    }
    this.metrics.errors.byType[errorType]++;

    // Update error context metrics
    if (!this.metrics.errors.byEndpoint[context]) {
      this.metrics.errors.byEndpoint[context] = 0;
    }
    this.metrics.errors.byEndpoint[context]++;

    logger.error(`Error recorded in ${context}:`, error.message);
  }

  updateCircuitBreakerMetrics(serviceUrl, state, stats) {
    this.metrics.circuitBreakers[serviceUrl] = {
      state,
      stats: { ...stats },
      lastUpdated: Date.now()
    };
  }

  updateResponseTimeMetrics(responseTime) {
    const { responseTimes } = this.metrics;
    
    responseTimes.total += responseTime;
    responseTimes.count++;
    responseTimes.average = responseTimes.total / responseTimes.count;
    responseTimes.min = Math.min(responseTimes.min, responseTime);
    responseTimes.max = Math.max(responseTimes.max, responseTime);
  }

  updateSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();

    this.metrics.system = {
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      uptime,
      os: {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem()
      }
    };
  }

  getMetrics() {
    this.updateSystemMetrics();
    
    return {
      ...this.metrics,
      currentTime: Date.now(),
      uptime: Date.now() - this.metrics.startTime
    };
  }

  getEndpointMetrics() {
    return this.metrics.requests.byEndpoint;
  }

  getServiceMetrics() {
    return this.metrics.services;
  }

  getErrorMetrics() {
    return this.metrics.errors;
  }

  getCircuitBreakerMetrics() {
    return this.metrics.circuitBreakers;
  }

  getSystemMetrics() {
    this.updateSystemMetrics();
    return this.metrics.system;
  }

  resetMetrics() {
    this.metrics = {
      requests: {
        total: 0,
        byEndpoint: {},
        byMethod: {},
        byStatus: {}
      },
      responseTimes: {
        average: 0,
        min: Infinity,
        max: 0,
        total: 0,
        count: 0
      },
      errors: {
        total: 0,
        byType: {},
        byEndpoint: {}
      },
      system: {
        memory: {},
        cpu: {},
        uptime: 0
      },
      services: {
        aiAssistant: { requests: 0, errors: 0, avgResponseTime: 0 },
        aiModelRunner: { requests: 0, errors: 0, avgResponseTime: 0 }
      },
      circuitBreakers: {},
      startTime: Date.now()
    };
    
    logger.info('Metrics reset');
  }

  exportMetrics() {
    const metrics = this.getMetrics();
    return {
      timestamp: new Date().toISOString(),
      service: 'ai-gateway',
      version: '1.0.0',
      metrics
    };
  }
} 