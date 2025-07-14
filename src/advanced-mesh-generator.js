// Advanced Mesh Generator - Implementation based on detailed specifications
// Implements adaptive tessellation, metaball/tube blending, and real-time materials

import * as THREE from './three.module.js';

// ============================================================================
// 1. ADAPTIVE TESSELLATION SYSTEM
// ============================================================================

class AdaptiveTessellationSystem {
  constructor() {
    this.lodManager = new TreeLODManager();
    this.interactionTessellation = new InteractionTessellation();
    this.smoothingSystem = new NormalSmoother();
  }

  computeScreenSpaceError(obj, camera, renderer) {
    // Get object's bounding box in world space
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    // Transform center to camera space
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

  computeCurvatureError(geometry) {
    const positions = geometry.getAttribute('position');
    const normals = geometry.getAttribute('normal');
    let totalCurvature = 0;
    
    // Calculate curvature for each vertex
    for (let i = 0; i < positions.count; i++) {
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
      
      totalCurvature += curvature / adjacent.length;
    }
    
    return totalCurvature / positions.count;
  }

  findAdjacentVertices(geometry, vertexIndex) {
    const indices = geometry.getIndex();
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

  updateTessellationFactors(branches, camera, renderer) {
    const thresholds = {
      ultra: 100,  // pixels
      high: 50,
      medium: 20,
      low: 5
    };
    
    for (const branch of branches) {
      const error = this.computeMultiFactorError(branch, camera, renderer);
      const level = this.calculateTessellationLevel(error, thresholds);
      
      // Update tessellation parameters
      branch.tessellationLevel = level;
      branch.ringSegments = this.getRingSegments(level);
      branch.radialSegments = this.getRadialSegments(level);
      
      // Mark for regeneration if level changed
      if (branch.previousLevel !== level) {
        branch.needsRegeneration = true;
        branch.previousLevel = level;
      }
    }
  }

  computeMultiFactorError(obj, camera, renderer) {
    const screenError = this.computeScreenSpaceError(obj, camera, renderer);
    const curvatureError = this.computeCurvatureError(obj.geometry);
    const distanceError = this.computeDistanceError(obj, camera);
    const motionError = this.computeMotionError(obj);
    
    // Weighted combination of error factors
    const weights = {
      screen: 0.4,
      curvature: 0.3,
      distance: 0.2,
      motion: 0.1
    };
    
    return screenError * weights.screen +
           curvatureError * weights.curvature +
           distanceError * weights.distance +
           motionError * weights.motion;
  }

  computeDistanceError(obj, camera) {
    const distance = camera.position.distanceTo(obj.position);
    return Math.max(0, 1 - distance / 10);
  }

  computeMotionError(obj) {
    // Simple motion detection - can be enhanced with velocity tracking
    return obj.userData.motionFactor || 0;
  }

  calculateTessellationLevel(error, thresholds) {
    if (error > thresholds.ultra) return 'ultra';
    if (error > thresholds.high) return 'high';
    if (error > thresholds.medium) return 'medium';
    return 'low';
  }

  getRingSegments(level) {
    const segments = {
      ultra: 16,
      high: 12,
      medium: 8,
      low: 4
    };
    return segments[level] || 8;
  }

  getRadialSegments(level) {
    const segments = {
      ultra: 32,
      high: 24,
      medium: 16,
      low: 8
    };
    return segments[level] || 16;
  }
}

class TreeLODManager {
  constructor() {
    this.lodLevels = new Map();
    this.currentLOD = new Map();
    this.transitionThresholds = [0, 10, 50, 100]; // distance thresholds
  }
  
  createLODLevels(branch, levels = ['ultra', 'high', 'medium', 'low']) {
    const lods = [];
    
    for (const level of levels) {
      const geometry = this.generateGeometry(branch, level);
      const mesh = new THREE.Mesh(geometry, branch.material);
      lods.push(mesh);
    }
    
    const lodObject = new THREE.LOD();
    for (let i = 0; i < lods.length; i++) {
      lodObject.addLevel(lods[i], this.transitionThresholds[i]);
    }
    
    this.lodLevels.set(branch.id, lodObject);
    return lodObject;
  }
  
  generateGeometry(branch, level) {
    const params = this.getGeometryParams(level);
    
    switch (branch.type) {
      case 'trunk':
        return this.generateTrunkGeometry(branch, params);
      case 'branch':
        return this.generateBranchGeometry(branch, params);
      case 'leaf':
        return this.generateLeafGeometry(branch, params);
      default:
        return this.generateDefaultGeometry(branch, params);
    }
  }
  
  getGeometryParams(level) {
    return {
      ultra: { rings: 16, radials: 32, smooth: true },
      high: { rings: 12, radials: 24, smooth: true },
      medium: { rings: 8, radials: 16, smooth: false },
      low: { rings: 4, radials: 8, smooth: false }
    }[level];
  }

  generateTrunkGeometry(branch, params) {
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

  generateBranchGeometry(branch, params) {
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

  generateLeafGeometry(branch, params) {
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

  generateDefaultGeometry(branch, params) {
    return this.generateBranchGeometry(branch, params);
  }
}

class InteractionTessellation {
  constructor() {
    this.interactionPoints = new Map();
    this.refinementRadius = 2.0;
  }
  
  detectInteractionPoints(branch, physicsWorld) {
    const points = [];
    
    // Raycast from branch to detect collisions
    const rayStart = branch.position.clone();
    const rayEnd = branch.position.clone().add(branch.direction.clone().multiplyScalar(branch.length));
    
    const ray = new THREE.Raycaster(rayStart, rayEnd.sub(rayStart).normalize());
    const intersects = ray.intersectObjects(physicsWorld.objects || []);
    
    for (const intersect of intersects) {
      if (intersect.distance < this.refinementRadius) {
        points.push({
          position: intersect.point,
          distance: intersect.distance,
          intensity: 1 - (intersect.distance / this.refinementRadius)
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
    const refinedSegments = Math.ceil(baseSegments * (1 + maxIntensity * 2));
    
    if (refinedSegments > branch.ringSegments) {
      branch.ringSegments = refinedSegments;
      branch.needsRegeneration = true;
    }
  }
}

class NormalSmoother {
  constructor() {
    this.smoothingIterations = 3;
    this.smoothingFactor = 0.5;
  }
  
  smoothNormals(geometry) {
    const positions = geometry.getAttribute('position');
    const normals = geometry.getAttribute('normal');
    const indices = geometry.getIndex();
    
    // Create adjacency map
    const adjacency = this.buildAdjacencyMap(positions, indices);
    
    // Smooth normals iteratively
    for (let iteration = 0; iteration < this.smoothingIterations; iteration++) {
      this.smoothNormalsIteration(positions, normals, adjacency);
    }
    
    normals.needsUpdate = true;
  }
  
  buildAdjacencyMap(positions, indices) {
    const adjacency = new Map();
    
    for (let i = 0; i < indices.count; i += 3) {
      const v1 = indices.getX(i);
      const v2 = indices.getX(i + 1);
      const v3 = indices.getX(i + 2);
      
      this.addAdjacency(adjacency, v1, v2);
      this.addAdjacency(adjacency, v2, v3);
      this.addAdjacency(adjacency, v3, v1);
    }
    
    return adjacency;
  }
  
  addAdjacency(adjacency, v1, v2) {
    if (!adjacency.has(v1)) adjacency.set(v1, new Set());
    if (!adjacency.has(v2)) adjacency.set(v2, new Set());
    
    adjacency.get(v1).add(v2);
    adjacency.get(v2).add(v1);
  }
  
  smoothNormalsIteration(positions, normals, adjacency) {
    const smoothedNormals = new Float32Array(normals.array.length);
    
    for (let i = 0; i < positions.count; i++) {
      const neighbors = adjacency.get(i);
      if (!neighbors || neighbors.size === 0) continue;
      
      const currentNormal = new THREE.Vector3();
      currentNormal.fromBufferAttribute(normals, i);
      
      const averageNormal = new THREE.Vector3();
      let neighborCount = 0;
      
      for (const neighbor of neighbors) {
        const neighborNormal = new THREE.Vector3();
        neighborNormal.fromBufferAttribute(normals, neighbor);
        averageNormal.add(neighborNormal);
        neighborCount++;
      }
      
      if (neighborCount > 0) {
        averageNormal.divideScalar(neighborCount).normalize();
        
        // Interpolate between current and average normal
        const smoothedNormal = currentNormal.clone().lerp(averageNormal, this.smoothingFactor);
        smoothedNormal.normalize();
        
        smoothedNormals[i * 3] = smoothedNormal.x;
        smoothedNormals[i * 3 + 1] = smoothedNormal.y;
        smoothedNormals[i * 3 + 2] = smoothedNormal.z;
      } else {
        smoothedNormals[i * 3] = currentNormal.x;
        smoothedNormals[i * 3 + 1] = currentNormal.y;
        smoothedNormals[i * 3 + 2] = currentNormal.z;
      }
    }
    
    normals.array.set(smoothedNormals);
  }
}

// ============================================================================
// 2. METABALL AND TUBE MESH BLENDING
// ============================================================================

class JunctionAnalyzer {
  constructor() {
    this.junctions = new Map();
    this.metaballFields = new Map();
  }
  
  analyzeJunctions(branch) {
    const junctions = [];
    
    // Find all branch junctions
    this.findJunctions(branch, junctions);
    
    for (const junction of junctions) {
      const overlap = this.calculateOverlap(junction);
      const metaballField = this.createMetaballField(junction, overlap);
      
      this.junctions.set(junction.id, junction);
      this.metaballFields.set(junction.id, metaballField);
    }
    
    return junctions;
  }
  
  findJunctions(branch, junctions) {
    if (branch.children && branch.children.length > 1) {
      junctions.push({
        id: branch.id || Math.random().toString(36),
        position: branch.position || branch.origin,
        parent: branch,
        children: branch.children,
        parentRadius: branch.radius,
        childRadii: branch.children.map(child => child.radius)
      });
    }
    
    if (branch.children) {
      for (const child of branch.children) {
        this.findJunctions(child, junctions);
      }
    }
  }
  
  calculateOverlap(junction) {
    const { parent, children } = junction;
    const overlaps = [];
    
    for (const child of children) {
      const distance = parent.position.distanceTo(child.position || child.origin);
      const sumRadii = parent.radius + child.radius;
      
      if (distance < sumRadii) {
        overlaps.push({
          child: child,
          overlap: sumRadii - distance,
          overlapRatio: (sumRadii - distance) / sumRadii
        });
      }
    }
    
    return overlaps;
  }

  createMetaballField(junction, overlaps) {
    const field = {
      center: junction.position.clone(),
      balls: [],
      resolution: 32,
      size: 4.0
    };
    
    // Add parent metaball
    field.balls.push({
      position: junction.position.clone(),
      radius: junction.parentRadius,
      strength: 1.0
    });
    
    // Add child metaballs
    for (const overlap of overlaps) {
      field.balls.push({
        position: (overlap.child.position || overlap.child.origin).clone(),
        radius: overlap.child.radius,
        strength: overlap.overlapRatio
      });
    }
    
    return field;
  }
}

class MetaballMeshGenerator {
  constructor(resolution = 32, size = 4.0) {
    this.resolution = resolution;
    this.size = size;
    this.stepSize = size / resolution;
    this.field = new Float32Array(resolution * resolution * resolution);
  }
  
  generateMetaballMesh(metaballField) {
    // Clear field
    this.field.fill(0);
    
    // Sample metaball field
    this.sampleMetaballField(metaballField);
    
    // Extract mesh using marching cubes
    const geometry = this.marchCubes();
    
    return geometry;
  }
  
  sampleMetaballField(metaballField) {
    const { balls, center, resolution, size } = metaballField;
    const halfSize = size / 2;
    
    for (let x = 0; x < resolution; x++) {
      for (let y = 0; y < resolution; y++) {
        for (let z = 0; z < resolution; z++) {
          const worldPos = new THREE.Vector3(
            center.x + (x / resolution - 0.5) * size,
            center.y + (y / resolution - 0.5) * size,
            center.z + (z / resolution - 0.5) * size
          );
          
          let value = 0;
          for (const ball of balls) {
            const distance = worldPos.distanceTo(ball.position);
            if (distance < ball.radius) {
              const normalizedDist = distance / ball.radius;
              value += ball.strength * (1 - normalizedDist * normalizedDist);
            }
          }
          
          const index = x + y * resolution + z * resolution * resolution;
          this.field[index] = value;
        }
      }
    }
  }
  
  marchCubes() {
    const vertices = [];
    const indices = [];
    const normals = [];
    
    const threshold = 0.5;
    
    for (let x = 0; x < this.resolution - 1; x++) {
      for (let y = 0; y < this.resolution - 1; y++) {
        for (let z = 0; z < this.resolution - 1; z++) {
          const cube = this.getCube(x, y, z);
          const mesh = this.processCube(cube, threshold, x, y, z);
          
          if (mesh.vertices.length > 0) {
            const offset = vertices.length / 3;
            vertices.push(...mesh.vertices);
            indices.push(...mesh.indices.map(i => i + offset));
            normals.push(...mesh.normals);
          }
        }
      }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setIndex(indices);
    
    return geometry;
  }
  
  getCube(x, y, z) {
    const cube = [];
    for (let i = 0; i < 8; i++) {
      const dx = i & 1;
      const dy = (i >> 1) & 1;
      const dz = (i >> 2) & 1;
      
      const index = (x + dx) + (y + dy) * this.resolution + (z + dz) * this.resolution * this.resolution;
      cube.push(this.field[index]);
    }
    return cube;
  }
  
  processCube(cube, threshold, x, y, z) {
    const vertices = [];
    const indices = [];
    const normals = [];
    
    // Simplified marching cubes implementation
    // Create vertices at cube edges where field crosses threshold
    for (let i = 0; i < 12; i++) {
      const edge = this.getEdge(i);
      const v1 = cube[edge[0]];
      const v2 = cube[edge[1]];
      
      if ((v1 > threshold) !== (v2 > threshold)) {
        const t = (threshold - v1) / (v2 - v1);
        const vertex = this.interpolateVertex(edge[0], edge[1], t, x, y, z);
        vertices.push(...vertex);
        
        // Calculate normal
        const normal = this.calculateNormal(edge[0], edge[1], t);
        normals.push(...normal);
      }
    }
    
    return { vertices, indices, normals };
  }

  getEdge(edgeIndex) {
    // Edge connectivity for cube
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // bottom
      [4, 5], [5, 6], [6, 7], [7, 4], // top
      [0, 4], [1, 5], [2, 6], [3, 7]  // sides
    ];
    return edges[edgeIndex];
  }

  interpolateVertex(v1, v2, t, x, y, z) {
    // Convert cube coordinates to world coordinates
    const worldPos = new THREE.Vector3(
      (x + t) * this.stepSize - this.size / 2,
      (y + t) * this.stepSize - this.size / 2,
      (z + t) * this.stepSize - this.size / 2
    );
    
    return [worldPos.x, worldPos.y, worldPos.z];
  }

  calculateNormal(v1, v2, t) {
    // Simple normal calculation - can be enhanced with gradient
    return [0, 1, 0]; // Default up normal
  }
}

class TubeMeshGenerator {
  constructor(ringSegments = 8, radialSegments = 16) {
    this.ringSegments = ringSegments;
    this.radialSegments = radialSegments;
  }
  
  generateTubeMesh(branch) {
    const path = this.generatePath(branch);
    const geometry = this.sweepRingAlongPath(path, branch.radius);
    
    return geometry;
  }
  
  generatePath(branch) {
    const path = [];
    const steps = Math.ceil(branch.length / 0.5); // 0.5 unit steps
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const position = (branch.position || branch.origin).clone().add(
        (branch.direction || new THREE.Vector3(0, 1, 0)).clone().multiplyScalar(branch.length * t)
      );
      
      // Add some curvature based on branch parameters
      const curvature = this.calculateCurvature(branch, t);
      position.add(curvature);
      
      path.push({
        position: position,
        radius: this.interpolateRadius(branch.radius, t),
        orientation: this.calculateOrientation(branch, t)
      });
    }
    
    return path;
  }
  
  calculateCurvature(branch, t) {
    // Simple curvature calculation
    const curvature = new THREE.Vector3();
    curvature.x = Math.sin(t * Math.PI) * 0.1;
    curvature.z = Math.cos(t * Math.PI) * 0.1;
    return curvature;
  }
  
  interpolateRadius(radius, t) {
    return radius * (1 - t * 0.2); // Taper towards end
  }
  
  calculateOrientation(branch, t) {
    // Calculate orientation quaternion
    const up = new THREE.Vector3(0, 1, 0);
    const direction = branch.direction || new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(up, direction);
    return quaternion;
  }
  
  sweepRingAlongPath(path, baseRadius) {
    const vertices = [];
    const indices = [];
    const normals = [];
    const uvs = [];
    
    for (let i = 0; i < path.length; i++) {
      const point = path[i];
      const ring = this.generateRing(point, baseRadius);
      
      vertices.push(...ring.vertices);
      normals.push(...ring.normals);
      uvs.push(...ring.uvs);
      
      // Create faces between rings
      if (i > 0) {
        const prevRing = this.generateRing(path[i - 1], baseRadius);
        const faces = this.createFacesBetweenRings(prevRing, ring, i - 1, i);
        indices.push(...faces);
      }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    
    return geometry;
  }
  
  generateRing(point, baseRadius) {
    const vertices = [];
    const normals = [];
    const uvs = [];
    
    for (let i = 0; i < this.ringSegments; i++) {
      const angle = (i / this.ringSegments) * Math.PI * 2;
      
      // Calculate position on ring
      const radius = point.radius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      // Transform to world space
      const localPos = new THREE.Vector3(x, y, 0);
      const worldPos = localPos.applyQuaternion(point.orientation).add(point.position);
      
      vertices.push(worldPos.x, worldPos.y, worldPos.z);
      
      // Calculate normal
      const normal = localPos.clone().normalize().applyQuaternion(point.orientation);
      normals.push(normal.x, normal.y, normal.z);
      
      // UV coordinates
      uvs.push(i / this.ringSegments, 0);
    }
    
    return { vertices, normals, uvs };
  }
  
  createFacesBetweenRings(ring1, ring2, index1, index2) {
    const faces = [];
    const segments = this.ringSegments;
    
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      
      const v1 = index1 * segments + i;
      const v2 = index1 * segments + next;
      const v3 = index2 * segments + next;
      const v4 = index2 * segments + i;
      
      // Create two triangles
      faces.push(v1, v2, v3);
      faces.push(v1, v3, v4);
    }
    
    return faces;
  }
}

// ============================================================================
// 3. REAL-TIME MATERIAL AND SEASONAL UPDATES
// ============================================================================

class MaterialAnimator {
  constructor() {
    this.animations = new Map();
    this.time = 0;
  }
  
  animateMaterial(material, season, time) {
    const seasonColors = {
      spring: { trunk: '#8B4513', leaves: '#90EE90' },
      summer: { trunk: '#A0522D', leaves: '#228B22' },
      autumn: { trunk: '#8B4513', leaves: '#FF8C00' },
      winter: { trunk: '#696969', leaves: '#F0F8FF' }
    };
    
    const currentColors = seasonColors[season];
    if (!currentColors) return;
    
    // Animate color transition
    this.animateColor(material, currentColors, time);
    
    // Animate other properties
    this.animateRoughness(material, season, time);
    this.animateMetallic(material, season, time);
  }
  
  animateColor(material, colors, time) {
    const trunkColor = new THREE.Color(colors.trunk);
    const leafColor = new THREE.Color(colors.leaves);
    
    // Create smooth transition
    const transitionTime = 2.0; // seconds
    const progress = (time % transitionTime) / transitionTime;
    
    if (material.name && material.name.includes('trunk')) {
      material.color.lerp(trunkColor, 0.01);
    } else if (material.name && material.name.includes('leaf')) {
      material.color.lerp(leafColor, 0.01);
    }
  }
  
  animateRoughness(material, season, time) {
    const seasonRoughness = {
      spring: 0.3,
      summer: 0.4,
      autumn: 0.6,
      winter: 0.8
    };
    
    const targetRoughness = seasonRoughness[season] || 0.5;
    material.roughness = THREE.MathUtils.lerp(material.roughness || 0.5, targetRoughness, 0.01);
  }
  
  animateMetallic(material, season, time) {
    const seasonMetallic = {
      spring: 0.0,
      summer: 0.0,
      autumn: 0.1,
      winter: 0.2
    };
    
    const targetMetallic = seasonMetallic[season] || 0.0;
    material.metallic = THREE.MathUtils.lerp(material.metallic || 0.0, targetMetallic, 0.01);
  }
}

class SeasonalEffectSystem {
  constructor() {
    this.currentSeason = 'summer';
    this.transitionProgress = 0;
    this.effects = new Map();
  }
  
  updateSeason(newSeason, transitionDuration = 5.0) {
    if (this.currentSeason === newSeason) return;
    
    this.startSeasonTransition(newSeason, transitionDuration);
  }
  
  startSeasonTransition(newSeason, duration) {
    const oldSeason = this.currentSeason;
    const startTime = performance.now();
    
    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      this.transitionProgress = Math.min(elapsed / duration, 1);
      
      // Apply seasonal effects
      this.applySeasonalEffects(oldSeason, newSeason, this.transitionProgress);
      
      if (this.transitionProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.currentSeason = newSeason;
        this.transitionProgress = 0;
      }
    };
    
    animate();
  }
  
  applySeasonalEffects(oldSeason, newSeason, progress) {
    // Snow effect
    if (newSeason === 'winter' || oldSeason === 'winter') {
      this.applySnowEffect(progress);
    }
    
    // Blossom effect
    if (newSeason === 'spring' || oldSeason === 'spring') {
      this.applyBlossomEffect(progress);
    }
    
    // Leaf fall effect
    if (newSeason === 'autumn' || oldSeason === 'autumn') {
      this.applyLeafFallEffect(progress);
    }
  }
  
  applySnowEffect(progress) {
    const snowIntensity = this.currentSeason === 'winter' ? progress : 1 - progress;
    // Implementation for snow effect
    console.log(`Applying snow effect with intensity: ${snowIntensity}`);
  }
  
  applyBlossomEffect(progress) {
    const blossomIntensity = this.currentSeason === 'spring' ? progress : 1 - progress;
    // Implementation for blossom effect
    console.log(`Applying blossom effect with intensity: ${blossomIntensity}`);
  }
  
  applyLeafFallEffect(progress) {
    const fallIntensity = this.currentSeason === 'autumn' ? progress : 1 - progress;
    // Implementation for leaf fall effect
    console.log(`Applying leaf fall effect with intensity: ${fallIntensity}`);
  }
}

// ============================================================================
// 4. MAIN ADVANCED MESH GENERATOR CLASS
// ============================================================================

export class AdvancedMeshGenerator {
  constructor() {
    this.tessellationSystem = new AdaptiveTessellationSystem();
    this.junctionAnalyzer = new JunctionAnalyzer();
    this.metaballGenerator = new MetaballMeshGenerator();
    this.tubeGenerator = new TubeMeshGenerator();
    this.materialAnimator = new MaterialAnimator();
    this.seasonalSystem = new SeasonalEffectSystem();
  }

  generateAdvancedTreeMesh(branches, options = {}) {
    const {
      adaptiveTessellation = true,
      metaballBlending = true,
      tubeGeneration = true,
      seasonalEffects = true,
      camera = null,
      renderer = null
    } = options;

    const treeGroup = new THREE.Group();

    // Process each branch
    for (const branch of branches) {
      let branchMesh;

      if (adaptiveTessellation && camera && renderer) {
        // Apply adaptive tessellation
        this.tessellationSystem.updateTessellationFactors([branch], camera, renderer);
      }

      if (metaballBlending && branch.children && branch.children.length > 1) {
        // Generate metaball mesh for junctions
        const junctions = this.junctionAnalyzer.analyzeJunctions(branch);
        for (const junction of junctions) {
          const metaballField = this.junctionAnalyzer.metaballFields.get(junction.id);
          if (metaballField) {
            const metaballGeometry = this.metaballGenerator.generateMetaballMesh(metaballField);
            const metaballMaterial = new THREE.MeshLambertMaterial({ 
              color: 0x8B4513,
              transparent: true,
              opacity: 0.8
            });
            const metaballMesh = new THREE.Mesh(metaballGeometry, metaballMaterial);
            treeGroup.add(metaballMesh);
          }
        }
      }

      if (tubeGeneration) {
        // Generate tube mesh for branch
        const tubeGeometry = this.tubeGenerator.generateTubeMesh(branch);
        const tubeMaterial = new THREE.MeshLambertMaterial({ 
          color: branch.type === 'trunk' ? 0x8B4513 : 0xA0522D 
        });
        branchMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
      } else {
        // Fallback to simple cylinder
        const geometry = new THREE.CylinderGeometry(
          branch.radius, 
          branch.radius * 0.8, 
          branch.length, 
          branch.ringSegments || 8
        );
        const material = new THREE.MeshLambertMaterial({ 
          color: branch.type === 'trunk' ? 0x8B4513 : 0xA0522D 
        });
        branchMesh = new THREE.Mesh(geometry, material);
      }

      // Position and orient the mesh
      if (branch.position) {
        branchMesh.position.copy(branch.position);
      } else if (branch.origin) {
        branchMesh.position.copy(branch.origin);
      }

      if (branch.direction) {
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(up, branch.direction);
        branchMesh.quaternion.copy(quaternion);
      }

      // Apply seasonal effects
      if (seasonalEffects) {
        this.materialAnimator.animateMaterial(
          branchMesh.material, 
          this.seasonalSystem.currentSeason, 
          performance.now() / 1000
        );
      }

      treeGroup.add(branchMesh);

      // Recursively process children
      if (branch.children) {
        const childMeshes = this.generateAdvancedTreeMesh(branch.children, options);
        treeGroup.add(childMeshes);
      }
    }

    return treeGroup;
  }

  updateMesh(camera, renderer, physicsWorld = null) {
    // Update adaptive tessellation
    if (camera && renderer) {
      // This would update all branches in the scene
      console.log('Updating adaptive tessellation...');
    }

    // Update seasonal effects
    this.seasonalSystem.applySeasonalEffects(
      this.seasonalSystem.currentSeason, 
      this.seasonalSystem.currentSeason, 
      this.seasonalSystem.transitionProgress
    );
  }

  setSeason(season) {
    this.seasonalSystem.updateSeason(season);
  }

  getCurrentSeason() {
    return this.seasonalSystem.currentSeason;
  }
}

// Export individual classes for specific use cases
export {
  AdaptiveTessellationSystem,
  TreeLODManager,
  InteractionTessellation,
  NormalSmoother,
  JunctionAnalyzer,
  MetaballMeshGenerator,
  TubeMeshGenerator,
  MaterialAnimator,
  SeasonalEffectSystem
}; 