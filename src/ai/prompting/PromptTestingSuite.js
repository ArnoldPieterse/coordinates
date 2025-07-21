/**
 * Prompt Testing Suite
 * Comprehensive testing for MIT Sloan's Effective Prompts strategies
 * Validates prompt enhancement, optimization, and conversation building
 */

import { advancedPromptEngine } from './AdvancedPromptEngine.js';
import { promptOptimizer } from './PromptOptimizer.js';
import { promptEnhancementSystem } from './PromptEnhancementSystem.js';

export class PromptTestingSuite {
  constructor() {
    this.testResults = [];
    this.successMetrics = new Map();
  }

  /**
   * Run comprehensive tests for all MIT Sloan strategies
   */
  async runAllTests() {
    console.log('🧪 Running MIT Sloan Prompting Strategy Tests...');

    const testResults = {
      contextTests: await this.testContextProvision(),
      specificityTests: await this.testSpecificityEnhancement(),
      conversationTests: await this.testConversationBuilding(),
      promptTypeTests: await this.testPromptTypes(),
      optimizationTests: await this.testPromptOptimization(),
      integrationTests: await this.testIntegration(),
      rekurringTests: await this.testRekursingUseCases()
    };

    this.testResults.push({
      timestamp: Date.now(),
      results: testResults
    });

    return this.generateTestReport(testResults);
  }

  /**
   * Test MIT Sloan Strategy 1: Provide Context
   */
  async testContextProvision() {
    const tests = [
      {
        name: 'Role-based Context',
        test: () => {
          const prompt = 'Design an AI system';
          const enhanced = promptEnhancementSystem.enhanceWithContext(prompt, {
            role: 'AI Gaming Expert'
          });
          return enhanced.includes('AI Gaming Expert') && enhanced.includes('Context:');
        }
      },
      {
        name: 'Background Context',
        test: () => {
          const prompt = 'Optimize performance';
          const enhanced = promptEnhancementSystem.enhanceWithContext(prompt, {
            background: 'Rekursing gaming platform'
          });
          return enhanced.includes('Rekursing gaming platform');
        }
      },
      {
        name: 'Audience Context',
        test: () => {
          const prompt = 'Create documentation';
          const enhanced = promptEnhancementSystem.enhanceWithContext(prompt, {
            audience: 'developers'
          });
          return enhanced.includes('developers');
        }
      }
    ];

    return this.runTestSuite('Context Provision', tests);
  }

  /**
   * Test MIT Sloan Strategy 2: Be Specific
   */
  async testSpecificityEnhancement() {
    const tests = [
      {
        name: 'Format Specification',
        test: () => {
          const prompt = 'Analyze the system';
          const enhanced = promptEnhancementSystem.enhanceWithSpecificity(prompt, {
            format: 'technical report'
          });
          return enhanced.includes('technical report');
        }
      },
      {
        name: 'Constraint Addition',
        test: () => {
          const prompt = 'Design interface';
          const enhanced = promptEnhancementSystem.enhanceWithSpecificity(prompt, {
            includeConstraints: true
          });
          return enhanced.includes('Constraints:');
        }
      },
      {
        name: 'Example Inclusion',
        test: () => {
          const prompt = 'Create algorithm';
          const enhanced = promptEnhancementSystem.enhanceWithSpecificity(prompt, {
            includeExamples: true
          });
          return enhanced.includes('examples') || enhanced.includes('Examples');
        }
      }
    ];

    return this.runTestSuite('Specificity Enhancement', tests);
  }

  /**
   * Test MIT Sloan Strategy 3: Build on Conversation
   */
  async testConversationBuilding() {
    const tests = [
      {
        name: 'Conversation Context',
        test: () => {
          const prompt = 'Improve the design';
          const enhanced = promptEnhancementSystem.enhanceWithConversation(prompt, {
            previousResponses: ['Previous response about design'],
            iterationNumber: 2
          });
          return enhanced.includes('Previous conversation context:') && enhanced.includes('iteration 2');
        }
      },
      {
        name: 'Feedback Integration',
        test: () => {
          const prompt = 'Refine the solution';
          const enhanced = promptEnhancementSystem.enhanceWithConversation(prompt, {
            feedback: ['Make it more scalable', 'Add error handling']
          });
          return enhanced.includes('Feedback to incorporate:') && enhanced.includes('scalable');
        }
      }
    ];

    return this.runTestSuite('Conversation Building', tests);
  }

  /**
   * Test different prompt types
   */
  async testPromptTypes() {
    const tests = [
      {
        name: 'Zero-shot Prompt',
        test: () => {
          const prompt = 'Explain AI';
          const zeroShot = promptEnhancementSystem.createPromptByType('zero-shot', prompt);
          return zeroShot.includes('clear and direct response');
        }
      },
      {
        name: 'Few-shot Prompt',
        test: () => {
          const prompt = 'Create a function';
          const fewShot = promptEnhancementSystem.createPromptByType('few-shot', prompt, {
            examples: [{ input: 'add numbers', output: 'function add(a, b) { return a + b; }' }]
          });
          return fewShot.includes('Example 1:') && fewShot.includes('function add');
        }
      },
      {
        name: 'Role-based Prompt',
        test: () => {
          const prompt = 'Design system';
          const roleBased = promptEnhancementSystem.createPromptByType('role-based', prompt, {
            role: 'Technical Architect'
          });
          return roleBased.includes('Technical Architect') && roleBased.includes('software architect');
        }
      },
      {
        name: 'Contextual Prompt',
        test: () => {
          const prompt = 'Optimize performance';
          const contextual = promptEnhancementSystem.createPromptByType('contextual', prompt, {
            background: 'Gaming platform',
            audience: 'developers'
          });
          return contextual.includes('Gaming platform') && contextual.includes('developers');
        }
      }
    ];

    return this.runTestSuite('Prompt Types', tests);
  }

  /**
   * Test prompt optimization
   */
  async testPromptOptimization() {
    const tests = [
      {
        name: 'Basic Optimization',
        test: () => {
          const prompt = 'Create a game';
          const optimized = promptOptimizer.optimizePrompt(prompt, {
            targetRole: 'Game Designer',
            includeExamples: true
          });
          return optimized.includes('Game Designer') && optimized.length > prompt.length;
        }
      },
      {
        name: 'Iterative Refinement',
        test: () => {
          const prompt = 'Improve algorithm';
          const optimized = promptOptimizer.optimizePrompt(prompt, {
            iterationCount: 3
          });
          return optimized.includes('iteration') && optimized.includes('refine');
        }
      }
    ];

    return this.runTestSuite('Prompt Optimization', tests);
  }

  /**
   * Test integration between systems
   */
  async testIntegration() {
    const tests = [
      {
        name: 'Engine-Enhancer Integration',
        test: () => {
          const prompt = 'Build AI system';
          const engineResult = advancedPromptEngine.createContextualPrompt(prompt, {
            role: 'AI Expert'
          });
          const enhancedResult = promptEnhancementSystem.enhanceWithContext(prompt, {
            role: 'AI Expert'
          });
          return engineResult.includes('AI Expert') && enhancedResult.includes('AI Expert');
        }
      },
      {
        name: 'Optimizer-Enhancer Integration',
        test: () => {
          const prompt = 'Design interface';
          const optimized = promptOptimizer.optimizePrompt(prompt);
          const enhanced = promptEnhancementSystem.enhanceWithSpecificity(prompt);
          return optimized.length > prompt.length && enhanced.length > prompt.length;
        }
      }
    ];

    return this.runTestSuite('System Integration', tests);
  }

  /**
   * Test Rekursing-specific use cases
   */
  async testRekursingUseCases() {
    const tests = [
      {
        name: 'AI Agent Development',
        test: () => {
          const prompt = advancedPromptEngine.generateRekursingPrompt('ai-agent-development');
          return prompt.includes('AI agent') && prompt.includes('Rekursing');
        }
      },
      {
        name: 'Game Mechanics Design',
        test: () => {
          const prompt = advancedPromptEngine.generateRekursingPrompt('game-mechanics');
          return prompt.includes('game mechanic') && prompt.includes('AI learning');
        }
      },
      {
        name: 'User Interface Design',
        test: () => {
          const prompt = advancedPromptEngine.generateRekursingPrompt('user-interface');
          return prompt.includes('interface') && prompt.includes('dashboard');
        }
      }
    ];

    return this.runTestSuite('Rekursing Use Cases', tests);
  }

  /**
   * Run a suite of tests
   */
  async runTestSuite(suiteName, tests) {
    console.log(`\n📋 Running ${suiteName} Tests...`);
    
    const results = {
      suiteName,
      totalTests: tests.length,
      passedTests: 0,
      failedTests: 0,
      testDetails: []
    };

    for (const test of tests) {
      try {
        const result = await test.test();
        const testResult = {
          name: test.name,
          passed: result,
          timestamp: Date.now()
        };

        results.testDetails.push(testResult);
        
        if (result) {
          results.passedTests++;
          console.log(`  ✅ ${test.name}`);
        } else {
          results.failedTests++;
          console.log(`  ❌ ${test.name}`);
        }
      } catch (error) {
        results.failedTests++;
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
        results.testDetails.push({
          name: test.name,
          passed: false,
          error: error.message,
          timestamp: Date.now()
        });
      }
    }

    return results;
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport(results) {
    const report = {
      timestamp: Date.now(),
      summary: {
        totalSuites: Object.keys(results).length,
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0
      },
      details: results,
      recommendations: []
    };

    // Calculate totals
    for (const [suiteName, suiteResults] of Object.entries(results)) {
      report.summary.totalTests += suiteResults.totalTests;
      report.summary.totalPassed += suiteResults.passedTests;
      report.summary.totalFailed += suiteResults.failedTests;
    }

    // Generate recommendations
    if (report.summary.totalFailed > 0) {
      report.recommendations.push('Review failed tests and improve implementation');
    }

    if (report.summary.totalPassed / report.summary.totalTests < 0.8) {
      report.recommendations.push('Consider enhancing test coverage and implementation quality');
    }

    // Log summary
    console.log('\n📊 Test Report Summary:');
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Passed: ${report.summary.totalPassed}`);
    console.log(`Failed: ${report.summary.totalFailed}`);
    console.log(`Success Rate: ${((report.summary.totalPassed / report.summary.totalTests) * 100).toFixed(1)}%`);

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => console.log(`- ${rec}`));
    }

    return report;
  }

  /**
   * Performance testing for prompt systems
   */
  async runPerformanceTests() {
    console.log('\n⚡ Running Performance Tests...');

    const performanceTests = [
      {
        name: 'Context Enhancement Performance',
        test: () => {
          const start = performance.now();
          for (let i = 0; i < 100; i++) {
            promptEnhancementSystem.enhanceWithContext('Test prompt', { role: 'Expert' });
          }
          const end = performance.now();
          return end - start;
        }
      },
      {
        name: 'Specificity Enhancement Performance',
        test: () => {
          const start = performance.now();
          for (let i = 0; i < 100; i++) {
            promptEnhancementSystem.enhanceWithSpecificity('Test prompt');
          }
          const end = performance.now();
          return end - start;
        }
      },
      {
        name: 'Prompt Optimization Performance',
        test: () => {
          const start = performance.now();
          for (let i = 0; i < 100; i++) {
            promptOptimizer.optimizePrompt('Test prompt');
          }
          const end = performance.now();
          return end - start;
        }
      }
    ];

    const performanceResults = {};
    
    for (const test of performanceTests) {
      const duration = await test.test();
      performanceResults[test.name] = {
        duration: duration.toFixed(2),
        operationsPerSecond: (100 / (duration / 1000)).toFixed(2)
      };
      console.log(`  ${test.name}: ${duration.toFixed(2)}ms (${(100 / (duration / 1000)).toFixed(2)} ops/sec)`);
    }

    return performanceResults;
  }
}

// Export singleton instance
export const promptTestingSuite = new PromptTestingSuite(); 