// LM Studio Client Utility
// Sends prompts to local LM Studio API and returns completions

import fetch from 'node-fetch';

const LM_STUDIO_ENDPOINT = process.env.LM_STUDIO_ENDPOINT || 'http://localhost:1234/v1/completions';

/**
 * Send a prompt to LM Studio and get the completion
 * @param {string} prompt - The prompt to send
 * @param {object} options - { max_tokens, temperature, ... }
 * @returns {Promise<string>} - The completion text
 */
export async function sendPromptToLMStudio(prompt, options = {}) {
  const body = {
    prompt,
    max_tokens: options.max_tokens || 512,
    temperature: options.temperature || 0.7,
    ...options
  };

  const response = await fetch(LM_STUDIO_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`LM Studio API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  // Assume OpenAI-compatible API: { choices: [{ text: ... }] }
  return data.choices?.[0]?.text?.trim() || '';
} 