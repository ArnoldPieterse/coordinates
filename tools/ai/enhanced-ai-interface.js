// Enhanced AI Interface incorporating best practices from system prompts repository
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export class EnhancedAIInterface {
    constructor() {
        this.config = this.loadEnhancedConfig();
        this.contextHistory = [];
        this.userPreferences = {};
        this.performanceMetrics = {
            totalQueries: 0,
            successfulQueries: 0,
            averageResponseTime: 0,
            totalResponseTime: 0
        };
        this.currentMode = 'default';
    }

    loadEnhancedConfig() {
        const configPath = join(process.cwd(), 'tools', 'ai', 'enhanced-system-config.json');
        
        if (existsSync(configPath)) {
            try {
                return JSON.parse(readFileSync(configPath, 'utf8'));
            } catch (error) {
                console.warn('Failed to load enhanced config, using defaults');
            }
        }

        // Fallback to basic configuration
        return {
            systemPrompts: {
                default: {
                    role: "You are an advanced AI coding assistant with enhanced capabilities for game development, mathematical computation, and creative problem-solving."
                }
            },
            responseOptimization: {
                parameters: {
                    temperature: 0.7,
                    topP: 0.9,
                    maxTokens: 2048
                }
            }
        };
    }

    /**
     * Enhanced query method with context awareness and adaptive responses
     */
    async enhancedQuery(message, options = {}) {
        const startTime = Date.now();
        this.performanceMetrics.totalQueries++;

        try {
            // Determine optimal system prompt based on context
            const systemPrompt = this.selectOptimalSystemPrompt(message, options);
            
            // Build context-aware message
            const contextualizedMessage = this.buildContextualizedMessage(message);
            
            // Get optimized parameters
            const optimizedParams = this.getOptimizedParameters(options);
            
            // Generate response
            const response = await this.generateResponse(systemPrompt, contextualizedMessage, optimizedParams);
            
            // Update context history
            this.updateContextHistory(message, response);
            
            // Generate proactive suggestions
            const suggestions = this.generateProactiveSuggestions(message, response);
            
            // Update performance metrics
            const responseTime = Date.now() - startTime;
            this.updatePerformanceMetrics(responseTime, true);
            
            return {
                success: true,
                response: response,
                suggestions: suggestions,
                responseTime: responseTime,
                contextUsed: this.contextHistory.length,
                mode: this.currentMode
            };
            
        } catch (error) {
            this.updatePerformanceMetrics(0, false);
            return this.handleError(error, message);
        }
    }

    /**
     * Select optimal system prompt based on message content and context
     */
    selectOptimalSystemPrompt(message, options) {
        const mode = options.mode || this.detectMode(message);
        this.currentMode = mode;
        
        const prompts = this.config.systemPrompts;
        
        switch (mode) {
            case 'gameDevelopment':
                return prompts.gameDevelopment?.role || prompts.default.role;
            case 'mathematicalComputation':
                return prompts.mathematicalComputation?.role || prompts.default.role;
            case 'codeOptimization':
                return prompts.codeOptimization?.role || prompts.default.role;
            case 'debugging':
                return this.config.specializedScenarios?.debugging?.systemPrompt || prompts.default.role;
            case 'architecture':
                return this.config.specializedScenarios?.architecture?.systemPrompt || prompts.default.role;
            case 'documentation':
                return this.config.specializedScenarios?.documentation?.systemPrompt || prompts.default.role;
            case 'testing':
                return this.config.specializedScenarios?.testing?.systemPrompt || prompts.default.role;
            default:
                return prompts.default.role;
        }
    }

    /**
     * Detect the mode/context of the user's message
     */
    detectMode(message) {
        const lowerMessage = message.toLowerCase();
        
        // Game development indicators
        if (lowerMessage.includes('game') || lowerMessage.includes('three.js') || 
            lowerMessage.includes('webgl') || lowerMessage.includes('physics') ||
            lowerMessage.includes('render') || lowerMessage.includes('scene')) {
            return 'gameDevelopment';
        }
        
        // Mathematical computation indicators
        if (lowerMessage.includes('calculate') || lowerMessage.includes('math') ||
            lowerMessage.includes('algorithm') || lowerMessage.includes('optimize') ||
            lowerMessage.includes('formula') || lowerMessage.includes('equation')) {
            return 'mathematicalComputation';
        }
        
        // Code optimization indicators
        if (lowerMessage.includes('performance') || lowerMessage.includes('optimize') ||
            lowerMessage.includes('refactor') || lowerMessage.includes('bottleneck') ||
            lowerMessage.includes('efficiency') || lowerMessage.includes('speed')) {
            return 'codeOptimization';
        }
        
        // Debugging indicators
        if (lowerMessage.includes('error') || lowerMessage.includes('bug') ||
            lowerMessage.includes('debug') || lowerMessage.includes('fix') ||
            lowerMessage.includes('issue') || lowerMessage.includes('problem')) {
            return 'debugging';
        }
        
        // Architecture indicators
        if (lowerMessage.includes('architecture') || lowerMessage.includes('design') ||
            lowerMessage.includes('structure') || lowerMessage.includes('system') ||
            lowerMessage.includes('pattern') || lowerMessage.includes('framework')) {
            return 'architecture';
        }
        
        // Documentation indicators
        if (lowerMessage.includes('document') || lowerMessage.includes('readme') ||
            lowerMessage.includes('comment') || lowerMessage.includes('explain') ||
            lowerMessage.includes('guide') || lowerMessage.includes('tutorial')) {
            return 'documentation';
        }
        
        // Testing indicators
        if (lowerMessage.includes('test') || lowerMessage.includes('unit') ||
            lowerMessage.includes('integration') || lowerMessage.includes('qa') ||
            lowerMessage.includes('verify') || lowerMessage.includes('validate')) {
            return 'testing';
        }
        
        return 'default';
    }

    /**
     * Build contextualized message using conversation history
     */
    buildContextualizedMessage(message) {
        if (this.contextHistory.length === 0) {
            return message;
        }
        
        // Include relevant context from recent history
        const relevantContext = this.contextHistory
            .slice(-3) // Last 3 exchanges
            .map(exchange => `${exchange.role}: ${exchange.content}`)
            .join('\n');
        
        return `Previous context:\n${relevantContext}\n\nCurrent request: ${message}`;
    }

    /**
     * Get optimized parameters based on mode and context
     */
    getOptimizedParameters(options) {
        const baseParams = this.config.responseOptimization.parameters;
        const mode = this.currentMode;
        
        // Get mode-specific parameters if available
        const modeParams = this.config.specializedScenarios?.[mode] || {};
        
        return {
            ...baseParams,
            ...modeParams,
            ...options,
            // Adaptive temperature based on context
            temperature: this.calculateAdaptiveTemperature(mode, options),
            // Adaptive max tokens based on complexity
            maxTokens: this.calculateAdaptiveMaxTokens(message, mode)
        };
    }

    /**
     * Calculate adaptive temperature based on mode and context
     */
    calculateAdaptiveTemperature(mode, options) {
        const baseTemp = options.temperature || 0.7;
        
        // Lower temperature for precise tasks
        if (mode === 'debugging' || mode === 'testing') {
            return Math.min(baseTemp, 0.3);
        }
        
        // Higher temperature for creative tasks
        if (mode === 'gameDevelopment' || mode === 'documentation') {
            return Math.max(baseTemp, 0.8);
        }
        
        return baseTemp;
    }

    /**
     * Calculate adaptive max tokens based on message complexity
     */
    calculateAdaptiveMaxTokens(message, mode) {
        const baseTokens = 2048;
        const complexity = this.assessComplexity(message);
        
        if (complexity === 'high') {
            return Math.min(baseTokens * 1.5, 3000);
        } else if (complexity === 'low') {
            return Math.max(baseTokens * 0.5, 1000);
        }
        
        return baseTokens;
    }

    /**
     * Assess message complexity
     */
    assessComplexity(message) {
        const wordCount = message.split(' ').length;
        const hasCode = message.includes('```') || message.includes('function') || message.includes('class');
        const hasTechnicalTerms = /(algorithm|optimization|architecture|framework|integration)/i.test(message);
        
        if (wordCount > 50 || hasCode || hasTechnicalTerms) {
            return 'high';
        } else if (wordCount < 10) {
            return 'low';
        }
        
        return 'medium';
    }

    /**
     * Generate response using the AI model
     */
    async generateResponse(systemPrompt, message, params) {
        // This would integrate with your actual AI model
        // For now, return a structured response
        return {
            content: `Enhanced response for: ${message.substring(0, 100)}...`,
            systemPrompt: systemPrompt,
            parameters: params
        };
    }

    /**
     * Generate proactive suggestions based on context
     */
    generateProactiveSuggestions(message, response) {
        const suggestions = [];
        const lowerMessage = message.toLowerCase();
        
        // Performance suggestions
        if (lowerMessage.includes('performance') || lowerMessage.includes('slow')) {
            suggestions.push({
                type: 'performance',
                title: 'Performance Optimization',
                content: 'Consider profiling your code to identify bottlenecks and implementing caching strategies.',
                priority: 'high'
            });
        }
        
        // Security suggestions
        if (lowerMessage.includes('user input') || lowerMessage.includes('data')) {
            suggestions.push({
                type: 'security',
                title: 'Security Best Practices',
                content: 'Remember to validate and sanitize all user inputs to prevent security vulnerabilities.',
                priority: 'medium'
            });
        }
        
        // Testing suggestions
        if (lowerMessage.includes('function') || lowerMessage.includes('feature')) {
            suggestions.push({
                type: 'testing',
                title: 'Testing Recommendations',
                content: 'Consider writing unit tests for your new functionality to ensure reliability.',
                priority: 'medium'
            });
        }
        
        return suggestions;
    }

    /**
     * Update context history
     */
    updateContextHistory(message, response) {
        this.contextHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });
        
        this.contextHistory.push({
            role: 'assistant',
            content: response.content,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 10 exchanges to manage memory
        if (this.contextHistory.length > 20) {
            this.contextHistory = this.contextHistory.slice(-20);
        }
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(responseTime, success) {
        if (success) {
            this.performanceMetrics.successfulQueries++;
            this.performanceMetrics.totalResponseTime += responseTime;
            this.performanceMetrics.averageResponseTime = 
                this.performanceMetrics.totalResponseTime / this.performanceMetrics.successfulQueries;
        }
    }

    /**
     * Handle errors gracefully
     */
    handleError(error, originalMessage) {
        console.error('Enhanced AI Interface Error:', error);
        
        return {
            success: false,
            error: error.message,
            fallbackResponse: this.generateFallbackResponse(originalMessage),
            suggestions: [
                {
                    type: 'error_recovery',
                    title: 'Error Recovery',
                    content: 'Try rephrasing your question or breaking it into smaller parts.',
                    priority: 'high'
                }
            ]
        };
    }

    /**
     * Generate fallback response when AI fails
     */
    generateFallbackResponse(message) {
        return `I encountered an issue processing your request: "${message}". Please try rephrasing your question or contact support if the problem persists.`;
    }

    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        return {
            ...this.performanceMetrics,
            successRate: this.performanceMetrics.totalQueries > 0 ? 
                (this.performanceMetrics.successfulQueries / this.performanceMetrics.totalQueries * 100).toFixed(2) + '%' : '0%',
            averageResponseTime: Math.round(this.performanceMetrics.averageResponseTime) + 'ms'
        };
    }

    /**
     * Clear context history
     */
    clearContext() {
        this.contextHistory = [];
        return { success: true, message: 'Context history cleared' };
    }

    /**
     * Set user preferences
     */
    setUserPreferences(preferences) {
        this.userPreferences = { ...this.userPreferences, ...preferences };
        return { success: true, message: 'User preferences updated' };
    }
}

// Export for use in other modules
export default EnhancedAIInterface; 