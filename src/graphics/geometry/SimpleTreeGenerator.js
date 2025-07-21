// Simple, robust procedural tree generator (step-by-step rebuild)
// Step 1: Minimal TreeOptions and Branch classes

import { MarchingCubes } from './MarchingCubes.js';

export class TreeOptions {
    constructor({
        levels = 2,
        angle = 30,
        length = 10,
        children = 2,
        radius = 1
    } = {}) {
        this.levels = levels;
        this.angle = angle; // degrees
        this.length = length;
        this.children = children;
        this.radius = radius;
    }
}

export class Branch {
    constructor({
        origin = { x: 0, y: 0, z: 0 },
        direction = { x: 0, y: 1, z: 0 },
        length = 10,
        radius = 1,
        level = 0
    } = {}) {
        this.origin = { ...origin };
        this.direction = { ...direction };
        this.length = length;
        this.radius = radius;
        this.level = level;
        this.children = [];
    }
}

// Step 1 Test/Validation
export function testStep1() {
    const opts = new TreeOptions({ levels: 3, angle: 45, length: 12, children: 3, radius: 2 });
    const branch = new Branch({ origin: { x: 1, y: 2, z: 3 }, direction: { x: 0, y: 1, z: 0 }, length: 5, radius: 0.5, level: 1 });
    console.log('TreeOptions:', opts);
    console.log('Branch:', branch);
    return { opts, branch };
}

// Step 2: Recursive branch generation
export function generateTreeRecursive(options, parent, level = 0, randomness = 1) {
    if (level >= options.levels) return;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5°
    for (let i = 0; i < options.children; i++) {
        // Allometric scaling: less aggressive
        const heightFrac = level / Math.max(1, options.levels - 1);
        const baseLength = options.length * (1 - 0.2 * heightFrac);
        const baseRadius = options.radius * (1 - 0.3 * heightFrac);
        // Branch angle: lower = more drooping, upper = more upward
        let minAngle, maxAngle;
        if (heightFrac < 0.3) {
            minAngle = Math.PI * 110 / 180;
            maxAngle = Math.PI * 140 / 180;
        } else if (heightFrac > 0.7) {
            minAngle = Math.PI * 40 / 180; // more upward
            maxAngle = Math.PI * 80 / 180;
        } else {
            minAngle = Math.PI * 70 / 180;
            maxAngle = Math.PI * 110 / 180;
        }
        const phi = minAngle + (maxAngle - minAngle) * Math.random() * randomness;
        // Golden angle for azimuth
        const theta = i * goldenAngle + (Math.random() - 0.5) * 0.2 * randomness;
        // Spherical direction
        let dir = sphericalDirection(parent.direction, theta, phi);
        // Tropism: stronger upward bias for upper branches
        let upwardBias = 0.15 + 0.1 * Math.random() * randomness;
        if (heightFrac > 0.7) upwardBias += (0.2 + 0.2 * Math.random()) * randomness;
        dir.y += upwardBias;
        // Small random upward kick for all branches
        dir.y += (Math.random() - 0.5) * 0.1 * randomness;
        // More randomness
        dir.x += (Math.random() - 0.5) * 0.1 * randomness;
        dir.z += (Math.random() - 0.5) * 0.1 * randomness;
        // Normalize
        const len = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z) || 1;
        dir = { x: dir.x / len, y: dir.y / len, z: dir.z / len };
        const child = new Branch({
            origin: {
                x: parent.origin.x + parent.direction.x * parent.length,
                y: parent.origin.y + parent.direction.y * parent.length,
                z: parent.origin.z + parent.direction.z * parent.length
            },
            direction: dir,
            length: baseLength,
            radius: baseRadius,
            level: level + 1
        });
        parent.children.push(child);
        generateTreeRecursive(options, child, level + 1, randomness);
    }
}

// Utility: create a direction vector from spherical coordinates
export function sphericalDirection(parentDir, theta, phi) {
    // theta: azimuth (0 = x+, pi/2 = z+), phi: elevation (0 = up, pi = down)
    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.cos(phi);
    const z = Math.sin(phi) * Math.sin(theta);
    // Optionally rotate relative to parentDir (for more realism)
    // For now, just use global axes
    const len = Math.sqrt(x * x + y * y + z * z) || 1;
    return { x: x / len, y: y / len, z: z / len };
}

// Step 2 Test/Validation
export function testStep2() {
    const opts = new TreeOptions({ levels: 3, angle: 45, length: 10, children: 2, radius: 1 });
    const root = new Branch({ origin: { x: 0, y: 0, z: 0 }, direction: { x: 0, y: 1, z: 0 }, length: opts.length, radius: opts.radius, level: 0 });
    generateTreeRecursive(opts, root, 0, 1);
    return { opts, root };
}

// Step 3: Path extraction
export function extractSegments(branch, segments = []) {
    for (const child of branch.children) {
        segments.push({
            start: { ...branch.origin },
            end: {
                x: branch.origin.x + branch.direction.x * branch.length,
                y: branch.origin.y + branch.direction.y * branch.length,
                z: branch.origin.z + branch.direction.z * branch.length
            }
        });
        extractSegments(child, segments);
    }
    return segments;
}

// Step 3 Test/Validation
export function testStep3() {
    const opts = new TreeOptions({ levels: 3, angle: 45, length: 10, children: 3, radius: 1 });
    const root = new Branch({ origin: { x: 0, y: 0, z: 0 }, direction: { x: 0, y: 1, z: 0 }, length: opts.length, radius: opts.radius, level: 0 });
    generateTreeRecursive(opts, root, 0, 1);
    const segments = extractSegments(root);
    return { opts, root, segments };
}

// Helper: Generate metaball mesh at a branch split using Three.js MarchingCubes
function generateMetaballMesh(branch, THREE, options = {}) {
    // Gather metaball centers and radii: parent end and each child start
    const metaballs = [];
    const parentEnd = {
        x: branch.origin.x + branch.direction.x * branch.length,
        y: branch.origin.y + branch.direction.y * branch.length,
        z: branch.origin.z + branch.direction.z * branch.length
    };
    const parentRadius = branch.radius || 1;
    metaballs.push({
        center: parentEnd,
        radius: parentRadius,
        direction: branch.direction
    });
    for (const child of branch.children) {
        metaballs.push({
            center: child.origin,
            radius: child.radius || 1,
            direction: child.direction
        });
    }
    // Compute grid bounds
    let min = { x: Infinity, y: Infinity, z: Infinity };
    let max = { x: -Infinity, y: -Infinity, z: -Infinity };
    for (const m of metaballs) {
        min.x = Math.min(min.x, m.center.x - m.radius * 2);
        min.y = Math.min(min.y, m.center.y - m.radius * 2);
        min.z = Math.min(min.z, m.center.z - m.radius * 2);
        max.x = Math.max(max.x, m.center.x + m.radius * 2);
        max.y = Math.max(max.y, m.center.y + m.radius * 2);
        max.z = Math.max(max.z, m.center.z + m.radius * 2);
    }
    // MarchingCubes setup
    const resolution = 64; // Higher = smoother
    const material = new THREE.MeshLambertMaterial({ color: 0xcccc99, transparent: true, opacity: 0.7 });
    const effect = new MarchingCubes(resolution, material, true, true);
    effect.isolation = 80; // Adjust for threshold
    effect.position.set((min.x + max.x) / 2, (min.y + max.y) / 2, (min.z + max.z) / 2);
    effect.scale.set(max.x - min.x, max.y - min.y, max.z - min.z);
    effect.reset();
    // Add metaballs
    for (const m of metaballs) {
        effect.addBall(
            (m.center.x - min.x) / (max.x - min.x),
            (m.center.y - min.y) / (max.y - min.y),
            (m.center.z - min.z) / (max.z - min.z),
            m.radius / (max.x - min.x),
            1 // strength
        );
    }
    return effect;
}

// Recursively add metaball meshes at every branch split
function addMetaballMeshesRecursive(branch, THREE, group) {
    if (branch.children && branch.children.length > 0) {
        const metaballMesh = generateMetaballMesh(branch, THREE);
        if (metaballMesh) group.add(metaballMesh);
        for (const child of branch.children) {
            addMetaballMeshesRecursive(child, THREE, group);
        }
    }
}

// Step 4: Mesh Generation with Three.js
export function generateTreeMesh(segments, options = {}, THREE) {
    if (!THREE) {
        console.warn('Three.js not available for mesh generation');
        return null;
    }
    const {
        trunkColor = 0x8B4513,
        branchColor = 0xA0522D,
        leafColor = 0x228B22,
        trunkRadius = 1.0,
        branchRadiusFactor = 0.7,
        leafSize = 2.0,
        addLeaves = true,
        ringSegments = 24,
        smoothNormals = true,
        pathSteps = 24,
        root = null // pass the actual tree root for metaball traversal
    } = options;
    const group = new THREE.Group();
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: trunkColor, roughness: 0.7, metalness: 0.2 });
    const branchMaterial = new THREE.MeshStandardMaterial({ color: branchColor, roughness: 0.8, metalness: 0.1 });
    const leafMaterial = new THREE.MeshLambertMaterial({ 
        color: leafColor,
        transparent: true,
        alphaTest: 0.5
    });
    // Add metaball meshes at every branch split
    if (root) {
        addMetaballMeshesRecursive(root, THREE, group);
    }
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const isTrunk = i === 0;
        const radius = isTrunk ? trunkRadius : trunkRadius * branchRadiusFactor * Math.pow(0.8, segment.level || 1);
        const p0 = segment.start;
        const p3 = segment.end;
        const parentDir = segment.parentDir || { x: p3.x - p0.x, y: p3.y - p0.y, z: p3.z - p0.z };
        const childDir = segment.childDir || { x: p3.x - p0.x, y: p3.y - p0.y, z: p3.z - p0.z };
        const segLen = Math.sqrt((p3.x-p0.x)**2 + (p3.y-p0.y)**2 + (p3.z-p0.z)**2);
        const p1 = {
            x: p0.x + parentDir.x * (segLen * 0.3),
            y: p0.y + parentDir.y * (segLen * 0.3),
            z: p0.z + parentDir.z * (segLen * 0.3)
        };
        const p2 = {
            x: p3.x - childDir.x * (segLen * 0.3),
            y: p3.y - childDir.y * (segLen * 0.3),
            z: p3.z - childDir.z * (segLen * 0.3)
        };
        const tipRadius = radius * 0.5;
        const geometry = generateTubeMeshBezier([p0, p1, p2, p3], radius, tipRadius, ringSegments, pathSteps, smoothNormals, THREE);
        if (geometry) {
            const mesh = new THREE.Mesh(geometry, isTrunk ? trunkMaterial : branchMaterial);
            group.add(mesh);
        }
    }
    if (addLeaves) {
        const leafPositions = findLeafPositions(segments);
        for (const pos of leafPositions) {
            const leafMesh = generateLeafMesh(pos, leafSize, THREE);
            if (leafMesh) {
                leafMesh.material = leafMaterial;
                group.add(leafMesh);
            }
        }
    }
    return group;
}

// Helper: Generate a smooth tube mesh for a branch segment by sweeping a ring along a cubic Bézier curve
function generateTubeMeshBezier(curvePoints, baseRadius, tipRadius, ringSegments, pathSteps, smoothNormals, THREE) {
    // curvePoints: [p0, p1, p2, p3] (cubic Bézier)
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const normals = [];
    const indices = [];
    const ringCount = pathSteps + 1;
    // Sample points along the curve
    for (let i = 0; i < ringCount; ++i) {
        const t = i / (ringCount - 1);
        // Cubic Bézier interpolation
        const u = 1 - t;
        const pt = {
            x: u*u*u*curvePoints[0].x + 3*u*u*t*curvePoints[1].x + 3*u*t*t*curvePoints[2].x + t*t*t*curvePoints[3].x,
            y: u*u*u*curvePoints[0].y + 3*u*u*t*curvePoints[1].y + 3*u*t*t*curvePoints[2].y + t*t*t*curvePoints[3].y,
            z: u*u*u*curvePoints[0].z + 3*u*u*t*curvePoints[1].z + 3*u*t*t*curvePoints[2].z + t*t*t*curvePoints[3].z
        };
        // Tangent for orientation
        const dt = 0.001;
        const t1 = Math.max(0, t - dt), t2 = Math.min(1, t + dt);
        const u1 = 1 - t1, u2 = 1 - t2;
        const pt1 = {
            x: u1*u1*u1*curvePoints[0].x + 3*u1*u1*t1*curvePoints[1].x + 3*u1*t1*t1*curvePoints[2].x + t1*t1*t1*curvePoints[3].x,
            y: u1*u1*u1*curvePoints[0].y + 3*u1*u1*t1*curvePoints[1].y + 3*u1*t1*t1*curvePoints[2].y + t1*t1*t1*curvePoints[3].y,
            z: u1*u1*u1*curvePoints[0].z + 3*u1*u1*t1*curvePoints[1].z + 3*u1*t1*t1*curvePoints[2].z + t1*t1*t1*curvePoints[3].z
        };
        const pt2 = {
            x: u2*u2*u2*curvePoints[0].x + 3*u2*u2*t2*curvePoints[1].x + 3*u2*t2*t2*curvePoints[2].x + t2*t2*t2*curvePoints[3].x,
            y: u2*u2*u2*curvePoints[0].y + 3*u2*u2*t2*curvePoints[1].y + 3*u2*t2*t2*curvePoints[2].y + t2*t2*t2*curvePoints[3].y,
            z: u2*u2*u2*curvePoints[0].z + 3*u2*u2*t2*curvePoints[1].z + 3*u2*t2*t2*curvePoints[2].z + t2*t2*t2*curvePoints[3].z
        };
        const tangent = {
            x: pt2.x - pt1.x,
            y: pt2.y - pt1.y,
            z: pt2.z - pt1.z
        };
        // Find up/right vectors
        let up = { x: 0, y: 1, z: 0 };
        const dot = (tangent.x*up.x + tangent.y*up.y + tangent.z*up.z) / (Math.sqrt(tangent.x**2 + tangent.y**2 + tangent.z**2) * 1);
        if (Math.abs(dot) > 0.99) up = { x: 1, y: 0, z: 0 };
        // right = tangent x up
        const right = {
            x: tangent.y*up.z - tangent.z*up.y,
            y: tangent.z*up.x - tangent.x*up.z,
            z: tangent.x*up.y - tangent.y*up.x
        };
        // up = right x tangent
        up = {
            x: right.y*tangent.z - right.z*tangent.y,
            y: right.z*tangent.x - right.x*tangent.z,
            z: right.x*tangent.y - right.y*tangent.x
        };
        // Normalize right and up
        const rlen = Math.sqrt(right.x**2 + right.y**2 + right.z**2) || 1;
        right.x /= rlen; right.y /= rlen; right.z /= rlen;
        const ulen = Math.sqrt(up.x**2 + up.y**2 + up.z**2) || 1;
        up.x /= ulen; up.y /= ulen; up.z /= ulen;
        // Interpolate radius
        const radius = baseRadius * Math.pow(1-t, 0.7) + tipRadius * Math.pow(t, 1.3);
        // Generate ring points
        for (let j = 0; j < ringSegments; ++j) {
            const theta = (j / ringSegments) * Math.PI * 2;
            const offset = {
                x: Math.cos(theta) * radius * right.x + Math.sin(theta) * radius * up.x,
                y: Math.cos(theta) * radius * right.y + Math.sin(theta) * radius * up.y,
                z: Math.cos(theta) * radius * right.z + Math.sin(theta) * radius * up.z
            };
            const p3d = { x: pt.x + offset.x, y: pt.y + offset.y, z: pt.z + offset.z };
            positions.push(p3d.x, p3d.y, p3d.z);
            // Approximate normal
            const n = { x: offset.x, y: offset.y, z: offset.z };
            const nlen = Math.sqrt(n.x**2 + n.y**2 + n.z**2) || 1;
            normals.push(n.x/nlen, n.y/nlen, n.z/nlen);
        }
    }
    // Generate indices
    for (let i = 0; i < ringCount - 1; ++i) {
        for (let j = 0; j < ringSegments; ++j) {
            const a = i * ringSegments + j;
            const b = (i+1) * ringSegments + j;
            const c = (i+1) * ringSegments + (j+1)%ringSegments;
            const d = i * ringSegments + (j+1)%ringSegments;
            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();
    geometry.computeVertexNormals();
    return geometry;
}

// Helper: Find positions for leaves (branch tips)
function findLeafPositions(segments) {
    const positions = [];
    const segmentEnds = segments.map(s => ({ x: s.end.x, y: s.end.y, z: s.end.z }));
    
    // Find unique end positions (branch tips)
    for (const end of segmentEnds) {
        const isDuplicate = positions.some(pos => 
            Math.abs(pos.x - end.x) < 0.1 && 
            Math.abs(pos.y - end.y) < 0.1 && 
            Math.abs(pos.z - end.z) < 0.1
        );
        if (!isDuplicate) {
            positions.push(end);
        }
    }
    
    return positions;
}

// Helper: Generate simple leaf mesh
function generateLeafMesh(position, size, THREE) {
    // Create a simple quad leaf
    const geometry = new THREE.PlaneGeometry(size, size);
    
    // Random rotation for variety
    const rotationX = (Math.random() - 0.5) * Math.PI;
    const rotationY = (Math.random() - 0.5) * Math.PI;
    const rotationZ = (Math.random() - 0.5) * Math.PI;
    
    geometry.rotateX(rotationX);
    geometry.rotateY(rotationY);
    geometry.rotateZ(rotationZ);
    
    // Position at leaf location
    geometry.translate(position.x, position.y, position.z);
    
    return new THREE.Mesh(geometry);
}

// Step 4 Test/Validation
export function testStep4(THREE) {
    const opts = new TreeOptions({ levels: 3, angle: 45, length: 10, children: 3, radius: 1 });
    const root = new Branch({ origin: { x: 0, y: 0, z: 0 }, direction: { x: 0, y: 1, z: 0 }, length: opts.length, radius: opts.radius, level: 0 });
    generateTreeRecursive(opts, root, 0, 1);
    const segments = extractSegments(root);
    const mesh = generateTreeMesh(segments, {
        trunkColor: 0x8B4513,
        branchColor: 0xA0522D,
        leafColor: 0x228B22,
        trunkRadius: 1.0,
        branchRadiusFactor: 0.7,
        leafSize: 2.0,
        addLeaves: true,
        ringSegments: 24,
        smoothNormals: true
    }, THREE);
    return { opts, root, segments, mesh };
} 