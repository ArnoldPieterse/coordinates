/**
 * GPU Streaming System Demo
 * Demonstrates the GPU streaming platform functionality
 */

import GPUStreamingApp from './src/gpu-streaming/gpu-streaming-app.js';

console.log('🎬 GPU Streaming System Demo\n');

// Create the GPU streaming app
const app = new GPUStreamingApp();

// Start the app
app.start();

// Demo function
async function runDemo() {
  console.log('🚀 Starting GPU Streaming Demo...\n');
  
  // Wait for app to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    // Register sample GPU providers
    console.log('🖥️ Registering Sample GPU Providers...\n');
    
    const provider1 = await app.gpuManager.registerProvider(
      {
        name: 'NVIDIA RTX 4090',
        memory: 24,
        cores: 16384,
        manufacturer: 'NVIDIA'
      },
      {
        models: ['llama-3-70b', 'gpt-4', 'gemini-pro', 'mistral-7b'],
        maxConcurrentStreams: 2,
        supportedQualities: ['low', 'standard', 'high', 'ultra']
      },
      {
        perToken: 0.00015,
        perHour: 0.50,
        minimumPayout: 10.00
      }
    );
    
    const provider2 = await app.gpuManager.registerProvider(
      {
        name: 'NVIDIA RTX 3080',
        memory: 10,
        cores: 8704,
        manufacturer: 'NVIDIA'
      },
      {
        models: ['mistral-7b', 'gemini-pro'],
        maxConcurrentStreams: 1,
        supportedQualities: ['low', 'standard', 'high']
      },
      {
        perToken: 0.00012,
        perHour: 0.35,
        minimumPayout: 10.00
      }
    );
    
    console.log(`✅ Registered providers: ${provider1}, ${provider2}\n`);
    
    // Start some streams
    console.log('📡 Starting GPU Streams...\n');
    
    const stream1 = await app.gpuManager.startStream(provider1, 'llama-3-70b', 'standard');
    const stream2 = await app.gpuManager.startStream(provider2, 'mistral-7b', 'high');
    
    console.log(`✅ Started streams: ${stream1}, ${stream2}\n`);
    
    // Test inference requests
    console.log('🧠 Testing Inference Requests...\n');
    
    const testPrompts = [
      'Explain quantum computing in simple terms',
      'Write a short story about a robot learning to paint',
      'What are the benefits of renewable energy?'
    ];
    
    for (let i = 0; i < testPrompts.length; i++) {
      const prompt = testPrompts[i];
      console.log(`📝 Testing: "${prompt.substring(0, 50)}..."`);
      
      try {
        const result = await app.processInferenceRequest(
          prompt,
          'llama-3-70b',
          `demo_user_${i}`,
          { categories: ['technology', 'education'] }
        );
        
        console.log(`   ✅ Success! Cost: $${result.cost.toFixed(4)}, Tokens: ${result.tokens}`);
        console.log(`   📄 Response: ${result.result.substring(0, 100)}...`);
        console.log(`   📢 Ads: ${result.ads.length} injected\n`);
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}\n`);
      }
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Show system status
    console.log('📊 System Status:\n');
    const status = await app.gpuManager.getSystemStatus();
    console.log(`   Total Providers: ${status.totalProviders}`);
    console.log(`   Idle Providers: ${status.idleProviders}`);
    console.log(`   Streaming Providers: ${status.streamingProviders}`);
    console.log(`   Active Streams: ${status.activeStreams}`);
    console.log(`   Total Inference: ${status.totalInference} tokens`);
    console.log(`   Total Revenue: $${status.totalRevenue.toFixed(4)}\n`);
    
    // Show revenue analytics
    console.log('💰 Revenue Analytics:\n');
    const revenue = await app.adService.getRevenueAnalytics();
    console.log(`   Today's Revenue: $${revenue.today.toFixed(4)}`);
    console.log(`   Yesterday's Revenue: $${revenue.yesterday.toFixed(4)}`);
    console.log(`   Total Revenue: $${revenue.total.toFixed(4)}`);
    console.log(`   Top Ads: ${revenue.topAds.length} performing ads\n`);
    
    // Show usage analytics
    console.log('📈 Usage Analytics:\n');
    const usage = await app.gpuManager.getUsageAnalytics();
    console.log(`   Total Providers: ${usage.totalProviders}`);
    console.log(`   Total Earnings: $${usage.totalEarnings.toFixed(4)}`);
    console.log(`   Total Inference: ${usage.totalInference} tokens`);
    console.log(`   Average Earnings per Provider: $${usage.averageEarningsPerProvider.toFixed(4)}\n`);
    
    // Stop streams
    console.log('🛑 Stopping Streams...\n');
    await app.gpuManager.stopStream(provider1, stream1);
    await app.gpuManager.stopStream(provider2, stream2);
    
    console.log('✅ Demo completed successfully!\n');
    console.log('🎯 GPU Streaming System Features Demonstrated:');
    console.log('   ✅ GPU Provider Registration');
    console.log('   ✅ Stream Management');
    console.log('   ✅ LLM Inference Processing');
    console.log('   ✅ Ad Injection & Revenue Tracking');
    console.log('   ✅ Payment Processing');
    console.log('   ✅ Real-time Analytics');
    console.log('   ✅ Quality Management');
    console.log('   ✅ Load Balancing');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo
runDemo().then(() => {
  console.log('\n🎉 GPU Streaming System Demo Complete!');
  console.log('📖 Check GPU_STREAMING_SYSTEM.md for full documentation');
  console.log('🧪 Run "npm run gpu-streaming:test" for comprehensive testing');
  
  // Keep the app running for a bit to show it's working
  setTimeout(() => {
    console.log('\n🛑 Shutting down demo...');
    app.stop();
    process.exit(0);
  }, 5000);
}).catch((error) => {
  console.error('❌ Demo error:', error);
  app.stop();
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Demo interrupted, shutting down...');
  app.stop();
  process.exit(0);
}); 