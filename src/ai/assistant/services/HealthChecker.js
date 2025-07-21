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

export class HealthChecker {
  constructor(services = []) {
    this.services = services;
    this.healthStatus = {
      overall: 'healthy',
      services: {},
      lastCheck: null,
      uptime: 0
    };
    this.startTime = Date.now();
  }

  async checkHealth() {
    try {
      const startTime = Date.now();
      this.healthStatus.lastCheck = new Date();
      this.healthStatus.uptime = Date.now() - this.startTime;

      // Check each service
      const serviceChecks = await Promise.allSettled(
        this.services.map(service => this.checkService(service))
      );

      // Process service check results
      let healthyServices = 0;
      let totalServices = this.services.length;

      serviceChecks.forEach((result, index) => {
        const service = this.services[index];
        const serviceName = service.constructor.name;
        
        if (result.status === 'fulfilled') {
          this.healthStatus.services[serviceName] = {
            status: 'healthy',
            details: result.value,
            lastCheck: new Date()
          };
          healthyServices++;
        } else {
          this.healthStatus.services[serviceName] = {
            status: 'unhealthy',
            error: result.reason.message,
            lastCheck: new Date()
          };
        }
      });

      // Determine overall health
      const healthPercentage = totalServices > 0 ? (healthyServices / totalServices) * 100 : 100;
      
      if (healthPercentage === 100) {
        this.healthStatus.overall = 'healthy';
      } else if (healthPercentage >= 80) {
        this.healthStatus.overall = 'degraded';
      } else {
        this.healthStatus.overall = 'unhealthy';
      }

      const checkTime = Date.now() - startTime;
      
      logger.info(`Health check completed in ${checkTime}ms`, {
        overall: this.healthStatus.overall,
        healthyServices,
        totalServices,
        healthPercentage: healthPercentage.toFixed(1) + '%'
      });

      return {
        ...this.healthStatus,
        checkTime,
        healthPercentage
      };

    } catch (error) {
      logger.error('Health check failed:', error);
      this.healthStatus.overall = 'unhealthy';
      this.healthStatus.error = error.message;
      return this.healthStatus;
    }
  }

  async checkService(service) {
    try {
      const serviceName = service.constructor.name;
      
      // Check if service has a health check method
      if (typeof service.getHealth === 'function') {
        return await service.getHealth();
      }
      
      // Check if service has a ping method
      if (typeof service.ping === 'function') {
        const isAlive = await service.ping();
        return { status: isAlive ? 'healthy' : 'unhealthy' };
      }
      
      // Check if service has a connection status method
      if (typeof service.getConnectionStatus === 'function') {
        return service.getConnectionStatus();
      }
      
      // Default health check for services without specific health methods
      return { status: 'unknown', message: 'No health check method available' };
      
    } catch (error) {
      logger.error(`Health check failed for service ${service.constructor.name}:`, error);
      throw error;
    }
  }

  async runHealthChecks() {
    try {
      const health = await this.checkHealth();
      
      // Log warnings for unhealthy services
      Object.entries(health.services).forEach(([serviceName, serviceHealth]) => {
        if (serviceHealth.status !== 'healthy') {
          logger.warn(`Service ${serviceName} is unhealthy:`, serviceHealth);
        }
      });

      // Alert if overall health is poor
      if (health.overall === 'unhealthy') {
        logger.error('System health is unhealthy:', health);
      } else if (health.overall === 'degraded') {
        logger.warn('System health is degraded:', health);
      }

      return health;
    } catch (error) {
      logger.error('Failed to run health checks:', error);
      throw error;
    }
  }

  getHealthStatus() {
    return this.healthStatus;
  }

  isHealthy() {
    return this.healthStatus.overall === 'healthy';
  }

  getServiceHealth(serviceName) {
    return this.healthStatus.services[serviceName] || null;
  }

  // Specific health checks for different service types

  async checkRedisHealth(redisManager) {
    try {
      if (!redisManager) {
        return { status: 'unhealthy', error: 'Redis manager not provided' };
      }

      const connectionStatus = redisManager.getConnectionStatus();
      if (!connectionStatus.isConnected) {
        return { status: 'unhealthy', error: 'Redis not connected' };
      }

      const pingResult = await redisManager.ping();
      if (!pingResult) {
        return { status: 'unhealthy', error: 'Redis ping failed' };
      }

      return { status: 'healthy', details: connectionStatus };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkAIModelRunnerHealth(aiModelRunner) {
    try {
      if (!aiModelRunner) {
        return { status: 'unhealthy', error: 'AI Model Runner not provided' };
      }

      const health = await aiModelRunner.getHealth();
      return health;
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkConversationManagerHealth(conversationManager) {
    try {
      if (!conversationManager) {
        return { status: 'unhealthy', error: 'Conversation Manager not provided' };
      }

      // Check if conversation manager can access its dependencies
      const hasAIModelRunner = !!conversationManager.aiModelRunner;
      const hasRedisManager = !!conversationManager.redisManager;
      const activeSessions = conversationManager.sessions.size;

      return {
        status: 'healthy',
        details: {
          hasAIModelRunner,
          hasRedisManager,
          activeSessions,
          sessionTimeout: conversationManager.sessionTimeout
        }
      };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  // System-level health checks

  async checkSystemResources() {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      const memoryHealth = {
        heapUsed: memUsage.heapUsed / 1024 / 1024, // MB
        heapTotal: memUsage.heapTotal / 1024 / 1024, // MB
        external: memUsage.external / 1024 / 1024, // MB
        rss: memUsage.rss / 1024 / 1024, // MB
        memoryUsagePercentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
      };

      // Determine memory health
      let memoryStatus = 'healthy';
      if (memoryHealth.memoryUsagePercentage > 90) {
        memoryStatus = 'critical';
      } else if (memoryHealth.memoryUsagePercentage > 80) {
        memoryStatus = 'warning';
      }

      return {
        status: memoryStatus,
        details: {
          memory: memoryHealth,
          cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system
          },
          uptime: process.uptime(),
          nodeVersion: process.version,
          platform: process.platform
        }
      };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkNetworkConnectivity() {
    try {
      // Check if we can resolve DNS
      const dns = require('dns').promises;
      await dns.lookup('google.com');
      
      return { status: 'healthy', details: { message: 'Network connectivity OK' } };
    } catch (error) {
      return { status: 'unhealthy', error: 'Network connectivity failed' };
    }
  }

  // Comprehensive health check

  async runComprehensiveHealthCheck() {
    try {
      const results = await Promise.allSettled([
        this.checkHealth(),
        this.checkSystemResources(),
        this.checkNetworkConnectivity()
      ]);

      const [serviceHealth, systemHealth, networkHealth] = results.map(result => 
        result.status === 'fulfilled' ? result.value : { status: 'unhealthy', error: result.reason.message }
      );

      const comprehensiveHealth = {
        timestamp: new Date(),
        overall: this.determineOverallHealth([serviceHealth, systemHealth, networkHealth]),
        services: serviceHealth,
        system: systemHealth,
        network: networkHealth,
        summary: {
          serviceHealth: serviceHealth.overall,
          systemHealth: systemHealth.status,
          networkHealth: networkHealth.status
        }
      };

      logger.info('Comprehensive health check completed', {
        overall: comprehensiveHealth.overall,
        summary: comprehensiveHealth.summary
      });

      return comprehensiveHealth;
    } catch (error) {
      logger.error('Comprehensive health check failed:', error);
      throw error;
    }
  }

  determineOverallHealth(healthChecks) {
    const statuses = healthChecks.map(check => check.overall || check.status);
    
    if (statuses.every(status => status === 'healthy')) {
      return 'healthy';
    } else if (statuses.some(status => status === 'unhealthy')) {
      return 'unhealthy';
    } else {
      return 'degraded';
    }
  }

  // Health check scheduling

  startPeriodicHealthChecks(intervalMs = 30000) {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.runHealthChecks();
      } catch (error) {
        logger.error('Periodic health check failed:', error);
      }
    }, intervalMs);

    logger.info(`Started periodic health checks every ${intervalMs}ms`);
  }

  stopPeriodicHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      logger.info('Stopped periodic health checks');
    }
  }

  // Health check history

  getHealthHistory() {
    return {
      current: this.healthStatus,
      uptime: Date.now() - this.startTime,
      startTime: new Date(this.startTime)
    };
  }
} 