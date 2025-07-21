/**
 * BuildHook - Automated context indexing during build process
 * Integrates with Vite build system to maintain context
 */

import ContextAutomation from './ContextAutomation.js';
import ContextMemory from './ContextMemory.js';

export class BuildHook {
  constructor() {
    this.automation = new ContextAutomation();
    this.memory = new ContextMemory();
  }

  // Pre-build hook - index all files
  async preBuild() {
    console.log('🔍 Pre-build: Indexing project context...');
    
    const startTime = Date.now();
    
    try {
      // Index all project files
      await this.automation.indexProject();
      
      // Generate tests for new code files
      await this.generateTestsForNewCode();
      
      // Generate docs for new code files
      await this.generateDocsForNewCode();
      
      const duration = Date.now() - startTime;
      
      // Record build preparation
      this.memory.addSnapshot({
        type: 'pre-build-complete',
        tags: ['build', 'automation'],
        data: {
          duration,
          timestamp: Date.now(),
          stats: this.automation.getAutomationStats()
        }
      });
      
      console.log(`✅ Pre-build context indexing completed in ${duration}ms`);
      
    } catch (error) {
      console.error('❌ Pre-build context indexing failed:', error);
      
      // Record build failure
      this.memory.addSnapshot({
        type: 'pre-build-failed',
        tags: ['build', 'error'],
        data: {
          error: error.message,
          timestamp: Date.now()
        }
      });
      
      throw error;
    }
  }

  // Post-build hook - update context with build results
  async postBuild(buildStats) {
    console.log('📊 Post-build: Updating context with build results...');
    
    try {
      // Record build statistics
      this.memory.addSnapshot({
        type: 'build-complete',
        tags: ['build', 'success'],
        data: {
          buildStats,
          timestamp: Date.now(),
          contextStats: this.automation.getAutomationStats()
        }
      });
      
      // Update knowledge graph with build artifacts
      await this.updateBuildArtifacts();
      
      console.log('✅ Post-build context update completed');
      
    } catch (error) {
      console.error('❌ Post-build context update failed:', error);
      
      this.memory.addSnapshot({
        type: 'post-build-failed',
        tags: ['build', 'error'],
        data: {
          error: error.message,
          timestamp: Date.now()
        }
      });
    }
  }

  // Generate tests for new code files
  async generateTestsForNewCode() {
    console.log('🧪 Generating tests for new code...');
    
    const codeFiles = this.automation.contextIndexer.getAll('code');
    let generatedTests = 0;
    
    for (const file of codeFiles) {
      try {
        await this.automation.generateTestsForFile(file.path);
        generatedTests++;
      } catch (error) {
        console.warn(`⚠️ Failed to generate test for ${file.path}:`, error.message);
      }
    }
    
    if (generatedTests > 0) {
      console.log(`✅ Generated ${generatedTests} test files`);
    }
  }

  // Generate docs for new code files
  async generateDocsForNewCode() {
    console.log('📚 Generating docs for new code...');
    
    const codeFiles = this.automation.contextIndexer.getAll('code');
    let generatedDocs = 0;
    
    for (const file of codeFiles) {
      try {
        await this.automation.generateDocsForFile(file.path);
        generatedDocs++;
      } catch (error) {
        console.warn(`⚠️ Failed to generate docs for ${file.path}:`, error.message);
      }
    }
    
    if (generatedDocs > 0) {
      console.log(`✅ Generated ${generatedDocs} documentation files`);
    }
  }

  // Update build artifacts in knowledge graph
  async updateBuildArtifacts() {
    // Add build artifacts to knowledge graph
    this.automation.knowledgeGraph.addNode('build:dist', {
      type: 'build-artifact',
      name: 'Distribution Build',
      path: 'dist/',
      timestamp: Date.now()
    });
    
    // Link build artifacts to source files
    const codeFiles = this.automation.contextIndexer.getAll('code');
    codeFiles.forEach(file => {
      this.automation.knowledgeGraph.addEdge(file.path, 'build:dist', 'builds-to');
    });
  }

  // Get build context statistics
  getBuildContextStats() {
    return {
      automation: this.automation.getAutomationStats(),
      memory: {
        totalItems: this.memory.getAll().length,
        recentBuilds: this.memory.queryByTag('build').length
      }
    };
  }
}

export default BuildHook; 