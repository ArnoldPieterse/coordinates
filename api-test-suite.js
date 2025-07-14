console.log('API Test Suite starting...');
/**
 * API Test Suite for Coordinates Project
 * Tests all API endpoints for AI agents, jobs, game actions, and player management
 * IDX-TEST-API-001
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';
let testPlayerId = null;
let testAgentId = null;
let testJobId = null;

// Test utilities
const log = (message, data = null) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

const testEndpoint = async (method, endpoint, data = null, expectedStatus = 200) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();
    
    if (response.status === expectedStatus) {
      log(`✅ ${method} ${endpoint} - SUCCESS`, result);
      return result;
    } else {
      log(`❌ ${method} ${endpoint} - FAILED (Expected ${expectedStatus}, got ${response.status})`, result);
      return null;
    }
  } catch (error) {
    log(`❌ ${method} ${endpoint} - ERROR: ${error.message}`);
    return null;
  }
};

// Test Suite
const runTests = async () => {
  log('🚀 Starting API Test Suite...');
  
  // 1. Health Check
  log('\n📋 1. Testing Health Check');
  await testEndpoint('GET', '/health');
  
  // 2. System Info
  log('\n📋 2. Testing System Info');
  await testEndpoint('GET', '/system/info');
  
  // 3. Player Management
  log('\n📋 3. Testing Player Management');
  
  // Join player
  const joinResult = await testEndpoint('POST', '/players/join', {
    playerName: 'TestPlayer'
  });
  if (joinResult?.player?.id) {
    testPlayerId = joinResult.player.id;
    log(`Test player created: ${testPlayerId}`);
  }
  
  // Get all players
  await testEndpoint('GET', '/players');
  
  // Update player position
  if (testPlayerId) {
    await testEndpoint('PUT', `/players/${testPlayerId}/position`, {
      position: { x: 10, y: 5, z: 15 },
      rotation: { x: 0, y: 45, z: 0 },
      planet: 'mars'
    });
  }
  
  // 4. AI Agent Management
  log('\n📋 4. Testing AI Agent Management');
  
  // Get all agents
  await testEndpoint('GET', '/agents');
  
  // Spawn different types of agents
  const spawnResult = await testEndpoint('POST', '/agents/spawn', {
    role: 'navigator'
  });
  if (spawnResult?.agent?.id) {
    testAgentId = spawnResult.agent.id;
    log(`Test agent created: ${testAgentId}`);
  }
  
  await testEndpoint('POST', '/agents/spawn', { role: 'strategist' });
  await testEndpoint('POST', '/agents/spawn', { role: 'engineer' });
  await testEndpoint('POST', '/agents/spawn', { role: 'scout' });
  await testEndpoint('POST', '/agents/spawn', { role: 'coordinator' });
  
  // Get agents again to see the new ones
  await testEndpoint('GET', '/agents');
  
  // Upgrade agent
  if (testAgentId) {
    await testEndpoint('PUT', `/agents/${testAgentId}/upgrade`, {
      capability: 'advanced_pathfinding'
    });
  }
  
  // 5. Job Management
  log('\n📋 5. Testing Job Management');
  
  // Get all jobs
  await testEndpoint('GET', '/jobs');
  
  // Create different types of jobs
  const jobResult = await testEndpoint('POST', '/jobs/create', {
    type: 'pathfinding',
    description: 'Find route to enemy base',
    priority: 'high'
  });
  if (jobResult?.job?.id) {
    testJobId = jobResult.job.id;
    log(`Test job created: ${testJobId}`);
  }
  
  await testEndpoint('POST', '/jobs/create', {
    type: 'tactical_analysis',
    description: 'Analyze current battlefield situation',
    priority: 'high'
  });
  
  await testEndpoint('POST', '/jobs/create', {
    type: 'system_repair',
    description: 'Repair damaged shield generator',
    priority: 'medium'
  });
  
  await testEndpoint('POST', '/jobs/create', {
    type: 'exploration',
    description: 'Explore new area and gather intelligence',
    priority: 'low'
  });
  
  await testEndpoint('POST', '/jobs/create', {
    type: 'team_coordination',
    description: 'Coordinate team activities and resources',
    priority: 'high'
  });
  
  // Get jobs again to see the new ones
  await testEndpoint('GET', '/jobs');
  
  // Update job priority
  if (testJobId) {
    await testEndpoint('PUT', `/jobs/${testJobId}/priority`, {
      priority: 'low'
    });
  }
  
  // 6. Game Actions
  log('\n📋 6. Testing Game Actions');
  
  // Get game status
  await testEndpoint('GET', '/game/status');
  
  // Start game
  if (testPlayerId) {
    await testEndpoint('POST', '/game/start', {
      playerId: testPlayerId
    });
  }
  
  // Pause game
  if (testPlayerId) {
    await testEndpoint('POST', '/game/pause', {
      playerId: testPlayerId
    });
  }
  
  // 7. Combat Actions
  log('\n📋 7. Testing Combat Actions');
  
  // Create a second player for combat testing
  const player2Result = await testEndpoint('POST', '/players/join', {
    playerName: 'TestPlayer2'
  });
  
  if (testPlayerId && player2Result?.player?.id) {
    const player2Id = player2Result.player.id;
    
    // Player 1 shoots player 2
    await testEndpoint('POST', `/players/${testPlayerId}/shoot`, {
      targetId: player2Id,
      damage: 25,
      weaponType: 'laser'
    });
    
    // Player 2 shoots player 1
    await testEndpoint('POST', `/players/${player2Id}/shoot`, {
      targetId: testPlayerId,
      damage: 30,
      weaponType: 'plasma'
    });
    
    // Get players to see updated stats
    await testEndpoint('GET', '/players');
  }
  
  // 8. Error Handling Tests
  log('\n📋 8. Testing Error Handling');
  
  // Test invalid agent role
  await testEndpoint('POST', '/agents/spawn', {
    role: 'invalid_role'
  }, 400);
  
  // Test invalid job type
  await testEndpoint('POST', '/jobs/create', {
    type: 'invalid_job_type',
    description: 'Invalid job'
  }, 400);
  
  // Test non-existent agent
  await testEndpoint('DELETE', '/agents/nonexistent_agent', null, 404);
  
  // Test non-existent job
  await testEndpoint('DELETE', '/jobs/nonexistent_job', null, 404);
  
  // Test non-existent player
  await testEndpoint('POST', '/game/start', {
    playerId: 'nonexistent_player'
  }, 404);
  
  // 9. Cleanup Tests
  log('\n📋 9. Testing Cleanup Operations');
  
  // Cancel job
  if (testJobId) {
    await testEndpoint('DELETE', `/jobs/${testJobId}`);
  }
  
  // Dismiss agent
  if (testAgentId) {
    await testEndpoint('DELETE', `/agents/${testAgentId}`);
  }
  
  // Final status check
  log('\n📋 10. Final Status Check');
  await testEndpoint('GET', '/health');
  await testEndpoint('GET', '/game/status');
  await testEndpoint('GET', '/agents');
  await testEndpoint('GET', '/jobs');
  await testEndpoint('GET', '/players');
  
  log('\n🎉 API Test Suite Completed!');
};

// Performance Tests
const runPerformanceTests = async () => {
  log('\n🚀 Starting Performance Tests...');
  
  const startTime = Date.now();
  
  // Test concurrent agent spawning
  log('\n📋 Testing Concurrent Agent Spawning');
  const spawnPromises = [];
  for (let i = 0; i < 10; i++) {
    spawnPromises.push(
      testEndpoint('POST', '/agents/spawn', { role: 'navigator' })
    );
  }
  await Promise.all(spawnPromises);
  
  // Test concurrent job creation
  log('\n📋 Testing Concurrent Job Creation');
  const jobPromises = [];
  for (let i = 0; i < 10; i++) {
    jobPromises.push(
      testEndpoint('POST', '/jobs/create', {
        type: 'pathfinding',
        description: `Performance test job ${i}`,
        priority: 'medium'
      })
    );
  }
  await Promise.all(jobPromises);
  
  // Test concurrent status requests
  log('\n📋 Testing Concurrent Status Requests');
  const statusPromises = [];
  for (let i = 0; i < 20; i++) {
    statusPromises.push(testEndpoint('GET', '/health'));
    statusPromises.push(testEndpoint('GET', '/game/status'));
  }
  await Promise.all(statusPromises);
  
  const endTime = Date.now();
  log(`\n⏱️ Performance test completed in ${endTime - startTime}ms`);
};

// Main execution
const main = async () => {
  try {
    await runTests();
    await runPerformanceTests();
  } catch (error) {
    log(`❌ Test suite failed: ${error.message}`);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

console.log('API Test Suite file loaded.');
console.log('import.meta.url:', import.meta.url, 'process.argv[1]:', process.argv[1]);

main(); 