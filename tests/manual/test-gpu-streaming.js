/**
 * GPU Streaming System Test
 * Comprehensive test suite for the GPU streaming platform
 */

import { GPUStreamingClient, GPUStreamingHelper } from './src/gpu-streaming/client/gpu-streaming-client.js';

console.log('🧪 Testing GPU Streaming System\n');

// Test configuration
const TEST_CONFIG = {
  serverUrl: 'http://localhost:3002',
  testUserId: 'test_user_' + Date.now(),
  testPrompts: [
    'Explain quantum computing in simple terms',
    'Write a short story about a robot learning to paint',
    'Help me debug this JavaScript code: function add(a, b) { return a + b; }',
    'What are the benefits of renewable energy?'
  ],
  testModels: ['llama-3-70b', 'mistral-7b', 'gemini-pro']
};

class GPUStreamingTester {
  constructor() {
    this.client = new GPUStreamingClient(TEST_CONFIG.serverUrl);
    this.helper = new GPUStreamingHelper(this.client);
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  async runAllTests() {
    console.log('🚀 Starting GPU Streaming System Tests\n');

    try {
      // Wait for connection
      await this.waitForConnection();
      
      // Run test suites
      await this.testConnection();
      await this.testSystemStatus();
      await this.testAvailableModels();
      await this.testInferenceRequests();
      await this.testStreamingInference();
      await this.testAdInjection();
      await this.testCostEstimation();
      await this.testHelperFunctions();
      
      // Print results
      this.printResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.testResults.failed++;
    }
  }

  async waitForConnection() {
    return new Promise((resolve) => {
      if (this.client.isConnected) {
        resolve();
      } else {
        this.client.once('connected', resolve);
        setTimeout(() => {
          throw new Error('Connection timeout');
        }, 10000);
      }
    });
  }

  async testConnection() {
    console.log('🔌 Testing Connection...');
    
    try {
      const isConnected = this.client.isConnected;
      const isAvailable = this.client.isServiceAvailable();
      
      this.assert(isConnected, 'Client should be connected');
      this.assert(isAvailable, 'Service should be available');
      
      console.log('✅ Connection test passed');
      this.testResults.passed++;
    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      this.testResults.failed++;
    }
    this.testResults.total++;
  }

  async testSystemStatus() {
    console.log('📊 Testing System Status...');
    
    try {
      const status = this.client.getSystemStatus();
      
      this.assert(status, 'System status should be available');
      this.assert(typeof status.totalProviders === 'number', 'Total providers should be a number');
      this.assert(typeof status.idleProviders === 'number', 'Idle providers should be a number');
      this.assert(typeof status.activeStreams === 'number', 'Active streams should be a number');
      
      console.log(`   📈 System Status: ${status.totalProviders} providers, ${status.idleProviders} idle, ${status.activeStreams} active streams`);
      console.log('✅ System status test passed');
      this.testResults.passed++;
    } catch (error) {
      console.error('❌ System status test failed:', error.message);
      this.testResults.failed++;
    }
    this.testResults.total++;
  }

  async testAvailableModels() {
    console.log('🤖 Testing Available Models...');
    
    try {
      const models = this.client.getAvailableModels();
      
      this.assert(Array.isArray(models), 'Models should be an array');
      this.assert(models.length > 0, 'Should have at least one model available');
      
      console.log(`   📋 Available Models: ${models.join(', ')}`);
      console.log('✅ Available models test passed');
      this.testResults.passed++;
    } catch (error) {
      console.error('❌ Available models test failed:', error.message);
      this.testResults.failed++;
    }
    this.testResults.total++;
  }

  async testInferenceRequests() {
    console.log('🧠 Testing Inference Requests...');
    
    for (const prompt of TEST_CONFIG.testPrompts.slice(0, 2)) {
      try {
        console.log(`   📝 Testing prompt: "${prompt.substring(0, 50)}..."`);
        
        const result = await this.client.requestInference(
          prompt,
          'llama-3-70b',
          {
            quality: 'standard',
            maxTokens: 500,
            adPreferences: { categories: ['technology', 'education'] }
          }
        );
        
        this.assert(result.success, 'Inference should be successful');
        this.assert(result.result, 'Should have a result');
        this.assert(typeof result.tokens === 'number', 'Should have token count');
        this.assert(typeof result.cost === 'number', 'Should have cost information');
        
        console.log(`   💰 Cost: $${result.cost.toFixed(4)}, Tokens: ${result.tokens}`);
        console.log(`   📄 Response: ${result.result.substring(0, 100)}...`);
        
        this.testResults.passed++;
      } catch (error) {
        console.error(`   ❌ Inference test failed for prompt: ${error.message}`);
        this.testResults.failed++;
      }
      this.testResults.total++;
    }
  }

  async testStreamingInference() {
    console.log('🌊 Testing Streaming Inference...');
    
    try {
      const prompt = 'Write a creative story about a magical forest';
      console.log(`   📝 Testing streaming: "${prompt}"`);
      
      const tokens = [];
      let isComplete = false;
      
      // Set up token listener
      this.client.on('stream:token', (token) => {
        tokens.push(token);
        process.stdout.write(token);
      });
      
      // Start streaming
      const stream = await this.client.startStreamingInference(
        prompt,
        'mistral-7b',
        { quality: 'high' }
      );
      
      // Wait for completion
      await new Promise((resolve) => {
        this.client.once('stream:complete', () => {
          isComplete = true;
          resolve();
        });
        
        // Timeout after 30 seconds
        setTimeout(() => {
          if (!isComplete) {
            resolve();
          }
        }, 30000);
      });
      
      this.assert(tokens.length > 0, 'Should receive streaming tokens');
      this.assert(isComplete, 'Stream should complete');
      
      console.log(`\n   📊 Streamed ${tokens.length} tokens`);
      console.log('✅ Streaming inference test passed');
      this.testResults.passed++;
    } catch (error) {
      console.error('❌ Streaming inference test failed:', error.message);
      this.testResults.failed++;
    }
    this.testResults.total++;
  }

  async testAdInjection() {
    console.log('📢 Testing Ad Injection...');
    
    try {
      const prompt = 'I need help with my investment portfolio';
      
      const result = await this.client.requestInference(
        prompt,
        'llama-3-70b',
        {
          adPreferences: { categories: ['finance'] }
        }
      );
      
      this.assert(result.ads, 'Should have ads information');
      this.assert(Array.isArray(result.ads), 'Ads should be an array');
      
      console.log(`   📢 Injected ${result.ads.length} ads`);
      result.ads.forEach((ad, index) => {
        console.log(`   📋 Ad ${index + 1}: ${ad.type} - ${ad.content.substring(0, 50)}...`);
      });
      
      console.log('✅ Ad injection test passed');
      this.testResults.passed++;
    } catch (error) {
      console.error('❌ Ad injection test failed:', error.message);
      this.testResults.failed++;
    }
    this.testResults.total++;
  }

  async testCostEstimation() {
    console.log('💰 Testing Cost Estimation...');
    
    try {
      const estimates = [];
      
      for (const quality of ['low', 'standard', 'high', 'ultra']) {
        const estimate = this.client.getEstimatedCost('llama-3-70b', quality, 1000);
        
        this.assert(estimate, 'Should have cost estimate');
        this.assert(typeof estimate.costPerToken === 'number', 'Cost per token should be a number');
        this.assert(typeof estimate.totalCost === 'number', 'Total cost should be a number');
        
        estimates.push(estimate);
        console.log(`   💵 ${quality} quality: $${estimate.totalCost.toFixed(4)} for 1000 tokens`);
      }
      
      // Verify cost progression
      this.assert(estimates[0].totalCost < estimates[1].totalCost, 'Low quality should cost less than standard');
      this.assert(estimates[1].totalCost < estimates[2].totalCost, 'Standard quality should cost less than high');
      this.assert(estimates[2].totalCost < estimates[3].totalCost, 'High quality should cost less than ultra');
      
      console.log('✅ Cost estimation test passed');
      this.testResults.passed++;
    } catch (error) {
      console.error('❌ Cost estimation test failed:', error.message);
      this.testResults.failed++;
    }
    this.testResults.total++;
  }

  async testHelperFunctions() {
    console.log('🛠️ Testing Helper Functions...');
    
    try {
      // Test chat helper
      const chatResult = await this.helper.chat('What is artificial intelligence?', 'llama-3-70b');
      this.assert(chatResult.success, 'Chat helper should work');
      
      // Test code completion helper
      const codeResult = await this.helper.codeCompletion('function fibonacci(n) {', 'javascript', 'llama-3-70b');
      this.assert(codeResult.success, 'Code completion helper should work');
      
      // Test text generation helper
      const textResult = await this.helper.textGeneration('A day in the life of a programmer', 'creative', 'llama-3-70b');
      this.assert(textResult.success, 'Text generation helper should work');
      
      console.log('✅ Helper functions test passed');
      this.testResults.passed++;
    } catch (error) {
      console.error('❌ Helper functions test failed:', error.message);
      this.testResults.failed++;
    }
    this.testResults.total++;
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  printResults() {
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📊 Total: ${this.testResults.total}`);
    console.log(`📈 Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
    
    if (this.testResults.failed === 0) {
      console.log('\n🎉 All tests passed! GPU Streaming System is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please check the implementation.');
    }
  }
}

// Run the tests
async function runTests() {
  const tester = new GPUStreamingTester();
  await tester.runAllTests();
  
  // Cleanup
  tester.client.disconnect();
  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
  process.exit(1);
});

// Run tests
runTests().catch((error) => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
}); 