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
                newResult += this.rules[char] || char;
            }
            result = newResult;
        }
        return result;
    }

    // Interpret the L-system string to create 3D segments
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

    interpretChar(char) {
        switch (char) {
            case 'F':
                // Move forward and create segment
                const endPos = this.currentPos.clone().add(
                    this.currentDir.clone().multiplyScalar(this.currentLength)
                );
                
                // Apply tropism (bend toward light/gravity)
                const tropismInfluence = this.tropism.clone()
                    .sub(this.currentDir)
                    .multiplyScalar(this.tropismStrength);
                this.currentDir.add(tropismInfluence).normalize();
                
                // Add randomness
                this.currentDir.x += (Math.random() - 0.5) * this.randomness;
                this.currentDir.y += (Math.random() - 0.5) * this.randomness;
                this.currentDir.z += (Math.random() - 0.5) * this.randomness;
                this.currentDir.normalize();
                
                this.segments.push({
                    start: this.currentPos.clone(),
                    end: endPos.clone(),
                    length: this.currentLength,
                    radius: this.currentLength * 0.1 // Proportional radius
                });
                
                this.currentPos.copy(endPos);
                break;
                
            case '+':
                // Turn right (positive rotation around Y axis)
                this.currentDir.applyAxisAngle(
                    new THREE.Vector3(0, 1, 0),
                    this.angle + (Math.random() - 0.5) * this.randomness
                );
                break;
                
            case '-':
                // Turn left (negative rotation around Y axis)
                this.currentDir.applyAxisAngle(
                    new THREE.Vector3(0, 1, 0),
                    -this.angle + (Math.random() - 0.5) * this.randomness
                );
                break;
                
            case '[':
                // Save state (branch)
                this.stack.push({
                    pos: this.currentPos.clone(),
                    dir: this.currentDir.clone(),
                    length: this.currentLength
                });
                this.currentLength *= this.lengthFactor;
                break;
                
            case ']':
                // Restore state (end branch)
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
        this.influenceRadius = params.influenceRadius || 2.0;
        this.killRadius = params.killRadius || 0.5;
        this.stepSize = params.stepSize || 0.5;
        this.pointDensity = params.pointDensity || 0.1;
        this.maxIterations = params.maxIterations || 100;
        this.minSegmentLength = params.minSegmentLength || 0.1;
        
        this.attractionPoints = [];
        this.skeletonSegments = [];
        this.fineBranches = [];
    }

    // Distribute attraction points in the crown volume
    distributeAttractionPoints(crownCenter, crownRadius, crownHeight) {
        this.attractionPoints = [];
        const numPoints = Math.floor(crownRadius * crownRadius * crownHeight * this.pointDensity);
        
        for (let i = 0; i < numPoints; i++) {
            // Random position within crown volume (ellipsoid)
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = Math.pow(Math.random(), 1/3) * crownRadius;
            
            const x = crownCenter.x + r * Math.sin(phi) * Math.cos(theta);
            const y = crownCenter.y + Math.random() * crownHeight;
            const z = crownCenter.z + r * Math.sin(phi) * Math.sin(theta);
            
            this.attractionPoints.push(new THREE.Vector3(x, y, z));
        }
    }

    // Set the L-system skeleton as the base for fine branching
    setSkeleton(skeletonSegments) {
        this.skeletonSegments = skeletonSegments;
        this.fineBranches = [];
        
        // Initialize fine branches from skeleton endpoints
        skeletonSegments.forEach(segment => {
            this.fineBranches.push({
                start: segment.start.clone(),
                end: segment.end.clone(),
                direction: segment.end.clone().sub(segment.start).normalize(),
                length: segment.length,
                radius: segment.radius * 0.5, // Smaller than main skeleton
                active: true
            });
        });
    }

    // Grow fine branches toward attraction points
    growFineBranches() {
        for (let iteration = 0; iteration < this.maxIterations; iteration++) {
            let hasGrowth = false;
            
            // For each active branch tip
            for (let i = 0; i < this.fineBranches.length; i++) {
                const branch = this.fineBranches[i];
                if (!branch.active) continue;
                
                // Find attraction points within influence radius
                const nearbyPoints = [];
                for (let j = this.attractionPoints.length - 1; j >= 0; j--) {
                    const point = this.attractionPoints[j];
                    const distance = branch.end.distanceTo(point);
                    
                    if (distance <= this.killRadius) {
                        // Kill this attraction point
                        this.attractionPoints.splice(j, 1);
                    } else if (distance <= this.influenceRadius) {
                        nearbyPoints.push(point);
                    }
                }
                
                if (nearbyPoints.length > 0) {
                    // Calculate growth direction (average toward nearby points)
                    const growthDir = new THREE.Vector3();
                    nearbyPoints.forEach(point => {
                        const dir = point.clone().sub(branch.end).normalize();
                        growthDir.add(dir);
                    });
                    growthDir.normalize();
                    
                    // Grow the branch
                    const newEnd = branch.end.clone().add(
                        growthDir.multiplyScalar(this.stepSize)
                    );
                    
                    // Check if growth is significant
                    const growthLength = branch.end.distanceTo(newEnd);
                    if (growthLength >= this.minSegmentLength) {
                        // Update branch
                        branch.end.copy(newEnd);
                        branch.direction.copy(growthDir);
                        branch.length += growthLength;
                        hasGrowth = true;
                        
                        // Occasionally spawn new branches
                        if (Math.random() < 0.1 && branch.length < 5.0) {
                            const newBranchDir = growthDir.clone().applyAxisAngle(
                                new THREE.Vector3(0, 1, 0),
                                (Math.random() - 0.5) * Math.PI / 3
                            );
                            
                            this.fineBranches.push({
                                start: branch.end.clone(),
                                end: branch.end.clone().add(newBranchDir.multiplyScalar(this.stepSize)),
                                direction: newBranchDir,
                                length: this.stepSize,
                                radius: branch.radius * 0.8,
                                active: true
                            });
                        }
                    }
                } else {
                    // No nearby points, deactivate branch
                    branch.active = false;
                }
            }
            
            // Stop if no growth occurred
            if (!hasGrowth) break;
        }
        
        return this.fineBranches;
    }

    // Generate fine branches from L-system skeleton
    generate(skeletonSegments, crownCenter, crownRadius, crownHeight) {
        this.setSkeleton(skeletonSegments);
        this.distributeAttractionPoints(crownCenter, crownRadius, crownHeight);
        return this.growFineBranches();
    }
}

export class VoxelTree {
    constructor({ geneMap = {}, useHybrid = true, ...params } = {}) {
        // Determine tree type and merge geneMap with defaults
        const type = geneMap.type || 'broadleaf';
        const base = TREE_TYPES[type] || TREE_TYPES.broadleaf;
        const genes = { ...base, ...geneMap, ...params };
        
        // Traditional parameters
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
        
        // Hybrid approach parameters
        this.useHybrid = useHybrid;
        this.lSystemParams = genes.lSystemParams || {
            axiom: 'F',
            rules: { 'F': 'FF+[+F-F-F]-[-F+F+F]' },
            iterations: 4,
            angle: Math.PI / 6,
            length: 2.0,
            lengthFactor: 0.7,
            tropismStrength: 0.1,
            randomness: 0.1
        };
        this.spaceColonizationParams = genes.spaceColonizationParams || {
            influenceRadius: 2.0,
            killRadius: 0.5,
            stepSize: 0.5,
            pointDensity: 0.1,
            maxIterations: 100,
            minSegmentLength: 0.1
        };
        
        // Data structures
        this.trunkPath = [];
        this.branches = [];
        this.leafClusters = [];
        this.lSystemSkeleton = null;
        this.spaceColonization = null;
        this.hybridSegments = [];
        
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
    generateBranch(start, direction, length, level, parentAngle = null) {
        let path = [start.clone()];
        let dir = direction.clone().normalize();
        let pos = start.clone();
        // IDX-TREEPROMPT: Increase branchCurve for more arching branches
        const curve = this.branchCurve * 1.5;
        for (let i = 1; i <= length; i++) {
            // Curve the branch more for realism
            dir.x += this.randomBetween(-curve * 0.3, curve * 0.3);
            dir.y += this.randomBetween(-curve * 0.15, curve * 0.15);
            dir.z += this.randomBetween(-curve * 0.3, curve * 0.3);
            dir.normalize();
            pos = pos.clone().add(dir);
            path.push(pos.clone());
            // Recursively spawn sub-branches
            if (level < this.branchLevels && i > length * 0.4 && Math.random() < 0.18) {
                // Sub-branch: inherit parent angle, but add small random offset, clamp to 100-115 deg
                let baseAngle = (parentAngle !== null ? parentAngle : this.branchAngleRad);
                let subAngle = baseAngle + this.randomBetween(-Math.PI/18, Math.PI/18);
                subAngle = Math.max(Math.PI*100/180, Math.min(subAngle, Math.PI*115/180)); // Clamp 100-115 deg
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
        // Only add leaf cluster at the end of terminal branches
        if (level === this.branchLevels) {
            this.leafClusters.push(pos.clone());
        }
        return path;
    }

    generateBranches() {
        // IDX-TREEPROMPT: Branch placement uses phyllotaxis spiral and realistic elevation angles.
        // Angle is measured from vertical (Y axis). 90 deg = horizontal, >90 deg = drooping downward.
        // TODO (IDX-TREEPROMPT): Implement species-specific droopiness.
        // TODO (IDX-TREEPROMPT): Add dynamic trunk/branch ratio by species/age.
        const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.399 rad
        let branchAngleRad = (this.branchAngleDeg || 110) * Math.PI / 180;
        // Clamp to 100-115 deg for realism (drooping allowed)
        branchAngleRad = Math.max(Math.PI*100/180, Math.min(branchAngleRad, Math.PI*115/180));
        this.branchAngleRad = branchAngleRad; // For sub-branches
        const baseLength = this.branchLength * 1.2; // Slightly longer for main branches
        const trunkLen = this.trunkPath.length;
        for (let i = 0; i < this.numBranches; i++) {
            // Evenly space branches vertically, with slight random offset
            const t = (i + 0.5) / this.numBranches;
            let trunkIdx = Math.floor(t * (trunkLen - 1));
            // Add a small random vertical offset to branch base
            trunkIdx = Math.max(1, Math.min(trunkLen - 2, trunkIdx + Math.floor(this.randomBetween(-1, 2))));
            const trunkBase = this.trunkPath[trunkIdx];
            // Spiral around trunk using golden angle
            const azimuth = i * goldenAngle;
            // Elevation angle from trunk (species-dependent)
            const angle = branchAngleRad + this.randomBetween(-Math.PI/36, Math.PI/36); // ±5°
            // Offset branch base outward from trunk axis (IDX-TREEPROMPT)
            const trunkDir = this.trunkPath[trunkIdx + 1].clone().sub(this.trunkPath[trunkIdx - 1]).normalize();
            const outward = new THREE.Vector3(Math.cos(azimuth), 0, Math.sin(azimuth)).normalize();
            const baseOffset = outward.clone().multiplyScalar(this.trunkRadius * 1.1 + 0.1 * this.randomBetween(0.8, 1.2));
            const start = trunkBase.clone().add(baseOffset);
            // Spherical to Cartesian (angle from vertical)
            const dir = new THREE.Vector3(
                Math.sin(angle) * Math.cos(azimuth),
                Math.cos(angle),
                Math.sin(angle) * Math.sin(azimuth)
            ).normalize();
            // Allometric scaling: longer branches lower, shorter higher
            const heightFrac = t;
            const length = Math.floor(baseLength * (1 - 0.4 * heightFrac) * this.randomBetween(0.9, 1.1));
            this.branches.push(this.generateBranch(start, dir, length, 1, angle));
        }
    }

    generate() {
        if (this.useHybrid) {
            // Use hybrid L-System + Space Colonization approach
            this.generateHybrid();
        } else {
            // Use traditional approach
            this.trunkPath = [];
            this.branches = [];
            this.leafClusters = [];
            this.generateTrunk();
            this.generateBranches();
        }
    }

    // Helper: get branch tip directions for leaf orientation
    getLeafTipDirections() {
        const tips = [];
        if (this.branches && this.branches.length > 0) {
            for (const branch of this.branches) {
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
        const branchMat = new THREE.LineBasicMaterial({ color: colorBranch, linewidth: lineWidth });
        // Trunk
        if (this.trunkPath && this.trunkPath.length > 1) {
            const trunkGeom = new THREE.BufferGeometry().setFromPoints(this.trunkPath);
            const trunkLine = new THREE.Line(trunkGeom, trunkMat);
            group.add(trunkLine);
        }
        // Branches
        if (this.branches && this.branches.length > 0) {
            for (const branch of this.branches) {
                if (branch.length > 1) {
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
        if (debugSkeleton) return this.toSkeleton();
        // Use hybrid mesh if hybrid approach was used or explicitly requested
        if (useHybrid === true || (useHybrid === null && this.useHybrid)) {
            return this.toMeshHybrid({ ringSides });
        }
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
                ring.push(v.x, v.y, v.z);
            }
            return ring;
        }
        // Build trunk as a tube of rings with tapering
        let prevRing = null;
        const trunkBaseRadius = this.trunkRadius;
        const trunkTipRadius = Math.max(0.1 * this.trunkRadius, 0.02);
        const trunkLen = this.trunkPath.length;
        for (let i = 1; i < trunkLen; i++) {
            const start = this.trunkPath[i - 1];
            const end = this.trunkPath[i];
            const dir = new THREE.Vector3().subVectors(end, start).normalize();
            const tA = (i - 1) / (trunkLen - 1);
            const tB = i / (trunkLen - 1);
            const rA = trunkBaseRadius * (1 - tA) + trunkTipRadius * tA;
            const rB = trunkBaseRadius * (1 - tB) + trunkTipRadius * tB;
            const ringA = addRing(start, dir, rA);
            const ringB = addRing(end, dir, rB);
            trunkRings.push(ringA);
            if (i === trunkLen - 1) trunkRings.push(ringB);
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
        // Build branches as tubes with tapering, connect base ring to closest trunk ring
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
            const branchBaseRadius = this.trunkRadius * 0.6;
            const branchTipRadius = Math.max(branchBaseRadius * 0.2, 0.01);
            let branchBaseRing = addRing(branch[0], branchBaseDir, branchBaseRadius);
            // Connect branch base ring to trunk ring with smoothing
            this.createSmoothedJunction(
                trunkBaseRing, branchBaseRing,
                baseRingCenter, branch[0],
                baseRingDir, branchBaseDir,
                trunkBaseRadius, branchBaseRadius,
                ringSides, addRing, vertices, faces, 2
            );
            // Continue branch as tube with tapering
            let prevRing = branchBaseRing;
            const branchLen = branch.length;
            for (let i = 1; i < branchLen; i++) {
                const start = branch[i - 1];
                const end = branch[i];
                const dir = new THREE.Vector3().subVectors(end, start).normalize();
                const tA = (i - 1) / (branchLen - 1);
                const tB = i / (branchLen - 1);
                const rA = branchBaseRadius * (1 - tA) + branchTipRadius * tA;
                const rB = branchBaseRadius * (1 - tB) + branchTipRadius * tB;
                const ringB = addRing(end, dir, rB);
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
        // Leaves (instanced quads at branch tips)
        const leafTips = this.getLeafTipDirections();
        if (leafTips.length > 0) {
            const leafMat = new THREE.MeshStandardMaterial({ color: this.leafColor, side: THREE.DoubleSide });
            const instancedLeaves = this.createInstancedLeaves(leafTips, leafMat, this.leafRadius);
            group.add(instancedLeaves);
        }
        return group;
    }

    // IDX-TREEHYBRID-03: Generate tree using hybrid L-System + Space Colonization approach
    generateHybrid() {
        // Step 1: Generate L-System skeleton
        this.lSystemSkeleton = new LSystemSkeleton(this.lSystemParams);
        const skeletonSegments = this.lSystemSkeleton.generate();
        
        // Step 2: Calculate crown parameters for space colonization
        const crownCenter = new THREE.Vector3(0, this.trunkHeight * 0.7, 0);
        const crownRadius = this.trunkHeight * 0.4;
        const crownHeight = this.trunkHeight * 0.6;
        
        // Step 3: Generate fine branches using space colonization
        this.spaceColonization = new SpaceColonization(this.spaceColonizationParams);
        const fineBranches = this.spaceColonization.generate(
            skeletonSegments, 
            crownCenter, 
            crownRadius, 
            crownHeight
        );
        
        // Step 4: Combine skeleton and fine branches
        this.hybridSegments = [
            ...skeletonSegments.map(seg => ({ ...seg, type: 'skeleton' })),
            ...fineBranches.map(branch => ({ 
                start: branch.start,
                end: branch.end,
                length: branch.length,
                radius: branch.radius,
                type: 'fine'
            }))
        ];
        
        // Step 5: Generate leaf clusters at fine branch tips
        this.leafClusters = fineBranches
            .filter(branch => !branch.active) // Terminal branches
            .map(branch => branch.end.clone());
        
        return this.hybridSegments;
    }

    // IDX-TREEHYBRID-04: Mesh generation for hybrid L-System + Space Colonization approach
    toMeshHybrid({ ringSides = 6, debugSkeleton = false } = {}) {
        if (debugSkeleton) return this.toSkeleton();
        if (!this.hybridSegments || this.hybridSegments.length === 0) {
            console.warn('No hybrid segments available. Call generateHybrid() first.');
            return new THREE.Group();
        }

        const group = new THREE.Group();
        const skeletonMat = new THREE.MeshStandardMaterial({ 
            color: this.trunkColor,
            roughness: 0.8,
            metalness: 0.1
        });
        const fineBranchMat = new THREE.MeshStandardMaterial({ 
            color: this.branchColor,
            roughness: 0.9,
            metalness: 0.0
        });
        const leafMat = new THREE.MeshStandardMaterial({ 
            color: this.leafColor,
            roughness: 0.3,
            metalness: 0.0
        });

        let vertices = [];
        let faces = [];
        let vertexIndex = 0;

        // Helper: generate a ring of vertices around axis at center
        function addRing(center, dir, radius, ringSides) {
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
                
                ring.push(vertexIndex++);
                vertices.push(v.x, v.y, v.z);
            }
            return ring;
        }

        // Helper: connect two rings with triangles
        function connectRings(ringA, ringB, ringSides) {
            for (let j = 0; j < ringSides; j++) {
                const a = ringA[j];
                const b = ringB[j];
                const c = ringB[(j + 1) % ringSides];
                const d = ringA[(j + 1) % ringSides];
                faces.push(a, b, c);
                faces.push(a, c, d);
            }
        }

        // Group segments by type for different materials
        const skeletonSegments = this.hybridSegments.filter(seg => seg.type === 'skeleton');
        const fineSegments = this.hybridSegments.filter(seg => seg.type === 'fine');

        // Process skeleton segments (main structure) with tapering
        if (skeletonSegments.length > 0) {
            let skeletonVertices = [];
            let skeletonFaces = [];
            let skeletonVertexIndex = 0;

            for (const segment of skeletonSegments) {
                const dir = new THREE.Vector3().subVectors(segment.end, segment.start).normalize();
                const baseRadius = segment.radius;
                const tipRadius = Math.max(baseRadius * 0.2, 0.01);
                const ringA = addRing(segment.start, dir, baseRadius, ringSides);
                const ringB = addRing(segment.end, dir, tipRadius, ringSides);
                // Store for skeleton geometry
                skeletonVertices.push(...vertices.slice(vertexIndex - ringSides * 2, vertexIndex));
                connectRings(ringA, ringB, ringSides);
                skeletonFaces.push(...faces.slice(faces.length - ringSides * 6));
            }

            // Create skeleton mesh
            if (skeletonVertices.length > 0) {
                const skeletonGeometry = new THREE.BufferGeometry();
                skeletonGeometry.setAttribute('position', new THREE.Float32BufferAttribute(skeletonVertices, 3));
                skeletonGeometry.setIndex(skeletonFaces);
                skeletonGeometry.computeVertexNormals();
                const skeletonMesh = new THREE.Mesh(skeletonGeometry, skeletonMat);
                group.add(skeletonMesh);
            }
        }

        // Process fine segments (secondary branches) with tapering
        if (fineSegments.length > 0) {
            let fineVertices = [];
            let fineFaces = [];
            let fineVertexIndex = 0;

            for (const segment of fineSegments) {
                const dir = new THREE.Vector3().subVectors(segment.end, segment.start).normalize();
                const baseRadius = segment.radius;
                const tipRadius = Math.max(baseRadius * 0.2, 0.005);
                const ringA = addRing(segment.start, dir, baseRadius, ringSides);
                const ringB = addRing(segment.end, dir, tipRadius, ringSides);
                // Store for fine branch geometry
                fineVertices.push(...vertices.slice(vertexIndex - ringSides * 2, vertexIndex));
                connectRings(ringA, ringB, ringSides);
                fineFaces.push(...faces.slice(faces.length - ringSides * 6));
            }

            // Create fine branch mesh
            if (fineVertices.length > 0) {
                const fineGeometry = new THREE.BufferGeometry();
                fineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(fineVertices, 3));
                fineGeometry.setIndex(fineFaces);
                fineGeometry.computeVertexNormals();
                const fineMesh = new THREE.Mesh(fineGeometry, fineBranchMat);
                group.add(fineMesh);
            }
        }

        // Leaves (instanced quads at branch tips)
        const leafTips = this.getLeafTipDirections();
        if (leafTips.length > 0) {
            const leafMat = new THREE.MeshStandardMaterial({ color: this.leafColor, side: THREE.DoubleSide });
            const instancedLeaves = this.createInstancedLeaves(leafTips, leafMat, this.leafRadius * 0.7);
            group.add(instancedLeaves);
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