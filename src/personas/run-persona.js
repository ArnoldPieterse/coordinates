// Persona Action Script
// Usage: node run-persona.js <persona-folder>

import fs from 'fs';
import path from 'path';
import { sendPromptToLMStudio } from './lmStudioClient.js';

const personaFolder = process.argv[2];
if (!personaFolder) {
  console.error('Usage: node run-persona.js <persona-folder>');
  process.exit(1);
}

const basePath = path.resolve('src/personas', personaFolder);
const promptsPath = path.join(basePath, 'prompts.md');
const contextPath = path.join(basePath, 'context.md');
const memoryPath = path.join(basePath, 'memory.md');

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

async function main() {
  const prompts = readFileSafe(promptsPath);
  const context = readFileSafe(contextPath);
  const memory = readFileSafe(memoryPath);

  // Extract the first prompt block from prompts.md
  const match = prompts.match(/```[\s\S]*?```/);
  const promptBlock = match ? match[0].replace(/```/g, '').trim() : prompts.trim();

  // Compose the full prompt
  const fullPrompt = `Persona Context:\n${context}\n\nMemory:\n${memory}\n\nPrompt:\n${promptBlock}`;

  // Send to LM Studio
  const response = await sendPromptToLMStudio(fullPrompt);

  // Append response to memory.md
  const log = `\n\n## LM Studio Response (${new Date().toISOString()})\n${response}\n`;
  fs.appendFileSync(memoryPath, log);
  console.log('Response written to', memoryPath);
}

main(); 