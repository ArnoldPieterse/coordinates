/**
 * AI Enhancement Manager
 * Integrates MIT Sloan's Effective Prompts strategies into Rekursing's AI systems
 * 
 * This manager enhances all AI interactions with:
 * - Advanced prompt engineering
 * - Context-aware responses
 * - Iterative refinement
 * - Performance optimization
 */

import { enhancedAISystem } from './EnhancedAISystem.js';
import { MITPromptingStrategies, PromptUtils } from './prompting/index.js';

export class AIEnhancementManager {
  constructor() {
    this.enhancedAI = enhancedAISystem;
    this.enhancementHistory = [];
    this.performanceMetrics = new Map();
    this.isEnabled = true;
  }

  /**
   * Initialize the AI enhancement manager
   */
  async initialize() {
    console.log('🚀 Initializing AI Enhancement Manager with MIT Sloan Strategies...');
    
    try {
      // Wait for enhanced AI system to be ready
      while (this.enhancedAI.systemStatus !== 'ready') {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log('✅ AI Enhancement Manager initialized successfully');
      return true;
      
    } catch (error) {
      console.error('❌ AI Enhancement Manager initialization failed:', error);
      return false;
    }
  }

  /**
   * Enhance an AI interaction using MIT Sloan strategies
   */
  async enhanceAIInteraction(originalQuery, context = {}, options = {}) {
    if (!this.isEnabled) {
      return { originalQuery, enhanced: false, response: 'AI enhancement disabled' };
    }

    const {
      useContext = true,
      useSpecificity = true,
      useConversation = true,
      useOptimization = true,
      role = 'AI Gaming Expert'
    } = options;

    try {
      // Apply MIT Sloan Strategy 1: Provide Context
      let enhancedQuery = originalQuery;
      if (useContext) {
        enhancedQuery = this.applyContextStrategy(enhancedQuery, { ...context, role });
      }

      // Apply MIT Sloan Strategy 2: Be Specific
      if (useSpecificity) {
        enhancedQuery = this.applySpecificityStrategy(enhancedQuery, context);
      }

      // Apply MIT Sloan Strategy 3: Build on Conversation
      if (useConversation) {
        enhancedQuery = this.applyConversationStrategy(enhancedQuery);
      }

      // Process with enhanced AI system
      const result = await this.enhancedAI.processQuery(enhancedQuery, {
        context: { ...context, role },
        conversation: useConversation,
        optimization: useOptimization,
        enhancement: true
      });

      // Track enhancement metrics
      this.trackEnhancement(originalQuery, result, options);

      return {
        originalQuery,
        enhancedQuery: result.enhancedQuery,
        response: result.response,
        enhanced: true,
        metrics: result.metrics,
        conversationId: result.conversationId
      };

    } catch (error) {
      console.error('❌ AI enhancement failed:', error);
      return {
        originalQuery,
        enhanced: false,
        error: error.message
      };
    }
  }

  /**
   * Apply MIT Sloan Strategy 1: Provide Context
   */
  applyContextStrategy(query, context = {}) {
    const {
      role = 'AI Gaming Expert',
      background = 'Rekursing AI gaming platform',
      audience = 'technical team',
      goal = 'enhance system functionality'
    } = context;

    return PromptUtils.createRolePrompt(query, role) + 
           `\n\nContext: ${background}\nAudience: ${audience}\nGoal: ${goal}`;
  }

  /**
   * Apply MIT Sloan Strategy 2: Be Specific
   */
  applySpecificityStrategy(query, context = {}) {
    const constraints = [
      'Consider technical limitations',
      'Include performance considerations',
      'Address scalability concerns',
      'Consider user experience impact'
    ];

    if (context.additionalConstraints) {
      constraints.push(...context.additionalConstraints);
    }

    return PromptUtils.addSpecificity(query, constraints);
  }

  /**
   * Apply MIT Sloan Strategy 3: Build on Conversation
   */
  applyConversationStrategy(query) {
    const conversationHistory = this.enhancedAI.getConversationHistory(3);
    
    if (conversationHistory.length === 0) {
      return query;
    }

    const lastResponse = conversationHistory[conversationHistory.length - 1].response;
    return PromptUtils.buildOnConversation(query, lastResponse);
  }

  /**
   * Generate enhanced responses for specific Rekursing use cases
   */
  async generateEnhancedRekursingResponse(useCase, options = {}) {
    const enhancedOptions = {
      includeExamples: true,
      includeContext: true,
      addSpecificity: true,
      ...options
    };

    return await this.enhancedAI.generateRekursingResponse(useCase, enhancedOptions);
  }

  /**
   * Track enhancement performance and metrics
   */
  trackEnhancement(originalQuery, result, options) {
    const enhancement = {
      originalQuery,
      enhancedQuery: result.enhancedQuery,
      response: result.response,
      options,
      timestamp: Date.now(),
      metrics: {
        queryEnhancementRatio: result.enhancedQuery.length / originalQuery.length,
        responseLength: result.response.length,
        hasExamples: result.response.includes('example') || result.response.includes('Example'),
        hasCode: result.response.includes('```') || result.response.includes('function'),
        hasRecommendations: result.response.includes('Recommendation') || result.response.includes('suggest')
      }
    };

    this.enhancementHistory.push(enhancement);
    this.performanceMetrics.set(originalQuery, enhancement.metrics);

    // Keep only last 100 enhancements
    if (this.enhancementHistory.length > 100) {
      this.enhancementHistory.shift();
    }
  }

  /**
   * Get enhancement analytics
   */
  getEnhancementAnalytics() {
    const analytics = {
      totalEnhancements: this.enhancementHistory.length,
      averageEnhancementRatio: 0,
      averageResponseLength: 0,
      enhancementEffectiveness: 0,
      recentEnhancements: this.enhancementHistory.slice(-10)
    };

    if (this.enhancementHistory.length > 0) {
      const totalEnhancementRatio = this.enhancementHistory.reduce((sum, enhancement) => 
        sum + enhancement.metrics.queryEnhancementRatio, 0);
      analytics.averageEnhancementRatio = totalEnhancementRatio / this.enhancementHistory.length;

      const totalResponseLength = this.enhancementHistory.reduce((sum, enhancement) => 
        sum + enhancement.metrics.responseLength, 0);
      analytics.averageResponseLength = totalResponseLength / this.enhancementHistory.length;

      const effectiveEnhancements = this.enhancementHistory.filter(enhancement => 
        enhancement.metrics.hasExamples || enhancement.metrics.hasRecommendations).length;
      analytics.enhancementEffectiveness = effectiveEnhancements / this.enhancementHistory.length;
    }

    return analytics;
  }

  /**
   * Enable or disable AI enhancement
   */
  setEnhancementEnabled(enabled) {
    this.isEnabled = enabled;
    console.log(`AI Enhancement ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get system status and health
   */
  getSystemStatus() {
    return {
      enhancedAIStatus: this.enhancedAI.systemStatus,
      enhancementEnabled: this.isEnabled,
      totalEnhancements: this.enhancementHistory.length,
      analytics: this.getEnhancementAnalytics(),
      systemAnalytics: this.enhancedAI.getSystemAnalytics()
    };
  }

  /**
   * Export enhancement data for analysis
   */
  exportEnhancementData() {
    return {
      enhancementHistory: this.enhancementHistory,
      performanceMetrics: Array.from(this.performanceMetrics.entries()),
      analytics: this.getEnhancementAnalytics(),
      systemStatus: this.getSystemStatus()
    };
  }

  /**
   * Clear enhancement history
   */
  clearEnhancementHistory() {
    this.enhancementHistory = [];
    this.performanceMetrics.clear();
    console.log('🗑️ Enhancement history cleared');
  }

  /**
   * Demonstrate MIT Sloan strategies
   */
  demonstrateMITStrategies() {
    const demoQueries = [
      'Design an AI system',
      'Optimize performance',
      'Create user interface',
      'Analyze data patterns'
    ];

    const strategies = [
      {
        name: 'Context Provision',
        apply: (query) => this.applyContextStrategy(query, { role: 'AI Gaming Expert' })
      },
      {
        name: 'Specificity Enhancement',
        apply: (query) => this.applySpecificityStrategy(query)
      },
      {
        name: 'Conversation Building',
        apply: (query) => this.applyConversationStrategy(query)
      }
    ];

    const demonstrations = {};

    demoQueries.forEach(query => {
      demonstrations[query] = {};
      strategies.forEach(strategy => {
        demonstrations[query][strategy.name] = strategy.apply(query);
      });
    });

    return demonstrations;
  }
}

// Export singleton instance
export const aiEnhancementManager = new AIEnhancementManager(); 