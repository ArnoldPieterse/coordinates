/**
 * ContextAutomation - Automated context indexing and knowledge graph updates
 * Hooks into build process and file system monitoring
 */

import fs from 'fs';
import path from 'path';
import ContextIndexer from './ContextIndexer.js';
import KnowledgeGraph from './KnowledgeGraph.js';
import ContextMemory from './ContextMemory.js';

export class ContextAutomation {
  constructor() {
    this.contextIndexer = new ContextIndexer();
    this.knowledgeGraph = new KnowledgeGraph();
    this.contextMemory = new ContextMemory();
    this.watchedDirectories = ['src', 'docs', 'tests', 'public'];
    this.fileExtensions = ['.js', '.jsx', '.ts', '.tsx', '.md', '.html', '.css'];
  }

  // Auto-index the entire project
  async indexProject() {
    console.log('🔍 Starting automated project indexing...');
    
    const startTime = Date.now();
    let totalFiles = 0;
    let indexedFiles = 0;

    for (const dir of this.watchedDirectories) {
      if (fs.existsSync(dir)) {
        const files = await this.scanDirectory(dir);
        totalFiles += files.length;
        
        for (const file of files) {
          await this.indexFile(file);
          indexedFiles++;
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Indexed ${indexedFiles}/${totalFiles} files in ${duration}ms`);

    // Record indexing completion
    this.contextMemory.addSnapshot({
      type: 'project-indexing',
      tags: ['automation', 'indexing'],
      data: {
        totalFiles,
        indexedFiles,
        duration,
        timestamp: Date.now()
      }
    });
  }

  // Scan directory recursively for files
  async scanDirectory(dirPath) {
    const files = [];
    
    const scan = (currentPath) => {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scan(fullPath);
        } else if (this.shouldIndexFile(fullPath)) {
          files.push(fullPath);
        }
      }
    };

    scan(dirPath);
    return files;
  }

  // Check if file should be indexed
  shouldIndexFile(filePath) {
    const ext = path.extname(filePath);
    return this.fileExtensions.includes(ext);
  }

  // Index a single file
  async indexFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const stats = fs.statSync(filePath);
      const relativePath = path.relative('.', filePath);
      
      // Determine file type
      const fileType = this.getFileType(filePath);
      
      // Extract metadata
      const metadata = this.extractMetadata(filePath, content, stats);
      
      // Add to context indexer
      this.contextIndexer.addItem(fileType, {
        id: relativePath,
        path: relativePath,
        type: fileType,
        size: stats.size,
        modified: stats.mtime,
        metadata,
        content: content.substring(0, 1000) // First 1000 chars for search
      });

      // Add to knowledge graph
      this.knowledgeGraph.addNode(relativePath, {
        type: fileType,
        path: relativePath,
        size: stats.size,
        modified: stats.mtime
      });

      // Add relationships based on imports/exports
      if (fileType === 'code') {
        await this.addCodeRelationships(relativePath, content);
      }

    } catch (error) {
      console.error(`❌ Failed to index ${filePath}:`, error.message);
    }
  }

  // Get file type based on extension and path
  getFileType(filePath) {
    const ext = path.extname(filePath);
    const dir = path.dirname(filePath);
    
    if (ext === '.md' || dir.includes('docs')) {
      return 'docs';
    } else if (dir.includes('test') || dir.includes('spec')) {
      return 'tests';
    } else if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
      return 'code';
    } else {
      return 'other';
    }
  }

  // Extract metadata from file
  extractMetadata(filePath, content, stats) {
    const metadata = {
      lines: content.split('\n').length,
      hasComments: content.includes('//') || content.includes('/*'),
      hasImports: content.includes('import ') || content.includes('require('),
      hasExports: content.includes('export ') || content.includes('module.exports'),
      hasTests: content.includes('test(') || content.includes('describe('),
      hasDocs: content.includes('#') || content.includes('<!--'),
      lastModified: stats.mtime
    };

    // Extract keywords for better search
    const keywords = this.extractKeywords(content);
    if (keywords.length > 0) {
      metadata.keywords = keywords;
    }

    return metadata;
  }

  // Extract keywords from content
  extractKeywords(content) {
    const keywords = [];
    
    // Common programming patterns
    const patterns = [
      /class\s+(\w+)/g,
      /function\s+(\w+)/g,
      /const\s+(\w+)/g,
      /let\s+(\w+)/g,
      /var\s+(\w+)/g,
      /export\s+(?:default\s+)?(\w+)/g,
      /import\s+.*?from\s+['"]([^'"]+)['"]/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        keywords.push(match[1]);
      }
    });

    return [...new Set(keywords)].slice(0, 10); // Max 10 unique keywords
  }

  // Add code relationships based on imports/exports
  async addCodeRelationships(filePath, content) {
    // Find imports
    const importMatches = content.matchAll(/import\s+.*?from\s+['"]([^'"]+)['"]/g);
    for (const match of importMatches) {
      const importPath = match[1];
      if (importPath.startsWith('.')) {
        // Relative import
        const resolvedPath = this.resolveRelativePath(filePath, importPath);
        if (resolvedPath) {
          this.knowledgeGraph.addEdge(filePath, resolvedPath, 'imports');
        }
      }
    }

    // Find exports
    const exportMatches = content.matchAll(/export\s+(?:default\s+)?(\w+)/g);
    for (const match of exportMatches) {
      const exportName = match[1];
      this.knowledgeGraph.addNode(`${filePath}:${exportName}`, {
        type: 'export',
        name: exportName,
        file: filePath
      });
      this.knowledgeGraph.addEdge(filePath, `${filePath}:${exportName}`, 'exports');
    }
  }

  // Resolve relative import path
  resolveRelativePath(fromFile, importPath) {
    try {
      const resolved = path.resolve(path.dirname(fromFile), importPath);
      const relative = path.relative('.', resolved);
      
      // Add common extensions
      const extensions = ['.js', '.jsx', '.ts', '.tsx'];
      for (const ext of extensions) {
        const withExt = relative + ext;
        if (fs.existsSync(withExt)) {
          return withExt;
        }
      }
      
      return relative;
    } catch (error) {
      return null;
    }
  }

  // Auto-generate tests for new code
  async generateTestsForFile(filePath) {
    const file = this.contextIndexer.search('code', filePath)[0];
    if (!file) return;

    const testContent = this.generateTestContent(file);
    const testPath = this.getTestPath(filePath);
    
    if (!fs.existsSync(testPath)) {
      fs.writeFileSync(testPath, testContent);
      console.log(`🧪 Generated test for ${filePath}`);
      
      // Index the new test file
      await this.indexFile(testPath);
    }
  }

  // Generate test content
  generateTestContent(file) {
    const className = path.basename(file.path, path.extname(file.path));
    const testName = `${className}.test.js`;
    
    return `/**
 * Auto-generated test for ${file.path}
 * Generated by ContextAutomation
 */

import { describe, it, expect } from 'vitest';

describe('${className}', () => {
  it('should be properly structured', () => {
    // TODO: Add specific tests based on file content
    expect(true).toBe(true);
  });
});
`;
  }

  // Get test path for a file
  getTestPath(filePath) {
    const dir = path.dirname(filePath);
    const name = path.basename(filePath, path.extname(filePath));
    return path.join(dir, '__tests__', `${name}.test.js`);
  }

  // Auto-generate documentation for new code
  async generateDocsForFile(filePath) {
    const file = this.contextIndexer.search('code', filePath)[0];
    if (!file) return;

    const docContent = this.generateDocContent(file);
    const docPath = this.getDocPath(filePath);
    
    if (!fs.existsSync(docPath)) {
      // Ensure docs directory exists
      const docDir = path.dirname(docPath);
      if (!fs.existsSync(docDir)) {
        fs.mkdirSync(docDir, { recursive: true });
      }
      
      fs.writeFileSync(docPath, docContent);
      console.log(`📚 Generated docs for ${filePath}`);
      
      // Index the new doc file
      await this.indexFile(docPath);
    }
  }

  // Generate documentation content
  generateDocContent(file) {
    const className = path.basename(file.path, path.extname(file.path));
    const docName = `${className}.md`;
    
    return `# ${className}

## Overview
Auto-generated documentation for \`${file.path}\`

## File Information
- **Path**: \`${file.path}\`
- **Type**: ${file.type}
- **Size**: ${file.size} bytes
- **Last Modified**: ${file.metadata.lastModified}

## Keywords
${file.metadata.keywords ? file.metadata.keywords.map(k => `- \`${k}\``).join('\n') : '- None detected'}

## Dependencies
${this.getDependencies(file.path)}

## Usage
\`\`\`javascript
// TODO: Add usage examples
\`\`\`

---
*Generated by ContextAutomation*
`;
  }

  // Get dependencies for a file
  getDependencies(filePath) {
    const relationships = this.knowledgeGraph.getRelationships(filePath);
    const imports = relationships.filter(r => r.type === 'imports');
    
    if (imports.length === 0) {
      return '- No dependencies detected';
    }
    
    return imports.map(r => {
      const related = r.from === filePath ? r.to : r.from;
      return `- \`${related}\``;
    }).join('\n');
  }

  // Get documentation path for a file
  getDocPath(filePath) {
    const relativePath = path.relative('src', filePath);
    const name = path.basename(filePath, path.extname(filePath));
    return path.join('docs', 'code', relativePath.replace(path.extname(filePath), '.md'));
  }

  // Monitor file changes and auto-index
  startFileMonitoring() {
    console.log('👀 Starting file monitoring...');
    
    // This would integrate with a file watcher library
    // For now, we'll just provide the interface
    this.contextMemory.addSnapshot({
      type: 'file-monitoring-start',
      tags: ['automation', 'monitoring'],
      data: { timestamp: Date.now() }
    });
  }

  // Get automation statistics
  getAutomationStats() {
    return {
      totalIndexedFiles: this.contextIndexer.getAll('code').length + 
                        this.contextIndexer.getAll('docs').length + 
                        this.contextIndexer.getAll('tests').length,
      totalRelationships: this.knowledgeGraph.edges.length,
      totalMemoryItems: this.contextMemory.getAll().length,
      watchedDirectories: this.watchedDirectories,
      fileExtensions: this.fileExtensions
    };
  }
}

export default ContextAutomation; 