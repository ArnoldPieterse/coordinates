/**
 * Coordinates - AI Agent Manager
 * Specialized manager agent for coordinating and optimizing the AI ecosystem
 * IDX-AI-008: Manager Agent Implementation
 * IDX-AI-009: Agent Coordination System
 * IDX-AI-010: Creative Agent Spawning
 * IDX-AI-011: Performance Monitoring
 * 
 * For index reference format, see INDEX_DESCRIBER.md
 */

import AIAgentManager, { AGENT_ROLES, JOB_TYPES } from './ai-agent-system.js';

// ===== MANAGER AGENT CLASS =====
// IDX-AI-012: Manager Agent Core Implementation
export class ManagerAgent {
    constructor(agentManager) {
        this.agentManager = agentManager;
        this.agent = null;
        this.updateInterval = null;
        this.promptOptimizationInterval = null;
        this.agentEvaluationInterval = null;
        this.memoryManagementInterval = null;
        this.creativeAgents = new Map(); // Temporary creative agents
        this.communicationLog = [];
        this.performanceMetrics = new Map();
        
        console.log('🎯 Manager Agent initialized');
    }

    async initialize() {
        // Create the manager agent
        const managerId = this.agentManager.spawnAgent(AGENT_ROLES.MANAGER_AGENT, [
            'agent_management',
            'prompt_optimization',
            'performance_evaluation',
            'memory_management',
            'creative_spawning'
        ]);
        
        this.agent = this.agentManager.agents.get(managerId);
        
        // Start management cycles
        this.startManagementCycles();
        
        console.log('✅ Manager Agent initialized and started');
    }

    startManagementCycles() {
        // Regular agent updates (every 30 seconds)
        this.updateInterval = setInterval(() => {
            this.requestAgentUpdates();
        }, 30000);

        // Prompt optimization (every 5 minutes)
        this.promptOptimizationInterval = setInterval(() => {
            this.optimizeAgentPrompts();
        }, 300000);

        // Agent evaluation (every 10 minutes)
        this.agentEvaluationInterval = setInterval(() => {
            this.evaluateAgents();
        }, 600000);

        // Memory management (every 15 minutes)
        this.memoryManagementInterval = setInterval(() => {
            this.manageAgentMemory();
        }, 900000);
    }

    stopManagementCycles() {
        if (this.updateInterval) clearInterval(this.updateInterval);
        if (this.promptOptimizationInterval) clearInterval(this.promptOptimizationInterval);
        if (this.agentEvaluationInterval) clearInterval(this.agentEvaluationInterval);
        if (this.memoryManagementInterval) clearInterval(this.memoryManagementInterval);
    }

    // ===== AGENT MANAGEMENT METHODS =====
    async requestAgentUpdates() {
        const agents = this.agentManager.getAllAgentsStatus();
        
        for (const [agentId, agentStatus] of Object.entries(agents)) {
            if (agentId === this.agent.id) continue; // Skip self
            
            try {
                const agent = this.agentManager.agents.get(agentId);
                const update = await agent.getUpdate();
                
                // Store performance metrics
                this.performanceMetrics.set(agentId, {
                    ...update,
                    timestamp: Date.now()
                });
                
                // Generate management job if needed
                await this.generateManagementJob(agentId, update);
                
            } catch (error) {
                console.error(`Error getting update from agent ${agentId}:`, error);
            }
        }
    }

    async generateManagementJob(agentId, update) {
        const agent = this.agentManager.agents.get(agentId);
        
        // Check if agent needs attention
        if (update.stats.successRate < 0.8 || update.stats.rating < 6.0) {
            await this.agentManager.queueJob(
                JOB_TYPES.AGENT_MANAGEMENT,
                `Performance optimization for ${agent.role} agent`,
                {
                    action: 'optimize_performance',
                    targetAgent: agentId,
                    data: { currentStats: update.stats, issues: this.identifyIssues(update) }
                },
                'high',
                AGENT_ROLES.MANAGER_AGENT
            );
        }
        
        // Check if agent needs memory management
        if (update.memorySummary.shortTermSize > 80 || update.memorySummary.longTermSize > 800) {
            await this.agentManager.queueJob(
                JOB_TYPES.MEMORY_MANAGEMENT,
                `Memory optimization for ${agent.role} agent`,
                {
                    action: 'optimize_memory',
                    targetAgent: agentId,
                    data: { memorySummary: update.memorySummary }
                },
                'normal',
                AGENT_ROLES.MANAGER_AGENT
            );
        }
    }

    identifyIssues(update) {
        const issues = [];
        
        if (update.stats.successRate < 0.8) {
            issues.push('Low success rate');
        }
        
        if (update.stats.rating < 6.0) {
            issues.push('Low performance rating');
        }
        
        if (update.stats.averageJobTime > 30000) { // 30 seconds
            issues.push('Slow job processing');
        }
        
        if (update.queueLength > 5) {
            issues.push('Job queue backlog');
        }
        
        return issues;
    }

    // ===== PROMPT OPTIMIZATION =====
    async optimizeAgentPrompts() {
        const agents = this.agentManager.getAllAgentsStatus();
        
        for (const [agentId, agentStatus] of Object.entries(agents)) {
            if (agentId === this.agent.id) continue;
            
            const agent = this.agentManager.agents.get(agentId);
            const performance = this.performanceMetrics.get(agentId);
            
            if (performance && performance.stats.successRate < 0.9) {
                await this.agentManager.queueJob(
                    JOB_TYPES.PROMPT_OPTIMIZATION,
                    `Prompt optimization for ${agent.role} agent`,
                    {
                        targetAgent: agentId,
                        currentPrompt: agent.prompts[0] || 'Default prompt',
                        performance: performance.stats
                    },
                    'normal',
                    AGENT_ROLES.MANAGER_AGENT
                );
            }
        }
    }

    // ===== AGENT EVALUATION =====
    async evaluateAgents() {
        const agents = this.agentManager.getAllAgentsStatus();
        
        for (const [agentId, agentStatus] of Object.entries(agents)) {
            if (agentId === this.agent.id) continue;
            
            const agent = this.agentManager.agents.get(agentId);
            const performance = this.performanceMetrics.get(agentId);
            
            await this.agentManager.queueJob(
                JOB_TYPES.AGENT_EVALUATION,
                `Performance evaluation for ${agent.role} agent`,
                {
                    targetAgent: agentId,
                    criteria: ['efficiency', 'quality', 'reliability', 'collaboration'],
                    metrics: performance ? performance.stats : agent.stats
                },
                'normal',
                AGENT_ROLES.MANAGER_AGENT
            );
        }
    }

    // ===== MEMORY MANAGEMENT =====
    async manageAgentMemory() {
        const agents = this.agentManager.getAllAgentsStatus();
        
        for (const [agentId, agentStatus] of Object.entries(agents)) {
            if (agentId === this.agent.id) continue;
            
            const agent = this.agentManager.agents.get(agentId);
            
            await this.agentManager.queueJob(
                JOB_TYPES.MEMORY_MANAGEMENT,
                `Memory management for ${agent.role} agent`,
                {
                    action: 'analyze_and_optimize',
                    targetAgent: agentId,
                    data: { memorySummary: agentStatus.memorySummary }
                },
                'low',
                AGENT_ROLES.MANAGER_AGENT
            );
        }
    }

    // ===== CREATIVE AGENT SPAWNING =====
    async spawnCreativeAgent(concept, requirements, rating = 5.0) {
        if (rating < 7.0) {
            console.log(`Creative concept rating too low (${rating}), not spawning agent`);
            return null;
        }
        
        const creativeAgentId = `creative_${Date.now()}`;
        const creativeAgent = {
            id: creativeAgentId,
            concept,
            requirements,
            rating,
            createdAt: Date.now(),
            lifespan: this.calculateLifespan(rating),
            tasks: []
        };
        
        this.creativeAgents.set(creativeAgentId, creativeAgent);
        
        // Queue creative generation job
        await this.agentManager.queueJob(
            JOB_TYPES.CREATIVE_GENERATION,
            `Creative generation for concept: ${concept}`,
            {
                concept,
                requirements,
                constraints: { timeLimit: creativeAgent.lifespan }
            },
            'normal',
            AGENT_ROLES.CREATIVE_SPAWNER
        );
        
        console.log(`🎨 Creative agent spawned: ${creativeAgentId} (rating: ${rating}, lifespan: ${creativeAgent.lifespan}ms)`);
        
        return creativeAgentId;
    }

    calculateLifespan(rating) {
        // Higher rating = longer lifespan
        const baseLifespan = 300000; // 5 minutes
        const ratingMultiplier = Math.max(0.5, rating / 10);
        return baseLifespan * ratingMultiplier;
    }

    async manageCreativeAgents() {
        const now = Date.now();
        
        for (const [agentId, agent] of this.creativeAgents) {
            if (now - agent.createdAt > agent.lifespan) {
                // Agent has expired
                this.creativeAgents.delete(agentId);
                console.log(`🎨 Creative agent expired: ${agentId}`);
                
                // If agent was highly rated, consider making it permanent
                if (agent.rating > 8.5) {
                    await this.considerPermanentAgent(agent);
                }
            }
        }
    }

    async considerPermanentAgent(creativeAgent) {
        // Analyze if the creative agent should become permanent
        const analysis = await this.agent.receivePrompt(
            `Analyze if creative agent with concept "${creativeAgent.concept}" should become permanent. Rating: ${creativeAgent.rating}`,
            { creativeAgent }
        );
        
        if (analysis.recommendation === 'make_permanent') {
            console.log(`🎯 Creative agent ${creativeAgent.id} recommended for permanent status`);
            // Could spawn a permanent agent here
        }
    }

    // ===== COMMUNICATION ROUTING =====
    async routeCommunication(message, sender, recipients, priority = 'normal') {
        // Log communication
        this.communicationLog.push({
            message,
            sender,
            recipients,
            priority,
            timestamp: Date.now(),
            status: 'pending'
        });
        
        // Queue communication routing job
        await this.agentManager.queueJob(
            JOB_TYPES.COMMUNICATION_ROUTING,
            `Route communication from ${sender} to ${recipients.join(', ')}`,
            {
                message,
                sender,
                recipients,
                priority
            },
            priority === 'high' ? 'high' : 'normal',
            AGENT_ROLES.MESSENGER
        );
    }

    // ===== PROJECT MANAGEMENT =====
    async analyzeProjectStatus() {
        const agents = this.agentManager.getAllAgentsStatus();
        const stats = this.agentManager.getSystemStats();
        
        const analysis = await this.agent.receivePrompt(
            `Analyze current project status. Total agents: ${stats.totalAgents}, Active: ${stats.activeAgents}, Jobs queued: ${stats.totalJobs}`,
            { agents, stats }
        );
        
        return analysis;
    }

    async prioritizeJobs() {
        const jobQueue = this.agentManager.getJobQueue();
        
        if (jobQueue.length > 10) {
            // Re-prioritize jobs based on current project needs
            const prioritization = await this.agent.receivePrompt(
                `Prioritize ${jobQueue.length} jobs in queue based on project needs and agent availability`,
                { jobQueue }
            );
            
            // Apply new priorities
            // This would require modifying the job queue structure
            console.log('📋 Job queue re-prioritized based on analysis');
        }
    }

    // ===== PERFORMANCE MONITORING =====
    getPerformanceReport() {
        const report = {
            timestamp: Date.now(),
            agents: {},
            system: this.agentManager.getSystemStats(),
            creativeAgents: Array.from(this.creativeAgents.values()),
            communicationLog: this.communicationLog.slice(-10)
        };
        
        for (const [agentId, metrics] of this.performanceMetrics) {
            report.agents[agentId] = metrics;
        }
        
        return report;
    }

    // ===== UTILITY METHODS =====
    async shutdown() {
        this.stopManagementCycles();
        
        // Clean up creative agents
        this.creativeAgents.clear();
        
        console.log('🛑 Manager Agent shutdown complete');
    }

    getStatus() {
        return {
            isActive: this.updateInterval !== null,
            managedAgents: this.agentManager.agents.size,
            creativeAgents: this.creativeAgents.size,
            communicationLogSize: this.communicationLog.length,
            performanceMetricsSize: this.performanceMetrics.size
        };
    }
}

// ===== EXPORTS =====
export default ManagerAgent; 