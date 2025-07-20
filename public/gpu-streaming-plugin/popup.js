/**
 * Popup JavaScript for GPU Streaming Plugin
 * Handles user interface interactions
 */

document.addEventListener('DOMContentLoaded', async () => {
  await initializePopup();
});

/**
 * Initialize the popup
 */
async function initializePopup() {
  try {
    // Get current status
    const status = await chrome.runtime.sendMessage({ action: 'getStatus' });
    
    // Hide loading, show content
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
    
    // Update UI with status
    updateStatusDisplay(status);
    
    // Load settings
    await loadSettings();
    
    // Load earnings
    await loadEarnings();
    
    // Setup event listeners
    setupEventListeners();
    
  } catch (error) {
    console.error('Failed to initialize popup:', error);
    showError('Failed to load plugin status');
  }
}

/**
 * Update status display
 */
function updateStatusDisplay(status) {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const gpuInfo = document.getElementById('gpuInfo');
  const lmStudioStatus = document.getElementById('lmStudioStatus');
  const pluginId = document.getElementById('pluginId');
  const connectBtn = document.getElementById('connectBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  
  // Update connection status
  if (status.isConnected) {
    statusDot.className = 'status-dot connected';
    statusText.textContent = 'Connected';
    connectBtn.style.display = 'none';
    disconnectBtn.style.display = 'block';
  } else {
    statusDot.className = 'status-dot disconnected';
    statusText.textContent = 'Disconnected';
    connectBtn.style.display = 'block';
    disconnectBtn.style.display = 'none';
  }
  
  // Update GPU info
  if (status.gpuInfo) {
    gpuInfo.textContent = status.gpuInfo.gpu || 'Unknown GPU';
  } else {
    gpuInfo.textContent = 'Not detected';
  }
  
  // Update LM Studio status
  if (status.lmStudioUrl) {
    lmStudioStatus.textContent = 'Connected';
  } else {
    lmStudioStatus.textContent = 'Not detected';
  }
  
  // Update plugin ID (show first 8 characters)
  if (status.pluginId) {
    pluginId.textContent = status.pluginId.substring(0, 8) + '...';
  } else {
    pluginId.textContent = 'Not registered';
  }
}

/**
 * Load settings from storage
 */
async function loadSettings() {
  try {
    const settings = await chrome.storage.local.get(['lmStudioUrl', 'pricing']);
    
    if (settings.lmStudioUrl) {
      document.getElementById('lmStudioUrl').value = settings.lmStudioUrl;
    }
    
    if (settings.pricing) {
      document.getElementById('pricing').value = settings.pricing;
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

/**
 * Load earnings
 */
async function loadEarnings() {
  try {
    const earnings = await chrome.runtime.sendMessage({ action: 'getEarnings' });
    document.getElementById('earningsAmount').textContent = `$${earnings.earnings.toFixed(4)}`;
  } catch (error) {
    console.error('Failed to load earnings:', error);
    document.getElementById('earningsAmount').textContent = '$0.00';
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Connect button
  document.getElementById('connectBtn').addEventListener('click', async () => {
    await connectToService();
  });
  
  // Disconnect button
  document.getElementById('disconnectBtn').addEventListener('click', async () => {
    await disconnectFromService();
  });
  
  // Save settings button
  document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
    await saveSettings();
  });
}

/**
 * Connect to service
 */
async function connectToService() {
  try {
    showLoading('Connecting to service...');
    
    const result = await chrome.runtime.sendMessage({ action: 'connect' });
    
    if (result.success) {
      showSuccess('Connected successfully!');
      await refreshStatus();
    } else {
      showError(`Connection failed: ${result.error}`);
    }
  } catch (error) {
    showError('Failed to connect: ' + error.message);
  }
}

/**
 * Disconnect from service
 */
async function disconnectFromService() {
  try {
    showLoading('Disconnecting...');
    
    const result = await chrome.runtime.sendMessage({ action: 'disconnect' });
    
    if (result.success) {
      showSuccess('Disconnected successfully!');
      await refreshStatus();
    } else {
      showError(`Disconnect failed: ${result.error}`);
    }
  } catch (error) {
    showError('Failed to disconnect: ' + error.message);
  }
}

/**
 * Save settings
 */
async function saveSettings() {
  try {
    const lmStudioUrl = document.getElementById('lmStudioUrl').value;
    const pricing = parseFloat(document.getElementById('pricing').value);
    
    const settings = {};
    if (lmStudioUrl) settings.lmStudioUrl = lmStudioUrl;
    if (pricing) settings.pricing = pricing;
    
    const result = await chrome.runtime.sendMessage({ 
      action: 'updateSettings', 
      settings 
    });
    
    if (result.success) {
      showSuccess('Settings saved!');
    } else {
      showError('Failed to save settings');
    }
  } catch (error) {
    showError('Failed to save settings: ' + error.message);
  }
}

/**
 * Refresh status
 */
async function refreshStatus() {
  try {
    const status = await chrome.runtime.sendMessage({ action: 'getStatus' });
    updateStatusDisplay(status);
    await loadEarnings();
  } catch (error) {
    console.error('Failed to refresh status:', error);
  }
}

/**
 * Show loading message
 */
function showLoading(message) {
  const loading = document.getElementById('loading');
  loading.querySelector('p').textContent = message;
  loading.style.display = 'block';
  document.getElementById('content').style.display = 'none';
}

/**
 * Show success message
 */
function showSuccess(message) {
  showMessage(message, 'success');
}

/**
 * Show error message
 */
function showError(message) {
  showMessage(message, 'error');
}

/**
 * Show message
 */
function showMessage(message, type) {
  // Hide loading
  document.getElementById('loading').style.display = 'none';
  document.getElementById('content').style.display = 'block';
  
  // Create temporary message
  const messageDiv = document.createElement('div');
  messageDiv.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    right: 10px;
    padding: 10px;
    border-radius: 5px;
    text-align: center;
    font-weight: 600;
    z-index: 1000;
    background: ${type === 'success' ? '#00ff00' : '#ff0000'};
    color: ${type === 'success' ? '#000' : '#fff'};
  `;
  messageDiv.textContent = message;
  
  document.body.appendChild(messageDiv);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv);
    }
  }, 3000);
} 