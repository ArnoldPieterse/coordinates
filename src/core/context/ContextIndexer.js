/**
 * ContextIndexer - Project-wide context indexer for Rekursing
 * Scans code, docs, tests, and user stories, and builds a persistent index.
 */

import fs from 'fs';
import path from 'path';

export class ContextIndexer {
  constructor(indexFile = 'context-index.json') {
    this.indexFile = path.resolve(indexFile);
    this.index = { code: [], docs: [], tests: [], stories: [] };
    this.loadIndex();
  }

  // Load index from disk
  loadIndex() {
    if (fs.existsSync(this.indexFile)) {
      this.index = JSON.parse(fs.readFileSync(this.indexFile, 'utf-8'));
    }
  }

  // Save index to disk
  saveIndex() {
    fs.writeFileSync(this.indexFile, JSON.stringify(this.index, null, 2));
  }

  // Add or update a context item
  addItem(type, item) {
    if (!this.index[type]) this.index[type] = [];
    const existing = this.index[type].find(i => i.id === item.id);
    if (existing) {
      Object.assign(existing, item);
    } else {
      this.index[type].push(item);
    }
    this.saveIndex();
  }

  // Search context items by keyword
  search(type, keyword) {
    if (!this.index[type]) return [];
    return this.index[type].filter(item =>
      Object.values(item).some(val =>
        typeof val === 'string' && val.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  }

  // Get all items of a type
  getAll(type) {
    return this.index[type] || [];
  }
}

export default ContextIndexer; 