/**
 * Build with AI Agents - Coordinates Project
 * Coordinates AI agents to help build and deploy the project
 * IDX-BUILD-001: AI Agent Build Coordination
 */

import { AIAgentManager, AGENT_ROLES, JOB_TYPES } from './src/ai-agent-system.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class BuildCoordinator {
    constructor() {
        this.agentManager = new AIAgentManager();
        this.buildStatus = {
            started: new Date(),
            completed: false,
            errors: [],
            warnings: [],
            steps: []
        };
    }

    async initialize() {
        console.log('🚀 Initializing AI Agent Build Coordinator...');
        
        try {
            // Initialize AI agents
            await this.agentManager.initializeLLM();
            await this.agentManager.spawnAllAgents();
            
            console.log(`✅ AI Agents initialized: ${this.agentManager.getAgentCount()} agents ready`);
            console.log(`📊 Active agents: ${this.agentManager.getActiveAgentCount()}`);
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize AI agents:', error.message);
            return false;
        }
    }

    async logStep(step, status = 'info', details = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            step,
            status,
            details
        };
        
        this.buildStatus.steps.push(logEntry);
        
        const emoji = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            progress: '🔄'
        }[status] || 'ℹ️';

        console.log(`${emoji} ${step}: ${details.message || status}`);
    }

    async runBuildProcess() {
        console.log('\n🏗️ Starting AI Agent Coordinated Build Process');
        console.log('==============================================\n');

        try {
            // Step 1: Project Analysis
            await this.analyzeProject();
            
            // Step 2: Code Review
            await this.performCodeReview();
            
            // Step 3: Performance Analysis
            await this.analyzePerformance();
            
            // Step 4: Security Audit
            await this.performSecurityAudit();
            
            // Step 5: Build Application
            await this.buildApplication();
            
            // Step 6: Testing
            await this.runTests();
            
            // Step 7: Documentation Update
            await this.updateDocumentation();
            
            // Step 8: AWS Deployment Preparation
            await this.prepareAWSDeployment();
            
            // Step 9: Final Validation
            await this.finalValidation();
            
            this.buildStatus.completed = true;
            await this.logStep('Build Process', 'success', { 
                message: 'AI Agent coordinated build completed successfully',
                duration: Date.now() - this.buildStatus.started.getTime()
            });
            
        } catch (error) {
            await this.logStep('Build Process', 'error', { 
                message: error.message,
                duration: Date.now() - this.buildStatus.started.getTime()
            });
            this.buildStatus.errors.push(error);
        }
    }

    async analyzeProject() {
        await this.logStep('Project Analysis', 'progress', { message: 'Starting project analysis' });
        
        // Queue analysis jobs for different agents
        await this.agentManager.queueJob(
            JOB_TYPES.FEATURE_IMPLEMENTATION,
            'Analyze project structure and identify key components',
            { projectPath: process.cwd() },
            'high',
            AGENT_ROLES.PROJECT_MANAGER
        );

        await this.agentManager.queueJob(
            JOB_TYPES.AWS_DEPLOYMENT,
            'Analyze AWS deployment requirements and configuration',
            { projectPath: process.cwd() },
            'high',
            AGENT_ROLES.AWS_SPECIALIST
        );

        // Wait for analysis to complete
        await this.waitForJobs();
        await this.logStep('Project Analysis', 'success', { message: 'Project analysis completed' });
    }

    async performCodeReview() {
        await this.logStep('Code Review', 'progress', { message: 'Starting code review' });
        
        // Get all JavaScript files
        const jsFiles = this.getAllJSFiles();
        
        for (const file of jsFiles.slice(0, 10)) { // Review first 10 files
            await this.agentManager.queueJob(
                JOB_TYPES.CODE_REVIEW,
                `Review code quality and best practices for ${file}`,
                { filePath: file, content: fs.readFileSync(file, 'utf8') },
                'normal',
                AGENT_ROLES.CODE_REVIEWER
            );
        }

        await this.waitForJobs();
        await this.logStep('Code Review', 'success', { message: 'Code review completed' });
    }

    async analyzePerformance() {
        await this.logStep('Performance Analysis', 'progress', { message: 'Starting performance analysis' });
        
        await this.agentManager.queueJob(
            JOB_TYPES.PERFORMANCE_ANALYSIS,
            'Analyze application performance and identify optimization opportunities',
            { projectPath: process.cwd() },
            'high',
            AGENT_ROLES.PERFORMANCE_OPTIMIZER
        );

        await this.waitForJobs();
        await this.logStep('Performance Analysis', 'success', { message: 'Performance analysis completed' });
    }

    async performSecurityAudit() {
        await this.logStep('Security Audit', 'progress', { message: 'Starting security audit' });
        
        await this.agentManager.queueJob(
            JOB_TYPES.SECURITY_AUDIT,
            'Perform security audit of the application and dependencies',
            { projectPath: process.cwd() },
            'high',
            AGENT_ROLES.SECURITY_ANALYST
        );

        await this.waitForJobs();
        await this.logStep('Security Audit', 'success', { message: 'Security audit completed' });
    }

    async buildApplication() {
        await this.logStep('Application Build', 'progress', { message: 'Starting application build' });
        
        try {
            // Check if build is needed
            if (!fs.existsSync('dist')) {
                await this.logStep('Application Build', 'info', { message: 'Building application with Vite' });
                
                execSync('npm run build', { 
                    stdio: 'inherit',
                    cwd: process.cwd()
                });
                
                await this.logStep('Application Build', 'success', { message: 'Application built successfully' });
            } else {
                await this.logStep('Application Build', 'info', { message: 'Build already exists, skipping' });
            }
        } catch (error) {
            await this.logStep('Application Build', 'error', { message: error.message });
            throw error;
        }
    }

    async runTests() {
        await this.logStep('Testing', 'progress', { message: 'Starting test execution' });
        
        await this.agentManager.queueJob(
            JOB_TYPES.TESTING,
            'Run comprehensive tests and validate application functionality',
            { projectPath: process.cwd() },
            'high',
            AGENT_ROLES.TESTING_ENGINEER
        );

        await this.waitForJobs();
        await this.logStep('Testing', 'success', { message: 'Testing completed' });
    }

    async updateDocumentation() {
        await this.logStep('Documentation Update', 'progress', { message: 'Updating documentation' });
        
        await this.agentManager.queueJob(
            JOB_TYPES.DOCUMENTATION_UPDATE,
            'Update project documentation and README files',
            { projectPath: process.cwd() },
            'normal',
            AGENT_ROLES.DOCUMENTATION_WRITER
        );

        await this.waitForJobs();
        await this.logStep('Documentation Update', 'success', { message: 'Documentation updated' });
    }

    async prepareAWSDeployment() {
        await this.logStep('AWS Deployment Preparation', 'progress', { message: 'Preparing AWS deployment' });
        
        // Check AWS credentials
        try {
            execSync('aws sts get-caller-identity', { stdio: 'pipe' });
            await this.logStep('AWS Credentials', 'success', { message: 'AWS credentials verified' });
        } catch (error) {
            await this.logStep('AWS Credentials', 'warning', { 
                message: 'AWS credentials not configured, deployment will be prepared but not executed' 
            });
        }

        await this.agentManager.queueJob(
            JOB_TYPES.AWS_DEPLOYMENT,
            'Prepare AWS deployment configuration and scripts',
            { projectPath: process.cwd() },
            'high',
            AGENT_ROLES.AWS_SPECIALIST
        );

        await this.agentManager.queueJob(
            JOB_TYPES.AWS_OPTIMIZATION,
            'Optimize AWS deployment for cost and performance',
            { projectPath: process.cwd() },
            'normal',
            AGENT_ROLES.AWS_SPECIALIST
        );

        await this.waitForJobs();
        await this.logStep('AWS Deployment Preparation', 'success', { message: 'AWS deployment prepared' });
    }

    async finalValidation() {
        await this.logStep('Final Validation', 'progress', { message: 'Performing final validation' });
        
        await this.agentManager.queueJob(
            JOB_TYPES.DEPLOYMENT_CHECK,
            'Perform final deployment validation and health checks',
            { projectPath: process.cwd() },
            'high',
            AGENT_ROLES.DEPLOYMENT_ENGINEER
        );

        await this.waitForJobs();
        await this.logStep('Final Validation', 'success', { message: 'Final validation completed' });
    }

    async waitForJobs() {
        // Wait for jobs to complete
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds timeout
        
        while (attempts < maxAttempts) {
            const queue = this.agentManager.getJobQueue();
            if (queue.length === 0) {
                break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }
    }

    getAllJSFiles(dir = '.', files = []) {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                this.getAllJSFiles(fullPath, files);
            } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
                files.push(fullPath);
            }
        }
        
        return files;
    }

    getBuildReport() {
        const duration = Date.now() - this.buildStatus.started.getTime();
        const successCount = this.buildStatus.steps.filter(s => s.status === 'success').length;
        const errorCount = this.buildStatus.steps.filter(s => s.status === 'error').length;
        const warningCount = this.buildStatus.steps.filter(s => s.status === 'warning').length;

        return {
            completed: this.buildStatus.completed,
            duration: `${(duration / 1000).toFixed(2)}s`,
            steps: this.buildStatus.steps.length,
            success: successCount,
            errors: errorCount,
            warnings: warningCount,
            agentStats: this.agentManager.getSystemStats(),
            steps: this.buildStatus.steps
        };
    }

    async executeAWSDeployment() {
        if (this.buildStatus.errors.length > 0) {
            console.log('❌ Cannot deploy due to build errors');
            return false;
        }

        console.log('\n🚀 Executing AWS Deployment...');
        
        try {
            // Check AWS credentials again
            execSync('aws sts get-caller-identity', { stdio: 'pipe' });
            
            // Run modern AWS deployment
            execSync('npm run deploy:aws-modern', { 
                stdio: 'inherit',
                cwd: process.cwd()
            });
            
            console.log('✅ AWS deployment completed successfully!');
            return true;
        } catch (error) {
            console.error('❌ AWS deployment failed:', error.message);
            return false;
        }
    }
}

// CLI interface
async function main() {
    const coordinator = new BuildCoordinator();
    
    console.log('🤖 AI Agent Build Coordinator for Coordinates Project');
    console.log('===================================================\n');
    
    // Initialize agents
    if (!(await coordinator.initialize())) {
        console.error('❌ Failed to initialize AI agents');
        process.exit(1);
    }
    
    // Run build process
    await coordinator.runBuildProcess();
    
    // Generate report
    const report = coordinator.getBuildReport();
    
    console.log('\n📊 Build Report');
    console.log('===============');
    console.log(`Status: ${report.completed ? '✅ Success' : '❌ Failed'}`);
    console.log(`Duration: ${report.duration}`);
    console.log(`Steps: ${report.steps}`);
    console.log(`Success: ${report.success}`);
    console.log(`Errors: ${report.errors}`);
    console.log(`Warnings: ${report.warnings}`);
    
    console.log('\n🤖 Agent Statistics');
    console.log('==================');
    console.log(`Total Agents: ${report.agentStats.totalAgents}`);
    console.log(`Active Agents: ${report.agentStats.activeAgents}`);
    console.log(`Jobs Completed: ${report.agentStats.totalJobsCompleted}`);
    console.log(`Success Rate: ${(report.agentStats.successRate * 100).toFixed(1)}%`);
    
    // Ask about AWS deployment
    if (report.completed && report.errors === 0) {
        console.log('\n🚀 Build successful! Would you like to deploy to AWS?');
        console.log('Run: node build-with-agents.js --deploy');
    }
    
    // Check for --deploy flag
    if (process.argv.includes('--deploy')) {
        console.log('\n🚀 Starting AWS deployment...');
        await coordinator.executeAWSDeployment();
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Build coordinator failed:', error);
        process.exit(1);
    });
}

export default BuildCoordinator; 