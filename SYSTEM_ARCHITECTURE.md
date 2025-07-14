# System Architecture: GPU-Based Procedural Generation & Mesh Node Graphs

## Overview
This document describes the system architecture for advanced procedural tree generation using GPU acceleration and node-based mesh authoring. The system enables real-time generation of complex tree geometries with artist-driven control and seamless integration with modern rendering pipelines.

## 1. GPU-Based Procedural Generation

### 1.1 Parameter Definition and Schema
**Step 1.1.1: Define Tree Parameter Schema**
```javascript
// Tree parameter schema with validation
const TreeParameterSchema = {
  levels: { type: 'integer', min: 1, max: 20, default: 8 },
  angle: { type: 'float', min: 0, max: 180, default: 45 },
  length: { type: 'float', min: 0.1, max: 100, default: 12 },
  children: { type: 'integer', min: 1, max: 16, default: 4 },
  radius: { type: 'float', min: 0.01, max: 10, default: 1 },
  randomness: { type: 'float', min: 0, max: 2, default: 0.7 },
  variation: { type: 'float', min: 0, max: 1, default: 0.3 },
  goldenMode: { type: 'boolean', default: true }
};
```

**Step 1.1.2: Parameter Validation System**
```javascript
function validateTreeParameters(params, schema) {
  const errors = [];
  for (const [key, config] of Object.entries(schema)) {
    const value = params[key];
    if (value === undefined) {
      params[key] = config.default;
    } else if (value < config.min || value > config.max) {
      errors.push(`${key}: value ${value} outside range [${config.min}, ${config.max}]`);
    }
  }
  return { valid: errors.length === 0, errors, params };
}
```

**Step 1.1.3: UI Parameter Exposure**
```javascript
function createParameterUI(schema, onChange) {
  const container = document.createElement('div');
  for (const [key, config] of Object.entries(schema)) {
    const label = document.createElement('label');
    label.textContent = key;
    
    let input;
    if (config.type === 'boolean') {
      input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = config.default;
    } else if (config.type === 'integer') {
      input = document.createElement('input');
      input.type = 'number';
      input.min = config.min;
      input.max = config.max;
      input.value = config.default;
      input.step = 1;
    } else {
      input = document.createElement('input');
      input.type = 'range';
      input.min = config.min;
      input.max = config.max;
      input.value = config.default;
      input.step = (config.max - config.min) / 100;
    }
    
    input.addEventListener('change', () => onChange(key, input.value));
    container.appendChild(label);
    container.appendChild(input);
  }
  return container;
}
```

### 1.2 Node Graph Construction
**Step 1.2.1: Define Node Types**
```javascript
const NodeTypes = {
  TRUNK: 'trunk',
  BRANCH: 'branch',
  LEAF: 'leaf',
  ROOT: 'root',
  MERGE: 'merge',
  TRANSFORM: 'transform',
  MATERIAL: 'material'
};

class MeshNode {
  constructor(type, id, parameters = {}) {
    this.type = type;
    this.id = id;
    this.parameters = parameters;
    this.children = [];
    this.parent = null;
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = { x: 1, y: 1, z: 1 };
  }
  
  addChild(child) {
    if (this.validateConnection(child)) {
      this.children.push(child);
      child.parent = this;
      return true;
    }
    return false;
  }
  
  validateConnection(child) {
    // Enforce acyclic structure and valid connections
    const visited = new Set();
    return !this.hasCycle(child, visited);
  }
  
  hasCycle(node, visited) {
    if (visited.has(node.id)) return true;
    visited.add(node.id);
    
    for (const child of node.children) {
      if (this.hasCycle(child, visited)) return true;
    }
    return false;
  }
}
```

**Step 1.2.2: Node Graph Builder**
```javascript
class NodeGraphBuilder {
  constructor() {
    this.nodes = new Map();
    this.rootNodes = [];
  }
  
  createNode(type, parameters = {}) {
    const id = this.generateId();
    const node = new MeshNode(type, id, parameters);
    this.nodes.set(id, node);
    return node;
  }
  
  connectNodes(parentId, childId) {
    const parent = this.nodes.get(parentId);
    const child = this.nodes.get(childId);
    
    if (!parent || !child) {
      throw new Error('Invalid node IDs');
    }
    
    if (parent.addChild(child)) {
      if (!this.rootNodes.includes(parent) && !parent.parent) {
        this.rootNodes.push(parent);
      }
      return true;
    }
    return false;
  }
  
  validateGraph() {
    const errors = [];
    
    // Check for cycles
    for (const root of this.rootNodes) {
      const visited = new Set();
      if (this.detectCycles(root, visited)) {
        errors.push('Cycle detected in node graph');
      }
    }
    
    // Check for disconnected nodes
    const connected = new Set();
    for (const root of this.rootNodes) {
      this.collectConnected(root, connected);
    }
    
    for (const [id, node] of this.nodes) {
      if (!connected.has(id)) {
        errors.push(`Node ${id} is disconnected`);
      }
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  detectCycles(node, visited) {
    if (visited.has(node.id)) return true;
    visited.add(node.id);
    
    for (const child of node.children) {
      if (this.detectCycles(child, visited)) return true;
    }
    return false;
  }
  
  collectConnected(node, connected) {
    connected.add(node.id);
    for (const child of node.children) {
      this.collectConnected(child, connected);
    }
  }
  
  generateId() {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### 1.3 GPU Work Graph Compilation
**Step 1.3.1: Compile Node Graph to GPU Work Graph**
```javascript
class GPUWorkGraphCompiler {
  constructor() {
    this.workGraph = null;
    this.resourceMap = new Map();
  }
  
  compile(nodeGraph) {
    // Validate input graph
    const validation = nodeGraph.validateGraph();
    if (!validation.valid) {
      throw new Error(`Invalid node graph: ${validation.errors.join(', ')}`);
    }
    
    // Create GPU work graph
    this.workGraph = new GPUWorkGraph();
    
    // Map nodes to GPU operations
    for (const [id, node] of nodeGraph.nodes) {
      const gpuOp = this.createGPUOperation(node);
      this.workGraph.addOperation(gpuOp);
      this.resourceMap.set(id, gpuOp);
    }
    
    // Establish dependencies
    for (const [id, node] of nodeGraph.nodes) {
      const gpuOp = this.resourceMap.get(id);
      for (const child of node.children) {
        const childOp = this.resourceMap.get(child.id);
        gpuOp.addDependency(childOp);
      }
    }
    
    // Optimize execution order
    this.workGraph.optimize();
    
    return this.workGraph;
  }
  
  createGPUOperation(node) {
    switch (node.type) {
      case NodeTypes.TRUNK:
        return new GPUTrunkOperation(node.parameters);
      case NodeTypes.BRANCH:
        return new GPUBranchOperation(node.parameters);
      case NodeTypes.LEAF:
        return new GPULeafOperation(node.parameters);
      case NodeTypes.ROOT:
        return new GPURootOperation(node.parameters);
      case NodeTypes.MERGE:
        return new GPUMergeOperation(node.parameters);
      case NodeTypes.TRANSFORM:
        return new GPUTransformOperation(node.parameters);
      case NodeTypes.MATERIAL:
        return new GPUMaterialOperation(node.parameters);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }
}

class GPUWorkGraph {
  constructor() {
    this.operations = [];
    this.executionOrder = [];
  }
  
  addOperation(operation) {
    this.operations.push(operation);
  }
  
  optimize() {
    // Topological sort for optimal execution order
    this.executionOrder = this.topologicalSort();
    
    // Batch compatible operations
    this.batchOperations();
    
    // Optimize memory usage
    this.optimizeMemory();
  }
  
  topologicalSort() {
    const inDegree = new Map();
    const adjacency = new Map();
    
    // Initialize
    for (const op of this.operations) {
      inDegree.set(op, 0);
      adjacency.set(op, []);
    }
    
    // Build adjacency list and count in-degrees
    for (const op of this.operations) {
      for (const dep of op.dependencies) {
        adjacency.get(dep).push(op);
        inDegree.set(op, inDegree.get(op) + 1);
      }
    }
    
    // Kahn's algorithm
    const queue = [];
    const result = [];
    
    for (const op of this.operations) {
      if (inDegree.get(op) === 0) {
        queue.push(op);
      }
    }
    
    while (queue.length > 0) {
      const op = queue.shift();
      result.push(op);
      
      for (const neighbor of adjacency.get(op)) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }
    
    return result;
  }
  
  batchOperations() {
    // Group operations by type for batch processing
    const batches = new Map();
    
    for (const op of this.executionOrder) {
      const type = op.constructor.name;
      if (!batches.has(type)) {
        batches.set(type, []);
      }
      batches.get(type).push(op);
    }
    
    // Create batch operations
    this.batchedOperations = [];
    for (const [type, ops] of batches) {
      if (ops.length > 1) {
        this.batchedOperations.push(new GPUBatchOperation(type, ops));
      } else {
        this.batchedOperations.push(ops[0]);
      }
    }
  }
  
  optimizeMemory() {
    // Analyze memory usage and optimize buffer allocation
    const memoryUsage = new Map();
    
    for (const op of this.batchedOperations) {
      const inputSize = op.getInputMemorySize();
      const outputSize = op.getOutputMemorySize();
      
      memoryUsage.set(op, {
        input: inputSize,
        output: outputSize,
        total: inputSize + outputSize
      });
    }
    
    // Implement memory pooling and reuse
    this.memoryPool = new GPUMemoryPool();
    for (const [op, usage] of memoryUsage) {
      op.setMemoryPool(this.memoryPool);
    }
  }
}
```

### 1.4 Mesh Data Streaming
**Step 1.4.1: GPU to Renderer Data Streaming**
```javascript
class MeshDataStreamer {
  constructor(renderer) {
    this.renderer = renderer;
    this.buffers = new Map();
    this.doubleBuffering = true;
    this.currentBuffer = 0;
  }
  
  setupBuffers(workGraph) {
    // Calculate required buffer sizes
    const bufferSizes = this.calculateBufferSizes(workGraph);
    
    // Create double-buffered GPU buffers
    for (const [name, size] of Object.entries(bufferSizes)) {
      const buffer0 = this.createGPUBuffer(size);
      const buffer1 = this.createGPUBuffer(size);
      this.buffers.set(name, [buffer0, buffer1]);
    }
  }
  
  createGPUBuffer(size) {
    return this.renderer.createBuffer({
      size: size,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    });
  }
  
  calculateBufferSizes(workGraph) {
    const sizes = {
      vertices: 0,
      indices: 0,
      normals: 0,
      uvs: 0
    };
    
    for (const op of workGraph.batchedOperations) {
      const opSizes = op.getOutputBufferSizes();
      for (const [key, size] of Object.entries(opSizes)) {
        sizes[key] = Math.max(sizes[key], size);
      }
    }
    
    return sizes;
  }
  
  streamMeshData(workGraph) {
    // Execute GPU work graph
    const commandEncoder = this.renderer.createCommandEncoder();
    
    for (const op of workGraph.batchedOperations) {
      op.execute(commandEncoder, this.getCurrentBuffers());
    }
    
    // Submit commands
    this.renderer.queue.submit([commandEncoder.finish()]);
    
    // Map buffers for CPU access
    const meshData = this.mapBuffersForCPU();
    
    // Update renderer with new mesh data
    this.updateRenderer(meshData);
    
    // Swap buffers for next frame
    if (this.doubleBuffering) {
      this.currentBuffer = 1 - this.currentBuffer;
    }
  }
  
  getCurrentBuffers() {
    const current = {};
    for (const [name, buffers] of this.buffers) {
      current[name] = buffers[this.currentBuffer];
    }
    return current;
  }
  
  mapBuffersForCPU() {
    const meshData = {};
    
    for (const [name, buffers] of this.buffers) {
      const buffer = buffers[this.currentBuffer];
      meshData[name] = this.mapBufferForCPU(buffer);
    }
    
    return meshData;
  }
  
  mapBufferForCPU(buffer) {
    // Map GPU buffer to CPU-accessible memory
    return buffer.mapReadAsync();
  }
  
  updateRenderer(meshData) {
    // Update Three.js geometries with new mesh data
    for (const [name, data] of Object.entries(meshData)) {
      this.updateGeometry(name, data);
    }
  }
  
  updateGeometry(name, data) {
    const geometry = this.renderer.getGeometry(name);
    if (geometry) {
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(data.vertices, 3));
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(data.normals, 3));
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(data.uvs, 2));
      geometry.setIndex(new THREE.Uint32BufferAttribute(data.indices, 1));
      geometry.computeBoundingSphere();
      geometry.computeBoundingBox();
    }
  }
}
```

### 1.5 Artist Edit Handling
**Step 1.5.1: Change Log and Incremental Updates**
```javascript
class ArtistEditHandler {
  constructor(nodeGraph, workGraph) {
    this.nodeGraph = nodeGraph;
    this.workGraph = workGraph;
    this.changeLog = [];
    this.undoStack = [];
    this.redoStack = [];
    this.lastEditTime = 0;
    this.debounceTime = 100; // ms
  }
  
  handleEdit(edit) {
    // Add timestamp to edit
    edit.timestamp = Date.now();
    
    // Add to change log
    this.changeLog.push(edit);
    
    // Add to undo stack
    this.undoStack.push(edit);
    
    // Clear redo stack
    this.redoStack = [];
    
    // Debounce updates
    this.debounceUpdate();
  }
  
  debounceUpdate() {
    const now = Date.now();
    if (now - this.lastEditTime > this.debounceTime) {
      this.applyChanges();
      this.lastEditTime = now;
    } else {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = setTimeout(() => {
        this.applyChanges();
        this.lastEditTime = Date.now();
      }, this.debounceTime);
    }
  }
  
  applyChanges() {
    // Apply all pending changes
    const pendingChanges = this.changeLog.filter(change => !change.applied);
    
    for (const change of pendingChanges) {
      this.applyChange(change);
      change.applied = true;
    }
    
    // Recompile work graph if needed
    if (pendingChanges.some(change => change.requiresRecompile)) {
      this.recompileWorkGraph();
    }
    
    // Trigger instant feedback
    this.triggerInstantFeedback();
  }
  
  applyChange(change) {
    switch (change.type) {
      case 'parameter':
        this.applyParameterChange(change);
        break;
      case 'connection':
        this.applyConnectionChange(change);
        break;
      case 'node':
        this.applyNodeChange(change);
        break;
      default:
        console.warn(`Unknown edit type: ${change.type}`);
    }
  }
  
  applyParameterChange(change) {
    const node = this.nodeGraph.nodes.get(change.nodeId);
    if (node) {
      node.parameters[change.parameter] = change.value;
      change.requiresRecompile = true;
    }
  }
  
  applyConnectionChange(change) {
    if (change.action === 'add') {
      this.nodeGraph.connectNodes(change.parentId, change.childId);
    } else if (change.action === 'remove') {
      this.nodeGraph.disconnectNodes(change.parentId, change.childId);
    }
    change.requiresRecompile = true;
  }
  
  applyNodeChange(change) {
    if (change.action === 'add') {
      const node = this.nodeGraph.createNode(change.nodeType, change.parameters);
      change.nodeId = node.id;
    } else if (change.action === 'remove') {
      this.nodeGraph.removeNode(change.nodeId);
    }
    change.requiresRecompile = true;
  }
  
  recompileWorkGraph() {
    try {
      const compiler = new GPUWorkGraphCompiler();
      this.workGraph = compiler.compile(this.nodeGraph);
    } catch (error) {
      console.error('Failed to recompile work graph:', error);
      // Revert changes or show error to user
    }
  }
  
  triggerInstantFeedback() {
    // Update UI immediately
    this.updateUI();
    
    // Trigger preview update
    this.updatePreview();
  }
  
  updateUI() {
    // Update parameter sliders, node positions, etc.
    const event = new CustomEvent('nodeGraphUpdated', {
      detail: { nodeGraph: this.nodeGraph }
    });
    document.dispatchEvent(event);
  }
  
  updatePreview() {
    // Update real-time preview
    const event = new CustomEvent('previewUpdate', {
      detail: { workGraph: this.workGraph }
    });
    document.dispatchEvent(event);
  }
  
  undo() {
    if (this.undoStack.length > 0) {
      const edit = this.undoStack.pop();
      this.revertEdit(edit);
      this.redoStack.push(edit);
    }
  }
  
  redo() {
    if (this.redoStack.length > 0) {
      const edit = this.redoStack.pop();
      this.applyEdit(edit);
      this.undoStack.push(edit);
    }
  }
  
  revertEdit(edit) {
    // Revert the specific edit
    switch (edit.type) {
      case 'parameter':
        this.revertParameterChange(edit);
        break;
      case 'connection':
        this.revertConnectionChange(edit);
        break;
      case 'node':
        this.revertNodeChange(edit);
        break;
    }
    
    this.recompileWorkGraph();
    this.triggerInstantFeedback();
  }
}
```

## 2. Mesh Node Graphs

### 2.1 Node Graph UI Design
**Step 2.1.1: Node Graph Interface**
```javascript
class NodeGraphUI {
  constructor(container, nodeGraph) {
    this.container = container;
    this.nodeGraph = nodeGraph;
    this.nodes = new Map();
    this.connections = new Map();
    this.selectedNodes = new Set();
    this.draggedNode = null;
    this.connectionStart = null;
    
    this.setupCanvas();
    this.setupEventListeners();
    this.render();
  }
  
  setupCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
    this.ctx = this.canvas.getContext('2d');
    
    this.container.appendChild(this.canvas);
  }
  
  setupEventListeners() {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('dblclick', this.onDoubleClick.bind(this));
    
    // Keyboard shortcuts
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }
  
  onMouseDown(event) {
    const pos = this.getMousePos(event);
    const node = this.getNodeAtPosition(pos);
    
    if (node) {
      if (event.ctrlKey) {
        // Multi-select
        this.toggleNodeSelection(node);
      } else {
        // Single select and drag
        this.selectNode(node);
        this.startDrag(node, pos);
      }
    } else {
      // Start connection or clear selection
      if (this.connectionStart) {
        this.startConnection(pos);
      } else {
        this.clearSelection();
      }
    }
  }
  
  onMouseMove(event) {
    const pos = this.getMousePos(event);
    
    if (this.draggedNode) {
      this.dragNode(this.draggedNode, pos);
    }
    
    if (this.connectionStart) {
      this.updateConnectionPreview(pos);
    }
    
    this.render();
  }
  
  onMouseUp(event) {
    const pos = this.getMousePos(event);
    
    if (this.draggedNode) {
      this.endDrag();
    }
    
    if (this.connectionStart) {
      const targetNode = this.getNodeAtPosition(pos);
      if (targetNode && targetNode !== this.connectionStart) {
        this.createConnection(this.connectionStart, targetNode);
      }
      this.connectionStart = null;
    }
    
    this.render();
  }
  
  onDoubleClick(event) {
    const pos = this.getMousePos(event);
    this.showNodeCreationMenu(pos);
  }
  
  onKeyDown(event) {
    switch (event.key) {
      case 'Delete':
        this.deleteSelectedNodes();
        break;
      case 'c':
        if (event.ctrlKey) {
          this.copySelectedNodes();
        }
        break;
      case 'v':
        if (event.ctrlKey) {
          this.pasteNodes();
        }
        break;
      case 'a':
        if (event.ctrlKey) {
          this.selectAllNodes();
        }
        break;
    }
  }
  
  getMousePos(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
  
  getNodeAtPosition(pos) {
    for (const [id, nodeUI] of this.nodes) {
      if (this.isPointInNode(pos, nodeUI)) {
        return nodeUI;
      }
    }
    return null;
  }
  
  isPointInNode(pos, nodeUI) {
    return pos.x >= nodeUI.x && pos.x <= nodeUI.x + nodeUI.width &&
           pos.y >= nodeUI.y && pos.y <= nodeUI.y + nodeUI.height;
  }
  
  selectNode(node) {
    this.clearSelection();
    this.selectedNodes.add(node);
    node.selected = true;
  }
  
  toggleNodeSelection(node) {
    if (this.selectedNodes.has(node)) {
      this.selectedNodes.delete(node);
      node.selected = false;
    } else {
      this.selectedNodes.add(node);
      node.selected = true;
    }
  }
  
  clearSelection() {
    for (const node of this.selectedNodes) {
      node.selected = false;
    }
    this.selectedNodes.clear();
  }
  
  startDrag(node, pos) {
    this.draggedNode = {
      node: node,
      offsetX: pos.x - node.x,
      offsetY: pos.y - node.y
    };
  }
  
  dragNode(dragInfo, pos) {
    dragInfo.node.x = pos.x - dragInfo.offsetX;
    dragInfo.node.y = pos.y - dragInfo.offsetY;
  }
  
  endDrag() {
    this.draggedNode = null;
  }
  
  showNodeCreationMenu(pos) {
    const menu = document.createElement('div');
    menu.className = 'node-creation-menu';
    menu.style.position = 'absolute';
    menu.style.left = pos.x + 'px';
    menu.style.top = pos.y + 'px';
    
    const nodeTypes = Object.values(NodeTypes);
    for (const type of nodeTypes) {
      const item = document.createElement('div');
      item.textContent = type;
      item.addEventListener('click', () => {
        this.createNode(type, pos);
        menu.remove();
      });
      menu.appendChild(item);
    }
    
    this.container.appendChild(menu);
  }
  
  createNode(type, pos) {
    const node = this.nodeGraph.createNode(type);
    const nodeUI = this.createNodeUI(node, pos);
    this.nodes.set(node.id, nodeUI);
    this.render();
  }
  
  createNodeUI(node, pos) {
    return {
      node: node,
      x: pos.x,
      y: pos.y,
      width: 120,
      height: 80,
      selected: false
    };
  }
  
  createConnection(fromNode, toNode) {
    try {
      if (this.nodeGraph.connectNodes(fromNode.node.id, toNode.node.id)) {
        const connection = {
          from: fromNode,
          to: toNode
        };
        this.connections.set(`${fromNode.node.id}-${toNode.node.id}`, connection);
      }
    } catch (error) {
      console.error('Failed to create connection:', error);
    }
  }
  
  deleteSelectedNodes() {
    for (const nodeUI of this.selectedNodes) {
      this.nodeGraph.removeNode(nodeUI.node.id);
      this.nodes.delete(nodeUI.node.id);
    }
    this.selectedNodes.clear();
    this.render();
  }
  
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw connections
    this.drawConnections();
    
    // Draw nodes
    this.drawNodes();
    
    // Draw connection preview
    if (this.connectionStart) {
      this.drawConnectionPreview();
    }
  }
  
  drawNodes() {
    for (const [id, nodeUI] of this.nodes) {
      this.drawNode(nodeUI);
    }
  }
  
  drawNode(nodeUI) {
    const ctx = this.ctx;
    
    // Node background
    ctx.fillStyle = nodeUI.selected ? '#4CAF50' : '#2196F3';
    ctx.fillRect(nodeUI.x, nodeUI.y, nodeUI.width, nodeUI.height);
    
    // Node border
    ctx.strokeStyle = nodeUI.selected ? '#2E7D32' : '#1976D2';
    ctx.lineWidth = 2;
    ctx.strokeRect(nodeUI.x, nodeUI.y, nodeUI.width, nodeUI.height);
    
    // Node title
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(nodeUI.node.type, nodeUI.x + nodeUI.width/2, nodeUI.y + 20);
    
    // Node ID
    ctx.font = '10px Arial';
    ctx.fillText(nodeUI.node.id.substring(0, 8), nodeUI.x + nodeUI.width/2, nodeUI.y + 35);
  }
  
  drawConnections() {
    const ctx = this.ctx;
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    
    for (const [id, connection] of this.connections) {
      const from = connection.from;
      const to = connection.to;
      
      const fromX = from.x + from.width;
      const fromY = from.y + from.height/2;
      const toX = to.x;
      const toY = to.y + to.height/2;
      
      // Draw bezier curve
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      const cp1x = fromX + (toX - fromX) * 0.5;
      const cp1y = fromY;
      const cp2x = fromX + (toX - fromX) * 0.5;
      const cp2y = toY;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, toX, toY);
      ctx.stroke();
    }
  }
  
  drawConnectionPreview() {
    if (!this.connectionStart) return;
    
    const ctx = this.ctx;
    ctx.strokeStyle = '#FF5722';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    const fromX = this.connectionStart.x + this.connectionStart.width;
    const fromY = this.connectionStart.y + this.connectionStart.height/2;
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(this.mousePos.x, this.mousePos.y);
    ctx.stroke();
    
    ctx.setLineDash([]);
  }
}
```

### 2.2 Template System
**Step 2.2.1: Template Management**
```javascript
class TemplateManager {
  constructor() {
    this.templates = new Map();
    this.userTemplates = new Map();
    this.loadBuiltinTemplates();
  }
  
  loadBuiltinTemplates() {
    // Oak tree template
    this.templates.set('oak', {
      name: 'Oak Tree',
      description: 'Classic oak tree with spreading branches',
      parameters: {
        levels: 6,
        angle: 45,
        length: 15,
        children: 4,
        radius: 1.2,
        randomness: 0.6,
        variation: 0.3,
        goldenMode: true
      },
      nodeGraph: this.createOakNodeGraph()
    });
    
    // Pine tree template
    this.templates.set('pine', {
      name: 'Pine Tree',
      description: 'Conical pine tree with upward branches',
      parameters: {
        levels: 8,
        angle: 30,
        length: 12,
        children: 3,
        radius: 0.8,
        randomness: 0.4,
        variation: 0.2,
        goldenMode: true
      },
      nodeGraph: this.createPineNodeGraph()
    });
    
    // Willow tree template
    this.templates.set('willow', {
      name: 'Willow Tree',
      description: 'Weeping willow with drooping branches',
      parameters: {
        levels: 7,
        angle: 60,
        length: 18,
        children: 6,
        radius: 1.0,
        randomness: 0.8,
        variation: 0.5,
        goldenMode: true
      },
      nodeGraph: this.createWillowNodeGraph()
    });
  }
  
  createOakNodeGraph() {
    const builder = new NodeGraphBuilder();
    
    // Create trunk
    const trunk = builder.createNode(NodeTypes.TRUNK, {
      levels: 6,
      angle: 45,
      length: 15,
      children: 4,
      radius: 1.2
    });
    
    // Create main branches
    for (let i = 0; i < 4; i++) {
      const branch = builder.createNode(NodeTypes.BRANCH, {
        levels: 4,
        angle: 35 + i * 5,
        length: 12,
        children: 3,
        radius: 0.8
      });
      builder.connectNodes(trunk.id, branch.id);
    }
    
    return builder;
  }
  
  createPineNodeGraph() {
    const builder = new NodeGraphBuilder();
    
    // Create trunk
    const trunk = builder.createNode(NodeTypes.TRUNK, {
      levels: 8,
      angle: 30,
      length: 12,
      children: 3,
      radius: 0.8
    });
    
    // Create upward branches
    for (let i = 0; i < 3; i++) {
      const branch = builder.createNode(NodeTypes.BRANCH, {
        levels: 5,
        angle: 25 + i * 3,
        length: 10,
        children: 2,
        radius: 0.6
      });
      builder.connectNodes(trunk.id, branch.id);
    }
    
    return builder;
  }
  
  createWillowNodeGraph() {
    const builder = new NodeGraphBuilder();
    
    // Create trunk
    const trunk = builder.createNode(NodeTypes.TRUNK, {
      levels: 7,
      angle: 60,
      length: 18,
      children: 6,
      radius: 1.0
    });
    
    // Create drooping branches
    for (let i = 0; i < 6; i++) {
      const branch = builder.createNode(NodeTypes.BRANCH, {
        levels: 6,
        angle: 70 + i * 5,
        length: 15,
        children: 4,
        radius: 0.7
      });
      builder.connectNodes(trunk.id, branch.id);
    }
    
    return builder;
  }
  
  saveTemplate(name, description, nodeGraph, parameters) {
    const template = {
      name,
      description,
      parameters,
      nodeGraph: this.serializeNodeGraph(nodeGraph),
      timestamp: Date.now(),
      version: '1.0'
    };
    
    this.userTemplates.set(name, template);
    this.saveToLocalStorage();
    
    return template;
  }
  
  loadTemplate(name) {
    const template = this.templates.get(name) || this.userTemplates.get(name);
    if (template) {
      const nodeGraph = this.deserializeNodeGraph(template.nodeGraph);
      return {
        parameters: template.parameters,
        nodeGraph: nodeGraph
      };
    }
    return null;
  }
  
  serializeNodeGraph(nodeGraph) {
    const serialized = {
      nodes: [],
      connections: []
    };
    
    for (const [id, node] of nodeGraph.nodes) {
      serialized.nodes.push({
        id: node.id,
        type: node.type,
        parameters: node.parameters,
        position: node.position,
        rotation: node.rotation,
        scale: node.scale
      });
    }
    
    for (const [id, node] of nodeGraph.nodes) {
      for (const child of node.children) {
        serialized.connections.push({
          parentId: id,
          childId: child.id
        });
      }
    }
    
    return serialized;
  }
  
  deserializeNodeGraph(serialized) {
    const builder = new NodeGraphBuilder();
    
    // Create nodes
    for (const nodeData of serialized.nodes) {
      const node = builder.createNode(nodeData.type, nodeData.parameters);
      node.id = nodeData.id;
      node.position = nodeData.position;
      node.rotation = nodeData.rotation;
      node.scale = nodeData.scale;
    }
    
    // Create connections
    for (const connection of serialized.connections) {
      builder.connectNodes(connection.parentId, connection.childId);
    }
    
    return builder;
  }
  
  saveToLocalStorage() {
    const data = JSON.stringify(Array.from(this.userTemplates.entries()));
    localStorage.setItem('treeTemplates', data);
  }
  
  loadFromLocalStorage() {
    const data = localStorage.getItem('treeTemplates');
    if (data) {
      const templates = JSON.parse(data);
      this.userTemplates = new Map(templates);
    }
  }
  
  exportTemplate(name) {
    const template = this.userTemplates.get(name);
    if (template) {
      const data = JSON.stringify(template, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    }
  }
  
  importTemplate(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const template = JSON.parse(event.target.result);
          this.userTemplates.set(template.name, template);
          this.saveToLocalStorage();
          resolve(template);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }
}
```

## Implementation Notes

### Performance Considerations
- Use WebGPU for modern browsers, fallback to WebGL for compatibility
- Implement frustum culling for large forests
- Use instancing for repeated tree types
- Batch similar operations for GPU efficiency

### Memory Management
- Implement buffer pooling to reduce allocation overhead
- Use typed arrays for efficient data transfer
- Implement garbage collection for unused meshes
- Monitor memory usage and warn users of high consumption

### Error Handling
- Validate all user inputs and parameters
- Provide meaningful error messages
- Implement graceful degradation for unsupported features
- Log errors for debugging and improvement

### Testing Strategy
- Unit tests for each component
- Integration tests for node graph compilation
- Performance benchmarks for GPU operations
- Visual regression tests for mesh generation

This architecture provides a robust foundation for advanced procedural tree generation with artist-friendly controls and high-performance GPU acceleration. 