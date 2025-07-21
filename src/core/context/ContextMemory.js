/**
 * ContextMemory - Persistent memory for thought frames, decisions, and context snapshots.
 */

import fs from 'fs';
import path from 'path';

export class ContextMemory {
  constructor(memoryFile = 'context-memory.json') {
    this.memoryFile = path.resolve(memoryFile);
    this.memory = [];
    this.load();
  }

  // Load memory from disk
  load() {
    if (fs.existsSync(this.memoryFile)) {
      this.memory = JSON.parse(fs.readFileSync(this.memoryFile, 'utf-8'));
    }
  }

  // Save memory to disk
  save() {
    fs.writeFileSync(this.memoryFile, JSON.stringify(this.memory, null, 2));
  }

  // Add a context snapshot
  addSnapshot(snapshot) {
    this.memory.push({ ...snapshot, timestamp: Date.now() });
    this.save();
  }

  // Query by tag
  queryByTag(tag) {
    return this.memory.filter(s => s.tags && s.tags.includes(tag));
  }

  // Query by time range
  queryByTime(start, end) {
    return this.memory.filter(s => s.timestamp >= start && s.timestamp <= end);
  }

  // Get all
  getAll() {
    return this.memory;
  }
}

export default ContextMemory; 