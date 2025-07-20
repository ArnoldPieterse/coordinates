/**
 * Chain-of-Thought API System
 * RESTful API and WebSocket endpoints for thought monitoring
 */

import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import ChainOfThoughtMonitor from './chain-of-thought-monitor.js';

export class ChainOfThoughtAPI {
    constructor(config = {}) {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        
        this.port = config.port || 3003;
        this.monitor = new ChainOfThoughtMonitor(config.monitorConfig);
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
        this.setupEventHandlers();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        
        // Request logging
        this.app.use((req, res, next) => {
            console.log(`[API] ${req.method} ${req.path} - ${new Date().toISOString()}`);
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date(),
                monitor: {
                    totalThoughts: this.monitor.metrics.totalThoughts,
                    activeThoughts: this.monitor.activeThoughts.size,
                    gitEnabled: this.monitor.gitEnabled,
                    apiEnabled: this.monitor.apiEnabled
                }
            });
        });

        // Record a new thought
        this.app.post('/api/thoughts', async (req, res) => {
            try {
                const { agentId, thought, context } = req.body;
                
                if (!agentId || !thought) {
                    return res.status(400).json({
                        error: 'Missing required fields: agentId and thought'
                    });
                }

                const thoughtRecord = await this.monitor.recordThought(agentId, thought, context);
                
                res.json({
                    success: true,
                    thought: thoughtRecord,
                    message: 'Thought recorded successfully'
                });
            } catch (error) {
                console.error('Error recording thought:', error);
                res.status(500).json({
                    error: 'Failed to record thought',
                    details: error.message
                });
            }
        });

        // Get agent thought analysis
        this.app.get('/api/agents/:agentId/thoughts', (req, res) => {
            try {
                const { agentId } = req.params;
                const { limit = 50, offset = 0 } = req.query;
                
                const thoughts = this.monitor.thoughtHistory.get(agentId) || [];
                const paginatedThoughts = thoughts.slice(offset, offset + parseInt(limit));
                
                res.json({
                    success: true,
                    agentId,
                    thoughts: paginatedThoughts,
                    total: thoughts.length,
                    pagination: {
                        limit: parseInt(limit),
                        offset: parseInt(offset),
                        hasMore: offset + parseInt(limit) < thoughts.length
                    }
                });
            } catch (error) {
                console.error('Error getting agent thoughts:', error);
                res.status(500).json({
                    error: 'Failed to get agent thoughts',
                    details: error.message
                });
            }
        });

        // Get agent thought analysis
        this.app.get('/api/agents/:agentId/analysis', (req, res) => {
            try {
                const { agentId } = req.params;
                const analysis = this.monitor.getAgentThoughtAnalysis(agentId);
                
                res.json({
                    success: true,
                    analysis
                });
            } catch (error) {
                console.error('Error getting agent analysis:', error);
                res.status(500).json({
                    error: 'Failed to get agent analysis',
                    details: error.message
                });
            }
        });

        // Get global thought analysis
        this.app.get('/api/analysis/global', (req, res) => {
            try {
                const analysis = this.monitor.getGlobalThoughtAnalysis();
                
                res.json({
                    success: true,
                    analysis
                });
            } catch (error) {
                console.error('Error getting global analysis:', error);
                res.status(500).json({
                    error: 'Failed to get global analysis',
                    details: error.message
                });
            }
        });

        // Get reasoning patterns
        this.app.get('/api/patterns/:agentId', (req, res) => {
            try {
                const { agentId } = req.params;
                const patterns = this.monitor.reasoningPatterns.get(agentId) || [];
                
                res.json({
                    success: true,
                    agentId,
                    patterns,
                    summary: {
                        totalPatterns: patterns.length,
                        averageConfidence: patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length,
                        averageQuality: patterns.reduce((sum, p) => sum + p.quality, 0) / patterns.length
                    }
                });
            } catch (error) {
                console.error('Error getting patterns:', error);
                res.status(500).json({
                    error: 'Failed to get patterns',
                    details: error.message
                });
            }
        });

        // Get confidence metrics
        this.app.get('/api/metrics/confidence/:agentId', (req, res) => {
            try {
                const { agentId } = req.params;
                const metrics = this.monitor.confidenceMetrics.get(agentId);
                
                if (!metrics) {
                    return res.status(404).json({
                        error: 'No confidence metrics found for this agent'
                    });
                }
                
                res.json({
                    success: true,
                    agentId,
                    metrics
                });
            } catch (error) {
                console.error('Error getting confidence metrics:', error);
                res.status(500).json({
                    error: 'Failed to get confidence metrics',
                    details: error.message
                });
            }
        });

        // Get learning progress
        this.app.get('/api/learning/:agentId', (req, res) => {
            try {
                const { agentId } = req.params;
                const progress = this.monitor.learningProgress.get(agentId);
                
                if (!progress) {
                    return res.status(404).json({
                        error: 'No learning progress found for this agent'
                    });
                }
                
                res.json({
                    success: true,
                    agentId,
                    progress
                });
            } catch (error) {
                console.error('Error getting learning progress:', error);
                res.status(500).json({
                    error: 'Failed to get learning progress',
                    details: error.message
                });
            }
        });

        // Get system metrics
        this.app.get('/api/metrics/system', (req, res) => {
            try {
                res.json({
                    success: true,
                    metrics: this.monitor.metrics,
                    activeThoughts: Array.from(this.monitor.activeThoughts.entries()).map(([agentId, thought]) => ({
                        agentId,
                        thoughtId: thought.id,
                        timestamp: thought.context.timestamp,
                        confidence: thought.confidence
                    }))
                });
            } catch (error) {
                console.error('Error getting system metrics:', error);
                res.status(500).json({
                    error: 'Failed to get system metrics',
                    details: error.message
                });
            }
        });

        // Batch thought recording
        this.app.post('/api/thoughts/batch', async (req, res) => {
            try {
                const { thoughts } = req.body;
                
                if (!Array.isArray(thoughts)) {
                    return res.status(400).json({
                        error: 'Thoughts must be an array'
                    });
                }

                const results = [];
                for (const thoughtData of thoughts) {
                    try {
                        const { agentId, thought, context } = thoughtData;
                        const thoughtRecord = await this.monitor.recordThought(agentId, thought, context);
                        results.push({ success: true, thought: thoughtRecord });
                    } catch (error) {
                        results.push({ success: false, error: error.message });
                    }
                }
                
                res.json({
                    success: true,
                    results,
                    summary: {
                        total: thoughts.length,
                        successful: results.filter(r => r.success).length,
                        failed: results.filter(r => !r.success).length
                    }
                });
            } catch (error) {
                console.error('Error recording batch thoughts:', error);
                res.status(500).json({
                    error: 'Failed to record batch thoughts',
                    details: error.message
                });
            }
        });

        // Search thoughts
        this.app.get('/api/thoughts/search', (req, res) => {
            try {
                const { query, agentId, minConfidence, maxConfidence, startDate, endDate } = req.query;
                
                let allThoughts = [];
                if (agentId) {
                    allThoughts = this.monitor.thoughtHistory.get(agentId) || [];
                } else {
                    allThoughts = Array.from(this.monitor.thoughtHistory.values()).flat();
                }
                
                // Apply filters
                let filteredThoughts = allThoughts;
                
                if (query) {
                    const searchTerm = query.toLowerCase();
                    filteredThoughts = filteredThoughts.filter(thought => 
                        thought.thought.toLowerCase().includes(searchTerm) ||
                        thought.reasoning.some(r => r.toLowerCase().includes(searchTerm))
                    );
                }
                
                if (minConfidence) {
                    filteredThoughts = filteredThoughts.filter(thought => 
                        thought.confidence >= parseFloat(minConfidence)
                    );
                }
                
                if (maxConfidence) {
                    filteredThoughts = filteredThoughts.filter(thought => 
                        thought.confidence <= parseFloat(maxConfidence)
                    );
                }
                
                if (startDate) {
                    const start = new Date(startDate);
                    filteredThoughts = filteredThoughts.filter(thought => 
                        new Date(thought.context.timestamp) >= start
                    );
                }
                
                if (endDate) {
                    const end = new Date(endDate);
                    filteredThoughts = filteredThoughts.filter(thought => 
                        new Date(thought.context.timestamp) <= end
                    );
                }
                
                res.json({
                    success: true,
                    thoughts: filteredThoughts,
                    total: filteredThoughts.length,
                    filters: { query, agentId, minConfidence, maxConfidence, startDate, endDate }
                });
            } catch (error) {
                console.error('Error searching thoughts:', error);
                res.status(500).json({
                    error: 'Failed to search thoughts',
                    details: error.message
                });
            }
        });

        // Export thoughts
        this.app.get('/api/thoughts/export', (req, res) => {
            try {
                const { format = 'json', agentId } = req.query;
                
                let thoughts = [];
                if (agentId) {
                    thoughts = this.monitor.thoughtHistory.get(agentId) || [];
                } else {
                    thoughts = Array.from(this.monitor.thoughtHistory.values()).flat();
                }
                
                const exportData = {
                    exportDate: new Date(),
                    totalThoughts: thoughts.length,
                    agents: [...new Set(thoughts.map(t => t.agentId))],
                    thoughts: thoughts
                };
                
                if (format === 'csv') {
                    // Convert to CSV format
                    const csvHeaders = ['agentId', 'thought', 'confidence', 'reasoningQuality', 'timestamp'];
                    const csvRows = thoughts.map(t => [
                        t.agentId,
                        `"${t.thought.replace(/"/g, '""')}"`,
                        t.confidence,
                        t.metadata.reasoningQuality,
                        t.context.timestamp
                    ]);
                    
                    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
                    
                    res.setHeader('Content-Type', 'text/csv');
                    res.setHeader('Content-Disposition', 'attachment; filename="thoughts_export.csv"');
                    res.send(csvContent);
                } else {
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Content-Disposition', 'attachment; filename="thoughts_export.json"');
                    res.json(exportData);
                }
            } catch (error) {
                console.error('Error exporting thoughts:', error);
                res.status(500).json({
                    error: 'Failed to export thoughts',
                    details: error.message
                });
            }
        });

        // Configuration endpoints
        this.app.get('/api/config', (req, res) => {
            res.json({
                success: true,
                config: this.monitor.config
            });
        });

        this.app.put('/api/config', (req, res) => {
            try {
                const updates = req.body;
                Object.assign(this.monitor.config, updates);
                
                res.json({
                    success: true,
                    message: 'Configuration updated successfully',
                    config: this.monitor.config
                });
            } catch (error) {
                console.error('Error updating config:', error);
                res.status(500).json({
                    error: 'Failed to update configuration',
                    details: error.message
                });
            }
        });

        // Error handling middleware
        this.app.use((error, req, res, next) => {
            console.error('API Error:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: error.message
            });
        });
    }

    setupWebSocket() {
        this.io.on('connection', (socket) => {
            console.log(`[WebSocket] Client connected: ${socket.id}`);
            
            // Send initial data
            socket.emit('connected', {
                message: 'Connected to Chain-of-Thought Monitor',
                timestamp: new Date(),
                monitor: {
                    totalThoughts: this.monitor.metrics.totalThoughts,
                    activeThoughts: this.monitor.activeThoughts.size
                }
            });
            
            // Handle client subscriptions
            socket.on('subscribe:agent', (agentId) => {
                socket.join(`agent:${agentId}`);
                console.log(`[WebSocket] Client ${socket.id} subscribed to agent ${agentId}`);
            });
            
            socket.on('subscribe:global', () => {
                socket.join('global');
                console.log(`[WebSocket] Client ${socket.id} subscribed to global updates`);
            });
            
            socket.on('unsubscribe:agent', (agentId) => {
                socket.leave(`agent:${agentId}`);
                console.log(`[WebSocket] Client ${socket.id} unsubscribed from agent ${agentId}`);
            });
            
            socket.on('unsubscribe:global', () => {
                socket.leave('global');
                console.log(`[WebSocket] Client ${socket.id} unsubscribed from global updates`);
            });
            
            socket.on('disconnect', () => {
                console.log(`[WebSocket] Client disconnected: ${socket.id}`);
            });
        });
    }

    setupEventHandlers() {
        // Monitor events to WebSocket clients
        this.monitor.on('thought:recorded', (thoughtRecord) => {
            this.io.to(`agent:${thoughtRecord.agentId}`).emit('thought:new', thoughtRecord);
            this.io.to('global').emit('thought:recorded', {
                agentId: thoughtRecord.agentId,
                thoughtId: thoughtRecord.id,
                confidence: thoughtRecord.confidence,
                timestamp: thoughtRecord.context.timestamp
            });
        });
        
        this.monitor.on('thought:high-confidence', (thoughtRecord) => {
            this.io.to('global').emit('thought:high-confidence', {
                agentId: thoughtRecord.agentId,
                thoughtId: thoughtRecord.id,
                confidence: thoughtRecord.confidence,
                thought: thoughtRecord.thought.substring(0, 100) + '...'
            });
        });
        
        this.monitor.on('thought:low-confidence', (thoughtRecord) => {
            this.io.to('global').emit('thought:low-confidence', {
                agentId: thoughtRecord.agentId,
                thoughtId: thoughtRecord.id,
                confidence: thoughtRecord.confidence,
                thought: thoughtRecord.thought.substring(0, 100) + '...'
            });
        });
        
        this.monitor.on('agent:thinking', (data) => {
            this.io.to(`agent:${data.agentId}`).emit('agent:thinking', data);
        });
        
        this.monitor.on('monitoring:tick', (data) => {
            this.io.to('global').emit('monitoring:update', data);
        });
        
        this.monitor.on('git:committed', (data) => {
            this.io.to('global').emit('git:committed', data);
        });
        
        this.monitor.on('api:success', (data) => {
            this.io.to('global').emit('api:success', data);
        });
        
        this.monitor.on('api:error', (data) => {
            this.io.to('global').emit('api:error', data);
        });
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`🚀 Chain-of-Thought API Server running on port ${this.port}`);
            console.log(`📊 Health check: http://localhost:${this.port}/health`);
            console.log(`🔌 WebSocket: ws://localhost:${this.port}`);
        });
    }

    async shutdown() {
        console.log('🔄 Shutting down Chain-of-Thought API Server...');
        
        await this.monitor.shutdown();
        
        this.server.close(() => {
            console.log('✅ Chain-of-Thought API Server shutdown complete');
        });
    }
}

export default ChainOfThoughtAPI; 