/**
 * Claude Code Integration
 * AI-powered coding assistant for game development
 * Based on musistudio/claude-code-router
 */

import { EventEmitter } from 'events';

class ClaudeCodeIntegration extends EventEmitter {
    constructor(config = {}) {
        super();
        this.config = {
            port: config.port || 3456,
            host: config.host || '127.0.0.1',
            apiKey: config.apiKey || null,
            providers: config.providers || this.getDefaultProviders(),
            router: config.router || this.getDefaultRouter(),
            ...config
        };
        
        this.providers = new Map();
        this.router = new Map();
        this.gameContext = this.createGameContext();
        this.isInitialized = false;
        
        this.initialize();
    }

    /**
     * Initialize the Claude Code integration
     */
    async initialize() {
        try {
            console.log('🤖 Claude Code Integration: Initializing...');
            
            // Set up providers
            await this.setupProviders();
            
            // Set up routing
            await this.setupRouting();
            
            // Set up game-specific context
            this.setupGameContext();
            
            this.isInitialized = true;
            console.log('🤖 Claude Code Integration: Initialized successfully');
            this.emit('initialized');
            
        } catch (error) {
            console.error('❌ Claude Code Integration: Initialization failed:', error);
            this.emit('error', error);
        }
    }

    /**
     * Get default providers configuration
     */
    getDefaultProviders() {
        return [
            {
                name: 'claude-sonnet',
                api_base_url: 'https://api.anthropic.com/v1/messages',
                api_key: process.env.ANTHROPIC_API_KEY,
                models: ['claude-3-5-sonnet-20241022'],
                transformer: {
                    use: ['anthropic']
                }
            },
            {
                name: 'openrouter',
                api_base_url: 'https://openrouter.ai/api/v1/chat/completions',
                api_key: process.env.OPENROUTER_API_KEY,
                models: [
                    'anthropic/claude-3-5-sonnet',
                    'google/gemini-2.0-flash-exp',
                    'meta-llama/llama-3.1-70b-instruct'
                ],
                transformer: {
                    use: ['openrouter']
                }
            },
            {
                name: 'local-ollama',
                api_base_url: 'http://localhost:11434/v1/chat/completions',
                api_key: 'ollama',
                models: ['codellama:latest', 'qwen2.5-coder:latest'],
                transformer: {
                    use: ['ollama']
                }
            }
        ];
    }

    /**
     * Get default router configuration
     */
    getDefaultRouter() {
        return {
            default: 'claude-sonnet',
            routes: {
                'game-development': 'claude-sonnet',
                'code-generation': 'local-ollama',
                'research': 'openrouter',
                'debugging': 'claude-sonnet',
                'optimization': 'local-ollama'
            }
        };
    }

    /**
     * Set up providers
     */
    async setupProviders() {
        for (const providerConfig of this.config.providers) {
            const provider = new ClaudeProvider(providerConfig);
            this.providers.set(providerConfig.name, provider);
        }
    }

    /**
     * Set up routing
     */
    async setupRouting() {
        for (const [route, provider] of Object.entries(this.config.router.routes)) {
            this.router.set(route, provider);
        }
    }

    /**
     * Create game-specific context
     */
    createGameContext() {
        return {
            game: {
                name: 'Coordinates',
                type: 'multiplayer-planetary-shooter',
                technology: {
                    engine: 'Three.js',
                    language: 'JavaScript',
                    framework: 'React',
                    networking: 'Socket.IO',
                    physics: 'Custom Physics Engine'
                },
                features: {
                    multiplayer: true,
                    planets: 4,
                    weapons: ['rifle', 'shotgun', 'sniper'],
                    vehicles: ['rockets'],
                    ai: 'mathematical-ai-system',
                    finance: 'integrated-financial-system'
                },
                codebase: {
                    structure: 'modular',
                    patterns: ['component-based', 'event-driven', 'real-time'],
                    testing: 'jest',
                    documentation: 'comprehensive'
                }
            },
            development: {
                patterns: ['clean-code', 'performance-optimization', 'real-time-sync'],
                bestPractices: ['error-handling', 'logging', 'monitoring'],
                tools: ['eslint', 'prettier', 'jest', 'webpack']
            }
        };
    }

    /**
     * Set up game context
     */
    setupGameContext() {
        // Add game-specific prompts and examples
        this.gamePrompts = {
            'game-mechanics': 'How can I implement a new game mechanic for the planetary shooter?',
            'performance': 'How can I optimize the performance of the Three.js rendering?',
            'multiplayer': 'How can I improve the real-time multiplayer synchronization?',
            'ai-integration': 'How can I enhance the AI system with new features?',
            'financial-system': 'How can I improve the financial system integration?',
            'ui-ux': 'How can I enhance the user interface and experience?'
        };
    }

    /**
     * Route request to appropriate provider
     */
    async routeRequest(request) {
        const { type, prompt, context, options = {} } = request;
        
        // Determine the best provider for this request
        const providerName = this.selectProvider(type, context);
        const provider = this.providers.get(providerName);
        
        if (!provider) {
            throw new Error(`Provider not found: ${providerName}`);
        }

        // Enhance prompt with game context
        const enhancedPrompt = this.enhancePrompt(prompt, type, context);
        
        // Process the request
        return await provider.process({
            prompt: enhancedPrompt,
            context: this.gameContext,
            options: {
                ...options,
                gameContext: true
            }
        });
    }

    /**
     * Select the best provider for a request type
     */
    selectProvider(type, context) {
        // Check if there's a specific route for this type
        if (this.router.has(type)) {
            return this.router.get(type);
        }

        // Check if there's a route for the context
        if (context && this.router.has(context)) {
            return this.router.get(context);
        }

        // Use default provider
        return this.config.router.default;
    }

    /**
     * Enhance prompt with game context
     */
    enhancePrompt(prompt, type, context) {
        let enhancedPrompt = prompt;

        // Add game context if not already present
        if (!prompt.includes('Coordinates') && !prompt.includes('game')) {
            enhancedPrompt = `Context: You are helping develop the Coordinates multiplayer planetary shooter game. ${prompt}`;
        }

        // Add type-specific context
        switch (type) {
            case 'game-development':
                enhancedPrompt = `${enhancedPrompt}\n\nFocus on game mechanics, player experience, and Three.js optimization.`;
                break;
            case 'code-generation':
                enhancedPrompt = `${enhancedPrompt}\n\nGenerate clean, performant JavaScript code following the project's patterns.`;
                break;
            case 'research':
                enhancedPrompt = `${enhancedPrompt}\n\nResearch best practices for multiplayer gaming and real-time systems.`;
                break;
            case 'debugging':
                enhancedPrompt = `${enhancedPrompt}\n\nProvide debugging strategies for Three.js, Socket.IO, and real-time systems.`;
                break;
            case 'optimization':
                enhancedPrompt = `${enhancedPrompt}\n\nFocus on performance optimization for real-time multiplayer gaming.`;
                break;
        }

        return enhancedPrompt;
    }

    /**
     * Assist with game development
     */
    async assistWithGameDevelopment(prompt, context = 'game-development') {
        return await this.routeRequest({
            type: 'game-development',
            prompt,
            context,
            options: {
                maxTokens: 2000,
                temperature: 0.7
            }
        });
    }

    /**
     * Generate game code
     */
    async generateGameCode(requirements, language = 'javascript') {
        const prompt = `Generate ${language} code for the following game requirements:\n\n${requirements}\n\nProvide clean, well-documented code that follows the project's patterns.`;
        
        return await this.routeRequest({
            type: 'code-generation',
            prompt,
            context: 'code-generation',
            options: {
                maxTokens: 3000,
                temperature: 0.3
            }
        });
    }

    /**
     * Research game topic
     */
    async researchGameTopic(topic) {
        const prompt = `Research the following topic in the context of game development:\n\n${topic}\n\nProvide comprehensive analysis and recommendations.`;
        
        return await this.routeRequest({
            type: 'research',
            prompt,
            context: 'research',
            options: {
                maxTokens: 2500,
                temperature: 0.5
            }
        });
    }

    /**
     * Debug game issue
     */
    async debugGameIssue(issue, code = '') {
        const prompt = `Debug the following issue in the game:\n\nIssue: ${issue}\n\nCode: ${code}\n\nProvide debugging steps and solutions.`;
        
        return await this.routeRequest({
            type: 'debugging',
            prompt,
            context: 'debugging',
            options: {
                maxTokens: 2000,
                temperature: 0.2
            }
        });
    }

    /**
     * Optimize game performance
     */
    async optimizeGamePerformance(area, currentCode = '') {
        const prompt = `Optimize the following area of the game for better performance:\n\nArea: ${area}\n\nCurrent Code: ${currentCode}\n\nProvide optimization strategies and improved code.`;
        
        return await this.routeRequest({
            type: 'optimization',
            prompt,
            context: 'optimization',
            options: {
                maxTokens: 2500,
                temperature: 0.4
            }
        });
    }

    /**
     * Get AI suggestion for player action
     */
    async suggestPlayerAction(player, action, gameState) {
        const prompt = `Player ${player.name} is performing action: ${action}\n\nGame State: ${JSON.stringify(gameState, null, 2)}\n\nSuggest how to enhance this player's experience or improve the game mechanics.`;
        
        return await this.routeRequest({
            type: 'game-development',
            prompt,
            context: 'player-experience',
            options: {
                maxTokens: 1500,
                temperature: 0.6
            }
        });
    }

    /**
     * Generate educational content
     */
    async generateEducationalContent(topic, difficulty = 'intermediate') {
        const prompt = `Generate educational content about ${topic} for ${difficulty} level learners. Make it engaging and suitable for gamification.`;
        
        return await this.routeRequest({
            type: 'research',
            prompt,
            context: 'educational-content',
            options: {
                maxTokens: 2000,
                temperature: 0.7
            }
        });
    }

    /**
     * Get provider status
     */
    async getProviderStatus() {
        const status = {};
        
        for (const [name, provider] of this.providers) {
            status[name] = await provider.getStatus();
        }
        
        return status;
    }

    /**
     * Switch model dynamically
     */
    async switchModel(route, newProvider) {
        if (this.providers.has(newProvider)) {
            this.router.set(route, newProvider);
            this.emit('model-switched', { route, provider: newProvider });
            return true;
        }
        return false;
    }

    /**
     * Get available models
     */
    getAvailableModels() {
        const models = {};
        
        for (const [name, provider] of this.providers) {
            models[name] = provider.getModels();
        }
        
        return models;
    }

    /**
     * Cleanup resources
     */
    destroy() {
        for (const provider of this.providers.values()) {
            provider.destroy();
        }
        
        this.removeAllListeners();
        console.log('🤖 Claude Code Integration: Shutdown complete');
    }
}

/**
 * Claude Provider Class
 */
class ClaudeProvider {
    constructor(config) {
        this.config = config;
        this.name = config.name;
        this.apiBaseUrl = config.api_base_url;
        this.apiKey = config.api_key;
        this.models = config.models || [];
        this.transformer = config.transformer || {};
        this.isAvailable = false;
        
        this.checkAvailability();
    }

    /**
     * Check provider availability
     */
    async checkAvailability() {
        try {
            // Simple health check
            const response = await fetch(`${this.apiBaseUrl}/health`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            this.isAvailable = response.ok;
        } catch (error) {
            this.isAvailable = false;
            console.warn(`Provider ${this.name} is not available:`, error.message);
        }
    }

    /**
     * Get headers for API requests
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        return headers;
    }

    /**
     * Process a request
     */
    async process(request) {
        if (!this.isAvailable) {
            throw new Error(`Provider ${this.name} is not available`);
        }

        const { prompt, context, options = {} } = request;
        
        // Transform request based on provider type
        const transformedRequest = this.transformRequest(prompt, context, options);
        
        // Send request to provider
        const response = await this.sendRequest(transformedRequest);
        
        // Transform response
        return this.transformResponse(response);
    }

    /**
     * Transform request for specific provider
     */
    transformRequest(prompt, context, options) {
        const baseRequest = {
            prompt,
            context,
            options
        };

        // Apply provider-specific transformations
        if (this.transformer.use && this.transformer.use.includes('anthropic')) {
            return this.transformForAnthropic(baseRequest);
        } else if (this.transformer.use && this.transformer.use.includes('openrouter')) {
            return this.transformForOpenRouter(baseRequest);
        } else if (this.transformer.use && this.transformer.use.includes('ollama')) {
            return this.transformForOllama(baseRequest);
        }

        return baseRequest;
    }

    /**
     * Transform request for Anthropic
     */
    transformForAnthropic(request) {
        return {
            model: this.models[0] || 'claude-3-5-sonnet-20241022',
            max_tokens: request.options.maxTokens || 2000,
            temperature: request.options.temperature || 0.7,
            messages: [
                {
                    role: 'user',
                    content: request.prompt
                }
            ]
        };
    }

    /**
     * Transform request for OpenRouter
     */
    transformForOpenRouter(request) {
        return {
            model: this.models[0] || 'anthropic/claude-3-5-sonnet',
            max_tokens: request.options.maxTokens || 2000,
            temperature: request.options.temperature || 0.7,
            messages: [
                {
                    role: 'user',
                    content: request.prompt
                }
            ]
        };
    }

    /**
     * Transform request for Ollama
     */
    transformForOllama(request) {
        return {
            model: this.models[0] || 'codellama:latest',
            stream: false,
            options: {
                temperature: request.options.temperature || 0.7,
                num_predict: request.options.maxTokens || 2000
            },
            messages: [
                {
                    role: 'user',
                    content: request.prompt
                }
            ]
        };
    }

    /**
     * Send request to provider
     */
    async sendRequest(transformedRequest) {
        const response = await fetch(this.apiBaseUrl, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(transformedRequest)
        });

        if (!response.ok) {
            throw new Error(`Provider ${this.name} request failed: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Transform response from provider
     */
    transformResponse(response) {
        // Extract content from different provider formats
        let content = '';
        
        if (response.content) {
            content = response.content[0]?.text || response.content;
        } else if (response.choices) {
            content = response.choices[0]?.message?.content || '';
        } else if (response.message) {
            content = response.message.content || '';
        }

        return {
            content,
            provider: this.name,
            model: response.model || this.models[0],
            usage: response.usage || null,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get provider status
     */
    async getStatus() {
        return {
            name: this.name,
            available: this.isAvailable,
            models: this.models,
            apiBaseUrl: this.apiBaseUrl
        };
    }

    /**
     * Get available models
     */
    getModels() {
        return this.models;
    }

    /**
     * Destroy provider
     */
    destroy() {
        this.isAvailable = false;
    }
}

export default ClaudeCodeIntegration; 