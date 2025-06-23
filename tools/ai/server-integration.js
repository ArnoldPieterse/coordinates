/**
 * Server Integration for LM Studio
 * Allows the game server to call AI-powered scenarios
 */

import { spawn } from 'child_process';
import { join } from 'path';

class LMStudioServerIntegration {
    constructor() {
        this.cliPath = join(process.cwd(), 'tools', 'ai', 'lm-studio-cli.js');
        this.isAvailable = false;
        this.stats = {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            totalResponseTime: 0
        };
    }

    /**
     * Test if LM Studio CLI is available
     */
    async testAvailability() {
        try {
            const result = await this.executeCLI(['help']);
            this.isAvailable = true;
            console.log('✅ LM Studio CLI is available');
            return true;
        } catch (error) {
            this.isAvailable = false;
            console.warn('⚠️ LM Studio CLI not available:', error.message);
            return false;
        }
    }

    /**
     * Execute CLI command and return result
     */
    executeCLI(args) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            this.stats.totalCalls++;

            const child = spawn('node', [this.cliPath, ...args], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                const responseTime = Date.now() - startTime;

                if (code === 0 && stdout.trim()) {
                    try {
                        const result = JSON.parse(stdout.trim());
                        this.stats.successfulCalls++;
                        this.stats.totalResponseTime += responseTime;
                        resolve({
                            ...result,
                            responseTime,
                            cliResponseTime: responseTime
                        });
                    } catch (error) {
                        // If not JSON, treat as plain text response
                        this.stats.successfulCalls++;
                        this.stats.totalResponseTime += responseTime;
                        resolve({
                            success: true,
                            content: stdout.trim(),
                            responseTime,
                            cliResponseTime: responseTime,
                            raw: true
                        });
                    }
                } else {
                    this.stats.failedCalls++;
                    reject(new Error(stderr || `CLI exited with code ${code}`));
                }
            });

            child.on('error', (error) => {
                this.stats.failedCalls++;
                reject(error);
            });

            // Set timeout
            setTimeout(() => {
                child.kill();
                this.stats.failedCalls++;
                reject(new Error('CLI execution timeout'));
            }, 30000); // 30 second timeout
        });
    }

    /**
     * Generate dynamic game scenario
     */
    async generateScenario(prompt) {
        if (!this.isAvailable) {
            throw new Error('LM Studio CLI not available');
        }

        return await this.executeCLI(['scenario', 'gameMaster', prompt]);
    }

    /**
     * Generate NPC content
     */
    async generateNPC(prompt) {
        if (!this.isAvailable) {
            throw new Error('LM Studio CLI not available');
        }

        return await this.executeCLI(['npc', prompt]);
    }

    /**
     * Generate quest/mission
     */
    async generateQuest(prompt) {
        if (!this.isAvailable) {
            throw new Error('LM Studio CLI not available');
        }

        return await this.executeCLI(['quest', prompt]);
    }

    /**
     * Generate story content
     */
    async generateStory(prompt) {
        if (!this.isAvailable) {
            throw new Error('LM Studio CLI not available');
        }

        return await this.executeCLI(['story', prompt]);
    }

    /**
     * Generate event content
     */
    async generateEvent(prompt) {
        if (!this.isAvailable) {
            throw new Error('LM Studio CLI not available');
        }

        return await this.executeCLI(['event', prompt]);
    }

    /**
     * Get balance suggestions
     */
    async getBalanceSuggestion(prompt) {
        if (!this.isAvailable) {
            throw new Error('LM Studio CLI not available');
        }

        return await this.executeCLI(['balance', prompt]);
    }

    /**
     * Generic AI query
     */
    async queryAI(prompt) {
        if (!this.isAvailable) {
            throw new Error('LM Studio CLI not available');
        }

        return await this.executeCLI(['query', prompt]);
    }

    /**
     * Get usage statistics
     */
    getStats() {
        const avgResponseTime = this.stats.totalCalls > 0 
            ? Math.round(this.stats.totalResponseTime / this.stats.successfulCalls)
            : 0;

        return {
            ...this.stats,
            avgResponseTime,
            successRate: this.stats.totalCalls > 0 
                ? Math.round((this.stats.successfulCalls / this.stats.totalCalls) * 100)
                : 0,
            isAvailable: this.isAvailable
        };
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            totalResponseTime: 0
        };
    }

    /**
     * Get available scenarios
     */
    async getAvailableScenarios() {
        try {
            const result = await this.executeCLI(['list']);
            return result;
        } catch (error) {
            throw new Error('Failed to get scenarios: ' + error.message);
        }
    }
}

// Create singleton instance
const lmStudioIntegration = new LMStudioServerIntegration();

// Test availability on module load
lmStudioIntegration.testAvailability().catch(console.warn);

export default lmStudioIntegration; 