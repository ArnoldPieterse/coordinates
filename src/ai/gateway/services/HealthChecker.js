import winston from 'winston';
import os from 'os';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'gateway-health-checker' },
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

export class HealthChecker {
  constructor(services = []) {
    this.services = services;
    this.healthHistory = [];
    this.maxHistorySize = 100;
    this.periodicCheckInterval = null;
  }

  async checkHealth() {
    try {
      const healthChecks = await Promise.allSettled([
        this.checkServiceHealth(),
        this.checkSystemResources(),
        this.checkNetworkConnectivity()
      ]);

      const results = healthChecks.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          logger.error(`Health check ${index} failed:`, result.reason);
          return { status: 'unhealthy', error: result.reason.message };
        }
      });

      const overallHealth = this.determineOverallHealth(results);
      const healthStatus = {
        status: overallHealth,
        timestamp: new Date().toISOString(),
        checks: results,
        uptime: process.uptime()
      };

      // Store in history
      this.healthHistory.push(healthStatus);
      if (this.healthHistory.length > this.maxHistorySize) {
        this.healthHistory.shift();
      }

      return healthStatus;
    } catch (error) {
      logger.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        uptime: process.uptime()
      };
    }
  }

  async checkServiceHealth() {
    const serviceHealth = {};

    for (const service of this.services) {
      try {
        if (typeof service.getHealth === 'function') {
          serviceHealth[service.constructor.name] = await service.getHealth();
        } else {
          serviceHealth[service.constructor.name] = { status: 'unknown', error: 'No health check method' };
        }
      } catch (error) {
        logger.error(`Service health check failed for ${service.constructor.name}:`, error);
        serviceHealth[service.constructor.name] = { status: 'unhealthy', error: error.message };
      }
    }

    return {
      type: 'service_health',
      status: this.determineServiceHealthStatus(serviceHealth),
      services: serviceHealth
    };
  }

  async checkSystemResources() {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      const uptime = process.uptime();

      // Memory health check
      const memoryHealth = this.checkMemoryHealth(memUsage);
      
      // CPU health check
      const cpuHealth = this.checkCPUHealth(cpuUsage);

      return {
        type: 'system_resources',
        status: memoryHealth.status === 'healthy' && cpuHealth.status === 'healthy' ? 'healthy' : 'degraded',
        memory: memoryHealth,
        cpu: cpuHealth,
        uptime
      };
    } catch (error) {
      logger.error('System resources health check failed:', error);
      return {
        type: 'system_resources',
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async checkNetworkConnectivity() {
    try {
      const networkChecks = await Promise.allSettled([
        this.checkDNSResolution(),
        this.checkExternalConnectivity()
      ]);

      const results = networkChecks.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return { status: 'unhealthy', error: result.reason.message };
        }
      });

      return {
        type: 'network_connectivity',
        status: results.every(r => r.status === 'healthy') ? 'healthy' : 'degraded',
        checks: results
      };
    } catch (error) {
      logger.error('Network connectivity health check failed:', error);
      return {
        type: 'network_connectivity',
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  checkMemoryHealth(memUsage) {
    const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    const rssPercent = (memUsage.rss / os.totalmem()) * 100;

    if (heapUsedPercent > 90 || rssPercent > 80) {
      return {
        status: 'unhealthy',
        heapUsedPercent: Math.round(heapUsedPercent),
        rssPercent: Math.round(rssPercent),
        warning: 'Memory usage is high'
      };
    } else if (heapUsedPercent > 75 || rssPercent > 60) {
      return {
        status: 'degraded',
        heapUsedPercent: Math.round(heapUsedPercent),
        rssPercent: Math.round(rssPercent),
        warning: 'Memory usage is elevated'
      };
    } else {
      return {
        status: 'healthy',
        heapUsedPercent: Math.round(heapUsedPercent),
        rssPercent: Math.round(rssPercent)
      };
    }
  }

  checkCPUHealth(cpuUsage) {
    // Simple CPU health check based on usage patterns
    const totalUsage = cpuUsage.user + cpuUsage.system;
    
    if (totalUsage > 1000000000) { // 1 second in microseconds
      return {
        status: 'degraded',
        totalUsage,
        warning: 'CPU usage is elevated'
      };
    } else {
      return {
        status: 'healthy',
        totalUsage
      };
    }
  }

  async checkDNSResolution() {
    try {
      const dns = await import('dns');
      const { promisify } = await import('util');
      const resolve = promisify(dns.resolve);
      
      await resolve('google.com');
      return { status: 'healthy', message: 'DNS resolution working' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkExternalConnectivity() {
    try {
      const https = await import('https');
      const { promisify } = await import('util');
      
      const request = promisify((url, callback) => {
        https.get(url, (res) => {
          callback(null, res.statusCode);
        }).on('error', callback);
      });

      const statusCode = await request('https://httpbin.org/status/200');
      return { status: 'healthy', statusCode };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  determineServiceHealthStatus(serviceHealth) {
    const statuses = Object.values(serviceHealth).map(service => service.status);
    
    if (statuses.every(status => status === 'healthy')) {
      return 'healthy';
    } else if (statuses.some(status => status === 'unhealthy')) {
      return 'unhealthy';
    } else {
      return 'degraded';
    }
  }

  determineOverallHealth(healthChecks) {
    const statuses = healthChecks.map(check => check.status);
    
    if (statuses.every(status => status === 'healthy')) {
      return 'healthy';
    } else if (statuses.some(status => status === 'unhealthy')) {
      return 'unhealthy';
    } else {
      return 'degraded';
    }
  }

  async runHealthChecks() {
    try {
      const health = await this.checkHealth();
      logger.info('Periodic health check completed:', health.status);
      return health;
    } catch (error) {
      logger.error('Periodic health check failed:', error);
      throw error;
    }
  }

  getHealthStatus() {
    return this.healthHistory.length > 0 
      ? this.healthHistory[this.healthHistory.length - 1]
      : null;
  }

  isHealthy() {
    const currentHealth = this.getHealthStatus();
    return currentHealth && currentHealth.status === 'healthy';
  }

  getHealthHistory() {
    return [...this.healthHistory];
  }

  startPeriodicHealthChecks(intervalMs = 60000) {
    if (this.periodicCheckInterval) {
      clearInterval(this.periodicCheckInterval);
    }

    this.periodicCheckInterval = setInterval(async () => {
      try {
        await this.runHealthChecks();
      } catch (error) {
        logger.error('Periodic health check failed:', error);
      }
    }, intervalMs);

    logger.info(`Started periodic health checks every ${intervalMs}ms`);
  }

  stopPeriodicHealthChecks() {
    if (this.periodicCheckInterval) {
      clearInterval(this.periodicCheckInterval);
      this.periodicCheckInterval = null;
      logger.info('Stopped periodic health checks');
    }
  }
} 