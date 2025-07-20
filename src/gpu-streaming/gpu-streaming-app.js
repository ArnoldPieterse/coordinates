/**
 * GPU Streaming Application
 * Allows users to stream their GPU power for distributed LLM inference
 * with ad injection and monetization capabilities
 */

import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import { GPUStreamingManager } from './gpu-streaming-manager.js';
import { AdInjectionService } from './ad-injection-service.js';
import { LLMInferenceEngine } from './llm-inference-engine.js';
import { PaymentProcessor } from './payment-processor.js';
import { StreamQualityManager } from './stream-quality-manager.js';

class GPUStreamingApp {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.port = process.env.GPU_STREAMING_PORT || 3002;
    this.gpuManager = new GPUStreamingManager();
    this.adService = new AdInjectionService();
    this.inferenceEngine = new LLMInferenceEngine();
    this.paymentProcessor = new PaymentProcessor();
    this.qualityManager = new StreamQualityManager();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static('public'));
  }

  setupRoutes() {
    // GPU Provider Routes
    this.app.post('/api/gpu/register', async (req, res) => {
      try {
        const { gpuInfo, capabilities, pricing } = req.body;
        const providerId = await this.gpuManager.registerProvider(gpuInfo, capabilities, pricing);
        res.json({ success: true, providerId, message: 'GPU provider registered successfully' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/gpu/stream/start', async (req, res) => {
      try {
        const { providerId, model, quality } = req.body;
        const streamId = await this.gpuManager.startStream(providerId, model, quality);
        res.json({ success: true, streamId, message: 'GPU stream started' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/gpu/stream/stop', async (req, res) => {
      try {
        const { providerId, streamId } = req.body;
        await this.gpuManager.stopStream(providerId, streamId);
        res.json({ success: true, message: 'GPU stream stopped' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // LLM Client Routes
    this.app.post('/api/llm/inference', async (req, res) => {
      try {
        const { prompt, model, userId, adPreferences } = req.body;
        const result = await this.processInferenceRequest(prompt, model, userId, adPreferences);
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/llm/models', async (req, res) => {
      try {
        const models = await this.gpuManager.getAvailableModels();
        res.json({ success: true, models });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/llm/status', async (req, res) => {
      try {
        const status = await this.gpuManager.getSystemStatus();
        res.json({ success: true, status });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Payment Routes
    this.app.post('/api/payment/withdraw', async (req, res) => {
      try {
        const { providerId, amount, paymentMethod } = req.body;
        const transaction = await this.paymentProcessor.processWithdrawal(providerId, amount, paymentMethod);
        res.json({ success: true, transaction });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/payment/balance/:providerId', async (req, res) => {
      try {
        const { providerId } = req.params;
        const balance = await this.paymentProcessor.getBalance(providerId);
        res.json({ success: true, balance });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Analytics Routes
    this.app.get('/api/analytics/revenue', async (req, res) => {
      try {
        const analytics = await this.adService.getRevenueAnalytics();
        res.json({ success: true, analytics });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/analytics/usage', async (req, res) => {
      try {
        const usage = await this.gpuManager.getUsageAnalytics();
        res.json({ success: true, usage });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }

  setupWebSocket() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // GPU Provider Events
      socket.on('gpu:register', async (data) => {
        try {
          const providerId = await this.gpuManager.registerProvider(data.gpuInfo, data.capabilities, data.pricing);
          socket.emit('gpu:registered', { providerId });
        } catch (error) {
          socket.emit('gpu:error', { error: error.message });
        }
      });

      socket.on('gpu:stream:start', async (data) => {
        try {
          const streamId = await this.gpuManager.startStream(data.providerId, data.model, data.quality);
          socket.emit('gpu:stream:started', { streamId });
        } catch (error) {
          socket.emit('gpu:error', { error: error.message });
        }
      });

      socket.on('gpu:stream:stop', async (data) => {
        try {
          await this.gpuManager.stopStream(data.providerId, data.streamId);
          socket.emit('gpu:stream:stopped', { streamId: data.streamId });
        } catch (error) {
          socket.emit('gpu:error', { error: error.message });
        }
      });

      // LLM Client Events
      socket.on('llm:inference', async (data) => {
        try {
          const result = await this.processInferenceRequest(data.prompt, data.model, data.userId, data.adPreferences);
          socket.emit('llm:result', result);
        } catch (error) {
          socket.emit('llm:error', { error: error.message });
        }
      });

      socket.on('llm:stream', async (data) => {
        try {
          const stream = await this.inferenceEngine.createStream(data.prompt, data.model, data.userId);
          socket.emit('llm:stream:started', { streamId: stream.id });
          
          stream.on('token', (token) => {
            socket.emit('llm:stream:token', { token, streamId: stream.id });
          });
          
          stream.on('complete', (result) => {
            socket.emit('llm:stream:complete', { result, streamId: stream.id });
          });
        } catch (error) {
          socket.emit('llm:error', { error: error.message });
        }
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
      });
    });
  }

  setupEventHandlers() {
    // GPU Manager Events
    this.gpuManager.on('provider:registered', (provider) => {
      this.io.emit('gpu:provider:new', { provider });
    });

    this.gpuManager.on('stream:started', (stream) => {
      this.io.emit('gpu:stream:new', { stream });
    });

    this.gpuManager.on('stream:completed', (stream) => {
      this.io.emit('gpu:stream:completed', { stream });
    });

    // Ad Service Events
    this.adService.on('ad:injected', (data) => {
      this.io.emit('ad:injected', data);
    });

    this.adService.on('revenue:earned', (data) => {
      this.io.emit('revenue:earned', data);
    });

    // Payment Events
    this.paymentProcessor.on('payment:processed', (payment) => {
      this.io.emit('payment:processed', { payment });
    });
  }

  async processInferenceRequest(prompt, model, userId, adPreferences) {
    // Find available GPU provider
    const provider = await this.gpuManager.findAvailableProvider(model);
    if (!provider) {
      throw new Error('No available GPU providers for this model');
    }

    // Inject ads based on user preferences and prompt content
    const adInjectedPrompt = await this.adService.injectAds(prompt, adPreferences, userId);
    
    // Process inference
    const result = await this.inferenceEngine.processInference(adInjectedPrompt, model, provider);
    
    // Track usage and revenue
    await this.gpuManager.trackUsage(provider.id, model, result.tokens);
    await this.adService.trackRevenue(userId, result.adRevenue);
    
    return {
      success: true,
      result: result.response,
      ads: result.ads,
      tokens: result.tokens,
      cost: result.cost,
      provider: provider.id
    };
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`🚀 GPU Streaming App running on port ${this.port}`);
      console.log(`📊 GPU Providers: ${this.gpuManager.getProviderCount()}`);
      console.log(`💰 Revenue Today: $${this.adService.getTodayRevenue()}`);
    });
  }

  stop() {
    this.server.close(() => {
      console.log('🛑 GPU Streaming App stopped');
    });
  }
}

export default GPUStreamingApp; 