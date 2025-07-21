/**
 * Enhanced AI System Demonstration
 * Showcases MIT Sloan's Effective Prompts strategies in action
 */

import { enhancedAISystem } from './src/ai/EnhancedAISystem.js';
import { MITPromptingStrategies, PromptUtils } from './src/ai/prompting/index.js';

console.log('🌌 Enhanced AI System Demonstration');
console.log('Based on MIT Sloan\'s Effective Prompts for AI: The Essentials\n');

async function demonstrateEnhancedAI() {
  try {
    // Wait for system initialization
    console.log('⏳ Initializing Enhanced AI System...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ System ready! Starting demonstrations...\n');

    // Demonstration 1: Basic query processing
    console.log('📋 Demonstration 1: Basic Query Processing');
    console.log('Original Query: "Design an AI system for gaming"');
    
    const result1 = await enhancedAISystem.processQuery('Design an AI system for gaming', {
      context: { role: 'AI Gaming Expert' },
      enhancement: true,
      optimization: true
    });
    
    console.log('Enhanced Query Length:', result1.enhancedQuery.length);
    console.log('Response Length:', result1.response.length);
    console.log('Enhancement Ratio:', (result1.response.length / result1.originalQuery.length).toFixed(2));
    console.log('✅ Demonstration 1 Complete\n');

    // Demonstration 2: Conversation building
    console.log('📋 Demonstration 2: Conversation Building');
    console.log('Follow-up Query: "Make it more scalable"');
    
    const result2 = await enhancedAISystem.processQuery('Make it more scalable', {
      context: { role: 'Technical Architect' },
      conversation: true
    });
    
    console.log('Conversation ID:', result2.conversationId);
    console.log('Includes Previous Context:', result2.enhancedQuery.includes('Previous conversation'));
    console.log('✅ Demonstration 2 Complete\n');

    // Demonstration 3: Rekursing-specific responses
    console.log('📋 Demonstration 3: Rekursing-Specific Responses');
    
    const rekurringResult = await enhancedAISystem.generateRekursingResponse('ai-agent-development', {
      includeExamples: true,
      includeContext: true
    });
    
    console.log('Rekursing Response Generated:', rekurringResult.response.length > 0);
    console.log('Includes AI Context:', rekurringResult.response.includes('AI'));
    console.log('✅ Demonstration 3 Complete\n');

    // Demonstration 4: MIT Sloan Strategies in Action
    console.log('📋 Demonstration 4: MIT Sloan Strategies Showcase');
    
    const strategies = [
      {
        name: 'Context Provision',
        original: 'Create a function',
        enhanced: PromptUtils.createRolePrompt('Create a function', 'Software Engineer')
      },
      {
        name: 'Specificity Enhancement',
        original: 'Optimize performance',
        enhanced: PromptUtils.addSpecificity('Optimize performance', [
          'Consider memory usage',
          'Focus on response time',
          'Include error handling'
        ])
      },
      {
        name: 'Conversation Building',
        original: 'Improve the design',
        enhanced: PromptUtils.buildOnConversation('Improve the design', 'Previous response about system architecture...')
      }
    ];

    strategies.forEach(strategy => {
      console.log(`${strategy.name}:`);
      console.log(`  Original: "${strategy.original}"`);
      console.log(`  Enhanced: "${strategy.enhanced.substring(0, 100)}..."`);
      console.log(`  Enhancement: ${((strategy.enhanced.length / strategy.original.length) * 100).toFixed(0)}% longer`);
      console.log('');
    });

    console.log('✅ Demonstration 4 Complete\n');

    // Demonstration 5: System Analytics
    console.log('📋 Demonstration 5: System Analytics');
    
    const analytics = enhancedAISystem.getSystemAnalytics();
    
    console.log('System Status:', analytics.status);
    console.log('Conversation Count:', analytics.conversationCount);
    console.log('Average Response Length:', analytics.averageResponseLength, 'characters');
    console.log('Enhancement Effectiveness:', analytics.enhancementEffectiveness);
    console.log('Test Results Available:', !!analytics.testResults);
    
    console.log('✅ Demonstration 5 Complete\n');

    // Final summary
    console.log('🎉 Enhanced AI System Demonstration Complete!');
    console.log('\nKey Benefits Achieved:');
    console.log('✅ Context-aware responses using MIT Sloan Strategy 1');
    console.log('✅ Specific and detailed outputs using MIT Sloan Strategy 2');
    console.log('✅ Conversation continuity using MIT Sloan Strategy 3');
    console.log('✅ Multiple prompt types for different use cases');
    console.log('✅ Performance optimization and success tracking');
    console.log('✅ Rekursing-specific enhancements for gaming platform');

  } catch (error) {
    console.error('❌ Demonstration failed:', error);
  }
}

// Run the demonstration
demonstrateEnhancedAI(); 