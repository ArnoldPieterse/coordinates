#!/usr/bin/env node

/**
 * Coordinates AI Assistant
 * Integration with Docker Model Runner and Git Issue Solver Team
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import dotenv from 'dotenv';

import { AIModelRunner } from './services/AIModelRunner.js';
import { AIConversationManager } from './services/AIConversationManager.js';
import { GitIssueSolverIntegration } from './services/GitIssueSolverIntegration.js';
import { RedisManager } from './services/RedisManager.js';
import { MetricsCollector } from './services/MetricsCollector.js';
import { HealthChecker } from './services/HealthChecker.js';

// Load environment variables
dotenv.config();

// Configure logging
const logger = winston.createLogger({
  level: process.env.AI_ASSISTANT_LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-assistant' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

class AIAssistant {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });
    this.port = process.env.AI_ASSISTANT_PORT || 3001;
    this.sessions = new Map();
    
    this.initializeServices();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupErrorHandling();
  }

  async initializeServices() {
    try {
      // Initialize Redis for caching and session management
      this.redisManager = new RedisManager();
      await this.redisManager.connect();

      // Initialize AI Model Runner integration
      this.aiModelRunner = new AIModelRunner();
      await this.aiModelRunner.initialize();

      // Initialize conversation manager
      this.conversationManager = new AIConversationManager(
        this.aiModelRunner,
        this.redisManager
      );

      // Initialize Git Issue Solver integration
      this.gitIssueSolver = new GitIssueSolverIntegration(
        this.conversationManager
      );

      // Initialize metrics collector
      this.metricsCollector = new MetricsCollector();

      // Initialize health checker
      this.healthChecker = new HealthChecker([
        this.redisManager,
        this.aiModelRunner,
        this.conversationManager
      ]);

      logger.info('All services initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize services:', error);
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

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    });
    this.app.use(limiter);

    // Compression
    this.app.use(compression());

    // Logging
    this.app.use(morgan('combined', {
      stream: { write: message => logger.info(message.trim()) }
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', async (req, res) => {
      try {
        const health = await this.healthChecker.checkHealth();
        res.json(health);
      } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({ status: 'unhealthy', error: error.message });
      }
    });

    // AI Chat endpoint
    this.app.post('/api/chat', async (req, res) => {
      try {
        const { message, sessionId, context } = req.body;
        
        if (!message) {
          return res.status(400).json({ error: 'Message is required' });
        }

        const session = sessionId || uuidv4();
        const response = await this.conversationManager.processMessage(
          message,
          session,
          context
        );

        res.json({
          sessionId: session,
          response: response.content,
          metadata: response.metadata
        });
      } catch (error) {
        logger.error('Chat processing error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Git Issue Solver integration
    this.app.post('/api/git-issue-solver', async (req, res) => {
      try {
        const { issue, action } = req.body;
        
        if (!issue) {
          return res.status(400).json({ error: 'Issue is required' });
        }

        const result = await this.gitIssueSolver.processIssue(issue, action);
        res.json(result);
      } catch (error) {
        logger.error('Git Issue Solver error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // AI Model management
    this.app.get('/api/models', async (req, res) => {
      try {
        const models = await this.aiModelRunner.listModels();
        res.json(models);
      } catch (error) {
        logger.error('Model listing error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    this.app.post('/api/models/:modelId/load', async (req, res) => {
      try {
        const { modelId } = req.params;
        const result = await this.aiModelRunner.loadModel(modelId);
        res.json(result);
      } catch (error) {
        logger.error('Model loading error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Metrics endpoint
    this.app.get('/api/metrics', async (req, res) => {
      try {
        const metrics = await this.metricsCollector.getMetrics();
        res.json(metrics);
      } catch (error) {
        logger.error('Metrics collection error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Session management
    this.app.get('/api/sessions/:sessionId', async (req, res) => {
      try {
        const { sessionId } = req.params;
        const session = await this.conversationManager.getSession(sessionId);
        
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        res.json(session);
      } catch (error) {
        logger.error('Session retrieval error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    this.app.delete('/api/sessions/:sessionId', async (req, res) => {
      try {
        const { sessionId } = req.params;
        await this.conversationManager.deleteSession(sessionId);
        res.json({ message: 'Session deleted successfully' });
      } catch (error) {
        logger.error('Session deletion error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      const sessionId = uuidv4();
      this.sessions.set(sessionId, ws);

      logger.info(`WebSocket connection established: ${sessionId}`);

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data);
          const response = await this.conversationManager.processMessage(
            message.content,
            sessionId,
            message.context
          );

          ws.send(JSON.stringify({
            type: 'response',
            sessionId,
            content: response.content,
            metadata: response.metadata
          }));
        } catch (error) {
          logger.error('WebSocket message processing error:', error);
          ws.send(JSON.stringify({
            type: 'error',
            sessionId,
            error: 'Message processing failed'
          }));
        }
      });

      ws.on('close', () => {
        this.sessions.delete(sessionId);
        logger.info(`WebSocket connection closed: ${sessionId}`);
      });

      ws.on('error', (error) => {
        logger.error(`WebSocket error for session ${sessionId}:`, error);
        this.sessions.delete(sessionId);
      });
    });
  }

  setupErrorHandling() {
    // Global error handler
    this.app.use((error, req, res, next) => {
      logger.error('Unhandled error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });
  }

  async start() {
    try {
      await this.server.listen(this.port);
      logger.info(`AI Assistant server started on port ${this.port}`);

      // Start background tasks
      this.startBackgroundTasks();

      // Graceful shutdown
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());
    } catch (error) {
      logger.error('Failed to start server:', error);
      throw error;
    }
  }

  startBackgroundTasks() {
    // Metrics collection
    setInterval(async () => {
      try {
        await this.metricsCollector.collectMetrics();
      } catch (error) {
        logger.error('Metrics collection error:', error);
      }
    }, 60000); // Every minute

    // Health checks
    setInterval(async () => {
      try {
        await this.healthChecker.runHealthChecks();
      } catch (error) {
        logger.error('Health check error:', error);
      }
    }, 30000); // Every 30 seconds

    // Session cleanup
    setInterval(async () => {
      try {
        await this.conversationManager.cleanupExpiredSessions();
      } catch (error) {
        logger.error('Session cleanup error:', error);
      }
    }, 300000); // Every 5 minutes
  }

  async shutdown() {
    logger.info('Shutting down AI Assistant...');
    
    try {
      // Close WebSocket connections
      this.wss.close();
      
      // Close server
      this.server.close();
      
      // Disconnect services
      if (this.redisManager) {
        await this.redisManager.disconnect();
      }
      
      logger.info('AI Assistant shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Start the server
const aiAssistant = new AIAssistant();
aiAssistant.start().catch(error => {
  logger.error('Failed to start AI Assistant:', error);
  process.exit(1);
}); 