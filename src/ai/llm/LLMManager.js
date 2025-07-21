/**
 * Coordinates - LLM Integration System
 * Provides unified interface for multiple LLM services
 * IDX-LLM-001: LLM Service Integration
 * IDX-LLM-002: Multi-Provider Support
 * IDX-LLM-003: Agent Enhancement System
 * IDX-LLM-004: Terminal Access for Fast Local Transfers
 * 
 * For index reference format, see INDEX_DESCRIBER.md
 */

// Import LM Studio SDK with proper CommonJS interop
let LMStudioClient = null;
// Using browser's built-in fetch API instead of node-fetch

// ===== LLM PROVIDER CONFIGURATIONS =====
// IDX-LLM-004: Provider Configuration Management
export const LLM_PROVIDERS = {
    LM_STUDIO_LOCAL: 'lm_studio_local', // User's local instance
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
    [LLM_PROVIDERS.LM_STUDIO_LOCAL]: {
        baseUrl: 'http://10.3.129.26:1234/v1',
        apiKey: 'not-needed',
        models: ['meta-llama-3-70b-instruct-smashed', 'text-embedding-nomic-embed-text-v1.5@q4_k_m'],
        maxTokens: 4096,
        temperature: 0.7,
        priority: 'high' // Local instance gets priority
    },
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

// ===== TERMINAL ACCESS SYSTEM =====
// IDX-LLM-005: Terminal Access for Fast Local Transfers
export class TerminalAccess {
    constructor(llmService) {
        this.llmService = llmService;
        this.messageQueue = [];
        this.isProcessing = false;
        this.terminalHistory = [];
        this.maxHistorySize = 1000;
        this.connectionStatus = 'disconnected';
        this.lastPing = 0;
        
        // Terminal configuration
        this.terminalConfig = {
            maxConcurrentRequests: 5,
            requestTimeout: 15000, // 15 seconds for local
            retryAttempts: 3,
            batchSize: 10,
            enableStreaming: true
        };
        
        this.initializeTerminal();
    }

    async initializeTerminal() {
        console.log('🚀 Initializing Terminal Access for LM Studio Local...');
        
        // Test connection to local LM Studio
        try {
            const response = await fetch(`${LLM_CONFIGS[LLM_PROVIDERS.LM_STUDIO_LOCAL].baseUrl}/models`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            
            if (response.ok) {
                this.connectionStatus = 'connected';
                this.lastPing = Date.now();
                console.log('✅ Terminal connected to local LM Studio');
                
                // Start ping monitoring
                this.startPingMonitor();
                
                // Process any queued messages
                this.processMessageQueue();
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Terminal connection failed:', error.message);
            this.connectionStatus = 'error';
            this.scheduleReconnection();
        }
    }

    startPingMonitor() {
        setInterval(async () => {
            try {
                const startTime = Date.now();
                const response = await fetch(`${LLM_CONFIGS[LLM_PROVIDERS.LM_STUDIO_LOCAL].baseUrl}/models`, {
                    method: 'GET',
                    signal: AbortSignal.timeout(2000)
                });
                
                if (response.ok) {
                    this.connectionStatus = 'connected';
                    this.lastPing = Date.now();
                    const latency = Date.now() - startTime;
                    
                    // Log low latency connections
                    if (latency < 100) {
                        console.log(`⚡ Terminal ping: ${latency}ms`);
                    }
                } else {
                    this.connectionStatus = 'error';
                }
            } catch (error) {
                this.connectionStatus = 'disconnected';
                console.warn('⚠️ Terminal ping failed:', error.message);
            }
        }, 10000); // Ping every 10 seconds
    }

    scheduleReconnection() {
        setTimeout(() => {
            console.log('🔄 Attempting terminal reconnection...');
            this.initializeTerminal();
        }, 5000); // Retry every 5 seconds
    }

    async sendMessage(message, options = {}) {
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const messageData = {
            id: messageId,
            content: message,
            timestamp: Date.now(),
            options: {
                maxTokens: options.maxTokens || 1024,
                temperature: options.temperature || 0.7,
                model: options.model || LLM_CONFIGS[LLM_PROVIDERS.LM_STUDIO_LOCAL].models[0],
                streaming: options.streaming !== false,
                priority: options.priority || 'normal'
            },
            status: 'queued'
        };

        // Add to history
        this.addToHistory('user', message);
        
        // Add to queue
        this.messageQueue.push(messageData);
        
        // Process queue if not already processing
        if (!this.isProcessing) {
            this.processMessageQueue();
        }

        return messageId;
    }

    async processMessageQueue() {
        if (this.isProcessing || this.connectionStatus !== 'connected') {
            return;
        }

        this.isProcessing = true;
        
        try {
            while (this.messageQueue.length > 0) {
                const batch = this.messageQueue.splice(0, this.terminalConfig.batchSize);
                
                // Process batch concurrently
                const promises = batch.map(messageData => this.processMessage(messageData));
                await Promise.allSettled(promises);
                
                // Small delay between batches to prevent overwhelming
                if (this.messageQueue.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        } catch (error) {
            console.error('❌ Terminal message processing error:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    async processMessage(messageData) {
        try {
            messageData.status = 'processing';
            
            const startTime = Date.now();
            
            if (messageData.options.streaming) {
                await this.processStreamingMessage(messageData);
            } else {
                await this.processStandardMessage(messageData);
            }
            
            const processingTime = Date.now() - startTime;
            console.log(`⚡ Terminal message processed in ${processingTime}ms: ${messageData.content.substring(0, 50)}...`);
            
            messageData.status = 'completed';
            messageData.processingTime = processingTime;
            
        } catch (error) {
            console.error(`❌ Terminal message processing failed:`, error);
            messageData.status = 'error';
            messageData.error = error.message;
            
            // Retry logic
            if (messageData.retryCount < this.terminalConfig.retryAttempts) {
                messageData.retryCount = (messageData.retryCount || 0) + 1;
                this.messageQueue.unshift(messageData); // Add back to front of queue
            }
        }
    }

    async processStandardMessage(messageData) {
        const response = await fetch(`${LLM_CONFIGS[LLM_PROVIDERS.LM_STUDIO_LOCAL].baseUrl}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: messageData.options.model,
                messages: [{ role: 'user', content: messageData.content }],
                max_tokens: messageData.options.maxTokens,
                temperature: messageData.options.temperature,
                stream: false
            }),
            signal: AbortSignal.timeout(this.terminalConfig.requestTimeout)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const responseText = data.choices?.[0]?.message?.content || '';
        
        // Add to history
        this.addToHistory('assistant', responseText);
        
        // Emit response event
        this.emitResponse(messageData.id, responseText, data);
    }

    async processStreamingMessage(messageData) {
        const response = await fetch(`${LLM_CONFIGS[LLM_PROVIDERS.LM_STUDIO_LOCAL].baseUrl}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: messageData.options.model,
                messages: [{ role: 'user', content: messageData.content }],
                max_tokens: messageData.options.maxTokens,
                temperature: messageData.options.temperature,
                stream: true
            }),
            signal: AbortSignal.timeout(this.terminalConfig.requestTimeout)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') break;

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content || '';
                            fullResponse += content;
                            
                            // Emit streaming chunk
                            this.emitStreamingChunk(messageData.id, content);
                        } catch (e) {
                            // Ignore parsing errors for incomplete chunks
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }

        // Add complete response to history
        this.addToHistory('assistant', fullResponse);
        
        // Emit final response
        this.emitResponse(messageData.id, fullResponse);
    }

    addToHistory(role, content) {
        this.terminalHistory.push({
            role,
            content,
            timestamp: Date.now()
        });

        // Keep history size manageable
        if (this.terminalHistory.length > this.maxHistorySize) {
            this.terminalHistory = this.terminalHistory.slice(-this.maxHistorySize);
        }
    }

    emitResponse(messageId, response, data = null) {
        // Dispatch custom event for response
        const event = new CustomEvent('terminalResponse', {
            detail: {
                messageId,
                response,
                data,
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);
    }

    emitStreamingChunk(messageId, chunk) {
        // Dispatch custom event for streaming chunk
        const event = new CustomEvent('terminalStreamingChunk', {
            detail: {
                messageId,
                chunk,
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);
    }

    getStatus() {
        return {
            connectionStatus: this.connectionStatus,
            lastPing: this.lastPing,
            queueLength: this.messageQueue.length,
            isProcessing: this.isProcessing,
            historySize: this.terminalHistory.length,
            config: this.terminalConfig
        };
    }

    getHistory(limit = 50) {
        return this.terminalHistory.slice(-limit);
    }

    clearHistory() {
        this.terminalHistory = [];
    }

    updateConfig(newConfig) {
        this.terminalConfig = { ...this.terminalConfig, ...newConfig };
    }
}

// ===== LLM SERVICE CLASS =====
// IDX-LLM-006: Unified LLM Service Implementation
class LLMService {
    constructor(provider = LLM_PROVIDERS.LM_STUDIO_LOCAL) {
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
        
        // Initialize terminal access for local providers
        if (provider === LLM_PROVIDERS.LM_STUDIO_LOCAL) {
            this.terminalAccess = new TerminalAccess(this);
        }
        
        this.initializeClient();
    }

    async initializeClient() {
        try {
            switch (this.provider) {
                case LLM_PROVIDERS.LM_STUDIO_LOCAL:
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
        console.log(`[LLM] Testing connection for provider: ${this.provider}`);
        try {
            const startTime = Date.now();
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
        console.log(`[LLM] generateResponse: prompt='${prompt}', model='${options.model}'`);
        
        // Use terminal access for local providers if available
        if (this.provider === LLM_PROVIDERS.LM_STUDIO_LOCAL && this.terminalAccess) {
            return await this.generateResponseViaTerminal(prompt, options);
        }
        
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
                case LLM_PROVIDERS.LM_STUDIO_LOCAL:
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

    async generateResponseViaTerminal(prompt, options = {}) {
        return new Promise((resolve, reject) => {
            const messageId = this.terminalAccess.sendMessage(prompt, options);
            let responseText = '';
            let isComplete = false;

            const handleResponse = (event) => {
                if (event.detail.messageId === messageId) {
                    responseText = event.detail.response;
                    isComplete = true;
                    cleanup();
                    resolve({
                        text: responseText,
                        provider: this.provider,
                        model: options.model || this.config.models[0],
                        responseTime: Date.now(),
                        usage: { terminal: true }
                    });
                }
            };

            const handleStreaming = (event) => {
                if (event.detail.messageId === messageId) {
                    responseText += event.detail.chunk;
                }
            };

            const cleanup = () => {
                window.removeEventListener('terminalResponse', handleResponse);
                window.removeEventListener('terminalStreamingChunk', handleStreaming);
            };

            window.addEventListener('terminalResponse', handleResponse);
            window.addEventListener('terminalStreamingChunk', handleStreaming);

            // Timeout after 30 seconds
            setTimeout(() => {
                if (!isComplete) {
                    cleanup();
                    reject(new Error('Terminal response timeout'));
                }
            }, 30000);
        });
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
            case LLM_PROVIDERS.LM_STUDIO_LOCAL:
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
            case LLM_PROVIDERS.LM_STUDIO_LOCAL:
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
            usageStats: { ...this.usageStats },
            terminalStatus: this.terminalAccess?.getStatus()
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
// IDX-LLM-007: Multi-Provider LLM Management
export class LLMManager {
    constructor() {
        this.services = new Map();
        this.activeProvider = LLM_PROVIDERS.LM_STUDIO_LOCAL; // Prioritize local instance
        this.fallbackProviders = [
            LLM_PROVIDERS.LM_STUDIO,
            LLM_PROVIDERS.OLLAMA,
            LLM_PROVIDERS.OPENAI_FREE,
            LLM_PROVIDERS.ANTHROPIC_FREE
        ];
    }

    async initializeServices() {
        console.log('🚀 Initializing LLM services with terminal access...');
        
        // Initialize primary service (local LM Studio)
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
        
        // Log terminal status if available
        const primaryServiceInstance = this.services.get(this.activeProvider);
        if (primaryServiceInstance?.terminalAccess) {
            const terminalStatus = primaryServiceInstance.terminalAccess.getStatus();
            console.log('🔌 Terminal Access Status:', terminalStatus);
        }
        
        return connectedServices.length > 0;
    }

    async generateResponse(prompt, options = {}) {
        // Try active provider first (local LM Studio)
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

    getTerminalAccess() {
        const activeService = this.services.get(this.activeProvider);
        return activeService?.terminalAccess;
    }
}

// ===== AGENT ENHANCEMENT FUNCTIONS =====
// IDX-LLM-008: Agent LLM Enhancement System
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