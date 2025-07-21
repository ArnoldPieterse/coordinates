/**
 * Comprehensive Context System Test
 * Tests the entire context management system
 */

import fs from 'fs';
import path from 'path';

// Import context system modules
import ContextIndexer from './src/core/context/ContextIndexer.js';
import KnowledgeGraph from './src/core/context/KnowledgeGraph.js';
import ContextMemory from './src/core/context/ContextMemory.js';
import ContextAutomation from './src/core/context/ContextAutomation.js';
import BuildHook from './src/core/context/BuildHook.js';
import ThoughtFrames from './src/ai/thinking/ThoughtFrames.js';

class ContextSystemTest {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🧪 Starting Comprehensive Context System Test...\n');

    try {
      // Test 1: Basic Context Components
      await this.testBasicComponents();
      
      // Test 2: Context Indexing
      await this.testContextIndexing();
      
      // Test 3: Knowledge Graph
      await this.testKnowledgeGraph();
      
      // Test 4: Context Memory
      await this.testContextMemory();
      
      // Test 5: Context Automation
      await this.testContextAutomation();
      
      // Test 6: Build Hooks
      await this.testBuildHooks();
      
      // Test 7: Thought Frames Integration
      await this.testThoughtFramesIntegration();
      
      // Test 8: Cross-System Integration
      await this.testCrossSystemIntegration();

      this.printResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.testResults.push({
        test: 'Test Suite',
        status: 'FAILED',
        error: error.message
      });
      this.printResults();
    }
  }

  async testBasicComponents() {
    console.log('📦 Testing Basic Context Components...');
    
    try {
      // Test ContextIndexer
      const indexer = new ContextIndexer();
      this.assert(indexer.index, 'ContextIndexer should have index property');
      this.assert(typeof indexer.addItem === 'function', 'ContextIndexer should have addItem method');
      this.assert(typeof indexer.search === 'function', 'ContextIndexer should have search method');
      
      // Test KnowledgeGraph
      const graph = new KnowledgeGraph();
      this.assert(graph.nodes instanceof Map, 'KnowledgeGraph should have nodes Map');
      this.assert(Array.isArray(graph.edges), 'KnowledgeGraph should have edges array');
      this.assert(typeof graph.addNode === 'function', 'KnowledgeGraph should have addNode method');
      this.assert(typeof graph.addEdge === 'function', 'KnowledgeGraph should have addEdge method');
      
      // Test ContextMemory
      const memory = new ContextMemory();
      this.assert(Array.isArray(memory.memory), 'ContextMemory should have memory array');
      this.assert(typeof memory.addSnapshot === 'function', 'ContextMemory should have addSnapshot method');
      this.assert(typeof memory.queryByTag === 'function', 'ContextMemory should have queryByTag method');
      
      this.recordTest('Basic Components', 'PASSED');
      
    } catch (error) {
      this.recordTest('Basic Components', 'FAILED', error.message);
    }
  }

  async testContextIndexing() {
    console.log('🔍 Testing Context Indexing...');
    
    try {
      const indexer = new ContextIndexer();
      
      // Test adding items
      const testItem = {
        id: 'test-file.js',
        path: 'src/test/test-file.js',
        type: 'code',
        content: 'console.log("test");'
      };
      
      indexer.addItem('code', testItem);
      
      // Test retrieval
      const items = indexer.getAll('code');
      this.assert(items.length > 0, 'Should have indexed items');
      this.assert(items[0].id === 'test-file.js', 'Should retrieve correct item');
      
      // Test search
      const searchResults = indexer.search('code', 'test');
      this.assert(searchResults.length > 0, 'Should find items by search');
      
      this.recordTest('Context Indexing', 'PASSED');
      
    } catch (error) {
      this.recordTest('Context Indexing', 'FAILED', error.message);
    }
  }

  async testKnowledgeGraph() {
    console.log('🕸️ Testing Knowledge Graph...');
    
    try {
      const graph = new KnowledgeGraph();
      
      // Test adding nodes
      graph.addNode('file1.js', { type: 'code', name: 'File 1' });
      graph.addNode('file2.js', { type: 'code', name: 'File 2' });
      
      // Test adding edges
      graph.addEdge('file1.js', 'file2.js', 'imports');
      
      // Test retrieval
      const node1 = graph.getNode('file1.js');
      this.assert(node1, 'Should retrieve node');
      this.assert(node1.name === 'File 1', 'Should have correct node data');
      
      // Test relationships
      const relationships = graph.getRelationships('file1.js');
      this.assert(relationships.length > 0, 'Should have relationships');
      
      // Test finding related nodes
      const related = graph.findRelated('file1.js');
      this.assert(related.length > 0, 'Should find related nodes');
      
      this.recordTest('Knowledge Graph', 'PASSED');
      
    } catch (error) {
      this.recordTest('Knowledge Graph', 'FAILED', error.message);
    }
  }

  async testContextMemory() {
    console.log('🧠 Testing Context Memory...');
    
    try {
      const memory = new ContextMemory();
      
      // Test adding snapshots
      const snapshot = {
        type: 'test-snapshot',
        tags: ['test', 'memory'],
        data: { message: 'Hello World' }
      };
      
      memory.addSnapshot(snapshot);
      
      // Test retrieval
      const allSnapshots = memory.getAll();
      this.assert(allSnapshots.length > 0, 'Should have snapshots');
      
      // Test querying by tag
      const testSnapshots = memory.queryByTag('test');
      this.assert(testSnapshots.length > 0, 'Should find snapshots by tag');
      
      // Test querying by time
      const now = Date.now();
      const recentSnapshots = memory.queryByTime(now - 60000, now);
      this.assert(recentSnapshots.length > 0, 'Should find recent snapshots');
      
      this.recordTest('Context Memory', 'PASSED');
      
    } catch (error) {
      this.recordTest('Context Memory', 'FAILED', error.message);
    }
  }

  async testContextAutomation() {
    console.log('🤖 Testing Context Automation...');
    
    try {
      const automation = new ContextAutomation();
      
      // Test file type detection
      const codeType = automation.getFileType('src/test.js');
      this.assert(codeType === 'code', 'Should detect code files');
      
      const docType = automation.getFileType('docs/readme.md');
      this.assert(docType === 'docs', 'Should detect documentation files');
      
      // Test metadata extraction
      const testContent = `
        import React from 'react';
        export class TestComponent {
          constructor() {
            this.name = 'test';
          }
        }
      `;
      
      const metadata = automation.extractMetadata('test.js', testContent, { size: 100, mtime: new Date() });
      this.assert(metadata.hasImports, 'Should detect imports');
      this.assert(metadata.hasExports, 'Should detect exports');
      this.assert(metadata.keywords.length > 0, 'Should extract keywords');
      
      // Test automation stats
      const stats = automation.getAutomationStats();
      this.assert(typeof stats.totalIndexedFiles === 'number', 'Should have automation stats');
      
      this.recordTest('Context Automation', 'PASSED');
      
    } catch (error) {
      this.recordTest('Context Automation', 'FAILED', error.message);
    }
  }

  async testBuildHooks() {
    console.log('🔧 Testing Build Hooks...');
    
    try {
      const buildHook = new BuildHook();
      
      // Test build context stats
      const stats = buildHook.getBuildContextStats();
      this.assert(stats.automation, 'Should have automation stats');
      this.assert(stats.memory, 'Should have memory stats');
      
      // Test build artifacts update
      await buildHook.updateBuildArtifacts();
      
      // Verify build artifacts were added to knowledge graph
      const buildNode = buildHook.automation.knowledgeGraph.getNode('build:dist');
      this.assert(buildNode, 'Should have build artifacts in knowledge graph');
      
      this.recordTest('Build Hooks', 'PASSED');
      
    } catch (error) {
      this.recordTest('Build Hooks', 'FAILED', error.message);
    }
  }

  async testThoughtFramesIntegration() {
    console.log('🧩 Testing Thought Frames Integration...');
    
    try {
      const thoughtFrames = new ThoughtFrames();
      
      // Test creating frames with context
      const upgradeFrame = thoughtFrames.createUpgradeFrame();
      this.assert(upgradeFrame.context, 'Should have context information');
      this.assert(upgradeFrame.context.relevantCode !== undefined, 'Should have relevant code count');
      
      const rsiFrame = thoughtFrames.createMeanReversionFrame();
      this.assert(rsiFrame.context, 'Should have context information');
      this.assert(rsiFrame.context.relevantCode !== undefined, 'Should have relevant code count');
      
      const socialFrame = thoughtFrames.createSocialAIFrame();
      this.assert(socialFrame.context, 'Should have context information');
      this.assert(socialFrame.context.relevantCode !== undefined, 'Should have relevant code count');
      
      // Test context insights
      const insights = thoughtFrames.getContextInsights(upgradeFrame.id);
      this.assert(insights, 'Should provide context insights');
      
      // Test context stats
      const stats = thoughtFrames.getContextStats();
      this.assert(stats.totalFrames > 0, 'Should have frame statistics');
      
      this.recordTest('Thought Frames Integration', 'PASSED');
      
    } catch (error) {
      this.recordTest('Thought Frames Integration', 'FAILED', error.message);
    }
  }

  async testCrossSystemIntegration() {
    console.log('🔗 Testing Cross-System Integration...');
    
    try {
      // Test full integration workflow
      const automation = new ContextAutomation();
      const thoughtFrames = new ThoughtFrames();
      const buildHook = new BuildHook();
      
      // Simulate indexing
      await automation.indexProject();
      
      // Create thought frame
      const frame = thoughtFrames.createUpgradeFrame();
      
      // Execute frame
      await thoughtFrames.executeFrame(frame.id);
      
      // Check that everything is connected
      const automationStats = automation.getAutomationStats();
      const frameStats = thoughtFrames.getContextStats();
      const buildStats = buildHook.getBuildContextStats();
      
      this.assert(automationStats.totalIndexedFiles > 0, 'Should have indexed files');
      this.assert(frameStats.totalFrames > 0, 'Should have thought frames');
      this.assert(buildStats.memory.totalItems > 0, 'Should have memory items');
      
      // Test that the frame was added to the context indexer
      const frameItems = automation.contextIndexer.getAll('frames');
      this.assert(frameItems.length > 0, 'Should have frames in context indexer');
      
      // Test that the frame was added to context memory
      const frameSnapshots = automation.contextMemory.queryByTag('thought-frame');
      this.assert(frameSnapshots.length > 0, 'Should have thought frame snapshots in memory');
      
      // Test that knowledge graph connects everything (use thoughtFrames' graph)
      const graph = thoughtFrames.knowledgeGraph;
      const frameNode = graph.getNode(frame.id);
      this.assert(frameNode, 'Thought frame should be in knowledge graph');
      
      this.recordTest('Cross-System Integration', 'PASSED');
      
    } catch (error) {
      this.recordTest('Cross-System Integration', 'FAILED', error.message);
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  recordTest(testName, status, error = null) {
    this.testResults.push({
      test: testName,
      status,
      error,
      timestamp: Date.now()
    });
    
    const icon = status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} ${testName}: ${status}`);
    if (error) {
      console.log(`   Error: ${error}`);
    }
    console.log('');
  }

  printResults() {
    const duration = Date.now() - this.startTime;
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const total = this.testResults.length;
    
    console.log('📊 Test Results Summary:');
    console.log('=' .repeat(50));
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);
    console.log('=' .repeat(50));
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAILED')
        .forEach(r => {
          console.log(`  - ${r.test}: ${r.error}`);
        });
    }
    
    if (passed === total) {
      console.log('\n🎉 All tests passed! Context system is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the errors above.');
    }
  }
}

// Run the test suite
const testSuite = new ContextSystemTest();
testSuite.runAllTests().catch(console.error); 