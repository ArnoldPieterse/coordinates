// Persona Network Master Script
// Usage: node run-persona-network.js

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const personasDir = path.resolve('src/personas');
const personaFolders = fs.readdirSync(personasDir).filter(f => fs.statSync(path.join(personasDir, f)).isDirectory());

const results = [];

for (const persona of personaFolders) {
  console.log(`\n=== Running persona: ${persona} ===`);
  try {
    execSync(`node src/personas/run-persona.js ${persona}`, { stdio: 'inherit' });
    const memoryPath = path.join(personasDir, persona, 'memory.md');
    const memory = fs.readFileSync(memoryPath, 'utf-8');
    // Get the last LM Studio response
    const lastResponse = memory.split('## LM Studio Response').pop().trim();
    results.push({ persona, lastResponse });
  } catch (err) {
    console.error(`Error running persona ${persona}:`, err.message);
  }
}

console.log('\n=== Persona Network Summary ===');
for (const { persona, lastResponse } of results) {
  console.log(`\n[${persona}]\n${lastResponse.substring(0, 500)}...`);
} 