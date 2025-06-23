/**
 * LM Studio Interface
 * Web interface and command-line script for interfacing with LM Studio local LLM
 * Provides AI-powered scenarios and responses for the game
 * Uses the official @lmstudio/sdk for better functionality
 */

import pkg from '@lmstudio/sdk';
const { LMStudioClient } = pkg;
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

class LMStudioInterface {
    constructor() {
        this.name = 'LM Studio Interface';
        this.visible = false;
        this.config = this.loadConfig();
        this.client = null;
        this.model = null;
        this.isConnected = false;
        this.currentModel = null;
        this.scenarios = new Map();
        this.stats = {
            totalQueries: 0,
            successfulQueries: 0,
            failedQueries: 0,
            totalResponseTime: 0,
            averageResponseTime: 0
        };
        this.init();
    }

    init() {
        this.createUI();
        this.loadScenarios();
        this.bindEvents();
        this.initializeClient();
        console.log('🤖 LM Studio Interface initialized');
    }

    async initializeClient() {
        try {
            this.client = new LMStudioClient();
            console.log('✅ LM Studio client initialized');
            
            // Try to load the default model
            await this.loadModel(this.config.defaultModel);
        } catch (error) {
            console.warn('⚠️ Failed to initialize LM Studio client:', error.message);
            this.updateConnectionStatus(false, 'Failed to initialize client');
        }
    }

    async loadModel(modelName) {
        try {
            if (this.model) {
                await this.model.unload();
            }
            
            this.model = await this.client.llm.model(modelName);
            this.currentModel = modelName;
            this.isConnected = true;
            this.updateConnectionStatus(true, `Connected to ${modelName}`);
            console.log(`✅ Model ${modelName} loaded successfully`);
        } catch (error) {
            console.warn(`⚠️ Failed to load model ${modelName}:`, error.message);
            this.updateConnectionStatus(false, `Failed to load ${modelName}`);
            this.isConnected = false;
        }
    }

    updateConnectionStatus(connected, message) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.style.background = connected ? '#4CAF50' : '#f44336';
        }
    }

    loadConfig() {
        const configPath = join(process.cwd(), 'tools', 'ai', 'lm-studio-config.json');
        
        if (existsSync(configPath)) {
            try {
                return JSON.parse(readFileSync(configPath, 'utf8'));
            } catch (error) {
                console.warn('Failed to load LM Studio config, using defaults');
            }
        }

        // Default configuration
        const defaultConfig = {
            serverUrl: 'http://localhost:1234',
            apiEndpoint: '/v1/chat/completions',
            defaultModel: 'llama-2-7b-chat',
            maxTokens: 500,
            temperature: 0.7,
            timeout: 10000,
            scenarios: {
                gameMaster: {
                    name: 'Game Master',
                    description: 'AI that creates dynamic game scenarios',
                    systemPrompt: 'You are an AI Game Master for a multiplayer planetary shooter game. Create engaging scenarios, challenges, and story elements.',
                    examples: [
                        'Create a meteor shower event on Mars',
                        'Design a capture-the-flag scenario',
                        'Generate a boss battle encounter'
                    ]
                },
                npcGenerator: {
                    name: 'NPC Generator',
                    description: 'AI that creates non-player characters',
                    systemPrompt: 'You are an AI that generates interesting NPCs for a space shooter game. Create unique characters with personalities and backstories.',
                    examples: [
                        'Create a mysterious space trader',
                        'Generate a rogue AI entity',
                        'Design a planetary guardian'
                    ]
                },
                questDesigner: {
                    name: 'Quest Designer',
                    description: 'AI that designs missions and objectives',
                    systemPrompt: 'You are an AI Quest Designer. Create engaging missions, objectives, and rewards for players.',
                    examples: [
                        'Design a resource gathering mission',
                        'Create a planetary exploration quest',
                        'Generate a combat challenge'
                    ]
                },
                storyGenerator: {
                    name: 'Story Generator',
                    description: 'AI that creates narrative content',
                    systemPrompt: 'You are an AI Story Generator for a space shooter game. Create compelling narratives, lore, and world-building elements.',
                    examples: [
                        'Create lore for a new planet',
                        'Generate a space mystery',
                        'Design a faction conflict'
                    ]
                },
                eventPlanner: {
                    name: 'Event Planner',
                    description: 'AI that plans dynamic game events',
                    systemPrompt: 'You are an AI Event Planner for a space shooter game. Create exciting events, challenges, and special occasions.',
                    examples: [
                        'Plan a space race event',
                        'Create a planetary invasion scenario',
                        'Design a treasure hunt'
                    ]
                },
                balanceAdvisor: {
                    name: 'Balance Advisor',
                    description: 'AI that provides game balance advice',
                    systemPrompt: 'You are an AI Game Balance Advisor. Analyze game mechanics and provide suggestions for improving balance and fairness.',
                    examples: [
                        'Analyze weapon damage balance',
                        'Suggest planet gravity adjustments',
                        'Review multiplayer mechanics'
                    ]
                }
            }
        };

        // Save default config
        writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
    }

    createUI() {
        this.container = document.createElement('div');
        this.container.id = 'lmStudioInterface';
        this.container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90vw;
            height: 85vh;
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid #9C27B0;
            border-radius: 12px;
            color: white;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            z-index: 10000;
            display: none;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            background: #9C27B0;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #7B1FA2;
        `;
        header.innerHTML = `
            <h2 style="margin: 0; color: white;">🤖 LM Studio Interface</h2>
            <div style="display: flex; gap: 10px; align-items: center;">
                <div id="connectionStatus" style="padding: 5px 10px; border-radius: 5px; background: #f44336; font-size: 12px;">
                    Disconnected
                </div>
                <button id="closeLMStudio" style="background: #f44336; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-size: 12px;">
                    ✕ Close
                </button>
            </div>
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            display: flex;
            height: calc(100% - 60px);
        `;

        // Create sidebar
        const sidebar = document.createElement('div');
        sidebar.style.cssText = `
            width: 300px;
            background: rgba(255,255,255,0.1);
            padding: 15px;
            overflow-y: auto;
            border-right: 1px solid #333;
        `;

        sidebar.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #9C27B0;">⚙️ Configuration</h3>
                <div style="font-size: 12px; margin-bottom: 10px;">
                    <strong>Server:</strong> ${this.config.serverUrl}<br>
                    <strong>Model:</strong> ${this.config.defaultModel}<br>
                    <strong>Max Tokens:</strong> ${this.config.maxTokens}<br>
                    <strong>Temperature:</strong> ${this.config.temperature}
                </div>
                <button id="testConnection" style="width: 100%; background: #2196F3; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-bottom: 8px;">
                    🔗 Test Connection
                </button>
                <button id="reloadConfig" style="width: 100%; background: #FF9800; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer; font-size: 12px;">
                    🔄 Reload Config
                </button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #9C27B0;">🎭 AI Scenarios</h3>
                <div id="scenariosList" style="font-size: 12px;">
                    Loading scenarios...
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #9C27B0;">📊 Usage Stats</h3>
                <div id="usageStats" style="font-size: 12px;">
                    <div>Total Queries: <span id="totalQueries">0</span></div>
                    <div>Successful: <span id="successfulQueries">0</span></div>
                    <div>Failed: <span id="failedQueries">0</span></div>
                    <div>Avg Response Time: <span id="avgResponseTime">0ms</span></div>
                </div>
            </div>
        `;

        // Create main content
        const mainContent = document.createElement('div');
        mainContent.style.cssText = `
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        `;

        mainContent.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #9C27B0;">💬 AI Chat Interface</h3>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #ccc;">Scenario:</label>
                    <select id="scenarioSelect" style="width: 100%; padding: 8px; background: #333; border: 1px solid #555; color: white; border-radius: 4px; margin-bottom: 10px;">
                        <option value="">Select a scenario...</option>
                    </select>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #ccc;">Message:</label>
                    <textarea id="aiMessage" rows="4" placeholder="Enter your message to the AI..." style="width: 100%; padding: 8px; background: #333; border: 1px solid #555; color: white; border-radius: 4px; resize: vertical;"></textarea>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button id="sendMessage" style="background: #9C27B0; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                        🚀 Send to AI
                    </button>
                    <button id="clearChat" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                        🗑️ Clear Chat
                    </button>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #9C27B0;">📝 Chat History</h3>
                <div id="chatHistory" style="background: #222; padding: 15px; border-radius: 5px; max-height: 300px; overflow-y: auto; font-size: 12px;">
                    <div style="color: #9C27B0;">🤖 AI Interface ready. Select a scenario and start chatting!</div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #9C27B0;">🔧 Command Line Interface</h3>
                <div style="background: #222; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px;">
                    <div style="color: #4CAF50; margin-bottom: 10px;">Available Commands:</div>
                    <div style="margin-bottom: 5px;"><code>node tools/ai/lm-studio-interface.js query "Your message"</code></div>
                    <div style="margin-bottom: 5px;"><code>node tools/ai/lm-studio-interface.js scenario gameMaster "Create a meteor shower"</code></div>
                    <div style="margin-bottom: 5px;"><code>node tools/ai/lm-studio-interface.js generate npc "Space trader"</code></div>
                    <div style="margin-bottom: 5px;"><code>node tools/ai/lm-studio-interface.js quest "Resource gathering"</code></div>
                    <div style="margin-bottom: 5px;"><code>node tools/ai/lm-studio-interface.js story "Planet lore"</code></div>
                </div>
            </div>
        `;

        content.appendChild(sidebar);
        content.appendChild(mainContent);
        this.container.appendChild(header);
        this.container.appendChild(content);
        document.body.appendChild(this.container);
    }

    loadScenarios() {
        const scenariosList = document.getElementById('scenariosList');
        const scenarioSelect = document.getElementById('scenarioSelect');
        
        scenariosList.innerHTML = '';
        scenarioSelect.innerHTML = '<option value="">Select a scenario...</option>';
        
        Object.entries(this.config.scenarios).forEach(([key, scenario]) => {
            // Add to sidebar list
            const scenarioDiv = document.createElement('div');
            scenarioDiv.style.cssText = `
                padding: 8px;
                margin-bottom: 8px;
                background: rgba(156, 39, 176, 0.2);
                border: 1px solid #9C27B0;
                border-radius: 4px;
                cursor: pointer;
                transition: background 0.3s;
            `;
            scenarioDiv.innerHTML = `
                <div style="font-weight: bold; color: #9C27B0;">${scenario.name}</div>
                <div style="font-size: 10px; color: #ccc;">${scenario.description}</div>
            `;
            scenarioDiv.addEventListener('click', () => {
                this.selectScenario(key);
            });
            scenariosList.appendChild(scenarioDiv);
            
            // Add to dropdown
            const option = document.createElement('option');
            option.value = key;
            option.textContent = scenario.name;
            scenarioSelect.appendChild(option);
        });
    }

    selectScenario(key) {
        const scenario = this.config.scenarios[key];
        if (scenario) {
            document.getElementById('scenarioSelect').value = key;
            this.addToChat('system', `Selected scenario: ${scenario.name}`, scenario.systemPrompt);
        }
    }

    bindEvents() {
        document.getElementById('closeLMStudio').addEventListener('click', () => {
            this.hide();
        });

        document.getElementById('testConnection').addEventListener('click', () => {
            this.testConnection();
        });

        document.getElementById('reloadConfig').addEventListener('click', () => {
            this.reloadConfig();
        });

        document.getElementById('sendMessage').addEventListener('click', () => {
            this.sendMessage();
        });

        document.getElementById('clearChat').addEventListener('click', () => {
            this.clearChat();
        });

        document.getElementById('scenarioSelect').addEventListener('change', (e) => {
            if (e.target.value) {
                this.selectScenario(e.target.value);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.visible) {
                this.hide();
            }
        });
    }

    async testConnection() {
        this.updateConnectionStatus(false, 'Testing...');
        
        try {
            const response = await fetch(`${this.config.serverUrl}/v1/models`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: this.config.timeout
            });
            
            if (response.ok) {
                const data = await response.json();
                this.isConnected = true;
                this.updateConnectionStatus(true, `Connected. Available models: ${data.data?.map(m => m.id).join(', ') || 'Unknown'}`);
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            this.isConnected = false;
            this.updateConnectionStatus(false, 'Failed');
            this.addToChat('error', '❌ Connection failed', error.message);
        }
    }

    reloadConfig() {
        this.config = this.loadConfig();
        this.loadScenarios();
        this.addToChat('system', '🔄 Configuration reloaded', 'All scenarios and settings have been updated');
    }

    async sendMessage() {
        const message = document.getElementById('aiMessage').value.trim();
        const scenarioKey = document.getElementById('scenarioSelect').value;
        
        if (!message) {
            this.showNotification('Please enter a message', '#f44336');
            return;
        }
        
        if (!scenarioKey) {
            this.showNotification('Please select a scenario', '#f44336');
            return;
        }
        
        this.addToChat('user', '👤 You', message);
        document.getElementById('aiMessage').value = '';
        
        try {
            const response = await this.queryAI(scenarioKey, message);
            this.addToChat('ai', '🤖 AI Response', response.response);
            this.updateStats(true);
        } catch (error) {
            this.addToChat('error', '❌ Error', error.message);
            this.updateStats(false);
        }
    }

    async queryAI(scenarioKey, message) {
        const scenario = this.config.scenarios[scenarioKey];
        if (!scenario) {
            throw new Error('Invalid scenario');
        }
        
        if (!this.isConnected || !this.model) {
            throw new Error('LM Studio not connected. Please ensure LM Studio is running and a model is loaded.');
        }
        
        const startTime = Date.now();
        this.stats.totalQueries++;
        
        try {
            // Use optimized parameters for faster responses
            const optimizedParams = {
                max_tokens: scenario.maxTokens || 150,  // Shorter responses for speed
                temperature: scenario.temperature || 0.7,  // Balanced creativity/speed
                top_p: 0.9,  // Nucleus sampling
                top_k: 40,   // Top-k sampling
                repeat_penalty: 1.1,  // Prevent repetition
                frequency_penalty: 0.1,  // Reduce repetitive phrases
                presence_penalty: 0.1,   // Encourage diverse topics
                stop: ['\n\n', 'Human:', 'Assistant:']  // Stop at natural breaks
            };

            // Use HTTP API for better control over parameters
            const response = await fetch('http://localhost:1234/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.currentModel || 'llama-3-8b-instruct',
                    messages: [
                        {
                            role: 'system',
                            content: scenario.systemPrompt
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    ...optimizedParams
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const result = data.choices[0].message.content;
            const endTime = Date.now();
            const duration = endTime - startTime;

            this.stats.successfulQueries++;
            this.stats.totalResponseTime += duration;
            this.stats.averageResponseTime = (this.stats.averageResponseTime + duration) / 2;

            console.log(`✅ AI Response (${duration}ms):`, result);
            return {
                response: result,
                duration: duration,
                scenario: scenarioKey,
                model: this.currentModel
            };

        } catch (error) {
            this.stats.failedQueries++;
            console.error('❌ AI Query failed:', error.message);
            throw error;
        }
    }

    addToChat(type, sender, message) {
        const chatHistory = document.getElementById('chatHistory');
        const timestamp = new Date().toLocaleTimeString();
        
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            margin-bottom: 10px;
            padding: 8px;
            border-radius: 4px;
            border-left: 3px solid ${this.getTypeColor(type)};
            background: rgba(255,255,255,0.05);
        `;
        
        messageDiv.innerHTML = `
            <div style="font-weight: bold; color: ${this.getTypeColor(type)}; margin-bottom: 5px;">
                ${sender} <span style="font-size: 10px; color: #888;">[${timestamp}]</span>
            </div>
            <div style="color: #ccc; font-size: 11px; white-space: pre-wrap;">${message}</div>
        `;
        
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    getTypeColor(type) {
        switch (type) {
            case 'user': return '#2196F3';
            case 'ai': return '#9C27B0';
            case 'system': return '#4CAF50';
            case 'error': return '#f44336';
            default: return '#666';
        }
    }

    clearChat() {
        document.getElementById('chatHistory').innerHTML = '<div style="color: #9C27B0;">🤖 Chat history cleared</div>';
    }

    updateStats(success) {
        const totalQueries = document.getElementById('totalQueries');
        const successfulQueries = document.getElementById('successfulQueries');
        const failedQueries = document.getElementById('failedQueries');
        
        totalQueries.textContent = parseInt(totalQueries.textContent || 0) + 1;
        
        if (success) {
            successfulQueries.textContent = parseInt(successfulQueries.textContent || 0) + 1;
        } else {
            failedQueries.textContent = parseInt(failedQueries.textContent || 0) + 1;
        }
    }

    showNotification(message, color) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10002;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Command line interface methods
    async executeCommand(args) {
        const command = args[0];
        const message = args.slice(1).join(' ');
        
        switch (command) {
            case 'query':
                return await this.queryAI('gameMaster', message);
            case 'scenario':
                const scenarioKey = args[1];
                const scenarioMessage = args.slice(2).join(' ');
                return await this.queryAI(scenarioKey, scenarioMessage);
            case 'generate':
                const type = args[1];
                const prompt = args.slice(2).join(' ');
                return await this.generateContent(type, prompt);
            case 'quest':
                return await this.queryAI('questDesigner', message);
            case 'story':
                return await this.queryAI('storyGenerator', message);
            default:
                throw new Error(`Unknown command: ${command}`);
        }
    }

    async generateContent(type, prompt) {
        const scenarios = {
            npc: 'npcGenerator',
            quest: 'questDesigner',
            story: 'storyGenerator'
        };
        
        const scenarioKey = scenarios[type] || 'gameMaster';
        return await this.queryAI(scenarioKey, prompt);
    }

    show() {
        this.visible = true;
        this.container.style.display = 'block';
        this.testConnection();
    }

    hide() {
        this.visible = false;
        this.container.style.display = 'none';
    }

    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Command line interface
if (process.argv.length > 2) {
    const lmInterface = new LMStudioInterface();
    const args = process.argv.slice(2);
    
    lmInterface.executeCommand(args)
        .then(response => {
            console.log(response);
            process.exit(0);
        })
        .catch(error => {
            console.error('Error:', error.message);
            process.exit(1);
        });
}

export default LMStudioInterface; 