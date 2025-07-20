/**
 * Relativity Rating System Test
 * Demonstrates how tasks are evaluated against project objectives
 */

import { ProjectObjectives } from './src/relativity/project-objectives.js';

console.log('🧪 Testing Relativity Rating System\n');

const objectives = new ProjectObjectives();

// Test different types of jobs
const testJobs = [
  {
    name: 'Core Gameplay - Multiplayer Combat',
    type: 'feature_implementation',
    description: 'Implement multiplayer combat system with physics',
    data: { feature: 'multiplayer_combat', requirements: 'physics, networking, combat' }
  },
  {
    name: 'AI Integration - Neural Network Training',
    type: 'ai_model_training',
    description: 'Train neural networks for agent coordination',
    data: { modelType: 'neural_network', trainingData: 'agent_interactions' }
  },
  {
    name: 'Graphics - PBR Material System',
    type: 'texture_generation',
    description: 'Create PBR materials for Crysis-level graphics',
    data: { textureType: 'pbr_materials', style: 'realistic' }
  },
  {
    name: 'Procedural - Tree Generation',
    type: 'texture_generation',
    description: 'Generate procedural trees for world variety',
    data: { textureType: 'tree_generation', style: 'procedural' }
  },
  {
    name: 'Performance - FPS Optimization',
    type: 'performance_analysis',
    description: 'Optimize frame rate and memory usage',
    data: { metrics: 'fps, memory', target: '60fps' }
  },
  {
    name: 'Deployment - AWS Setup',
    type: 'aws_deployment',
    description: 'Deploy game to AWS with monitoring',
    data: { service: 'aws', configuration: 'production' }
  },
  {
    name: 'Documentation - API Docs',
    type: 'documentation_update',
    description: 'Update API documentation for developers',
    data: { section: 'api_docs', content: 'developer_guide' }
  },
  {
    name: 'Low Priority - Email Template',
    type: 'documentation_update',
    description: 'Create email template for marketing',
    data: { section: 'email_template', content: 'marketing' }
  }
];

console.log('📊 Testing Jobs Against Project Objectives:\n');

testJobs.forEach((job, index) => {
  console.log(`\n${index + 1}. ${job.name}`);
  console.log(`   Description: ${job.description}`);
  
  const relativity = objectives.calculateTaskRelativity(job, {
    jobType: job.type,
    description: job.description,
    timestamp: new Date()
  });
  
  console.log(`   📈 Relativity Rating: ${relativity.rating.toFixed(3)} (${relativity.priority})`);
  console.log(`   ✅ Should Execute: ${relativity.shouldExecute ? 'YES' : 'NO'}`);
  
  if (relativity.rating > 0.1) {
    console.log('   🎯 Objective Breakdown:');
    relativity.breakdown.forEach(item => {
      const contribution = (item.contribution * 100).toFixed(1);
      console.log(`      ${item.objective}: ${item.score.toFixed(3)} (${contribution}%)`);
    });
  }
  
  if (!relativity.shouldExecute) {
    console.log(`   ⏭️ REASON: Below threshold (${objectives.relativityThreshold})`);
  }
});

// Test different focus objectives
console.log('\n\n🎯 Testing Different Focus Objectives:\n');

const focusTests = [
  { focus: 'core_gameplay', job: testJobs[0] },
  { focus: 'ai_integration', job: testJobs[1] },
  { focus: 'graphics_quality', job: testJobs[2] },
  { focus: 'procedural_generation', job: testJobs[3] }
];

focusTests.forEach(test => {
  objectives.updateCurrentFocus(test.focus);
  const relativity = objectives.calculateTaskRelativity(test.job);
  
  console.log(`Focus: ${test.focus}`);
  console.log(`Job: ${test.job.name}`);
  console.log(`Rating: ${relativity.rating.toFixed(3)} (${relativity.priority})`);
  console.log(`Should Execute: ${relativity.shouldExecute ? 'YES' : 'NO'}\n`);
});

// Test memory relevance
console.log('\n🧠 Testing Memory Relevance:\n');

const memoryTests = [
  { memoryKey: 'multiplayer_combat_implementation', context: 'combat system' },
  { memoryKey: 'neural_network_training', context: 'ai optimization' },
  { memoryKey: 'pbr_materials_creation', context: 'graphics rendering' },
  { memoryKey: 'email_template_design', context: 'core gameplay' }
];

memoryTests.forEach(test => {
  const relevance = objectives.calculateMemoryRelevance(test.memoryKey, test.context);
  
  console.log(`Memory: ${test.memoryKey}`);
  console.log(`Context: ${test.context}`);
  console.log(`Relevance: ${relevance.rating.toFixed(3)} (${relevance.priority})`);
  console.log(`Should Retrieve: ${relevance.shouldRetrieve ? 'YES' : 'NO'}\n`);
});

// Test threshold adjustments
console.log('\n⚙️ Testing Threshold Adjustments:\n');

const originalThreshold = objectives.relativityThreshold;
objectives.relativityThreshold = 0.1; // Lower threshold

console.log(`Original threshold: ${originalThreshold}`);
console.log(`New threshold: ${objectives.relativityThreshold}`);

testJobs.forEach(job => {
  const relativity = objectives.calculateTaskRelativity(job);
  if (relativity.shouldExecute !== (relativity.rating >= originalThreshold)) {
    console.log(`Job "${job.name}" would now execute: ${relativity.shouldExecute}`);
  }
});

// Reset threshold
objectives.relativityThreshold = originalThreshold;

console.log('\n✅ Relativity Rating System Test Complete!');
console.log('\nKey Features Demonstrated:');
console.log('• Tasks are evaluated against 7 project objectives');
console.log('• Each objective has different weights and criteria');
console.log('• Current focus gets 1.5x bonus');
console.log('• Tasks below threshold are skipped');
console.log('• Memory retrieval is relevance-based');
console.log('• Thresholds can be dynamically adjusted'); 