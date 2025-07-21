/**
 * Advanced Prompting System Index
 * Unified interface for MIT Sloan's Effective Prompts strategies
 * 
 * This module provides access to all advanced prompting capabilities:
 * - Context provision and role-based prompting
 * - Specificity and constraint management
 * - Conversation building and iterative refinement
 * - Multiple prompt types (zero-shot, few-shot, role-based, etc.)
 * - Success tracking and optimization
 */

export { AdvancedPromptEngine, advancedPromptEngine } from './AdvancedPromptEngine.js';
export { PromptOptimizer, promptOptimizer } from './PromptOptimizer.js';
export { PromptEnhancementSystem, promptEnhancementSystem } from './PromptEnhancementSystem.js';

/**
 * Unified Prompting Interface
 * Provides a simple API for using all MIT Sloan prompting strategies
 */
export class UnifiedPromptingInterface {
  constructor() {
    this.engine = new (await import('./AdvancedPromptEngine.js')).AdvancedPromptEngine();
    this.optimizer = new (await import('./PromptOptimizer.js')).PromptOptimizer();
    this.enhancer = new (await import('./PromptEnhancementSystem.js')).PromptEnhancementSystem();
  }

  /**
   * Quick prompt enhancement using MIT Sloan's core strategies
   */
  async enhancePrompt(prompt, options = {}) {
    const {
      strategy = 'comprehensive',
      role = 'AI Gaming Expert',
      includeExamples = true,
      includeContext = true,
      addSpecificity = true
    } = options;

    switch (strategy) {
      case 'context':
        return this.enhancer.enhanceWithContext(prompt, { role });
      
      case 'specificity':
        return this.enhancer.enhanceWithSpecificity(prompt, { includeExamples });
      
      case 'conversation':
        return this.enhancer.enhanceWithConversation(prompt);
      
      case 'comprehensive':
        return this.enhancer.createComprehensivePrompt(prompt, {
          role,
          includeExamples,
          includeContext,
          addSpecificity
        });
      
      default:
        return prompt;
    }
  }

  /**
   * Generate prompts for specific Rekursing use cases
   */
  async generateRekursingPrompts(useCase, options = {}) {
    return this.engine.generateRekursingPrompt(useCase, options);
  }

  /**
   * Optimize existing prompts using iterative refinement
   */
  async optimizePrompt(prompt, options = {}) {
    return this.optimizer.optimizePrompt(prompt, options);
  }

  /**
   * Create prompts using different MIT Sloan prompt types
   */
  async createPromptByType(type, instruction, options = {}) {
    return this.enhancer.createPromptByType(type, instruction, options);
  }

  /**
   * Apply all MIT Sloan strategies to a prompt
   */
  async applyAllStrategies(prompt, strategies = ['context', 'specificity', 'conversation']) {
    return this.enhancer.applyMITStrategies(prompt, strategies);
  }
}

// Export the unified interface
export const unifiedPrompting = new UnifiedPromptingInterface();

/**
 * MIT Sloan Prompting Strategies Reference
 * Quick reference for implementing effective prompts
 */
export const MITPromptingStrategies = {
  // Strategy 1: Provide Context
  CONTEXT: {
    description: 'Give AI specific roles and background information',
    implementation: (prompt, role = 'expert') => `You are a ${role}. ${prompt}`,
    examples: [
      'You are an AI gaming expert working on Rekursing platform...',
      'As a technical architect specializing in scalable systems...',
      'From the perspective of a creative director...'
    ]
  },

  // Strategy 2: Be Specific
  SPECIFICITY: {
    description: 'Include detailed constraints, examples, and requirements',
    implementation: (prompt, constraints = []) => {
      const constraintText = constraints.length > 0 
        ? `\n\nConstraints:\n${constraints.map(c => `- ${c}`).join('\n')}`
        : '';
      return `${prompt}${constraintText}`;
    },
    examples: [
      'Include specific technical constraints',
      'Specify desired format and length',
      'Define target audience clearly',
      'Add measurable success criteria'
    ]
  },

  // Strategy 3: Build on Conversation
  CONVERSATION: {
    description: 'Enable iterative refinement and conversation continuity',
    implementation: (prompt, previousResponse = '') => {
      if (!previousResponse) return prompt;
      return `Based on the previous response: "${previousResponse.substring(0, 100)}...", please refine: ${prompt}`;
    },
    examples: [
      'Building on our previous discussion...',
      'Following up on the earlier response...',
      'To improve upon the previous answer...'
    ]
  },

  // Strategy 4: Use Different Prompt Types
  PROMPT_TYPES: {
    ZERO_SHOT: 'Simple, clear instructions without examples',
    FEW_SHOT: 'Provide examples to mimic',
    ROLE_BASED: 'Assume specific persona or viewpoint',
    CONTEXTUAL: 'Include relevant background information',
    INSTRUCTIONAL: 'Direct commands with verbs',
    META: 'Behind-the-scenes instructions'
  }
};

/**
 * Quick utility functions for common prompting tasks
 */
export const PromptUtils = {
  /**
   * Create a role-based prompt quickly
   */
  createRolePrompt: (prompt, role = 'AI Gaming Expert') => {
    return MITPromptingStrategies.CONTEXT.implementation(prompt, role);
  },

  /**
   * Add specificity to any prompt
   */
  addSpecificity: (prompt, constraints = []) => {
    return MITPromptingStrategies.SPECIFICITY.implementation(prompt, constraints);
  },

  /**
   * Build on conversation
   */
  buildOnConversation: (prompt, previousResponse = '') => {
    return MITPromptingStrategies.CONVERSATION.implementation(prompt, previousResponse);
  },

  /**
   * Create a comprehensive prompt with all strategies
   */
  createComprehensivePrompt: (prompt, options = {}) => {
    const {
      role = 'AI Gaming Expert',
      constraints = [],
      previousResponse = '',
      includeExamples = true
    } = options;

    let enhancedPrompt = prompt;

    // Add role
    enhancedPrompt = PromptUtils.createRolePrompt(enhancedPrompt, role);

    // Add specificity
    const allConstraints = [
      'Consider technical limitations',
      'Include performance considerations',
      'Address scalability concerns',
      ...constraints
    ];
    enhancedPrompt = PromptUtils.addSpecificity(enhancedPrompt, allConstraints);

    // Add conversation context
    if (previousResponse) {
      enhancedPrompt = PromptUtils.buildOnConversation(enhancedPrompt, previousResponse);
    }

    // Add examples request
    if (includeExamples) {
      enhancedPrompt += '\n\nPlease include practical examples and code snippets where relevant.';
    }

    return enhancedPrompt;
  }
};

// Export default for easy importing
export default {
  unifiedPrompting,
  MITPromptingStrategies,
  PromptUtils,
  AdvancedPromptEngine: (await import('./AdvancedPromptEngine.js')).AdvancedPromptEngine,
  PromptOptimizer: (await import('./PromptOptimizer.js')).PromptOptimizer,
  PromptEnhancementSystem: (await import('./PromptEnhancementSystem.js')).PromptEnhancementSystem
}; 