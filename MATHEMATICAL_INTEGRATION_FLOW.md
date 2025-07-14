# Mathematical Integration Flow: Autoregressive Mesh Face Sequencing

## 1. Autoregressive Mesh Face Sequencing

### 1.1 Face Addition by Adjacency
**Step 1.1.1: Seed Face Selection**
```javascript
class AutoregressiveMeshSequencer {
  constructor() {
    this.mesh = null;
    this.faceQueue = [];
    this.processedFaces = new Set();
    this.adjacencyMap = new Map();
  }
  
  initializeSequencing(mesh, seedFaceIndex = 0) {
    this.mesh = mesh;
    this.processedFaces.clear();
    this.faceQueue = [seedFaceIndex];
    
    // Build adjacency map
    this.buildAdjacencyMap();
    
    return this;
  }
  
  buildAdjacencyMap() {
    const geometry = this.mesh.geometry;
    const indices = geometry.getIndex();
    
    for (let i = 0; i < indices.count; i += 3) {
      const faceIndex = i / 3;
      const v1 = indices.getX(i);
      const v2 = indices.getX(i + 1);
      const v3 = indices.getX(i + 2);
      
      // Store face vertices
      this.adjacencyMap.set(faceIndex, [v1, v2, v3]);
    }
  }
  
  addNextFace() {
    if (this.faceQueue.length === 0) return null;
    
    // Select face with most shared edges
    const nextFace = this.selectBestCandidate();
    
    if (nextFace !== null) {
      this.processedFaces.add(nextFace);
      this.addAdjacentFacesToQueue(nextFace);
      
      return nextFace;
    }
    
    return null;
  }
  
  selectBestCandidate() {
    let bestFace = null;
    let maxSharedEdges = -1;
    
    for (const faceIndex of this.faceQueue) {
      if (this.processedFaces.has(faceIndex)) continue;
      
      const sharedEdges = this.countSharedEdges(faceIndex);
      
      if (sharedEdges > maxSharedEdges) {
        maxSharedEdges = sharedEdges;
        bestFace = faceIndex;
      }
    }
    
    return bestFace;
  }
  
  countSharedEdges(faceIndex) {
    const faceVertices = this.adjacencyMap.get(faceIndex);
    let sharedCount = 0;
    
    for (const processedFace of this.processedFaces) {
      const processedVertices = this.adjacencyMap.get(processedFace);
      
      // Count shared vertices (edges)
      const sharedVertices = faceVertices.filter(v => 
        processedVertices.includes(v)
      );
      
      if (sharedVertices.length >= 2) {
        sharedCount++;
      }
    }
    
    return sharedCount;
  }
  
  addAdjacentFacesToQueue(faceIndex) {
    const faceVertices = this.adjacencyMap.get(faceIndex);
    
    // Find all faces that share at least one vertex
    for (const [otherFaceIndex, otherVertices] of this.adjacencyMap) {
      if (this.processedFaces.has(otherFaceIndex)) continue;
      if (this.faceQueue.includes(otherFaceIndex)) continue;
      
      const sharedVertices = faceVertices.filter(v => 
        otherVertices.includes(v)
      );
      
      if (sharedVertices.length >= 1) {
        this.faceQueue.push(otherFaceIndex);
      }
    }
  }
}
```

**Step 1.1.2: Priority-Based Face Selection**
```javascript
class PriorityFaceSelector {
  constructor() {
    this.priorityFactors = {
      adjacency: 0.4,
      curvature: 0.3,
      distance: 0.2,
      orientation: 0.1
    };
  }
  
  calculateFacePriority(faceIndex, mesh, processedFaces) {
    const adjacencyScore = this.calculateAdjacencyScore(faceIndex, processedFaces);
    const curvatureScore = this.calculateCurvatureScore(faceIndex, mesh);
    const distanceScore = this.calculateDistanceScore(faceIndex, mesh);
    const orientationScore = this.calculateOrientationScore(faceIndex, mesh);
    
    const priority = 
      adjacencyScore * this.priorityFactors.adjacency +
      curvatureScore * this.priorityFactors.curvature +
      distanceScore * this.priorityFactors.distance +
      orientationScore * this.priorityFactors.orientation;
    
    return priority;
  }
  
  calculateAdjacencyScore(faceIndex, processedFaces) {
    const sharedEdges = this.countSharedEdges(faceIndex, processedFaces);
    return Math.min(sharedEdges / 3, 1.0); // Normalize to [0,1]
  }
  
  calculateCurvatureScore(faceIndex, mesh) {
    const geometry = mesh.geometry;
    const positions = geometry.getAttribute('position');
    const normals = geometry.getAttribute('normal');
    const indices = geometry.getIndex();
    
    const faceVertices = [
      indices.getX(faceIndex * 3),
      indices.getX(faceIndex * 3 + 1),
      indices.getX(faceIndex * 3 + 2)
    ];
    
    let totalCurvature = 0;
    
    for (const vertexIndex of faceVertices) {
      const normal = new THREE.Vector3();
      normal.fromBufferAttribute(normals, vertexIndex);
      
      // Find adjacent vertices and calculate curvature
      const adjacent = this.findAdjacentVertices(geometry, vertexIndex);
      let vertexCurvature = 0;
      
      for (const adjIndex of adjacent) {
        const adjNormal = new THREE.Vector3();
        adjNormal.fromBufferAttribute(normals, adjIndex);
        vertexCurvature += 1 - normal.dot(adjNormal);
      }
      
      totalCurvature += vertexCurvature / adjacent.length;
    }
    
    return Math.min(totalCurvature / faceVertices.length, 1.0);
  }
  
  calculateDistanceScore(faceIndex, mesh) {
    const geometry = mesh.geometry;
    const positions = geometry.getAttribute('position');
    const indices = geometry.getIndex();
    
    const faceVertices = [
      indices.getX(faceIndex * 3),
      indices.getX(faceIndex * 3 + 1),
      indices.getX(faceIndex * 3 + 2)
    ];
    
    // Calculate face center
    const center = new THREE.Vector3();
    for (const vertexIndex of faceVertices) {
      const position = new THREE.Vector3();
      position.fromBufferAttribute(positions, vertexIndex);
      center.add(position);
    }
    center.divideScalar(faceVertices.length);
    
    // Distance from origin (or reference point)
    const distance = center.length();
    return Math.max(0, 1 - distance / 10); // Normalize to [0,1]
  }
  
  calculateOrientationScore(faceIndex, mesh) {
    const geometry = mesh.geometry;
    const normals = geometry.getAttribute('normal');
    const indices = geometry.getIndex();
    
    // Calculate face normal
    const faceNormal = new THREE.Vector3();
    for (let i = 0; i < 3; i++) {
      const vertexIndex = indices.getX(faceIndex * 3 + i);
      const normal = new THREE.Vector3();
      normal.fromBufferAttribute(normals, vertexIndex);
      faceNormal.add(normal);
    }
    faceNormal.normalize();
    
    // Score based on alignment with up vector
    const upVector = new THREE.Vector3(0, 1, 0);
    const alignment = Math.abs(faceNormal.dot(upVector));
    
    return alignment;
  }
}
```

### 1.2 Triangle Adjacency Maintenance
**Step 1.2.1: Half-Edge Data Structure**
```javascript
class HalfEdgeDataStructure {
  constructor() {
    this.vertices = new Map();
    this.edges = new Map();
    this.faces = new Map();
    this.halfEdges = new Map();
  }
  
  buildFromGeometry(geometry) {
    const positions = geometry.getAttribute('position');
    const indices = geometry.getIndex();
    
    // Create vertices
    for (let i = 0; i < positions.count; i++) {
      const position = new THREE.Vector3();
      position.fromBufferAttribute(positions, i);
      this.vertices.set(i, {
        position: position,
        halfEdge: null
      });
    }
    
    // Create faces and half-edges
    for (let i = 0; i < indices.count; i += 3) {
      const faceIndex = i / 3;
      const v1 = indices.getX(i);
      const v2 = indices.getX(i + 1);
      const v3 = indices.getX(i + 2);
      
      this.createFace(faceIndex, v1, v2, v3);
    }
    
    // Link half-edges
    this.linkHalfEdges();
  }
  
  createFace(faceIndex, v1, v2, v3) {
    // Create half-edges for this face
    const he1 = this.createHalfEdge(v1, v2, faceIndex);
    const he2 = this.createHalfEdge(v2, v3, faceIndex);
    const he3 = this.createHalfEdge(v3, v1, faceIndex);
    
    // Link half-edges within face
    he1.next = he2;
    he2.next = he3;
    he3.next = he1;
    
    // Store face
    this.faces.set(faceIndex, {
      halfEdge: he1
    });
    
    // Link vertices to half-edges
    this.vertices.get(v1).halfEdge = he1;
    this.vertices.get(v2).halfEdge = he2;
    this.vertices.get(v3).halfEdge = he3;
  }
  
  createHalfEdge(origin, target, face) {
    const halfEdge = {
      origin: origin,
      target: target,
      face: face,
      next: null,
      twin: null,
      id: this.halfEdges.size
    };
    
    this.halfEdges.set(halfEdge.id, halfEdge);
    
    // Store edge reference
    const edgeKey = `${Math.min(origin, target)}-${Math.max(origin, target)}`;
    if (!this.edges.has(edgeKey)) {
      this.edges.set(edgeKey, []);
    }
    this.edges.get(edgeKey).push(halfEdge);
    
    return halfEdge;
  }
  
  linkHalfEdges() {
    // Find twin half-edges
    for (const [edgeKey, halfEdges] of this.edges) {
      if (halfEdges.length === 2) {
        halfEdges[0].twin = halfEdges[1];
        halfEdges[1].twin = halfEdges[0];
      }
    }
  }
  
  getAdjacentFaces(faceIndex) {
    const face = this.faces.get(faceIndex);
    if (!face) return [];
    
    const adjacentFaces = new Set();
    let currentHE = face.halfEdge;
    
    do {
      if (currentHE.twin) {
        adjacentFaces.add(currentHE.twin.face);
      }
      currentHE = currentHE.next;
    } while (currentHE !== face.halfEdge);
    
    return Array.from(adjacentFaces);
  }
  
  getFaceVertices(faceIndex) {
    const face = this.faces.get(faceIndex);
    if (!face) return [];
    
    const vertices = [];
    let currentHE = face.halfEdge;
    
    do {
      vertices.push(currentHE.origin);
      currentHE = currentHE.next;
    } while (currentHE !== face.halfEdge);
    
    return vertices;
  }
  
  addFace(vertices) {
    const faceIndex = this.faces.size;
    this.createFace(faceIndex, vertices[0], vertices[1], vertices[2]);
    this.linkHalfEdges();
    return faceIndex;
  }
}
```

**Step 1.2.2: Winged-Edge Data Structure**
```javascript
class WingedEdgeDataStructure {
  constructor() {
    this.vertices = new Map();
    this.edges = new Map();
    this.faces = new Map();
  }
  
  buildFromGeometry(geometry) {
    const positions = geometry.getAttribute('position');
    const indices = geometry.getIndex();
    
    // Create vertices
    for (let i = 0; i < positions.count; i++) {
      const position = new THREE.Vector3();
      position.fromBufferAttribute(positions, i);
      this.vertices.set(i, {
        position: position,
        edge: null
      });
    }
    
    // Create faces and edges
    for (let i = 0; i < indices.count; i += 3) {
      const faceIndex = i / 3;
      const v1 = indices.getX(i);
      const v2 = indices.getX(i + 1);
      const v3 = indices.getX(i + 2);
      
      this.createFace(faceIndex, v1, v2, v3);
    }
  }
  
  createFace(faceIndex, v1, v2, v3) {
    // Create edges
    const e1 = this.createEdge(v1, v2, faceIndex);
    const e2 = this.createEdge(v2, v3, faceIndex);
    const e3 = this.createEdge(v3, v1, faceIndex);
    
    // Store face
    this.faces.set(faceIndex, {
      edge: e1
    });
    
    // Link vertices to edges
    this.vertices.get(v1).edge = e1;
    this.vertices.get(v2).edge = e2;
    this.vertices.get(v3).edge = e3;
  }
  
  createEdge(v1, v2, face) {
    const edgeKey = `${Math.min(v1, v2)}-${Math.max(v1, v2)}`;
    
    if (this.edges.has(edgeKey)) {
      // Edge already exists, link to existing edge
      const existingEdge = this.edges.get(edgeKey);
      existingEdge.face2 = face;
      return existingEdge;
    } else {
      // Create new edge
      const edge = {
        vertex1: v1,
        vertex2: v2,
        face1: face,
        face2: null,
        edge1CW: null,
        edge1CCW: null,
        edge2CW: null,
        edge2CCW: null
      };
      
      this.edges.set(edgeKey, edge);
      return edge;
    }
  }
  
  getAdjacentFaces(faceIndex) {
    const face = this.faces.get(faceIndex);
    if (!face) return [];
    
    const adjacentFaces = new Set();
    let currentEdge = face.edge;
    
    do {
      if (currentEdge.face1 === faceIndex && currentEdge.face2 !== null) {
        adjacentFaces.add(currentEdge.face2);
      } else if (currentEdge.face2 === faceIndex && currentEdge.face1 !== null) {
        adjacentFaces.add(currentEdge.face1);
      }
      
      // Find next edge in face
      currentEdge = this.findNextEdgeInFace(currentEdge, faceIndex);
    } while (currentEdge !== face.edge);
    
    return Array.from(adjacentFaces);
  }
  
  findNextEdgeInFace(edge, faceIndex) {
    // Find the next edge that shares a vertex and belongs to the same face
    const currentVertex = edge.face1 === faceIndex ? edge.vertex2 : edge.vertex1;
    
    for (const [edgeKey, otherEdge] of this.edges) {
      if (otherEdge === edge) continue;
      
      if ((otherEdge.face1 === faceIndex || otherEdge.face2 === faceIndex) &&
          (otherEdge.vertex1 === currentVertex || otherEdge.vertex2 === currentVertex)) {
        return otherEdge;
      }
    }
    
    return edge; // Fallback
  }
}
```

### 1.3 Normal Orientation Enforcement
**Step 1.3.1: Normal Consistency Check**
```javascript
class NormalOrientationEnforcer {
  constructor() {
    this.orientationMap = new Map();
    this.flippedFaces = new Set();
  }
  
  enforceConsistentOrientation(mesh) {
    const geometry = mesh.geometry;
    const indices = geometry.getIndex();
    const normals = geometry.getAttribute('normal');
    
    // Start with first face as reference
    const referenceFace = 0;
    this.orientationMap.set(referenceFace, true); // true = correct orientation
    
    // Process all faces
    for (let i = 0; i < indices.count; i += 3) {
      const faceIndex = i / 3;
      if (faceIndex === referenceFace) continue;
      
      this.checkAndFixOrientation(faceIndex, geometry);
    }
    
    // Apply corrections
    this.applyOrientationCorrections(geometry);
  }
  
  checkAndFixOrientation(faceIndex, geometry) {
    const indices = geometry.getIndex();
    const normals = geometry.getAttribute('normal');
    
    const v1 = indices.getX(faceIndex * 3);
    const v2 = indices.getX(faceIndex * 3 + 1);
    const v3 = indices.getX(faceIndex * 3 + 2);
    
    // Calculate face normal
    const pos1 = new THREE.Vector3();
    const pos2 = new THREE.Vector3();
    const pos3 = new THREE.Vector3();
    
    pos1.fromBufferAttribute(geometry.getAttribute('position'), v1);
    pos2.fromBufferAttribute(geometry.getAttribute('position'), v2);
    pos3.fromBufferAttribute(geometry.getAttribute('position'), v3);
    
    const edge1 = pos2.clone().sub(pos1);
    const edge2 = pos3.clone().sub(pos1);
    const faceNormal = edge1.cross(edge2).normalize();
    
    // Calculate average vertex normal
    const avgNormal = new THREE.Vector3();
    avgNormal.fromBufferAttribute(normals, v1);
    avgNormal.add(new THREE.Vector3().fromBufferAttribute(normals, v2));
    avgNormal.add(new THREE.Vector3().fromBufferAttribute(normals, v3));
    avgNormal.divideScalar(3).normalize();
    
    // Check if face normal aligns with vertex normals
    const alignment = faceNormal.dot(avgNormal);
    
    if (alignment < 0) {
      // Face needs to be flipped
      this.flippedFaces.add(faceIndex);
      this.orientationMap.set(faceIndex, false);
    } else {
      this.orientationMap.set(faceIndex, true);
    }
  }
  
  applyOrientationCorrections(geometry) {
    const indices = geometry.getIndex();
    const indexArray = indices.array;
    
    for (const faceIndex of this.flippedFaces) {
      const baseIndex = faceIndex * 3;
      
      // Swap two vertices to flip face orientation
      const temp = indexArray[baseIndex + 1];
      indexArray[baseIndex + 1] = indexArray[baseIndex + 2];
      indexArray[baseIndex + 2] = temp;
    }
    
    indices.needsUpdate = true;
    
    // Recalculate normals
    geometry.computeVertexNormals();
  }
  
  propagateOrientationCorrections(mesh) {
    const geometry = mesh.geometry;
    const indices = geometry.getIndex();
    const processedFaces = new Set();
    const queue = [0]; // Start with first face
    
    while (queue.length > 0) {
      const faceIndex = queue.shift();
      if (processedFaces.has(faceIndex)) continue;
      
      processedFaces.add(faceIndex);
      
      // Get adjacent faces
      const adjacentFaces = this.getAdjacentFaces(faceIndex, geometry);
      
      for (const adjFace of adjacentFaces) {
        if (processedFaces.has(adjFace)) continue;
        
        // Check if adjacent face needs orientation correction
        if (this.needsOrientationCorrection(faceIndex, adjFace, geometry)) {
          this.flippedFaces.add(adjFace);
          this.orientationMap.set(adjFace, false);
        } else {
          this.orientationMap.set(adjFace, true);
        }
        
        queue.push(adjFace);
      }
    }
  }
  
  getAdjacentFaces(faceIndex, geometry) {
    const indices = geometry.getIndex();
    const faceVertices = [
      indices.getX(faceIndex * 3),
      indices.getX(faceIndex * 3 + 1),
      indices.getX(faceIndex * 3 + 2)
    ];
    
    const adjacentFaces = new Set();
    
    // Find faces that share edges
    for (let i = 0; i < indices.count; i += 3) {
      const otherFaceIndex = i / 3;
      if (otherFaceIndex === faceIndex) continue;
      
      const otherVertices = [
        indices.getX(i),
        indices.getX(i + 1),
        indices.getX(i + 2)
      ];
      
      // Check for shared edges
      const sharedEdges = this.countSharedEdges(faceVertices, otherVertices);
      if (sharedEdges >= 2) {
        adjacentFaces.add(otherFaceIndex);
      }
    }
    
    return Array.from(adjacentFaces);
  }
  
  countSharedEdges(vertices1, vertices2) {
    let shared = 0;
    for (const v1 of vertices1) {
      if (vertices2.includes(v1)) {
        shared++;
      }
    }
    return shared;
  }
  
  needsOrientationCorrection(face1, face2, geometry) {
    const indices = geometry.getIndex();
    
    const vertices1 = [
      indices.getX(face1 * 3),
      indices.getX(face1 * 3 + 1),
      indices.getX(face1 * 3 + 2)
    ];
    
    const vertices2 = [
      indices.getX(face2 * 3),
      indices.getX(face2 * 3 + 1),
      indices.getX(face2 * 3 + 2)
    ];
    
    // Find shared edge
    const sharedVertices = vertices1.filter(v => vertices2.includes(v));
    if (sharedVertices.length < 2) return false;
    
    // Check if shared edge has opposite orientation
    const v1 = sharedVertices[0];
    const v2 = sharedVertices[1];
    
    const edge1Order = this.getEdgeOrder(vertices1, v1, v2);
    const edge2Order = this.getEdgeOrder(vertices2, v1, v2);
    
    return edge1Order !== edge2Order;
  }
  
  getEdgeOrder(vertices, v1, v2) {
    for (let i = 0; i < vertices.length; i++) {
      if (vertices[i] === v1) {
        const next = vertices[(i + 1) % vertices.length];
        return next === v2 ? 'forward' : 'backward';
      }
    }
    return 'unknown';
  }
}
```

### 1.4 Point Cloud/Sketch Mapping
**Step 1.4.1: Point Cloud to Mesh Mapping**
```javascript
class PointCloudMapper {
  constructor() {
    this.pointCloud = [];
    this.mesh = null;
    this.mapping = new Map();
  }
  
  setPointCloud(points) {
    this.pointCloud = points.map(p => new THREE.Vector3(p.x, p.y, p.z));
  }
  
  setMesh(mesh) {
    this.mesh = mesh;
  }
  
  mapPointsToFaces() {
    const geometry = this.mesh.geometry;
    const positions = geometry.getAttribute('position');
    const indices = geometry.getIndex();
    
    for (let i = 0; i < this.pointCloud.length; i++) {
      const point = this.pointCloud[i];
      const closestFace = this.findClosestFace(point, geometry);
      
      this.mapping.set(i, {
        point: point,
        face: closestFace,
        barycentric: this.calculateBarycentric(point, closestFace, geometry)
      });
    }
    
    return this.mapping;
  }
  
  findClosestFace(point, geometry) {
    const positions = geometry.getAttribute('position');
    const indices = geometry.getIndex();
    
    let closestFace = 0;
    let minDistance = Infinity;
    
    for (let i = 0; i < indices.count; i += 3) {
      const faceIndex = i / 3;
      const v1 = indices.getX(i);
      const v2 = indices.getX(i + 1);
      const v3 = indices.getX(i + 2);
      
      const pos1 = new THREE.Vector3();
      const pos2 = new THREE.Vector3();
      const pos3 = new THREE.Vector3();
      
      pos1.fromBufferAttribute(positions, v1);
      pos2.fromBufferAttribute(positions, v2);
      pos3.fromBufferAttribute(positions, v3);
      
      const distance = this.pointToTriangleDistance(point, pos1, pos2, pos3);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestFace = faceIndex;
      }
    }
    
    return closestFace;
  }
  
  pointToTriangleDistance(point, v1, v2, v3) {
    // Calculate closest point on triangle
    const closestPoint = this.closestPointOnTriangle(point, v1, v2, v3);
    return point.distanceTo(closestPoint);
  }
  
  closestPointOnTriangle(point, v1, v2, v3) {
    const edge1 = v2.clone().sub(v1);
    const edge2 = v3.clone().sub(v1);
    const normal = edge1.cross(edge2).normalize();
    
    // Project point onto triangle plane
    const toPoint = point.clone().sub(v1);
    const distance = toPoint.dot(normal);
    const projectedPoint = point.clone().sub(normal.clone().multiplyScalar(distance));
    
    // Check if projected point is inside triangle
    const barycentric = this.calculateBarycentric(projectedPoint, v1, v2, v3);
    
    if (barycentric.x >= 0 && barycentric.y >= 0 && barycentric.z >= 0) {
      return projectedPoint;
    } else {
      // Find closest point on triangle edges
      const closestOnEdge1 = this.closestPointOnLineSegment(projectedPoint, v1, v2);
      const closestOnEdge2 = this.closestPointOnLineSegment(projectedPoint, v2, v3);
      const closestOnEdge3 = this.closestPointOnLineSegment(projectedPoint, v3, v1);
      
      const dist1 = projectedPoint.distanceTo(closestOnEdge1);
      const dist2 = projectedPoint.distanceTo(closestOnEdge2);
      const dist3 = projectedPoint.distanceTo(closestOnEdge3);
      
      if (dist1 <= dist2 && dist1 <= dist3) return closestOnEdge1;
      if (dist2 <= dist1 && dist2 <= dist3) return closestOnEdge2;
      return closestOnEdge3;
    }
  }
  
  closestPointOnLineSegment(point, lineStart, lineEnd) {
    const line = lineEnd.clone().sub(lineStart);
    const t = point.clone().sub(lineStart).dot(line) / line.dot(line);
    const clampedT = Math.max(0, Math.min(1, t));
    
    return lineStart.clone().add(line.clone().multiplyScalar(clampedT));
  }
  
  calculateBarycentric(point, v1, v2, v3) {
    const edge1 = v2.clone().sub(v1);
    const edge2 = v3.clone().sub(v1);
    const toPoint = point.clone().sub(v1);
    
    const d00 = edge1.dot(edge1);
    const d01 = edge1.dot(edge2);
    const d11 = edge2.dot(edge2);
    const d20 = toPoint.dot(edge1);
    const d21 = toPoint.dot(edge2);
    
    const denom = d00 * d11 - d01 * d01;
    const v = (d11 * d20 - d01 * d21) / denom;
    const w = (d00 * d21 - d01 * d20) / denom;
    const u = 1.0 - v - w;
    
    return new THREE.Vector3(u, v, w);
  }
  
  resolveAmbiguities() {
    const facePointCounts = new Map();
    
    // Count points per face
    for (const [pointIndex, mapping] of this.mapping) {
      const face = mapping.face;
      if (!facePointCounts.has(face)) {
        facePointCounts.set(face, []);
      }
      facePointCounts.get(face).push(pointIndex);
    }
    
    // Resolve conflicts for faces with multiple points
    for (const [face, pointIndices] of facePointCounts) {
      if (pointIndices.length > 1) {
        this.resolveFaceConflict(face, pointIndices);
      }
    }
  }
  
  resolveFaceConflict(face, pointIndices) {
    const geometry = this.mesh.geometry;
    const positions = geometry.getAttribute('position');
    const indices = geometry.getIndex();
    
    const v1 = indices.getX(face * 3);
    const v2 = indices.getX(face * 3 + 1);
    const v3 = indices.getX(face * 3 + 2);
    
    const pos1 = new THREE.Vector3();
    const pos2 = new THREE.Vector3();
    const pos3 = new THREE.Vector3();
    
    pos1.fromBufferAttribute(positions, v1);
    pos2.fromBufferAttribute(positions, v2);
    pos3.fromBufferAttribute(positions, v3);
    
    // Find best point for this face based on barycentric coordinates
    let bestPointIndex = pointIndices[0];
    let bestBarycentric = this.mapping.get(bestPointIndex).barycentric;
    
    for (const pointIndex of pointIndices) {
      const mapping = this.mapping.get(pointIndex);
      const barycentric = mapping.barycentric;
      
      // Prefer points closer to face center
      const centerDistance = Math.abs(barycentric.x - 1/3) + 
                           Math.abs(barycentric.y - 1/3) + 
                           Math.abs(barycentric.z - 1/3);
      
      const bestCenterDistance = Math.abs(bestBarycentric.x - 1/3) + 
                               Math.abs(bestBarycentric.y - 1/3) + 
                               Math.abs(bestBarycentric.z - 1/3);
      
      if (centerDistance < bestCenterDistance) {
        bestPointIndex = pointIndex;
        bestBarycentric = barycentric;
      }
    }
    
    // Reassign other points to adjacent faces
    for (const pointIndex of pointIndices) {
      if (pointIndex !== bestPointIndex) {
        const mapping = this.mapping.get(pointIndex);
        const newFace = this.findAlternativeFace(mapping.point, face, geometry);
        mapping.face = newFace;
        mapping.barycentric = this.calculateBarycentric(mapping.point, newFace, geometry);
      }
    }
  }
  
  findAlternativeFace(point, excludeFace, geometry) {
    const positions = geometry.getAttribute('position');
    const indices = geometry.getIndex();
    
    let bestFace = excludeFace;
    let minDistance = Infinity;
    
    for (let i = 0; i < indices.count; i += 3) {
      const faceIndex = i / 3;
      if (faceIndex === excludeFace) continue;
      
      const v1 = indices.getX(i);
      const v2 = indices.getX(i + 1);
      const v3 = indices.getX(i + 2);
      
      const pos1 = new THREE.Vector3();
      const pos2 = new THREE.Vector3();
      const pos3 = new THREE.Vector3();
      
      pos1.fromBufferAttribute(positions, v1);
      pos2.fromBufferAttribute(positions, v2);
      pos3.fromBufferAttribute(positions, v3);
      
      const distance = this.pointToTriangleDistance(point, pos1, pos2, pos3);
      
      if (distance < minDistance) {
        minDistance = distance;
        bestFace = faceIndex;
      }
    }
    
    return bestFace;
  }
}
```

---

For more, see SYSTEM_ARCHITECTURE.md for node graph context and RENDERING.md for mesh blending. 