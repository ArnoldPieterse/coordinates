// GPU Procedural Generator - Implementation based on detailed specifications
// Implements GPU-based real-time tree generation with mesh nodes and continuous LOD

import * as THREE from './three.module.js';

// ============================================================================
// 1. GPU MESH NODE GRAPH SYSTEM
// ============================================================================

class GPUMeshNodeGraph {
  constructor() {
    this.nodes = new Map();
    this.connections = new Map();
    this.gpuContext = null;
    this.shaderPrograms = new Map();
    this.nodeTypes = {
      BRANCH_GENERATOR: 'branch_generator',
      JUNCTION_BLENDER: 'junction_blender',
      MATERIAL_APPLIER: 'material_applier',
      LOD_CONTROLLER: 'lod_controller',
      SEASONAL_MODIFIER: 'seasonal_modifier'
    };
    
    this.initGPUContext();
    this.createShaderPrograms();
  }

  initGPUContext() {
    // Initialize WebGL context for GPU computation
    const canvas = document.createElement('canvas');
    this.gpuContext = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!this.gpuContext) {
      console.warn('WebGL not available, falling back to CPU computation');
      return;
    }
    
    // Enable extensions
    this.gpuContext.getExtension('OES_standard_derivatives');
    this.gpuContext.getExtension('WEBGL_depth_texture');
  }

  createShaderPrograms() {
    // Branch generation shader
    const branchVertexShader = `
      attribute vec3 position;
      attribute vec3 normal;
      attribute vec2 uv;
      
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform mat3 normalMatrix;
      uniform float time;
      uniform vec3 growthDirection;
      uniform float growthProgress;
      
      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vNormal = normalMatrix * normal;
        
        // Apply growth animation
        vec3 animatedPosition = position;
        animatedPosition += growthDirection * growthProgress * length(position);
        
        vPosition = animatedPosition;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(animatedPosition, 1.0);
      }
    `;

    const branchFragmentShader = `
      precision mediump float;
      
      uniform vec3 trunkColor;
      uniform vec3 branchColor;
      uniform float roughness;
      uniform float metallic;
      uniform float time;
      
      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vec3 color = mix(trunkColor, branchColor, vUv.y);
        
        // Add seasonal variation
        float seasonalFactor = sin(time * 0.1) * 0.1 + 0.9;
        color *= seasonalFactor;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    this.shaderPrograms.set('branch', this.createShaderProgram(branchVertexShader, branchFragmentShader));

    // Junction blending shader
    const junctionVertexShader = `
      attribute vec3 position;
      attribute vec3 normal;
      
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform mat3 normalMatrix;
      uniform vec3 junctionCenter;
      uniform float blendRadius;
      
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vBlendFactor;
      
      void main() {
        vNormal = normalMatrix * normal;
        vPosition = position;
        
        // Calculate blend factor based on distance from junction center
        float distance = length(position - junctionCenter);
        vBlendFactor = 1.0 - clamp(distance / blendRadius, 0.0, 1.0);
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const junctionFragmentShader = `
      precision mediump float;
      
      uniform vec3 baseColor;
      uniform vec3 blendColor;
      uniform float blendStrength;
      
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vBlendFactor;
      
      void main() {
        // Smooth blending between base and blend colors
        vec3 finalColor = mix(baseColor, blendColor, vBlendFactor * blendStrength);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    this.shaderPrograms.set('junction', this.createShaderProgram(junctionVertexShader, junctionFragmentShader));
  }

  createShaderProgram(vertexSource, fragmentSource) {
    const gl = this.gpuContext;
    
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('Vertex shader compilation error:', gl.getShaderInfoLog(vertexShader));
      return null;
    }
    
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('Fragment shader compilation error:', gl.getShaderInfoLog(fragmentShader));
      return null;
    }
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      return null;
    }
    
    return program;
  }

  createNode(nodeType, parameters = {}) {
    const nodeId = this.generateNodeId();
    const node = {
      id: nodeId,
      type: nodeType,
      parameters: parameters,
      inputs: new Map(),
      outputs: new Map(),
      gpuBuffers: new Map(),
      uniforms: new Map()
    };
    
    this.nodes.set(nodeId, node);
    this.initializeNode(node);
    
    return nodeId;
  }

  generateNodeId() {
    return 'node_' + Math.random().toString(36).substring(2, 15);
  }

  initializeNode(node) {
    switch (node.type) {
      case this.nodeTypes.BRANCH_GENERATOR:
        this.initializeBranchGenerator(node);
        break;
      case this.nodeTypes.JUNCTION_BLENDER:
        this.initializeJunctionBlender(node);
        break;
      case this.nodeTypes.MATERIAL_APPLIER:
        this.initializeMaterialApplier(node);
        break;
      case this.nodeTypes.LOD_CONTROLLER:
        this.initializeLODController(node);
        break;
      case this.nodeTypes.SEASONAL_MODIFIER:
        this.initializeSeasonalModifier(node);
        break;
    }
  }

  initializeBranchGenerator(node) {
    // Create GPU buffers for branch geometry
    const gl = this.gpuContext;
    
    // Position buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([]), gl.DYNAMIC_DRAW);
    node.gpuBuffers.set('position', positionBuffer);
    
    // Normal buffer
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([]), gl.DYNAMIC_DRAW);
    node.gpuBuffers.set('normal', normalBuffer);
    
    // UV buffer
    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([]), gl.DYNAMIC_DRAW);
    node.gpuBuffers.set('uv', uvBuffer);
    
    // Index buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([]), gl.DYNAMIC_DRAW);
    node.gpuBuffers.set('index', indexBuffer);
    
    // Set up uniforms
    node.uniforms.set('time', { type: 'float', value: 0.0 });
    node.uniforms.set('growthDirection', { type: 'vec3', value: [0, 1, 0] });
    node.uniforms.set('growthProgress', { type: 'float', value: 1.0 });
    node.uniforms.set('trunkColor', { type: 'vec3', value: [0.545, 0.271, 0.075] });
    node.uniforms.set('branchColor', { type: 'vec3', value: [0.627, 0.322, 0.176] });
    node.uniforms.set('roughness', { type: 'float', value: 0.8 });
    node.uniforms.set('metallic', { type: 'float', value: 0.0 });
  }

  initializeJunctionBlender(node) {
    const gl = this.gpuContext;
    
    // Create blending buffers
    const blendBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, blendBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([]), gl.DYNAMIC_DRAW);
    node.gpuBuffers.set('blend', blendBuffer);
    
    // Set up uniforms
    node.uniforms.set('junctionCenter', { type: 'vec3', value: [0, 0, 0] });
    node.uniforms.set('blendRadius', { type: 'float', value: 2.0 });
    node.uniforms.set('baseColor', { type: 'vec3', value: [0.545, 0.271, 0.075] });
    node.uniforms.set('blendColor', { type: 'vec3', value: [0.627, 0.322, 0.176] });
    node.uniforms.set('blendStrength', { type: 'float', value: 0.5 });
  }

  initializeMaterialApplier(node) {
    // Material uniforms
    node.uniforms.set('albedo', { type: 'vec3', value: [0.545, 0.271, 0.075] });
    node.uniforms.set('roughness', { type: 'float', value: 0.8 });
    node.uniforms.set('metallic', { type: 'float', value: 0.0 });
    node.uniforms.set('normalScale', { type: 'vec2', value: [1, 1] });
    node.uniforms.set('emissive', { type: 'vec3', value: [0, 0, 0] });
  }

  initializeLODController(node) {
    node.uniforms.set('lodLevel', { type: 'int', value: 0 });
    node.uniforms.set('maxLOD', { type: 'int', value: 4 });
    node.uniforms.set('distance', { type: 'float', value: 0.0 });
    node.uniforms.set('screenSize', { type: 'vec2', value: [1920, 1080] });
  }

  initializeSeasonalModifier(node) {
    node.uniforms.set('season', { type: 'int', value: 1 }); // 0=winter, 1=spring, 2=summer, 3=autumn
    node.uniforms.set('seasonProgress', { type: 'float', value: 0.0 });
    node.uniforms.set('temperature', { type: 'float', value: 20.0 });
    node.uniforms.set('humidity', { type: 'float', value: 0.5 });
  }

  connectNodes(sourceNodeId, outputName, targetNodeId, inputName) {
    const connectionId = `${sourceNodeId}_${outputName}_to_${targetNodeId}_${inputName}`;
    
    this.connections.set(connectionId, {
      source: sourceNodeId,
      sourceOutput: outputName,
      target: targetNodeId,
      targetInput: inputName
    });
    
    const sourceNode = this.nodes.get(sourceNodeId);
    const targetNode = this.nodes.get(targetNodeId);
    
    if (sourceNode && targetNode) {
      sourceNode.outputs.set(outputName, { target: targetNodeId, input: inputName });
      targetNode.inputs.set(inputName, { source: sourceNodeId, output: outputName });
    }
  }

  updateNode(nodeId, parameters) {
    const node = this.nodes.get(nodeId);
    if (!node) return;
    
    // Update parameters
    Object.assign(node.parameters, parameters);
    
    // Update GPU buffers if needed
    this.updateNodeBuffers(node);
  }

  updateNodeBuffers(node) {
    switch (node.type) {
      case this.nodeTypes.BRANCH_GENERATOR:
        this.updateBranchBuffers(node);
        break;
      case this.nodeTypes.JUNCTION_BLENDER:
        this.updateJunctionBuffers(node);
        break;
    }
  }

  updateBranchBuffers(node) {
    const gl = this.gpuContext;
    const { radius, length, segments } = node.parameters;
    
    // Generate branch geometry
    const geometry = this.generateBranchGeometry(radius, length, segments);
    
    // Update position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, node.gpuBuffers.get('position'));
    gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.DYNAMIC_DRAW);
    
    // Update normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, node.gpuBuffers.get('normal'));
    gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.DYNAMIC_DRAW);
    
    // Update UV buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, node.gpuBuffers.get('uv'));
    gl.bufferData(gl.ARRAY_BUFFER, geometry.uvs, gl.DYNAMIC_DRAW);
    
    // Update index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, node.gpuBuffers.get('index'));
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.DYNAMIC_DRAW);
    
    node.outputs.set('geometry', {
      vertexCount: geometry.positions.length / 3,
      indexCount: geometry.indices.length
    });
  }

  updateJunctionBuffers(node) {
    const gl = this.gpuContext;
    const { center, radius, branches } = node.parameters;
    
    // Generate junction geometry
    const geometry = this.generateJunctionGeometry(center, radius, branches);
    
    // Update blend buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, node.gpuBuffers.get('blend'));
    gl.bufferData(gl.ARRAY_BUFFER, geometry.blendFactors, gl.DYNAMIC_DRAW);
    
    node.outputs.set('blendedGeometry', {
      vertexCount: geometry.blendFactors.length / 3,
      blendFactors: geometry.blendFactors
    });
  }

  generateBranchGeometry(radius, length, segments) {
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    
    const radialSegments = segments || 8;
    const heightSegments = Math.ceil(length / 0.5);
    
    // Generate vertices
    for (let h = 0; h <= heightSegments; h++) {
      const height = (h / heightSegments) * length;
      const currentRadius = radius * (1 - h / heightSegments * 0.2); // Taper towards end
      
      for (let r = 0; r <= radialSegments; r++) {
        const angle = (r / radialSegments) * Math.PI * 2;
        const x = Math.cos(angle) * currentRadius;
        const z = Math.sin(angle) * currentRadius;
        
        positions.push(x, height, z);
        
        // Normal
        const normal = new THREE.Vector3(x, 0, z).normalize();
        normals.push(normal.x, normal.y, normal.z);
        
        // UV
        uvs.push(r / radialSegments, h / heightSegments);
      }
    }
    
    // Generate indices
    for (let h = 0; h < heightSegments; h++) {
      for (let r = 0; r < radialSegments; r++) {
        const a = h * (radialSegments + 1) + r;
        const b = a + radialSegments + 1;
        const c = a + 1;
        const d = b + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    
    return {
      positions: new Float32Array(positions),
      normals: new Float32Array(normals),
      uvs: new Float32Array(uvs),
      indices: new Uint16Array(indices)
    };
  }

  generateJunctionGeometry(center, radius, branches) {
    const blendFactors = [];
    
    // Generate metaball-like blending factors
    for (let i = 0; i < branches.length; i++) {
      const branch = branches[i];
      const distance = center.distanceTo(branch.position);
      const blendFactor = Math.max(0, 1 - distance / radius);
      blendFactors.push(blendFactor);
    }
    
    return {
      blendFactors: new Float32Array(blendFactors)
    };
  }

  renderNode(nodeId, camera, renderer) {
    const node = this.nodes.get(nodeId);
    if (!node || !this.gpuContext) return;
    
    const gl = this.gpuContext;
    const program = this.shaderPrograms.get(this.getProgramType(node.type));
    
    if (!program) return;
    
    gl.useProgram(program);
    
    // Set up uniforms
    this.setNodeUniforms(node, program, camera, renderer);
    
    // Set up attributes
    this.setNodeAttributes(node, program);
    
    // Render
    const indexBuffer = node.gpuBuffers.get('index');
    if (indexBuffer) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      const indexCount = node.outputs.get('geometry')?.indexCount || 0;
      gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
    }
  }

  getProgramType(nodeType) {
    switch (nodeType) {
      case this.nodeTypes.BRANCH_GENERATOR:
        return 'branch';
      case this.nodeTypes.JUNCTION_BLENDER:
        return 'junction';
      default:
        return 'branch';
    }
  }

  setNodeUniforms(node, program, camera, renderer) {
    const gl = this.gpuContext;
    
    // Set common uniforms
    const modelViewMatrix = camera.matrixWorldInverse.clone().multiply(node.matrixWorld || new THREE.Matrix4());
    const projectionMatrix = camera.projectionMatrix;
    
    const modelViewLocation = gl.getUniformLocation(program, 'modelViewMatrix');
    const projectionLocation = gl.getUniformLocation(program, 'projectionMatrix');
    
    if (modelViewLocation) gl.uniformMatrix4fv(modelViewLocation, false, modelViewMatrix.elements);
    if (projectionLocation) gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix.elements);
    
    // Set node-specific uniforms
    for (const [name, uniform] of node.uniforms) {
      const location = gl.getUniformLocation(program, name);
      if (!location) continue;
      
      switch (uniform.type) {
        case 'float':
          gl.uniform1f(location, uniform.value);
          break;
        case 'int':
          gl.uniform1i(location, uniform.value);
          break;
        case 'vec2':
          gl.uniform2f(location, uniform.value[0], uniform.value[1]);
          break;
        case 'vec3':
          gl.uniform3f(location, uniform.value[0], uniform.value[1], uniform.value[2]);
          break;
        case 'vec4':
          gl.uniform4f(location, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3]);
          break;
      }
    }
  }

  setNodeAttributes(node, program) {
    const gl = this.gpuContext;
    
    // Position attribute
    const positionBuffer = node.gpuBuffers.get('position');
    if (positionBuffer) {
      const positionLocation = gl.getAttribLocation(program, 'position');
      if (positionLocation >= 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
      }
    }
    
    // Normal attribute
    const normalBuffer = node.gpuBuffers.get('normal');
    if (normalBuffer) {
      const normalLocation = gl.getAttribLocation(program, 'normal');
      if (normalLocation >= 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.enableVertexAttribArray(normalLocation);
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
      }
    }
    
    // UV attribute
    const uvBuffer = node.gpuBuffers.get('uv');
    if (uvBuffer) {
      const uvLocation = gl.getAttribLocation(program, 'uv');
      if (uvLocation >= 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.enableVertexAttribArray(uvLocation);
        gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);
      }
    }
  }
}

// ============================================================================
// 2. CONTINUOUS LOD SYSTEM
// ============================================================================

class ContinuousLODSystem {
  constructor() {
    this.lodLevels = new Map();
    this.currentLOD = new Map();
    this.transitionFactors = new Map();
    this.geometryCache = new Map();
  }

  createLODLevels(branch, levels = ['ultra', 'high', 'medium', 'low']) {
    const lods = [];
    
    for (const level of levels) {
      const geometry = this.generateLODGeometry(branch, level);
      const mesh = new THREE.Mesh(geometry, branch.material);
      lods.push({ level, mesh, geometry });
    }
    
    this.lodLevels.set(branch.id, lods);
    return lods;
  }

  generateLODGeometry(branch, level) {
    const params = this.getLODParams(level);
    
    // Check cache first
    const cacheKey = `${branch.id}_${level}`;
    if (this.geometryCache.has(cacheKey)) {
      return this.geometryCache.get(cacheKey);
    }
    
    let geometry;
    
    switch (branch.type) {
      case 'trunk':
        geometry = this.generateTrunkLOD(branch, params);
        break;
      case 'branch':
        geometry = this.generateBranchLOD(branch, params);
        break;
      case 'leaf':
        geometry = this.generateLeafLOD(branch, params);
        break;
      default:
        geometry = this.generateBranchLOD(branch, params);
    }
    
    // Cache the geometry
    this.geometryCache.set(cacheKey, geometry);
    
    return geometry;
  }

  getLODParams(level) {
    return {
      ultra: { rings: 16, radials: 32, smooth: true, detail: 1.0 },
      high: { rings: 12, radials: 24, smooth: true, detail: 0.8 },
      medium: { rings: 8, radials: 16, smooth: false, detail: 0.6 },
      low: { rings: 4, radials: 8, smooth: false, detail: 0.4 }
    }[level];
  }

  generateTrunkLOD(branch, params) {
    const geometry = new THREE.CylinderGeometry(
      branch.radius,
      branch.radius * 0.8,
      branch.length,
      params.radials,
      params.rings
    );
    
    if (params.smooth) {
      geometry.computeVertexNormals();
    }
    
    return geometry;
  }

  generateBranchLOD(branch, params) {
    const geometry = new THREE.CylinderGeometry(
      branch.radius,
      branch.radius * 0.6,
      branch.length,
      params.radials,
      params.rings
    );
    
    if (params.smooth) {
      geometry.computeVertexNormals();
    }
    
    return geometry;
  }

  generateLeafLOD(branch, params) {
    const geometry = new THREE.SphereGeometry(
      branch.radius,
      params.radials,
      params.rings
    );
    
    if (params.smooth) {
      geometry.computeVertexNormals();
    }
    
    return geometry;
  }

  updateLOD(branch, camera, renderer) {
    const distance = camera.position.distanceTo(branch.position);
    const screenSize = this.calculateScreenSize(branch, camera, renderer);
    
    const targetLOD = this.calculateTargetLOD(distance, screenSize);
    const transitionFactor = this.calculateTransitionFactor(branch, targetLOD);
    
    this.currentLOD.set(branch.id, targetLOD);
    this.transitionFactors.set(branch.id, transitionFactor);
    
    return { targetLOD, transitionFactor };
  }

  calculateScreenSize(branch, camera, renderer) {
    const box = new THREE.Box3().setFromObject(branch);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    // Transform to camera space
    const cameraSpace = center.clone().applyMatrix4(camera.matrixWorldInverse);
    
    // Project to screen space
    const screenSpace = cameraSpace.clone().project(camera);
    
    // Convert to pixel coordinates
    const pixelX = (screenSpace.x + 1) * renderer.domElement.width / 2;
    const pixelY = (-screenSpace.y + 1) * renderer.domElement.height / 2;
    
    // Calculate screen-space size
    const distance = cameraSpace.length();
    const fov = camera.fov * Math.PI / 180;
    const screenHeight = 2 * Math.tan(fov / 2) * distance;
    const pixelSize = Math.max(size.x, size.y, size.z) * renderer.domElement.height / screenHeight;
    
    return pixelSize;
  }

  calculateTargetLOD(distance, screenSize) {
    const thresholds = {
      ultra: 100,  // pixels
      high: 50,
      medium: 20,
      low: 5
    };
    
    if (screenSize > thresholds.ultra) return 'ultra';
    if (screenSize > thresholds.high) return 'high';
    if (screenSize > thresholds.medium) return 'medium';
    return 'low';
  }

  calculateTransitionFactor(branch, targetLOD) {
    const currentLOD = this.currentLOD.get(branch.id);
    
    if (currentLOD === targetLOD) {
      return 1.0;
    }
    
    // Smooth transition between LOD levels
    const lodOrder = ['ultra', 'high', 'medium', 'low'];
    const currentIndex = lodOrder.indexOf(currentLOD);
    const targetIndex = lodOrder.indexOf(targetLOD);
    
    if (Math.abs(currentIndex - targetIndex) === 1) {
      // Adjacent levels - smooth transition
      return 0.5;
    } else {
      // Non-adjacent levels - immediate transition
      return 1.0;
    }
  }

  renderLOD(branch, camera, renderer) {
    const { targetLOD, transitionFactor } = this.updateLOD(branch, camera, renderer);
    const lods = this.lodLevels.get(branch.id);
    
    if (!lods) return;
    
    const targetLODData = lods.find(lod => lod.level === targetLOD);
    if (!targetLODData) return;
    
    // Apply transition factor to material
    if (targetLODData.mesh.material) {
      targetLODData.mesh.material.opacity = transitionFactor;
      targetLODData.mesh.material.transparent = transitionFactor < 1.0;
    }
    
    // Render the LOD mesh
    renderer.render(targetLODData.mesh, camera);
  }
}

// ============================================================================
// 3. GPU PROCEDURAL GENERATOR MAIN CLASS
// ============================================================================

export class GPUProceduralGenerator {
  constructor() {
    this.nodeGraph = new GPUMeshNodeGraph();
    this.lodSystem = new ContinuousLODSystem();
    this.branches = new Map();
    this.junctions = new Map();
    this.materials = new Map();
    
    this.initDefaultMaterials();
  }

  initDefaultMaterials() {
    // Trunk material
    this.materials.set('trunk', new THREE.MeshLambertMaterial({
      color: 0x8B4513,
      roughness: 0.8,
      metalness: 0.0
    }));
    
    // Branch material
    this.materials.set('branch', new THREE.MeshLambertMaterial({
      color: 0xA0522D,
      roughness: 0.7,
      metalness: 0.0
    }));
    
    // Leaf material
    this.materials.set('leaf', new THREE.MeshLambertMaterial({
      color: 0x228B22,
      roughness: 0.3,
      metalness: 0.0
    }));
  }

  generateProceduralTree(branchData, options = {}) {
    const {
      useGPU = true,
      enableLOD = true,
      enableJunctions = true,
      enableSeasonalEffects = true
    } = options;

    const treeGroup = new THREE.Group();

    // Process each branch
    for (const branch of branchData) {
      const branchNode = this.createBranchNode(branch);
      this.branches.set(branch.id, branchNode);
      
      if (enableLOD) {
        this.lodSystem.createLODLevels(branch);
      }
      
      if (useGPU) {
        // Generate GPU mesh
        const gpuMesh = this.generateGPUMesh(branchNode);
        treeGroup.add(gpuMesh);
      } else {
        // Fallback to CPU mesh
        const cpuMesh = this.generateCPUMesh(branch);
        treeGroup.add(cpuMesh);
      }
    }

    // Process junctions
    if (enableJunctions) {
      const junctionMeshes = this.generateJunctionMeshes();
      junctionMeshes.forEach(mesh => treeGroup.add(mesh));
    }

    return treeGroup;
  }

  createBranchNode(branch) {
    const nodeId = this.nodeGraph.createNode(
      this.nodeGraph.nodeTypes.BRANCH_GENERATOR,
      {
        radius: branch.radius,
        length: branch.length,
        segments: branch.segments || 8,
        type: branch.type || 'branch'
      }
    );
    
    // Set up material
    const materialNode = this.nodeGraph.createNode(
      this.nodeGraph.nodeTypes.MATERIAL_APPLIER,
      {
        material: this.materials.get(branch.type || 'branch')
      }
    );
    
    // Connect nodes
    this.nodeGraph.connectNodes(nodeId, 'geometry', materialNode, 'input');
    
    return { nodeId, materialNode, branch };
  }

  generateGPUMesh(branchNode) {
    const { nodeId, materialNode, branch } = branchNode;
    
    // Create mesh from GPU node
    const mesh = new THREE.Mesh();
    mesh.userData = { nodeId, materialNode, branch };
    
    // Position and orient the mesh
    if (branch.position) {
      mesh.position.copy(branch.position);
    } else if (branch.origin) {
      mesh.position.copy(branch.origin);
    }
    
    if (branch.direction) {
      const up = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(up, branch.direction);
      mesh.quaternion.copy(quaternion);
    }
    
    return mesh;
  }

  generateCPUMesh(branch) {
    const geometry = new THREE.CylinderGeometry(
      branch.radius,
      branch.radius * 0.8,
      branch.length,
      branch.segments || 8
    );
    
    const material = this.materials.get(branch.type || 'branch');
    const mesh = new THREE.Mesh(geometry, material);
    
    // Position and orient
    if (branch.position) {
      mesh.position.copy(branch.position);
    } else if (branch.origin) {
      mesh.position.copy(branch.origin);
    }
    
    if (branch.direction) {
      const up = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(up, branch.direction);
      mesh.quaternion.copy(quaternion);
    }
    
    return mesh;
  }

  generateJunctionMeshes() {
    const junctionMeshes = [];
    
    for (const [branchId, branchNode] of this.branches) {
      const branch = branchNode.branch;
      
      if (branch.children && branch.children.length > 1) {
        const junctionNode = this.nodeGraph.createNode(
          this.nodeGraph.nodeTypes.JUNCTION_BLENDER,
          {
            center: branch.position || branch.origin,
            radius: branch.radius * 2,
            branches: branch.children
          }
        );
        
        const junctionMesh = new THREE.Mesh();
        junctionMesh.userData = { nodeId: junctionNode, type: 'junction' };
        junctionMeshes.push(junctionMesh);
        
        this.junctions.set(branchId, junctionNode);
      }
    }
    
    return junctionMeshes;
  }

  renderTree(treeGroup, camera, renderer) {
    // Render branches
    for (const [branchId, branchNode] of this.branches) {
      const mesh = treeGroup.children.find(child => 
        child.userData.nodeId === branchNode.nodeId
      );
      
      if (mesh) {
        this.nodeGraph.renderNode(branchNode.nodeId, camera, renderer);
      }
    }
    
    // Render junctions
    for (const [branchId, junctionNode] of this.junctions) {
      this.nodeGraph.renderNode(junctionNode, camera, renderer);
    }
  }

  updateTree(time) {
    // Update GPU uniforms
    for (const [branchId, branchNode] of this.branches) {
      const node = this.nodeGraph.nodes.get(branchNode.nodeId);
      if (node) {
        node.uniforms.get('time').value = time;
      }
    }
  }

  setSeason(season) {
    // Update seasonal uniforms
    for (const [branchId, branchNode] of this.branches) {
      const node = this.nodeGraph.nodes.get(branchNode.nodeId);
      if (node) {
        const seasonalNode = this.nodeGraph.nodes.get(branchNode.materialNode);
        if (seasonalNode) {
          seasonalNode.uniforms.get('season').value = season;
        }
      }
    }
  }
}

// Export individual classes for specific use cases
export {
  GPUMeshNodeGraph,
  ContinuousLODSystem
}; 