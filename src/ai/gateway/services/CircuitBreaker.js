import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'circuit-breaker' },
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

export class CircuitBreaker {
  constructor(serviceUrl, options = {}) {
    this.serviceUrl = serviceUrl;
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeout = options.recoveryTimeout || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 60000; // 1 minute
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
    
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      circuitOpens: 0,
      circuitCloses: 0
    };
  }

  async execute(operation) {
    this.stats.totalRequests++;
    
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        logger.warn(`Circuit breaker is OPEN for ${this.serviceUrl}, rejecting request`);
        throw new Error(`Service ${this.serviceUrl} is temporarily unavailable (circuit breaker open)`);
      } else {
        logger.info(`Attempting to close circuit breaker for ${this.serviceUrl}`);
        this.state = 'HALF_OPEN';
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.stats.successfulRequests++;
    
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.stats.circuitCloses++;
      logger.info(`Circuit breaker CLOSED for ${this.serviceUrl}`);
    }
  }

  onFailure(error) {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.stats.failedRequests++;
    
    logger.warn(`Failure #${this.failureCount} for ${this.serviceUrl}:`, error.message);
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.recoveryTimeout;
      this.stats.circuitOpens++;
      logger.error(`Circuit breaker OPENED for ${this.serviceUrl} after ${this.failureCount} failures`);
    }
  }

  getState() {
    return {
      serviceUrl: this.serviceUrl,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
      stats: { ...this.stats }
    };
  }

  isOpen() {
    return this.state === 'OPEN';
  }

  isHalfOpen() {
    return this.state === 'HALF_OPEN';
  }

  isClosed() {
    return this.state === 'CLOSED';
  }

  forceOpen() {
    this.state = 'OPEN';
    this.nextAttemptTime = Date.now() + this.recoveryTimeout;
    this.stats.circuitOpens++;
    logger.warn(`Circuit breaker FORCE OPENED for ${this.serviceUrl}`);
  }

  forceClose() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
    this.stats.circuitCloses++;
    logger.info(`Circuit breaker FORCE CLOSED for ${this.serviceUrl}`);
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      circuitOpens: 0,
      circuitCloses: 0
    };
    logger.info(`Circuit breaker RESET for ${this.serviceUrl}`);
  }

  getHealth() {
    return {
      status: this.state === 'CLOSED' ? 'healthy' : 'unhealthy',
      state: this.state,
      failureCount: this.failureCount,
      failureThreshold: this.failureThreshold,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
      stats: { ...this.stats }
    };
  }
} 