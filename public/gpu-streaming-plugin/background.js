/**
 * Background Service Worker for GPU Streaming Plugin
 * Manages connection to rekursing.com GPU streaming service
 */

let socket = null;
let pluginId = null;
let connectionToken = null;
let gpuInfo = null;
let lmStudioUrl = null;
let isConnected = false;

// Initialize plugin on installation
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('🔌 GPU Streaming Plugin installed');
    await initializePlugin();
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getStatus':
      sendResponse({ isConnected, gpuInfo, lmStudioUrl });
      break;
    
    case 'connect':
      connectToService().then(sendResponse);
      return true;
    
    case 'disconnect':
      disconnectFromService().then(sendResponse);
      return true;
    
    case 'updateSettings':
      updateSettings(request.settings).then(sendResponse);
      return true;
    
    case 'getEarnings':
      getEarnings().then(sendResponse);
      return true;
  }
});

/**
 * Initialize the plugin
 */
async function initializePlugin() {
  try {
    // Get stored settings
    const settings = await chrome.storage.local.get([
      'pluginId', 
      'connectionToken', 
      'gpuInfo', 
      'lmStudioUrl',
      'pricing',
      'permissions'
    ]);

    if (settings.pluginId) {
      pluginId = settings.pluginId;
      connectionToken = settings.connectionToken;
      gpuInfo = settings.gpuInfo;
      lmStudioUrl = settings.lmStudioUrl;
      
      // Auto-connect if we have credentials
      await connectToService();
    } else {
      // First time setup - detect GPU and LM Studio
      await detectSystemCapabilities();
    }
  } catch (error) {
    console.error('Failed to initialize plugin:', error);
  }
}

/**
 * Detect system capabilities (GPU and LM Studio)
 */
async function detectSystemCapabilities() {
  try {
    // Detect GPU using WebGL
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuInfo = {
          gpu: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
          vram: 'Unknown', // WebGL doesn't provide VRAM info
          type: 'WebGL'
        };
      }
    }

    // Try to detect LM Studio
    try {
      const response = await fetch('http://localhost:1234/v1/models');
      if (response.ok) {
        lmStudioUrl = 'http://localhost:1234';
      }
    } catch (error) {
      // LM Studio not running locally
    }

    // Store detected capabilities
    await chrome.storage.local.set({ gpuInfo, lmStudioUrl });
    
    console.log('🔍 Detected capabilities:', { gpuInfo, lmStudioUrl });
  } catch (error) {
    console.error('Failed to detect capabilities:', error);
  }
}

/**
 * Connect to the GPU streaming service
 */
async function connectToService() {
  try {
    if (isConnected) {
      return { success: true, message: 'Already connected' };
    }

    // Get or create plugin credentials
    if (!pluginId || !connectionToken) {
      const result = await registerPlugin();
      pluginId = result.pluginId;
      connectionToken = result.connectionToken;
      
      await chrome.storage.local.set({ pluginId, connectionToken });
    }

    // Connect to WebSocket
    socket = new WebSocket('ws://localhost:3002');
    
    socket.onopen = () => {
      console.log('🔌 Connected to GPU streaming service');
      socket.send(JSON.stringify({
        type: 'plugin:connect',
        pluginId,
        connectionToken
      }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleSocketMessage(data);
    };

    socket.onclose = () => {
      console.log('🔌 Disconnected from GPU streaming service');
      isConnected = false;
      updateBadge();
    };

    socket.onerror = (error) => {
      console.error('🔌 WebSocket error:', error);
      isConnected = false;
      updateBadge();
    };

    return { success: true, message: 'Connected to service' };
  } catch (error) {
    console.error('Failed to connect:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Register plugin with the service
 */
async function registerPlugin() {
  const settings = await chrome.storage.local.get(['gpuInfo', 'lmStudioUrl', 'pricing']);
  
  const response = await fetch('http://localhost:3002/api/plugin/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gpuInfo: settings.gpuInfo,
      lmStudioUrl: settings.lmStudioUrl,
      pricing: settings.pricing || 0.0001,
      capabilities: ['llama-3-70b', 'gpt-4', 'gemini-pro', 'mistral-7b']
    })
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error);
  }

  return result;
}

/**
 * Disconnect from the service
 */
async function disconnectFromService() {
  if (socket) {
    socket.close();
    socket = null;
  }
  
  isConnected = false;
  updateBadge();
  
  return { success: true, message: 'Disconnected from service' };
}

/**
 * Handle WebSocket messages
 */
function handleSocketMessage(data) {
  switch (data.type) {
    case 'plugin:connected':
      isConnected = true;
      updateBadge();
      console.log('🔌 Plugin connected successfully');
      break;
    
    case 'plugin:inference_request':
      handleInferenceRequest(data);
      break;
    
    case 'plugin:heartbeat':
      socket.send(JSON.stringify({ type: 'plugin:heartbeat' }));
      break;
  }
}

/**
 * Handle inference requests from rekursing.com
 */
async function handleInferenceRequest(data) {
  try {
    console.log('🧠 Processing inference request:', data);
    
    let result;
    
    // Try LM Studio first if available
    if (lmStudioUrl) {
      try {
        result = await callLMStudio(data.prompt, data.model);
      } catch (error) {
        console.log('LM Studio failed, using fallback');
      }
    }
    
    // Fallback to local processing if LM Studio fails
    if (!result) {
      result = await processLocally(data.prompt, data.model);
    }
    
    // Send response back
    socket.send(JSON.stringify({
      type: 'plugin:inference_response',
      requestId: data.requestId,
      result: {
        response: result,
        model: data.model,
        tokens: result.length,
        cost: calculateCost(result.length, data.model)
      }
    }));
    
  } catch (error) {
    console.error('Inference request failed:', error);
    socket.send(JSON.stringify({
      type: 'plugin:inference_response',
      requestId: data.requestId,
      error: error.message
    }));
  }
}

/**
 * Call LM Studio API
 */
async function callLMStudio(prompt, model) {
  const response = await fetch(`${lmStudioUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`LM Studio API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Process locally as fallback
 */
async function processLocally(prompt, model) {
  // Simple local processing - in a real implementation, this would use a local model
  return `[Local Processing] Response to: "${prompt}" (Model: ${model})`;
}

/**
 * Calculate cost for inference
 */
function calculateCost(tokenCount, model) {
  const baseRate = 0.0001; // $0.0001 per token
  return tokenCount * baseRate;
}

/**
 * Update settings
 */
async function updateSettings(settings) {
  await chrome.storage.local.set(settings);
  
  if (settings.gpuInfo) gpuInfo = settings.gpuInfo;
  if (settings.lmStudioUrl) lmStudioUrl = settings.lmStudioUrl;
  
  return { success: true };
}

/**
 * Get earnings
 */
async function getEarnings() {
  if (!pluginId) {
    return { earnings: 0 };
  }

  try {
    const response = await fetch(`http://localhost:3002/api/plugin/earnings/${pluginId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    return { earnings: 0, error: error.message };
  }
}

/**
 * Update extension badge
 */
function updateBadge() {
  const text = isConnected ? 'ON' : 'OFF';
  const color = isConnected ? '#00ff00' : '#ff0000';
  
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
} 