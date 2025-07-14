# Rendering: Adaptive Tessellation, Metaball/Tube Blending, Real-Time Materials

## 1. Adaptive Tessellation

### 1.1 Screen-Space Error Computation
**Step 1.1.1: Calculate Object Bounding Box**
```javascript
function computeScreenSpaceError(obj, camera, renderer) {
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
```

**Step 1.1.2: Curvature-Based Error Estimation**
```javascript
function computeCurvatureError(geometry) {
  const positions = geometry.getAttribute('position');
  const normals = geometry.getAttribute('normal');
  let totalCurvature = 0;
  
  // Calculate curvature for each vertex
  for (let i = 0; i < positions.count; i++) {
    const normal = new THREE.Vector3();
    normal.fromBufferAttribute(normals, i);
    
    // Find adjacent vertices
    const adjacent = findAdjacentVertices(geometry, i);
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
```

**Step 1.1.3: Multi-Factor Error Calculation**
```javascript
function computeMultiFactorError(obj, camera, renderer) {
  const screenError = computeScreenSpaceError(obj, camera, renderer);
  const curvatureError = computeCurvatureError(obj.geometry);
  const distanceError = computeDistanceError(obj, camera);
  const motionError = computeMotionError(obj);
  
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
```

### 1.2 Dynamic Tessellation Factor
**Step 1.2.1: Tessellation Level Calculation**
```javascript
function calculateTessellationLevel(error, thresholds) {
  if (error > thresholds.high) return 'ultra';
  if (error > thresholds.medium) return 'high';
  if (error > thresholds.low) return 'medium';
  return 'low';
}

function updateTessellationFactors(branches, camera, renderer) {
  const thresholds = {
    ultra: 100,  // pixels
    high: 50,
    medium: 20,
    low: 5
  };
  
  for (const branch of branches) {
    const error = computeMultiFactorError(branch, camera, renderer);
    const level = calculateTessellationLevel(error, thresholds);
    
    // Update tessellation parameters
    branch.tessellationLevel = level;
    branch.ringSegments = getRingSegments(level);
    branch.radialSegments = getRadialSegments(level);
    
    // Mark for regeneration if level changed
    if (branch.previousLevel !== level) {
      branch.needsRegeneration = true;
      branch.previousLevel = level;
    }
  }
}
```

**Step 1.2.2: Adaptive Ring and Radial Segments**
```javascript
function getRingSegments(level) {
  const segments = {
    ultra: 16,
    high: 12,
    medium: 8,
    low: 4
  };
  return segments[level] || 8;
}

function getRadialSegments(level) {
  const segments = {
    ultra: 32,
    high: 24,
    medium: 16,
    low: 8
  };
  return segments[level] || 16;
}
```

**Step 1.2.3: Smooth LOD Transitions**
```javascript
function smoothLODTransition(branch, targetLevel, transitionTime = 0.5) {
  const startLevel = branch.currentLevel;
  const startTime = performance.now();
  
  function interpolate() {
    const elapsed = (performance.now() - startTime) / 1000;
    const progress = Math.min(elapsed / transitionTime, 1);
    
    // Smooth interpolation
    const smoothProgress = 1 - Math.pow(1 - progress, 3);
    
    // Interpolate between levels
    branch.interpolatedLevel = interpolateLevel(startLevel, targetLevel, smoothProgress);
    
    if (progress < 1) {
      requestAnimationFrame(interpolate);
    } else {
      branch.currentLevel = targetLevel;
      branch.interpolatedLevel = null;
    }
  }
  
  interpolate();
}
```

### 1.3 LOD Switching
**Step 1.3.1: LOD Object Management**
```javascript
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
  
  updateLOD(branch, camera) {
    const lodObject = this.lodLevels.get(branch.id);
    if (!lodObject) return;
    
    const distance = camera.position.distanceTo(branch.position);
    lodObject.update(camera);
    
    // Store current LOD level for optimization
    this.currentLOD.set(branch.id, lodObject.getCurrentLevel());
  }
}
```

**Step 1.3.2: Geometry Generation for Different LODs**
```javascript
function generateGeometry(branch, level) {
  const params = getGeometryParams(level);
  
  switch (branch.type) {
    case 'trunk':
      return generateTrunkGeometry(branch, params);
    case 'branch':
      return generateBranchGeometry(branch, params);
    case 'leaf':
      return generateLeafGeometry(branch, params);
    default:
      return generateDefaultGeometry(branch, params);
  }
}

function getGeometryParams(level) {
  return {
    ultra: { rings: 16, radials: 32, smooth: true },
    high: { rings: 12, radials: 24, smooth: true },
    medium: { rings: 8, radials: 16, smooth: false },
    low: { rings: 4, radials: 8, smooth: false }
  }[level];
}
```

### 1.4 Physics-Driven Tessellation
**Step 1.4.1: Interaction Point Detection**
```javascript
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
    const intersects = ray.intersectObjects(physicsWorld.objects);
    
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
    const baseSegments = branch.ringSegments;
    const refinedSegments = Math.ceil(baseSegments * (1 + maxIntensity * 2));
    
    if (refinedSegments > branch.ringSegments) {
      branch.ringSegments = refinedSegments;
      branch.needsRegeneration = true;
    }
  }
}
```

## 2. Metaball and Tube Mesh Blending

### 2.1 Overlap Region Calculation
**Step 2.1.1: Junction Detection and Analysis**
```javascript
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
    if (branch.children.length > 1) {
      junctions.push({
        id: branch.id,
        position: branch.position,
        parent: branch,
        children: branch.children,
        parentRadius: branch.radius,
        childRadii: branch.children.map(child => child.radius)
      });
    }
    
    for (const child of branch.children) {
      this.findJunctions(child, junctions);
    }
  }
  
  calculateOverlap(junction) {
    const { parent, children } = junction;
    const overlaps = [];
    
    for (const child of children) {
      const distance = parent.position.distanceTo(child.position);
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
}
```

**Step 2.1.2: Metaball Field Generation**
```javascript
function createMetaballField(junction, overlaps) {
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
      position: overlap.child.position.clone(),
      radius: overlap.child.radius,
      strength: overlap.overlapRatio
    });
  }
  
  return field;
}
```

### 2.2 Metaball Mesh Generation
**Step 2.2.1: Marching Cubes Implementation**
```javascript
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
          const mesh = this.processCube(cube, threshold);
          
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
  
  processCube(cube, threshold) {
    // Simplified marching cubes implementation
    // In practice, use a lookup table for all 256 possible cube configurations
    const vertices = [];
    const indices = [];
    const normals = [];
    
    // Basic implementation - create vertices at cube edges where field crosses threshold
    for (let i = 0; i < 12; i++) {
      const edge = this.getEdge(i);
      const v1 = cube[edge[0]];
      const v2 = cube[edge[1]];
      
      if ((v1 > threshold) !== (v2 > threshold)) {
        const t = (threshold - v1) / (v2 - v1);
        const vertex = this.interpolateVertex(edge[0], edge[1], t);
        vertices.push(...vertex);
        
        // Calculate normal
        const normal = this.calculateNormal(edge[0], edge[1], t);
        normals.push(...normal);
      }
    }
    
    return { vertices, indices, normals };
  }
}
```

### 2.3 Tube Mesh Generation
**Step 2.3.1: Generalized Cylinder Generation**
```javascript
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
      const position = branch.position.clone().add(
        branch.direction.clone().multiplyScalar(branch.length * t)
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
```

### 2.4 Normal Smoothing
**Step 2.4.1: Vertex Normal Averaging**
```javascript
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
```

### 2.5 Material Interpolation
**Step 2.5.1: Seamless Material Blending**
```javascript
class MaterialBlender {
  constructor() {
    this.blendRadius = 0.5;
    this.blendCurve = 'smooth'; // 'linear', 'smooth', 'ease'
  }
  
  blendMaterials(parentMaterial, childMaterial, junction) {
    const blendGeometry = this.createBlendGeometry(junction);
    const blendMaterial = this.createBlendMaterial(parentMaterial, childMaterial);
    
    return new THREE.Mesh(blendGeometry, blendMaterial);
  }
  
  createBlendMaterial(parentMaterial, childMaterial) {
    const blendMaterial = new THREE.ShaderMaterial({
      uniforms: {
        parentColor: { value: parentMaterial.color },
        childColor: { value: childMaterial.color },
        parentRoughness: { value: parentMaterial.roughness || 0.5 },
        childRoughness: { value: childMaterial.roughness || 0.5 },
        blendFactor: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 parentColor;
        uniform vec3 childColor;
        uniform float parentRoughness;
        uniform float childRoughness;
        uniform float blendFactor;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          // Calculate blend factor based on position
          float distance = length(vPosition);
          float localBlend = smoothstep(0.0, 1.0, distance / blendFactor);
          
          // Interpolate colors
          vec3 color = mix(parentColor, childColor, localBlend);
          
          // Interpolate roughness
          float roughness = mix(parentRoughness, childRoughness, localBlend);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `
    });
    
    return blendMaterial;
  }
}
```

## 3. Real-Time Material and Seasonal Updates

### 3.1 Material Animation
**Step 3.1.1: Time-Based Material Animation**
```javascript
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
    
    if (material.name.includes('trunk')) {
      material.color.lerp(trunkColor, 0.01);
    } else if (material.name.includes('leaf')) {
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
    material.roughness = THREE.MathUtils.lerp(material.roughness, targetRoughness, 0.01);
  }
  
  animateMetallic(material, season, time) {
    const seasonMetallic = {
      spring: 0.0,
      summer: 0.0,
      autumn: 0.1,
      winter: 0.2
    };
    
    const targetMetallic = seasonMetallic[season] || 0.0;
    material.metallic = THREE.MathUtils.lerp(material.metallic, targetMetallic, 0.01);
  }
}
```

### 3.2 Seasonal Transitions
**Step 3.2.1: Seasonal Effect System**
```javascript
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
    // Add snow particles to tree
    const snowIntensity = newSeason === 'winter' ? progress : 1 - progress;
    
    // Update snow material properties
    this.updateSnowMaterial(snowIntensity);
    
    // Add snow accumulation
    this.addSnowAccumulation(snowIntensity);
  }
  
  applyBlossomEffect(progress) {
    // Add blossom particles
    const blossomIntensity = newSeason === 'spring' ? progress : 1 - progress;
    
    // Update blossom material
    this.updateBlossomMaterial(blossomIntensity);
    
    // Add blossom particles
    this.addBlossomParticles(blossomIntensity);
  }
  
  applyLeafFallEffect(progress) {
    // Animate leaf falling
    const fallIntensity = newSeason === 'autumn' ? progress : 1 - progress;
    
    // Update leaf physics
    this.updateLeafPhysics(fallIntensity);
    
    // Add fallen leaves
    this.addFallenLeaves(fallIntensity);
  }
}
```

### 3.3 Artist Overrides
**Step 3.3.1: Real-Time Material Control UI**
```javascript
class MaterialControlUI {
  constructor(material, container) {
    this.material = material;
    this.container = container;
    this.controls = new Map();
    
    this.createUI();
  }
  
  createUI() {
    // Color control
    this.createColorControl();
    
    // Roughness control
    this.createRoughnessControl();
    
    // Metallic control
    this.createMetallicControl();
    
    // Normal map control
    this.createNormalMapControl();
    
    // Emissive control
    this.createEmissiveControl();
  }
  
  createColorControl() {
    const colorContainer = document.createElement('div');
    colorContainer.className = 'material-control';
    
    const label = document.createElement('label');
    label.textContent = 'Color:';
    
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = '#' + this.material.color.getHexString();
    
    colorInput.addEventListener('change', (event) => {
      this.material.color.setHex(parseInt(event.target.value.substring(1), 16));
    });
    
    colorContainer.appendChild(label);
    colorContainer.appendChild(colorInput);
    this.container.appendChild(colorContainer);
    
    this.controls.set('color', colorInput);
  }
  
  createRoughnessControl() {
    const roughnessContainer = document.createElement('div');
    roughnessContainer.className = 'material-control';
    
    const label = document.createElement('label');
    label.textContent = 'Roughness:';
    
    const roughnessSlider = document.createElement('input');
    roughnessSlider.type = 'range';
    roughnessSlider.min = 0;
    roughnessSlider.max = 1;
    roughnessSlider.step = 0.01;
    roughnessSlider.value = this.material.roughness || 0.5;
    
    const valueDisplay = document.createElement('span');
    valueDisplay.textContent = roughnessSlider.value;
    
    roughnessSlider.addEventListener('input', (event) => {
      const value = parseFloat(event.target.value);
      this.material.roughness = value;
      valueDisplay.textContent = value.toFixed(2);
    });
    
    roughnessContainer.appendChild(label);
    roughnessContainer.appendChild(roughnessSlider);
    roughnessContainer.appendChild(valueDisplay);
    this.container.appendChild(roughnessContainer);
    
    this.controls.set('roughness', roughnessSlider);
  }
  
  createMetallicControl() {
    const metallicContainer = document.createElement('div');
    metallicContainer.className = 'material-control';
    
    const label = document.createElement('label');
    label.textContent = 'Metallic:';
    
    const metallicSlider = document.createElement('input');
    metallicSlider.type = 'range';
    metallicSlider.min = 0;
    metallicSlider.max = 1;
    metallicSlider.step = 0.01;
    metallicSlider.value = this.material.metallic || 0.0;
    
    const valueDisplay = document.createElement('span');
    valueDisplay.textContent = metallicSlider.value;
    
    metallicSlider.addEventListener('input', (event) => {
      const value = parseFloat(event.target.value);
      this.material.metallic = value;
      valueDisplay.textContent = value.toFixed(2);
    });
    
    metallicContainer.appendChild(label);
    metallicContainer.appendChild(metallicSlider);
    metallicContainer.appendChild(valueDisplay);
    this.container.appendChild(metallicContainer);
    
    this.controls.set('metallic', metallicSlider);
  }
  
  createNormalMapControl() {
    const normalContainer = document.createElement('div');
    normalContainer.className = 'material-control';
    
    const label = document.createElement('label');
    label.textContent = 'Normal Map Intensity:';
    
    const normalSlider = document.createElement('input');
    normalSlider.type = 'range';
    normalSlider.min = 0;
    normalSlider.max = 2;
    normalSlider.step = 0.1;
    normalSlider.value = this.material.normalScale ? this.material.normalScale.x : 1.0;
    
    const valueDisplay = document.createElement('span');
    valueDisplay.textContent = normalSlider.value;
    
    normalSlider.addEventListener('input', (event) => {
      const value = parseFloat(event.target.value);
      if (this.material.normalScale) {
        this.material.normalScale.setScalar(value);
      } else {
        this.material.normalScale = new THREE.Vector2(value, value);
      }
      valueDisplay.textContent = value.toFixed(1);
    });
    
    normalContainer.appendChild(label);
    normalContainer.appendChild(normalSlider);
    normalContainer.appendChild(valueDisplay);
    this.container.appendChild(normalContainer);
    
    this.controls.set('normalScale', normalSlider);
  }
  
  createEmissiveControl() {
    const emissiveContainer = document.createElement('div');
    emissiveContainer.className = 'material-control';
    
    const label = document.createElement('label');
    label.textContent = 'Emissive:';
    
    const emissiveColorInput = document.createElement('input');
    emissiveColorInput.type = 'color';
    emissiveColorInput.value = '#' + (this.material.emissive ? this.material.emissive.getHexString() : '000000');
    
    const emissiveIntensitySlider = document.createElement('input');
    emissiveIntensitySlider.type = 'range';
    emissiveIntensitySlider.min = 0;
    emissiveIntensitySlider.max = 1;
    emissiveIntensitySlider.step = 0.01;
    emissiveIntensitySlider.value = this.material.emissiveIntensity || 0.0;
    
    emissiveColorInput.addEventListener('change', (event) => {
      const color = new THREE.Color(event.target.value);
      this.material.emissive = color;
    });
    
    emissiveIntensitySlider.addEventListener('input', (event) => {
      const value = parseFloat(event.target.value);
      this.material.emissiveIntensity = value;
    });
    
    emissiveContainer.appendChild(label);
    emissiveContainer.appendChild(emissiveColorInput);
    emissiveContainer.appendChild(emissiveIntensitySlider);
    this.container.appendChild(emissiveContainer);
    
    this.controls.set('emissiveColor', emissiveColorInput);
    this.controls.set('emissiveIntensity', emissiveIntensitySlider);
  }
  
  updateFromMaterial() {
    // Update UI controls to reflect current material state
    const colorControl = this.controls.get('color');
    if (colorControl) {
      colorControl.value = '#' + this.material.color.getHexString();
    }
    
    const roughnessControl = this.controls.get('roughness');
    if (roughnessControl) {
      roughnessControl.value = this.material.roughness || 0.5;
    }
    
    const metallicControl = this.controls.get('metallic');
    if (metallicControl) {
      metallicControl.value = this.material.metallic || 0.0;
    }
  }
}
```

---

For more, see SYSTEM_ARCHITECTURE.md for GPU integration and GAMEPLAY.md for artist controls. 