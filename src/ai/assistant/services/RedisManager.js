import redis from 'redis';
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

export class RedisManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  }

  async connect() {
    try {
      this.client = redis.createClient({
        url: this.redisUrl,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            logger.error('Redis server refused connection');
            return new Error('Redis server refused connection');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            logger.error('Redis retry time exhausted');
            return new Error('Redis retry time exhausted');
          }
          if (options.attempt > 10) {
            logger.error('Redis max retry attempts reached');
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.client.on('error', (err) => {
        logger.error('Redis client error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
        this.isConnected = true;
      });

      this.client.on('end', () => {
        logger.info('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
      logger.info('Redis connection established');
      return true;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.client && this.isConnected) {
        await this.client.quit();
        logger.info('Redis connection closed');
      }
    } catch (error) {
      logger.error('Error disconnecting from Redis:', error);
    } finally {
      this.isConnected = false;
    }
  }

  async set(key, value, ttl = null) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }

      logger.debug(`Redis SET: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      throw error;
    }
  }

  async get(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const value = await this.client.get(key);
      logger.debug(`Redis GET: ${key} = ${value ? 'found' : 'not found'}`);
      return value;
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      throw error;
    }
  }

  async del(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.del(key);
      logger.debug(`Redis DEL: ${key} = ${result} keys deleted`);
      return result;
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
      throw error;
    }
  }

  async exists(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.exists(key);
      logger.debug(`Redis EXISTS: ${key} = ${result}`);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      throw error;
    }
  }

  async expire(key, seconds) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.expire(key, seconds);
      logger.debug(`Redis EXPIRE: ${key} = ${result}`);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXPIRE error for key ${key}:`, error);
      throw error;
    }
  }

  async ttl(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.ttl(key);
      logger.debug(`Redis TTL: ${key} = ${result}`);
      return result;
    } catch (error) {
      logger.error(`Redis TTL error for key ${key}:`, error);
      throw error;
    }
  }

  async lpush(key, value) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.lPush(key, value);
      logger.debug(`Redis LPUSH: ${key} = ${result} items`);
      return result;
    } catch (error) {
      logger.error(`Redis LPUSH error for key ${key}:`, error);
      throw error;
    }
  }

  async rpush(key, value) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.rPush(key, value);
      logger.debug(`Redis RPUSH: ${key} = ${result} items`);
      return result;
    } catch (error) {
      logger.error(`Redis RPUSH error for key ${key}:`, error);
      throw error;
    }
  }

  async lpop(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.lPop(key);
      logger.debug(`Redis LPOP: ${key} = ${result ? 'found' : 'not found'}`);
      return result;
    } catch (error) {
      logger.error(`Redis LPOP error for key ${key}:`, error);
      throw error;
    }
  }

  async rpop(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.rPop(key);
      logger.debug(`Redis RPOP: ${key} = ${result ? 'found' : 'not found'}`);
      return result;
    } catch (error) {
      logger.error(`Redis RPOP error for key ${key}:`, error);
      throw error;
    }
  }

  async lrange(key, start, stop) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.lRange(key, start, stop);
      logger.debug(`Redis LRANGE: ${key} [${start}:${stop}] = ${result.length} items`);
      return result;
    } catch (error) {
      logger.error(`Redis LRANGE error for key ${key}:`, error);
      throw error;
    }
  }

  async ltrim(key, start, stop) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.lTrim(key, start, stop);
      logger.debug(`Redis LTRIM: ${key} [${start}:${stop}] = ${result}`);
      return result === 'OK';
    } catch (error) {
      logger.error(`Redis LTRIM error for key ${key}:`, error);
      throw error;
    }
  }

  async llen(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.lLen(key);
      logger.debug(`Redis LLEN: ${key} = ${result}`);
      return result;
    } catch (error) {
      logger.error(`Redis LLEN error for key ${key}:`, error);
      throw error;
    }
  }

  async hset(key, field, value) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.hSet(key, field, value);
      logger.debug(`Redis HSET: ${key}.${field} = ${result}`);
      return result;
    } catch (error) {
      logger.error(`Redis HSET error for key ${key}.${field}:`, error);
      throw error;
    }
  }

  async hget(key, field) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.hGet(key, field);
      logger.debug(`Redis HGET: ${key}.${field} = ${result ? 'found' : 'not found'}`);
      return result;
    } catch (error) {
      logger.error(`Redis HGET error for key ${key}.${field}:`, error);
      throw error;
    }
  }

  async hgetall(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.hGetAll(key);
      logger.debug(`Redis HGETALL: ${key} = ${Object.keys(result).length} fields`);
      return result;
    } catch (error) {
      logger.error(`Redis HGETALL error for key ${key}:`, error);
      throw error;
    }
  }

  async hdel(key, field) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.hDel(key, field);
      logger.debug(`Redis HDEL: ${key}.${field} = ${result}`);
      return result;
    } catch (error) {
      logger.error(`Redis HDEL error for key ${key}.${field}:`, error);
      throw error;
    }
  }

  async keys(pattern) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.keys(pattern);
      logger.debug(`Redis KEYS: ${pattern} = ${result.length} keys`);
      return result;
    } catch (error) {
      logger.error(`Redis KEYS error for pattern ${pattern}:`, error);
      throw error;
    }
  }

  async scan(cursor = 0, pattern = '*', count = 100) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.scan(cursor, {
        MATCH: pattern,
        COUNT: count
      });

      logger.debug(`Redis SCAN: cursor=${cursor}, pattern=${pattern} = ${result[1].length} keys`);
      return {
        cursor: result[0],
        keys: result[1]
      };
    } catch (error) {
      logger.error(`Redis SCAN error:`, error);
      throw error;
    }
  }

  async flushdb() {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.flushDb();
      logger.info('Redis FLUSHDB completed');
      return result === 'OK';
    } catch (error) {
      logger.error('Redis FLUSHDB error:', error);
      throw error;
    }
  }

  async info(section = null) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = section ? await this.client.info(section) : await this.client.info();
      logger.debug(`Redis INFO: ${section || 'all'} retrieved`);
      return result;
    } catch (error) {
      logger.error(`Redis INFO error:`, error);
      throw error;
    }
  }

  async ping() {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.ping();
      logger.debug('Redis PING:', result);
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis PING error:', error);
      return false;
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      url: this.redisUrl
    };
  }

  // Utility methods for common operations

  async setJson(key, value, ttl = null) {
    return await this.set(key, JSON.stringify(value), ttl);
  }

  async getJson(key) {
    const value = await this.get(key);
    return value ? JSON.parse(value) : null;
  }

  async setHash(key, data, ttl = null) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.hSet(key, data);
      
      if (ttl) {
        await this.expire(key, ttl);
      }

      logger.debug(`Redis HSET multiple: ${key} = ${Object.keys(data).length} fields`);
      return result;
    } catch (error) {
      logger.error(`Redis HSET multiple error for key ${key}:`, error);
      throw error;
    }
  }

  async increment(key, amount = 1) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.incrBy(key, amount);
      logger.debug(`Redis INCRBY: ${key} += ${amount} = ${result}`);
      return result;
    } catch (error) {
      logger.error(`Redis INCRBY error for key ${key}:`, error);
      throw error;
    }
  }

  async decrement(key, amount = 1) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.decrBy(key, amount);
      logger.debug(`Redis DECRBY: ${key} -= ${amount} = ${result}`);
      return result;
    } catch (error) {
      logger.error(`Redis DECRBY error for key ${key}:`, error);
      throw error;
    }
  }
} 