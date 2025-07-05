// Advanced Procedural Voxel Tree Generator
// Generates a 3D voxel matrix for trunk, branches, and leaves, then creates a mesh with smooth branch-to-trunk connections
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

    // Generate a THREE.Group mesh from the trunk, branches, and leaves
    toMesh() {
        const group = new THREE.Group();
        const trunkMat = new THREE.MeshStandardMaterial({ color: this.trunkColor });
        const branchMat = new THREE.MeshStandardMaterial({ color: this.branchColor });
        const leafMat = new THREE.MeshStandardMaterial({ color: this.leafColor });
        // Trunk
        for (let i = 1; i < this.trunkPath.length; i++) {
            const start = this.trunkPath[i - 1];
            const end = this.trunkPath[i];
            const cyl = this.cylinderBetween(start, end, this.trunkRadius, trunkMat);
            group.add(cyl);
        }
        // Branches
        for (const branch of this.branches) {
            for (let i = 1; i < branch.length; i++) {
                const start = branch[i - 1];
                const end = branch[i];
                const cyl = this.cylinderBetween(start, end, this.trunkRadius * 0.6, branchMat);
                group.add(cyl);
            }
        }
        // Leaves
        for (const pos of this.leafClusters) {
            let mesh;
            if (this.leafType === 'cone') {
                mesh = new THREE.Mesh(
                    new THREE.ConeGeometry(this.leafRadius, this.leafRadius * 2.2, this.leafSegments),
                    leafMat
                );
                mesh.position.copy(pos);
                mesh.position.y += this.leafRadius; // Offset for cone
            } else {
                mesh = new THREE.Mesh(
                    new THREE.SphereGeometry(this.leafRadius, this.leafSegments, this.leafSegments),
                    leafMat
                );
                mesh.position.copy(pos);
            }
            group.add(mesh);
        }
        return group;
    }

    // Helper: create a cylinder between two points
    cylinderBetween(start, end, radius, material) {
        const dir = new THREE.Vector3().subVectors(end, start);
        const len = dir.length();
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const cyl = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, len, 8),
            material
        );
        // Orient the cylinder
        cyl.position.copy(mid);
        cyl.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            dir.clone().normalize()
        );
        return cyl;
    }
}

// Usage example (in your scene):
// import { VoxelTree } from './procedural-tree-voxel.js';
// const pine = new VoxelTree({ geneMap: { type: 'pine' } });
// const oak = new VoxelTree({ geneMap: { type: 'broadleaf', leafColor: 0x44aa33 } });
// scene.add(pine.toMesh());
// scene.add(oak.toMesh()); 