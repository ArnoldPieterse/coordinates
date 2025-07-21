import axios from 'axios';
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-gateway-service' },
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

export class AIGatewayService {
  constructor() {
    this.aiAssistantUrl = process.env.AI_ASSISTANT_URL || 'http://ai-assistant:3001';
    this.aiModelRunnerUrl = process.env.AI_MODEL_RUNNER_URL || 'http://ai-model-runner:8080';
    this.axiosConfig = {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Coordinates-AI-Gateway/1.0.0'
      }
    };
  }

  async initialize() {
    try {
      logger.info('Initializing AI Gateway Service...');
      
      // Test connections to both services
      await this.testConnection(this.aiAssistantUrl, 'AI Assistant');
      await this.testConnection(this.aiModelRunnerUrl, 'AI Model Runner');
      
      logger.info('AI Gateway Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AI Gateway Service:', error);
      throw error;
    }
  }

  async testConnection(url, serviceName) {
    try {
      const response = await axios.get(`${url}/health`, this.axiosConfig);
      logger.info(`${serviceName} connection test successful:`, response.status);
      return true;
    } catch (error) {
      logger.error(`${serviceName} connection test failed:`, error.message);
      throw new Error(`${serviceName} is not available: ${error.message}`);
    }
  }

  async forwardToAIAssistant(endpoint, data) {
    try {
      const url = `${this.aiAssistantUrl}${endpoint}`;
      logger.debug(`Forwarding request to AI Assistant: ${url}`);
      
      const response = await axios.post(url, data, this.axiosConfig);
      return response.data;
    } catch (error) {
      logger.error('AI Assistant request failed:', error.message);
      throw new Error(`AI Assistant error: ${error.message}`);
    }
  }

  async forwardToModelRunner(endpoint, data) {
    try {
      const url = `${this.aiModelRunnerUrl}${endpoint}`;
      logger.debug(`Forwarding request to Model Runner: ${url}`);
      
      const response = await axios.post(url, data, this.axiosConfig);
      return response.data;
    } catch (error) {
      logger.error('Model Runner request failed:', error.message);
      throw new Error(`Model Runner error: ${error.message}`);
    }
  }

  async getFromAIAssistant(endpoint) {
    try {
      const url = `${this.aiAssistantUrl}${endpoint}`;
      logger.debug(`Getting data from AI Assistant: ${url}`);
      
      const response = await axios.get(url, this.axiosConfig);
      return response.data;
    } catch (error) {
      logger.error('AI Assistant GET request failed:', error.message);
      throw new Error(`AI Assistant error: ${error.message}`);
    }
  }

  async getFromModelRunner(endpoint) {
    try {
      const url = `${this.aiModelRunnerUrl}${endpoint}`;
      logger.debug(`Getting data from Model Runner: ${url}`);
      
      const response = await axios.get(url, this.axiosConfig);
      return response.data;
    } catch (error) {
      logger.error('Model Runner GET request failed:', error.message);
      throw new Error(`Model Runner error: ${error.message}`);
    }
  }

  async deleteFromAIAssistant(endpoint) {
    try {
      const url = `${this.aiAssistantUrl}${endpoint}`;
      logger.debug(`Deleting from AI Assistant: ${url}`);
      
      const response = await axios.delete(url, this.axiosConfig);
      return response.data;
    } catch (error) {
      logger.error('AI Assistant DELETE request failed:', error.message);
      throw new Error(`AI Assistant error: ${error.message}`);
    }
  }

  async deleteFromModelRunner(endpoint) {
    try {
      const url = `${this.aiModelRunnerUrl}${endpoint}`;
      logger.debug(`Deleting from Model Runner: ${url}`);
      
      const response = await axios.delete(url, this.axiosConfig);
      return response.data;
    } catch (error) {
      logger.error('Model Runner DELETE request failed:', error.message);
      throw new Error(`Model Runner error: ${error.message}`);
    }
  }

  async getHealth() {
    try {
      const [assistantHealth, modelRunnerHealth] = await Promise.all([
        this.testConnection(this.aiAssistantUrl, 'AI Assistant'),
        this.testConnection(this.aiModelRunnerUrl, 'AI Model Runner')
      ]);

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          aiAssistant: assistantHealth ? 'healthy' : 'unhealthy',
          aiModelRunner: modelRunnerHealth ? 'healthy' : 'unhealthy'
        }
      };
    } catch (error) {
      logger.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        services: {
          aiAssistant: 'unknown',
          aiModelRunner: 'unknown'
        }
      };
    }
  }

  async shutdown() {
    logger.info('Shutting down AI Gateway Service...');
    // Clean up any resources if needed
  }
} 