#!/usr/bin/env node

/**
 * Query Automated Prompt Service
 * Check performance and status of the automated prompt service
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import AutomatedPromptService from './src/ai/AutomatedPromptService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class AutomatedServiceQuery {
    constructor() {
        this.service = null;
        this.config = {
            llmUrl: 'http://10.3.129.26:1234',
            queueSize: 5,
            maxRetries: 3,
            timeout: 30000,
            performanceThreshold: 0.8
        };
    }

    /**
     * Query the automated prompt service
     */
    async queryService() {
        console.log('🔍 QUERYING AUTOMATED PROMPT SERVICE');
        console.log('====================================');
        console.log('Checking service performance and status...\n');

        try {
            // Initialize the service
            this.service = new AutomatedPromptService(this.config);
            
            // Wait for service to be ready
            await this.waitForServiceReady();
            
            // Query service status
            await this.queryServiceStatus();
            
            // Query performance metrics
            await this.queryPerformanceMetrics();
            
            // Query LLM status
            await this.queryLLMStatus();
            
            // Query queue status
            await this.queryQueueStatus();
            
            // Generate comprehensive report
            await this.generateComprehensiveReport();
            
        } catch (error) {
            console.error('❌ Failed to query service:', error);
            process.exit(1);
        }
    }

    /**
     * Wait for service to be ready
     */
    async waitForServiceReady() {
        console.log('⏳ Waiting for service to be ready...');
        
        let attempts = 0;
        const maxAttempts = 30;
        
        while (attempts < maxAttempts) {
            const status = this.service.getStatus();
            
            if (status.isRunning && status.llmStatus === 'available') {
                console.log('✅ Service ready for querying');
                return;
            } else if (status.llmStatus === 'unavailable') {
                console.log('❌ LLM unavailable, retrying...');
            }
            
            await this.delay(2000);
            attempts++;
        }
        
        throw new Error('Service initialization timeout');
    }

    /**
     * Query service status
     */
    async queryServiceStatus() {
        console.log('\n📊 SERVICE STATUS QUERY');
        console.log('=======================');
        
        const status = this.service.getStatus();
        
        console.log(`Service Running: ${status.isRunning ? '🟢 Yes' : '🔴 No'}`);
        console.log(`LLM Status: ${status.llmStatus === 'available' ? '🟢 Available' : '🔴 Unavailable'}`);
        console.log(`Current Model: ${status.currentModel || 'Unknown'}`);
        console.log(`LLM URL: ${status.config.llmUrl}`);
        console.log(`Queue Size: ${status.queueSize}/${status.config.queueSize}`);
        console.log(`Processing: ${status.processingSize}`);
        console.log(`Completed: ${status.completedSize}`);
    }

    /**
     * Query performance metrics
     */
    async queryPerformanceMetrics() {
        console.log('\n📈 PERFORMANCE METRICS QUERY');
        console.log('=============================');
        
        const status = this.service.getStatus();
        const performance = status.performance;
        
        if (performance.totalPrompts > 0) {
            const successRate = (performance.successfulPrompts / performance.totalPrompts * 100).toFixed(2);
            const failureRate = (performance.failedPrompts / performance.totalPrompts * 100).toFixed(2);
            
            console.log(`Total Prompts: ${performance.totalPrompts}`);
            console.log(`Successful: ${performance.successfulPrompts}`);
            console.log(`Failed: ${performance.failedPrompts}`);
            console.log(`Success Rate: ${successRate}%`);
            console.log(`Failure Rate: ${failureRate}%`);
            console.log(`Average Response Time: ${performance.averageResponseTime.toFixed(2)}ms`);
            console.log(`Total Response Time: ${performance.totalResponseTime}ms`);
            
            // Performance assessment
            if (successRate >= 90) {
                console.log('🎯 Performance: 🟢 Excellent (>90% success rate)');
            } else if (successRate >= 80) {
                console.log('🎯 Performance: 🟡 Good (80-90% success rate)');
            } else {
                console.log('🎯 Performance: 🔴 Needs Improvement (<80% success rate)');
            }
            
            if (performance.averageResponseTime < 15000) {
                console.log('⚡ Speed: 🟢 Fast (<15s average)');
            } else if (performance.averageResponseTime < 30000) {
                console.log('⚡ Speed: 🟡 Acceptable (15-30s average)');
            } else {
                console.log('⚡ Speed: 🔴 Slow (>30s average)');
            }
        } else {
            console.log('📊 No performance data available yet');
        }
    }

    /**
     * Query LLM status
     */
    async queryLLMStatus() {
        console.log('\n🤖 LLM STATUS QUERY');
        console.log('===================');
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(`${this.config.llmUrl}/models`, {
                method: 'GET',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const models = await response.json();
                console.log(`🟢 LLM Available at ${this.config.llmUrl}`);
                console.log(`📋 Available Models: ${models.data?.length || 0}`);
                
                if (models.data && models.data.length > 0) {
                    console.log('📝 Model Details:');
                    models.data.forEach((model, index) => {
                        console.log(`  ${index + 1}. ${model.id} (${model.object})`);
                    });
                }
            } else {
                console.log(`🔴 LLM Error: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.log(`🔴 LLM Unavailable: ${error.message}`);
        }
    }

    /**
     * Query queue status
     */
    async queryQueueStatus() {
        console.log('\n📋 QUEUE STATUS QUERY');
        console.log('=====================');
        
        const status = this.service.getStatus();
        
        console.log(`Queue Size: ${status.queueSize}/${status.config.queueSize}`);
        console.log(`Processing: ${status.processingSize}`);
        console.log(`Completed: ${status.completedSize}`);
        
        // Queue utilization
        const utilization = (status.queueSize / status.config.queueSize * 100).toFixed(2);
        console.log(`Queue Utilization: ${utilization}%`);
        
        if (utilization >= 80) {
            console.log('📊 Queue Status: 🟢 Well Utilized (>80%)');
        } else if (utilization >= 50) {
            console.log('📊 Queue Status: 🟡 Moderate Utilization (50-80%)');
        } else {
            console.log('📊 Queue Status: 🔴 Low Utilization (<50%)');
        }
    }

    /**
     * Generate comprehensive report
     */
    async generateComprehensiveReport() {
        console.log('\n📋 COMPREHENSIVE SERVICE REPORT');
        console.log('===============================');
        
        const status = this.service.getStatus();
        const performance = status.performance;
        
        // Overall health score
        let healthScore = 0;
        let healthFactors = [];
        
        // Service running
        if (status.isRunning) {
            healthScore += 25;
            healthFactors.push('✅ Service Running');
        } else {
            healthFactors.push('❌ Service Not Running');
        }
        
        // LLM available
        if (status.llmStatus === 'available') {
            healthScore += 25;
            healthFactors.push('✅ LLM Available');
        } else {
            healthFactors.push('❌ LLM Unavailable');
        }
        
        // Queue utilization
        const utilization = status.queueSize / status.config.queueSize;
        if (utilization >= 0.8) {
            healthScore += 25;
            healthFactors.push('✅ Good Queue Utilization');
        } else if (utilization >= 0.5) {
            healthScore += 15;
            healthFactors.push('🟡 Moderate Queue Utilization');
        } else {
            healthFactors.push('❌ Low Queue Utilization');
        }
        
        // Performance
        if (performance.totalPrompts > 0) {
            const successRate = performance.successfulPrompts / performance.totalPrompts;
            if (successRate >= 0.9) {
                healthScore += 25;
                healthFactors.push('✅ Excellent Performance');
            } else if (successRate >= 0.8) {
                healthScore += 15;
                healthFactors.push('🟡 Good Performance');
            } else {
                healthFactors.push('❌ Poor Performance');
            }
        } else {
            healthFactors.push('🟡 No Performance Data Yet');
        }
        
        // Health assessment
        console.log(`🏥 Overall Health Score: ${healthScore}/100`);
        
        if (healthScore >= 90) {
            console.log('🎯 Health Status: 🟢 Excellent');
        } else if (healthScore >= 75) {
            console.log('🎯 Health Status: 🟡 Good');
        } else if (healthScore >= 50) {
            console.log('🎯 Health Status: 🟠 Fair');
        } else {
            console.log('🎯 Health Status: 🔴 Poor');
        }
        
        console.log('\n📊 Health Factors:');
        healthFactors.forEach(factor => console.log(`  ${factor}`));
        
        // Recommendations
        console.log('\n💡 Recommendations:');
        if (healthScore < 90) {
            if (!status.isRunning) {
                console.log('  - Start the automated prompt service');
            }
            if (status.llmStatus !== 'available') {
                console.log('  - Check LLM availability at http://10.3.129.26:1234');
            }
            if (utilization < 0.8) {
                console.log('  - Increase prompt generation to improve queue utilization');
            }
            if (performance.totalPrompts > 0 && performance.successfulPrompts / performance.totalPrompts < 0.9) {
                console.log('  - Investigate and fix prompt failures');
            }
        } else {
            console.log('  - Service is performing excellently!');
            console.log('  - Consider scaling up for higher throughput');
        }
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Run the query if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const query = new AutomatedServiceQuery();
    query.queryService().catch(error => {
        console.error('❌ Query failed:', error);
        process.exit(1);
    });
}

export default AutomatedServiceQuery; 