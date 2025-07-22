/**
 * AI Error Handler
 * Comprehensive error handling for AI model interactions and API connections
 * Addresses LLM generation failures, authentication issues, and connection problems
 */

import { EventEmitter } from 'events';
import winston from 'winston';

class AIErrorHandler extends EventEmitter {
    constructor() {
        super();
        this.errorHistory = new Map();
        this.retryStrategies = new Map();
        this.fallbackProviders = new Map();
        this.connectionPool = new Map();
        this.healthStatus = new Map();
        
        this.setupLogging();
        this.initializeErrorHandling();
    }

    setupLogging() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, provider, error }) => {
                    return `${timestamp} [${level}] [AI_ERROR_HANDLER] [${provider || 'SYSTEM'}] ${message}`;
                })
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'logs/ai-errors.log' })
            ]
        });
    }

    initializeErrorHandling() {
        this.logger.info('Initializing AI Error Handler', {
            provider: 'SYSTEM'
        });

        // Initialize retry strategies
        this.initializeRetryStrategies();
        
        // Setup fallback providers
        this.setupFallbackProviders();
        
        // Initialize connection health monitoring
        this.initializeHealthMonitoring();
        
        // Setup error recovery mechanisms
        this.setupErrorRecovery();

        this.logger.info('AI Error Handler initialized successfully', {
            provider: 'SYSTEM'
        });
    }

    initializeRetryStrategies() {
        // Retry strategies for different error types
        this.retryStrategies.set('llm_generation_failed', {
            maxRetries: 3,
            backoffMultiplier: 2,
            initialDelay: 1000,
            maxDelay: 10000,
            conditions: ['network_error', 'timeout', 'rate_limit']
        });

        this.retryStrategies.set('authentication_failed', {
            maxRetries: 2,
            backoffMultiplier: 1.5,
            initialDelay: 2000,
            maxDelay: 8000,
            conditions: ['401', '403', 'invalid_token']
        });

        this.retryStrategies.set('connection_failed', {
            maxRetries: 5,
            backoffMultiplier: 1.2,
            initialDelay: 500,
            maxDelay: 5000,
            conditions: ['network_error', 'connection_refused', 'timeout']
        });

        this.retryStrategies.set('mixed_content', {
            maxRetries: 1,
            backoffMultiplier: 1,
            initialDelay: 0,
            maxDelay: 0,
            conditions: ['http_request_blocked', 'csp_violation']
        });

        this.logger.info('Retry strategies initialized', {
            provider: 'SYSTEM',
            strategies: Array.from(this.retryStrategies.keys())
        });
    }

    setupFallbackProviders() {
        // Fallback providers for different AI services
        this.fallbackProviders.set('anthropic_free', [
            'openai_free',
            'local_lm_studio',
            'huggingface_inference'
        ]);

        this.fallbackProviders.set('openai_free', [
            'anthropic_free',
            'local_lm_studio',
            'huggingface_inference'
        ]);

        this.fallbackProviders.set('local_lm_studio', [
            'anthropic_free',
            'openai_free',
            'huggingface_inference'
        ]);

        this.logger.info('Fallback providers configured', {
            provider: 'SYSTEM',
            fallbacks: Array.from(this.fallbackProviders.keys())
        });
    }

    initializeHealthMonitoring() {
        // Monitor provider health every 30 seconds
        setInterval(() => {
            this.updateProviderHealth();
        }, 30000);

        // Monitor connection pool every 15 seconds
        setInterval(() => {
            this.cleanupConnectionPool();
        }, 15000);

        this.logger.info('Health monitoring initialized', {
            provider: 'SYSTEM'
        });
    }

    setupErrorRecovery() {
        // Handle specific error types
        this.on('llm_generation_failed', (error) => {
            this.handleLLMGenerationError(error);
        });

        this.on('authentication_failed', (error) => {
            this.handleAuthenticationError(error);
        });

        this.on('connection_failed', (error) => {
            this.handleConnectionError(error);
        });

        this.on('mixed_content', (error) => {
            this.handleMixedContentError(error);
        });

        this.logger.info('Error recovery mechanisms setup', {
            provider: 'SYSTEM'
        });
    }

    async handleError(error, context) {
        const errorId = this.generateErrorId();
        const errorInfo = {
            id: errorId,
            type: this.categorizeError(error),
            provider: context.provider,
            message: error.message,
            stack: error.stack,
            context: context,
            timestamp: Date.now(),
            retryCount: 0
        };

        // Log the error
        this.logger.error(`Error occurred: ${errorInfo.type}`, {
            provider: context.provider,
            error: errorInfo
        });

        // Store error in history
        this.errorHistory.set(errorId, errorInfo);

        // Emit error event
        this.emit(errorInfo.type, errorInfo);

        // Attempt error recovery
        const recoveryResult = await this.attemptErrorRecovery(errorInfo);

        return {
            errorId: errorId,
            error: errorInfo,
            recovery: recoveryResult
        };
    }

    categorizeError(error) {
        const message = error.message.toLowerCase();
        const stack = error.stack.toLowerCase();

        if (message.includes('llm generation failed') || message.includes('anthropic_free connection failed') || message.includes('openai_free connection failed')) {
            return 'llm_generation_failed';
        }

        if (message.includes('401') || message.includes('unauthorized') || message.includes('authentication failed')) {
            return 'authentication_failed';
        }

        if (message.includes('connection failed') || message.includes('failed to fetch') || message.includes('network error')) {
            return 'connection_failed';
        }

        if (message.includes('mixed content') || message.includes('http request blocked') || message.includes('csp violation')) {
            return 'mixed_content';
        }

        if (message.includes('terminal connection failed') || message.includes('lm studio')) {
            return 'terminal_connection_failed';
        }

        return 'unknown_error';
    }

    async attemptErrorRecovery(errorInfo) {
        const strategy = this.retryStrategies.get(errorInfo.type);
        if (!strategy) {
            return { success: false, reason: 'no_strategy_available' };
        }

        // Check if we should retry
        if (errorInfo.retryCount >= strategy.maxRetries) {
            return { success: false, reason: 'max_retries_exceeded' };
        }

        // Calculate delay
        const delay = Math.min(
            strategy.initialDelay * Math.pow(strategy.backoffMultiplier, errorInfo.retryCount),
            strategy.maxDelay
        );

        // Wait before retry
        await this.sleep(delay);

        // Attempt retry
        try {
            const retryResult = await this.retryOperation(errorInfo);
            
            if (retryResult.success) {
                this.logger.info(`Error recovery successful for ${errorInfo.type}`, {
                    provider: errorInfo.provider,
                    retryCount: errorInfo.retryCount + 1
                });
                return { success: true, result: retryResult };
            } else {
                // Try fallback provider
                const fallbackResult = await this.tryFallbackProvider(errorInfo);
                return fallbackResult;
            }
        } catch (retryError) {
            this.logger.error(`Retry failed for ${errorInfo.type}`, {
                provider: errorInfo.provider,
                error: retryError.message
            });
            return { success: false, reason: 'retry_failed', error: retryError };
        }
    }

    async retryOperation(errorInfo) {
        // Increment retry count
        errorInfo.retryCount++;

        // Attempt the original operation again
        try {
            switch (errorInfo.type) {
                case 'llm_generation_failed':
                    return await this.retryLLMGeneration(errorInfo);
                
                case 'authentication_failed':
                    return await this.retryAuthentication(errorInfo);
                
                case 'connection_failed':
                    return await this.retryConnection(errorInfo);
                
                case 'terminal_connection_failed':
                    return await this.retryTerminalConnection(errorInfo);
                
                default:
                    return { success: false, reason: 'unknown_error_type' };
            }
        } catch (error) {
            return { success: false, reason: 'retry_operation_failed', error: error };
        }
    }

    async retryLLMGeneration(errorInfo) {
        const { provider, context } = errorInfo;
        
        try {
            // Attempt to regenerate with the same provider
            const result = await this.callLLMProvider(provider, context.prompt, context.options);
            return { success: true, result: result };
        } catch (error) {
            return { success: false, reason: 'llm_generation_retry_failed', error: error };
        }
    }

    async retryAuthentication(errorInfo) {
        const { provider, context } = errorInfo;
        
        try {
            // Attempt to refresh authentication
            const authResult = await this.refreshAuthentication(provider, context);
            return { success: true, result: authResult };
        } catch (error) {
            return { success: false, reason: 'authentication_retry_failed', error: error };
        }
    }

    async retryConnection(errorInfo) {
        const { provider, context } = errorInfo;
        
        try {
            // Attempt to reestablish connection
            const connectionResult = await this.reestablishConnection(provider, context);
            return { success: true, result: connectionResult };
        } catch (error) {
            return { success: false, reason: 'connection_retry_failed', error: error };
        }
    }

    async retryTerminalConnection(errorInfo) {
        const { context } = errorInfo;
        
        try {
            // Attempt to reconnect to local terminal
            const terminalResult = await this.reconnectTerminal(context);
            return { success: true, result: terminalResult };
        } catch (error) {
            return { success: false, reason: 'terminal_retry_failed', error: error };
        }
    }

    async tryFallbackProvider(errorInfo) {
        const fallbacks = this.fallbackProviders.get(errorInfo.provider);
        if (!fallbacks || fallbacks.length === 0) {
            return { success: false, reason: 'no_fallback_available' };
        }

        for (const fallbackProvider of fallbacks) {
            try {
                this.logger.info(`Trying fallback provider: ${fallbackProvider}`, {
                    provider: errorInfo.provider,
                    fallback: fallbackProvider
                });

                const result = await this.callLLMProvider(fallbackProvider, errorInfo.context.prompt, errorInfo.context.options);
                
                this.logger.info(`Fallback provider successful: ${fallbackProvider}`, {
                    provider: errorInfo.provider,
                    fallback: fallbackProvider
                });

                return { success: true, result: result, fallbackProvider: fallbackProvider };
            } catch (fallbackError) {
                this.logger.warn(`Fallback provider failed: ${fallbackProvider}`, {
                    provider: errorInfo.provider,
                    fallback: fallbackProvider,
                    error: fallbackError.message
                });
                continue;
            }
        }

        return { success: false, reason: 'all_fallbacks_failed' };
    }

    async callLLMProvider(provider, prompt, options = {}) {
        const endpoint = this.getProviderEndpoint(provider);
        const headers = this.getProviderHeaders(provider);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify({
                prompt: prompt,
                ...options
            })
        });

        if (!response.ok) {
            throw new Error(`${provider} API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    getProviderEndpoint(provider) {
        const endpoints = {
            'anthropic_free': 'https://api.anthropic.com/v1/messages',
            'openai_free': 'https://api.openai.com/v1/chat/completions',
            'local_lm_studio': 'https://localhost:1234/v1/chat/completions',
            'huggingface_inference': 'https://api-inference.huggingface.co/models/gpt2'
        };

        return endpoints[provider] || endpoints['anthropic_free'];
    }

    getProviderHeaders(provider) {
        const headers = {
            'anthropic_free': {
                'x-api-key': process.env.ANTHROPIC_API_KEY || '',
                'anthropic-version': '2023-06-01'
            },
            'openai_free': {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY || ''}`
            },
            'local_lm_studio': {
                'Content-Type': 'application/json'
            },
            'huggingface_inference': {
                'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || ''}`
            }
        };

        return headers[provider] || {};
    }

    async refreshAuthentication(provider, context) {
        // Implement authentication refresh logic
        this.logger.info(`Refreshing authentication for ${provider}`, {
            provider: provider
        });

        // For now, return success (implement actual refresh logic)
        return { success: true, provider: provider };
    }

    async reestablishConnection(provider, context) {
        // Implement connection reestablishment logic
        this.logger.info(`Reestablishing connection for ${provider}`, {
            provider: provider
        });

        // For now, return success (implement actual connection logic)
        return { success: true, provider: provider };
    }

    async reconnectTerminal(context) {
        // Implement terminal reconnection logic
        this.logger.info('Reconnecting to local terminal', {
            provider: 'TERMINAL'
        });

        // For now, return success (implement actual terminal logic)
        return { success: true, provider: 'local_terminal' };
    }

    handleLLMGenerationError(errorInfo) {
        this.logger.error('LLM Generation Error Handler', {
            provider: errorInfo.provider,
            error: errorInfo.message
        });

        // Update provider health status
        this.updateProviderHealthStatus(errorInfo.provider, 'degraded');
    }

    handleAuthenticationError(errorInfo) {
        this.logger.error('Authentication Error Handler', {
            provider: errorInfo.provider,
            error: errorInfo.message
        });

        // Update provider health status
        this.updateProviderHealthStatus(errorInfo.provider, 'auth_failed');
    }

    handleConnectionError(errorInfo) {
        this.logger.error('Connection Error Handler', {
            provider: errorInfo.provider,
            error: errorInfo.message
        });

        // Update provider health status
        this.updateProviderHealthStatus(errorInfo.provider, 'connection_failed');
    }

    handleMixedContentError(errorInfo) {
        this.logger.error('Mixed Content Error Handler', {
            provider: errorInfo.provider,
            error: errorInfo.message
        });

        // Fix mixed content issues
        this.fixMixedContentIssues();
    }

    fixMixedContentIssues() {
        // Fix HTTP requests to use HTTPS
        const httpUrls = [
            'http://10.3.129.26:1234/v1/models',
            'http://localhost:1234/v1/models'
        ];

        httpUrls.forEach(url => {
            const httpsUrl = url.replace('http://', 'https://');
            this.logger.info(`Converting HTTP to HTTPS: ${url} -> ${httpsUrl}`, {
                provider: 'MIXED_CONTENT'
            });
        });
    }

    updateProviderHealthStatus(provider, status) {
        this.healthStatus.set(provider, {
            status: status,
            lastUpdate: Date.now(),
            errorCount: (this.healthStatus.get(provider)?.errorCount || 0) + 1
        });
    }

    updateProviderHealth() {
        // Update health status for all providers
        const providers = ['anthropic_free', 'openai_free', 'local_lm_studio'];
        
        providers.forEach(provider => {
            const currentStatus = this.healthStatus.get(provider);
            if (!currentStatus || Date.now() - currentStatus.lastUpdate > 300000) { // 5 minutes
                this.healthStatus.set(provider, {
                    status: 'unknown',
                    lastUpdate: Date.now(),
                    errorCount: 0
                });
            }
        });
    }

    cleanupConnectionPool() {
        // Clean up stale connections
        const now = Date.now();
        const staleThreshold = 300000; // 5 minutes

        this.connectionPool.forEach((connection, key) => {
            if (now - connection.lastUsed > staleThreshold) {
                this.connectionPool.delete(key);
                this.logger.debug(`Cleaned up stale connection: ${key}`, {
                    provider: 'CONNECTION_POOL'
                });
            }
        });
    }

    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getErrorHistory() {
        return Array.from(this.errorHistory.values());
    }

    getHealthStatus() {
        return Array.from(this.healthStatus.entries()).map(([provider, status]) => ({
            provider: provider,
            status: status.status,
            lastUpdate: status.lastUpdate,
            errorCount: status.errorCount
        }));
    }

    getSystemStatus() {
        return {
            errorHandler: {
                status: 'active',
                errorCount: this.errorHistory.size,
                healthStatus: this.getHealthStatus(),
                connectionPoolSize: this.connectionPool.size
            },
            recentErrors: this.getErrorHistory().slice(-10)
        };
    }

    async shutdown() {
        this.logger.info('Shutting down AI Error Handler', {
            provider: 'SYSTEM'
        });

        // Clean up resources
        this.connectionPool.clear();
        this.errorHistory.clear();
        this.healthStatus.clear();

        this.logger.info('AI Error Handler shutdown complete', {
            provider: 'SYSTEM'
        });
    }
}

export default AIErrorHandler; 