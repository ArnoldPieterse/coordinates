/**
 * AI Test Suite - Consolidated Testing Module
 * Combines HTTP testing, SDK testing, and performance testing for LM Studio integration
 */

import fetch from 'node-fetch';
import pkg from '@lmstudio/sdk';

const { LMStudioClient } = pkg;

class AITestSuite {
  constructor() {
    this.baseUrl = 'http://localhost:1234/v1/chat/completions';
    this.client = new LMStudioClient();
    this.testResults = [];
  }

  /**
   * Test HTTP API connectivity and response
   */
  async testHTTPAPI() {
    console.log('\n🔗 Testing HTTP API Connectivity...');
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama-3-70b-instruct-smashed',
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant for a space shooter game. Provide concise, creative responses for game scenarios, NPCs, quests, and story elements. Keep responses under 200 words and focus on actionable game content. Be specific about objectives, challenges, and rewards.'
            },
            {
              role: 'user',
              content: 'Create a short quest for a space shooter game.'
            }
          ],
          max_tokens: 150,
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40,
          repeat_penalty: 1.1,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
          stop: ['\n\n', 'Human:', 'Assistant:']
        })
      });

      if (response.ok) {
        const data = await response.json();
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log('✅ HTTP Test Successful!');
        console.log(`⏱️ Response time: ${duration}ms`);
        console.log('📝 AI Response:', data.choices[0].message.content);
        
        this.testResults.push({
          test: 'HTTP API',
          status: 'PASS',
          duration: duration,
          response: data.choices[0].message.content
        });
        
        if (duration < 5000) {
          console.log('✅ Performance is acceptable!');
        } else if (duration < 10000) {
          console.log('⚠️ Response time is moderate. Consider using a smaller model.');
        } else {
          console.log('❌ Response time is slow. Recommend switching to 8B model.');
        }
      } else {
        console.error('❌ HTTP Test Failed:', response.status, response.statusText);
        this.testResults.push({
          test: 'HTTP API',
          status: 'FAIL',
          error: `${response.status}: ${response.statusText}`
        });
      }
    } catch (error) {
      console.error('❌ HTTP Test Error:', error.message);
      this.testResults.push({
        test: 'HTTP API',
        status: 'ERROR',
        error: error.message
      });
    }
  }

  /**
   * Test SDK connectivity and functionality
   */
  async testSDK() {
    console.log('\n🔧 Testing SDK Connectivity...');
    
    try {
      const modelName = 'meta-llama-3-70b-instruct-smashed';
      const startTime = Date.now();
      
      const model = await this.client.llm.model(modelName);
      const result = await model.respond('Create a dynamic game scenario for a space shooter where players must defend a space station from an alien invasion.');
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('✅ SDK Test Successful!');
      console.log(`⏱️ Response time: ${duration}ms`);
      console.log('📝 AI Response:', result.content);
      
      this.testResults.push({
        test: 'SDK',
        status: 'PASS',
        duration: duration,
        response: result.content
      });
      
    } catch (error) {
      console.error('❌ SDK Test Error:', error.message);
      this.testResults.push({
        test: 'SDK',
        status: 'ERROR',
        error: error.message
      });
    }
  }

  /**
   * Test performance with smaller model
   */
  async testPerformance() {
    console.log('\n⚡ Testing Performance with 8B Model...');
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3-8b-instruct',
          messages: [{ 
            role: 'user', 
            content: 'Generate a short quest for a space shooter game.' 
          }],
          max_tokens: 100,
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('✅ Performance Test Successful!');
      console.log(`⏱️ Response time: ${duration}ms`);
      console.log('📝 Response:', data.choices[0].message.content);
      
      this.testResults.push({
        test: 'Performance (8B)',
        status: 'PASS',
        duration: duration,
        response: data.choices[0].message.content
      });
      
      if (duration < 5000) {
        console.log('✅ Performance test passed! Response time is acceptable.');
      } else {
        console.log('⚠️ Response time is still slow. Consider further optimization.');
      }
    } catch (error) {
      console.error('❌ Performance Test Error:', error.message);
      this.testResults.push({
        test: 'Performance (8B)',
        status: 'ERROR',
        error: error.message
      });
    }
  }

  /**
   * Test different scenarios and use cases
   */
  async testScenarios() {
    console.log('\n🎮 Testing Game Scenarios...');
    
    const scenarios = [
      {
        name: 'Quest Generation',
        prompt: 'Create a space station defense quest with 3 objectives and a boss fight.'
      },
      {
        name: 'NPC Dialogue',
        prompt: 'Write a brief dialogue for a space station commander giving orders to players.'
      },
      {
        name: 'Story Element',
        prompt: 'Describe a mysterious alien artifact that players must investigate.'
      }
    ];

    for (const scenario of scenarios) {
      try {
        const startTime = Date.now();
        
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama-3-8b-instruct',
            messages: [{ 
              role: 'user', 
              content: scenario.prompt 
            }],
            max_tokens: 150,
            temperature: 0.7
          })
        });
        
        const data = await response.json();
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`✅ ${scenario.name} Test Successful!`);
        console.log(`⏱️ Response time: ${duration}ms`);
        console.log(`📝 Response: ${data.choices[0].message.content.substring(0, 100)}...`);
        
        this.testResults.push({
          test: scenario.name,
          status: 'PASS',
          duration: duration,
          response: data.choices[0].message.content
        });
        
      } catch (error) {
        console.error(`❌ ${scenario.name} Test Error:`, error.message);
        this.testResults.push({
          test: scenario.name,
          status: 'ERROR',
          error: error.message
        });
      }
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 Starting AI Test Suite...\n');
    
    await this.testHTTPAPI();
    await this.testSDK();
    await this.testPerformance();
    await this.testScenarios();
    
    this.printSummary();
  }

  /**
   * Print test summary
   */
  printSummary() {
    console.log('\n📊 Test Summary:');
    console.log('================');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const errors = this.testResults.filter(r => r.status === 'ERROR').length;
    const total = this.testResults.length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Errors: ${errors}`);
    console.log(`📈 Total: ${total}`);
    
    if (passed === total) {
      console.log('\n🎉 All tests passed! AI system is ready for use.');
    } else {
      console.log('\n⚠️ Some tests failed. Check LM Studio configuration.');
    }
    
    // Performance analysis
    const performanceTests = this.testResults.filter(r => r.duration);
    if (performanceTests.length > 0) {
      const avgDuration = performanceTests.reduce((sum, test) => sum + test.duration, 0) / performanceTests.length;
      console.log(`\n⚡ Average response time: ${Math.round(avgDuration)}ms`);
      
      if (avgDuration < 3000) {
        console.log('✅ Excellent performance!');
      } else if (avgDuration < 5000) {
        console.log('✅ Good performance!');
      } else if (avgDuration < 10000) {
        console.log('⚠️ Moderate performance. Consider optimization.');
      } else {
        console.log('❌ Slow performance. Recommend smaller model.');
      }
    }
  }
}

// Export for use in other modules
export default AITestSuite;

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new AITestSuite();
  testSuite.runAllTests().catch(console.error);
} 