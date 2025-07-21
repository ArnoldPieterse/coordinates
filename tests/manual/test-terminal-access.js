/**
 * Terminal Access Test Script
 * Tests the fast local message transfer system with LM Studio
 */

import { LLMManager, LLM_PROVIDERS, TerminalAccess } from './src/llm-integration.js';

async function testTerminalAccess() {
  console.log('🚀 Testing Terminal Access System...\n');

  try {
    // Initialize LLM Manager
    console.log('1. Initializing LLM Manager...');
    const llmManager = new LLMManager();
    await llmManager.initializeServices();
    
    // Get terminal access
    console.log('2. Getting Terminal Access...');
    const terminalAccess = llmManager.getTerminalAccess();
    
    if (!terminalAccess) {
      throw new Error('Terminal access not available');
    }
    
    // Check terminal status
    console.log('3. Checking Terminal Status...');
    const status = terminalAccess.getStatus();
    console.log('Terminal Status:', status);
    
    if (status.connectionStatus !== 'connected') {
      throw new Error(`Terminal not connected: ${status.connectionStatus}`);
    }
    
    // Test basic message
    console.log('4. Testing Basic Message...');
    const testMessage = 'Hello! This is a test message from the terminal access system. Please respond with a brief greeting.';
    
    const messageId = await terminalAccess.sendMessage(testMessage, {
      maxTokens: 100,
      temperature: 0.7,
      model: 'meta-llama-3-70b-instruct-smashed',
      streaming: false
    });
    
    console.log(`Message sent with ID: ${messageId}`);
    
    // Wait for response
    console.log('5. Waiting for response...');
    await new Promise((resolve) => {
      const handleResponse = (event) => {
        if (event.detail.messageId === messageId) {
          console.log('✅ Response received:');
          console.log('Response:', event.detail.response);
          console.log('Timestamp:', new Date(event.detail.timestamp).toISOString());
          window.removeEventListener('terminalResponse', handleResponse);
          resolve();
        }
      };
      
      window.addEventListener('terminalResponse', handleResponse);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        window.removeEventListener('terminalResponse', handleResponse);
        resolve();
      }, 30000);
    });
    
    // Test streaming message
    console.log('6. Testing Streaming Message...');
    const streamingMessage = 'Please explain what recursive AI systems are in 2-3 sentences.';
    
    const streamingId = await terminalAccess.sendMessage(streamingMessage, {
      maxTokens: 200,
      temperature: 0.7,
      model: 'meta-llama-3-70b-instruct-smashed',
      streaming: true
    });
    
    console.log(`Streaming message sent with ID: ${streamingId}`);
    
    let streamingResponse = '';
    let isComplete = false;
    
    await new Promise((resolve) => {
      const handleStreaming = (event) => {
        if (event.detail.messageId === streamingId) {
          streamingResponse += event.detail.chunk;
          process.stdout.write(event.detail.chunk);
        }
      };
      
      const handleComplete = (event) => {
        if (event.detail.messageId === streamingId) {
          isComplete = true;
          window.removeEventListener('terminalStreamingChunk', handleStreaming);
          window.removeEventListener('terminalResponse', handleComplete);
          console.log('\n✅ Streaming response completed');
          resolve();
        }
      };
      
      window.addEventListener('terminalStreamingChunk', handleStreaming);
      window.addEventListener('terminalResponse', handleComplete);
      
      // Timeout after 60 seconds
      setTimeout(() => {
        window.removeEventListener('terminalStreamingChunk', handleStreaming);
        window.removeEventListener('terminalResponse', handleComplete);
        resolve();
      }, 60000);
    });
    
    // Test performance
    console.log('7. Testing Performance...');
    const performanceTests = [];
    
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      const perfMessageId = await terminalAccess.sendMessage(`Performance test ${i + 1}: What is 2 + 2?`, {
        maxTokens: 50,
        temperature: 0.1,
        streaming: false
      });
      
      await new Promise((resolve) => {
        const handlePerfResponse = (event) => {
          if (event.detail.messageId === perfMessageId) {
            const responseTime = Date.now() - startTime;
            performanceTests.push(responseTime);
            console.log(`Test ${i + 1} response time: ${responseTime}ms`);
            window.removeEventListener('terminalResponse', handlePerfResponse);
            resolve();
          }
        };
        
        window.addEventListener('terminalResponse', handlePerfResponse);
        
        setTimeout(() => {
          window.removeEventListener('terminalResponse', handlePerfResponse);
          resolve();
        }, 15000);
      });
    }
    
    const avgResponseTime = performanceTests.reduce((a, b) => a + b, 0) / performanceTests.length;
    console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
    
    // Get final status
    console.log('8. Final Terminal Status...');
    const finalStatus = terminalAccess.getStatus();
    console.log('Final Status:', finalStatus);
    
    // Get history
    console.log('9. Terminal History...');
    const history = terminalAccess.getHistory(5);
    console.log(`Last ${history.length} messages:`, history);
    
    console.log('\n✅ Terminal Access Test Completed Successfully!');
    console.log('📊 Summary:');
    console.log(`- Connection Status: ${finalStatus.connectionStatus}`);
    console.log(`- Queue Length: ${finalStatus.queueLength}`);
    console.log(`- History Size: ${finalStatus.historySize}`);
    console.log(`- Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    
  } catch (error) {
    console.error('❌ Terminal Access Test Failed:', error);
    console.error('Stack trace:', error.stack);
    
    // Try to get more diagnostic information
    try {
      console.log('\n🔍 Diagnostic Information:');
      
      // Test direct connection to LM Studio
      console.log('Testing direct connection to LM Studio...');
      const response = await fetch('http://10.3.129.26:1234/v1/models', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const models = await response.json();
        console.log('✅ Direct connection successful');
        console.log('Available models:', models);
      } else {
        console.log(`❌ Direct connection failed: HTTP ${response.status}`);
      }
    } catch (diagError) {
      console.error('❌ Diagnostic failed:', diagError.message);
    }
  }
}

// Run the test if this script is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.addEventListener('DOMContentLoaded', testTerminalAccess);
} else {
  // Node.js environment
  testTerminalAccess();
}

export { testTerminalAccess }; 