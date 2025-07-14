#!/usr/bin/env node
/**
 * Auto LLM Setup Script
 * - Starts LM Studio and Ollama if installed
 * - Checks for API keys for OpenAI, Anthropic, HuggingFace
 * - Runs the LLM test suite and saves results
 * - Intended for use in local/dev and as part of deployment
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const LLM_TEST_SCRIPT = path.join(__dirname, 'test-llm-comprehensive.js');
const TEST_STATUS_FILE = path.join(__dirname, 'llm-test-status.json');

function startProcess(command, args, name) {
  return new Promise((resolve) => {
    const proc = spawn(command, args, { stdio: 'ignore', detached: true });
    proc.on('error', () => resolve(false));
    proc.unref();
    setTimeout(() => resolve(true), 2000); // Wait 2s for process to start
  });
}

async function tryStartLMStudio() {
  // Try to start LM Studio if installed
  const isWin = process.platform === 'win32';
  const cmd = isWin ? 'LM Studio.exe' : 'lm-studio';
  const possiblePaths = isWin
    ? [
        'C:/Program Files/LM Studio/LM Studio.exe',
        'C:/Program Files (x86)/LM Studio/LM Studio.exe',
        path.join(process.env.USERPROFILE || '', 'AppData/Local/Programs/LM Studio/LM Studio.exe')
      ]
    : ['/Applications/LM Studio.app/Contents/MacOS/LM Studio', '/usr/local/bin/lm-studio', '/opt/lm-studio/lm-studio'];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      await startProcess(p, [], 'LM Studio');
      return true;
    }
  }
  return false;
}

async function tryStartOllama() {
  // Try to start Ollama if installed
  const isWin = process.platform === 'win32';
  const cmd = isWin ? 'ollama.exe' : 'ollama';
  const possiblePaths = isWin
    ? [
        'C:/Program Files/Ollama/ollama.exe',
        'C:/Program Files (x86)/Ollama/ollama.exe',
        path.join(process.env.USERPROFILE || '', 'AppData/Local/Programs/Ollama/ollama.exe')
      ]
    : ['/usr/local/bin/ollama', '/opt/ollama/ollama'];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      await startProcess(p, ['serve'], 'Ollama');
      return true;
    }
  }
  return false;
}

function checkAPIKeys() {
  const missing = [];
  if (!process.env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
  if (!process.env.ANTHROPIC_API_KEY) missing.push('ANTHROPIC_API_KEY');
  if (!process.env.HUGGINGFACE_API_KEY) missing.push('HUGGINGFACE_API_KEY');
  return missing;
}

function runLLMTestSuite() {
  return new Promise((resolve) => {
    exec(`node "${LLM_TEST_SCRIPT}"`, { timeout: 60000 }, (err, stdout, stderr) => {
      if (err) {
        resolve({ success: false, error: err.message, stdout, stderr });
      } else {
        resolve({ success: true, stdout, stderr });
      }
    });
  });
}

(async () => {
  console.log('🔄 Auto LLM Setup: Starting...');
  const lmStudioStarted = await tryStartLMStudio();
  if (lmStudioStarted) console.log('✅ LM Studio started or already running.');
  else console.log('⚠️ LM Studio not found or could not be started.');

  const ollamaStarted = await tryStartOllama();
  if (ollamaStarted) console.log('✅ Ollama started or already running.');
  else console.log('⚠️ Ollama not found or could not be started.');

  const missingKeys = checkAPIKeys();
  if (missingKeys.length > 0) {
    console.log('⚠️ Missing API keys:', missingKeys.join(', '));
  } else {
    console.log('✅ All API keys present.');
  }

  console.log('🧪 Running LLM test suite...');
  const testResult = await runLLMTestSuite();
  fs.writeFileSync(TEST_STATUS_FILE, JSON.stringify(testResult, null, 2));
  if (testResult.success) {
    console.log('✅ LLM test suite passed.');
  } else {
    console.log('❌ LLM test suite failed:', testResult.error);
  }
  console.log('🔄 Auto LLM Setup: Complete.');
})(); 