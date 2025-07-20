/**
 * Coordinates - LLM Integration System
 * Provides unified interface for multiple LLM services
 * IDX-LLM-001: LLM Service Integration
 * IDX-LLM-002: Multi-Provider Support
 * IDX-LLM-003: Agent Enhancement System
 * 
 * For index reference format, see INDEX_DESCRIBER.md
 */

// Import LM Studio SDK with proper CommonJS interop
let LMStudioClient = null;
// Using browser's built-in fetch API instead of node-fetch

// ===== LLM PROVIDER CONFIGURATIONS =====
// IDX-LLM-004: Provider Configuration Management
export const LLM_PROVIDERS = {
    LM_STUDIO: 'lm_studio',
    OLLAMA: 'ollama',
    OPENAI_FREE: 'openai_free',
    ANTHROPIC_FREE: 'anthropic_free',
    HUGGINGFACE_FREE: 'huggingface_free',
    LOCAL_LLAMA: 'local_llama',
    LOCAL_MISTRAL: 'local_mistral'
};

// ===== LLM SERVICE CONFIGURATIONS =====
const LLM_CONFIGS = {
    [LLM_PROVIDERS.LM_STUDIO]: {
        baseUrl: 'http://localhost:1234/v1',
        apiKey: 'not-needed',
        models: ['meta-llama-3-70b-instruct-smashed', 'text-embedding-nomic-embed-text-v1.5@q4_k_m'],
        maxTokens: 4096,
        temperature: 0.7
    },
    [LLM_PROVIDERS.OLLAMA]: {
        baseUrl: 'http://localhost:11434',
        apiKey: 'not-needed',
        models: ['llama2', 'mistral', 'codellama', 'llama2:13b', 'mistral:7b'],
        maxTokens: 4096,
        temperature: 0.7
    },
    [LLM_PROVIDERS.OPENAI_FREE]: {
        baseUrl: 'https://api.openai.com/v1',
        apiKey: '', // API keys should be configured via UI or secure storage
        models: ['gpt-3.5-turbo', 'gpt-4'],
        maxTokens: 2048,
        temperature: 0.7
    },
    [LLM_PROVIDERS.ANTHROPIC_FREE]: {
        baseUrl: 'https://api.anthropic.com/v1',
        apiKey: '', // API keys should be configured via UI or secure storage
        models: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229'],
        maxTokens: 4096,
        temperature: 0.7
    },
    [LLM_PROVIDERS.HUGGINGFACE_FREE]: {
        baseUrl: 'https://api-inference.huggingface.co',
        apiKey: '', // API keys should be configured via UI or secure storage
        models: ['microsoft/DialoGPT-medium', 'gpt2', 'distilgpt2'],
        maxTokens: 1024,
        temperature: 0.7
    }
};

// ===== LLM SERVICE CLASS =====
// IDX-LLM-005: Unified LLM Service Implementation
class LLMService {
    constructor(provider = LLM_PROVIDERS.LM_STUDIO) {
        this.provider = provider;
        this.config = LLM_CONFIGS[provider];
        this.client = null;
        this.isConnected = false;
        this.lastUsed = null;
        this.usageStats = {
            requests: 0,
            tokens: 0,
            errors: 0,
            averageResponseTime: 0
        };
        
        this.initializeClient();
    }

    async initializeClient() {
        try {
            switch (this.provider) {
                case LLM_PROVIDERS.LM_STUDIO:
                    // Use direct HTTP calls instead of SDK
                    this.client = { type: 'http', baseUrl: this.config.baseUrl };
                    break;
                case LLM_PROVIDERS.OLLAMA:
                    this.client = { type: 'http', baseUrl: this.config.baseUrl };
                    break;
                default:
                    this.client = null;
                    break;
            }
            await this.testConnection();
        } catch (error) {
            console.error(`Failed to initialize ${this.provider} client:`, error);
            this.isConnected = false;
        }
    }

    async testConnection() {
        console.log('[LLM] LM Studio testConnection');
        try {
            const startTime = Date.now();
            console.log(`[LLM] Testing connection for provider: ${this.provider}`);
            const response = await this.generateResponse('Hello', { maxTokens: 10 });
            const responseTime = Date.now() - startTime;
            this.isConnected = true;
            this.usageStats.averageResponseTime = responseTime;
            console.log(`✅ ${this.provider} connected successfully (${responseTime}ms)`);
            return true;
        } catch (error) {
            console.error(`❌ ${this.provider} connection failed:`, error.message, error.stack);
            this.isConnected = false;
            return false;
        }
    }

    async generateResponse(prompt, options = {}) {
        console.log(`[LLM] LM Studio generateResponse: prompt='${prompt}', model='${options.model}'`);
        // Remove the isConnected check that's blocking LM Studio connections
        const startTime = Date.now();
        const requestOptions = {
            maxTokens: options.maxTokens || this.config.maxTokens,
            temperature: options.temperature || this.config.temperature,
            model: options.model || this.config.models[0]
        };
        try {
            let response;
            console.log(`[LLM] generateResponse for provider: ${this.provider}, model: ${requestOptions.model}`);
            switch (this.provider) {
                case LLM_PROVIDERS.LM_STUDIO:
                    response = await this.callLMStudioAPI(prompt, requestOptions);
                    break;
                case LLM_PROVIDERS.OLLAMA:
                    response = await this.callOllamaAPI(prompt, requestOptions);
                    break;
                case LLM_PROVIDERS.OPENAI_FREE:
                    response = await this.callOpenAIAPI(prompt, requestOptions);
                    break;
                case LLM_PROVIDERS.ANTHROPIC_FREE:
                    response = await this.callAnthropicAPI(prompt, requestOptions);
                    break;
                case LLM_PROVIDERS.HUGGINGFACE_FREE:
                    response = await this.callHuggingFaceAPI(prompt, requestOptions);
                    break;
                default:
                    throw new Error(`Unsupported provider: ${this.provider}`);
            }
            const responseTime = Date.now() - startTime;
            this.updateUsageStats(response, responseTime);
            // Mark as connected if we get a successful response
            this.isConnected = true;
            return {
                text: this.extractResponseText(response),
                provider: this.provider,
                model: requestOptions.model,
                responseTime,
                usage: this.extractUsageInfo(response)
            };
        } catch (error) {
            this.usageStats.errors++;
            console.error(`[LLM] generateResponse error for provider: ${this.provider}:`, error.message, error.stack);
            throw new Error(`LLM generation failed: ${error.message}`);
        }
    }

    async callLMStudioAPI(prompt, options) {
        try {
            console.log(`[LLM] callLMStudioAPI: POST ${this.config.baseUrl}/chat/completions with model ${options.model}`);
            const controller = new AbortController();
            const timeout = setTimeout(() => {
                console.log(`[LLM] callLMStudioAPI error: Request timed out`);
                controller.abort();
            }, 30000); // Increase timeout to 30s
            
            const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: options.model,
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: options.maxTokens,
                    temperature: options.temperature
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeout); // Clear timeout if response received
            
            console.log(`[LLM] callLMStudioAPI: HTTP status ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                console.error(`[LLM] LM Studio HTTP error: ${response.status}`);
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`[LLM] callLMStudioAPI: response data`, JSON.stringify(data));
            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error(`[LLM] callLMStudioAPI error: Request timed out`);
                throw new Error('Request timed out');
            }
            console.error(`[LLM] callLMStudioAPI error:`, error.message);
            throw error;
        }
    }

    async callOllamaAPI(prompt, options) {
        const response = await fetch(`${this.config.baseUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: options.model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: options.temperature,
                    num_predict: options.maxTokens
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        return await response.json();
    }

    async callOpenAIAPI(prompt, options) {
        const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
                model: options.model,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: options.maxTokens,
                temperature: options.temperature
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        return await response.json();
    }

    async callAnthropicAPI(prompt, options) {
        const response = await fetch(`${this.config.baseUrl}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: options.model,
                max_tokens: options.maxTokens,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.statusText}`);
        }

        return await response.json();
    }

    async callHuggingFaceAPI(prompt, options) {
        const response = await fetch(`${this.config.baseUrl}/models/${options.model}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: options.maxTokens,
                    temperature: options.temperature
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HuggingFace API error: ${response.statusText}`);
        }

        return await response.json();
    }

    extractResponseText(response) {
        switch (this.provider) {
            case LLM_PROVIDERS.LM_STUDIO:
            case LLM_PROVIDERS.OPENAI_FREE:
                return response.choices?.[0]?.message?.content || '';
                
            case LLM_PROVIDERS.OLLAMA:
                return response.response || '';
                
            case LLM_PROVIDERS.ANTHROPIC_FREE:
                return response.content?.[0]?.text || '';
                
            case LLM_PROVIDERS.HUGGINGFACE_FREE:
                return response[0]?.generated_text || '';
                
            default:
                return JSON.stringify(response);
        }
    }

    extractUsageInfo(response) {
        switch (this.provider) {
            case LLM_PROVIDERS.LM_STUDIO:
            case LLM_PROVIDERS.OPENAI_FREE:
                return response.usage || {};
                
            case LLM_PROVIDERS.OLLAMA:
                return {
                    prompt_tokens: response.prompt_eval_count || 0,
                    completion_tokens: response.eval_count || 0,
                    total_tokens: (response.prompt_eval_count || 0) + (response.eval_count || 0)
                };
                
            default:
                return {};
        }
    }

    updateUsageStats(response, responseTime) {
        this.usageStats.requests++;
        this.usageStats.responseTime = responseTime;
        
        const usage = this.extractUsageInfo(response);
        if (usage.total_tokens) {
            this.usageStats.tokens += usage.total_tokens;
        }
        
        // Update average response time
        this.usageStats.averageResponseTime = 
            (this.usageStats.averageResponseTime + responseTime) / 2;
    }

    getStatus() {
        return {
            provider: this.provider,
            isConnected: this.isConnected,
            lastUsed: this.lastUsed,
            usageStats: { ...this.usageStats }
        };
    }

    async switchProvider(newProvider) {
        if (newProvider === this.provider) {
            return true;
        }
        
        this.provider = newProvider;
        this.config = LLM_CONFIGS[newProvider];
        this.isConnected = false;
        
        return await this.initializeClient();
    }
}

// ===== LLM MANAGER =====
// IDX-LLM-006: Multi-Provider LLM Management
export class LLMManager {
    constructor() {
        this.services = new Map();
        this.activeProvider = LLM_PROVIDERS.LM_STUDIO;
        this.fallbackProviders = [
            LLM_PROVIDERS.OLLAMA,
            LLM_PROVIDERS.OPENAI_FREE,
            LLM_PROVIDERS.ANTHROPIC_FREE
        ];
    }

    async initializeServices() {
        console.log('🚀 Initializing LLM services...');
        // Initialize primary service
        const primaryService = new LLMService(this.activeProvider);
        this.services.set(this.activeProvider, primaryService);
        // Initialize fallback services
        for (const provider of this.fallbackProviders) {
            try {
                const service = new LLMService(provider);
                this.services.set(provider, service);
            } catch (err) {
                console.warn(`⚠️ Failed to initialize provider ${provider}:`, err.message);
            }
        }
        // Test all services
        const results = await Promise.allSettled(
            Array.from(this.services.values()).map(service => service.testConnection())
        );
        const connectedServices = results.filter(result => result.status === 'fulfilled' && result.value);
        console.log(`✅ ${connectedServices.length}/${this.services.size} LLM services connected`);
        return connectedServices.length > 0;
    }

    async generateResponse(prompt, options = {}) {
        // Try active provider first
        const activeService = this.services.get(this.activeProvider);
        if (activeService && activeService.isConnected) {
            try {
                return await activeService.generateResponse(prompt, options);
            } catch (error) {
                console.warn(`Active provider failed, trying fallbacks: ${error.message}`);
            }
        }
        
        // Try fallback providers
        for (const provider of this.fallbackProviders) {
            const service = this.services.get(provider);
            if (service && service.isConnected) {
                try {
                    const result = await service.generateResponse(prompt, options);
                    console.log(`✅ Using fallback provider: ${provider}`);
                    return result;
                } catch (error) {
                    console.warn(`Fallback provider ${provider} failed: ${error.message}`);
                }
            }
        }
        
        throw new Error('All LLM providers are unavailable');
    }

    async switchActiveProvider(provider) {
        if (!this.services.has(provider)) {
            const service = new LLMService(provider);
            this.services.set(provider, service);
        }
        
        const service = this.services.get(provider);
        if (await service.testConnection()) {
            this.activeProvider = provider;
            return true;
        }
        
        return false;
    }

    getServiceStatus() {
        const status = {};
        for (const [provider, service] of this.services) {
            status[provider] = service.getStatus();
        }
        return status;
    }

    getAvailableProviders() {
        return Array.from(this.services.entries())
            .filter(([_, service]) => service.isConnected)
            .map(([provider, _]) => provider);
    }
}

// ===== AGENT ENHANCEMENT FUNCTIONS =====
// IDX-LLM-007: Agent LLM Enhancement System
export class AgentLLMEnhancer {
    constructor(llmManager) {
        this.llmManager = llmManager;
        this.agentPrompts = new Map();
        this.thinkingHistory = new Map();
    }

    async enhanceAgentThinking(agent, context) {
        const prompt = this.buildAgentPrompt(agent, context);
        
        try {
            const response = await this.llmManager.generateResponse(prompt, {
                maxTokens: 1024,
                temperature: 0.7
            });
            
            // Store thinking history
            this.addThinkingHistory(agent.id, {
                prompt,
                response: response.text,
                timestamp: Date.now(),
                context
            });
            
            return {
                thoughts: response.text,
                confidence: this.analyzeConfidence(response.text),
                nextActions: this.extractActions(response.text),
                reasoning: this.extractReasoning(response.text)
            };
            
        } catch (error) {
            console.error(`LLM enhancement failed for agent ${agent.id}:`, error);
            return {
                thoughts: "Unable to generate enhanced thinking due to LLM service unavailability",
                confidence: 0.3,
                nextActions: [],
                reasoning: "Fallback to basic agent logic"
            };
        }
    }

    buildAgentPrompt(agent, context) {
        const roleConfig = this.getRoleConfiguration(agent.role);
        
        return `You are an AI agent with the role of ${agent.role}. 

Your capabilities include: ${agent.capabilities.join(', ')}
Your current status: ${agent.status}
Your success rate: ${agent.stats.successRate}
Your rating: ${agent.stats.rating}/10

Current context:
- Project status: ${context.projectStatus || 'Unknown'}
- Available jobs: ${context.availableJobs || 0}
- System performance: ${context.systemPerformance || 'Normal'}

Recent thinking history:
${this.getRecentThinkingHistory(agent.id)}

Based on your role, capabilities, and current context, please provide:
1. Your analysis of the current situation
2. What you think should be done next
3. Your confidence level in your assessment
4. Specific actions you recommend taking

Respond in a structured, thoughtful manner that reflects your role and expertise.`;
    }

    getRoleConfiguration(role) {
        const configurations = {
            'project_manager': {
                focus: 'Project coordination, resource allocation, and strategic planning',
                thinking_style: 'Analytical and strategic',
                decision_factors: ['Priority', 'Resource availability', 'Timeline', 'Risk assessment']
            },
            'code_reviewer': {
                focus: 'Code quality, best practices, and technical debt',
                thinking_style: 'Detail-oriented and critical',
                decision_factors: ['Code quality', 'Performance', 'Security', 'Maintainability']
            },
            'performance_optimizer': {
                focus: 'System performance, bottlenecks, and optimization opportunities',
                thinking_style: 'Data-driven and analytical',
                decision_factors: ['Performance metrics', 'Resource usage', 'Scalability', 'Efficiency']
            },
            'ai_systems_engineer': {
                focus: 'AI system design, integration, and enhancement',
                thinking_style: 'Innovative and systematic',
                decision_factors: ['AI capabilities', 'Integration complexity', 'Learning potential', 'System synergy']
            }
        };
        
        return configurations[role] || {
            focus: 'General problem solving and task execution',
            thinking_style: 'Adaptive and practical',
            decision_factors: ['Efficiency', 'Effectiveness', 'Feasibility', 'Impact']
        };
    }

    addThinkingHistory(agentId, thinking) {
        if (!this.thinkingHistory.has(agentId)) {
            this.thinkingHistory.set(agentId, []);
        }
        
        const history = this.thinkingHistory.get(agentId);
        history.push(thinking);
        
        // Keep only recent history
        if (history.length > 50) {
            history.splice(0, history.length - 50);
        }
    }

    getRecentThinkingHistory(agentId, count = 5) {
        const history = this.thinkingHistory.get(agentId) || [];
        return history.slice(-count).map(h => 
            `[${new Date(h.timestamp).toISOString()}] ${h.response.substring(0, 200)}...`
        ).join('\n');
    }

    analyzeConfidence(text) {
        // Simple confidence analysis based on language patterns
        const confidenceIndicators = {
            high: ['confident', 'certain', 'definitely', 'clearly', 'obviously'],
            medium: ['likely', 'probably', 'suggest', 'recommend', 'think'],
            low: ['uncertain', 'unsure', 'maybe', 'possibly', 'might']
        };
        
        const words = text.toLowerCase().split(/\s+/);
        let confidence = 0.5; // Default medium confidence
        
        for (const [level, indicators] of Object.entries(confidenceIndicators)) {
            const matches = indicators.filter(indicator => 
                words.some(word => word.includes(indicator))
            ).length;
            
            if (level === 'high') confidence += matches * 0.2;
            else if (level === 'low') confidence -= matches * 0.2;
        }
        
        return Math.max(0, Math.min(1, confidence));
    }

    extractActions(text) {
        // Extract action items from LLM response
        const actionPatterns = [
            /should\s+(.+?)(?:\.|$)/gi,
            /need\s+to\s+(.+?)(?:\.|$)/gi,
            /must\s+(.+?)(?:\.|$)/gi,
            /recommend\s+(.+?)(?:\.|$)/gi
        ];
        
        const actions = [];
        for (const pattern of actionPatterns) {
            const matches = text.match(pattern);
            if (matches) {
                actions.push(...matches.map(match => match.trim()));
            }
        }
        
        return actions.slice(0, 5); // Limit to 5 actions
    }

    extractReasoning(text) {
        // Extract reasoning from LLM response
        const reasoningPatterns = [
            /because\s+(.+?)(?:\.|$)/gi,
            /since\s+(.+?)(?:\.|$)/gi,
            /as\s+(.+?)(?:\.|$)/gi,
            /due\s+to\s+(.+?)(?:\.|$)/gi
        ];
        
        const reasoning = [];
        for (const pattern of reasoningPatterns) {
            const matches = text.match(pattern);
            if (matches) {
                reasoning.push(...matches.map(match => match.trim()));
            }
        }
        
        return reasoning.slice(0, 3); // Limit to 3 reasoning points
    }

    getAgentThinkingHistory(agentId) {
        return this.thinkingHistory.get(agentId) || [];
    }

    getAllThinkingHistory() {
        const allHistory = {};
        for (const [agentId, history] of this.thinkingHistory) {
            allHistory[agentId] = history;
        }
        return allHistory;
    }
}

// Export the main classes
export { LLMService };
export default LLMManager; 