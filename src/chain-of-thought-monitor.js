/**
 * Chain-of-Thought Monitoring System
 * Based on OpenAI's Chain-of-Thought Monitoring Research
 * Enhanced with APIs and Git repository integration
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';

export class ChainOfThoughtMonitor extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            enableRealTimeMonitoring: true,
            enableGitIntegration: true,
            enableAPIIntegration: true,
            thoughtHistoryLimit: 1000,
            confidenceThreshold: 0.7,
            reasoningQualityThreshold: 0.8,
            gitCommitInterval: 30000, // 30 seconds
            apiEndpoint: 'http://localhost:3001/api/thoughts',
            gitRepoPath: './thought-history',
            ...config
        };

        // Thought tracking
        this.thoughtHistory = new Map(); // agentId -> thoughts[]
        this.reasoningPatterns = new Map(); // agentId -> patterns[]
        this.confidenceMetrics = new Map(); // agentId -> metrics[]
        this.learningProgress = new Map(); // agentId -> progress[]

        // Real-time monitoring
        this.activeThoughts = new Map(); // agentId -> currentThought
        this.thoughtQueue = [];
        this.monitoringInterval = null;

        // Git integration
        this.gitEnabled = this.config.enableGitIntegration;
        this.lastGitCommit = Date.now();
        this.pendingThoughts = [];

        // API integration
        this.apiEnabled = this.config.enableAPIIntegration;
        this.apiQueue = [];
        this.apiRetryCount = 0;
        this.maxApiRetries = 3;

        // Performance metrics
        this.metrics = {
            totalThoughts: 0,
            highConfidenceThoughts: 0,
            lowConfidenceThoughts: 0,
            averageReasoningQuality: 0,
            thoughtProcessingTime: 0,
            apiCalls: 0,
            gitCommits: 0,
            errors: 0
        };

        this.initialize();
    }

    async initialize() {
        console.log('🧠 Initializing Chain-of-Thought Monitor...');

        // Initialize Git repository if enabled
        if (this.gitEnabled) {
            await this.initializeGitRepo();
        }

        // Start real-time monitoring
        if (this.config.enableRealTimeMonitoring) {
            this.startRealTimeMonitoring();
        }

        // Start API integration
        if (this.apiEnabled) {
            this.startAPIIntegration();
        }

        console.log('✅ Chain-of-Thought Monitor initialized');
    }

    /**
     * Record a new thought with comprehensive monitoring
     */
    async recordThought(agentId, thought, context = {}) {
        const thoughtRecord = {
            id: `thought_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            agentId,
            thought: thought.thought || thought,
            reasoning: thought.reasoning || [],
            confidence: thought.confidence || 0.5,
            context: {
                timestamp: new Date(),
                agentRole: context.role || 'unknown',
                jobId: context.jobId || null,
                phase: context.phase || 'general',
                ...context
            },
            metadata: {
                reasoningQuality: this.analyzeReasoningQuality(thought.reasoning || []),
                thoughtComplexity: this.analyzeThoughtComplexity(thought.thought || thought),
                decisionImpact: this.analyzeDecisionImpact(thought, context),
                learningValue: this.analyzeLearningValue(thought, context)
            }
        };

        // Store in thought history
        if (!this.thoughtHistory.has(agentId)) {
            this.thoughtHistory.set(agentId, []);
        }
        this.thoughtHistory.get(agentId).push(thoughtRecord);

        // Update active thoughts
        this.activeThoughts.set(agentId, thoughtRecord);

        // Analyze reasoning patterns
        this.updateReasoningPatterns(agentId, thoughtRecord);

        // Update confidence metrics
        this.updateConfidenceMetrics(agentId, thoughtRecord);

        // Update learning progress
        this.updateLearningProgress(agentId, thoughtRecord);

        // Update performance metrics
        this.updateMetrics(thoughtRecord);

        // Emit events for real-time monitoring
        this.emit('thought:recorded', thoughtRecord);
        this.emit('agent:thinking', { agentId, thought: thoughtRecord });

        // Queue for API integration
        if (this.apiEnabled) {
            this.apiQueue.push(thoughtRecord);
        }

        // Queue for Git integration
        if (this.gitEnabled) {
            this.pendingThoughts.push(thoughtRecord);
        }

        // Check for high-confidence insights
        if (thoughtRecord.confidence > this.config.confidenceThreshold) {
            this.emit('thought:high-confidence', thoughtRecord);
        }

        // Check for low-confidence warnings
        if (thoughtRecord.confidence < 0.3) {
            this.emit('thought:low-confidence', thoughtRecord);
        }

        return thoughtRecord;
    }

    /**
     * Analyze reasoning quality based on OpenAI's research
     */
    analyzeReasoningQuality(reasoning) {
        if (!Array.isArray(reasoning) || reasoning.length === 0) {
            return 0.3; // Low quality for empty reasoning
        }

        let quality = 0;
        let factors = 0;

        // Factor 1: Reasoning depth (number of steps)
        const depth = reasoning.length;
        quality += Math.min(depth / 5, 1) * 0.3; // Max 30% for depth
        factors++;

        // Factor 2: Reasoning coherence (logical flow)
        const coherence = this.analyzeCoherence(reasoning);
        quality += coherence * 0.3; // 30% for coherence
        factors++;

        // Factor 3: Evidence usage
        const evidenceUsage = this.analyzeEvidenceUsage(reasoning);
        quality += evidenceUsage * 0.2; // 20% for evidence
        factors++;

        // Factor 4: Alternative consideration
        const alternatives = this.analyzeAlternativeConsideration(reasoning);
        quality += alternatives * 0.2; // 20% for alternatives
        factors++;

        return quality / factors;
    }

    /**
     * Analyze thought complexity
     */
    analyzeThoughtComplexity(thought) {
        const text = typeof thought === 'string' ? thought : JSON.stringify(thought);
        
        // Complexity factors
        const wordCount = text.split(' ').length;
        const sentenceCount = text.split(/[.!?]+/).length;
        const uniqueWords = new Set(text.toLowerCase().split(/\W+/)).size;
        
        // Technical terms (indicators of complex thinking)
        const technicalTerms = text.match(/\b(algorithm|optimization|analysis|strategy|pattern|mechanism|system|process|methodology|framework)\b/gi) || [];
        
        // Mathematical expressions
        const mathExpressions = text.match(/\b\d+[\+\-\*\/\^]\d+|\b\d+\.\d+|\b\w+\([^)]*\)/g) || [];
        
        // Complexity score
        let complexity = 0;
        complexity += Math.min(wordCount / 100, 1) * 0.3; // Word count factor
        complexity += Math.min(uniqueWords / 50, 1) * 0.2; // Vocabulary factor
        complexity += Math.min(technicalTerms.length / 5, 1) * 0.3; // Technical terms
        complexity += Math.min(mathExpressions.length / 3, 1) * 0.2; // Mathematical thinking
        
        return Math.min(complexity, 1);
    }

    /**
     * Analyze decision impact
     */
    analyzeDecisionImpact(thought, context) {
        let impact = 0.5; // Default medium impact

        // High impact indicators
        const highImpactKeywords = [
            'critical', 'urgent', 'important', 'priority', 'decision', 'action',
            'strategy', 'plan', 'approach', 'solution', 'fix', 'optimize'
        ];

        const text = typeof thought === 'string' ? thought : JSON.stringify(thought);
        const highImpactCount = highImpactKeywords.filter(keyword => 
            text.toLowerCase().includes(keyword)
        ).length;

        if (highImpactCount > 2) {
            impact = 0.8;
        } else if (highImpactCount > 0) {
            impact = 0.6;
        }

        // Context-based impact adjustment
        if (context.phase === 'decision' || context.phase === 'planning') {
            impact *= 1.2;
        }

        return Math.min(impact, 1);
    }

    /**
     * Analyze learning value
     */
    analyzeLearningValue(thought, context) {
        let learningValue = 0.5; // Default medium learning value

        // Learning indicators
        const learningKeywords = [
            'learn', 'understand', 'discover', 'find', 'realize', 'notice',
            'pattern', 'trend', 'insight', 'observation', 'analysis', 'study'
        ];

        const text = typeof thought === 'string' ? thought : JSON.stringify(thought);
        const learningCount = learningKeywords.filter(keyword => 
            text.toLowerCase().includes(keyword)
        ).length;

        if (learningCount > 2) {
            learningValue = 0.8;
        } else if (learningCount > 0) {
            learningValue = 0.6;
        }

        // Error-based learning
        if (context.error || context.failure) {
            learningValue *= 1.3; // Higher learning value from errors
        }

        return Math.min(learningValue, 1);
    }

    /**
     * Update reasoning patterns for an agent
     */
    updateReasoningPatterns(agentId, thoughtRecord) {
        if (!this.reasoningPatterns.has(agentId)) {
            this.reasoningPatterns.set(agentId, []);
        }

        const patterns = this.reasoningPatterns.get(agentId);
        const pattern = {
            timestamp: new Date(),
            reasoningSteps: thoughtRecord.reasoning.length,
            confidence: thoughtRecord.confidence,
            quality: thoughtRecord.metadata.reasoningQuality,
            complexity: thoughtRecord.metadata.thoughtComplexity
        };

        patterns.push(pattern);

        // Keep only recent patterns
        if (patterns.length > 100) {
            patterns.splice(0, patterns.length - 100);
        }

        // Analyze pattern trends
        this.analyzePatternTrends(agentId);
    }

    /**
     * Update confidence metrics
     */
    updateConfidenceMetrics(agentId, thoughtRecord) {
        if (!this.confidenceMetrics.has(agentId)) {
            this.confidenceMetrics.set(agentId, {
                totalThoughts: 0,
                highConfidence: 0,
                lowConfidence: 0,
                averageConfidence: 0,
                confidenceTrend: []
            });
        }

        const metrics = this.confidenceMetrics.get(agentId);
        metrics.totalThoughts++;
        metrics.averageConfidence = ((metrics.averageConfidence * (metrics.totalThoughts - 1)) + thoughtRecord.confidence) / metrics.totalThoughts;

        if (thoughtRecord.confidence > 0.7) {
            metrics.highConfidence++;
        } else if (thoughtRecord.confidence < 0.3) {
            metrics.lowConfidence++;
        }

        metrics.confidenceTrend.push({
            timestamp: new Date(),
            confidence: thoughtRecord.confidence
        });

        // Keep only recent trend data
        if (metrics.confidenceTrend.length > 50) {
            metrics.confidenceTrend = metrics.confidenceTrend.slice(-50);
        }
    }

    /**
     * Update learning progress
     */
    updateLearningProgress(agentId, thoughtRecord) {
        if (!this.learningProgress.has(agentId)) {
            this.learningProgress.set(agentId, {
                totalThoughts: 0,
                learningValue: 0,
                improvementRate: 0,
                knowledgeGaps: [],
                strengths: []
            });
        }

        const progress = this.learningProgress.get(agentId);
        progress.totalThoughts++;
        progress.learningValue = ((progress.learningValue * (progress.totalThoughts - 1)) + thoughtRecord.metadata.learningValue) / progress.totalThoughts;

        // Track knowledge gaps (low confidence + high complexity)
        if (thoughtRecord.confidence < 0.4 && thoughtRecord.metadata.thoughtComplexity > 0.6) {
            progress.knowledgeGaps.push({
                timestamp: new Date(),
                area: thoughtRecord.context.phase || 'general',
                complexity: thoughtRecord.metadata.thoughtComplexity
            });
        }

        // Track strengths (high confidence + high quality)
        if (thoughtRecord.confidence > 0.8 && thoughtRecord.metadata.reasoningQuality > 0.7) {
            progress.strengths.push({
                timestamp: new Date(),
                area: thoughtRecord.context.phase || 'general',
                quality: thoughtRecord.metadata.reasoningQuality
            });
        }
    }

    /**
     * Get comprehensive thought analysis for an agent
     */
    getAgentThoughtAnalysis(agentId) {
        const thoughts = this.thoughtHistory.get(agentId) || [];
        const patterns = this.reasoningPatterns.get(agentId) || [];
        const confidence = this.confidenceMetrics.get(agentId);
        const learning = this.learningProgress.get(agentId);

        if (thoughts.length === 0) {
            return {
                agentId,
                hasData: false,
                message: 'No thought data available for this agent'
            };
        }

        // Calculate trends
        const recentThoughts = thoughts.slice(-20);
        const confidenceTrend = this.calculateTrend(recentThoughts.map(t => t.confidence));
        const qualityTrend = this.calculateTrend(recentThoughts.map(t => t.metadata.reasoningQuality));

        // Identify patterns
        const commonPatterns = this.identifyCommonPatterns(patterns);
        const improvementAreas = this.identifyImprovementAreas(thoughts);

        return {
            agentId,
            hasData: true,
            summary: {
                totalThoughts: thoughts.length,
                averageConfidence: confidence?.averageConfidence || 0,
                averageQuality: thoughts.reduce((sum, t) => sum + t.metadata.reasoningQuality, 0) / thoughts.length,
                highConfidenceRate: confidence ? (confidence.highConfidence / confidence.totalThoughts) : 0,
                learningProgress: learning?.learningValue || 0
            },
            trends: {
                confidence: confidenceTrend,
                quality: qualityTrend,
                complexity: this.calculateTrend(recentThoughts.map(t => t.metadata.thoughtComplexity))
            },
            patterns: commonPatterns,
            recommendations: this.generateRecommendations(thoughts, patterns, confidence, learning),
            improvementAreas,
            recentActivity: recentThoughts.slice(-5).map(t => ({
                timestamp: t.context.timestamp,
                thought: t.thought.substring(0, 100) + '...',
                confidence: t.confidence,
                quality: t.metadata.reasoningQuality
            }))
        };
    }

    /**
     * Get global thought analysis across all agents
     */
    getGlobalThoughtAnalysis() {
        const allThoughts = Array.from(this.thoughtHistory.values()).flat();
        const allPatterns = Array.from(this.reasoningPatterns.values()).flat();
        const allConfidence = Array.from(this.confidenceMetrics.values());

        if (allThoughts.length === 0) {
            return {
                hasData: false,
                message: 'No thought data available'
            };
        }

        // Global metrics
        const globalMetrics = {
            totalThoughts: allThoughts.length,
            averageConfidence: allThoughts.reduce((sum, t) => sum + t.confidence, 0) / allThoughts.length,
            averageQuality: allThoughts.reduce((sum, t) => sum + t.metadata.reasoningQuality, 0) / allThoughts.length,
            averageComplexity: allThoughts.reduce((sum, t) => sum + t.metadata.thoughtComplexity, 0) / allThoughts.length,
            highConfidenceThoughts: allThoughts.filter(t => t.confidence > 0.7).length,
            lowConfidenceThoughts: allThoughts.filter(t => t.confidence < 0.3).length
        };

        // Agent performance comparison
        const agentPerformance = Array.from(this.thoughtHistory.keys()).map(agentId => {
            const analysis = this.getAgentThoughtAnalysis(agentId);
            return {
                agentId,
                ...analysis.summary
            };
        });

        // System-wide recommendations
        const recommendations = this.generateSystemRecommendations(allThoughts, allPatterns, allConfidence);

        return {
            hasData: true,
            globalMetrics,
            agentPerformance,
            recommendations,
            systemHealth: this.assessSystemHealth(allThoughts, allPatterns)
        };
    }

    /**
     * Initialize Git repository for thought history
     */
    async initializeGitRepo() {
        try {
            const repoPath = this.config.gitRepoPath;
            
            // Create directory if it doesn't exist
            await fs.mkdir(repoPath, { recursive: true });
            
            // Initialize Git repository
            const { execSync } = await import('child_process');
            
            try {
                execSync('git init', { cwd: repoPath });
                console.log('✅ Git repository initialized for thought history');
            } catch (error) {
                // Repository might already exist
                console.log('ℹ️ Git repository already exists');
            }

            // Create .gitignore
            const gitignoreContent = `
# Ignore temporary files
*.tmp
*.log
node_modules/
.env
            `.trim();

            await fs.writeFile(path.join(repoPath, '.gitignore'), gitignoreContent);
            
        } catch (error) {
            console.error('❌ Failed to initialize Git repository:', error);
            this.gitEnabled = false;
        }
    }

    /**
     * Start real-time monitoring
     */
    startRealTimeMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.processThoughtQueue();
            this.emit('monitoring:tick', {
                activeThoughts: this.activeThoughts.size,
                queueLength: this.thoughtQueue.length,
                metrics: this.metrics
            });
        }, 1000); // Check every second

        console.log('✅ Real-time monitoring started');
    }

    /**
     * Start API integration
     */
    startAPIIntegration() {
        setInterval(() => {
            this.processAPIQueue();
        }, 5000); // Process API queue every 5 seconds

        console.log('✅ API integration started');
    }

    /**
     * Process API queue
     */
    async processAPIQueue() {
        if (this.apiQueue.length === 0) return;

        const thoughts = this.apiQueue.splice(0, 10); // Process up to 10 thoughts at once

        try {
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    thoughts,
                    timestamp: new Date(),
                    batchId: `batch_${Date.now()}`
                })
            });

            if (response.ok) {
                this.metrics.apiCalls++;
                this.emit('api:success', { count: thoughts.length });
            } else {
                throw new Error(`API call failed: ${response.status}`);
            }
        } catch (error) {
            this.metrics.errors++;
            this.apiRetryCount++;
            
            if (this.apiRetryCount < this.maxApiRetries) {
                // Re-queue thoughts for retry
                this.apiQueue.unshift(...thoughts);
            }
            
            this.emit('api:error', { error: error.message, retryCount: this.apiRetryCount });
        }
    }

    /**
     * Process thought queue and Git commits
     */
    async processThoughtQueue() {
        // Check if it's time for a Git commit
        if (this.gitEnabled && this.pendingThoughts.length > 0 && 
            Date.now() - this.lastGitCommit > this.config.gitCommitInterval) {
            await this.commitThoughtsToGit();
        }
    }

    /**
     * Commit thoughts to Git repository
     */
    async commitThoughtsToGit() {
        if (this.pendingThoughts.length === 0) return;

        try {
            const { execSync } = await import('child_process');
            const repoPath = this.config.gitRepoPath;

            // Create thought history file
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `thoughts_${timestamp}.json`;
            const filepath = path.join(repoPath, filename);

            const thoughtData = {
                timestamp: new Date(),
                batchId: `batch_${Date.now()}`,
                thoughts: this.pendingThoughts,
                summary: {
                    totalThoughts: this.pendingThoughts.length,
                    agents: [...new Set(this.pendingThoughts.map(t => t.agentId))],
                    averageConfidence: this.pendingThoughts.reduce((sum, t) => sum + t.confidence, 0) / this.pendingThoughts.length
                }
            };

            await fs.writeFile(filepath, JSON.stringify(thoughtData, null, 2));

            // Git operations
            execSync('git add .', { cwd: repoPath });
            execSync(`git commit -m "Add thought batch: ${this.pendingThoughts.length} thoughts from ${thoughtData.summary.agents.length} agents"`, { cwd: repoPath });

            this.metrics.gitCommits++;
            this.lastGitCommit = Date.now();
            this.pendingThoughts = [];

            this.emit('git:committed', { filename, thoughtCount: thoughtData.thoughts.length });

        } catch (error) {
            console.error('❌ Failed to commit thoughts to Git:', error);
            this.metrics.errors++;
        }
    }

    /**
     * Utility methods
     */
    analyzeCoherence(reasoning) {
        if (reasoning.length < 2) return 0.5;
        
        // Simple coherence check based on logical flow
        let coherence = 0;
        for (let i = 1; i < reasoning.length; i++) {
            const prev = reasoning[i - 1];
            const curr = reasoning[i];
            
            // Check if current step builds on previous
            if (curr.toLowerCase().includes(prev.toLowerCase().split(' ').slice(-2).join(' '))) {
                coherence += 1;
            }
        }
        
        return coherence / (reasoning.length - 1);
    }

    analyzeEvidenceUsage(reasoning) {
        const evidenceKeywords = ['because', 'since', 'as', 'due to', 'evidence', 'data', 'fact', 'observation'];
        let evidenceCount = 0;
        
        reasoning.forEach(step => {
            evidenceKeywords.forEach(keyword => {
                if (step.toLowerCase().includes(keyword)) {
                    evidenceCount++;
                }
            });
        });
        
        return Math.min(evidenceCount / reasoning.length, 1);
    }

    analyzeAlternativeConsideration(reasoning) {
        const alternativeKeywords = ['however', 'but', 'alternatively', 'instead', 'on the other hand', 'consider', 'if', 'else'];
        let alternativeCount = 0;
        
        reasoning.forEach(step => {
            alternativeKeywords.forEach(keyword => {
                if (step.toLowerCase().includes(keyword)) {
                    alternativeCount++;
                }
            });
        });
        
        return Math.min(alternativeCount / reasoning.length, 1);
    }

    calculateTrend(values) {
        if (values.length < 2) return 'stable';
        
        const recent = values.slice(-5);
        const earlier = values.slice(-10, -5);
        
        const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length;
        const earlierAvg = earlier.reduce((sum, v) => sum + v, 0) / earlier.length;
        
        const change = recentAvg - earlierAvg;
        const threshold = 0.1;
        
        if (change > threshold) return 'improving';
        if (change < -threshold) return 'declining';
        return 'stable';
    }

    identifyCommonPatterns(patterns) {
        const patternTypes = {
            highConfidence: patterns.filter(p => p.confidence > 0.8).length,
            lowConfidence: patterns.filter(p => p.confidence < 0.3).length,
            complexThinking: patterns.filter(p => p.complexity > 0.7).length,
            simpleThinking: patterns.filter(p => p.complexity < 0.3).length
        };

        return patternTypes;
    }

    identifyImprovementAreas(thoughts) {
        const areas = {};
        
        thoughts.forEach(thought => {
            const phase = thought.context.phase || 'general';
            if (!areas[phase]) {
                areas[phase] = { count: 0, lowConfidence: 0, lowQuality: 0 };
            }
            
            areas[phase].count++;
            if (thought.confidence < 0.4) areas[phase].lowConfidence++;
            if (thought.metadata.reasoningQuality < 0.5) areas[phase].lowQuality++;
        });

        return Object.entries(areas)
            .filter(([_, data]) => data.lowConfidence > data.count * 0.3 || data.lowQuality > data.count * 0.3)
            .map(([phase, data]) => ({
                phase,
                issues: {
                    lowConfidence: data.lowConfidence / data.count,
                    lowQuality: data.lowQuality / data.count
                }
            }));
    }

    generateRecommendations(thoughts, patterns, confidence, learning) {
        const recommendations = [];

        // Confidence-based recommendations
        if (confidence && confidence.lowConfidence > confidence.totalThoughts * 0.3) {
            recommendations.push({
                type: 'confidence',
                priority: 'high',
                message: 'Agent shows low confidence in many decisions. Consider providing more context or training data.',
                action: 'enhance_context_provision'
            });
        }

        // Quality-based recommendations
        const avgQuality = thoughts.reduce((sum, t) => sum + t.metadata.reasoningQuality, 0) / thoughts.length;
        if (avgQuality < 0.6) {
            recommendations.push({
                type: 'quality',
                priority: 'medium',
                message: 'Reasoning quality is below optimal. Consider implementing structured reasoning frameworks.',
                action: 'implement_reasoning_frameworks'
            });
        }

        // Learning-based recommendations
        if (learning && learning.learningValue < 0.5) {
            recommendations.push({
                type: 'learning',
                priority: 'medium',
                message: 'Agent shows limited learning progress. Consider implementing feedback loops.',
                action: 'implement_feedback_loops'
            });
        }

        return recommendations;
    }

    generateSystemRecommendations(allThoughts, allPatterns, allConfidence) {
        const recommendations = [];

        // System-wide confidence issues
        const lowConfidenceRate = allThoughts.filter(t => t.confidence < 0.3).length / allThoughts.length;
        if (lowConfidenceRate > 0.2) {
            recommendations.push({
                type: 'system',
                priority: 'high',
                message: `High rate of low-confidence thoughts (${(lowConfidenceRate * 100).toFixed(1)}%). Consider system-wide improvements.`,
                action: 'system_wide_confidence_improvement'
            });
        }

        // Quality distribution
        const qualityDistribution = allThoughts.map(t => t.metadata.reasoningQuality);
        const qualityVariance = this.calculateVariance(qualityDistribution);
        if (qualityVariance > 0.1) {
            recommendations.push({
                type: 'system',
                priority: 'medium',
                message: 'High variance in reasoning quality across agents. Consider standardizing reasoning processes.',
                action: 'standardize_reasoning_processes'
            });
        }

        return recommendations;
    }

    assessSystemHealth(allThoughts, allPatterns) {
        const health = {
            overall: 'good',
            metrics: {},
            issues: []
        };

        // Calculate health metrics
        const avgConfidence = allThoughts.reduce((sum, t) => sum + t.confidence, 0) / allThoughts.length;
        const avgQuality = allThoughts.reduce((sum, t) => sum + t.metadata.reasoningQuality, 0) / allThoughts.length;

        health.metrics = {
            averageConfidence: avgConfidence,
            averageQuality: avgQuality,
            thoughtVolume: allThoughts.length,
            patternConsistency: this.calculatePatternConsistency(allPatterns)
        };

        // Assess overall health
        if (avgConfidence < 0.5 || avgQuality < 0.5) {
            health.overall = 'poor';
            health.issues.push('Low confidence or quality levels detected');
        } else if (avgConfidence < 0.7 || avgQuality < 0.7) {
            health.overall = 'fair';
            health.issues.push('Moderate confidence or quality levels detected');
        }

        return health;
    }

    calculateVariance(values) {
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        return squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
    }

    calculatePatternConsistency(patterns) {
        if (patterns.length < 2) return 1;
        
        const confidences = patterns.map(p => p.confidence);
        const variance = this.calculateVariance(confidences);
        return Math.max(0, 1 - variance);
    }

    updateMetrics(thoughtRecord) {
        this.metrics.totalThoughts++;
        
        if (thoughtRecord.confidence > 0.7) {
            this.metrics.highConfidenceThoughts++;
        } else if (thoughtRecord.confidence < 0.3) {
            this.metrics.lowConfidenceThoughts++;
        }

        this.metrics.averageReasoningQuality = 
            ((this.metrics.averageReasoningQuality * (this.metrics.totalThoughts - 1)) + 
             thoughtRecord.metadata.reasoningQuality) / this.metrics.totalThoughts;
    }

    /**
     * Cleanup and shutdown
     */
    async shutdown() {
        console.log('🔄 Shutting down Chain-of-Thought Monitor...');

        // Stop monitoring
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        // Final Git commit
        if (this.gitEnabled && this.pendingThoughts.length > 0) {
            await this.commitThoughtsToGit();
        }

        // Final API calls
        if (this.apiEnabled && this.apiQueue.length > 0) {
            await this.processAPIQueue();
        }

        console.log('✅ Chain-of-Thought Monitor shutdown complete');
    }
}

export default ChainOfThoughtMonitor; 