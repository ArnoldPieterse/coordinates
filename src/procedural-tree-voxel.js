// IDX-DOC-00: For index reference format, see INDEX_DESCRIBER.md
// IDX-TREEVOX-01: Procedural Tree Voxel Module
// Advanced Procedural Voxel Tree Generator
// Generates a 3D voxel matrix for trunk, branches, and leaves, then creates a mesh with smooth branch-to-trunk connections
// IDX-TREEVOX-02: Voxel Matrix Generation
// IDX-TREEHYBRID-PLAN: Hybrid L-System + Space Colonization Tree Generator
//
// ## Overview
// This module will implement a procedural tree generator that combines:
//   - L-Systems (Lindenmayer Systems) for the main trunk and primary branches (global structure)
//   - Space Colonization Algorithm for secondary/tertiary branches and leaf distribution (local realism)
//
// ## Industry Standards & References
// - L-Systems: Prusinkiewicz & Lindenmayer, "The Algorithmic Beauty of Plants" (1990)
// - Space Colonization: Runions et al., "Modeling Trees with a Space Colonization Algorithm" (2007)
// - Used in: SpeedTree, PlantFactory, Blender Sapling, academic research
//
// ## Implementation Plan
//
// IDX-TREEHYBRID-01: L-System Skeleton Generation
//   - Define L-system grammar (axiom, rules, iterations)
//   - Generate main trunk and primary branches as a set of connected segments
//   - Parameters: branching angle, segment length, iterations, tropism
//
// IDX-TREEHYBRID-02: Space Colonization for Fine Branching
//   - Distribute attraction points (representing light/space/leaf targets) in the crown volume
//   - Grow secondary/tertiary branches from L-system skeleton toward attraction points
//   - Remove attraction points as they are reached, prune unreachable points
//   - Parameters: influence radius, kill radius, step size, point density
//
// IDX-TREEHYBRID-03: Mesh Generation
//   - Sweep a polygonal cross-section (ring) along the combined skeleton to create the mesh
//   - Connect rings with triangles (as in IDX-TREEVOX-TRIWRAP)
//   - Optionally blend junctions for smoothness
//   - Add leaves at attraction points or branch tips
//
// IDX-TREEHYBRID-04: Parameters & Controls
//   - Expose parameters for L-system rules, space colonization, mesh detail, and randomness
//   - Allow for different tree species and growth styles
//
// IDX-TREEHYBRID-05: Documentation & Examples
//   - Provide usage examples, parameter presets, and references to industry tools
//
// ## References
// - Prusinkiewicz, P., & Lindenmayer, A. (1990). The Algorithmic Beauty of Plants.
// - Runions, A., Lane, B., & Prusinkiewicz, P. (2007). Modeling Trees with a Space Colonization Algorithm.
// - SpeedTree, PlantFactory, Blender Sapling Addon
//
// ---
// The following code will implement these steps sequentially, using the IDX-TREEHYBRID index for traceability.
import * as THREE from 'three';

const TREE_TYPES = {
    pine: {
        trunkHeight: 22,
        trunkRadius: 0.5,
        trunkCurve: 0.08,
        numBranches: 12,
        branchLevels: 3,
        branchLength: 7,
        branchCurve: 0.18,
        branchSpread: Math.PI / 3.5,
        leafRadius: 1.2,
        leafSegments: 4,
        leafType: 'cone',
        trunkColor: 0x7B5E3B,
        branchColor: 0x8B6B4A,
        leafColor: 0x2E8B57
    },
    broadleaf: {
        trunkHeight: 16,
        trunkRadius: 0.8,
        trunkCurve: 0.18,
        numBranches: 8,
        branchLevels: 2,
        branchLength: 8,
        branchCurve: 0.28,
        branchSpread: Math.PI / 2.2,
        leafRadius: 2.5,
        leafSegments: 7,
        leafType: 'sphere',
        trunkColor: 0x8B4513,
        branchColor: 0xA0522D,
        leafColor: 0x228B22
    }
};

export class VoxelTree {
    constructor({ geneMap = {}, ...params } = {}) {
        // Determine tree type and merge geneMap with defaults
        const type = geneMap.type || 'broadleaf';
        const base = TREE_TYPES[type] || TREE_TYPES.broadleaf;
        const genes = { ...base, ...geneMap, ...params };
        this.trunkHeight = genes.trunkHeight;
        this.trunkRadius = genes.trunkRadius;
        this.trunkCurve = genes.trunkCurve;
        this.numBranches = genes.numBranches;
        this.branchLevels = genes.branchLevels;
        this.branchLength = genes.branchLength;
        this.branchCurve = genes.branchCurve;
        this.branchSpread = genes.branchSpread;
        this.leafRadius = genes.leafRadius;
        this.leafSegments = genes.leafSegments;
        this.leafType = genes.leafType;
        this.trunkColor = genes.trunkColor;
        this.branchColor = genes.branchColor;
        this.leafColor = genes.leafColor;
        this.randomness = genes.randomness ?? 0.22;
        this.trunkPath = [];
        this.branches = [];
        this.leafClusters = [];
        this.generate();
    }

    randomBetween(a, b) {
        return a + Math.random() * (b - a);
    }

    // Generate the trunk as a slightly curved path
    generateTrunk() {
        let pos = new THREE.Vector3(0, 0, 0);
        let dir = new THREE.Vector3(0, 1, 0);
        this.trunkPath.push(pos.clone());
        for (let y = 1; y <= this.trunkHeight; y++) {
            // Slight random curve
            dir.x += this.randomBetween(-this.trunkCurve, this.trunkCurve);
            dir.z += this.randomBetween(-this.trunkCurve, this.trunkCurve);
            dir.normalize();
            pos = pos.clone().add(dir);
            this.trunkPath.push(pos.clone());
        }
    }

    // Recursively generate branches
    generateBranch(start, direction, length, level) {
        let path = [start.clone()];
        let dir = direction.clone().normalize();
        let pos = start.clone();
        for (let i = 1; i <= length; i++) {
            // Curve the branch
            dir.x += this.randomBetween(-this.branchCurve, this.branchCurve);
            dir.y += this.randomBetween(-this.branchCurve * 0.5, this.branchCurve * 0.5);
            dir.z += this.randomBetween(-this.branchCurve, this.branchCurve);
            dir.normalize();
            pos = pos.clone().add(dir);
            path.push(pos.clone());
            // Recursively spawn sub-branches
            if (level < this.branchLevels && i > length * 0.4 && Math.random() < 0.18) {
                const subDir = dir.clone().applyAxisAngle(
                    new THREE.Vector3(0, 1, 0),
                    this.randomBetween(-this.branchSpread, this.branchSpread)
                );
                const subLength = Math.floor(length * this.randomBetween(0.5, 0.8));
                this.branches.push(
                    this.generateBranch(pos, subDir, subLength, level + 1)
                );
            }
        }
        // Only add leaf cluster at the end of terminal branches
        if (level === this.branchLevels) {
            this.leafClusters.push(pos.clone());
        }
        return path;
    }

    generateBranches() {
        // Place main branches at random heights along the trunk
        for (let i = 0; i < this.numBranches; i++) {
            const t = this.randomBetween(0.4, 0.95); // Avoid very bottom/top
            const trunkIdx = Math.floor(t * this.trunkPath.length);
            const start = this.trunkPath[trunkIdx];
            // Outward direction
            const angle = this.randomBetween(0, Math.PI * 2);
            const up = new THREE.Vector3(0, 1, 0);
            const dir = new THREE.Vector3(
                Math.cos(angle) * this.randomBetween(0.7, 1),
                this.randomBetween(0.3, 0.7),
                Math.sin(angle) * this.randomBetween(0.7, 1)
            ).normalize();
            const length = Math.floor(this.branchLength * this.randomBetween(0.8, 1.2));
            this.branches.push(this.generateBranch(start, dir, length, 1));
        }
    }

    generate() {
        this.trunkPath = [];
        this.branches = [];
        this.leafClusters = [];
        this.generateTrunk();
        this.generateBranches();
    }

    // IDX-TREEVOX-TRIWRAP: Polygonal ring mesh for trunk/branches (matches sketch)
    toMesh({ ringSides = 3 } = {}) {
        const group = new THREE.Group();
        const trunkMat = new THREE.MeshStandardMaterial({ color: this.trunkColor });
        const leafMat = new THREE.MeshStandardMaterial({ color: this.leafColor });
        let vertices = [];
        let faces = [];
        let trunkRings = [];
        // Helper: generate a ring of N vertices around axis at center
        function addRing(center, dir, radius) {
            let up = Math.abs(dir.y) < 0.99 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
            const right = new THREE.Vector3().crossVectors(dir, up).normalize();
            up = new THREE.Vector3().crossVectors(right, dir).normalize();
            const ring = [];
            for (let j = 0; j < ringSides; j++) {
                const theta = (j / ringSides) * Math.PI * 2;
                const cos = Math.cos(theta);
                const sin = Math.sin(theta);
                const v = center.clone()
                    .add(right.clone().multiplyScalar(radius * cos))
                    .add(up.clone().multiplyScalar(radius * sin));
                ring.push(vertices.length / 3);
                vertices.push(v.x, v.y, v.z);
            }
            return ring;
        }
        // Build trunk as a tube of rings
        let prevRing = null;
        for (let i = 1; i < this.trunkPath.length; i++) {
            const start = this.trunkPath[i - 1];
            const end = this.trunkPath[i];
            const dir = new THREE.Vector3().subVectors(end, start).normalize();
            const ringA = addRing(start, dir, this.trunkRadius);
            const ringB = addRing(end, dir, this.trunkRadius);
            trunkRings.push(ringA);
            if (i === this.trunkPath.length - 1) trunkRings.push(ringB);
            if (prevRing) {
                for (let j = 0; j < ringSides; j++) {
                    const a = prevRing[j];
                    const b = ringA[j];
                    const c = ringA[(j + 1) % ringSides];
                    const d = prevRing[(j + 1) % ringSides];
                    faces.push(a, b, c);
                    faces.push(a, c, d);
                }
            }
            prevRing = ringB;
        }
        // Build branches as tubes, connect base ring to closest trunk ring
        for (const branch of this.branches) {
            // Find closest trunk point for branch start
            let minDist = Infinity;
            let closestIdx = 0;
            for (let i = 0; i < this.trunkPath.length; i++) {
                const d = branch[0].distanceTo(this.trunkPath[i]);
                if (d < minDist) {
                    minDist = d;
                    closestIdx = i;
                }
            }
            // Use the trunk ring at closestIdx as the base for the branch
            let baseRingCenter = this.trunkPath[closestIdx];
            let baseRingDir = (closestIdx < this.trunkPath.length - 1)
                ? new THREE.Vector3().subVectors(this.trunkPath[closestIdx + 1], this.trunkPath[closestIdx]).normalize()
                : new THREE.Vector3().subVectors(this.trunkPath[closestIdx], this.trunkPath[closestIdx - 1]).normalize();
            let trunkBaseRing = trunkRings[closestIdx];
            let branchBaseDir = new THREE.Vector3().subVectors(branch[1], branch[0]).normalize();
            let branchBaseRing = addRing(branch[0], branchBaseDir, this.trunkRadius * 0.6);
            // Connect branch base ring to trunk ring
            for (let j = 0; j < ringSides; j++) {
                const a = trunkBaseRing[j];
                const b = branchBaseRing[j];
                const c = branchBaseRing[(j + 1) % ringSides];
                const d = trunkBaseRing[(j + 1) % ringSides];
                faces.push(a, b, c);
                faces.push(a, c, d);
            }
            // Continue branch as tube
            let prevRing = branchBaseRing;
            for (let i = 1; i < branch.length; i++) {
                const start = branch[i - 1];
                const end = branch[i];
                const dir = new THREE.Vector3().subVectors(end, start).normalize();
                const ringB = addRing(end, dir, this.trunkRadius * 0.6);
                for (let j = 0; j < ringSides; j++) {
                    const a = prevRing[j];
                    const b = ringB[j];
                    const c = ringB[(j + 1) % ringSides];
                    const d = prevRing[(j + 1) % ringSides];
                    faces.push(a, b, c);
                    faces.push(a, c, d);
                }
                prevRing = ringB;
            }
        }
        // Create geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(faces);
        geometry.computeVertexNormals();
        const mesh = new THREE.Mesh(geometry, trunkMat);
        group.add(mesh);
        // Leaves (unchanged)
        for (const pos of this.leafClusters) {
            let leafMesh;
            if (this.leafType === 'cone') {
                leafMesh = new THREE.Mesh(
                    new THREE.ConeGeometry(this.leafRadius, this.leafRadius * 2.2, this.leafSegments),
                    leafMat
                );
                leafMesh.position.copy(pos);
                leafMesh.position.y += this.leafRadius;
            } else {
                leafMesh = new THREE.Mesh(
                    new THREE.SphereGeometry(this.leafRadius, this.leafSegments, this.leafSegments),
                    leafMat
                );
                leafMesh.position.copy(pos);
            }
            group.add(leafMesh);
        }
        return group;
    }
}

// Usage example (in your scene):
// import { VoxelTree } from './procedural-tree-voxel.js';
// const pine = new VoxelTree({ geneMap: { type: 'pine' } });
// const oak = new VoxelTree({ geneMap: { type: 'broadleaf', leafColor: 0x44aa33 } });
// scene.add(pine.toMesh());
// scene.add(oak.toMesh()); 