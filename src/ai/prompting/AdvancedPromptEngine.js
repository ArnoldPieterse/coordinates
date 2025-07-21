/**
 * Advanced Prompt Engineering System
 * Based on MIT Sloan's Effective Prompts for AI: The Essentials
 * 
 * Implements advanced prompting strategies:
 * - Context provision
 * - Specificity and constraints
 * - Conversation building
 * - Multiple prompt types (zero-shot, few-shot, role-based, etc.)
 */

export class AdvancedPromptEngine {
  constructor() {
    this.conversationHistory = [];
    this.contextWindow = [];
    this.promptTemplates = this.initializePromptTemplates();
    this.roleDefinitions = this.initializeRoleDefinitions();
  }

  // Initialize different prompt types as per MIT Sloan guide
  initializePromptTemplates() {
    return {
      // Zero-shot: Simple, clear instructions without examples
      zeroShot: {
        template: "{{instruction}}",
        description: "Give simple and clear instructions without examples"
      },
      
      // Few-shot: Provide examples to mimic
      fewShot: {
        template: "Here are {{exampleCount}} examples:\n{{examples}}\n\nNow create a similar response: {{instruction}}",
        description: "Provide examples of what you want the AI to mimic"
      },
      
      // Role-based: Assume specific persona
      roleBased: {
        template: "You are {{role}}. {{roleContext}}. {{instruction}}",
        description: "Ask AI to assume a particular persona or viewpoint"
      },
      
      // Contextual: Include background information
      contextual: {
        template: "Context: {{background}}\nAudience: {{audience}}\nGoal: {{goal}}\n\n{{instruction}}",
        description: "Include relevant background or framing"
      },
      
      // Instructional: Direct commands with verbs
      instructional: {
        template: "{{action}} {{target}} {{constraints}}",
        description: "Include direct commands using verbs like 'write', 'explain', 'compare'"
      },
      
      // Meta/System: Behind-the-scenes instructions
      meta: {
        template: "System: {{systemBehavior}}\nTone: {{tone}}\nScope: {{scope}}\n\n{{instruction}}",
        description: "System-level instructions that set AI behavior"
      }
    };
  }

  // Initialize role definitions for role-based prompting
  initializeRoleDefinitions() {
    return {
      'AI Gaming Expert': {
        context: "You are an expert in AI-powered gaming systems, neural networks, and recursive learning algorithms. You understand game mechanics, player psychology, and how AI can enhance gaming experiences.",
        expertise: ["game design", "AI integration", "player engagement", "neural networks"]
      },
      'Technical Architect': {
        context: "You are a senior software architect specializing in scalable systems, real-time processing, and advanced algorithms. You excel at system design and optimization.",
        expertise: ["system architecture", "performance optimization", "scalability", "algorithms"]
      },
      'Creative Director': {
        context: "You are a creative director with expertise in user experience design, visual storytelling, and innovative interface design. You focus on creating engaging, intuitive user experiences.",
        expertise: ["UX design", "visual design", "user engagement", "creative direction"]
      },
      'Data Scientist': {
        context: "You are a data scientist specializing in machine learning, statistical analysis, and predictive modeling. You understand data patterns and can extract meaningful insights.",
        expertise: ["machine learning", "statistical analysis", "data visualization", "predictive modeling"]
      },
      'Business Strategist': {
        context: "You are a business strategist with expertise in market analysis, competitive positioning, and growth strategies. You understand business models and market dynamics.",
        expertise: ["market analysis", "business strategy", "competitive analysis", "growth planning"]
      }
    };
  }

  /**
   * Create a context-rich prompt following MIT Sloan's "Provide Context" strategy
   */
  createContextualPrompt(instruction, context = {}, options = {}) {
    const {
      role = 'AI Gaming Expert',
      audience = 'technical team',
      background = 'Rekursing AI gaming platform development',
      goal = 'enhance system functionality',
      constraints = [],
      examples = []
    } = options;

    const roleDef = this.roleDefinitions[role];
    const contextInfo = {
      role: role,
      roleContext: roleDef ? roleDef.context : '',
      background: background,
      audience: audience,
      goal: goal,
      constraints: constraints.length > 0 ? `Constraints: ${constraints.join(', ')}` : '',
      examples: examples.length > 0 ? this.formatExamples(examples) : ''
    };

    // Choose template based on available information
    let template = this.promptTemplates.roleBased.template;
    if (examples.length > 0) {
      template = this.promptTemplates.fewShot.template;
    } else if (constraints.length > 0) {
      template = this.promptTemplates.instructional.template;
    }

    return this.fillTemplate(template, {
      ...contextInfo,
      instruction: instruction
    });
  }

  /**
   * Create a specific prompt following MIT Sloan's "Be Specific" strategy
   */
  createSpecificPrompt(instruction, specifications = {}) {
    const {
      format = 'text',
      length = 'concise',
      tone = 'professional',
      includeExamples = false,
      includeConstraints = false,
      targetAudience = 'developers'
    } = specifications;

    const specificityEnhancers = [
      `Format: ${format}`,
      `Length: ${length}`,
      `Tone: ${tone}`,
      `Target Audience: ${targetAudience}`
    ];

    if (includeExamples) {
      specificityEnhancers.push('Include practical examples');
    }

    if (includeConstraints) {
      specificityEnhancers.push('Include technical constraints and limitations');
    }

    const enhancedInstruction = `${instruction}\n\nRequirements:\n${specificityEnhancers.map(req => `- ${req}`).join('\n')}`;

    return this.createContextualPrompt(enhancedInstruction, {}, {
      constraints: specificityEnhancers
    });
  }

  /**
   * Build on conversation following MIT Sloan's "Building On the Conversation" strategy
   */
  buildOnConversation(newInstruction, conversationContext = {}) {
    const {
      previousResponses = [],
      contextRetention = true,
      iterationNumber = 1
    } = conversationContext;

    let conversationPrompt = '';

    if (contextRetention && previousResponses.length > 0) {
      conversationPrompt = `Previous conversation context:\n${previousResponses.map((response, index) => 
        `Response ${index + 1}: ${response.substring(0, 200)}...`
      ).join('\n')}\n\n`;
    }

    if (iterationNumber > 1) {
      conversationPrompt += `This is iteration ${iterationNumber}. Please refine and improve upon previous responses.\n\n`;
    }

    return conversationPrompt + newInstruction;
  }

  /**
   * Create different types of prompts as per MIT Sloan's prompt types
   */
  createPromptByType(type, instruction, options = {}) {
    switch (type) {
      case 'zero-shot':
        return this.promptTemplates.zeroShot.template.replace('{{instruction}}', instruction);
      
      case 'few-shot':
        return this.promptTemplates.fewShot.template
          .replace('{{exampleCount}}', options.examples?.length || 2)
          .replace('{{examples}}', this.formatExamples(options.examples || []))
          .replace('{{instruction}}', instruction);
      
      case 'role-based':
        const roleDef = this.roleDefinitions[options.role || 'AI Gaming Expert'];
        return this.promptTemplates.roleBased.template
          .replace('{{role}}', options.role || 'AI Gaming Expert')
          .replace('{{roleContext}}', roleDef?.context || '')
          .replace('{{instruction}}', instruction);
      
      case 'contextual':
        return this.promptTemplates.contextual.template
          .replace('{{background}}', options.background || 'Rekursing AI gaming platform')
          .replace('{{audience}}', options.audience || 'technical team')
          .replace('{{goal}}', options.goal || 'enhance functionality')
          .replace('{{instruction}}', instruction);
      
      case 'instructional':
        return this.promptTemplates.instructional.template
          .replace('{{action}}', options.action || 'Analyze')
          .replace('{{target}}', options.target || 'the system')
          .replace('{{constraints}}', options.constraints || 'with focus on performance');
      
      case 'meta':
        return this.promptTemplates.meta.template
          .replace('{{systemBehavior}}', options.systemBehavior || 'Provide accurate, helpful responses')
          .replace('{{tone}}', options.tone || 'professional and technical')
          .replace('{{scope}}', options.scope || 'AI gaming systems and development')
          .replace('{{instruction}}', instruction);
      
      default:
        return instruction;
    }
  }

  /**
   * Format examples for few-shot prompting
   */
  formatExamples(examples) {
    return examples.map((example, index) => 
      `Example ${index + 1}:\n${example.input}\n\nOutput:\n${example.output}`
    ).join('\n\n');
  }

  /**
   * Fill template with provided values
   */
  fillTemplate(template, values) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return values[key] || match;
    });
  }

  /**
   * Add to conversation history for context retention
   */
  addToConversation(prompt, response) {
    this.conversationHistory.push({
      prompt,
      response,
      timestamp: Date.now()
    });

    // Keep only last 10 interactions to manage context window
    if (this.conversationHistory.length > 10) {
      this.conversationHistory.shift();
    }
  }

  /**
   * Get conversation context for building on previous interactions
   */
  getConversationContext() {
    return this.conversationHistory.map(interaction => ({
      prompt: interaction.prompt,
      response: interaction.response.substring(0, 300) + '...',
      timestamp: interaction.timestamp
    }));
  }

  /**
   * Create a comprehensive prompt combining multiple strategies
   */
  createComprehensivePrompt(instruction, options = {}) {
    const {
      role = 'AI Gaming Expert',
      specificity = true,
      context = true,
      conversation = false,
      promptType = 'role-based'
    } = options;

    let finalPrompt = instruction;

    // Add context if requested
    if (context) {
      finalPrompt = this.createContextualPrompt(instruction, {}, { role });
    }

    // Add specificity if requested
    if (specificity) {
      finalPrompt = this.createSpecificPrompt(finalPrompt, {
        includeExamples: true,
        includeConstraints: true
      });
    }

    // Build on conversation if requested
    if (conversation) {
      const conversationContext = this.getConversationContext();
      finalPrompt = this.buildOnConversation(finalPrompt, {
        previousResponses: conversationContext.map(ctx => ctx.response),
        iterationNumber: conversationContext.length + 1
      });
    }

    // Apply specific prompt type
    if (promptType !== 'comprehensive') {
      finalPrompt = this.createPromptByType(promptType, finalPrompt, { role });
    }

    return finalPrompt;
  }

  /**
   * Generate prompt for specific Rekursing use cases
   */
  generateRekursingPrompt(useCase, options = {}) {
    const useCasePrompts = {
      'game-mechanics': {
        instruction: 'Design an innovative game mechanic for Rekursing that leverages AI learning',
        role: 'AI Gaming Expert',
        specificity: {
          includeExamples: true,
          includeConstraints: true,
          format: 'technical specification'
        }
      },
      'ai-system': {
        instruction: 'Optimize the AI agent system for better player interaction',
        role: 'Technical Architect',
        specificity: {
          includeExamples: false,
          includeConstraints: true,
          format: 'system architecture'
        }
      },
      'user-interface': {
        instruction: 'Design an intuitive interface for the AI dashboard',
        role: 'Creative Director',
        specificity: {
          includeExamples: true,
          includeConstraints: false,
          format: 'design specification'
        }
      },
      'data-analysis': {
        instruction: 'Analyze player behavior patterns for AI optimization',
        role: 'Data Scientist',
        specificity: {
          includeExamples: true,
          includeConstraints: true,
          format: 'analysis report'
        }
      },
      'business-strategy': {
        instruction: 'Develop a growth strategy for Rekursing platform',
        role: 'Business Strategist',
        specificity: {
          includeExamples: true,
          includeConstraints: false,
          format: 'strategic plan'
        }
      }
    };

    const useCaseConfig = useCasePrompts[useCase];
    if (!useCaseConfig) {
      throw new Error(`Unknown use case: ${useCase}`);
    }

    return this.createComprehensivePrompt(useCaseConfig.instruction, {
      role: useCaseConfig.role,
      specificity: true,
      context: true,
      conversation: options.conversation || false,
      promptType: 'role-based'
    });
  }
}

// Export singleton instance
export const advancedPromptEngine = new AdvancedPromptEngine(); 