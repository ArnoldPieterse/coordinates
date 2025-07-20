/**
 * GPU Streaming Launcher
 * Starts the GPU streaming application with sample providers
 */

import GPUStreamingApp from './src/gpu-streaming/gpu-streaming-app.js';

console.log('🚀 Launching GPU Streaming Application...\n');

// Create and start the GPU streaming app
const app = new GPUStreamingApp();

// Add sample GPU providers after a short delay
setTimeout(async () => {
  console.log('🖥️ Registering sample GPU providers...\n');
  
  // Sample GPU Provider 1 - High-end gaming GPU
  await app.gpuManager.registerProvider(
    {
      name: 'NVIDIA RTX 4090',
      memory: 24,
      cores: 16384,
      manufacturer: 'NVIDIA',
      driver: '535.98'
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

  // Sample GPU Provider 2 - Mid-range GPU
  await app.gpuManager.registerProvider(
    {
      name: 'NVIDIA RTX 3080',
      memory: 10,
      cores: 8704,
      manufacturer: 'NVIDIA',
      driver: '535.98'
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

  // Sample GPU Provider 3 - AMD GPU
  await app.gpuManager.registerProvider(
    {
      name: 'AMD RX 7900 XTX',
      memory: 24,
      cores: 12288,
      manufacturer: 'AMD',
      driver: '23.12.1'
    },
    {
      models: ['llama-3-70b', 'gpt-4', 'gemini-pro', 'mistral-7b'],
      maxConcurrentStreams: 2,
      supportedQualities: ['low', 'standard', 'high', 'ultra']
    },
    {
      perToken: 0.00013,
      perHour: 0.45,
      minimumPayout: 10.00
    }
  );

  console.log('✅ Sample GPU providers registered successfully!\n');
  
  // Start some sample streams
  console.log('📡 Starting sample GPU streams...\n');
  
  const providers = Array.from(app.gpuManager.providers.values());
  
  // Start stream on first provider
  if (providers.length > 0) {
    const streamId = await app.gpuManager.startStream(providers[0].id, 'llama-3-70b', 'standard');
    console.log(`📡 Started stream: ${streamId} on ${providers[0].gpuInfo.name}`);
  }
  
  // Start stream on second provider
  if (providers.length > 1) {
    const streamId = await app.gpuManager.startStream(providers[1].id, 'mistral-7b', 'high');
    console.log(`📡 Started stream: ${streamId} on ${providers[1].gpuInfo.name}`);
  }

  console.log('\n🎯 GPU Streaming System Ready!');
  console.log('📊 Available endpoints:');
  console.log('   • http://localhost:3002/api/llm/models - Get available models');
  console.log('   • http://localhost:3002/api/llm/status - Get system status');
  console.log('   • http://localhost:3002/api/analytics/revenue - Get revenue analytics');
  console.log('   • http://localhost:3002/api/analytics/usage - Get usage analytics');
  console.log('\n💡 Test the system:');
  console.log('   curl -X POST http://localhost:3002/api/llm/inference \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"prompt":"Hello, how are you?","model":"llama-3-70b","userId":"test"}\'');

}, 2000);

// Start the application
app.start();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down GPU Streaming Application...');
  app.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down GPU Streaming Application...');
  app.stop();
  process.exit(0);
});

// Export for testing
export default app; 