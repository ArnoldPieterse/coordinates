/**
 * User Plugin Manager
 * Manages user-installed plugins that allow rekursing.com to access their GPU resources
 */

import crypto from 'crypto';
import { GPUProvider } from './gpu-provider.js';

export class UserPluginManager {
  constructor() {
    this.installedPlugins = new Map();
    this.pluginConnections = new Map();
    this.pluginStats = new Map();
  }

  /**
   * Register a new user plugin installation
   */
  async registerPlugin(userId, pluginData) {
    const pluginId = crypto.randomUUID();
    const plugin = {
      id: pluginId,
      userId,
      name: pluginData.name || 'GPU Streaming Plugin',
      version: pluginData.version || '1.0.0',
      gpuInfo: pluginData.gpuInfo,
      lmStudioUrl: pluginData.lmStudioUrl,
      capabilities: pluginData.capabilities || [],
      pricing: pluginData.pricing || 0.0001,
      status: 'installed',
      installedAt: new Date(),
      lastSeen: new Date(),
      connectionToken: crypto.randomBytes(32).toString('hex'),
      permissions: pluginData.permissions || ['gpu_access', 'lm_studio_access']
    };

    this.installedPlugins.set(pluginId, plugin);
    
    // Create GPU provider for this plugin
    const provider = new GPUProvider({
      id: pluginId,
      name: `${userId}_${plugin.name}`,
      gpu: plugin.gpuInfo.gpu,
      vram: plugin.gpuInfo.vram,
      models: plugin.capabilities,
      pricing: plugin.pricing,
      status: 'available',
      pluginId: pluginId,
      userId: userId
    });

    this.pluginConnections.set(pluginId, {
      provider,
      socket: null,
      lastHeartbeat: new Date(),
      isConnected: false
    });

    console.log(`🔌 Plugin registered: ${plugin.name} for user ${userId}`);
    return { pluginId, connectionToken: plugin.connectionToken };
  }

  /**
   * Connect a plugin to the streaming service
   */
  async connectPlugin(pluginId, connectionToken, socket) {
    const plugin = this.installedPlugins.get(pluginId);
    if (!plugin || plugin.connectionToken !== connectionToken) {
      throw new Error('Invalid plugin or connection token');
    }

    const connection = this.pluginConnections.get(pluginId);
    if (!connection) {
      throw new Error('Plugin connection not found');
    }

    connection.socket = socket;
    connection.isConnected = true;
    connection.lastHeartbeat = new Date();
    plugin.status = 'connected';
    plugin.lastSeen = new Date();

    // Setup socket event handlers
    socket.on('plugin:heartbeat', () => {
      connection.lastHeartbeat = new Date();
    });

    socket.on('plugin:gpu_status', (data) => {
      connection.provider.updateStatus(data);
    });

    socket.on('plugin:lm_studio_status', (data) => {
      plugin.lmStudioStatus = data;
    });

    socket.on('disconnect', () => {
      connection.isConnected = false;
      plugin.status = 'disconnected';
      console.log(`🔌 Plugin disconnected: ${plugin.name}`);
    });

    console.log(`🔌 Plugin connected: ${plugin.name}`);
    return { success: true, providerId: connection.provider.id };
  }

  /**
   * Get available plugins for a user
   */
  async getUserPlugins(userId) {
    const userPlugins = [];
    for (const [pluginId, plugin] of this.installedPlugins) {
      if (plugin.userId === userId) {
        const connection = this.pluginConnections.get(pluginId);
        userPlugins.push({
          ...plugin,
          isConnected: connection?.isConnected || false,
          lastHeartbeat: connection?.lastHeartbeat,
          providerId: connection?.provider.id
        });
      }
    }
    return userPlugins;
  }

  /**
   * Get all connected plugins
   */
  async getConnectedPlugins() {
    const connected = [];
    for (const [pluginId, connection] of this.pluginConnections) {
      if (connection.isConnected) {
        const plugin = this.installedPlugins.get(pluginId);
        connected.push({
          ...plugin,
          provider: connection.provider,
          lastHeartbeat: connection.lastHeartbeat
        });
      }
    }
    return connected;
  }

  /**
   * Route inference request to appropriate plugin
   */
  async routeInferenceRequest(prompt, model, userId, adPreferences) {
    const availablePlugins = await this.getConnectedPlugins();
    
    // Find plugins that support the requested model
    const compatiblePlugins = availablePlugins.filter(plugin => 
      plugin.capabilities.includes(model) || 
      plugin.provider.models.includes(model)
    );

    if (compatiblePlugins.length === 0) {
      throw new Error(`No plugins available for model: ${model}`);
    }

    // Select best plugin based on pricing and availability
    const selectedPlugin = compatiblePlugins.reduce((best, current) => {
      if (current.pricing < best.pricing) return current;
      return best;
    });

    const connection = this.pluginConnections.get(selectedPlugin.id);
    
    // Send inference request to plugin
    return new Promise((resolve, reject) => {
      const requestId = crypto.randomUUID();
      
      // Setup response handler
      const responseHandler = (data) => {
        if (data.requestId === requestId) {
          connection.socket.off('plugin:inference_response', responseHandler);
          resolve(data.result);
        }
      };

      connection.socket.on('plugin:inference_response', responseHandler);

      // Send request to plugin
      connection.socket.emit('plugin:inference_request', {
        requestId,
        prompt,
        model,
        userId,
        adPreferences
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        connection.socket.off('plugin:inference_response', responseHandler);
        reject(new Error('Inference request timeout'));
      }, 30000);
    });
  }

  /**
   * Get plugin statistics
   */
  async getPluginStats() {
    const stats = {
      totalPlugins: this.installedPlugins.size,
      connectedPlugins: 0,
      totalUsers: new Set([...this.installedPlugins.values()].map(p => p.userId)).size,
      totalGPUs: 0,
      totalRevenue: 0
    };

    for (const [pluginId, connection] of this.pluginConnections) {
      if (connection.isConnected) {
        stats.connectedPlugins++;
        stats.totalGPUs++;
        stats.totalRevenue += connection.provider.totalEarnings || 0;
      }
    }

    return stats;
  }

  /**
   * Remove a plugin
   */
  async removePlugin(pluginId, userId) {
    const plugin = this.installedPlugins.get(pluginId);
    if (!plugin || plugin.userId !== userId) {
      throw new Error('Plugin not found or unauthorized');
    }

    const connection = this.pluginConnections.get(pluginId);
    if (connection?.socket) {
      connection.socket.disconnect();
    }

    this.installedPlugins.delete(pluginId);
    this.pluginConnections.delete(pluginId);
    this.pluginStats.delete(pluginId);

    console.log(`🔌 Plugin removed: ${plugin.name}`);
    return { success: true };
  }

  /**
   * Update plugin permissions
   */
  async updatePluginPermissions(pluginId, userId, permissions) {
    const plugin = this.installedPlugins.get(pluginId);
    if (!plugin || plugin.userId !== userId) {
      throw new Error('Plugin not found or unauthorized');
    }

    plugin.permissions = permissions;
    plugin.lastSeen = new Date();

    console.log(`🔌 Plugin permissions updated: ${plugin.name}`);
    return { success: true, permissions };
  }
} 