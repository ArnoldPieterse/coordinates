/**
 * Coordinates - AI Agent System
 * Manages specialized AI agents with role-based job queuing
 * IDX-AI-001: AI Agent System Implementation
 * IDX-AI-002: Agent Memory System
 * IDX-AI-003: Enhanced Agent Capabilities
 * IDX-AI-004: Job Management and Queuing
 * 
 * For index reference format, see INDEX_DESCRIBER.md
 */

import { MathematicalAI } from './mathematical-ai.js';
import { ComfyUIIntegration } from './comfyui-integration.js';

// ===== AGENT ROLES =====
// IDX-AI-005: Agent Role Definitions
export const AGENT_ROLES = {
    PROJECT_MANAGER: 'project_manager',
    CODE_REVIEWER: 'code_reviewer',
    PERFORMANCE_OPTIMIZER: 'performance_optimizer',
    AI_SYSTEMS_ENGINEER: 'ai_systems_engineer',
    GAMEPLAY_DESIGNER: 'gameplay_designer',
    GRAPHICS_ARTIST: 'graphics_artist',
    TESTING_ENGINEER: 'testing_engineer',
    DOCUMENTATION_WRITER: 'documentation_writer',
    SECURITY_ANALYST: 'security_analyst',
    DEPLOYMENT_ENGINEER: 'deployment_engineer',
    // New specialized agents
    MANAGER_AGENT: 'manager_agent',
    AWS_SPECIALIST: 'aws_specialist',
    SALES_TEAM: 'sales_team',
    MESSENGER: 'messenger',
    CREATIVE_SPAWNER: 'creative_spawner'
};

// ===== JOB TYPES =====
// IDX-AI-006: Job Type Definitions
export const JOB_TYPES = {
    CODE_REVIEW: 'code_review',
    PERFORMANCE_ANALYSIS: 'performance_analysis',
    AI_MODEL_TRAINING: 'ai_model_training',
    TEXTURE_GENERATION: 'texture_generation',
    BUG_FIX: 'bug_fix',
    FEATURE_IMPLEMENTATION: 'feature_implementation',
    DOCUMENTATION_UPDATE: 'documentation_update',
    SECURITY_AUDIT: 'security_audit',
    DEPLOYMENT_CHECK: 'deployment_check',
    TESTING: 'testing',
    // New job types
    AGENT_MANAGEMENT: 'agent_management',
    PROMPT_OPTIMIZATION: 'prompt_optimization',
    AGENT_EVALUATION: 'agent_evaluation',
    AWS_DEPLOYMENT: 'aws_deployment',
    AWS_OPTIMIZATION: 'aws_optimization',
    SALES_ANALYSIS: 'sales_analysis',
    MARKETING_STRATEGY: 'marketing_strategy',
    COMMUNICATION_ROUTING: 'communication_routing',
    CREATIVE_GENERATION: 'creative_generation',
    MEMORY_MANAGEMENT: 'memory_management'
};

// ===== AGENT MEMORY SYSTEM =====
// IDX-AI-007: Memory Management Implementation
class AgentMemory {
    constructor(agentId) {
        this.agentId = agentId;
        this.shortTerm = new Map(); // Recent interactions and context
        this.longTerm = new Map(); // Persistent knowledge and patterns
        this.performance = []; // Historical performance data
        this.prompts = []; // Successful prompts and their outcomes
        this.maxShortTermSize = 100;
        this.maxLongTermSize = 1000;
    }

    addShortTerm(key, value) {
        this.shortTerm.set(key, {
            value,
            timestamp: Date.now(),
            accessCount: 0
        });
        
        // Cleanup old entries
        if (this.shortTerm.size > this.maxShortTermSize) {
            const oldestKey = Array.from(this.shortTerm.entries())
                .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
            this.shortTerm.delete(oldestKey);
        }
    }

    addLongTerm(key, value) {
        this.longTerm.set(key, {
            value,
            timestamp: Date.now(),
            accessCount: 0,
            importance: 1.0
        });
        
        // Cleanup least important entries
        if (this.longTerm.size > this.maxLongTermSize) {
            const leastImportantKey = Array.from(this.longTerm.entries())
                .sort((a, b) => a[1].importance - b[1].importance)[0][0];
            this.longTerm.delete(leastImportantKey);
        }
    }

    getShortTerm(key) {
        const entry = this.shortTerm.get(key);
        if (entry) {
            entry.accessCount++;
            return entry.value;
        }
        return null;
    }

    getLongTerm(key) {
        const entry = this.longTerm.get(key);
        if (entry) {
            entry.accessCount++;
            return entry.value;
        }
        return null;
    }

    addPerformance(performance) {
        this.performance.push({
            ...performance,
            timestamp: Date.now()
        });
        
        // Keep only recent performance data
        if (this.performance.length > 100) {
            this.performance = this.performance.slice(-100);
        }
    }

    addPrompt(prompt, outcome) {
        this.prompts.push({
            prompt,
            outcome,
            timestamp: Date.now(),
            success: outcome.success || false
        });
        
        // Keep only recent prompts
        if (this.prompts.length > 50) {
            this.prompts = this.prompts.slice(-50);
        }
    }

    getContext() {
        return {
            shortTerm: Object.fromEntries(this.shortTerm),
            longTerm: Object.fromEntries(this.longTerm),
            recentPerformance: this.performance.slice(-10),
            successfulPrompts: this.prompts.filter(p => p.success).slice(-5)
        };
    }

    clearShortTerm() {
        this.shortTerm.clear();
    }
}

// ===== AGENT CLASS =====
class AIAgent {
    constructor(id, role, capabilities) {
        this.id = id;
        this.role = role;
        this.capabilities = capabilities;
        this.status = 'idle'; // idle, busy, offline
        this.currentJob = null;
        this.jobQueue = [];
        this.stats = {
            jobsCompleted: 0,
            jobsFailed: 0,
            totalWorkTime: 0,
            averageJobTime: 0,
            successRate: 1.0,
            rating: 5.0 // Agent rating (1-10)
        };
        this.neuralNetwork = new MathematicalAI();
        this.comfyUI = new ComfyUIIntegration();
        this.memory = new AgentMemory(id);
        this.prompts = this.getDefaultPrompts();
        this.lastUpdate = Date.now();
        
        // Initialize agent-specific neural network
        this.initializeNeuralNetwork();
    }

    getDefaultPrompts() {
        const defaultPrompts = {
            [AGENT_ROLES.MANAGER_AGENT]: [
                "Analyze the current project status and identify priority areas for improvement",
                "Evaluate agent performance and suggest optimizations",
                "Create and prioritize job queue based on project needs",
                "Generate prompts for other agents based on their roles and current tasks"
            ],
            [AGENT_ROLES.AWS_SPECIALIST]: [
                "Analyze AWS infrastructure and suggest cost optimizations",
                "Design scalable deployment strategies for the game",
                "Monitor AWS services and identify performance bottlenecks",
                "Implement security best practices for cloud deployment"
            ],
            [AGENT_ROLES.SALES_TEAM]: [
                "Analyze market trends and identify target audiences",
                "Develop pricing strategies and revenue optimization",
                "Create marketing campaigns and promotional materials",
                "Track sales metrics and customer feedback"
            ],
            [AGENT_ROLES.MESSENGER]: [
                "Route communications between agents efficiently",
                "Maintain communication logs and ensure message delivery",
                "Prioritize urgent messages and coordinate responses",
                "Facilitate agent collaboration and information sharing"
            ],
            [AGENT_ROLES.CREATIVE_SPAWNER]: [
                "Generate creative ideas and concepts for the game",
                "Evaluate creative proposals and provide feedback",
                "Spawn temporary creative agents for specific tasks",
                "Manage creative workflow and quality control"
            ]
        };
        
        return defaultPrompts[this.role] || [
            "Perform your assigned role efficiently and effectively",
            "Provide regular updates on your progress and findings",
            "Collaborate with other agents when needed",
            "Maintain high quality standards in your work"
        ];
    }

    async initializeNeuralNetwork() {
        // Configure neural network based on role
        const roleConfig = this.getRoleConfiguration();
        await this.neuralNetwork.initialize(roleConfig);
        
        console.log(`🤖 Agent ${this.id} (${this.role}) initialized with neural network`);
    }

    getRoleConfiguration() {
        const configs = {
            [AGENT_ROLES.PROJECT_MANAGER]: {
                inputs: 8,
                hiddenLayers: [12, 8],
                learningRate: 0.01,
                focus: 'project_coordination'
            },
            [AGENT_ROLES.CODE_REVIEWER]: {
                inputs: 8,
                hiddenLayers: [16, 12],
                learningRate: 0.005,
                focus: 'code_quality'
            },
            [AGENT_ROLES.PERFORMANCE_OPTIMIZER]: {
                inputs: 8,
                hiddenLayers: [14, 10],
                learningRate: 0.008,
                focus: 'performance_metrics'
            },
            [AGENT_ROLES.AI_SYSTEMS_ENGINEER]: {
                inputs: 8,
                hiddenLayers: [20, 16, 12],
                learningRate: 0.003,
                focus: 'ai_optimization'
            },
            [AGENT_ROLES.GAMEPLAY_DESIGNER]: {
                inputs: 8,
                hiddenLayers: [12, 8],
                learningRate: 0.01,
                focus: 'gameplay_balance'
            },
            [AGENT_ROLES.GRAPHICS_ARTIST]: {
                inputs: 8,
                hiddenLayers: [10, 6],
                learningRate: 0.015,
                focus: 'visual_quality'
            },
            [AGENT_ROLES.TESTING_ENGINEER]: {
                inputs: 8,
                hiddenLayers: [12, 8],
                learningRate: 0.01,
                focus: 'test_coverage'
            },
            [AGENT_ROLES.DOCUMENTATION_WRITER]: {
                inputs: 8,
                hiddenLayers: [8, 6],
                learningRate: 0.02,
                focus: 'documentation_quality'
            },
            [AGENT_ROLES.SECURITY_ANALYST]: {
                inputs: 8,
                hiddenLayers: [16, 12],
                learningRate: 0.005,
                focus: 'security_analysis'
            },
            [AGENT_ROLES.DEPLOYMENT_ENGINEER]: {
                inputs: 8,
                hiddenLayers: [10, 8],
                learningRate: 0.01,
                focus: 'deployment_reliability'
            },
            [AGENT_ROLES.MANAGER_AGENT]: {
                inputs: 12,
                hiddenLayers: [24, 16, 12],
                learningRate: 0.002,
                focus: 'agent_management'
            },
            [AGENT_ROLES.AWS_SPECIALIST]: {
                inputs: 10,
                hiddenLayers: [18, 14, 10],
                learningRate: 0.005,
                focus: 'aws_optimization'
            },
            [AGENT_ROLES.SALES_TEAM]: {
                inputs: 8,
                hiddenLayers: [14, 10],
                learningRate: 0.01,
                focus: 'sales_optimization'
            },
            [AGENT_ROLES.MESSENGER]: {
                inputs: 6,
                hiddenLayers: [12, 8],
                learningRate: 0.015,
                focus: 'communication_routing'
            },
            [AGENT_ROLES.CREATIVE_SPAWNER]: {
                inputs: 10,
                hiddenLayers: [16, 12, 8],
                learningRate: 0.008,
                focus: 'creative_generation'
            }
        };
        
        return configs[this.role] || configs[AGENT_ROLES.PROJECT_MANAGER];
    }

    async addJob(job) {
        this.jobQueue.push(job);
        console.log(`📋 Job ${job.id} added to ${this.role} agent queue`);
        
        if (this.status === 'idle') {
            this.processNextJob();
        }
    }

    async processNextJob() {
        if (this.jobQueue.length === 0 || this.status === 'busy') {
            return;
        }

        this.status = 'busy';
        const job = this.jobQueue.shift();
        this.currentJob = job;
        
        console.log(`🔄 Agent ${this.id} starting job: ${job.type} - ${job.description}`);
        
        const startTime = Date.now();
        
        try {
            const result = await this.executeJob(job);
            job.status = 'completed';
            job.result = result;
            job.completedAt = new Date();
            
            this.stats.jobsCompleted++;
            this.stats.totalWorkTime += Date.now() - startTime;
            this.stats.averageJobTime = this.stats.totalWorkTime / this.stats.jobsCompleted;
            this.stats.successRate = this.stats.jobsCompleted / (this.stats.jobsCompleted + this.stats.jobsFailed);
            
            // Update memory with successful job
            this.memory.addShortTerm(`job_${job.id}`, { job, result, success: true });
            this.memory.addPerformance({ jobType: job.type, success: true, duration: Date.now() - startTime });
            
            console.log(`✅ Job ${job.id} completed successfully by ${this.role} agent`);
            
        } catch (error) {
            job.status = 'failed';
            job.error = error.message;
            job.failedAt = new Date();
            
            this.stats.jobsFailed++;
            this.stats.successRate = this.stats.jobsCompleted / (this.stats.jobsCompleted + this.stats.jobsFailed);
            
            // Update memory with failed job
            this.memory.addShortTerm(`job_${job.id}`, { job, error: error.message, success: false });
            this.memory.addPerformance({ jobType: job.type, success: false, duration: Date.now() - startTime });
            
            console.error(`❌ Job ${job.id} failed: ${error.message}`);
        }
        
        this.currentJob = null;
        this.status = 'idle';
        
        // Process next job if available
        if (this.jobQueue.length > 0) {
            setTimeout(() => this.processNextJob(), 100);
        }
    }

    async executeJob(job) {
        const jobHandlers = {
            [JOB_TYPES.CODE_REVIEW]: () => this.handleCodeReview(job),
            [JOB_TYPES.PERFORMANCE_ANALYSIS]: () => this.handlePerformanceAnalysis(job),
            [JOB_TYPES.AI_MODEL_TRAINING]: () => this.handleAIModelTraining(job),
            [JOB_TYPES.TEXTURE_GENERATION]: () => this.handleTextureGeneration(job),
            [JOB_TYPES.BUG_FIX]: () => this.handleBugFix(job),
            [JOB_TYPES.FEATURE_IMPLEMENTATION]: () => this.handleFeatureImplementation(job),
            [JOB_TYPES.DOCUMENTATION_UPDATE]: () => this.handleDocumentationUpdate(job),
            [JOB_TYPES.SECURITY_AUDIT]: () => this.handleSecurityAudit(job),
            [JOB_TYPES.DEPLOYMENT_CHECK]: () => this.handleDeploymentCheck(job),
            [JOB_TYPES.TESTING]: () => this.handleTesting(job),
            [JOB_TYPES.AGENT_MANAGEMENT]: () => this.handleAgentManagement(job),
            [JOB_TYPES.PROMPT_OPTIMIZATION]: () => this.handlePromptOptimization(job),
            [JOB_TYPES.AGENT_EVALUATION]: () => this.handleAgentEvaluation(job),
            [JOB_TYPES.AWS_DEPLOYMENT]: () => this.handleAWSDeployment(job),
            [JOB_TYPES.AWS_OPTIMIZATION]: () => this.handleAWSOptimization(job),
            [JOB_TYPES.SALES_ANALYSIS]: () => this.handleSalesAnalysis(job),
            [JOB_TYPES.MARKETING_STRATEGY]: () => this.handleMarketingStrategy(job),
            [JOB_TYPES.COMMUNICATION_ROUTING]: () => this.handleCommunicationRouting(job),
            [JOB_TYPES.CREATIVE_GENERATION]: () => this.handleCreativeGeneration(job),
            [JOB_TYPES.MEMORY_MANAGEMENT]: () => this.handleMemoryManagement(job)
        };
        
        const handler = jobHandlers[job.type];
        if (!handler) {
            throw new Error(`Unknown job type: ${job.type}`);
        }
        
        return await handler();
    }

    // ===== JOB HANDLERS =====
    async handleCodeReview(job) {
        const { filePath, code } = job.data;
        
        // Analyze code quality using neural network
        const analysis = await this.neuralNetwork.analyze({
            type: 'code_review',
            filePath,
            code,
            role: this.role
        });
        
        return {
            quality: analysis.quality,
            issues: analysis.issues,
            suggestions: analysis.suggestions,
            complexity: analysis.complexity
        };
    }

    async handlePerformanceAnalysis(job) {
        const { metrics, target } = job.data;
        
        const analysis = await this.neuralNetwork.analyze({
            type: 'performance_analysis',
            metrics,
            target,
            role: this.role
        });
        
        return {
            bottlenecks: analysis.bottlenecks,
            optimizations: analysis.optimizations,
            recommendations: analysis.recommendations
        };
    }

    async handleAIModelTraining(job) {
        const { modelType, trainingData, parameters } = job.data;
        
        const result = await this.neuralNetwork.train({
            modelType,
            trainingData,
            parameters,
            role: this.role
        });
        
        return {
            accuracy: result.accuracy,
            loss: result.loss,
            modelPath: result.modelPath
        };
    }

    async handleTextureGeneration(job) {
        const { textureType, parameters, style } = job.data;
        
        const texture = await this.comfyUI.generateTexture({
            type: textureType,
            parameters,
            style,
            role: this.role
        });
        
        return {
            texturePath: texture.path,
            resolution: texture.resolution,
            format: texture.format
        };
    }

    async handleBugFix(job) {
        const { bugReport, affectedFiles } = job.data;
        
        const fix = await this.neuralNetwork.analyze({
            type: 'bug_fix',
            bugReport,
            affectedFiles,
            role: this.role
        });
        
        return {
            fix: fix.solution,
            files: fix.files,
            tests: fix.tests
        };
    }

    async handleFeatureImplementation(job) {
        const { feature, requirements } = job.data;
        
        const implementation = await this.neuralNetwork.analyze({
            type: 'feature_implementation',
            feature,
            requirements,
            role: this.role
        });
        
        return {
            code: implementation.code,
            tests: implementation.tests,
            documentation: implementation.documentation
        };
    }

    async handleDocumentationUpdate(job) {
        const { section, content } = job.data;
        
        const update = await this.neuralNetwork.analyze({
            type: 'documentation_update',
            section,
            content,
            role: this.role
        });
        
        return {
            updatedContent: update.content,
            structure: update.structure,
            completeness: update.completeness
        };
    }

    async handleSecurityAudit(job) {
        const { code, dependencies } = job.data;
        
        const audit = await this.neuralNetwork.analyze({
            type: 'security_audit',
            code,
            dependencies,
            role: this.role
        });
        
        return {
            vulnerabilities: audit.vulnerabilities,
            recommendations: audit.recommendations,
            riskLevel: audit.riskLevel
        };
    }

    async handleDeploymentCheck(job) {
        const { environment, configuration } = job.data;
        
        const check = await this.neuralNetwork.analyze({
            type: 'deployment_check',
            environment,
            configuration,
            role: this.role
        });
        
        return {
            status: check.status,
            issues: check.issues,
            readiness: check.readiness
        };
    }

    async handleTesting(job) {
        const { testType, target } = job.data;
        
        const test = await this.neuralNetwork.analyze({
            type: 'testing',
            testType,
            target,
            role: this.role
        });
        
        return {
            coverage: test.coverage,
            results: test.results,
            recommendations: test.recommendations
        };
    }

    // ===== NEW JOB HANDLERS =====
    async handleAgentManagement(job) {
        const { action, targetAgent, data } = job.data;
        
        const result = await this.neuralNetwork.analyze({
            type: 'agent_management',
            action,
            targetAgent,
            data,
            role: this.role,
            context: this.memory.getContext()
        });
        
        return {
            action: result.action,
            recommendations: result.recommendations,
            priority: result.priority,
            estimatedImpact: result.estimatedImpact
        };
    }

    async handlePromptOptimization(job) {
        const { targetAgent, currentPrompt, performance } = job.data;
        
        const result = await this.neuralNetwork.analyze({
            type: 'prompt_optimization',
            targetAgent,
            currentPrompt,
            performance,
            role: this.role,
            context: this.memory.getContext()
        });
        
        // Store optimized prompt
        this.memory.addPrompt(result.optimizedPrompt, { success: true });
        
        return {
            optimizedPrompt: result.optimizedPrompt,
            improvements: result.improvements,
            expectedPerformance: result.expectedPerformance
        };
    }

    async handleAgentEvaluation(job) {
        const { targetAgent, criteria, metrics } = job.data;
        
        const result = await this.neuralNetwork.analyze({
            type: 'agent_evaluation',
            targetAgent,
            criteria,
            metrics,
            role: this.role,
            context: this.memory.getContext()
        });
        
        return {
            rating: result.rating,
            strengths: result.strengths,
            weaknesses: result.weaknesses,
            recommendations: result.recommendations
        };
    }

    async handleAWSDeployment(job) {
        const { service, configuration, requirements } = job.data;
        
        const result = await this.neuralNetwork.analyze({
            type: 'aws_deployment',
            service,
            configuration,
            requirements,
            role: this.role,
            context: this.memory.getContext()
        });
        
        return {
            deploymentPlan: result.deploymentPlan,
            estimatedCost: result.estimatedCost,
            securityConfig: result.securityConfig,
            scalingStrategy: result.scalingStrategy
        };
    }

    async handleAWSOptimization(job) {
        const { currentConfig, metrics, budget } = job.data;
        
        const result = await this.neuralNetwork.analyze({
            type: 'aws_optimization',
            currentConfig,
            metrics,
            budget,
            role: this.role,
            context: this.memory.getContext()
        });
        
        return {
            optimizations: result.optimizations,
            costSavings: result.costSavings,
            performanceGains: result.performanceGains,
            recommendations: result.recommendations
        };
    }

    async handleSalesAnalysis(job) {
        const { marketData, salesMetrics, targetAudience } = job.data;
        
        const result = await this.neuralNetwork.analyze({
            type: 'sales_analysis',
            marketData,
            salesMetrics,
            targetAudience,
            role: this.role,
            context: this.memory.getContext()
        });
        
        return {
            marketInsights: result.marketInsights,
            salesForecast: result.salesForecast,
            opportunities: result.opportunities,
            strategies: result.strategies
        };
    }

    async handleMarketingStrategy(job) {
        const { product, audience, budget, goals } = job.data;
        
        const result = await this.neuralNetwork.analyze({
            type: 'marketing_strategy',
            product,
            audience,
            budget,
            goals,
            role: this.role,
            context: this.memory.getContext()
        });
        
        return {
            strategy: result.strategy,
            channels: result.channels,
            budgetAllocation: result.budgetAllocation,
            expectedROI: result.expectedROI
        };
    }

    async handleCommunicationRouting(job) {
        const { message, sender, recipients, priority } = job.data;
        
        const result = await this.neuralNetwork.analyze({
            type: 'communication_routing',
            message,
            sender,
            recipients,
            priority,
            role: this.role,
            context: this.memory.getContext()
        });
        
        return {
            routing: result.routing,
            deliveryStatus: result.deliveryStatus,
            responseTime: result.responseTime,
            followUp: result.followUp
        };
    }

    async handleCreativeGeneration(job) {
        const { concept, requirements, constraints } = job.data;
        
        const result = await this.neuralNetwork.analyze({
            type: 'creative_generation',
            concept,
            requirements,
            constraints,
            role: this.role,
            context: this.memory.getContext()
        });
        
        return {
            ideas: result.ideas,
            concepts: result.concepts,
            prototypes: result.prototypes,
            evaluation: result.evaluation
        };
    }

    async handleMemoryManagement(job) {
        const { action, data, targetAgent } = job.data;
        
        const result = await this.neuralNetwork.analyze({
            type: 'memory_management',
            action,
            data,
            targetAgent,
            role: this.role,
            context: this.memory.getContext()
        });
        
        return {
            memoryUpdate: result.memoryUpdate,
            retention: result.retention,
            optimization: result.optimization,
            recommendations: result.recommendations
        };
    }

    // ===== AGENT UPDATE METHODS =====
    async getUpdate() {
        const update = {
            id: this.id,
            role: this.role,
            status: this.status,
            currentJob: this.currentJob,
            stats: this.stats,
            lastUpdate: this.lastUpdate,
            memorySummary: {
                shortTermSize: this.memory.shortTerm.size,
                longTermSize: this.memory.longTerm.size,
                performanceCount: this.memory.performance.length,
                promptCount: this.prompts.length
            }
        };
        
        this.lastUpdate = Date.now();
        return update;
    }

    async receivePrompt(prompt, context = {}) {
        // Store the prompt
        this.memory.addShortTerm('current_prompt', { prompt, context });
        
        // Generate response using neural network
        const response = await this.neuralNetwork.analyze({
            type: 'prompt_response',
            prompt,
            context: { ...this.memory.getContext(), ...context },
            role: this.role
        });
        
        // Store the response
        this.memory.addPrompt(prompt, { response, success: true });
        
        return response;
    }

    async improvePrompts() {
        const promptAnalysis = await this.neuralNetwork.analyze({
            type: 'prompt_improvement',
            currentPrompts: this.prompts,
            performance: this.memory.performance,
            role: this.role,
            context: this.memory.getContext()
        });
        
        // Update prompts based on analysis
        this.prompts = promptAnalysis.improvedPrompts;
        
        return {
            improvements: promptAnalysis.improvements,
            newPrompts: this.prompts
        };
    }

    getStatus() {
        return {
            id: this.id,
            role: this.role,
            status: this.status,
            currentJob: this.currentJob,
            queueLength: this.jobQueue.length,
            stats: this.stats,
            memorySummary: {
                shortTermSize: this.memory.shortTerm.size,
                longTermSize: this.memory.longTerm.size,
                performanceCount: this.memory.performance.length,
                promptCount: this.prompts.length
            }
        };
    }
}

// ===== AGENT MANAGER =====
export class AIAgentManager {
    constructor() {
        this.agents = new Map();
        this.jobQueue = [];
        this.jobHistory = [];
        this.nextJobId = 1;
        this.nextAgentId = 1;
        
        console.log('🤖 AI Agent Manager initialized');
    }

    spawnAgent(role, capabilities = []) {
        const agentId = `agent_${this.nextAgentId++}`;
        const agent = new AIAgent(agentId, role, capabilities);
        
        this.agents.set(agentId, agent);
        
        console.log(`🚀 Spawned ${role} agent: ${agentId}`);
        
        return agentId;
    }

    spawnAllAgents() {
        const agentIds = [];
        
        for (const role of Object.values(AGENT_ROLES)) {
            const agentId = this.spawnAgent(role);
            agentIds.push(agentId);
        }
        
        console.log(`🚀 Spawned ${agentIds.length} AI agents for all roles`);
        return agentIds;
    }

    async queueJob(jobType, description, data, priority = 'normal', targetRole = null) {
        const job = {
            id: `job_${this.nextJobId++}`,
            type: jobType,
            description,
            data,
            priority,
            status: 'queued',
            createdAt: new Date(),
            targetRole
        };
        
        this.jobQueue.push(job);
        
        // Sort by priority
        this.jobQueue.sort((a, b) => {
            const priorityOrder = { high: 3, normal: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
        
        console.log(`📋 Job queued: ${job.type} - ${job.description}`);
        
        // Assign to appropriate agent
        await this.assignJob(job);
        
        return job.id;
    }

    async assignJob(job) {
        let targetAgent = null;
        
        if (job.targetRole) {
            // Find agent with specific role
            for (const [agentId, agent] of this.agents) {
                if (agent.role === job.targetRole && agent.status === 'idle') {
                    targetAgent = agent;
                    break;
                }
            }
        } else {
            // Find best available agent based on job type
            targetAgent = this.findBestAgentForJob(job);
        }
        
        if (targetAgent) {
            await targetAgent.addJob(job);
        } else {
            console.log(`⏳ No available agent for job ${job.id}, keeping in queue`);
        }
    }

    findBestAgentForJob(job) {
        const jobRoleMapping = {
            [JOB_TYPES.CODE_REVIEW]: AGENT_ROLES.CODE_REVIEWER,
            [JOB_TYPES.PERFORMANCE_ANALYSIS]: AGENT_ROLES.PERFORMANCE_OPTIMIZER,
            [JOB_TYPES.AI_MODEL_TRAINING]: AGENT_ROLES.AI_SYSTEMS_ENGINEER,
            [JOB_TYPES.TEXTURE_GENERATION]: AGENT_ROLES.GRAPHICS_ARTIST,
            [JOB_TYPES.BUG_FIX]: AGENT_ROLES.CODE_REVIEWER,
            [JOB_TYPES.FEATURE_IMPLEMENTATION]: AGENT_ROLES.GAMEPLAY_DESIGNER,
            [JOB_TYPES.DOCUMENTATION_UPDATE]: AGENT_ROLES.DOCUMENTATION_WRITER,
            [JOB_TYPES.SECURITY_AUDIT]: AGENT_ROLES.SECURITY_ANALYST,
            [JOB_TYPES.DEPLOYMENT_CHECK]: AGENT_ROLES.DEPLOYMENT_ENGINEER,
            [JOB_TYPES.TESTING]: AGENT_ROLES.TESTING_ENGINEER,
            [JOB_TYPES.AGENT_MANAGEMENT]: AGENT_ROLES.MANAGER_AGENT,
            [JOB_TYPES.PROMPT_OPTIMIZATION]: AGENT_ROLES.MANAGER_AGENT,
            [JOB_TYPES.AGENT_EVALUATION]: AGENT_ROLES.MANAGER_AGENT,
            [JOB_TYPES.AWS_DEPLOYMENT]: AGENT_ROLES.AWS_SPECIALIST,
            [JOB_TYPES.AWS_OPTIMIZATION]: AGENT_ROLES.AWS_SPECIALIST,
            [JOB_TYPES.SALES_ANALYSIS]: AGENT_ROLES.SALES_TEAM,
            [JOB_TYPES.MARKETING_STRATEGY]: AGENT_ROLES.SALES_TEAM,
            [JOB_TYPES.COMMUNICATION_ROUTING]: AGENT_ROLES.MESSENGER,
            [JOB_TYPES.CREATIVE_GENERATION]: AGENT_ROLES.CREATIVE_SPAWNER,
            [JOB_TYPES.MEMORY_MANAGEMENT]: AGENT_ROLES.MANAGER_AGENT
        };
        
        const preferredRole = jobRoleMapping[job.type];
        
        // First try preferred role
        for (const [agentId, agent] of this.agents) {
            if (agent.role === preferredRole && agent.status === 'idle') {
                return agent;
            }
        }
        
        // Fallback to any idle agent
        for (const [agentId, agent] of this.agents) {
            if (agent.status === 'idle') {
                return agent;
            }
        }
        
        return null;
    }

    getAgentStatus(agentId) {
        const agent = this.agents.get(agentId);
        return agent ? agent.getStatus() : null;
    }

    getAllAgentsStatus() {
        const status = {};
        for (const [agentId, agent] of this.agents) {
            status[agentId] = agent.getStatus();
        }
        return status;
    }

    getJobQueue() {
        return this.jobQueue.map(job => ({
            id: job.id,
            type: job.type,
            description: job.description,
            priority: job.priority,
            status: job.status,
            createdAt: job.createdAt
        }));
    }

    getJobHistory() {
        return this.jobHistory;
    }

    async stopAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.status = 'offline';
            console.log(`🛑 Agent ${agentId} stopped`);
        }
    }

    async restartAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.status = 'idle';
            console.log(`🔄 Agent ${agentId} restarted`);
            
            // Process any pending jobs
            if (agent.jobQueue.length > 0) {
                agent.processNextJob();
            }
        }
    }

    getSystemStats() {
        const stats = {
            totalAgents: this.agents.size,
            activeAgents: 0,
            idleAgents: 0,
            busyAgents: 0,
            offlineAgents: 0,
            totalJobs: this.jobQueue.length,
            completedJobs: 0,
            failedJobs: 0
        };
        
        for (const [agentId, agent] of this.agents) {
            stats[`${agent.status}Agents`]++;
            stats.completedJobs += agent.stats.jobsCompleted;
            stats.failedJobs += agent.stats.jobsFailed;
        }
        
        return stats;
    }
}

// ===== EXPORTS =====
export { AIAgent };
export default AIAgentManager; 