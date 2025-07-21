/**
 * Coordinates - AI Agent System
 * Manages specialized AI agents with role-based job queuing and LLM integration
 * IDX-AI-001: AI Agent System Implementation
 * IDX-AI-002: Agent Memory System
 * IDX-AI-003: Enhanced Agent Capabilities
 * IDX-AI-004: Job Management and Queuing
 * IDX-AI-005: LLM-Enhanced Agent Intelligence
 * 
 * For index reference format, see INDEX_DESCRIBER.md
 */

import MathematicalAI from '../neural/MathematicalAI.js';
import comfyUI from '../../utils/helpers/ComfyUIIntegration.js';
import { LLMManager, AgentLLMEnhancer } from '../llm/LLMManager.js';
import { ProjectObjectives } from '../../core/relativity/project-objectives.js';

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

// ===== ENHANCED AGENT MEMORY WITH RELATIVITY =====
class AgentMemory {
  constructor(agentId) {
    this.agentId = agentId;
    this.shortTerm = new Map(); // Recent interactions and context
    this.longTerm = new Map(); // Persistent knowledge and patterns
    this.performance = []; // Historical performance data
    this.prompts = []; // Successful prompts and their outcomes
    this.maxShortTermSize = 100;
    this.maxLongTermSize = 1000;
    this.objectives = new ProjectObjectives();
  }

  addShortTerm(key, value) {
    // Calculate relativity before storing
    const relativity = this.objectives.calculateTaskRelativity(value);
    
    this.shortTerm.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 0,
      relativity: relativity.rating,
      priority: relativity.priority,
      shouldExecute: relativity.shouldExecute
    });
    
    // Only store if relevance is high enough
    if (relativity.rating >= this.objectives.memoryRelevanceThreshold) {
      console.log(`💾 Storing short-term memory: ${key} (relevance: ${relativity.rating.toFixed(2)})`);
    } else {
      console.log(`⏭️ Skipping low-relevance memory: ${key} (relevance: ${relativity.rating.toFixed(2)})`);
    }
    
    // Cleanup least relevant entries
    if (this.shortTerm.size > this.maxShortTermSize) {
      const leastRelevantKey = Array.from(this.shortTerm.entries())
        .sort((a, b) => a[1].relativity - b[1].relativity)[0][0];
      this.shortTerm.delete(leastRelevantKey);
    }
  }

  addLongTerm(key, value) {
    // Calculate relativity before storing
    const relativity = this.objectives.calculateTaskRelativity(value);
    
    this.longTerm.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 0,
      importance: relativity.rating,
      priority: relativity.priority,
      shouldExecute: relativity.shouldExecute
    });
    
    // Only store if relevance is high enough
    if (relativity.rating >= this.objectives.memoryRelevanceThreshold) {
      console.log(`💾 Storing long-term memory: ${key} (relevance: ${relativity.rating.toFixed(2)})`);
    } else {
      console.log(`⏭️ Skipping low-relevance memory: ${key} (relevance: ${relativity.rating.toFixed(2)})`);
    }
    
    // Cleanup least important entries
    if (this.longTerm.size > this.maxLongTermSize) {
      const leastImportantKey = Array.from(this.longTerm.entries())
        .sort((a, b) => a[1].importance - b[1].importance)[0][0];
      this.longTerm.delete(leastImportantKey);
    }
  }

  getContext(currentTask = null) {
    const context = {
      shortTerm: [],
      longTerm: [],
      performance: this.performance.slice(-10), // Last 10 performance entries
      prompts: this.prompts.slice(-5) // Last 5 prompts
    };

    // Only retrieve relevant memories
    if (currentTask) {
      for (const [key, memory] of this.shortTerm) {
        const relevance = this.objectives.calculateMemoryRelevance(key, currentTask);
        if (relevance.shouldRetrieve) {
          context.shortTerm.push({ key, ...memory, relevance: relevance.rating });
        }
      }

      for (const [key, memory] of this.longTerm) {
        const relevance = this.objectives.calculateMemoryRelevance(key, currentTask);
        if (relevance.shouldRetrieve) {
          context.longTerm.push({ key, ...memory, relevance: relevance.rating });
        }
      }
    } else {
      // If no current task, get most relevant memories overall
      const sortedShortTerm = Array.from(this.shortTerm.entries())
        .sort((a, b) => b[1].relativity - a[1].relativity)
        .slice(0, 5);
      
      const sortedLongTerm = Array.from(this.longTerm.entries())
        .sort((a, b) => b[1].importance - a[1].importance)
        .slice(0, 10);

      context.shortTerm = sortedShortTerm.map(([key, memory]) => ({ key, ...memory }));
      context.longTerm = sortedLongTerm.map(([key, memory]) => ({ key, ...memory }));
    }

    return context;
  }

  addPerformance(data) {
    // Calculate relativity for performance data
    const relativity = this.objectives.calculateTaskRelativity(data);
    
    if (relativity.shouldExecute) {
      this.performance.push({
        ...data,
        timestamp: Date.now(),
        relativity: relativity.rating,
        priority: relativity.priority
      });
      
      // Keep only relevant performance data
      this.performance = this.performance.filter(p => p.relativity >= this.objectives.memoryRelevanceThreshold);
    }
  }

  addPrompt(prompt, outcome) {
    // Calculate relativity for prompt data
    const relativity = this.objectives.calculateTaskRelativity({ prompt, outcome });
    
    if (relativity.shouldExecute) {
      this.prompts.push({
        prompt,
        outcome,
        timestamp: Date.now(),
        relativity: relativity.rating,
        priority: relativity.priority
      });
      
      // Keep only relevant prompts
      this.prompts = this.prompts.filter(p => p.relativity >= this.objectives.memoryRelevanceThreshold);
    }
  }

  getMemoryStats() {
    return {
      shortTermSize: this.shortTerm.size,
      longTermSize: this.longTerm.size,
      performanceSize: this.performance.length,
      promptsSize: this.prompts.length,
      averageShortTermRelevance: Array.from(this.shortTerm.values())
        .reduce((sum, mem) => sum + mem.relativity, 0) / this.shortTerm.size || 0,
      averageLongTermImportance: Array.from(this.longTerm.values())
        .reduce((sum, mem) => sum + mem.importance, 0) / this.longTerm.size || 0
    };
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
        this.comfyUI = comfyUI;
        this.memory = new AgentMemory(id);
        this.prompts = this.getDefaultPrompts();
        this.lastUpdate = Date.now();
        
        // LLM enhancement properties
        this.llmEnhanced = false;
        this.thinkingHistory = [];
        this.llmConfidence = 0.5;
        this.llmProvider = null;
        
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
        // No initialize method on neuralNetwork; just log
        console.log(`🤖 Agent ${this.id} (${this.role}) initialized with neural network config`, roleConfig);
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
        // Calculate relativity rating for the job
        const relativity = this.memory.objectives.calculateTaskRelativity(job, {
            agentRole: this.role,
            agentCapabilities: this.capabilities,
            currentStatus: this.status
        });

        console.log(`📋 Job ${job.id} relativity rating: ${relativity.rating.toFixed(2)} (${relativity.priority})`);

        if (!relativity.shouldExecute) {
            console.log(`⏭️ Skipping low-relevance job: ${job.id} (rating: ${relativity.rating.toFixed(2)})`);
            job.status = 'skipped';
            job.skipReason = 'Low relativity rating';
            job.relativity = relativity;
            return;
        }

        // Add relativity data to job
        job.relativity = relativity;
        job.priority = relativity.priority;
        
        this.jobQueue.push(job);
        console.log(`📋 Job ${job.id} added to ${this.role} agent queue (relevance: ${relativity.rating.toFixed(2)})`);
        
        if (this.status === 'idle') {
            this.processNextJob();
        }
    }

    async processNextJob() {
        if (this.jobQueue.length === 0 || this.status === 'busy') {
            return;
        }

        // Sort jobs by relativity rating (highest first)
        this.jobQueue.sort((a, b) => {
            const aRating = a.relativity?.rating || 0;
            const bRating = b.relativity?.rating || 0;
            return bRating - aRating;
        });

        this.status = 'busy';
        const job = this.jobQueue.shift();
        this.currentJob = job;
        
        console.log(`🔄 Agent ${this.id} starting job: ${job.type} - ${job.description}`);
        console.log(`📊 Job relativity: ${job.relativity.rating.toFixed(2)} (${job.relativity.priority})`);
        
        const startTime = Date.now();
        
        try {
            // Get relevant context for this specific job
            const context = this.memory.getContext(job);
            console.log(`🧠 Retrieved ${context.shortTerm.length} short-term and ${context.longTerm.length} long-term memories for job ${job.id}`);
            
            const result = await this.executeJob(job, context);
            job.status = 'completed';
            job.result = result;
            job.completedAt = new Date();
            
            this.stats.jobsCompleted++;
            this.stats.totalWorkTime += Date.now() - startTime;
            this.stats.averageJobTime = this.stats.totalWorkTime / this.stats.jobsCompleted;
            this.stats.successRate = this.stats.jobsCompleted / (this.stats.jobsCompleted + this.stats.jobsFailed);
            
            // Update memory with successful job (only if relevant)
            const memoryData = { job, result, success: true, relativity: job.relativity };
            this.memory.addShortTerm(`job_${job.id}`, memoryData);
            this.memory.addPerformance({ 
                jobType: job.type, 
                success: true, 
                duration: Date.now() - startTime,
                relativity: job.relativity.rating
            });
            
            console.log(`✅ Job ${job.id} completed successfully by ${this.role} agent`);
            
        } catch (error) {
            job.status = 'failed';
            job.error = error.message;
            job.failedAt = new Date();
            
            this.stats.jobsFailed++;
            this.stats.successRate = this.stats.jobsCompleted / (this.stats.jobsCompleted + this.stats.jobsFailed);
            
            // Update memory with failed job (only if relevant)
            const memoryData = { job, error: error.message, success: false, relativity: job.relativity };
            this.memory.addShortTerm(`job_${job.id}`, memoryData);
            this.memory.addPerformance({ 
                jobType: job.type, 
                success: false, 
                duration: Date.now() - startTime,
                relativity: job.relativity.rating
            });
            
            console.error(`❌ Job ${job.id} failed: ${error.message}`);
        }
        
        this.currentJob = null;
        this.status = 'idle';
        
        // Process next job if available
        if (this.jobQueue.length > 0) {
            setTimeout(() => this.processNextJob(), 100);
        }
    }

    async executeJob(job, context = null) {
        // Use provided context or get relevant context for this job
        const jobContext = context || this.memory.getContext(job);
        
        const jobHandlers = {
            [JOB_TYPES.CODE_REVIEW]: () => this.handleCodeReview(job, jobContext),
            [JOB_TYPES.PERFORMANCE_ANALYSIS]: () => this.handlePerformanceAnalysis(job, jobContext),
            [JOB_TYPES.AI_MODEL_TRAINING]: () => this.handleAIModelTraining(job, jobContext),
            [JOB_TYPES.TEXTURE_GENERATION]: () => this.handleTextureGeneration(job, jobContext),
            [JOB_TYPES.BUG_FIX]: () => this.handleBugFix(job, jobContext),
            [JOB_TYPES.FEATURE_IMPLEMENTATION]: () => this.handleFeatureImplementation(job, jobContext),
            [JOB_TYPES.DOCUMENTATION_UPDATE]: () => this.handleDocumentationUpdate(job, jobContext),
            [JOB_TYPES.SECURITY_AUDIT]: () => this.handleSecurityAudit(job, jobContext),
            [JOB_TYPES.DEPLOYMENT_CHECK]: () => this.handleDeploymentCheck(job, jobContext),
            [JOB_TYPES.TESTING]: () => this.handleTesting(job, jobContext),
            [JOB_TYPES.AGENT_MANAGEMENT]: () => this.handleAgentManagement(job, jobContext),
            [JOB_TYPES.PROMPT_OPTIMIZATION]: () => this.handlePromptOptimization(job, jobContext),
            [JOB_TYPES.AGENT_EVALUATION]: () => this.handleAgentEvaluation(job, jobContext),
            [JOB_TYPES.AWS_DEPLOYMENT]: () => this.handleAWSDeployment(job, jobContext),
            [JOB_TYPES.AWS_OPTIMIZATION]: () => this.handleAWSOptimization(job, jobContext),
            [JOB_TYPES.SALES_ANALYSIS]: () => this.handleSalesAnalysis(job, jobContext),
            [JOB_TYPES.MARKETING_STRATEGY]: () => this.handleMarketingStrategy(job, jobContext),
            [JOB_TYPES.COMMUNICATION_ROUTING]: () => this.handleCommunicationRouting(job, jobContext),
            [JOB_TYPES.CREATIVE_GENERATION]: () => this.handleCreativeGeneration(job, jobContext),
            [JOB_TYPES.MEMORY_MANAGEMENT]: () => this.handleMemoryManagement(job, jobContext)
        };
        
        const handler = jobHandlers[job.type];
        if (!handler) {
            throw new Error(`Unknown job type: ${job.type}`);
        }
        
        return await handler();
    }

    // ===== JOB HANDLERS =====
    async handleCodeReview(job, context) {
        const { filePath, code } = job.data;
        
        // Analyze code quality using neural network
        const analysis = await this.neuralNetwork.analyze({
            type: 'code_review',
            filePath,
            code,
            role: this.role,
            context: context
        });
        
        return {
            quality: analysis.quality,
            issues: analysis.issues,
            suggestions: analysis.suggestions,
            complexity: analysis.complexity
        };
    }

    async handlePerformanceAnalysis(job, context) {
        const { metrics, target } = job.data;
        
        const analysis = await this.neuralNetwork.analyze({
            type: 'performance_analysis',
            metrics,
            target,
            role: this.role,
            context: context
        });
        
        return {
            bottlenecks: analysis.bottlenecks,
            optimizations: analysis.optimizations,
            recommendations: analysis.recommendations
        };
    }

    async handleAIModelTraining(job, context) {
        const { modelType, trainingData, parameters } = job.data;
        
        const result = await this.neuralNetwork.train({
            modelType,
            trainingData,
            parameters,
            role: this.role,
            context: context
        });
        
        return {
            accuracy: result.accuracy,
            loss: result.loss,
            modelPath: result.modelPath
        };
    }

    async handleTextureGeneration(job, context) {
        const { textureType, parameters, style } = job.data;
        
        const texture = await this.comfyUI.generateTexture({
            type: textureType,
            parameters,
            style,
            role: this.role,
            context: context
        });
        
        return {
            texturePath: texture.path,
            resolution: texture.resolution,
            format: texture.format
        };
    }

    async handleBugFix(job, context) {
        const { bugReport, affectedFiles } = job.data;
        
        const fix = await this.neuralNetwork.analyze({
            type: 'bug_fix',
            bugReport,
            affectedFiles,
            role: this.role,
            context: context
        });
        
        return {
            fix: fix.solution,
            files: fix.files,
            tests: fix.tests
        };
    }

    async handleFeatureImplementation(job, context) {
        const { feature, requirements } = job.data;
        
        const implementation = await this.neuralNetwork.analyze({
            type: 'feature_implementation',
            feature,
            requirements,
            role: this.role,
            context: context
        });
        
        return {
            code: implementation.code,
            tests: implementation.tests,
            documentation: implementation.documentation
        };
    }

    async handleDocumentationUpdate(job, context) {
        const { section, content } = job.data;
        
        const update = await this.neuralNetwork.analyze({
            type: 'documentation_update',
            section,
            content,
            role: this.role,
            context: context
        });
        
        return {
            updatedContent: update.content,
            structure: update.structure,
            completeness: update.completeness
        };
    }

    async handleSecurityAudit(job, context) {
        const { code, dependencies } = job.data;
        
        const audit = await this.neuralNetwork.analyze({
            type: 'security_audit',
            code,
            dependencies,
            role: this.role,
            context: context
        });
        
        return {
            vulnerabilities: audit.vulnerabilities,
            recommendations: audit.recommendations,
            riskLevel: audit.riskLevel
        };
    }

    async handleDeploymentCheck(job, context) {
        const { environment, configuration } = job.data;
        
        const check = await this.neuralNetwork.analyze({
            type: 'deployment_check',
            environment,
            configuration,
            role: this.role,
            context: context
        });
        
        return {
            status: check.status,
            issues: check.issues,
            readiness: check.readiness
        };
    }

    async handleTesting(job, context) {
        const { testType, target } = job.data;
        
        const test = await this.neuralNetwork.analyze({
            type: 'testing',
            testType,
            target,
            role: this.role,
            context: context
        });
        
        return {
            coverage: test.coverage,
            results: test.results,
            recommendations: test.recommendations
        };
    }

    // ===== NEW JOB HANDLERS =====
    async handleAgentManagement(job, context) {
        const { action, targetAgent, data } = job.data;
        
        const result = await this.neuralNetwork.analyze({
            type: 'agent_management',
            action,
            targetAgent,
            data,
            role: this.role,
            context: context
        });
        
        return {
            action: result.action,
            recommendations: result.recommendations,
            priority: result.priority,
            estimatedImpact: result.estimatedImpact
        };
    }

    async handlePromptOptimization(job, context) {
        const { targetAgent, currentPrompt, performance } = job.data;
        
        const result = await this.neuralNetwork.analyze({
            type: 'prompt_optimization',
            targetAgent,
            currentPrompt,
            performance,
            role: this.role,
            context: context
        });
        
        // Store optimized prompt
        this.memory.addPrompt(result.optimizedPrompt, { success: true });
        
        return {
            optimizedPrompt: result.optimizedPrompt,
            improvements: result.improvements,
            expectedPerformance: result.expectedPerformance
        };
    }

    async handleAgentEvaluation(job, context) {
        const { targetAgent, criteria, metrics } = job.data;
        
        const result = await this.neuralNetwork.analyze({
            type: 'agent_evaluation',
            targetAgent,
            criteria,
            metrics,
            role: this.role,
            context: context
        });
        
        return {
            rating: result.rating,
            strengths: result.strengths,
            weaknesses: result.weaknesses,
            recommendations: result.recommendations
        };
    }

    async handleAWSDeployment(job, context) {
        const { service, configuration, requirements } = job.data;
        
        const result = await this.neuralNetwork.analyze({
            type: 'aws_deployment',
            service,
            configuration,
            requirements,
            role: this.role,
            context: context
        });
        
        return {
            deploymentPlan: result.deploymentPlan,
            estimatedCost: result.estimatedCost,
            securityConfig: result.securityConfig,
            scalingStrategy: result.scalingStrategy
        };
    }

    async handleAWSOptimization(job, context) {
        const { currentConfig, metrics, budget } = job.data;
        
        const result = await this.neuralNetwork.analyze({
            type: 'aws_optimization',
            currentConfig,
            metrics,
            budget,
            role: this.role,
            context: context
        });
        
        return {
            optimizations: result.optimizations,
            costSavings: result.costSavings,
            performanceGains: result.performanceGains,
            recommendations: result.recommendations
        };
    }

    async handleSalesAnalysis(job, context) {
        const { marketData, salesMetrics, targetAudience } = job.data;
        
        const result = await this.neuralNetwork.analyze({
            type: 'sales_analysis',
            marketData,
            salesMetrics,
            targetAudience,
            role: this.role,
            context: context
        });
        
        return {
            marketInsights: result.marketInsights,
            salesForecast: result.salesForecast,
            opportunities: result.opportunities,
            strategies: result.strategies
        };
    }

    async handleMarketingStrategy(job, context) {
        const { product, audience, budget, goals } = job.data;
        
        const result = await this.neuralNetwork.analyze({
            type: 'marketing_strategy',
            product,
            audience,
            budget,
            goals,
            role: this.role,
            context: context
        });
        
        return {
            strategy: result.strategy,
            channels: result.channels,
            budgetAllocation: result.budgetAllocation,
            expectedROI: result.expectedROI
        };
    }

    async handleCommunicationRouting(job, context) {
        const { message, sender, recipients, priority } = job.data;
        
        const result = await this.neuralNetwork.analyze({
            type: 'communication_routing',
            message,
            sender,
            recipients,
            priority,
            role: this.role,
            context: context
        });
        
        return {
            routing: result.routing,
            deliveryStatus: result.deliveryStatus,
            responseTime: result.responseTime,
            followUp: result.followUp
        };
    }

    async handleCreativeGeneration(job, context) {
        const { concept, requirements, constraints } = job.data;
        
        const result = await this.neuralNetwork.analyze({
            type: 'creative_generation',
            concept,
            requirements,
            constraints,
            role: this.role,
            context: context
        });
        
        return {
            ideas: result.ideas,
            concepts: result.concepts,
            prototypes: result.prototypes,
            evaluation: result.evaluation
        };
    }

    async handleMemoryManagement(job, context) {
        const { action, data, targetAgent } = job.data;
        
        const result = await this.neuralNetwork.analyze({
            type: 'memory_management',
            action,
            data,
            targetAgent,
            role: this.role,
            context: context
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

    async enableLLMEnhancement(llmManager, enhancer) {
        this.llmEnhanced = true;
        this.llmManager = llmManager;
        this.llmEnhancer = enhancer;
        
        // Test LLM connection
        try {
            const testResponse = await this.llmManager.generateResponse('Test connection', { maxTokens: 10 });
            this.llmProvider = testResponse.provider;
            console.log(`✅ Agent ${this.id} LLM enhancement enabled with ${this.llmProvider}`);
            return true;
        } catch (error) {
            console.warn(`❌ Agent ${this.id} LLM enhancement failed: ${error.message}`);
            this.llmEnhanced = false;
            return false;
        }
    }

    async generateEnhancedThinking(context = {}) {
        if (!this.llmEnhanced || !this.llmEnhancer) {
            return {
                thoughts: "LLM enhancement not available",
                confidence: 0.3,
                nextActions: [],
                reasoning: []
            };
        }

        try {
            const enhancedThinking = await this.llmEnhancer.enhanceAgentThinking(this, context);
            
            // Store in thinking history
            this.thinkingHistory.push({
                ...enhancedThinking,
                timestamp: Date.now(),
                context
            });
            
            // Keep only recent thinking history
            if (this.thinkingHistory.length > 20) {
                this.thinkingHistory = this.thinkingHistory.slice(-20);
            }
            
            this.llmConfidence = enhancedThinking.confidence;
            return enhancedThinking;
            
        } catch (error) {
            console.error(`Enhanced thinking failed for agent ${this.id}:`, error);
            return {
                thoughts: "Enhanced thinking unavailable",
                confidence: 0.3,
                nextActions: [],
                reasoning: []
            };
        }
    }

    getThinkingHistory() {
        return this.thinkingHistory;
    }

    getLLMStatus() {
        return {
            enhanced: this.llmEnhanced,
            provider: this.llmProvider,
            confidence: this.llmConfidence,
            thinkingHistoryCount: this.thinkingHistory.length
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
        
        // LLM integration
        this.llmManager = null;
        this.llmEnhancer = null;
        this.llmEnabled = false;
        
        console.log('🤖 AI Agent Manager initialized');
    }

    async initializeLLM() {
        try {
            console.log('🚀 Initializing LLM integration...');
            
            this.llmManager = new LLMManager();
            const llmInitialized = await this.llmManager.initializeServices();
            
            if (llmInitialized) {
                this.llmEnhancer = new AgentLLMEnhancer(this.llmManager);
                this.llmEnabled = true;
                console.log('✅ LLM integration initialized successfully');
                
                // Enable LLM enhancement for existing agents
                await this.enableLLMForAllAgents();
                
                return true;
            } else {
                console.warn('⚠️ LLM services not available, continuing without LLM enhancement');
                return false;
            }
        } catch (error) {
            console.error('❌ LLM initialization failed:', error);
            return false;
        }
    }

    async enableLLMForAllAgents() {
        if (!this.llmEnabled || !this.llmManager || !this.llmEnhancer) {
            console.warn('LLM not available for agent enhancement');
            return;
        }

        console.log('🔧 Enabling LLM enhancement for all agents...');
        
        for (const [agentId, agent] of this.agents) {
            try {
                await agent.enableLLMEnhancement(this.llmManager, this.llmEnhancer);
            } catch (error) {
                console.warn(`Failed to enable LLM for agent ${agentId}:`, error.message);
            }
        }
        
        console.log(`✅ LLM enhancement enabled for ${this.agents.size} agents`);
    }

    async enableLLMForAgent(agentId) {
        if (!this.llmEnabled || !this.llmManager || !this.llmEnhancer) {
            throw new Error('LLM not available');
        }

        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }

        return await agent.enableLLMEnhancement(this.llmManager, this.llmEnhancer);
    }

    async generateAgentThinking(agentId, context = {}) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }

        return await agent.generateEnhancedThinking(context);
    }

    getLLMStatus() {
        if (!this.llmManager) {
            return { enabled: false, message: 'LLM not initialized' };
        }

        return {
            enabled: this.llmEnabled,
            services: this.llmManager.getServiceStatus(),
            availableProviders: this.llmManager.getAvailableProviders(),
            activeProvider: this.llmManager.activeProvider
        };
    }

    async switchLLMProvider(provider) {
        if (!this.llmManager) {
            throw new Error('LLM not initialized');
        }

        const success = await this.llmManager.switchActiveProvider(provider);
        if (success) {
            console.log(`✅ Switched to LLM provider: ${provider}`);
        }
        return success;
    }

    getAllAgentThinkingHistory() {
        const history = {};
        for (const [agentId, agent] of this.agents) {
            history[agentId] = {
                thinkingHistory: agent.getThinkingHistory(),
                llmStatus: agent.getLLMStatus()
            };
        }
        return history;
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
        // Create the job object
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

        // Calculate relativity rating for the job
        const objectives = new ProjectObjectives();
        const relativity = objectives.calculateTaskRelativity(job, {
            jobType,
            description,
            targetRole,
            timestamp: new Date()
        });

        console.log(`📋 Job ${job.id} relativity rating: ${relativity.rating.toFixed(2)} (${relativity.priority})`);

        if (!relativity.shouldExecute) {
            console.log(`⏭️ Skipping low-relevance job: ${job.id} (rating: ${relativity.rating.toFixed(2)})`);
            job.status = 'skipped';
            job.skipReason = 'Low relativity rating';
            job.relativity = relativity;
            return job.id;
        }

        // Add relativity data to job
        job.relativity = relativity;
        job.priority = relativity.priority;
        
        this.jobQueue.push(job);
        
        // Sort by relativity rating (highest first), then by priority
        this.jobQueue.sort((a, b) => {
            const aRating = a.relativity?.rating || 0;
            const bRating = b.relativity?.rating || 0;
            
            if (Math.abs(aRating - bRating) > 0.1) {
                return bRating - aRating; // Higher relativity first
            }
            
            // If relativity is similar, use priority
            const priorityOrder = { high: 3, normal: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
        
        console.log(`📋 Job queued: ${job.type} - ${job.description} (relevance: ${relativity.rating.toFixed(2)})`);
        
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
            // Find best available agent based on job type and relativity
            targetAgent = this.findBestAgentForJob(job);
        }
        
        if (targetAgent) {
            console.log(`🎯 Assigning job ${job.id} to agent ${targetAgent.id} (${targetAgent.role})`);
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
        
        // Score agents based on role match, status, and performance
        const agentScores = [];
        
        for (const [agentId, agent] of this.agents) {
            if (agent.status !== 'idle') continue;
            
            let score = 0;
            
            // Role match bonus
            if (agent.role === preferredRole) {
                score += 10;
            }
            
            // Performance bonus (higher success rate = better score)
            score += agent.stats.successRate * 5;
            
            // Rating bonus
            score += agent.stats.rating * 2;
            
            // Queue size penalty (prefer agents with shorter queues)
            score -= agent.jobQueue.length * 2;
            
            agentScores.push({ agent, score });
        }
        
        // Sort by score (highest first)
        agentScores.sort((a, b) => b.score - a.score);
        
        return agentScores.length > 0 ? agentScores[0].agent : null;
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

    // ====== MISSING METHODS FOR SERVER API ======
    
    getAllAgents() {
        const agents = [];
        for (const [agentId, agent] of this.agents) {
            agents.push({
                id: agent.id,
                role: agent.role,
                status: agent.status,
                capabilities: agent.capabilities,
                stats: agent.stats,
                currentJob: agent.currentJob,
                llmEnhanced: agent.llmEnhanced,
                rating: agent.stats.rating
            });
        }
        return agents;
    }

    getAgentCount() {
        return this.agents.size;
    }

    getActiveAgentCount() {
        let count = 0;
        for (const [agentId, agent] of this.agents) {
            if (agent.status === 'idle' || agent.status === 'busy') {
                count++;
            }
        }
        return count;
    }

    async testLLMConnection() {
        try {
            if (!this.llmManager) {
                return { success: false, error: 'LLM Manager not initialized' };
            }
            
            const testResult = await this.llmManager.generateResponse(
                'lm_studio', 
                'Hello! This is a connection test.',
                'meta-llama-3-70b-instruct-smashed'
            );
            
            return { 
                success: true, 
                provider: 'lm_studio',
                response: testResult.text,
                responseTime: testResult.responseTime
            };
        } catch (error) {
            return { 
                success: false, 
                error: error.message,
                provider: 'lm_studio'
            };
        }
    }
}

// ===== EXPORTS =====
export { AIAgent };
export default AIAgentManager; 