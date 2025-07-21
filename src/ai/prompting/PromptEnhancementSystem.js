/**
 * Prompt Enhancement System
 * Comprehensive implementation of MIT Sloan's Effective Prompts strategies
 * 
 * Key Features:
 * - Context provision and role-based prompting
 * - Specificity and constraint management
 * - Conversation building and iterative refinement
 * - Multiple prompt types (zero-shot, few-shot, role-based, etc.)
 * - Success tracking and optimization
 */

import { advancedPromptEngine } from './AdvancedPromptEngine.js';
import { promptOptimizer } from './PromptOptimizer.js';

export class PromptEnhancementSystem {
  constructor() {
    this.promptEngine = advancedPromptEngine;
    this.optimizer = promptOptimizer;
    this.enhancementHistory = [];
    this.successMetrics = new Map();
  }

  /**
   * MIT Sloan Strategy 1: Provide Context
   * Give AI specific roles and background information
   */
  enhanceWithContext(prompt, contextOptions = {}) {
    const {
      role = 'AI Gaming Expert',
      background = 'Rekursing AI gaming platform development',
      audience = 'technical team',
      goal = 'enhance system functionality',
      domain = 'AI gaming and neural networks'
    } = contextOptions;

    const contextualPrompt = `
Context: You are a ${role} working on ${background}.
Domain: ${domain}
Audience: ${audience}
Goal: ${goal}

${prompt}

Please provide a response that considers this context and is appropriate for the specified audience and goal.
`;

    return this.recordEnhancement('context', prompt, contextualPrompt, contextOptions);
  }

  /**
   * MIT Sloan Strategy 2: Be Specific
   * Include detailed constraints, examples, and requirements
   */
  enhanceWithSpecificity(prompt, specificityOptions = {}) {
    const {
      format = 'structured response',
      length = 'comprehensive',
      tone = 'professional and technical',
      includeExamples = true,
      includeConstraints = true,
      successCriteria = []
    } = specificityOptions;

    let specificPrompt = prompt;

    // Add format requirements
    specificPrompt += `\n\nFormat Requirements:
- Response format: ${format}
- Length: ${length}
- Tone: ${tone}`;

    // Add constraints if requested
    if (includeConstraints) {
      specificPrompt += `\n\nConstraints:
- Consider technical limitations
- Include performance considerations
- Address scalability concerns
- Consider user experience impact`;
    }

    // Add examples if requested
    if (includeExamples) {
      specificPrompt += `\n\nPlease include:
- Practical examples
- Code snippets where relevant
- Real-world applications
- Implementation considerations`;
    }

    // Add success criteria
    if (successCriteria.length > 0) {
      specificPrompt += `\n\nSuccess Criteria:
${successCriteria.map(criteria => `- ${criteria}`).join('\n')}`;
    }

    return this.recordEnhancement('specificity', prompt, specificPrompt, specificityOptions);
  }

  /**
   * MIT Sloan Strategy 3: Build on Conversation
   * Enable iterative refinement and conversation continuity
   */
  enhanceWithConversation(prompt, conversationContext = {}) {
    const {
      previousResponses = [],
      iterationNumber = 1,
      feedback = [],
      contextRetention = true
    } = conversationContext;

    let conversationalPrompt = prompt;

    // Add conversation context
    if (contextRetention && previousResponses.length > 0) {
      conversationalPrompt = `Previous conversation context:\n`;
      previousResponses.forEach((response, index) => {
        conversationalPrompt += `Response ${index + 1}: ${response.substring(0, 150)}...\n`;
      });
      conversationalPrompt += `\nBuilding on this conversation:\n${prompt}`;
    }

    // Add iteration information
    if (iterationNumber > 1) {
      conversationalPrompt += `\n\nThis is iteration ${iterationNumber}. Please refine and improve upon previous responses.`;
    }

    // Add feedback if provided
    if (feedback.length > 0) {
      conversationalPrompt += `\n\nFeedback to incorporate:\n${feedback.map(f => `- ${f}`).join('\n')}`;
    }

    return this.recordEnhancement('conversation', prompt, conversationalPrompt, conversationContext);
  }

  /**
   * MIT Sloan Strategy 4: Use Different Prompt Types
   * Implement various prompting techniques
   */
  createPromptByType(type, instruction, options = {}) {
    switch (type) {
      case 'zero-shot':
        return this.createZeroShotPrompt(instruction);

      case 'few-shot':
        return this.createFewShotPrompt(instruction, options.examples || []);

      case 'role-based':
        return this.createRoleBasedPrompt(instruction, options.role || 'AI Gaming Expert');

      case 'contextual':
        return this.createContextualPrompt(instruction, options);

      case 'instructional':
        return this.createInstructionalPrompt(instruction, options);

      case 'meta':
        return this.createMetaPrompt(instruction, options);

      case 'comprehensive':
        return this.createComprehensivePrompt(instruction, options);

      default:
        return instruction;
    }
  }

  /**
   * Zero-shot prompting: Simple, clear instructions
   */
  createZeroShotPrompt(instruction) {
    return `Please provide a clear and direct response to: ${instruction}`;
  }

  /**
   * Few-shot prompting: Provide examples to mimic
   */
  createFewShotPrompt(instruction, examples) {
    const formattedExamples = examples.map((ex, index) => 
      `Example ${index + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}`
    ).join('\n\n');

    return `${formattedExamples}\n\nNow, following these examples, please respond to: ${instruction}`;
  }

  /**
   * Role-based prompting: Assume specific persona
   */
  createRoleBasedPrompt(instruction, role) {
    const roleDefinitions = {
      'AI Gaming Expert': 'You are an expert in AI-powered gaming systems, neural networks, and recursive learning algorithms.',
      'Technical Architect': 'You are a senior software architect specializing in scalable systems and advanced algorithms.',
      'Creative Director': 'You are a creative director with expertise in user experience design and innovative interfaces.',
      'Data Scientist': 'You are a data scientist specializing in machine learning and predictive modeling.',
      'Business Strategist': 'You are a business strategist with expertise in market analysis and growth strategies.'
    };

    const roleContext = roleDefinitions[role] || 'You are an expert in this field.';
    return `${roleContext}\n\n${instruction}`;
  }

  /**
   * Contextual prompting: Include background information
   */
  createContextualPrompt(instruction, options = {}) {
    const {
      background = 'Rekursing AI gaming platform',
      audience = 'technical team',
      goal = 'enhance functionality'
    } = options;

    return `Context: ${background}
Audience: ${audience}
Goal: ${goal}

${instruction}`;
  }

  /**
   * Instructional prompting: Direct commands with verbs
   */
  createInstructionalPrompt(instruction, options = {}) {
    const {
      action = 'Analyze',
      target = 'the system',
      constraints = 'with focus on performance and scalability'
    } = options;

    return `${action} ${target} ${constraints}. Specifically: ${instruction}`;
  }

  /**
   * Meta prompting: System-level instructions
   */
  createMetaPrompt(instruction, options = {}) {
    const {
      systemBehavior = 'Provide accurate, helpful responses',
      tone = 'professional and technical',
      scope = 'AI gaming systems and development'
    } = options;

    return `System: ${systemBehavior}
Tone: ${tone}
Scope: ${scope}

${instruction}`;
  }

  /**
   * Comprehensive prompting: Combine multiple strategies
   */
  createComprehensivePrompt(instruction, options = {}) {
    const {
      role = 'AI Gaming Expert',
      includeExamples = true,
      includeContext = true,
      addSpecificity = true,
      conversationContext = null
    } = options;

    let comprehensivePrompt = instruction;

    // Add context
    if (includeContext) {
      comprehensivePrompt = this.enhanceWithContext(comprehensivePrompt, { role });
    }

    // Add specificity
    if (addSpecificity) {
      comprehensivePrompt = this.enhanceWithSpecificity(comprehensivePrompt, {
        includeExamples,
        includeConstraints: true
      });
    }

    // Add conversation context
    if (conversationContext) {
      comprehensivePrompt = this.enhanceWithConversation(comprehensivePrompt, conversationContext);
    }

    return comprehensivePrompt;
  }

  /**
   * Generate enhanced prompts for Rekursing use cases
   */
  generateRekursingEnhancedPrompts() {
    const useCases = {
      'ai-system-optimization': {
        instruction: 'Optimize the AI agent system for better player interaction and learning',
        type: 'comprehensive',
        options: {
          role: 'AI Gaming Expert',
          includeExamples: true,
          includeContext: true,
          addSpecificity: true
        }
      },
      'game-mechanics-design': {
        instruction: 'Design innovative game mechanics that leverage AI learning capabilities',
        type: 'role-based',
        options: {
          role: 'Creative Director',
          examples: [
            { input: 'Traditional FPS mechanics', output: 'AI-adaptive gameplay systems' },
            { input: 'Static game rules', output: 'Dynamic rule evolution based on AI learning' }
          ]
        }
      },
      'user-interface-design': {
        instruction: 'Design an intuitive interface for the AI dashboard and player interactions',
        type: 'contextual',
        options: {
          background: 'Rekursing AI gaming platform user interface',
          audience: 'UX designers and developers',
          goal: 'create intuitive AI interaction interfaces'
        }
      },
      'performance-optimization': {
        instruction: 'Optimize system performance for real-time AI processing and gaming',
        type: 'instructional',
        options: {
          action: 'Analyze and optimize',
          target: 'the Rekursing system performance',
          constraints: 'focus on real-time AI processing, gaming performance, and scalability'
        }
      }
    };

    const enhancedPrompts = {};
    
    for (const [useCase, config] of Object.entries(useCases)) {
      enhancedPrompts[useCase] = this.createPromptByType(
        config.type,
        config.instruction,
        config.options
      );
    }

    return enhancedPrompts;
  }

  /**
   * Track enhancement success and metrics
   */
  recordEnhancement(type, originalPrompt, enhancedPrompt, options) {
    const enhancement = {
      type,
      originalPrompt,
      enhancedPrompt,
      options,
      timestamp: Date.now(),
      id: `enhancement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.enhancementHistory.push(enhancement);
    return enhancedPrompt;
  }

  /**
   * Get enhancement history and analytics
   */
  getEnhancementAnalytics() {
    const analytics = {
      totalEnhancements: this.enhancementHistory.length,
      enhancementTypes: {},
      averageEnhancementLength: 0,
      mostUsedOptions: {}
    };

    // Analyze enhancement types
    this.enhancementHistory.forEach(enhancement => {
      analytics.enhancementTypes[enhancement.type] = 
        (analytics.enhancementTypes[enhancement.type] || 0) + 1;
    });

    // Calculate average enhancement length
    const totalLength = this.enhancementHistory.reduce((sum, enhancement) => 
      sum + enhancement.enhancedPrompt.length, 0);
    analytics.averageEnhancementLength = totalLength / this.enhancementHistory.length;

    return analytics;
  }

  /**
   * Apply MIT Sloan strategies to existing prompts
   */
  applyMITStrategies(prompt, strategies = ['context', 'specificity', 'conversation']) {
    let enhancedPrompt = prompt;

    if (strategies.includes('context')) {
      enhancedPrompt = this.enhanceWithContext(enhancedPrompt);
    }

    if (strategies.includes('specificity')) {
      enhancedPrompt = this.enhanceWithSpecificity(enhancedPrompt);
    }

    if (strategies.includes('conversation')) {
      enhancedPrompt = this.enhanceWithConversation(enhancedPrompt);
    }

    return enhancedPrompt;
  }
}

// Export singleton instance
export const promptEnhancementSystem = new PromptEnhancementSystem(); 