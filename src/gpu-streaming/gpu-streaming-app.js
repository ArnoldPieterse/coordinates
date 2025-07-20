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
import { UserPluginManager } from './user-plugin-manager.js';
import { LMStudioBridge } from './lm-studio-bridge.js';

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
    this.pluginManager = new UserPluginManager();
    this.lmStudioBridge = new LMStudioBridge();
    
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
    // Plugin Management Routes
    this.app.post('/api/plugin/register', async (req, res) => {
      try {
        const { gpuInfo, lmStudioUrl, pricing, capabilities } = req.body;
        const userId = req.headers['x-user-id'] || 'anonymous';
        
        const result = await this.pluginManager.registerPlugin(userId, {
          gpuInfo,
          lmStudioUrl,
          pricing,
          capabilities
        });
        
        res.json({ success: true, ...result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/plugin/status/:pluginId', async (req, res) => {
      try {
        const { pluginId } = req.params;
        const plugins = await this.pluginManager.getConnectedPlugins();
        const plugin = plugins.find(p => p.id === pluginId);
        
        if (!plugin) {
          return res.status(404).json({ success: false, error: 'Plugin not found' });
        }
        
        res.json({ success: true, plugin });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/plugin/earnings/:pluginId', async (req, res) => {
      try {
        const { pluginId } = req.params;
        const connection = this.pluginManager.pluginConnections.get(pluginId);
        
        if (!connection) {
          return res.status(404).json({ success: false, error: 'Plugin not found' });
        }
        
        const earnings = connection.provider.totalEarnings || 0;
        res.json({ success: true, earnings });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/plugin/stats', async (req, res) => {
      try {
        const stats = await this.pluginManager.getPluginStats();
        res.json({ success: true, stats });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

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
        const pluginStats = await this.pluginManager.getPluginStats();
        
        // Combine GPU manager status with plugin stats
        const combinedStatus = {
          ...status,
          pluginStats,
          totalPlugins: pluginStats.totalPlugins,
          connectedPlugins: pluginStats.connectedPlugins
        };
        
        res.json({ success: true, status: combinedStatus });
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
        const pluginStats = await this.pluginManager.getPluginStats();
        
        const combinedUsage = {
          ...usage,
          pluginStats
        };
        
        res.json({ success: true, usage: combinedUsage });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Provider and Stream Routes
    this.app.get('/api/providers', async (req, res) => {
      try {
        const providers = await this.gpuManager.getProviders();
        const connectedPlugins = await this.pluginManager.getConnectedPlugins();
        
        // Combine regular providers with plugin providers
        const allProviders = [
          ...providers,
          ...connectedPlugins.map(plugin => plugin.provider)
        ];
        
        res.json({ success: true, providers: allProviders });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/streams', async (req, res) => {
      try {
        const streams = await this.gpuManager.getStreams();
        res.json({ success: true, streams });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }

  setupWebSocket() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Plugin Connection Events
      socket.on('plugin:connect', async (data) => {
        try {
          const { pluginId, connectionToken } = data;
          const result = await this.pluginManager.connectPlugin(pluginId, connectionToken, socket);
          socket.emit('plugin:connected', result);
        } catch (error) {
          socket.emit('plugin:error', { error: error.message });
        }
      });

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
    // Handle GPU provider events
    this.gpuManager.on('provider:registered', (provider) => {
      console.log(`🖥️ GPU Provider registered: ${provider.name}`);
    });

    this.gpuManager.on('stream:started', (stream) => {
      console.log(`📡 GPU Stream started: ${stream.name}`);
    });

    this.gpuManager.on('stream:stopped', (stream) => {
      console.log(`📡 GPU Stream stopped: ${stream.name}`);
    });

    // Handle ad injection events
    this.adService.on('ad:injected', (data) => {
      console.log(`💰 Ad injected: ${data.adType} for ${data.userId}`);
    });

    // Handle payment events
    this.paymentProcessor.on('payment:processed', (transaction) => {
      console.log(`💳 Payment processed: $${transaction.amount} for ${transaction.providerId}`);
    });
  }

  async processInferenceRequest(prompt, model, userId, adPreferences) {
    try {
      // Try to route through plugin first
      try {
        const pluginResult = await this.pluginManager.routeInferenceRequest(prompt, model, userId, adPreferences);
        return {
          success: true,
          response: pluginResult.response,
          model: pluginResult.model,
          cost: pluginResult.cost,
          latency: pluginResult.latency,
          provider: 'plugin',
          source: 'user_plugin'
        };
      } catch (pluginError) {
        console.log('Plugin routing failed, using regular GPU providers:', pluginError.message);
      }

      // Fallback to regular GPU providers
      const startTime = Date.now();
      
      // Inject ads into prompt
      const enhancedPrompt = await this.adService.injectAds(prompt, adPreferences);
      
      // Get available providers for the model
      const providers = await this.gpuManager.getProvidersForModel(model);
      
      if (providers.length === 0) {
        throw new Error(`No providers available for model: ${model}`);
      }
      
      // Select best provider based on pricing and availability
      const selectedProvider = providers.reduce((best, current) => {
        if (current.pricing < best.pricing) return current;
        return best;
      });
      
      // Process inference
      const result = await this.inferenceEngine.processInference(enhancedPrompt, model, selectedProvider);
      
      const latency = Date.now() - startTime;
      
      // Calculate cost
      const cost = this.calculateCost(result.length, selectedProvider.pricing);
      
      // Update provider earnings
      await this.paymentProcessor.addEarnings(selectedProvider.id, cost);
      
      return {
        success: true,
        response: result,
        model: model,
        cost: cost,
        latency: latency,
        provider: selectedProvider.name,
        source: 'gpu_provider',
        adInjected: enhancedPrompt !== prompt
      };
      
    } catch (error) {
      console.error('Inference request failed:', error);
      throw error;
    }
  }

  calculateCost(tokenCount, pricing) {
    return tokenCount * pricing;
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

export { GPUStreamingApp }; 