import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'service-router' },
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

export class ServiceRouter {
  constructor(gatewayService) {
    this.gatewayService = gatewayService;
  }

  // Chat routing
  async routeChat(data) {
    try {
      logger.debug('Routing chat request to AI Assistant');
      return await this.gatewayService.forwardToAIAssistant('/api/chat', data);
    } catch (error) {
      logger.error('Chat routing failed:', error);
      throw error;
    }
  }

  // Model management routing
  async routeModelList() {
    try {
      logger.debug('Routing model list request to Model Runner');
      return await this.gatewayService.getFromModelRunner('/models');
    } catch (error) {
      logger.error('Model list routing failed:', error);
      throw error;
    }
  }

  async routeModelLoad(modelId, data) {
    try {
      logger.debug(`Routing model load request for ${modelId} to Model Runner`);
      return await this.gatewayService.forwardToModelRunner(`/models/${modelId}/load`, data);
    } catch (error) {
      logger.error('Model load routing failed:', error);
      throw error;
    }
  }

  async routeModelUnload(modelId) {
    try {
      logger.debug(`Routing model unload request for ${modelId} to Model Runner`);
      return await this.gatewayService.deleteFromModelRunner(`/models/${modelId}/unload`);
    } catch (error) {
      logger.error('Model unload routing failed:', error);
      throw error;
    }
  }

  // Generation routing
  async routeTextGeneration(data) {
    try {
      logger.debug('Routing text generation request to AI Assistant');
      return await this.gatewayService.forwardToAIAssistant('/api/generate/text', data);
    } catch (error) {
      logger.error('Text generation routing failed:', error);
      throw error;
    }
  }

  async routeCodeGeneration(data) {
    try {
      logger.debug('Routing code generation request to AI Assistant');
      return await this.gatewayService.forwardToAIAssistant('/api/generate/code', data);
    } catch (error) {
      logger.error('Code generation routing failed:', error);
      throw error;
    }
  }

  // Git Issue Solver routing
  async routeIssueAnalysis(data) {
    try {
      logger.debug('Routing issue analysis request to AI Assistant');
      return await this.gatewayService.forwardToAIAssistant('/api/issues/analyze', data);
    } catch (error) {
      logger.error('Issue analysis routing failed:', error);
      throw error;
    }
  }

  async routeIssueSolution(data) {
    try {
      logger.debug('Routing issue solution request to AI Assistant');
      return await this.gatewayService.forwardToAIAssistant('/api/issues/solve', data);
    } catch (error) {
      logger.error('Issue solution routing failed:', error);
      throw error;
    }
  }

  // Session management routing
  async routeSessionGet(sessionId) {
    try {
      logger.debug(`Routing session get request for ${sessionId} to AI Assistant`);
      return await this.gatewayService.getFromAIAssistant(`/api/sessions/${sessionId}`);
    } catch (error) {
      logger.error('Session get routing failed:', error);
      throw error;
    }
  }

  async routeSessionDelete(sessionId) {
    try {
      logger.debug(`Routing session delete request for ${sessionId} to AI Assistant`);
      return await this.gatewayService.deleteFromAIAssistant(`/api/sessions/${sessionId}`);
    } catch (error) {
      logger.error('Session delete routing failed:', error);
      throw error;
    }
  }

  // WebSocket message routing
  async routeWebSocketMessage(data, clientId) {
    try {
      logger.debug(`Routing WebSocket message from client ${clientId}`);
      
      const { type, payload } = data;
      
      switch (type) {
        case 'chat':
          return await this.routeChat(payload);
        case 'text_generation':
          return await this.routeTextGeneration(payload);
        case 'code_generation':
          return await this.routeCodeGeneration(payload);
        case 'issue_analysis':
          return await this.routeIssueAnalysis(payload);
        case 'issue_solution':
          return await this.routeIssueSolution(payload);
        default:
          throw new Error(`Unknown WebSocket message type: ${type}`);
      }
    } catch (error) {
      logger.error('WebSocket message routing failed:', error);
      throw error;
    }
  }

  // Health check routing
  async routeHealthCheck() {
    try {
      logger.debug('Routing health check request');
      return await this.gatewayService.getHealth();
    } catch (error) {
      logger.error('Health check routing failed:', error);
      throw error;
    }
  }
} 