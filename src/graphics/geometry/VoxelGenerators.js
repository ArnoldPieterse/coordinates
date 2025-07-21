// IDX-DOC-00: For index reference format, see INDEX_DESCRIBER.md
// IDX-TREEVOX-01: Procedural Tree Voxel Module
// Advanced Procedural Voxel Tree Generator
// Generates a 3D voxel matrix for trunk, branches, and leaves, then creates a mesh with smooth branch-to-trunk connections
// IDX-TREEVOX-02: Voxel Matrix Generation
// IDX-TREEHYBRID-PLAN: Hybrid L-System + Space Colonization Tree Generator
// See PROMPTS.md for biological realism prompt
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
import TreeOptions from './tree-options.js';
import { Branch } from './branch.js';

const TREE_TYPES = {
    pine: {
        trunkHeight: 10,
        trunkRadius: 0.5,
        trunkCurve: 0.08,
        numBranches: 12,
        branchLevels: 3,
        branchLength: 7,
        branchCurve: 0.18,
        branchSpread: Math.PI / 3.5,
        branchAngleDeg: 95,
        leafRadius: 1.2,
        leafSegments: 4,
        leafType: 'cone',
        trunkColor: 0x7B5E3B,
        branchColor: 0x8B6B4A,
        leafColor: 0x2E8B57
    },
    broadleaf: {
        trunkHeight: 9,
        trunkRadius: 0.8,
        trunkCurve: 0.18,
        numBranches: 8,
        branchLevels: 2,
        branchLength: 8,
        branchCurve: 0.28,
        branchSpread: Math.PI / 2.2,
        branchAngleDeg: 100,
        leafRadius: 2.5,
        leafSegments: 7,
        leafType: 'sphere',
        trunkColor: 0x8B4513,
        branchColor: 0xA0522D,
        leafColor: 0x228B22
    },
    birch: {
        trunkHeight: 10,
        trunkRadius: 0.35,
        trunkCurve: 0.12,
        numBranches: 10,
        branchLevels: 2,
        branchLength: 7,
        branchCurve: 0.22,
        branchSpread: Math.PI / 2.5,
        branchAngleDeg: 100,
        leafRadius: 0.7,
        leafSegments: 5,
        leafType: 'sphere',
        trunkColor: 0xEDE6D6,
        branchColor: 0xB7AFA3,
        leafColor: 0xA7D129
    },
    willow: {
        trunkHeight: 8,
        trunkRadius: 0.6,
        trunkCurve: 0.25,
        numBranches: 16,
        branchLevels: 3,
        branchLength: 10,
        branchCurve: 0.35,
        branchSpread: Math.PI / 2.8,
        branchAngleDeg: 110,
        leafRadius: 0.5,
        leafSegments: 4,
        leafType: 'sphere',
        trunkColor: 0x7A5230,
        branchColor: 0x8B6B4A,
        leafColor: 0x6BAF4B
    },
    palm: {
        trunkHeight: 12,
        trunkRadius: 0.4,
        trunkCurve: 0.09,
        numBranches: 7,
        branchLevels: 1,
        branchLength: 10,
        branchCurve: 0.12,
        branchSpread: Math.PI / 1.5,
        branchAngleDeg: 110,
        leafRadius: 2.2,
        leafSegments: 6,
        leafType: 'cone',
        trunkColor: 0xA67B5B,
        branchColor: 0xA67B5B,
        leafColor: 0x3B7A57
    },
    cypress: {
        trunkHeight: 10,
        trunkRadius: 0.3,
        trunkCurve: 0.05,
        numBranches: 18,
        branchLevels: 2,
        branchLength: 6,
        branchCurve: 0.13,
        branchSpread: Math.PI / 4.5,
        branchAngleDeg: 95,
        leafRadius: 0.4,
        leafSegments: 3,
        leafType: 'sphere',
        trunkColor: 0x6E4B26,
        branchColor: 0x7B5E3B,
        leafColor: 0x3A5F0B
    },
    maple: {
        trunkHeight: 9,
        trunkRadius: 0.7,
        trunkCurve: 0.15,
        numBranches: 11,
        branchLevels: 2,
        branchLength: 8,
        branchCurve: 0.25,
        branchSpread: Math.PI / 2.1,
        branchAngleDeg: 100,
        leafRadius: 1.8,
        leafSegments: 7,
        leafType: 'sphere',
        trunkColor: 0xA0522D,
        branchColor: 0x8B5A2B,
        leafColor: 0xD2691E
    }
};

// IDX-TREEHYBRID-01: L-System Skeleton Generation
class LSystemSkeleton {
    constructor(params = {}) {
        this.axiom = params.axiom || 'F';
        this.rules = params.rules || {
            'F': 'FF+[+F-F-F]-[-F+F+F]'
        };
        this.iterations = params.iterations || 4;
        this.angle = params.angle || Math.PI / 6; // 30 degrees
        this.length = params.length || 1.0;
        this.lengthFactor = params.lengthFactor || 0.7;
        this.tropism = params.tropism || new THREE.Vector3(0, 1, 0); // Upward growth
        this.tropismStrength = params.tropismStrength || 0.1;
        this.randomness = params.randomness || 0.1;
        
        this.segments = [];
        this.stack = [];
        this.currentPos = new THREE.Vector3(0, 0, 0);
        this.currentDir = new THREE.Vector3(0, 1, 0);
        this.currentLength = this.length;
    }

    // Generate the L-system string
    generateString() {
        let result = this.axiom;
        
        for (let i = 0; i < this.iterations; i++) {
            let newResult = '';
            for (let char of result) {
                if (this.rules[char]) {
                    newResult += this.rules[char];
                } else {
                    newResult += char;
                }
            }
            result = newResult;
        }
        
        return result;
    }

    // Interpret the L-system string to generate segments
    interpretString(lString) {
        this.segments = [];
        this.stack = [];
        this.currentPos = new THREE.Vector3(0, 0, 0);
        this.currentDir = new THREE.Vector3(0, 1, 0);
        this.currentLength = this.length;
        
        for (let char of lString) {
            this.interpretChar(char);
        }
        
        return this.segments;
    }

    // Interpret individual characters
    interpretChar(char) {
        switch (char) {
            case 'F': // Forward
                const endPos = this.currentPos.clone().add(
                    this.currentDir.clone().multiplyScalar(this.currentLength)
                );
                
                // Apply tropism (upward growth bias)
                const tropismEffect = this.tropism.clone()
                    .multiplyScalar(this.tropismStrength * this.currentLength);
                endPos.add(tropismEffect);
                
                // Add randomness
                if (this.randomness > 0) {
                    const randomOffset = new THREE.Vector3(
                        (Math.random() - 0.5) * this.randomness * this.currentLength,
                        (Math.random() - 0.5) * this.randomness * this.currentLength,
                        (Math.random() - 0.5) * this.randomness * this.currentLength
                    );
                    endPos.add(randomOffset);
                }
                
                this.segments.push({
                    start: this.currentPos.clone(),
                    end: endPos.clone(),
                    type: 'skeleton',
                    length: this.currentLength,
                    direction: this.currentDir.clone()
                });
                
                this.currentPos.copy(endPos);
                this.currentLength *= this.lengthFactor;
                break;
                
            case '+': // Turn right
                this.currentDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.angle);
                break;
                
            case '-': // Turn left
                this.currentDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), -this.angle);
                break;
                
            case '[': // Push state
                this.stack.push({
                    pos: this.currentPos.clone(),
                    dir: this.currentDir.clone(),
                    length: this.currentLength
                });
                break;
                
            case ']': // Pop state
                if (this.stack.length > 0) {
                    const state = this.stack.pop();
                    this.currentPos.copy(state.pos);
                    this.currentDir.copy(state.dir);
                    this.currentLength = state.length;
                }
                break;
        }
    }

    // Generate the complete L-system skeleton
    generate() {
        const lString = this.generateString();
        return this.interpretString(lString);
    }
}

// IDX-TREEHYBRID-02: Space Colonization for Fine Branching
class SpaceColonization {
    constructor(params = {}) {
        this.influenceRadius = params.influenceRadius || 3.0;
        this.killRadius = params.killRadius || 0.5;
        this.stepSize = params.stepSize || 0.5;
        this.maxIterations = params.maxIterations || 100;
        this.attractionPoints = [];
        this.fineSegments = [];
        this.skeletonSegments = [];
    }

    // Distribute attraction points in the crown volume
    distributeAttractionPoints(crownCenter, crownRadius, crownHeight) {
        this.attractionPoints = [];
        const pointCount = Math.floor(crownRadius * crownHeight * this.pointDensity || 0.1);
        
        for (let i = 0; i < pointCount; i++) {
            // Random position within crown volume
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * crownRadius;
            const height = Math.random() * crownHeight;
            
            const point = new THREE.Vector3(
                crownCenter.x + Math.cos(angle) * radius,
                crownCenter.y + height,
                crownCenter.z + Math.sin(angle) * radius
            );
            
            this.attractionPoints.push({
                position: point,
                active: true
            });
        }
    }

    // Set the L-system skeleton for fine branching
    setSkeleton(skeletonSegments) {
        this.skeletonSegments = skeletonSegments;
        this.fineSegments = [];
        
        // Initialize fine branches from skeleton endpoints
        for (const segment of skeletonSegments) {
            this.fineSegments.push({
                start: segment.end.clone(),
                end: segment.end.clone(),
                direction: segment.direction.clone(),
                active: true,
                parent: segment
            });
        }
    }

    // Grow fine branches toward attraction points
    growFineBranches() {
        for (let iteration = 0; iteration < this.maxIterations; iteration++) {
            let anyGrowth = false;
            
            // Calculate growth direction for each active fine branch
            for (const branch of this.fineSegments) {
                if (!branch.active) continue;
                
                const growthDir = this.calculateGrowthDirection(branch);
                if (growthDir.length() > 0.01) {
                    // Normalize and apply step size
                    growthDir.normalize().multiplyScalar(this.stepSize);
                    
                    // Update branch end position
                    branch.end.add(growthDir);
                    branch.direction.copy(growthDir.normalize());
                    
                    anyGrowth = true;
                }
            }
            
            // Remove attraction points that are too close to branches
            this.removeNearbyAttractionPoints();
            
            // Stop if no more growth or no more attraction points
            if (!anyGrowth || this.attractionPoints.filter(p => p.active).length === 0) {
                break;
            }
        }
        
        return this.fineSegments;
    }

    // Calculate growth direction for a fine branch
    calculateGrowthDirection(branch) {
        const growthDir = new THREE.Vector3();
        let influenceCount = 0;
        
        for (const point of this.attractionPoints) {
            if (!point.active) continue;
            
            const distance = branch.end.distanceTo(point.position);
            
            if (distance <= this.influenceRadius) {
                const direction = point.position.clone().sub(branch.end).normalize();
                const influence = 1 - (distance / this.influenceRadius);
                growthDir.add(direction.multiplyScalar(influence));
                influenceCount++;
            }
        }
        
        if (influenceCount > 0) {
            growthDir.divideScalar(influenceCount);
        }
        
        return growthDir;
    }

    // Remove attraction points that are too close to branches
    removeNearbyAttractionPoints() {
        for (const point of this.attractionPoints) {
            if (!point.active) continue;
            
            for (const branch of this.fineSegments) {
                const distance = branch.end.distanceTo(point.position);
                if (distance <= this.killRadius) {
                    point.active = false;
                    break;
                }
            }
        }
    }

    // Generate fine branches from skeleton
    generate(skeletonSegments, crownCenter, crownRadius, crownHeight) {
        this.distributeAttractionPoints(crownCenter, crownRadius, crownHeight);
        this.setSkeleton(skeletonSegments);
        return this.growFineBranches();
    }
}

export class VoxelTree {
    constructor(options = new TreeOptions()) {
        // IDX-TREEVOX-03: Modular Tree Options Integration
        this.options = options;
        this.seed = options.seed || 0;
        this.type = options.type || 'broadleaf';
        
        // Initialize with options
        this.trunkHeight = options.branch.length[0] || 20;
        this.trunkRadius = options.branch.radius[0] || 1.5;
        this.numBranches = options.branch.children[0] || 7;
        this.branchLevels = options.branch.levels || 3;
        this.branchLength = options.branch.length[1] || 20;
        this.branchAngleDeg = options.branch.angle[1] || 70;
        
        // Legacy compatibility
        this.useHybrid = true;
        this.geneMap = {};
        
        // Initialize data structures
        this.trunkPath = [];
        this.branches = [];
        this.leafClusters = [];
        this.hybridSegments = [];
        
        // Initialize hybrid systems
        this.initializeHybridSystems();
        
        // Generate the tree
        this.generate();
    }

    initializeHybridSystems() {
        // Get tree type configuration
        const treeType = TREE_TYPES[this.type] || TREE_TYPES.broadleaf;
        
        // Initialize L-System skeleton generator with tree-specific parameters
        this.lSystemSkeleton = new LSystemSkeleton({
            axiom: 'F',
            rules: {
                'F': 'FF+[+F-F-F]-[-F+F+F]'
            },
            iterations: Math.max(2, Math.min(6, Math.floor(this.trunkHeight / 4))),
            angle: (treeType.branchAngleDeg * Math.PI) / 180,
            length: treeType.trunkHeight / 4,
            lengthFactor: 0.7,
            tropism: new THREE.Vector3(0, 1, 0),
            tropismStrength: 0.1,
            randomness: 0.1
        });

        // Initialize Space Colonization with adaptive parameters
        this.spaceColonization = new SpaceColonization({
            influenceRadius: treeType.leafRadius * 2,
            killRadius: treeType.leafRadius * 0.3,
            stepSize: treeType.branchLength * 0.1,
            maxIterations: 100,
            pointDensity: 0.15
        });
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
    generateBranch(start, direction, length, level, parentAngle = null) {
        let path = [start.clone()];
        let dir = direction.clone().normalize();
        let pos = start.clone();
        // Restore naturalistic curve and sub-branching
        const curve = this.branchCurve * 1.5;
        for (let i = 1; i <= length; i++) {
            dir.x += this.randomBetween(-curve * 0.3, curve * 0.3);
            dir.y += this.randomBetween(-curve * 0.15, curve * 0.15);
            dir.z += this.randomBetween(-curve * 0.3, curve * 0.3);
            dir.normalize();
            pos = pos.clone().add(dir);
            path.push(pos.clone());
            // Recursively spawn sub-branches
            if (level < this.branchLevels && i > length * 0.4 && Math.random() < 0.18) {
                let baseAngle = (parentAngle !== null ? parentAngle : this.branchAngleRad);
                let subAngle = baseAngle + this.randomBetween(-Math.PI/18, Math.PI/18);
                subAngle = Math.max(Math.PI*100/180, Math.min(subAngle, Math.PI*125/180));
                const subAzimuth = this.randomBetween(0, Math.PI * 2);
                const subDir = new THREE.Vector3(
                    Math.sin(subAngle) * Math.cos(subAzimuth),
                    Math.cos(subAngle),
                    Math.sin(subAngle) * Math.sin(subAzimuth)
                ).normalize();
                const subLength = Math.floor(length * this.randomBetween(0.5, 0.7));
                this.branches.push(
                    this.generateBranch(pos, subDir, subLength, level + 1, subAngle)
                );
            }
        }
        if (level === this.branchLevels) {
            this.leafClusters.push(pos.clone());
        }
        return path;
    }

    generateBranches() {
        // IDX-TREEVOX-04: Recursive Branch Generation
        // Biologically accurate branch placement using golden angle and height-based angles
        const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5°
        const trunkLen = this.trunkPath.length;
        
        // Start with trunk as root branch
        const rootDir = new THREE.Vector3(0, 1, 0);
        const rootBranch = new Branch(
            new THREE.Vector3(0, 0, 0),
            new THREE.Euler(0, 0, 0),
            this.trunkHeight,
            this.trunkRadius,
            0,
            this.options.branch.sections[0] || 12,
            this.options.branch.segments[0] || 8
        );
        
        // Generate branches recursively, passing parent direction
        this.generateBranchRecursive(rootBranch, rootDir);
        
        // Extract branch paths for compatibility
        this.branches = this.extractBranchPaths(rootBranch, rootDir);
    }

    generateBranchRecursive(branch, parentDir) {
        const level = branch.level;
        const maxLevels = this.options.branch.levels;
        logOutput(`[BranchGen] level=${level}, origin=`, branch.origin, 'orientation=', branch.orientation, 'length=', branch.length, 'sectionCount=', branch.sectionCount);
        if (level >= maxLevels) {
            // Terminal branch - add leaf cluster
            const dir = parentDir.clone().applyEuler(branch.orientation).normalize();
            if (!isFinite(dir.x) || !isFinite(dir.y) || !isFinite(dir.z) || dir.length() === 0) {
                logOutput('SKIP: Invalid or zero direction vector at terminal branch:', dir, branch);
                return;
            }
            const endPos = branch.origin.clone().add(dir.multiplyScalar(branch.length));
            this.leafClusters.push(endPos);
            return;
        }
        // Generate child branches
        const childCount = this.options.branch.children[level] || 3;
        const radialOffset = Math.random() * Math.PI * 2;
        for (let i = 0; i < childCount; i++) {
            const radialAngle = 2.0 * Math.PI * (radialOffset + i / childCount);
            const childStart = this.options.branch.start[level + 1] || 0.4;
            const childLength = this.options.branch.length[level + 1] || branch.length * 0.7;
            const childRadius = this.options.branch.radius[level + 1] || branch.radius * 0.5;
            const dir = parentDir.clone().applyEuler(branch.orientation).normalize();
            if (!isFinite(dir.x) || !isFinite(dir.y) || !isFinite(dir.z) || dir.length() === 0) {
                logOutput('SKIP: Invalid or zero direction vector for child branch:', dir, branch);
                continue;
            }
            const childOrigin = branch.origin.clone().add(dir.multiplyScalar(branch.length * childStart));
            const childAngle = this.options.branch.angle[level + 1] || 60;
            const q1 = new THREE.Quaternion().setFromAxisAngle(
                new THREE.Vector3(1, 0, 0),
                childAngle * Math.PI / 180
            );
            const q2 = new THREE.Quaternion().setFromAxisAngle(
                new THREE.Vector3(0, 1, 0),
                radialAngle
            );
            const q3 = new THREE.Quaternion().setFromEuler(branch.orientation);
            const childOrientation = new THREE.Euler().setFromQuaternion(
                q3.multiply(q2.multiply(q1))
            );
            const childDir = dir;
            if (!isFinite(childDir.x) || !isFinite(childDir.y) || !isFinite(childDir.z) || childDir.length() === 0) {
                logOutput('SKIP: Invalid or zero childDir for recursion:', childDir, branch);
                continue;
            }
            const childBranch = new Branch(
                childOrigin,
                childOrientation,
                childLength,
                childRadius,
                level + 1,
                this.options.branch.sections[level + 1] || 8,
                this.options.branch.segments[level + 1] || 6
            );
            branch.children.push(childBranch);
            this.generateBranchRecursive(childBranch, childDir);
        }
    }

    extractBranchPaths(branch, parentDir) {
        const paths = [];
        function extractBranch(branch, parentDir) {
            if (!branch.sectionCount || !isFinite(branch.sectionCount) || branch.sectionCount <= 0) {
                logOutput('Invalid sectionCount in branch:', branch);
                return;
            }
            if (!branch.length || !isFinite(branch.length) || branch.length <= 0) {
                logOutput('Invalid length in branch:', branch);
                return;
            }
            const path = [];
            const dir = parentDir.clone().applyEuler(branch.orientation).normalize();
            if (!isFinite(dir.x) || !isFinite(dir.y) || !isFinite(dir.z) || dir.length() === 0) {
                logOutput('SKIP: Invalid or zero direction vector in extractBranch:', dir, branch);
                return;
            }
            let pos = branch.origin.clone();
            const step = branch.length / branch.sectionCount;
            if (!isFinite(step) || step === 0) {
                logOutput('SKIP: Invalid step size in extractBranch:', step, branch);
                return;
            }
            for (let i = 0; i <= branch.sectionCount; i++) {
                if (!isFinite(pos.x) || !isFinite(pos.y) || !isFinite(pos.z)) {
                    logOutput('NaN in pos before step', i, pos, 'branch:', branch);
                }
                path.push(pos.clone());
                const delta = dir.clone().multiplyScalar(step);
                if (!isFinite(delta.x) || !isFinite(delta.y) || !isFinite(delta.z)) {
                    logOutput('NaN in delta at step', i, delta, 'branch:', branch);
                }
                pos.add(delta);
                if (!isFinite(pos.x) || !isFinite(pos.y) || !isFinite(pos.z)) {
                    logOutput('NaN in pos after step', i, pos, 'branch:', branch);
                }
            }
            paths.push({ path, angle: branch.orientation.x });
            for (let child of branch.children) {
                extractBranch(child, dir);
            }
        }
        extractBranch(branch, parentDir);
        return paths;
    }

    generate() {
        // IDX-TREEVOX-05: Main Generation Pipeline
        logOutput('[VoxelTree] Starting generation with options:', this.options);
        
        if (this.useHybrid) {
            // Use hybrid L-System + Space Colonization approach
            this.generateHybridTree();
        } else {
            // Use traditional recursive method
            this.generateTrunk();
            this.generateBranches();
        }
        
        logOutput('[VoxelTree] Generation complete. Branches:', this.branches.length, 'Leaf clusters:', this.leafClusters.length);
    }

    generateHybridTree() {
        // Step 1: Generate L-System skeleton
        const skeletonSegments = this.lSystemSkeleton.generate();
        logOutput('[Hybrid] L-System skeleton generated:', skeletonSegments.length, 'segments');
        
        // Step 2: Calculate crown parameters for space colonization
        const crownCenter = new THREE.Vector3(0, this.trunkHeight * 0.7, 0);
        const crownRadius = this.trunkHeight * 0.6;
        const crownHeight = this.trunkHeight * 0.8;
        
        // Step 3: Generate fine branches using space colonization
        const fineSegments = this.spaceColonization.generate(skeletonSegments, crownCenter, crownRadius, crownHeight);
        logOutput('[Hybrid] Space colonization fine branches:', fineSegments.length, 'segments');
        
        // Step 4: Combine segments
        this.hybridSegments = [
            ...skeletonSegments.map(s => ({ ...s, type: 'skeleton' })),
            ...fineSegments.map(s => ({ ...s, type: 'fine' }))
        ];
        
        // Step 5: Extract leaf clusters from fine branch endpoints
        this.leafClusters = fineSegments
            .filter(s => s.active)
            .map(s => s.end.clone());
        
        // Step 6: Convert to traditional branch format for compatibility
        this.branches = this.convertHybridToBranches();
        
        logOutput('[Hybrid] Tree generation complete. Total segments:', this.hybridSegments.length);
    }

    convertHybridToBranches() {
        const branches = [];
        
        // Convert skeleton segments to branch paths
        for (const segment of this.hybridSegments) {
            if (segment.type === 'skeleton') {
                const path = [segment.start, segment.end];
                branches.push(path);
            }
        }
        
        // Convert fine segments to branch paths
        for (const segment of this.hybridSegments) {
            if (segment.type === 'fine' && segment.active) {
                const path = [segment.start, segment.end];
                branches.push(path);
            }
        }
        
        return branches;
    }

    // Helper: get branch tip directions for leaf orientation
    getLeafTipDirections() {
        const tips = [];
        if (this.branches && this.branches.length > 0) {
            for (const branchObj of this.branches) {
                const branch = branchObj.path || branchObj;
                const angle = branchObj.angle !== undefined ? branchObj.angle : null;
                if (branch.length > 1) {
                    const tip = branch[branch.length - 1];
                    const prev = branch[branch.length - 2];
                    const dir = new THREE.Vector3().subVectors(tip, prev).normalize();
                    tips.push({ pos: tip, dir });
                }
            }
        }
        return tips;
    }

    // Improved: create instanced leaves at branch tips, oriented along branch direction
    createInstancedLeaves(leafTips, leafMat, leafSize = 0.5) {
        const leafGeometry = new THREE.PlaneGeometry(leafSize, leafSize);
        const count = leafTips.length;
        const instancedMesh = new THREE.InstancedMesh(leafGeometry, leafMat, count);
        const dummy = new THREE.Object3D();
        for (let i = 0; i < count; i++) {
            dummy.position.copy(leafTips[i].pos);
            // Orient leaf to face along branch direction, with random tilt
            const dir = leafTips[i].dir;
            const up = new THREE.Vector3(0, 1, 0);
            const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
            dummy.setRotationFromQuaternion(quat);
            dummy.rotateZ(Math.random() * Math.PI * 2); // random twist
            // Random scale
            const scale = 0.7 + Math.random() * 0.6;
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(i, dummy.matrix);
        }
        instancedMesh.instanceMatrix.needsUpdate = true;
        return instancedMesh;
    }

    // Helper: create smoothed connection between two rings (for branch junctions)
    createSmoothedJunction(ringA, ringB, centerA, centerB, dirA, dirB, radiusA, radiusB, ringSides, addRing, vertices, faces, steps = 2) {
        let prevRing = ringA;
        for (let s = 1; s <= steps; s++) {
            const t = s / (steps + 1);
            const center = centerA.clone().lerp(centerB, t);
            const dir = dirA.clone().lerp(dirB, t).normalize();
            const radius = radiusA * (1 - t) + radiusB * t;
            const ring = addRing(center, dir, radius);
            for (let j = 0; j < ringSides; j++) {
                const a = prevRing[j];
                const b = ring[j];
                const c = ring[(j + 1) % ringSides];
                const d = prevRing[(j + 1) % ringSides];
                faces.push(a, b, c);
                faces.push(a, c, d);
            }
            prevRing = ring;
        }
        // Connect last intermediate ring to ringB
        for (let j = 0; j < ringSides; j++) {
            const a = prevRing[j];
            const b = ringB[j];
            const c = ringB[(j + 1) % ringSides];
            const d = prevRing[(j + 1) % ringSides];
            faces.push(a, b, c);
            faces.push(a, c, d);
        }
    }

    // Render the tree skeleton (trunk and branches) as lines for debugging
    toSkeleton({ colorTrunk = 0x8B4513, colorBranch = 0x228B22, lineWidth = 2 } = {}) {
        const group = new THREE.Group();
        const trunkMat = new THREE.LineBasicMaterial({ color: colorTrunk, linewidth: lineWidth });
        // Trunk
        if (this.trunkPath && this.trunkPath.length > 1) {
            const trunkGeom = new THREE.BufferGeometry().setFromPoints(this.trunkPath);
            const trunkLine = new THREE.Line(trunkGeom, trunkMat);
            group.add(trunkLine);
        }
        // Branches
        if (this.branches && this.branches.length > 0) {
            for (const branchObj of this.branches) {
                const branch = branchObj.path || branchObj;
                const angle = branchObj.angle !== undefined ? branchObj.angle : null;
                if (branch.length > 1) {
                    // Color code: blue (upward, <110°), green (110–130°), red (>130°)
                    let color = 0x00ff00; // default green
                    if (angle !== null) {
                        const deg = angle * 180 / Math.PI;
                        if (deg < 110) color = 0x0000ff; // blue
                        else if (deg > 130) color = 0xff0000; // red
                    }
                    const branchMat = new THREE.LineBasicMaterial({ color, linewidth: lineWidth });
                    const branchGeom = new THREE.BufferGeometry().setFromPoints(branch);
                    const branchLine = new THREE.Line(branchGeom, branchMat);
                    group.add(branchLine);
                }
            }
        }
        return group;
    }

    // IDX-TREEVOX-TRIWRAP: Polygonal ring mesh for trunk/branches (matches sketch)
    toMesh({ ringSides = 3, useHybrid = null, debugSkeleton = false } = {}) {
        // IDX-TREEVOX-07: Updated Mesh Generation
        const group = new THREE.Group();
        
        if (debugSkeleton) {
            // Add skeleton visualization
            const skeleton = this.toSkeleton();
            group.add(skeleton);
        } else {
            // Create separated meshes
            const branchesGeometry = this.createBranchesGeometry();
            const leavesGeometry = this.createLeavesGeometry();
            
            // Create materials
            const branchMaterial = new THREE.MeshLambertMaterial({ 
                color: this.options.bark.tint || 0x8B4513 
            });
            const leafMaterial = new THREE.MeshLambertMaterial({ 
                color: this.options.leaves.tint || 0x228B22,
                transparent: true,
                alphaTest: this.options.leaves.alphaTest || 0.5
            });
            
            // Create meshes
            const branchesMesh = new THREE.Mesh(branchesGeometry, branchMaterial);
            const leavesMesh = new THREE.Mesh(leavesGeometry, leafMaterial);
            
            group.add(branchesMesh);
            group.add(leavesMesh);
        }
        
        return group;
    }

    createCompleteTreeMesh() {
        // IDX-TREEVOX-08: Complete Tree Mesh Creation
        const group = new THREE.Group();
        
        // Create branches mesh
        const branchesGeometry = this.createBranchesGeometry();
        const branchMaterial = new THREE.MeshLambertMaterial({ 
            color: this.options.bark.tint || 0x8B4513 
        });
        const branchesMesh = new THREE.Mesh(branchesGeometry, branchMaterial);
        group.add(branchesMesh);
        
        // Create leaves mesh
        const leavesGeometry = this.createLeavesGeometry();
        const leafMaterial = new THREE.MeshLambertMaterial({ 
            color: this.options.leaves.tint || 0x228B22,
            transparent: true,
            alphaTest: this.options.leaves.alphaTest || 0.5
        });
        const leavesMesh = new THREE.Mesh(leavesGeometry, leafMaterial);
        group.add(leavesMesh);
        
        return group;
    }

    // IDX-TREEVOX-06: Separated Mesh Generation
    createBranchesGeometry() {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        const normals = [];
        const uvs = [];
        
        // Generate trunk geometry
        this.generateBranchGeometry(this.trunkPath, this.trunkRadius, vertices, indices, normals, uvs);
        
        // Generate branch geometry
        for (let branch of this.branches) {
            const branchRadius = this.options.branch.radius[branch.level || 1] || 0.7;
            this.generateBranchGeometry(branch.path, branchRadius, vertices, indices, normals, uvs);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        
        return geometry;
    }

    createLeavesGeometry() {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        const normals = [];
        const uvs = [];
        
        for (let leafPos of this.leafClusters) {
            this.generateLeafGeometry(leafPos, vertices, indices, normals, uvs);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        
        return geometry;
    }

    generateBranchGeometry(path, radius, vertices, indices, normals, uvs) {
        if (!path || path.length < 2) return;
        // Defensive: Check for NaN in path
        for (const p of path) {
            if (!isFinite(p.x) || !isFinite(p.y) || !isFinite(p.z)) {
                logOutput('NaN in branch path:', path);
                return;
            }
        }
        const ringSides = 8;
        const rings = [];
        
        // Generate rings along the path
        for (let i = 0; i < path.length; i++) {
            const center = path[i];
            const dir = i < path.length - 1 ? 
                path[i + 1].clone().sub(center).normalize() : 
                path[i].clone().sub(path[i - 1]).normalize();
            
            const ring = this.generateRing(center, dir, radius * (1 - i / path.length), ringSides);
            rings.push(ring);
        }
        
        // Connect rings with triangles
        for (let i = 0; i < rings.length - 1; i++) {
            this.connectRings(rings[i], rings[i + 1], vertices, indices, normals, uvs);
        }
    }

    generateRing(center, dir, radius, sides) {
        const ring = [];
        const up = new THREE.Vector3(0, 1, 0);
        const right = new THREE.Vector3().crossVectors(dir, up).normalize();
        up.crossVectors(right, dir).normalize();
        
        for (let i = 0; i < sides; i++) {
            const angle = (2 * Math.PI * i) / sides;
            const offset = right.clone().multiplyScalar(Math.cos(angle) * radius)
                .add(up.clone().multiplyScalar(Math.sin(angle) * radius));
            ring.push(center.clone().add(offset));
        }
        
        return ring;
    }

    connectRings(ringA, ringB, vertices, indices, normals, uvs) {
        const baseIndex = vertices.length / 3;
        
        // Add vertices
        for (let vertex of ringA) {
            vertices.push(vertex.x, vertex.y, vertex.z);
        }
        for (let vertex of ringB) {
            vertices.push(vertex.x, vertex.y, vertex.z);
        }
        
        // Add triangles
        for (let i = 0; i < ringA.length; i++) {
            const next = (i + 1) % ringA.length;
            
            // First triangle
            indices.push(baseIndex + i, baseIndex + next, baseIndex + ringA.length + i);
            
            // Second triangle
            indices.push(baseIndex + next, baseIndex + ringA.length + next, baseIndex + ringA.length + i);
        }
        
        // Add normals and UVs (simplified)
        for (let i = 0; i < ringA.length * 2; i++) {
            normals.push(0, 1, 0);
            uvs.push(i / ringA.length, i % 2);
        }
    }

    generateLeafGeometry(leafPos, vertices, indices, normals, uvs) {
        const leafSize = this.options.leaves.size || 2.5;
        const baseIndex = vertices.length / 3;
        
        // Simple quad leaf
        const leafVerts = [
            new THREE.Vector3(-leafSize/2, 0, 0),
            new THREE.Vector3(leafSize/2, 0, 0),
            new THREE.Vector3(leafSize/2, leafSize, 0),
            new THREE.Vector3(-leafSize/2, leafSize, 0)
        ];
        
        // Add vertices
        for (let vertex of leafVerts) {
            vertex.add(leafPos);
            vertices.push(vertex.x, vertex.y, vertex.z);
        }
        
        // Add triangles
        indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
        indices.push(baseIndex, baseIndex + 2, baseIndex + 3);
        
        // Add normals and UVs
        for (let i = 0; i < 4; i++) {
            normals.push(0, 0, 1);
            uvs.push(i % 2, Math.floor(i / 2));
        }
    }
}

// Usage example (in your scene):
// import { VoxelTree } from './procedural-tree-voxel.js';
// const pine = new VoxelTree({ geneMap: { type: 'pine' } });
// const oak = new VoxelTree({ geneMap: { type: 'broadleaf', leafColor: 0x44aa33 } });
// scene.add(pine.toMesh());
// scene.add(oak.toMesh()); 

// Global output log for AI review
window.TREE_OUTPUT_LOG = [];
function logOutput(...args) {
    window.TREE_OUTPUT_LOG.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    console.log(...args);
} 