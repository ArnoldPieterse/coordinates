#!/usr/bin/env node

/**
 * Automated Prompt Service Runner
 * Starts and manages the automated prompt service with local LLM integration
 * Features: Queue management, performance monitoring, automatic improvements
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import AutomatedPromptService from './src/ai/AutomatedPromptService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class AutomatedPromptServiceRunner {
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
     * Start the automated prompt service
     */
    async start() {
        console.log('🚀 AUTOMATED PROMPT SERVICE RUNNER');
        console.log('==================================');
        console.log('Starting automated prompt service with local LLM...\n');

        try {
            // Initialize the service
            this.service = new AutomatedPromptService(this.config);
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Wait for service to be ready
            await this.waitForServiceReady();
            
            // Start monitoring
            this.startMonitoring();
            
            console.log('✅ Automated Prompt Service started successfully!');
            console.log('📋 Queue size maintained at:', this.config.queueSize);
            console.log('🤖 LLM URL:', this.config.llmUrl);
            console.log('📊 Performance monitoring active');
            console.log('🔧 Automatic improvements enabled\n');
            
            // Keep the service running
            this.keepAlive();
            
        } catch (error) {
            console.error('❌ Failed to start Automated Prompt Service:', error);
            process.exit(1);
        }
    }

    /**
     * Setup event listeners for the service
     */
    setupEventListeners() {
        this.service.on('service-started', () => {
            console.log('🚀 Service started');
        });

        this.service.on('prompt-added', (prompt) => {
            console.log(`📝 Prompt added: ${prompt.type} (${prompt.priority})`);
        });

        this.service.on('prompt-completed', (prompt) => {
            console.log(`✅ Prompt completed: ${prompt.type} (${prompt.responseTime}ms)`);
        });

        this.service.on('prompt-failed', (prompt) => {
            console.log(`❌ Prompt failed: ${prompt.type} - ${prompt.error}`);
        });

        this.service.on('performance-warning', (data) => {
            console.log(`⚠️ Performance warning: ${(data.successRate * 100).toFixed(2)}% success rate`);
        });

        this.service.on('performance-report', (report) => {
            this.displayPerformanceReport(report);
        });

        this.service.on('improvements-suggested', (improvements) => {
            console.log('💡 Improvements suggested:', improvements);
        });

        this.service.on('improvements-implemented', (improvements) => {
            console.log('🔧 Improvements implemented:', improvements);
        });

        this.service.on('service-stopped', () => {
            console.log('🛑 Service stopped');
        });
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
                console.log('✅ Service ready');
                console.log(`🤖 LLM Model: ${status.currentModel}`);
                console.log(`📋 Queue Size: ${status.queueSize}`);
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
     * Start monitoring the service
     */
    startMonitoring() {
        // Display status every 30 seconds
        setInterval(() => {
            this.displayStatus();
        }, 30000);
        
        // Display detailed report every 2 minutes
        setInterval(() => {
            this.displayDetailedReport();
        }, 120000);
    }

    /**
     * Display current service status
     */
    displayStatus() {
        const status = this.service.getStatus();
        
        console.log('\n📊 SERVICE STATUS');
        console.log('================');
        console.log(`Status: ${status.isRunning ? '🟢 Running' : '🔴 Stopped'}`);
        console.log(`LLM: ${status.llmStatus === 'available' ? '🟢 Available' : '🔴 Unavailable'}`);
        console.log(`Model: ${status.currentModel || 'Unknown'}`);
        console.log(`Queue: ${status.queueSize}/${this.config.queueSize}`);
        console.log(`Processing: ${status.processingSize}`);
        console.log(`Completed: ${status.completedSize}`);
        
        if (status.performance.totalPrompts > 0) {
            const successRate = (status.performance.successfulPrompts / status.performance.totalPrompts * 100).toFixed(2);
            console.log(`Success Rate: ${successRate}%`);
            console.log(`Avg Response Time: ${status.performance.averageResponseTime.toFixed(2)}ms`);
        }
    }

    /**
     * Display performance report
     */
    displayPerformanceReport(report) {
        console.log('\n📊 PERFORMANCE REPORT');
        console.log('=====================');
        console.log(`Timestamp: ${new Date(report.timestamp).toLocaleString()}`);
        console.log(`Queue Status: ${report.queueStatus.queueSize} queued, ${report.queueStatus.processingSize} processing, ${report.queueStatus.completedSize} completed`);
        console.log(`Performance: ${report.performance.totalPrompts} total, ${report.performance.successfulPrompts} successful, ${report.performance.failedPrompts} failed`);
        console.log(`Success Rate: ${(report.performance.successRate * 100).toFixed(2)}%`);
        console.log(`Average Response Time: ${report.performance.averageResponseTime.toFixed(2)}ms`);
        console.log(`LLM Status: ${report.llmStatus.status} (${report.llmStatus.model})`);
    }

    /**
     * Display detailed report
     */
    displayDetailedReport() {
        const status = this.service.getStatus();
        
        console.log('\n📋 DETAILED REPORT');
        console.log('==================');
        
        // Queue analysis
        console.log('\n📋 Queue Analysis:');
        console.log(`  Total Prompts: ${status.performance.totalPrompts}`);
        console.log(`  Current Queue: ${status.queueSize}`);
        console.log(`  Processing: ${status.processingSize}`);
        console.log(`  Completed: ${status.completedSize}`);
        
        // Performance analysis
        if (status.performance.totalPrompts > 0) {
            console.log('\n📊 Performance Analysis:');
            const successRate = (status.performance.successfulPrompts / status.performance.totalPrompts * 100).toFixed(2);
            const failureRate = (status.performance.failedPrompts / status.performance.totalPrompts * 100).toFixed(2);
            console.log(`  Success Rate: ${successRate}%`);
            console.log(`  Failure Rate: ${failureRate}%`);
            console.log(`  Average Response Time: ${status.performance.averageResponseTime.toFixed(2)}ms`);
            console.log(`  Total Response Time: ${status.performance.totalResponseTime}ms`);
        }
        
        // LLM status
        console.log('\n🤖 LLM Status:');
        console.log(`  Status: ${status.llmStatus}`);
        console.log(`  Model: ${status.currentModel}`);
        console.log(`  URL: ${status.config.llmUrl}`);
        
        // Configuration
        console.log('\n⚙️ Configuration:');
        console.log(`  Queue Size: ${status.config.queueSize}`);
        console.log(`  Max Retries: ${status.config.maxRetries}`);
        console.log(`  Timeout: ${status.config.timeout}ms`);
        console.log(`  Performance Threshold: ${(status.config.performanceThreshold * 100).toFixed(2)}%`);
    }

    /**
     * Keep the service alive
     */
    keepAlive() {
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Received SIGINT, shutting down gracefully...');
            this.stop();
        });

        process.on('SIGTERM', () => {
            console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
            this.stop();
        });

        // Keep the process running
        console.log('\n🔄 Service running... Press Ctrl+C to stop\n');
    }

    /**
     * Stop the service
     */
    async stop() {
        if (this.service) {
            this.service.stopService();
            console.log('✅ Service stopped gracefully');
        }
        process.exit(0);
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Run the service if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const runner = new AutomatedPromptServiceRunner();
    runner.start().catch(error => {
        console.error('❌ Runner failed:', error);
        process.exit(1);
    });
}

export default AutomatedPromptServiceRunner; 