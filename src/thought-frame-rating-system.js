/**
 * Thought Frame Rating System
 * Integrates relative rating with Chain-of-Thought monitoring for project prioritization
 */

import ChainOfThoughtMonitor from './chain-of-thought-monitor.js';

export class ThoughtFrameRatingSystem {
    constructor(config = {}) {
        this.config = {
            enableThoughtMonitoring: true,
            enableGitIntegration: true,
            enableAPIIntegration: true,
            ratingThreshold: 0.3,
            priorityWeights: {
                combat: 0.4,
                system: 0.3,
                performance: 0.2,
                ai: 0.15,
                graphics: 0.1,
                networking: 0.1,
                tools: 0.05
            },
            ...config
        };

        // Thought monitoring system
        this.thoughtMonitor = this.config.enableThoughtMonitoring ? 
            new ChainOfThoughtMonitor({
                enableRealTimeMonitoring: true,
                enableGitIntegration: this.config.enableGitIntegration,
                enableAPIIntegration: this.config.enableAPIIntegration
            }) : null;

        // Project objectives and their relative importance
        this.projectObjectives = {
            core_gameplay: {
                name: 'Core Gameplay',
                description: 'Essential game mechanics and systems',
                weight: 0.4,
                subObjectives: {
                    combat_system: { name: 'Combat System', weight: 0.3, rating: 0.8 },
                    movement_system: { name: 'Movement System', weight: 0.2, rating: 0.7 },
                    physics_system: { name: 'Physics System', weight: 0.2, rating: 0.6 },
                    weapon_system: { name: 'Weapon System', weight: 0.3, rating: 0.8 }
                }
            },
            multiplayer: {
                name: 'Multiplayer System',
                description: 'Real-time multiplayer functionality',
                weight: 0.25,
                subObjectives: {
                    networking: { name: 'Networking', weight: 0.4, rating: 0.8 },
                    synchronization: { name: 'Synchronization', weight: 0.3, rating: 0.7 },
                    chat_system: { name: 'Chat System', weight: 0.2, rating: 0.6 },
                    matchmaking: { name: 'Matchmaking', weight: 0.1, rating: 0.4 }
                }
            },
            ai_systems: {
                name: 'AI Systems',
                description: 'Artificial intelligence and agent systems',
                weight: 0.2,
                subObjectives: {
                    agent_system: { name: 'Agent System', weight: 0.4, rating: 0.9 },
                    pathfinding: { name: 'Pathfinding', weight: 0.2, rating: 0.6 },
                    adaptive_ai: { name: 'Adaptive AI', weight: 0.3, rating: 0.7 },
                    thought_monitoring: { name: 'Thought Monitoring', weight: 0.1, rating: 0.9 }
                }
            },
            graphics: {
                name: 'Graphics & Visual Effects',
                description: 'Visual quality and rendering systems',
                weight: 0.1,
                subObjectives: {
                    rendering: { name: 'Rendering', weight: 0.3, rating: 0.7 },
                    materials: { name: 'Materials', weight: 0.2, rating: 0.6 },
                    effects: { name: 'Visual Effects', weight: 0.3, rating: 0.5 },
                    optimization: { name: 'Optimization', weight: 0.2, rating: 0.6 }
                }
            },
            tools: {
                name: 'Development Tools',
                description: 'Tools and utilities for development',
                weight: 0.05,
                subObjectives: {
                    debug_tools: { name: 'Debug Tools', weight: 0.3, rating: 0.8 },
                    performance_tools: { name: 'Performance Tools', weight: 0.2, rating: 0.7 },
                    ai_tools: { name: 'AI Tools', weight: 0.3, rating: 0.8 },
                    documentation: { name: 'Documentation', weight: 0.2, rating: 0.6 }
                }
            }
        };

        // Thought frames for continuous development
        this.thoughtFrames = new Map();
        this.activeFrames = [];
        this.completedFrames = [];
        this.pendingFrames = [];

        // Performance metrics
        this.metrics = {
            totalThoughts: 0,
            highPriorityThoughts: 0,
            lowPriorityThoughts: 0,
            averageRating: 0,
            framesGenerated: 0,
            framesCompleted: 0,
            framesSkipped: 0
        };

        this.initialize();
    }

    async initialize() {
        console.log('🧠 Initializing Thought Frame Rating System...');

        // Initialize thought frames
        this.generateInitialThoughtFrames();

        // Complete the advanced combat mechanics frame since it's been implemented
        this.completeFrame('advanced_combat_mechanics', {
            implemented: true,
            features: [
                'Advanced hit detection with raycasting',
                'Damage system with hitbox multipliers',
                'Visual feedback (hit markers, damage numbers, blood effects)',
                'Screen shake and kill effects',
                'Combat analytics and statistics',
                'Integration with thought monitoring'
            ],
            performance: 'excellent',
            integration: 'complete'
        });

        // Complete the environmental destruction frame since it's been implemented
        this.completeFrame('environmental_destruction', {
            implemented: true,
            features: [
                'Destructible terrain with deformation',
                'Destructible objects with health system',
                'Impact craters and debris system',
                'Terrain recovery over time',
                'Environmental impact detection',
                'Integration with projectile system'
            ],
            performance: 'excellent',
            integration: 'complete'
        });

        // Record initialization thought
        if (this.thoughtMonitor) {
            await this.recordThought('system', {
                thought: 'Thought Frame Rating System initialized with project objectives',
                reasoning: [
                    'Analyzed project objectives and their relative importance',
                    'Generated initial thought frames for development',
                    'Configured rating system with priority weights',
                    'Set up integration with Chain-of-Thought monitoring',
                    'Completed advanced combat mechanics implementation'
                ],
                confidence: 0.9
            }, {
                role: 'system',
                phase: 'initialization',
                context: 'thought_frame_setup'
            });
        }

        console.log('✅ Thought Frame Rating System initialized');
    }

    generateInitialThoughtFrames() {
        const frames = [
            {
                id: 'fps_enhancement',
                title: 'FPS System Enhancement',
                description: 'Enhance the FPS system with Browser FPS Template insights',
                category: 'core_gameplay',
                subCategory: 'combat_system',
                priority: 'high',
                estimatedEffort: 8,
                dependencies: [],
                rating: 0.9,
                reasoning: [
                    'Browser FPS Template provides proven FPS mechanics',
                    'Enhances player experience and combat feel',
                    'Integrates with existing mathematical systems',
                    'Improves overall game quality'
                ]
            },
            {
                id: 'weapon_physics',
                title: 'Advanced Weapon Physics',
                description: 'Implement realistic weapon physics and ballistics',
                category: 'core_gameplay',
                subCategory: 'weapon_system',
                priority: 'high',
                estimatedEffort: 6,
                dependencies: ['fps_enhancement'],
                rating: 0.8,
                reasoning: [
                    'Realistic weapon physics improve immersion',
                    'Mathematical integration enhances accuracy',
                    'Supports multiple weapon types',
                    'Enables advanced combat mechanics'
                ]
            },
            {
                id: 'movement_enhancement',
                title: 'Advanced Movement System',
                description: 'Implement wall running, sliding, and advanced movement',
                category: 'core_gameplay',
                subCategory: 'movement_system',
                priority: 'medium',
                estimatedEffort: 5,
                dependencies: [],
                rating: 0.7,
                reasoning: [
                    'Advanced movement increases player engagement',
                    'Enables new tactical possibilities',
                    'Improves game feel and responsiveness',
                    'Supports competitive gameplay'
                ]
            },
            {
                id: 'ai_combat',
                title: 'AI Combat Enhancement',
                description: 'Improve AI combat behavior and tactics',
                category: 'ai_systems',
                subCategory: 'adaptive_ai',
                priority: 'medium',
                estimatedEffort: 7,
                dependencies: ['fps_enhancement'],
                rating: 0.7,
                reasoning: [
                    'Better AI improves single-player experience',
                    'Enables more challenging multiplayer',
                    'Supports adaptive difficulty',
                    'Enhances overall game balance'
                ]
            },
            {
                id: 'performance_optimization',
                title: 'Performance Optimization',
                description: 'Optimize rendering and physics performance',
                category: 'graphics',
                subCategory: 'optimization',
                priority: 'high',
                estimatedEffort: 4,
                dependencies: [],
                rating: 0.8,
                reasoning: [
                    'Performance affects player experience',
                    'Enables higher quality graphics',
                    'Supports more players and objects',
                    'Improves accessibility'
                ]
            },
            {
                id: 'thought_monitoring_integration',
                title: 'Thought Monitoring Integration',
                description: 'Integrate thought monitoring with all systems',
                category: 'ai_systems',
                subCategory: 'thought_monitoring',
                priority: 'medium',
                estimatedEffort: 3,
                dependencies: [],
                rating: 0.6,
                reasoning: [
                    'Provides insights into system behavior',
                    'Enables continuous improvement',
                    'Supports debugging and optimization',
                    'Enhances development workflow'
                ]
            },
            // New high-priority thought frames based on current state
            {
                id: 'advanced_combat_mechanics',
                title: 'Advanced Combat Mechanics',
                description: 'Implement advanced combat mechanics from Browser FPS Template',
                category: 'core_gameplay',
                subCategory: 'combat_system',
                priority: 'high',
                estimatedEffort: 6,
                dependencies: ['fps_enhancement'],
                rating: 0.9,
                reasoning: [
                    'Advanced combat mechanics from Browser FPS Template',
                    'Includes hit detection, damage systems, and feedback',
                    'Enhances player engagement and satisfaction',
                    'Provides competitive advantage in multiplayer'
                ]
            },
            {
                id: 'environmental_interaction',
                title: 'Environmental Interaction System',
                description: 'Implement destructible environments and interactive elements',
                category: 'core_gameplay',
                subCategory: 'physics_system',
                priority: 'high',
                estimatedEffort: 8,
                dependencies: ['weapon_physics'],
                rating: 0.8,
                reasoning: [
                    'Destructible environments increase immersion',
                    'Provides tactical gameplay opportunities',
                    'Enhances visual feedback and satisfaction',
                    'Supports dynamic gameplay scenarios'
                ]
            },
            {
                id: 'advanced_weapon_customization',
                title: 'Advanced Weapon Customization',
                description: 'Implement weapon attachments and customization system',
                category: 'core_gameplay',
                subCategory: 'weapon_system',
                priority: 'medium',
                estimatedEffort: 7,
                dependencies: ['advanced_combat_mechanics'],
                rating: 0.7,
                reasoning: [
                    'Weapon customization increases player engagement',
                    'Provides progression and personalization',
                    'Enables strategic loadout choices',
                    'Supports competitive meta development'
                ]
            },
            {
                id: 'real_time_analytics',
                title: 'Real-time Analytics System',
                description: 'Implement real-time game analytics and metrics',
                category: 'tools',
                subCategory: 'debug_tools',
                priority: 'medium',
                estimatedEffort: 4,
                dependencies: ['thought_monitoring_integration'],
                rating: 0.7,
                reasoning: [
                    'Real-time analytics provide development insights',
                    'Enables data-driven game balancing',
                    'Supports performance monitoring and optimization',
                    'Facilitates player behavior analysis'
                ]
            },
            {
                id: 'advanced_sound_system',
                title: 'Advanced Sound System',
                description: 'Implement 3D positional audio and sound effects',
                category: 'graphics',
                subCategory: 'effects',
                priority: 'medium',
                estimatedEffort: 5,
                dependencies: [],
                rating: 0.6,
                reasoning: [
                    '3D positional audio enhances immersion',
                    'Provides tactical information to players',
                    'Improves overall game atmosphere',
                    'Supports accessibility features'
                ]
            },
            {
                id: 'multiplayer_enhancement',
                title: 'Multiplayer Enhancement',
                description: 'Enhance multiplayer systems with advanced features',
                category: 'multiplayer',
                subCategory: 'networking',
                priority: 'high',
                estimatedEffort: 9,
                dependencies: ['performance_optimization'],
                rating: 0.8,
                reasoning: [
                    'Enhanced multiplayer is core to game success',
                    'Improves player retention and engagement',
                    'Enables competitive and cooperative play',
                    'Supports community building'
                ]
            },
            // New thought frames based on current implementation state
            {
                id: 'environmental_destruction',
                title: 'Environmental Destruction System',
                description: 'Implement destructible environments and terrain deformation',
                category: 'core_gameplay',
                subCategory: 'physics_system',
                priority: 'high',
                estimatedEffort: 7,
                dependencies: ['advanced_combat_mechanics'],
                rating: 0.9,
                reasoning: [
                    'Destructible environments enhance immersion',
                    'Provides tactical gameplay opportunities',
                    'Integrates with existing combat system',
                    'Enables dynamic battlefield evolution'
                ]
            },
            {
                id: 'weapon_attachment_system',
                title: 'Weapon Attachment System',
                description: 'Implement weapon attachments and customization',
                category: 'core_gameplay',
                subCategory: 'weapon_system',
                priority: 'medium',
                estimatedEffort: 6,
                dependencies: ['advanced_combat_mechanics'],
                rating: 0.7,
                reasoning: [
                    'Weapon customization increases player engagement',
                    'Provides progression and personalization',
                    'Enables strategic loadout choices',
                    'Supports competitive meta development'
                ]
            },
            {
                id: 'advanced_ai_tactics',
                title: 'Advanced AI Tactics',
                description: 'Implement advanced AI behavior and tactical decision making',
                category: 'ai_systems',
                subCategory: 'adaptive_ai',
                priority: 'medium',
                estimatedEffort: 8,
                dependencies: ['ai_combat'],
                rating: 0.7,
                reasoning: [
                    'Advanced AI improves single-player experience',
                    'Provides challenging multiplayer opponents',
                    'Enables dynamic difficulty adjustment',
                    'Supports varied gameplay scenarios'
                ]
            },
            {
                id: 'performance_monitoring_dashboard',
                title: 'Performance Monitoring Dashboard',
                description: 'Create real-time performance monitoring and analytics dashboard',
                category: 'tools',
                subCategory: 'debug_tools',
                priority: 'medium',
                estimatedEffort: 4,
                dependencies: ['real_time_analytics'],
                rating: 0.6,
                reasoning: [
                    'Real-time monitoring enables optimization',
                    'Provides development insights',
                    'Supports debugging and troubleshooting',
                    'Facilitates performance tuning'
                ]
            },
            {
                id: 'sound_effects_system',
                title: 'Advanced Sound Effects System',
                description: 'Implement 3D positional audio and dynamic sound effects',
                category: 'graphics',
                subCategory: 'effects',
                priority: 'medium',
                estimatedEffort: 5,
                dependencies: [],
                rating: 0.6,
                reasoning: [
                    '3D positional audio enhances immersion',
                    'Provides tactical information to players',
                    'Improves overall game atmosphere',
                    'Supports accessibility features'
                ]
            }
        ];

        frames.forEach(frame => {
            this.thoughtFrames.set(frame.id, frame);
            this.pendingFrames.push(frame);
        });

        this.metrics.framesGenerated = frames.length;
    }

    // Calculate relative rating for a thought or task
    calculateRelativeRating(thought, context) {
        let baseRating = 0.5;
        let priority = 'medium';
        let impact = 'general';

        // Context-based rating
        if (context.phase) {
            switch (context.phase) {
                case 'combat':
                    baseRating += 0.3;
                    priority = 'high';
                    impact = 'combat';
                    break;
                case 'initialization':
                    baseRating += 0.2;
                    priority = 'high';
                    impact = 'system';
                    break;
                case 'performance_warning':
                    baseRating += 0.4;
                    priority = 'high';
                    impact = 'performance';
                    break;
                case 'optimization':
                    baseRating += 0.3;
                    priority = 'medium';
                    impact = 'performance';
                    break;
                case 'enhancement':
                    baseRating += 0.2;
                    priority = 'medium';
                    impact = 'feature';
                    break;
            }
        }

        // Role-based rating
        if (context.role) {
            const roleWeight = this.config.priorityWeights[context.role] || 0.1;
            baseRating += roleWeight * 0.5;
        }

        // Category-based rating
        if (context.category) {
            const category = this.projectObjectives[context.category];
            if (category) {
                baseRating += category.weight * 0.3;
            }
        }

        // Confidence-based adjustment
        if (thought.confidence) {
            baseRating *= thought.confidence;
        }

        // Mathematical influence
        if (context.mathematicalInfluence) {
            baseRating += 0.1; // Bonus for mathematical integration
        }

        return {
            rating: Math.min(1.0, Math.max(0.0, baseRating)),
            priority,
            impact,
            category: context.category || 'general',
            subCategory: context.subCategory || 'general'
        };
    }

    // Record thought with relative rating
    async recordThought(agentId, thought, context) {
        if (!this.thoughtMonitor) return;

        // Calculate relative rating
        const relativity = this.calculateRelativeRating(thought, context);
        thought.relativity = relativity;

        // Update metrics
        this.metrics.totalThoughts++;
        if (relativity.rating > 0.7) {
            this.metrics.highPriorityThoughts++;
        } else if (relativity.rating < 0.3) {
            this.metrics.lowPriorityThoughts++;
        }

        // Update average rating
        this.metrics.averageRating = 
            ((this.metrics.averageRating * (this.metrics.totalThoughts - 1)) + relativity.rating) / 
            this.metrics.totalThoughts;

        // Record thought
        await this.thoughtMonitor.recordThought(agentId, thought, context);

        // Generate new thought frames based on insights
        this.generateThoughtFramesFromInsights(thought, context);
    }

    // Generate thought frames from insights
    generateThoughtFramesFromInsights(thought, context) {
        const insights = this.extractInsights(thought, context);
        
        insights.forEach(insight => {
            const frame = this.createThoughtFrame(insight);
            if (frame && frame.rating > this.config.ratingThreshold) {
                this.thoughtFrames.set(frame.id, frame);
                this.pendingFrames.push(frame);
                this.metrics.framesGenerated++;
            }
        });
    }

    // Extract insights from thoughts
    extractInsights(thought, context) {
        const insights = [];

        // Performance insights
        if (context.role === 'performance_system' && thought.confidence > 0.7) {
            insights.push({
                type: 'performance_optimization',
                title: 'Performance Optimization Opportunity',
                description: `Optimize ${context.context} based on performance data`,
                priority: 'high',
                rating: 0.8
            });
        }

        // Combat insights
        if (context.role === 'weapon_system' && thought.confidence > 0.8) {
            insights.push({
                type: 'combat_enhancement',
                title: 'Combat System Enhancement',
                description: `Enhance ${context.weapon || 'weapon'} system based on usage data`,
                priority: 'medium',
                rating: 0.7
            });
        }

        // AI insights
        if (context.role === 'ai_system' && thought.confidence > 0.7) {
            insights.push({
                type: 'ai_improvement',
                title: 'AI System Improvement',
                description: `Improve AI behavior based on ${context.context}`,
                priority: 'medium',
                rating: 0.6
            });
        }

        return insights;
    }

    // Create thought frame from insight
    createThoughtFrame(insight) {
        const frameId = `${insight.type}_${Date.now()}`;
        
        return {
            id: frameId,
            title: insight.title,
            description: insight.description,
            category: this.mapInsightToCategory(insight.type),
            subCategory: 'general',
            priority: insight.priority,
            estimatedEffort: this.estimateEffort(insight.type),
            dependencies: [],
            rating: insight.rating,
            reasoning: [
                `Generated from ${insight.type} insight`,
                `Confidence: ${insight.rating}`,
                `Priority: ${insight.priority}`,
                `Expected impact: ${this.estimateImpact(insight.type)}`
            ],
            createdAt: new Date(),
            source: 'insight_generation'
        };
    }

    // Map insight type to project category
    mapInsightToCategory(insightType) {
        const categoryMap = {
            'performance_optimization': 'graphics',
            'combat_enhancement': 'core_gameplay',
            'ai_improvement': 'ai_systems',
            'movement_enhancement': 'core_gameplay',
            'weapon_enhancement': 'core_gameplay',
            'networking_improvement': 'multiplayer',
            'tool_enhancement': 'tools'
        };

        return categoryMap[insightType] || 'general';
    }

    // Estimate effort for different types of tasks
    estimateEffort(taskType) {
        const effortMap = {
            'performance_optimization': 4,
            'combat_enhancement': 6,
            'ai_improvement': 5,
            'movement_enhancement': 5,
            'weapon_enhancement': 4,
            'networking_improvement': 7,
            'tool_enhancement': 3
        };

        return effortMap[taskType] || 3;
    }

    // Estimate impact of different types of tasks
    estimateImpact(taskType) {
        const impactMap = {
            'performance_optimization': 'high',
            'combat_enhancement': 'high',
            'ai_improvement': 'medium',
            'movement_enhancement': 'medium',
            'weapon_enhancement': 'high',
            'networking_improvement': 'high',
            'tool_enhancement': 'low'
        };

        return impactMap[taskType] || 'medium';
    }

    // Get prioritized thought frames
    getPrioritizedFrames(limit = 10) {
        return this.pendingFrames
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);
    }

    // Get frames by category
    getFramesByCategory(category) {
        return this.pendingFrames.filter(frame => frame.category === category);
    }

    // Get frames by priority
    getFramesByPriority(priority) {
        return this.pendingFrames.filter(frame => frame.priority === priority);
    }

    // Complete a thought frame
    completeFrame(frameId, results = {}) {
        const frame = this.thoughtFrames.get(frameId);
        if (!frame) return false;

        frame.completedAt = new Date();
        frame.results = results;
        frame.status = 'completed';

        // Move from pending to completed
        const index = this.pendingFrames.findIndex(f => f.id === frameId);
        if (index !== -1) {
            this.pendingFrames.splice(index, 1);
            this.completedFrames.push(frame);
        }

        this.metrics.framesCompleted++;

        // Record completion thought
        if (this.thoughtMonitor) {
            this.recordThought('system', {
                thought: `Completed thought frame: ${frame.title}`,
                reasoning: [
                    `Frame rating: ${frame.rating}`,
                    `Effort: ${frame.estimatedEffort} hours`,
                    `Results: ${JSON.stringify(results)}`,
                    `Total frames completed: ${this.metrics.framesCompleted}`
                ],
                confidence: 0.9
            }, {
                role: 'system',
                phase: 'completion',
                context: 'frame_completion',
                frameId: frameId
            });
        }

        return true;
    }

    // Skip a thought frame
    skipFrame(frameId, reason = '') {
        const frame = this.thoughtFrames.get(frameId);
        if (!frame) return false;

        frame.skippedAt = new Date();
        frame.skipReason = reason;
        frame.status = 'skipped';

        // Move from pending to completed (skipped)
        const index = this.pendingFrames.findIndex(f => f.id === frameId);
        if (index !== -1) {
            this.pendingFrames.splice(index, 1);
            this.completedFrames.push(frame);
        }

        this.metrics.framesSkipped++;

        // Record skip thought
        if (this.thoughtMonitor) {
            this.recordThought('system', {
                thought: `Skipped thought frame: ${frame.title}`,
                reasoning: [
                    `Reason: ${reason}`,
                    `Frame rating: ${frame.rating}`,
                    `Priority: ${frame.priority}`,
                    `Total frames skipped: ${this.metrics.framesSkipped}`
                ],
                confidence: 0.8
            }, {
                role: 'system',
                phase: 'skip',
                context: 'frame_skip',
                frameId: frameId,
                reason: reason
            });
        }

        return true;
    }

    // Get system statistics
    getStatistics() {
        return {
            metrics: this.metrics,
            objectives: this.projectObjectives,
            frames: {
                total: this.thoughtFrames.size,
                pending: this.pendingFrames.length,
                completed: this.completedFrames.length,
                active: this.activeFrames.length
            },
            categories: this.getCategoryStatistics(),
            priorities: this.getPriorityStatistics()
        };
    }

    // Get category statistics
    getCategoryStatistics() {
        const stats = {};
        Object.keys(this.projectObjectives).forEach(category => {
            stats[category] = {
                pending: this.pendingFrames.filter(f => f.category === category).length,
                completed: this.completedFrames.filter(f => f.category === category).length,
                averageRating: this.calculateAverageRating(category)
            };
        });
        return stats;
    }

    // Get priority statistics
    getPriorityStatistics() {
        const priorities = ['high', 'medium', 'low'];
        const stats = {};
        priorities.forEach(priority => {
            stats[priority] = {
                pending: this.pendingFrames.filter(f => f.priority === priority).length,
                completed: this.completedFrames.filter(f => f.priority === priority).length,
                averageRating: this.calculateAverageRatingByPriority(priority)
            };
        });
        return stats;
    }

    // Calculate average rating for category
    calculateAverageRating(category) {
        const frames = [...this.pendingFrames, ...this.completedFrames]
            .filter(f => f.category === category);
        
        if (frames.length === 0) return 0;
        
        const totalRating = frames.reduce((sum, frame) => sum + frame.rating, 0);
        return totalRating / frames.length;
    }

    // Calculate average rating by priority
    calculateAverageRatingByPriority(priority) {
        const frames = [...this.pendingFrames, ...this.completedFrames]
            .filter(f => f.priority === priority);
        
        if (frames.length === 0) return 0;
        
        const totalRating = frames.reduce((sum, frame) => sum + frame.rating, 0);
        return totalRating / frames.length;
    }

    // Update project objectives
    updateObjective(category, subCategory, rating) {
        if (this.projectObjectives[category] && 
            this.projectObjectives[category].subObjectives[subCategory]) {
            this.projectObjectives[category].subObjectives[subCategory].rating = rating;
        }
    }

    // Get recommendations based on current state
    getRecommendations() {
        const recommendations = [];

        // Performance recommendations
        if (this.metrics.averageRating < 0.6) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                message: 'Consider performance optimization tasks',
                action: 'focus_on_performance_frames'
            });
        }

        // Priority recommendations
        const highPriorityPending = this.pendingFrames.filter(f => f.priority === 'high').length;
        if (highPriorityPending > 5) {
            recommendations.push({
                type: 'priority',
                priority: 'medium',
                message: 'Many high-priority frames pending',
                action: 'focus_on_high_priority_frames'
            });
        }

        // Category balance recommendations
        const categoryStats = this.getCategoryStatistics();
        Object.entries(categoryStats).forEach(([category, stats]) => {
            if (stats.pending > 10) {
                recommendations.push({
                    type: 'balance',
                    priority: 'medium',
                    message: `Many pending frames in ${category}`,
                    action: `focus_on_${category}_frames`
                });
            }
        });

        return recommendations;
    }

    // Cleanup and shutdown
    async shutdown() {
        console.log('🔄 Shutting down Thought Frame Rating System...');

        // Record final statistics
        if (this.thoughtMonitor) {
            const stats = this.getStatistics();
            await this.recordThought('system', {
                thought: 'Thought Frame Rating System shutdown',
                reasoning: [
                    `Total thoughts: ${stats.metrics.totalThoughts}`,
                    `Frames generated: ${stats.metrics.framesGenerated}`,
                    `Frames completed: ${stats.metrics.framesCompleted}`,
                    `Average rating: ${stats.metrics.averageRating.toFixed(2)}`
                ],
                confidence: 0.9
            }, {
                role: 'system',
                phase: 'shutdown',
                context: 'system_shutdown'
            });
        }

        if (this.thoughtMonitor) {
            await this.thoughtMonitor.shutdown();
        }

        console.log('✅ Thought Frame Rating System shutdown complete');
    }
}

export default ThoughtFrameRatingSystem; 