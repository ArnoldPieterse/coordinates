#!/usr/bin/env node

/**
 * LM Studio CLI Interface
 * Standalone command-line script for AI-powered game scenarios
 * Can be called from the server for dynamic content generation
 * Uses the official @lmstudio/sdk for better functionality
 */

import pkg from '@lmstudio/sdk';
const { LMStudioClient } = pkg;
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class LMStudioCLI {
    constructor() {
        this.config = this.loadConfig();
        this.client = null;
        this.model = null;
        this.stats = {
            totalQueries: 0,
            successfulQueries: 0,
            failedQueries: 0,
            totalResponseTime: 0
        };
    }

    async initialize() {
        try {
            this.client = new LMStudioClient();
            await this.loadModel(this.config.defaultModel);
            console.log('✅ LM Studio CLI initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize LM Studio CLI:', error.message);
            process.exit(1);
        }
    }

    async loadModel(modelName) {
        try {
            if (this.model) {
                await this.model.unload();
            }
            
            this.model = await this.client.llm.model(modelName);
            console.log(`✅ Model ${modelName} loaded successfully`);
        } catch (error) {
            throw new Error(`Failed to load model ${modelName}: ${error.message}`);
        }
    }

    loadConfig() {
        const configPath = join(__dirname, 'lm-studio-config.json');
        
        if (existsSync(configPath)) {
            try {
                return JSON.parse(readFileSync(configPath, 'utf8'));
            } catch (error) {
                console.error('Failed to load config:', error.message);
                process.exit(1);
            }
        } else {
            console.error('Config file not found:', configPath);
            process.exit(1);
        }
    }

    async queryAI(scenarioKey, message) {
        const scenario = this.config.scenarios[scenarioKey];
        if (!scenario) {
            throw new Error(`Invalid scenario: ${scenarioKey}`);
        }

        if (!this.model) {
            throw new Error('No model loaded. Please ensure LM Studio is running.');
        }

        const startTime = Date.now();
        this.stats.totalQueries++;

        try {
            const result = await this.model.respond([
                {
                    role: 'system',
                    content: scenario.systemPrompt
                },
                {
                    role: 'user',
                    content: message
                }
            ]);

            const responseTime = Date.now() - startTime;
            this.stats.successfulQueries++;
            this.stats.totalResponseTime += responseTime;
            
            return {
                content: result.content,
                responseTime,
                scenario: scenario.name
            };
        } catch (error) {
            this.stats.failedQueries++;
            throw error;
        }
    }

    async executeCommand(args) {
        const command = args[0];
        const message = args.slice(1).join(' ');

        if (!message) {
            this.showHelp();
            return;
        }

        try {
            let result;
            switch (command) {
                case 'query':
                    result = await this.queryAI('gameMaster', message);
                    break;
                case 'scenario':
                    const scenarioKey = args[1];
                    const scenarioMessage = args.slice(2).join(' ');
                    if (!scenarioKey || !scenarioMessage) {
                        throw new Error('Usage: scenario <scenarioKey> <message>');
                    }
                    result = await this.queryAI(scenarioKey, scenarioMessage);
                    break;
                case 'generate':
                    const type = args[1];
                    const prompt = args.slice(2).join(' ');
                    if (!type || !prompt) {
                        throw new Error('Usage: generate <type> <prompt>');
                    }
                    result = await this.generateContent(type, prompt);
                    break;
                case 'quest':
                    result = await this.queryAI('questDesigner', message);
                    break;
                case 'story':
                    result = await this.queryAI('storyGenerator', message);
                    break;
                case 'npc':
                    result = await this.queryAI('npcGenerator', message);
                    break;
                case 'event':
                    result = await this.queryAI('eventPlanner', message);
                    break;
                case 'balance':
                    result = await this.queryAI('balanceAdvisor', message);
                    break;
                case 'list':
                    this.listScenarios();
                    return;
                case 'stats':
                    this.showStats();
                    return;
                case 'help':
                    this.showHelp();
                    return;
                default:
                    throw new Error(`Unknown command: ${command}`);
            }

            // Output result in JSON format for server integration
            console.log(JSON.stringify({
                success: true,
                command,
                scenario: result.scenario,
                responseTime: result.responseTime,
                content: result.content,
                timestamp: new Date().toISOString()
            }));

        } catch (error) {
            console.error(JSON.stringify({
                success: false,
                command,
                error: error.message,
                timestamp: new Date().toISOString()
            }));
            process.exit(1);
        }
    }

    async generateContent(type, prompt) {
        const scenarios = {
            npc: 'npcGenerator',
            quest: 'questDesigner',
            story: 'storyGenerator',
            event: 'eventPlanner',
            balance: 'balanceAdvisor'
        };

        const scenarioKey = scenarios[type] || 'gameMaster';
        return await this.queryAI(scenarioKey, prompt);
    }

    listScenarios() {
        console.log('Available scenarios:');
        Object.entries(this.config.scenarios).forEach(([key, scenario]) => {
            console.log(`  ${key}: ${scenario.name} - ${scenario.description}`);
        });
    }

    showStats() {
        const avgResponseTime = this.stats.totalQueries > 0 
            ? Math.round(this.stats.totalResponseTime / this.stats.successfulQueries)
            : 0;

        console.log('Usage Statistics:');
        console.log(`  Total Queries: ${this.stats.totalQueries}`);
        console.log(`  Successful: ${this.stats.successfulQueries}`);
        console.log(`  Failed: ${this.stats.failedQueries}`);
        console.log(`  Success Rate: ${this.stats.totalQueries > 0 ? Math.round((this.stats.successfulQueries / this.stats.totalQueries) * 100) : 0}%`);
        console.log(`  Average Response Time: ${avgResponseTime}ms`);
    }

    showHelp() {
        console.log(`
LM Studio CLI Interface - AI-Powered Game Scenarios

Usage: node lm-studio-cli.js <command> [options]

Commands:
  query <message>                    - Send a general query to the AI
  scenario <key> <message>           - Use a specific scenario
  generate <type> <prompt>           - Generate content by type
  quest <message>                    - Design a quest/mission
  story <message>                    - Generate story content
  npc <message>                      - Generate NPC content
  event <message>                    - Plan game events
  balance <message>                  - Get balance suggestions
  list                               - List available scenarios
  stats                              - Show usage statistics
  help                               - Show this help

Scenario Keys:
  gameMaster     - Dynamic game scenarios
  npcGenerator   - Non-player characters
  questDesigner  - Missions and objectives
  storyGenerator - Narrative content
  eventPlanner   - Special events
  balanceAdvisor - Game balance

Generate Types:
  npc, quest, story, event, balance

Examples:
  node lm-studio-cli.js query "Create a meteor shower event"
  node lm-studio-cli.js scenario gameMaster "Design a boss battle"
  node lm-studio-cli.js generate npc "Space trader with mysterious past"
  node lm-studio-cli.js quest "Resource gathering on Mars"
  node lm-studio-cli.js story "Planet with ancient ruins"

Configuration:
  Server URL: ${this.config.serverUrl}
  Model: ${this.config.defaultModel}
  Max Tokens: ${this.config.maxTokens}
  Temperature: ${this.config.temperature}
        `);
    }
}

// Main execution
if (process.argv.length > 2) {
    const cli = new LMStudioCLI();
    const args = process.argv.slice(2);
    
    // Initialize the client before executing commands
    cli.initialize()
        .then(() => cli.executeCommand(args))
        .catch(error => {
            console.error('❌ Failed to initialize:', error.message);
            process.exit(1);
        });
} else {
    const cli = new LMStudioCLI();
    cli.showHelp();
} 