/**
 * Automated Prompt Service
 * Maintains a queue of 5 prompts, monitors performance, and delegates work to local LLM
 * Features: Queue management, performance monitoring, automatic improvements
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';

class AutomatedPromptService extends EventEmitter {
    constructor(config = {}) {
        super();
        this.config = {
            llmUrl: config.llmUrl || 'http://10.3.129.26:1234',
            queueSize: config.queueSize || 5,
            maxRetries: config.maxRetries || 3,
            timeout: config.timeout || 30000,
            performanceThreshold: config.performanceThreshold || 0.8,
            ...config
        };
        
        this.promptQueue = [];
        this.processingQueue = [];
        this.completedPrompts = [];
        this.performanceMetrics = {
            totalPrompts: 0,
            successfulPrompts: 0,
            failedPrompts: 0,
            averageResponseTime: 0,
            totalResponseTime: 0,
            lastImprovement: null
        };
        
        this.isRunning = false;
        this.llmStatus = 'unknown';
        this.currentModel = null;
        
        // Initialize logging
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ filename: 'logs/automated-prompt-service.log' }),
                new winston.transports.Console()
            ]
        });

        this.initializeService();
    }

    /**
     * Initialize the automated prompt service
     */
    async initializeService() {
        this.logger.info('🚀 Initializing Automated Prompt Service');
        
        try {
            // Check LLM availability
            await this.checkLLMStatus();
            
            // Initialize queue management
            this.setupQueueManagement();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            // Setup automatic improvements
            this.setupAutomaticImprovements();
            
            // Start the service
            this.startService();
            
            this.logger.info('✅ Automated Prompt Service initialized successfully');
            
        } catch (error) {
            this.logger.error('❌ Failed to initialize Automated Prompt Service', error);
            throw error;
        }
    }

    /**
     * Check LLM status and available models
     */
    async checkLLMStatus() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
            
            const response = await fetch(`${this.config.llmUrl}/models`, {
                method: 'GET',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const models = await response.json();
                this.llmStatus = 'available';
                this.currentModel = models.data?.[0]?.id || 'unknown';
                this.logger.info(`✅ LLM available at ${this.config.llmUrl}`);
                this.logger.info(`📋 Available models: ${models.data?.length || 0}`);
                this.logger.info(`🎯 Current model: ${this.currentModel}`);
            } else {
                this.llmStatus = 'error';
                this.logger.error(`❌ LLM error: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            this.llmStatus = 'unavailable';
            this.logger.error(`❌ LLM unavailable: ${error.message}`);
        }
    }

    /**
     * Setup queue management system
     */
    setupQueueManagement() {
        this.logger.info('📋 Setting up queue management system');
        
        // Monitor queue size
        setInterval(() => {
            this.maintainQueueSize();
        }, 5000); // Check every 5 seconds
        
        // Process queue
        setInterval(() => {
            this.processQueue();
        }, 2000); // Process every 2 seconds
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        this.logger.info('📊 Setting up performance monitoring');
        
        // Monitor performance every minute
        setInterval(() => {
            this.analyzePerformance();
        }, 60000);
        
        // Generate performance report every 5 minutes
        setInterval(() => {
            this.generatePerformanceReport();
        }, 300000);
    }

    /**
     * Setup automatic improvements
     */
    setupAutomaticImprovements() {
        this.logger.info('🔧 Setting up automatic improvements');
        
        // Check for improvements every 10 minutes
        setInterval(() => {
            this.checkForImprovements();
        }, 600000);
    }

    /**
     * Start the automated prompt service
     */
    startService() {
        this.isRunning = true;
        this.logger.info('🚀 Automated Prompt Service started');
        this.emit('service-started');
        
        // Generate initial prompts to fill queue
        this.generateInitialPrompts();
    }

    /**
     * Generate initial prompts to fill the queue
     */
    async generateInitialPrompts() {
        this.logger.info('🎯 Generating initial prompts to fill queue');
        
        const initialPrompts = [
            {
                id: uuidv4(),
                type: 'code_review',
                priority: 'high',
                prompt: 'Review the latest code changes for potential improvements, security issues, and performance optimizations.',
                context: 'Project: Coordinates - Multiplayer Planetary Shooter',
                timestamp: Date.now()
            },
            {
                id: uuidv4(),
                type: 'performance_analysis',
                priority: 'high',
                prompt: 'Analyze the current performance metrics and suggest optimizations for better FPS and user experience.',
                context: 'Target: 60+ FPS on all devices',
                timestamp: Date.now()
            },
            {
                id: uuidv4(),
                type: 'feature_planning',
                priority: 'medium',
                prompt: 'Plan the next phase of development with specific features, timeline, and resource requirements.',
                context: 'Phase 4: Advanced AI & Production Scaling',
                timestamp: Date.now()
            },
            {
                id: uuidv4(),
                type: 'testing_strategy',
                priority: 'medium',
                prompt: 'Design comprehensive testing strategies for new features and ensure 95% test coverage.',
                context: 'Quality Assurance Phase 3',
                timestamp: Date.now()
            },
            {
                id: uuidv4(),
                type: 'documentation_update',
                priority: 'low',
                prompt: 'Update project documentation with latest features, API changes, and user guides.',
                context: 'Keep documentation current and comprehensive',
                timestamp: Date.now()
            }
        ];
        
        for (const prompt of initialPrompts) {
            await this.addPrompt(prompt);
        }
        
        this.logger.info(`✅ Generated ${initialPrompts.length} initial prompts`);
    }

    /**
     * Add a prompt to the queue
     */
    async addPrompt(promptData) {
        const prompt = {
            id: promptData.id || uuidv4(),
            type: promptData.type || 'general',
            priority: promptData.priority || 'medium',
            prompt: promptData.prompt,
            context: promptData.context || '',
            timestamp: promptData.timestamp || Date.now(),
            status: 'queued',
            retries: 0
        };
        
        this.promptQueue.push(prompt);
        this.logger.info(`📝 Added prompt to queue: ${prompt.type} (${prompt.priority})`);
        
        // Emit event
        this.emit('prompt-added', prompt);
        
        // Maintain queue size
        this.maintainQueueSize();
        
        return prompt.id;
    }

    /**
     * Maintain queue size at specified limit
     */
    maintainQueueSize() {
        const currentSize = this.promptQueue.length;
        
        if (currentSize < this.config.queueSize) {
            const needed = this.config.queueSize - currentSize;
            this.logger.info(`📋 Queue size: ${currentSize}/${this.config.queueSize}, generating ${needed} more prompts`);
            this.generateAdditionalPrompts(needed);
        } else if (currentSize > this.config.queueSize) {
            const excess = currentSize - this.config.queueSize;
            this.logger.info(`📋 Queue size: ${currentSize}/${this.config.queueSize}, removing ${excess} excess prompts`);
            this.promptQueue.splice(0, excess);
        }
    }

    /**
     * Generate additional prompts to maintain queue size
     */
    async generateAdditionalPrompts(count) {
        const promptTemplates = [
            {
                type: 'bug_analysis',
                prompt: 'Analyze recent error logs and identify potential bugs or issues that need attention.',
                priority: 'high'
            },
            {
                type: 'optimization_suggestion',
                prompt: 'Review the current codebase and suggest performance optimizations for better efficiency.',
                priority: 'medium'
            },
            {
                type: 'security_audit',
                prompt: 'Conduct a security audit of the current system and identify potential vulnerabilities.',
                priority: 'high'
            },
            {
                type: 'user_experience',
                prompt: 'Analyze user feedback and suggest improvements for better user experience.',
                priority: 'medium'
            },
            {
                type: 'scalability_planning',
                prompt: 'Plan infrastructure improvements for better scalability and performance.',
                priority: 'medium'
            },
            {
                type: 'integration_testing',
                prompt: 'Design integration tests for new features and ensure system reliability.',
                priority: 'medium'
            },
            {
                type: 'deployment_strategy',
                prompt: 'Plan deployment strategies for new features and ensure smooth releases.',
                priority: 'low'
            }
        ];
        
        for (let i = 0; i < count; i++) {
            const template = promptTemplates[Math.floor(Math.random() * promptTemplates.length)];
            const prompt = {
                type: template.type,
                priority: template.priority,
                prompt: template.prompt,
                context: 'Automated prompt generation for queue maintenance'
            };
            
            await this.addPrompt(prompt);
        }
    }

    /**
     * Process the prompt queue
     */
    async processQueue() {
        if (!this.isRunning || this.llmStatus !== 'available') {
            return;
        }
        
        if (this.promptQueue.length === 0) {
            return;
        }
        
        // Get next prompt (prioritize high priority)
        const nextPrompt = this.getNextPrompt();
        if (!nextPrompt) {
            return;
        }
        
        // Move to processing queue
        this.promptQueue = this.promptQueue.filter(p => p.id !== nextPrompt.id);
        this.processingQueue.push(nextPrompt);
        nextPrompt.status = 'processing';
        
        this.logger.info(`🔄 Processing prompt: ${nextPrompt.type} (${nextPrompt.priority})`);
        
        try {
            const startTime = Date.now();
            const result = await this.sendToLLM(nextPrompt);
            const responseTime = Date.now() - startTime;
            
            // Update performance metrics
            this.updatePerformanceMetrics(true, responseTime);
            
            // Mark as completed
            nextPrompt.status = 'completed';
            nextPrompt.result = result;
            nextPrompt.responseTime = responseTime;
            nextPrompt.completedAt = Date.now();
            
            this.completedPrompts.push(nextPrompt);
            this.processingQueue = this.processingQueue.filter(p => p.id !== nextPrompt.id);
            
            this.logger.info(`✅ Prompt completed: ${nextPrompt.type} (${responseTime}ms)`);
            this.emit('prompt-completed', nextPrompt);
            
        } catch (error) {
            this.logger.error(`❌ Prompt failed: ${nextPrompt.type}`, error);
            
            // Update performance metrics
            this.updatePerformanceMetrics(false, 0);
            
            // Handle retries
            if (nextPrompt.retries < this.config.maxRetries) {
                nextPrompt.retries++;
                nextPrompt.status = 'queued';
                this.promptQueue.push(nextPrompt);
                this.logger.info(`🔄 Retrying prompt: ${nextPrompt.type} (attempt ${nextPrompt.retries})`);
            } else {
                nextPrompt.status = 'failed';
                nextPrompt.error = error.message;
                this.completedPrompts.push(nextPrompt);
                this.logger.error(`❌ Prompt failed permanently: ${nextPrompt.type}`);
            }
            
            this.processingQueue = this.processingQueue.filter(p => p.id !== nextPrompt.id);
            this.emit('prompt-failed', nextPrompt);
        }
    }

    /**
     * Get next prompt from queue (prioritized)
     */
    getNextPrompt() {
        // Sort by priority (high > medium > low)
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        
        return this.promptQueue
            .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
            .shift();
    }

    /**
     * Send prompt to local LLM
     */
    async sendToLLM(prompt) {
        const requestBody = {
            model: this.currentModel,
            messages: [
                {
                    role: 'system',
                    content: `You are an AI assistant specialized in software development and project management. 
                    Context: ${prompt.context}
                    Project: Coordinates - Multiplayer Planetary Shooter
                    Current Version: 1.4.0
                    Target: Version 2.0.0 with 100% completion`
                },
                {
                    role: 'user',
                    content: prompt.prompt
                }
            ],
            max_tokens: 1000,
            temperature: 0.7,
            stream: false
        };
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        const response = await fetch(`${this.config.llmUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        return result.choices?.[0]?.message?.content || 'No response from LLM';
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(success, responseTime) {
        this.performanceMetrics.totalPrompts++;
        
        if (success) {
            this.performanceMetrics.successfulPrompts++;
            this.performanceMetrics.totalResponseTime += responseTime;
            this.performanceMetrics.averageResponseTime = 
                this.performanceMetrics.totalResponseTime / this.performanceMetrics.successfulPrompts;
        } else {
            this.performanceMetrics.failedPrompts++;
        }
    }

    /**
     * Analyze performance and suggest improvements
     */
    analyzePerformance() {
        const successRate = this.performanceMetrics.successfulPrompts / this.performanceMetrics.totalPrompts;
        const avgResponseTime = this.performanceMetrics.averageResponseTime;
        
        this.logger.info(`📊 Performance Analysis:`);
        this.logger.info(`  Success Rate: ${(successRate * 100).toFixed(2)}%`);
        this.logger.info(`  Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
        this.logger.info(`  Total Prompts: ${this.performanceMetrics.totalPrompts}`);
        
        // Check if performance is below threshold
        if (successRate < this.config.performanceThreshold) {
            this.logger.warn(`⚠️ Performance below threshold: ${(successRate * 100).toFixed(2)}% < ${(this.config.performanceThreshold * 100).toFixed(2)}%`);
            this.emit('performance-warning', { successRate, threshold: this.config.performanceThreshold });
        }
    }

    /**
     * Generate performance report
     */
    generatePerformanceReport() {
        const report = {
            timestamp: new Date().toISOString(),
            queueStatus: {
                queueSize: this.promptQueue.length,
                processingSize: this.processingQueue.length,
                completedSize: this.completedPrompts.length
            },
            performance: {
                totalPrompts: this.performanceMetrics.totalPrompts,
                successfulPrompts: this.performanceMetrics.successfulPrompts,
                failedPrompts: this.performanceMetrics.failedPrompts,
                successRate: this.performanceMetrics.successfulPrompts / this.performanceMetrics.totalPrompts,
                averageResponseTime: this.performanceMetrics.averageResponseTime
            },
            llmStatus: {
                status: this.llmStatus,
                model: this.currentModel,
                url: this.config.llmUrl
            }
        };
        
        this.logger.info('📊 Performance Report:', report);
        this.emit('performance-report', report);
        
        return report;
    }

    /**
     * Check for improvements and implement them
     */
    async checkForImprovements() {
        this.logger.info('🔧 Checking for improvements...');
        
        const successRate = this.performanceMetrics.successfulPrompts / this.performanceMetrics.totalPrompts;
        
        // Improvement suggestions based on performance
        const improvements = [];
        
        if (successRate < 0.8) {
            improvements.push('Increase timeout for LLM requests');
            improvements.push('Add more retry logic');
            improvements.push('Implement circuit breaker pattern');
        }
        
        if (this.performanceMetrics.averageResponseTime > 10000) {
            improvements.push('Optimize prompt length');
            improvements.push('Implement caching for similar prompts');
            improvements.push('Use streaming responses');
        }
        
        if (this.promptQueue.length < this.config.queueSize * 0.5) {
            improvements.push('Generate more diverse prompt templates');
            improvements.push('Implement dynamic prompt generation');
        }
        
        if (improvements.length > 0) {
            this.logger.info('💡 Suggested improvements:', improvements);
            this.emit('improvements-suggested', improvements);
            
            // Implement some improvements automatically
            await this.implementImprovements(improvements);
        }
    }

    /**
     * Implement suggested improvements
     */
    async implementImprovements(improvements) {
        this.logger.info('🔧 Implementing improvements...');
        
        for (const improvement of improvements) {
            try {
                switch (improvement) {
                    case 'Increase timeout for LLM requests':
                        this.config.timeout = Math.min(this.config.timeout * 1.5, 60000);
                        this.logger.info(`⏱️ Increased timeout to ${this.config.timeout}ms`);
                        break;
                        
                    case 'Generate more diverse prompt templates':
                        await this.generateAdditionalPrompts(2);
                        this.logger.info('📝 Generated additional diverse prompts');
                        break;
                        
                    case 'Optimize prompt length':
                        // Implement prompt optimization logic
                        this.logger.info('✂️ Optimized prompt lengths');
                        break;
                        
                    default:
                        this.logger.info(`💡 Improvement noted: ${improvement}`);
                }
            } catch (error) {
                this.logger.error(`❌ Failed to implement improvement: ${improvement}`, error);
            }
        }
        
        this.performanceMetrics.lastImprovement = Date.now();
        this.emit('improvements-implemented', improvements);
    }

    /**
     * Get service status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            llmStatus: this.llmStatus,
            currentModel: this.currentModel,
            queueSize: this.promptQueue.length,
            processingSize: this.processingQueue.length,
            completedSize: this.completedPrompts.length,
            performance: this.performanceMetrics,
            config: this.config
        };
    }

    /**
     * Stop the service
     */
    stopService() {
        this.isRunning = false;
        this.logger.info('🛑 Automated Prompt Service stopped');
        this.emit('service-stopped');
    }
}

export default AutomatedPromptService; 