import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

import { AIGatewayService } from './services/AIGatewayService.js';
import { ServiceRouter } from './services/ServiceRouter.js';
import { CircuitBreaker } from './services/CircuitBreaker.js';
import { MetricsCollector } from './services/MetricsCollector.js';
import { HealthChecker } from './services/HealthChecker.js';

// Load environment variables
dotenv.config();

// Configure logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-gateway' },
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

class AIGateway {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });
    this.port = process.env.GATEWAY_PORT || 3002;
    this.services = {};
    this.circuitBreakers = {};
    this.metricsCollector = new MetricsCollector();
    this.healthChecker = new HealthChecker();
    
    this.initializeServices();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupErrorHandling();
  }

  async initializeServices() {
    try {
      // Initialize AI Gateway Service
      this.services.gateway = new AIGatewayService();
      await this.services.gateway.initialize();

      // Initialize Service Router
      this.services.router = new ServiceRouter(this.services.gateway);

      // Initialize Circuit Breakers for each service
      const serviceUrls = [
        process.env.AI_ASSISTANT_URL || 'http://ai-assistant:3001',
        process.env.AI_MODEL_RUNNER_URL || 'http://ai-model-runner:8080'
      ];

      serviceUrls.forEach(url => {
        this.circuitBreakers[url] = new CircuitBreaker(url);
      });

      // Initialize Health Checker
      this.healthChecker = new HealthChecker([
        this.services.gateway,
        this.services.router
      ]);

      logger.info('All AI Gateway services initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AI Gateway services:', error);
      throw error;
    }
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true
    }));

    // Logging middleware
    this.app.use(morgan('combined', {
      stream: { write: message => logger.info(message.trim()) }
    }));

    // Compression middleware
    this.app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use(limiter);

    // Request parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request ID middleware
    this.app.use((req, res, next) => {
      req.id = uuidv4();
      req.startTime = Date.now();
      next();
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      try {
        const health = await this.healthChecker.checkHealth();
        res.json(health);
      } catch (error) {
        logger.error('Health check failed:', error);
        res.status(500).json({ status: 'unhealthy', error: error.message });
      }
    });

    // Metrics endpoint
    this.app.get('/metrics', (req, res) => {
      const metrics = this.metricsCollector.getMetrics();
      res.json(metrics);
    });

    // AI Chat endpoint
    this.app.post('/api/chat', async (req, res) => {
      try {
        const startTime = Date.now();
        const result = await this.services.router.routeChat(req.body);
        const responseTime = Date.now() - startTime;

        this.metricsCollector.recordRequest('/api/chat', 'POST', 200, responseTime);
        res.json(result);
      } catch (error) {
        logger.error('Chat request failed:', error);
        this.metricsCollector.recordError(error, 'chat');
        res.status(500).json({ error: error.message });
      }
    });

    // AI Model management endpoints
    this.app.get('/api/models', async (req, res) => {
      try {
        const models = await this.services.router.routeModelList();
        res.json(models);
      } catch (error) {
        logger.error('Model list request failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/models/:modelId/load', async (req, res) => {
      try {
        const { modelId } = req.params;
        const result = await this.services.router.routeModelLoad(modelId, req.body);
        res.json(result);
      } catch (error) {
        logger.error('Model load request failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    this.app.delete('/api/models/:modelId/unload', async (req, res) => {
      try {
        const { modelId } = req.params;
        const result = await this.services.router.routeModelUnload(modelId);
        res.json(result);
      } catch (error) {
        logger.error('Model unload request failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // AI Generation endpoints
    this.app.post('/api/generate/text', async (req, res) => {
      try {
        const result = await this.services.router.routeTextGeneration(req.body);
        res.json(result);
      } catch (error) {
        logger.error('Text generation request failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/generate/code', async (req, res) => {
      try {
        const result = await this.services.router.routeCodeGeneration(req.body);
        res.json(result);
      } catch (error) {
        logger.error('Code generation request failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Git Issue Solver integration endpoints
    this.app.post('/api/issues/analyze', async (req, res) => {
      try {
        const result = await this.services.router.routeIssueAnalysis(req.body);
        res.json(result);
      } catch (error) {
        logger.error('Issue analysis request failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/issues/solve', async (req, res) => {
      try {
        const result = await this.services.router.routeIssueSolution(req.body);
        res.json(result);
      } catch (error) {
        logger.error('Issue solution request failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Session management endpoints
    this.app.get('/api/sessions/:sessionId', async (req, res) => {
      try {
        const { sessionId } = req.params;
        const session = await this.services.router.routeSessionGet(sessionId);
        res.json(session);
      } catch (error) {
        logger.error('Session get request failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    this.app.delete('/api/sessions/:sessionId', async (req, res) => {
      try {
        const { sessionId } = req.params;
        const result = await this.services.router.routeSessionDelete(sessionId);
        res.json(result);
      } catch (error) {
        logger.error('Session delete request failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        service: 'AI Gateway',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          health: '/health',
          metrics: '/metrics',
          chat: '/api/chat',
          models: '/api/models',
          generation: '/api/generate',
          issues: '/api/issues',
          sessions: '/api/sessions'
        }
      });
    });
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      const clientId = uuidv4();
      logger.info(`WebSocket client connected: ${clientId}`);

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          const result = await this.services.router.routeWebSocketMessage(data, clientId);
          ws.send(JSON.stringify(result));
        } catch (error) {
          logger.error('WebSocket message processing failed:', error);
          ws.send(JSON.stringify({ error: error.message }));
        }
      });

      ws.on('close', () => {
        logger.info(`WebSocket client disconnected: ${clientId}`);
      });

      ws.on('error', (error) => {
        logger.error(`WebSocket error for client ${clientId}:`, error);
      });
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });

    // Global error handler
    this.app.use((error, req, res, next) => {
      logger.error('Unhandled error:', error);
      this.metricsCollector.recordError(error, 'unhandled');
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  async start() {
    try {
      await this.server.listen(this.port);
      logger.info(`AI Gateway server started on port ${this.port}`);
      
      // Start background tasks
      this.startBackgroundTasks();
      
      // Graceful shutdown
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());
      
    } catch (error) {
      logger.error('Failed to start AI Gateway server:', error);
      throw error;
    }
  }

  startBackgroundTasks() {
    // Periodic health checks
    setInterval(async () => {
      try {
        await this.healthChecker.runHealthChecks();
      } catch (error) {
        logger.error('Background health check failed:', error);
      }
    }, 60000); // Every minute

    // Metrics collection
    setInterval(() => {
      try {
        this.metricsCollector.updateSystemMetrics();
      } catch (error) {
        logger.error('Background metrics collection failed:', error);
      }
    }, 30000); // Every 30 seconds
  }

  async shutdown() {
    logger.info('Shutting down AI Gateway...');
    
    // Close WebSocket connections
    this.wss.close();
    
    // Close HTTP server
    this.server.close();
    
    // Close service connections
    if (this.services.gateway) {
      await this.services.gateway.shutdown();
    }
    
    logger.info('AI Gateway shutdown complete');
    process.exit(0);
  }
}

// Start the server
const gateway = new AIGateway();
gateway.start().catch(error => {
  logger.error('Failed to start AI Gateway:', error);
  process.exit(1);
}); 