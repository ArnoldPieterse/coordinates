// Adaptive Tessellation System - Implementation based on detailed specifications
// Implements adaptive mesh tessellation with real-time LOD and interaction refinement

import * as THREE from './three.module.js';

// ============================================================================
// 1. ADAPTIVE TESSELLATION MANAGER
// ============================================================================

class AdaptiveTessellationManager {
  constructor() {
    this.tessellationFactors = new Map();
    this.interactionPoints = new Map();
    this.curvatureCache = new Map();
    this.performanceMetrics = new PerformanceMonitor();
    this.lodManager = new AdaptiveLODManager();
    this.interactionRefiner = new InteractionRefiner();
    
    this.config = {
      minTessellation: 4,
      maxTessellation: 32,
      baseTessellation: 8,
      curvatureThreshold: 0.1,
      distanceThreshold: 50,
      screenSpaceThreshold: 10,
      interactionRadius: 2.0,
      performanceBudget: 16.67 // 60 FPS target
    };
  }

  computeTessellationFactors(branch, camera, renderer, physicsWorld = null) {
    const factors = {
      ringSegments: this.config.baseTessellation,
      radialSegments: this.config.baseTessellation * 2,
      smoothNormals: true,
      adaptiveLevel: 0
    };

    // Compute various error metrics
    const screenError = this.computeScreenSpaceError(branch, camera, renderer);
    const curvatureError = this.computeCurvatureError(branch);
    const distanceError = this.computeDistanceError(branch, camera);
    const interactionError = this.computeInteractionError(branch, physicsWorld);
    const performanceError = this.computePerformanceError();

    // Combine error factors with weights
    const totalError = this.combineErrorFactors({
      screen: screenError,
      curvature: curvatureError,
      distance: distanceError,
      interaction: interactionError,
      performance: performanceError
    });

    // Determine tessellation level
    const tessellationLevel = this.determineTessellationLevel(totalError);
    
    // Update factors based on level
    this.updateTessellationFactors(factors, tessellationLevel);
    
    // Cache results
    this.tessellationFactors.set(branch.id, {
      factors: factors,
      error: totalError,
      timestamp: performance.now()
    });

    return factors;
  }

  computeScreenSpaceError(branch, camera, renderer) {
    // Get branch bounding box
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
    
    // Normalize to 0-1 range
    return Math.min(1.0, pixelSize / this.config.screenSpaceThreshold);
  }

  computeCurvatureError(branch) {
    // Check cache first
    if (this.curvatureCache.has(branch.id)) {
      const cached = this.curvatureCache.get(branch.id);
      if (performance.now() - cached.timestamp < 1000) { // 1 second cache
        return cached.error;
      }
    }

    const geometry = branch.geometry;
    if (!geometry) return 0;

    const positions = geometry.getAttribute('position');
    const normals = geometry.getAttribute('normal');
    
    if (!positions || !normals) return 0;

    let totalCurvature = 0;
    const vertexCount = positions.count;
    
    // Calculate curvature for each vertex
    for (let i = 0; i < vertexCount; i++) {
      const normal = new THREE.Vector3();
      normal.fromBufferAttribute(normals, i);
      
      // Find adjacent vertices
      const adjacent = this.findAdjacentVertices(geometry, i);
      let curvature = 0;
      
      for (const adjIndex of adjacent) {
        const adjNormal = new THREE.Vector3();
        adjNormal.fromBufferAttribute(normals, adjIndex);
        curvature += 1 - normal.dot(adjNormal);
      }
      
      if (adjacent.length > 0) {
        totalCurvature += curvature / adjacent.length;
      }
    }
    
    const averageCurvature = totalCurvature / vertexCount;
    
    // Cache result
    this.curvatureCache.set(branch.id, {
      error: averageCurvature,
      timestamp: performance.now()
    });
    
    return averageCurvature;
  }

  findAdjacentVertices(geometry, vertexIndex) {
    const indices = geometry.getIndex();
    if (!indices) return [];
    
    const adjacent = new Set();
    
    for (let i = 0; i < indices.count; i += 3) {
      const v1 = indices.getX(i);
      const v2 = indices.getX(i + 1);
      const v3 = indices.getX(i + 2);
      
      if (v1 === vertexIndex) {
        adjacent.add(v2);
        adjacent.add(v3);
      } else if (v2 === vertexIndex) {
        adjacent.add(v1);
        adjacent.add(v3);
      } else if (v3 === vertexIndex) {
        adjacent.add(v1);
        adjacent.add(v2);
      }
    }
    
    return Array.from(adjacent);
  }

  computeDistanceError(branch, camera) {
    const distance = camera.position.distanceTo(branch.position);
    return Math.max(0, 1 - distance / this.config.distanceThreshold);
  }

  computeInteractionError(branch, physicsWorld) {
    if (!physicsWorld) return 0;
    
    const interactionPoints = this.interactionRefiner.detectInteractionPoints(branch, physicsWorld);
    let maxIntensity = 0;
    
    for (const point of interactionPoints) {
      maxIntensity = Math.max(maxIntensity, point.intensity);
    }
    
    return maxIntensity;
  }

  computePerformanceError() {
    const currentFPS = this.performanceMetrics.getCurrentFPS();
    const targetFPS = 1000 / this.config.performanceBudget;
    
    if (currentFPS < targetFPS) {
      return (targetFPS - currentFPS) / targetFPS;
    }
    
    return 0;
  }

  combineErrorFactors(errors) {
    const weights = {
      screen: 0.4,
      curvature: 0.3,
      distance: 0.2,
      interaction: 0.1,
      performance: 0.1
    };
    
    let totalError = 0;
    for (const [key, error] of Object.entries(errors)) {
      totalError += error * weights[key];
    }
    
    return Math.min(1.0, totalError);
  }

  determineTessellationLevel(totalError) {
    if (totalError > 0.8) return 'ultra';
    if (totalError > 0.6) return 'high';
    if (totalError > 0.4) return 'medium';
    if (totalError > 0.2) return 'low';
    return 'minimal';
  }

  updateTessellationFactors(factors, level) {
    const levelConfigs = {
      ultra: { rings: 32, radials: 64, smooth: true },
      high: { rings: 24, radials: 48, smooth: true },
      medium: { rings: 16, radials: 32, smooth: true },
      low: { rings: 8, radials: 16, smooth: false },
      minimal: { rings: 4, radials: 8, smooth: false }
    };
    
    const config = levelConfigs[level];
    factors.ringSegments = config.rings;
    factors.radialSegments = config.radials;
    factors.smoothNormals = config.smooth;
    factors.adaptiveLevel = Object.keys(levelConfigs).indexOf(level);
  }

  updateAllBranches(branches, camera, renderer, physicsWorld) {
    const updates = [];
    
    for (const branch of branches) {
      const currentFactors = this.tessellationFactors.get(branch.id);
      const newFactors = this.computeTessellationFactors(branch, camera, renderer, physicsWorld);
      
      // Check if tessellation needs update
      if (!currentFactors || this.needsTessellationUpdate(currentFactors, newFactors)) {
        updates.push({
          branch: branch,
          factors: newFactors,
          priority: this.calculateUpdatePriority(newFactors.error)
        });
      }
    }
    
    // Sort by priority and update
    updates.sort((a, b) => b.priority - a.priority);
    
    for (const update of updates) {
      this.applyTessellationUpdate(update.branch, update.factors);
    }
    
    return updates.length;
  }

  needsTessellationUpdate(current, newFactors) {
    const threshold = 0.1;
    
    return Math.abs(current.factors.ringSegments - newFactors.ringSegments) > threshold ||
           Math.abs(current.factors.radialSegments - newFactors.radialSegments) > threshold ||
           current.factors.smoothNormals !== newFactors.smoothNormals;
  }

  calculateUpdatePriority(error) {
    return error; // Higher error = higher priority
  }

  applyTessellationUpdate(branch, factors) {
    // Update branch geometry with new tessellation
    const geometry = this.generateAdaptiveGeometry(branch, factors);
    
    if (geometry) {
      branch.geometry.dispose();
      branch.geometry = geometry;
      
      if (factors.smoothNormals) {
        geometry.computeVertexNormals();
      }
    }
  }

  generateAdaptiveGeometry(branch, factors) {
    const { ringSegments, radialSegments } = factors;
    
    switch (branch.type) {
      case 'trunk':
        return new THREE.CylinderGeometry(
          branch.radius,
          branch.radius * 0.8,
          branch.length,
          radialSegments,
          ringSegments
        );
      case 'branch':
        return new THREE.CylinderGeometry(
          branch.radius,
          branch.radius * 0.6,
          branch.length,
          radialSegments,
          ringSegments
        );
      case 'leaf':
        return new THREE.SphereGeometry(
          branch.radius,
          radialSegments,
          ringSegments
        );
      default:
        return new THREE.CylinderGeometry(
          branch.radius,
          branch.radius * 0.8,
          branch.length,
          radialSegments,
          ringSegments
        );
    }
  }
}

// ============================================================================
// 2. ADAPTIVE LOD MANAGER
// ============================================================================

class AdaptiveLODManager {
  constructor() {
    this.lodLevels = new Map();
    this.transitionFactors = new Map();
    this.lodConfigs = {
      ultra: { distance: 0, screenSize: 100 },
      high: { distance: 10, screenSize: 50 },
      medium: { distance: 25, screenSize: 20 },
      low: { distance: 50, screenSize: 5 },
      minimal: { distance: 100, screenSize: 1 }
    };
  }

  createLODLevels(branch) {
    const lods = [];
    const levels = Object.keys(this.lodConfigs);
    
    for (const level of levels) {
      const geometry = this.generateLODGeometry(branch, level);
      const mesh = new THREE.Mesh(geometry, branch.material);
      
      lods.push({
        level: level,
        mesh: mesh,
        geometry: geometry,
        config: this.lodConfigs[level]
      });
    }
    
    this.lodLevels.set(branch.id, lods);
    return lods;
  }

  generateLODGeometry(branch, level) {
    const params = this.getLODParams(level);
    
    switch (branch.type) {
      case 'trunk':
        return new THREE.CylinderGeometry(
          branch.radius,
          branch.radius * 0.8,
          branch.length,
          params.radials,
          params.rings
        );
      case 'branch':
        return new THREE.CylinderGeometry(
          branch.radius,
          branch.radius * 0.6,
          branch.length,
          params.radials,
          params.rings
        );
      case 'leaf':
        return new THREE.SphereGeometry(
          branch.radius,
          params.radials,
          params.rings
        );
      default:
        return new THREE.CylinderGeometry(
          branch.radius,
          branch.radius * 0.8,
          branch.length,
          params.radials,
          params.rings
        );
    }
  }

  getLODParams(level) {
    const params = {
      ultra: { rings: 16, radials: 32 },
      high: { rings: 12, radials: 24 },
      medium: { rings: 8, radials: 16 },
      low: { rings: 4, radials: 8 },
      minimal: { rings: 2, radials: 4 }
    };
    
    return params[level] || params.medium;
  }

  updateLOD(branch, camera, renderer) {
    const lods = this.lodLevels.get(branch.id);
    if (!lods) return null;
    
    const distance = camera.position.distanceTo(branch.position);
    const screenSize = this.calculateScreenSize(branch, camera, renderer);
    
    const targetLOD = this.determineTargetLOD(distance, screenSize);
    const transitionFactor = this.calculateTransitionFactor(branch, targetLOD);
    
    this.transitionFactors.set(branch.id, { targetLOD, transitionFactor });
    
    return { targetLOD, transitionFactor, lods };
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

  determineTargetLOD(distance, screenSize) {
    // Check screen size first
    for (const [level, config] of Object.entries(this.lodConfigs)) {
      if (screenSize >= config.screenSize) {
        return level;
      }
    }
    
    // Fallback to distance-based LOD
    for (const [level, config] of Object.entries(this.lodConfigs)) {
      if (distance <= config.distance) {
        return level;
      }
    }
    
    return 'minimal';
  }

  calculateTransitionFactor(branch, targetLOD) {
    const currentLOD = this.transitionFactors.get(branch.id)?.targetLOD || 'medium';
    
    if (currentLOD === targetLOD) {
      return 1.0;
    }
    
    // Smooth transition between adjacent levels
    const levels = Object.keys(this.lodConfigs);
    const currentIndex = levels.indexOf(currentLOD);
    const targetIndex = levels.indexOf(targetLOD);
    
    if (Math.abs(currentIndex - targetIndex) === 1) {
      return 0.5; // Smooth transition
    } else {
      return 1.0; // Immediate transition
    }
  }

  renderLOD(branch, camera, renderer) {
    const lodData = this.updateLOD(branch, camera, renderer);
    if (!lodData) return;
    
    const { targetLOD, transitionFactor, lods } = lodData;
    const targetLODData = lods.find(lod => lod.level === targetLOD);
    
    if (!targetLODData) return;
    
    // Apply transition factor
    if (targetLODData.mesh.material) {
      targetLODData.mesh.material.opacity = transitionFactor;
      targetLODData.mesh.material.transparent = transitionFactor < 1.0;
    }
    
    // Render the LOD mesh
    renderer.render(targetLODData.mesh, camera);
  }
}

// ============================================================================
// 3. INTERACTION REFINER
// ============================================================================

class InteractionRefiner {
  constructor() {
    this.interactionPoints = new Map();
    this.refinementRadius = 2.0;
    this.maxRefinementLevel = 3;
  }

  detectInteractionPoints(branch, physicsWorld) {
    const points = [];
    
    // Raycast from branch to detect collisions
    const rayStart = branch.position.clone();
    const rayEnd = branch.position.clone().add(
      branch.direction ? branch.direction.clone().multiplyScalar(branch.length) : new THREE.Vector3(0, branch.length, 0)
    );
    
    const ray = new THREE.Raycaster(rayStart, rayEnd.sub(rayStart).normalize());
    const intersects = ray.intersectObjects(physicsWorld.objects || []);
    
    for (const intersect of intersects) {
      if (intersect.distance < this.refinementRadius) {
        points.push({
          position: intersect.point,
          distance: intersect.distance,
          intensity: 1 - (intersect.distance / this.refinementRadius),
          object: intersect.object
        });
      }
    }
    
    this.interactionPoints.set(branch.id, points);
    return points;
  }

  refineMeshAtInteraction(branch, interactionPoints) {
    if (interactionPoints.length === 0) return;
    
    // Calculate local tessellation factor based on interaction intensity
    let maxIntensity = 0;
    for (const point of interactionPoints) {
      maxIntensity = Math.max(maxIntensity, point.intensity);
    }
    
    // Increase tessellation based on interaction intensity
    const baseSegments = branch.ringSegments || 8;
    const refinedSegments = Math.min(
      this.maxRefinementLevel * baseSegments,
      Math.ceil(baseSegments * (1 + maxIntensity * 2))
    );
    
    if (refinedSegments > branch.ringSegments) {
      branch.ringSegments = refinedSegments;
      branch.needsRegeneration = true;
    }
  }

  updateInteractionRefinement(branches, physicsWorld) {
    for (const branch of branches) {
      const interactionPoints = this.detectInteractionPoints(branch, physicsWorld);
      this.refineMeshAtInteraction(branch, interactionPoints);
    }
  }
}

// ============================================================================
// 4. PERFORMANCE MONITOR
// ============================================================================

class PerformanceMonitor {
  constructor() {
    this.frameTimes = [];
    this.maxFrameSamples = 60;
    this.lastFrameTime = performance.now();
  }

  update() {
    const currentTime = performance.now();
    const frameTime = currentTime - this.lastFrameTime;
    
    this.frameTimes.push(frameTime);
    
    if (this.frameTimes.length > this.maxFrameSamples) {
      this.frameTimes.shift();
    }
    
    this.lastFrameTime = currentTime;
  }

  getCurrentFPS() {
    if (this.frameTimes.length === 0) return 60;
    
    const averageFrameTime = this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;
    return 1000 / averageFrameTime;
  }

  getAverageFrameTime() {
    if (this.frameTimes.length === 0) return 16.67;
    
    return this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;
  }

  getPerformanceMetrics() {
    return {
      fps: this.getCurrentFPS(),
      frameTime: this.getAverageFrameTime(),
      frameCount: this.frameTimes.length
    };
  }
}

// ============================================================================
// 5. MAIN ADAPTIVE TESSELLATION SYSTEM
// ============================================================================

export class AdaptiveTessellationSystem {
  constructor(config = {}) {
    this.manager = new AdaptiveTessellationManager();
    this.lodManager = new AdaptiveLODManager();
    this.interactionRefiner = new InteractionRefiner();
    this.performanceMonitor = new PerformanceMonitor();
    
    // Merge config
    Object.assign(this.manager.config, config);
    
    this.isActive = false;
    this.updateInterval = null;
  }

  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.updateInterval = setInterval(() => {
      this.performanceMonitor.update();
    }, 16); // ~60 FPS
    
    console.log('Adaptive tessellation system started');
  }

  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    console.log('Adaptive tessellation system stopped');
  }

  updateTessellation(branches, camera, renderer, physicsWorld = null) {
    if (!this.isActive) return 0;
    
    return this.manager.updateAllBranches(branches, camera, renderer, physicsWorld);
  }

  createLODLevels(branch) {
    return this.lodManager.createLODLevels(branch);
  }

  renderLOD(branch, camera, renderer) {
    this.lodManager.renderLOD(branch, camera, renderer);
  }

  updateInteractionRefinement(branches, physicsWorld) {
    this.interactionRefiner.updateInteractionRefinement(branches, physicsWorld);
  }

  getPerformanceMetrics() {
    return this.performanceMonitor.getPerformanceMetrics();
  }

  setConfig(config) {
    Object.assign(this.manager.config, config);
  }

  getConfig() {
    return { ...this.manager.config };
  }
}

// Export individual classes for specific use cases
export {
  AdaptiveTessellationManager,
  AdaptiveLODManager,
  InteractionRefiner,
  PerformanceMonitor
}; 