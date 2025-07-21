// Artist Controls System - Real-time tree manipulation and editing
// Implements artist-friendly controls, presets, and collaborative editing

import * as THREE from './three.module.js';

// ============================================================================
// 1. ARTIST-FRIENDLY CONTROL INTERFACE
// ============================================================================

class ArtistControlPanel {
  constructor(container, treeGenerator) {
    this.container = container;
    this.treeGenerator = treeGenerator;
    this.controls = new Map();
    this.presets = new TreePresetManager();
    this.history = new EditHistory();
    this.collaboration = new CollaborationManager();
    
    this.createInterface();
    this.bindEvents();
  }

  createInterface() {
    this.container.innerHTML = `
      <div class="artist-panel">
        <div class="panel-section">
          <h3>Tree Structure</h3>
          <div class="control-group">
            <label>Branch Count: <input type="range" id="branch-count" min="1" max="20" value="4"></label>
            <span id="branch-count-value">4</span>
          </div>
          <div class="control-group">
            <label>Branch Levels: <input type="range" id="branch-levels" min="2" max="8" value="5"></label>
            <span id="branch-levels-value">5</span>
          </div>
          <div class="control-group">
            <label>Initial Split: <input type="range" id="initial-split" min="1" max="6" value="2"></label>
            <span id="initial-split-value">2</span>
          </div>
        </div>

        <div class="panel-section">
          <h3>Growth Parameters</h3>
          <div class="control-group">
            <label>Length: <input type="range" id="branch-length" min="5" max="25" value="12"></label>
            <span id="branch-length-value">12</span>
          </div>
          <div class="control-group">
            <label>Angle: <input type="range" id="branch-angle" min="15" max="75" value="45"></label>
            <span id="branch-angle-value">45°</span>
          </div>
          <div class="control-group">
            <label>Radius: <input type="range" id="branch-radius" min="0.5" max="3" step="0.1" value="1"></label>
            <span id="branch-radius-value">1.0</span>
          </div>
        </div>

        <div class="panel-section">
          <h3>Variation & Randomness</h3>
          <div class="control-group">
            <label>Randomness: <input type="range" id="randomness" min="0" max="2" step="0.1" value="0.7"></label>
            <span id="randomness-value">0.7</span>
          </div>
          <div class="control-group">
            <label>Variation: <input type="range" id="variation" min="0" max="1" step="0.05" value="0.3"></label>
            <span id="variation-value">0.30</span>
          </div>
          <div class="control-group">
            <label>Golden Ratio: <input type="checkbox" id="golden-ratio" checked></label>
          </div>
        </div>

        <div class="panel-section">
          <h3>Root System</h3>
          <div class="control-group">
            <label>Root Complexity: <input type="range" id="root-complexity" min="0.2" max="1" step="0.1" value="0.5"></label>
            <span id="root-complexity-value">0.5</span>
          </div>
          <div class="control-group">
            <label>Root Depth: <input type="range" id="root-depth" min="1" max="5" value="3"></label>
            <span id="root-depth-value">3</span>
          </div>
        </div>

        <div class="panel-section">
          <h3>Presets</h3>
          <div class="preset-buttons">
            <button id="preset-oak" class="preset-btn">Oak</button>
            <button id="preset-pine" class="preset-btn">Pine</button>
            <button id="preset-willow" class="preset-btn">Willow</button>
            <button id="preset-maple" class="preset-btn">Maple</button>
            <button id="preset-palm" class="preset-btn">Palm</button>
          </div>
        </div>

        <div class="panel-section">
          <h3>Actions</h3>
          <div class="action-buttons">
            <button id="regenerate-tree" class="action-btn primary">Regenerate Tree</button>
            <button id="save-preset" class="action-btn">Save Preset</button>
            <button id="load-preset" class="action-btn">Load Preset</button>
            <button id="export-obj" class="action-btn">Export OBJ</button>
            <button id="undo" class="action-btn">Undo</button>
            <button id="redo" class="action-btn">Redo</button>
          </div>
        </div>

        <div class="panel-section">
          <h3>Collaboration</h3>
          <div class="collaboration-controls">
            <input type="text" id="session-id" placeholder="Session ID" />
            <button id="join-session" class="action-btn">Join Session</button>
            <button id="share-session" class="action-btn">Share Session</button>
            <div id="collaborators-list"></div>
          </div>
        </div>
      </div>
    `;

    this.createStyles();
  }

  createStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .artist-panel {
        background: #2a2a2a;
        color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      }

      .panel-section {
        margin-bottom: 20px;
        padding: 15px;
        background: #3a3a3a;
        border-radius: 6px;
        border-left: 4px solid #4CAF50;
      }

      .panel-section h3 {
        margin: 0 0 15px 0;
        color: #4CAF50;
        font-size: 16px;
        font-weight: 600;
      }

      .control-group {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding: 8px;
        background: #444;
        border-radius: 4px;
      }

      .control-group label {
        flex: 1;
        font-size: 14px;
        color: #ddd;
      }

      .control-group input[type="range"] {
        flex: 1;
        margin: 0 10px;
        background: #555;
        border-radius: 2px;
        height: 6px;
        outline: none;
      }

      .control-group input[type="range"]::-webkit-slider-thumb {
        background: #4CAF50;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        cursor: pointer;
      }

      .control-group span {
        min-width: 40px;
        text-align: right;
        font-size: 12px;
        color: #4CAF50;
        font-weight: bold;
      }

      .preset-buttons, .action-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .preset-btn, .action-btn {
        padding: 8px 12px;
        border: none;
        border-radius: 4px;
        background: #555;
        color: #fff;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.2s;
      }

      .preset-btn:hover, .action-btn:hover {
        background: #666;
      }

      .action-btn.primary {
        background: #4CAF50;
        grid-column: 1 / -1;
      }

      .action-btn.primary:hover {
        background: #45a049;
      }

      .collaboration-controls {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .collaboration-controls input {
        padding: 8px;
        border: none;
        border-radius: 4px;
        background: #444;
        color: #fff;
        font-size: 12px;
      }

      #collaborators-list {
        margin-top: 10px;
        padding: 8px;
        background: #444;
        border-radius: 4px;
        font-size: 12px;
        min-height: 40px;
      }
    `;
    document.head.appendChild(style);
  }

  bindEvents() {
    // Bind range inputs
    const rangeInputs = [
      'branch-count', 'branch-levels', 'initial-split',
      'branch-length', 'branch-angle', 'branch-radius',
      'randomness', 'variation', 'root-complexity', 'root-depth'
    ];

    rangeInputs.forEach(id => {
      const input = document.getElementById(id);
      const valueSpan = document.getElementById(`${id}-value`);
      
      input.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (id === 'branch-angle') {
          valueSpan.textContent = `${value}°`;
        } else {
          valueSpan.textContent = value.toFixed(2);
        }
        this.updateControl(id, value);
      });
    });

    // Bind checkbox
    document.getElementById('golden-ratio').addEventListener('change', (e) => {
      this.updateControl('golden-ratio', e.target.checked);
    });

    // Bind preset buttons
    document.getElementById('preset-oak').addEventListener('click', () => this.loadPreset('oak'));
    document.getElementById('preset-pine').addEventListener('click', () => this.loadPreset('pine'));
    document.getElementById('preset-willow').addEventListener('click', () => this.loadPreset('willow'));
    document.getElementById('preset-maple').addEventListener('click', () => this.loadPreset('maple'));
    document.getElementById('preset-palm').addEventListener('click', () => this.loadPreset('palm'));

    // Bind action buttons
    document.getElementById('regenerate-tree').addEventListener('click', () => this.regenerateTree());
    document.getElementById('save-preset').addEventListener('click', () => this.savePreset());
    document.getElementById('load-preset').addEventListener('click', () => this.loadCustomPreset());
    document.getElementById('export-obj').addEventListener('click', () => this.exportOBJ());
    document.getElementById('undo').addEventListener('click', () => this.undo());
    document.getElementById('redo').addEventListener('click', () => this.redo());

    // Bind collaboration buttons
    document.getElementById('join-session').addEventListener('click', () => this.joinSession());
    document.getElementById('share-session').addEventListener('click', () => this.shareSession());
  }

  updateControl(id, value) {
    this.controls.set(id, value);
    this.history.addChange(id, value);
    this.collaboration.broadcastChange(id, value);
  }

  getCurrentSettings() {
    const settings = {};
    for (const [key, value] of this.controls) {
      settings[key] = value;
    }
    return settings;
  }

  regenerateTree() {
    const settings = this.getCurrentSettings();
    this.treeGenerator.generateTree(settings);
  }

  loadPreset(presetName) {
    const preset = this.presets.getPreset(presetName);
    if (preset) {
      this.applyPreset(preset);
    }
  }

  applyPreset(preset) {
    for (const [key, value] of Object.entries(preset)) {
      const input = document.getElementById(key);
      const valueSpan = document.getElementById(`${key}-value`);
      
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = value;
        } else {
          input.value = value;
        }
        
        if (valueSpan) {
          if (key === 'branch-angle') {
            valueSpan.textContent = `${value}°`;
          } else {
            valueSpan.textContent = parseFloat(value).toFixed(2);
          }
        }
        
        this.controls.set(key, value);
      }
    }
    
    this.regenerateTree();
  }

  savePreset() {
    const name = prompt('Enter preset name:');
    if (name) {
      const settings = this.getCurrentSettings();
      this.presets.savePreset(name, settings);
    }
  }

  loadCustomPreset() {
    const presets = this.presets.getAllPresets();
    const presetNames = Object.keys(presets);
    
    if (presetNames.length === 0) {
      alert('No custom presets available');
      return;
    }
    
    const presetName = prompt(`Available presets: ${presetNames.join(', ')}\nEnter preset name:`);
    if (presetName && presets[presetName]) {
      this.applyPreset(presets[presetName]);
    }
  }

  exportOBJ() {
    this.treeGenerator.exportOBJ();
  }

  undo() {
    const change = this.history.undo();
    if (change) {
      this.applyChange(change);
    }
  }

  redo() {
    const change = this.history.redo();
    if (change) {
      this.applyChange(change);
    }
  }

  applyChange(change) {
    const input = document.getElementById(change.control);
    const valueSpan = document.getElementById(`${change.control}-value`);
    
    if (input) {
      if (input.type === 'checkbox') {
        input.checked = change.value;
      } else {
        input.value = change.value;
      }
      
      if (valueSpan) {
        if (change.control === 'branch-angle') {
          valueSpan.textContent = `${change.value}°`;
        } else {
          valueSpan.textContent = parseFloat(change.value).toFixed(2);
        }
      }
      
      this.controls.set(change.control, change.value);
    }
  }

  joinSession() {
    const sessionId = document.getElementById('session-id').value;
    if (sessionId) {
      this.collaboration.joinSession(sessionId);
    }
  }

  shareSession() {
    const sessionId = this.collaboration.createSession();
    document.getElementById('session-id').value = sessionId;
    alert(`Session ID: ${sessionId}\nShare this ID with collaborators.`);
  }
}

// ============================================================================
// 2. TREE PRESET MANAGEMENT
// ============================================================================

class TreePresetManager {
  constructor() {
    this.presets = this.loadDefaultPresets();
    this.customPresets = this.loadCustomPresets();
  }

  loadDefaultPresets() {
    return {
      oak: {
        'branch-count': 4,
        'branch-levels': 5,
        'initial-split': 2,
        'branch-length': 12,
        'branch-angle': 45,
        'branch-radius': 1.0,
        'randomness': 0.7,
        'variation': 0.3,
        'golden-ratio': true,
        'root-complexity': 0.5,
        'root-depth': 3
      },
      pine: {
        'branch-count': 3,
        'branch-levels': 6,
        'initial-split': 2,
        'branch-length': 15,
        'branch-angle': 30,
        'branch-radius': 0.8,
        'randomness': 0.5,
        'variation': 0.2,
        'golden-ratio': true,
        'root-complexity': 0.3,
        'root-depth': 2
      },
      willow: {
        'branch-count': 6,
        'branch-levels': 4,
        'initial-split': 3,
        'branch-length': 18,
        'branch-angle': 60,
        'branch-radius': 0.6,
        'randomness': 1.0,
        'variation': 0.6,
        'golden-ratio': true,
        'root-complexity': 0.7,
        'root-depth': 4
      },
      maple: {
        'branch-count': 5,
        'branch-levels': 4,
        'initial-split': 2,
        'branch-length': 10,
        'branch-angle': 50,
        'branch-radius': 1.2,
        'randomness': 0.8,
        'variation': 0.4,
        'golden-ratio': true,
        'root-complexity': 0.6,
        'root-depth': 3
      },
      palm: {
        'branch-count': 8,
        'branch-levels': 3,
        'initial-split': 1,
        'branch-length': 20,
        'branch-angle': 15,
        'branch-radius': 0.5,
        'randomness': 0.3,
        'variation': 0.1,
        'golden-ratio': false,
        'root-complexity': 0.4,
        'root-depth': 2
      }
    };
  }

  loadCustomPresets() {
    const stored = localStorage.getItem('treeCustomPresets');
    return stored ? JSON.parse(stored) : {};
  }

  saveCustomPresets() {
    localStorage.setItem('treeCustomPresets', JSON.stringify(this.customPresets));
  }

  getPreset(name) {
    return this.presets[name] || this.customPresets[name];
  }

  getAllPresets() {
    return { ...this.presets, ...this.customPresets };
  }

  savePreset(name, settings) {
    this.customPresets[name] = { ...settings };
    this.saveCustomPresets();
  }

  deletePreset(name) {
    delete this.customPresets[name];
    this.saveCustomPresets();
  }
}

// ============================================================================
// 3. EDIT HISTORY MANAGEMENT
// ============================================================================

class EditHistory {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistory = 50;
  }

  addChange(control, value) {
    // Remove any future history if we're not at the end
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Add new change
    this.history.push({
      control: control,
      value: value,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }

  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }

  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }

  canUndo() {
    return this.currentIndex > 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  clear() {
    this.history = [];
    this.currentIndex = -1;
  }
}

// ============================================================================
// 4. COLLABORATION MANAGEMENT
// ============================================================================

class CollaborationManager {
  constructor() {
    this.sessionId = null;
    this.collaborators = new Map();
    this.websocket = null;
    this.changeQueue = [];
    this.isConnected = false;
  }

  createSession() {
    this.sessionId = this.generateSessionId();
    this.connectWebSocket();
    return this.sessionId;
  }

  joinSession(sessionId) {
    this.sessionId = sessionId;
    this.connectWebSocket();
  }

  generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  connectWebSocket() {
    // Simulate WebSocket connection for demo
    // In real implementation, connect to actual WebSocket server
    this.isConnected = true;
    this.updateCollaboratorsList();
    
    // Simulate receiving changes from other collaborators
    setInterval(() => {
      if (this.isConnected && this.changeQueue.length > 0) {
        const change = this.changeQueue.shift();
        this.handleRemoteChange(change);
      }
    }, 100);
  }

  broadcastChange(control, value) {
    if (!this.isConnected) return;
    
    const change = {
      sessionId: this.sessionId,
      control: control,
      value: value,
      timestamp: Date.now(),
      userId: this.getUserId()
    };
    
    // In real implementation, send via WebSocket
    console.log('Broadcasting change:', change);
  }

  handleRemoteChange(change) {
    // Handle changes from other collaborators
    console.log('Received remote change:', change);
    
    // Update UI without triggering local change events
    const input = document.getElementById(change.control);
    if (input) {
      if (input.type === 'checkbox') {
        input.checked = change.value;
      } else {
        input.value = change.value;
      }
      
      // Trigger change event to update display
      input.dispatchEvent(new Event('input'));
    }
  }

  getUserId() {
    return localStorage.getItem('treeUserId') || 
           'user_' + Math.random().toString(36).substring(2, 9);
  }

  updateCollaboratorsList() {
    const list = document.getElementById('collaborators-list');
    if (list) {
      const collaborators = Array.from(this.collaborators.values());
      if (collaborators.length === 0) {
        list.textContent = 'No collaborators';
      } else {
        list.innerHTML = collaborators.map(c => 
          `<div>${c.name} (${c.status})</div>`
        ).join('');
      }
    }
  }

  disconnect() {
    this.isConnected = false;
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
}

// ============================================================================
// 5. REAL-TIME PREVIEW SYSTEM
// ============================================================================

class RealTimePreview {
  constructor(container, treeGenerator) {
    this.container = container;
    this.treeGenerator = treeGenerator;
    this.previewRenderer = null;
    this.previewScene = null;
    this.previewCamera = null;
    this.isPreviewActive = false;
    
    this.createPreviewContainer();
  }

  createPreviewContainer() {
    this.container.innerHTML = `
      <div class="preview-container">
        <div class="preview-header">
          <h3>Real-Time Preview</h3>
          <button id="toggle-preview" class="preview-btn">Show Preview</button>
        </div>
        <div id="preview-canvas" class="preview-canvas" style="display: none;"></div>
        <div class="preview-controls">
          <button id="preview-wireframe" class="preview-btn">Wireframe</button>
          <button id="preview-smooth" class="preview-btn">Smooth</button>
          <button id="preview-reset-camera" class="preview-btn">Reset Camera</button>
        </div>
      </div>
    `;

    this.createPreviewStyles();
    this.bindPreviewEvents();
  }

  createPreviewStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .preview-container {
        background: #2a2a2a;
        border-radius: 8px;
        padding: 15px;
        margin-top: 20px;
      }

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }

      .preview-header h3 {
        margin: 0;
        color: #4CAF50;
        font-size: 16px;
      }

      .preview-canvas {
        width: 100%;
        height: 300px;
        background: #1a1a1a;
        border-radius: 6px;
        margin-bottom: 15px;
      }

      .preview-controls {
        display: flex;
        gap: 8px;
      }

      .preview-btn {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        background: #555;
        color: #fff;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.2s;
      }

      .preview-btn:hover {
        background: #666;
      }

      .preview-btn.active {
        background: #4CAF50;
      }
    `;
    document.head.appendChild(style);
  }

  bindPreviewEvents() {
    document.getElementById('toggle-preview').addEventListener('click', () => {
      this.togglePreview();
    });

    document.getElementById('preview-wireframe').addEventListener('click', () => {
      this.toggleWireframe();
    });

    document.getElementById('preview-smooth').addEventListener('click', () => {
      this.toggleSmooth();
    });

    document.getElementById('preview-reset-camera').addEventListener('click', () => {
      this.resetCamera();
    });
  }

  togglePreview() {
    if (this.isPreviewActive) {
      this.hidePreview();
    } else {
      this.showPreview();
    }
  }

  showPreview() {
    this.isPreviewActive = true;
    document.getElementById('preview-canvas').style.display = 'block';
    document.getElementById('toggle-preview').textContent = 'Hide Preview';
    
    this.initPreviewRenderer();
    this.updatePreview();
  }

  hidePreview() {
    this.isPreviewActive = false;
    document.getElementById('preview-canvas').style.display = 'none';
    document.getElementById('toggle-preview').textContent = 'Show Preview';
  }

  initPreviewRenderer() {
    const canvas = document.getElementById('preview-canvas');
    
    this.previewScene = new THREE.Scene();
    this.previewScene.background = new THREE.Color(0x1a1a1a);
    
    this.previewCamera = new THREE.PerspectiveCamera(
      75, 
      canvas.clientWidth / canvas.clientHeight, 
      0.1, 
      1000
    );
    this.previewCamera.position.set(20, 20, 20);
    this.previewCamera.lookAt(0, 10, 0);
    
    this.previewRenderer = new THREE.WebGLRenderer({ 
      canvas: canvas,
      antialias: true 
    });
    this.previewRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.previewScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    this.previewScene.add(directionalLight);
  }

  updatePreview() {
    if (!this.isPreviewActive) return;
    
    // Clear existing tree
    this.previewScene.children = this.previewScene.children.filter(child => 
      child.type === 'AmbientLight' || child.type === 'DirectionalLight'
    );
    
    // Generate new tree
    const treeMesh = this.treeGenerator.generateTreeMesh();
    if (treeMesh) {
      this.previewScene.add(treeMesh);
    }
    
    // Render
    this.previewRenderer.render(this.previewScene, this.previewCamera);
  }

  toggleWireframe() {
    const btn = document.getElementById('preview-wireframe');
    const isWireframe = btn.classList.contains('active');
    
    if (isWireframe) {
      btn.classList.remove('active');
      this.setWireframeMode(false);
    } else {
      btn.classList.add('active');
      this.setWireframeMode(true);
    }
  }

  setWireframeMode(enabled) {
    this.previewScene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.wireframe = enabled;
      }
    });
    
    this.previewRenderer.render(this.previewScene, this.previewCamera);
  }

  toggleSmooth() {
    const btn = document.getElementById('preview-smooth');
    const isSmooth = btn.classList.contains('active');
    
    if (isSmooth) {
      btn.classList.remove('active');
      this.setSmoothMode(false);
    } else {
      btn.classList.add('active');
      this.setSmoothMode(true);
    }
  }

  setSmoothMode(enabled) {
    this.previewScene.traverse((child) => {
      if (child.isMesh && child.geometry) {
        if (enabled) {
          child.geometry.computeVertexNormals();
        }
      }
    });
    
    this.previewRenderer.render(this.previewScene, this.previewCamera);
  }

  resetCamera() {
    if (this.previewCamera) {
      this.previewCamera.position.set(20, 20, 20);
      this.previewCamera.lookAt(0, 10, 0);
      this.previewRenderer.render(this.previewScene, this.previewCamera);
    }
  }
}

// Export main classes
export {
  ArtistControlPanel,
  TreePresetManager,
  EditHistory,
  CollaborationManager,
  RealTimePreview
}; 