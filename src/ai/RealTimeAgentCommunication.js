/**
 * Real-Time Agent Communication System
 * Enables seamless collaboration between AI agents with WebSocket support
 * Features: message routing, priority handling, and real-time synchronization
 */

import { EventEmitter } from 'events';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';

class RealTimeAgentCommunication extends EventEmitter {
    constructor(port = 3002) {
        super();
        this.port = port;
        this.wss = null;
        this.agents = new Map();
        this.channels = new Map();
        this.messageQueue = [];
        this.priorityQueue = [];
        this.messageHistory = [];
        this.maxHistorySize = 1000;
        
        this.setupLogging();
        this.initializeCommunicationSystem();
    }

    setupLogging() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, agent, channel }) => {
                    return `${timestamp} [${level}] [${agent || 'COMMUNICATION'}] [${channel || 'SYSTEM'}] ${message}`;
                })
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'logs/agent-communication.log' })
            ]
        });
    }

    async initializeCommunicationSystem() {
        this.logger.info('Initializing Real-Time Agent Communication System', {
            agent: 'COMMUNICATION',
            channel: 'INITIALIZATION'
        });

        // Initialize WebSocket server
        this.initializeWebSocketServer();
        
        // Setup communication channels
        this.setupCommunicationChannels();
        
        // Initialize message routing
        this.initializeMessageRouting();
        
        // Start message processing
        this.startMessageProcessing();

        this.logger.info('Real-Time Agent Communication System initialized successfully', {
            agent: 'COMMUNICATION',
            channel: 'INITIALIZATION'
        });
    }

    initializeWebSocketServer() {
        this.wss = new WebSocketServer({ port: this.port });

        this.wss.on('connection', (ws, req) => {
            this.handleAgentConnection(ws, req);
        });

        this.wss.on('error', (error) => {
            this.logger.error('WebSocket server error', {
                agent: 'COMMUNICATION',
                channel: 'WEBSOCKET',
                error: error.message
            });
        });

        this.logger.info(`WebSocket server started on port ${this.port}`, {
            agent: 'COMMUNICATION',
            channel: 'WEBSOCKET'
        });
    }

    handleAgentConnection(ws, req) {
        const agentId = uuidv4();
        const agentInfo = {
            id: agentId,
            ws: ws,
            connectedAt: Date.now(),
            lastActivity: Date.now(),
            channels: new Set(),
            status: 'connected'
        };

        this.agents.set(agentId, agentInfo);

        this.logger.info(`Agent connected: ${agentId}`, {
            agent: 'COMMUNICATION',
            channel: 'CONNECTION',
            agentId: agentId
        });

        // Send welcome message
        this.sendMessage(agentId, {
            type: 'welcome',
            agentId: agentId,
            timestamp: Date.now(),
            channels: Array.from(this.channels.keys())
        });

        // Handle incoming messages
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                this.handleIncomingMessage(agentId, message);
            } catch (error) {
                this.logger.error('Failed to parse message', {
                    agent: 'COMMUNICATION',
                    channel: 'MESSAGE_PARSING',
                    agentId: agentId,
                    error: error.message
                });
            }
        });

        // Handle disconnection
        ws.on('close', () => {
            this.handleAgentDisconnection(agentId);
        });

        // Handle errors
        ws.on('error', (error) => {
            this.logger.error('Agent WebSocket error', {
                agent: 'COMMUNICATION',
                channel: 'WEBSOCKET_ERROR',
                agentId: agentId,
                error: error.message
            });
        });
    }

    handleAgentDisconnection(agentId) {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.status = 'disconnected';
            agent.disconnectedAt = Date.now();

            // Remove from all channels
            agent.channels.forEach(channelName => {
                const channel = this.channels.get(channelName);
                if (channel) {
                    channel.agents.delete(agentId);
                }
            });

            this.logger.info(`Agent disconnected: ${agentId}`, {
                agent: 'COMMUNICATION',
                channel: 'DISCONNECTION',
                agentId: agentId,
                duration: agent.disconnectedAt - agent.connectedAt
            });
        }
    }

    setupCommunicationChannels() {
        // System channels
        this.createChannel('system', {
            type: 'broadcast',
            description: 'System-wide communications',
            priority: 'high'
        });

        // Workflow channels
        this.createChannel('workflow', {
            type: 'workflow',
            description: 'Workflow coordination',
            priority: 'high'
        });

        // Agent-specific channels
        this.createChannel('git-issue-solver', {
            type: 'agent',
            description: 'Git Issue Solver communications',
            priority: 'medium'
        });

        this.createChannel('ai-researcher', {
            type: 'agent',
            description: 'AI Researcher communications',
            priority: 'medium'
        });

        this.createChannel('graphics-specialist', {
            type: 'agent',
            description: 'Graphics Specialist communications',
            priority: 'medium'
        });

        this.createChannel('mathematical-engine', {
            type: 'agent',
            description: 'Mathematical Engine communications',
            priority: 'medium'
        });

        this.createChannel('performance-monitor', {
            type: 'agent',
            description: 'Performance Monitor communications',
            priority: 'medium'
        });

        // Priority channels
        this.createChannel('urgent', {
            type: 'priority',
            description: 'Urgent communications',
            priority: 'critical'
        });

        this.createChannel('debug', {
            type: 'debug',
            description: 'Debug communications',
            priority: 'low'
        });

        this.logger.info('Communication channels initialized', {
            agent: 'COMMUNICATION',
            channel: 'CHANNEL_SETUP',
            channels: Array.from(this.channels.keys())
        });
    }

    createChannel(channelName, config) {
        const channel = {
            name: channelName,
            config: config,
            agents: new Set(),
            messages: [],
            maxMessages: 100,
            createdAt: Date.now()
        };

        this.channels.set(channelName, channel);

        this.logger.info(`Channel created: ${channelName}`, {
            agent: 'COMMUNICATION',
            channel: 'CHANNEL_CREATION',
            channelName: channelName,
            config: config
        });
    }

    initializeMessageRouting() {
        // Message routing rules
        this.routingRules = {
            // Route messages based on type
            'workflow_update': ['workflow'],
            'agent_status': ['system'],
            'performance_alert': ['urgent', 'performance-monitor'],
            'error_report': ['urgent', 'debug'],
            'task_completion': ['workflow'],
            'resource_request': ['system'],
            'coordination_request': ['workflow'],
            'health_check': ['system'],
            'optimization_suggestion': ['performance-monitor'],
            'ai_enhancement': ['ai-researcher'],
            'graphics_optimization': ['graphics-specialist'],
            'mathematical_analysis': ['mathematical-engine'],
            'issue_resolution': ['git-issue-solver']
        };

        this.logger.info('Message routing initialized', {
            agent: 'COMMUNICATION',
            channel: 'ROUTING_SETUP',
            rules: Object.keys(this.routingRules)
        });
    }

    startMessageProcessing() {
        // Process message queue every 100ms
        setInterval(() => {
            this.processMessageQueue();
        }, 100);

        // Process priority queue every 50ms
        setInterval(() => {
            this.processPriorityQueue();
        }, 50);

        // Clean up old messages every minute
        setInterval(() => {
            this.cleanupOldMessages();
        }, 60000);

        this.logger.info('Message processing started', {
            agent: 'COMMUNICATION',
            channel: 'MESSAGE_PROCESSING'
        });
    }

    handleIncomingMessage(agentId, message) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            this.logger.error('Message from unknown agent', {
                agent: 'COMMUNICATION',
                channel: 'MESSAGE_HANDLING',
                agentId: agentId
            });
            return;
        }

        // Update agent activity
        agent.lastActivity = Date.now();

        // Add message to history
        this.addMessageToHistory({
            id: uuidv4(),
            from: agentId,
            to: message.to || 'broadcast',
            channel: message.channel,
            type: message.type,
            content: message.content,
            priority: message.priority || 'normal',
            timestamp: Date.now()
        });

        // Route message based on type
        const targetChannels = this.routingRules[message.type] || ['system'];
        
        targetChannels.forEach(channelName => {
            this.routeMessage(agentId, message, channelName);
        });

        this.logger.debug('Message handled', {
            agent: 'COMMUNICATION',
            channel: 'MESSAGE_HANDLING',
            agentId: agentId,
            messageType: message.type,
            targetChannels: targetChannels
        });
    }

    routeMessage(fromAgentId, message, channelName) {
        const channel = this.channels.get(channelName);
        if (!channel) {
            this.logger.error(`Channel not found: ${channelName}`, {
                agent: 'COMMUNICATION',
                channel: 'MESSAGE_ROUTING',
                channelName: channelName
            });
            return;
        }

        // Add message to channel
        channel.messages.push({
            id: uuidv4(),
            from: fromAgentId,
            content: message.content,
            type: message.type,
            timestamp: Date.now()
        });

        // Limit channel messages
        if (channel.messages.length > channel.maxMessages) {
            channel.messages.shift();
        }

        // Broadcast to channel agents
        channel.agents.forEach(agentId => {
            if (agentId !== fromAgentId) {
                this.sendMessage(agentId, {
                    type: message.type,
                    channel: channelName,
                    from: fromAgentId,
                    content: message.content,
                    timestamp: Date.now()
                });
            }
        });

        // Add to priority queue if high priority
        if (message.priority === 'high' || message.priority === 'critical') {
            this.priorityQueue.push({
                message: message,
                channel: channelName,
                timestamp: Date.now()
            });
        } else {
            this.messageQueue.push({
                message: message,
                channel: channelName,
                timestamp: Date.now()
            });
        }
    }

    sendMessage(agentId, message) {
        const agent = this.agents.get(agentId);
        if (!agent || agent.status !== 'connected') {
            this.logger.warn(`Cannot send message to disconnected agent: ${agentId}`, {
                agent: 'COMMUNICATION',
                channel: 'MESSAGE_SENDING',
                agentId: agentId
            });
            return false;
        }

        try {
            agent.ws.send(JSON.stringify(message));
            agent.lastActivity = Date.now();
            return true;
        } catch (error) {
            this.logger.error(`Failed to send message to agent: ${agentId}`, {
                agent: 'COMMUNICATION',
                channel: 'MESSAGE_SENDING',
                agentId: agentId,
                error: error.message
            });
            return false;
        }
    }

    broadcastMessage(message, channelName = 'system') {
        const channel = this.channels.get(channelName);
        if (!channel) {
            this.logger.error(`Channel not found for broadcast: ${channelName}`, {
                agent: 'COMMUNICATION',
                channel: 'BROADCAST',
                channelName: channelName
            });
            return;
        }

        const sentCount = Array.from(channel.agents).filter(agentId => 
            this.sendMessage(agentId, message)
        ).length;

        this.logger.info(`Broadcast message sent to ${sentCount} agents`, {
            agent: 'COMMUNICATION',
            channel: 'BROADCAST',
            channelName: channelName,
            sentCount: sentCount
        });

        return sentCount;
    }

    joinChannel(agentId, channelName) {
        const agent = this.agents.get(agentId);
        const channel = this.channels.get(channelName);

        if (!agent) {
            this.logger.error(`Agent not found: ${agentId}`, {
                agent: 'COMMUNICATION',
                channel: 'CHANNEL_JOIN',
                agentId: agentId,
                channelName: channelName
            });
            return false;
        }

        if (!channel) {
            this.logger.error(`Channel not found: ${channelName}`, {
                agent: 'COMMUNICATION',
                channel: 'CHANNEL_JOIN',
                agentId: agentId,
                channelName: channelName
            });
            return false;
        }

        agent.channels.add(channelName);
        channel.agents.add(agentId);

        this.logger.info(`Agent joined channel: ${agentId} -> ${channelName}`, {
            agent: 'COMMUNICATION',
            channel: 'CHANNEL_JOIN',
            agentId: agentId,
            channelName: channelName
        });

        return true;
    }

    leaveChannel(agentId, channelName) {
        const agent = this.agents.get(agentId);
        const channel = this.channels.get(channelName);

        if (agent) {
            agent.channels.delete(channelName);
        }

        if (channel) {
            channel.agents.delete(agentId);
        }

        this.logger.info(`Agent left channel: ${agentId} -> ${channelName}`, {
            agent: 'COMMUNICATION',
            channel: 'CHANNEL_LEAVE',
            agentId: agentId,
            channelName: channelName
        });
    }

    processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const queuedMessage = this.messageQueue.shift();
            this.processMessage(queuedMessage);
        }
    }

    processPriorityQueue() {
        while (this.priorityQueue.length > 0) {
            const queuedMessage = this.priorityQueue.shift();
            this.processMessage(queuedMessage);
        }
    }

    processMessage(queuedMessage) {
        const { message, channel: channelName, timestamp } = queuedMessage;

        // Emit event for message processing
        this.emit('message', {
            message: message,
            channel: channelName,
            timestamp: timestamp
        });

        // Handle specific message types
        switch (message.type) {
            case 'workflow_update':
                this.handleWorkflowUpdate(message, channelName);
                break;
            
            case 'agent_status':
                this.handleAgentStatus(message, channelName);
                break;
            
            case 'performance_alert':
                this.handlePerformanceAlert(message, channelName);
                break;
            
            case 'error_report':
                this.handleErrorReport(message, channelName);
                break;
            
            case 'task_completion':
                this.handleTaskCompletion(message, channelName);
                break;
            
            case 'resource_request':
                this.handleResourceRequest(message, channelName);
                break;
            
            case 'coordination_request':
                this.handleCoordinationRequest(message, channelName);
                break;
            
            default:
                this.logger.debug(`Unhandled message type: ${message.type}`, {
                    agent: 'COMMUNICATION',
                    channel: 'MESSAGE_PROCESSING',
                    messageType: message.type
                });
        }
    }

    handleWorkflowUpdate(message, channelName) {
        this.logger.info('Workflow update received', {
            agent: 'COMMUNICATION',
            channel: 'WORKFLOW_UPDATE',
            workflowId: message.content.workflowId,
            status: message.content.status
        });

        // Broadcast to workflow channel
        this.broadcastMessage(message, 'workflow');
    }

    handleAgentStatus(message, channelName) {
        this.logger.info('Agent status update received', {
            agent: 'COMMUNICATION',
            channel: 'AGENT_STATUS',
            agentId: message.from,
            status: message.content.status
        });

        // Update agent status
        const agent = this.agents.get(message.from);
        if (agent) {
            agent.status = message.content.status;
            agent.lastActivity = Date.now();
        }

        // Broadcast to system channel
        this.broadcastMessage(message, 'system');
    }

    handlePerformanceAlert(message, channelName) {
        this.logger.warn('Performance alert received', {
            agent: 'COMMUNICATION',
            channel: 'PERFORMANCE_ALERT',
            alert: message.content.alert,
            severity: message.content.severity
        });

        // Broadcast to urgent and performance-monitor channels
        this.broadcastMessage(message, 'urgent');
        this.broadcastMessage(message, 'performance-monitor');
    }

    handleErrorReport(message, channelName) {
        this.logger.error('Error report received', {
            agent: 'COMMUNICATION',
            channel: 'ERROR_REPORT',
            error: message.content.error,
            stack: message.content.stack
        });

        // Broadcast to urgent and debug channels
        this.broadcastMessage(message, 'urgent');
        this.broadcastMessage(message, 'debug');
    }

    handleTaskCompletion(message, channelName) {
        this.logger.info('Task completion received', {
            agent: 'COMMUNICATION',
            channel: 'TASK_COMPLETION',
            taskId: message.content.taskId,
            result: message.content.result
        });

        // Broadcast to workflow channel
        this.broadcastMessage(message, 'workflow');
    }

    handleResourceRequest(message, channelName) {
        this.logger.info('Resource request received', {
            agent: 'COMMUNICATION',
            channel: 'RESOURCE_REQUEST',
            resource: message.content.resource,
            priority: message.content.priority
        });

        // Broadcast to system channel
        this.broadcastMessage(message, 'system');
    }

    handleCoordinationRequest(message, channelName) {
        this.logger.info('Coordination request received', {
            agent: 'COMMUNICATION',
            channel: 'COORDINATION_REQUEST',
            request: message.content.request,
            agents: message.content.agents
        });

        // Broadcast to workflow channel
        this.broadcastMessage(message, 'workflow');
    }

    addMessageToHistory(message) {
        this.messageHistory.push(message);

        // Limit history size
        if (this.messageHistory.length > this.maxHistorySize) {
            this.messageHistory.shift();
        }
    }

    cleanupOldMessages() {
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours

        // Clean up message history
        this.messageHistory = this.messageHistory.filter(message => 
            message.timestamp > cutoffTime
        );

        // Clean up channel messages
        this.channels.forEach(channel => {
            channel.messages = channel.messages.filter(message => 
                message.timestamp > cutoffTime
            );
        });

        this.logger.debug('Old messages cleaned up', {
            agent: 'COMMUNICATION',
            channel: 'CLEANUP',
            cutoffTime: cutoffTime
        });
    }

    getSystemStatus() {
        return {
            communication: {
                status: 'active',
                port: this.port,
                connectedAgents: Array.from(this.agents.values()).filter(agent => agent.status === 'connected').length,
                totalAgents: this.agents.size,
                channels: Array.from(this.channels.keys()),
                messageQueueSize: this.messageQueue.length,
                priorityQueueSize: this.priorityQueue.length
            },
            agents: Array.from(this.agents.entries()).map(([id, agent]) => ({
                id: id,
                status: agent.status,
                connectedAt: agent.connectedAt,
                lastActivity: agent.lastActivity,
                channels: Array.from(agent.channels)
            })),
            channels: Array.from(this.channels.entries()).map(([name, channel]) => ({
                name: name,
                config: channel.config,
                agentCount: channel.agents.size,
                messageCount: channel.messages.length
            })),
            recentMessages: this.messageHistory.slice(-10)
        };
    }

    async shutdown() {
        this.logger.info('Shutting down Real-Time Agent Communication System', {
            agent: 'COMMUNICATION',
            channel: 'SHUTDOWN'
        });

        // Close all agent connections
        this.agents.forEach(agent => {
            if (agent.ws && agent.ws.readyState === 1) {
                agent.ws.close();
            }
        });

        // Close WebSocket server
        if (this.wss) {
            this.wss.close();
        }

        this.logger.info('Real-Time Agent Communication System shutdown complete', {
            agent: 'COMMUNICATION',
            channel: 'SHUTDOWN'
        });
    }
}

export default RealTimeAgentCommunication; 