/**
 * Prompt Optimization System
 * Implements MIT Sloan's iterative refinement and conversation building strategies
 */

export class PromptOptimizer {
  constructor() {
    this.optimizationHistory = [];
    this.successMetrics = new Map();
    this.refinementStrategies = this.initializeRefinementStrategies();
  }

  initializeRefinementStrategies() {
    return {
      // Add specificity and constraints
      specificity: {
        name: 'Add Specificity',
        description: 'Make prompts more specific with constraints and requirements',
        apply: (prompt) => {
          const enhancements = [
            'Include specific constraints and limitations',
            'Specify the desired format and length',
            'Define the target audience clearly',
            'Add measurable success criteria'
          ];
          return `${prompt}\n\nEnhancements:\n${enhancements.map(e => `- ${e}`).join('\n')}`;
        }
      },

      // Add context and background
      context: {
        name: 'Add Context',
        description: 'Provide relevant background information and context',
        apply: (prompt) => {
          const contextElements = [
            'Include relevant background information',
            'Specify the problem domain',
            'Add user persona and goals',
            'Include technical constraints'
          ];
          return `Context: ${contextElements.join(', ')}\n\n${prompt}`;
        }
      },

      // Add examples (few-shot learning)
      examples: {
        name: 'Add Examples',
        description: 'Include examples to guide the AI response',
        apply: (prompt) => {
          return `${prompt}\n\nPlease provide examples similar to:\n- Example 1: [specific example]\n- Example 2: [specific example]`;
        }
      },

      // Role-based prompting
      role: {
        name: 'Role-Based Prompting',
        description: 'Assign specific role or persona to the AI',
        apply: (prompt, role = 'expert') => {
          return `You are a ${role}. ${prompt}`;
        }
      },

      // Iterative refinement
      iterative: {
        name: 'Iterative Refinement',
        description: 'Build on previous responses for improvement',
        apply: (prompt, previousResponse) => {
          return `Based on the previous response: "${previousResponse.substring(0, 100)}...", please refine and improve: ${prompt}`;
        }
      }
    };
  }

  /**
   * Optimize a prompt using MIT Sloan's iterative approach
   */
  optimizePrompt(originalPrompt, options = {}) {
    const {
      targetRole = 'AI Gaming Expert',
      includeExamples = true,
      includeContext = true,
      addSpecificity = true,
      iterationCount = 3
    } = options;

    let optimizedPrompt = originalPrompt;
    const optimizationSteps = [];

    // Step 1: Add context
    if (includeContext) {
      optimizedPrompt = this.refinementStrategies.context.apply(optimizedPrompt);
      optimizationSteps.push('context-added');
    }

    // Step 2: Add role-based prompting
    optimizedPrompt = this.refinementStrategies.role.apply(optimizedPrompt, targetRole);
    optimizationSteps.push('role-assigned');

    // Step 3: Add specificity
    if (addSpecificity) {
      optimizedPrompt = this.refinementStrategies.specificity.apply(optimizedPrompt);
      optimizationSteps.push('specificity-enhanced');
    }

    // Step 4: Add examples if requested
    if (includeExamples) {
      optimizedPrompt = this.refinementStrategies.examples.apply(optimizedPrompt);
      optimizationSteps.push('examples-included');
    }

    // Step 5: Iterative refinement
    for (let i = 1; i < iterationCount; i++) {
      optimizedPrompt = this.refinementStrategies.iterative.apply(optimizedPrompt, `Iteration ${i} response`);
      optimizationSteps.push(`iteration-${i}`);
    }

    // Record optimization
    this.optimizationHistory.push({
      original: originalPrompt,
      optimized: optimizedPrompt,
      steps: optimizationSteps,
      timestamp: Date.now()
    });

    return optimizedPrompt;
  }

  /**
   * Build conversation-based prompts following MIT Sloan's strategy
   */
  buildConversationPrompt(basePrompt, conversationHistory = []) {
    if (conversationHistory.length === 0) {
      return basePrompt;
    }

    const conversationContext = conversationHistory
      .map((entry, index) => `Q${index + 1}: ${entry.question}\nA${index + 1}: ${entry.answer.substring(0, 200)}...`)
      .join('\n\n');

    return `Previous conversation:\n${conversationContext}\n\nBuilding on this conversation, please answer:\n${basePrompt}`;
  }

  /**
   * Create different prompt types as per MIT Sloan's guide
   */
  createPromptType(type, instruction, options = {}) {
    switch (type) {
      case 'zero-shot':
        return instruction;

      case 'few-shot':
        const examples = options.examples || [
          { input: 'Example input 1', output: 'Example output 1' },
          { input: 'Example input 2', output: 'Example output 2' }
        ];
        const formattedExamples = examples.map((ex, i) => 
          `Example ${i + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}`
        ).join('\n\n');
        return `${formattedExamples}\n\nNow, following these examples:\n${instruction}`;

      case 'role-based':
        const role = options.role || 'expert';
        const roleContext = options.roleContext || 'You are an expert in this field.';
        return `${roleContext}\n\n${instruction}`;

      case 'contextual':
        const context = options.context || 'General context';
        const audience = options.audience || 'general audience';
        return `Context: ${context}\nAudience: ${audience}\n\n${instruction}`;

      default:
        return instruction;
    }
  }

  /**
   * Track prompt success metrics
   */
  trackPromptSuccess(promptId, response, successCriteria = {}) {
    const metrics = {
      responseLength: response.length,
      responseTime: Date.now(),
      hasExamples: response.includes('example') || response.includes('Example'),
      hasCode: response.includes('```') || response.includes('function'),
      hasStructure: response.includes('\n\n') || response.includes('- '),
      ...successCriteria
    };

    this.successMetrics.set(promptId, metrics);
    return metrics;
  }

  /**
   * Analyze prompt effectiveness
   */
  analyzePromptEffectiveness(promptId) {
    const metrics = this.successMetrics.get(promptId);
    if (!metrics) return null;

    const score = Object.values(metrics).reduce((sum, value) => {
      if (typeof value === 'boolean') return sum + (value ? 1 : 0);
      if (typeof value === 'number') return sum + Math.min(value / 1000, 1);
      return sum;
    }, 0) / Object.keys(metrics).length;

    return {
      promptId,
      score: Math.round(score * 100) / 100,
      metrics
    };
  }

  /**
   * Generate optimized prompts for Rekursing use cases
   */
  generateOptimizedRekursingPrompts() {
    const useCases = {
      'ai-agent-development': {
        basePrompt: 'Develop an AI agent for Rekursing gaming platform',
        role: 'AI Gaming Expert',
        context: 'Rekursing is a recursive AI gaming platform where AI systems learn from player interactions',
        examples: [
          { input: 'Player makes aggressive move', output: 'AI learns defensive strategy' },
          { input: 'Player uses specific weapon', output: 'AI adapts counter-measures' }
        ]
      },
      'game-mechanics': {
        basePrompt: 'Design innovative game mechanics for Rekursing',
        role: 'Game Design Expert',
        context: 'Rekursing combines traditional gaming with AI learning and neural networks',
        examples: [
          { input: 'Traditional FPS mechanics', output: 'AI-enhanced adaptive gameplay' },
          { input: 'Static game rules', output: 'Dynamic rule evolution based on AI learning' }
        ]
      },
      'user-interface': {
        basePrompt: 'Design intuitive UI for Rekursing AI dashboard',
        role: 'UX Design Expert',
        context: 'Users need to interact with AI systems and understand their learning progress',
        examples: [
          { input: 'Complex AI metrics', output: 'Visual, intuitive dashboard' },
          { input: 'Technical AI data', output: 'User-friendly visualizations' }
        ]
      }
    };

    const optimizedPrompts = {};
    
    for (const [useCase, config] of Object.entries(useCases)) {
      optimizedPrompts[useCase] = this.optimizePrompt(config.basePrompt, {
        targetRole: config.role,
        includeExamples: true,
        includeContext: true,
        addSpecificity: true
      });
    }

    return optimizedPrompts;
  }
}

// Export singleton instance
export const promptOptimizer = new PromptOptimizer(); 