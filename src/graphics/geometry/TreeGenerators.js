import * as THREE from 'three';

// IDX-DOC-00: For index reference format, see INDEX_DESCRIBER.md
// IDX-TREEGEN-OUTLINE: Realistic Tree Generator Improvement Plan
//
// IDX-TREEGEN-01: Increase Polygon Count and Smoothness
//   - Use more radial segments for rings
//   - Add more points along each branch for smoother curves
//
// IDX-TREEGEN-02: Improve Branch Junctions
//   - Blend geometry at splits using mesh merging or implicit surfaces
//   - Consider marching cubes or metaball techniques for seamless transitions
//
// IDX-TREEGEN-03: Add Bark and Leaf Texture
//   - Apply procedural or image-based textures to bark
//   - Add UVs to geometry
//
// IDX-TREEGEN-04: Enhance Foliage Distribution
//   - Distribute leaves along branches, not just at tips
//   - Use instanced geometry or billboards for dense foliage
//
// IDX-TREEGEN-05: Add More Hierarchical Branching
//   - Support multiple levels of branching, down to twigs
//
// IDX-TREEGEN-06: Introduce More Irregularity
//   - Add random bends, twists, and noise to trunk and branches
//
// Steps will be implemented sequentially, with each section using the IDX-TREEGEN index for traceability.

class ProceduralTreeGenerator {
    constructor(scene) {
        this.scene = scene;
        this.rng = null;
        this.skeleton = [];
        this.mesh = null;
    }

    async loadAndRender(url, position = new THREE.Vector3(0, 0, 0)) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const options = await response.json();
            this.generateTree(options, position);
        } catch (error) {
            console.error("Failed to load or render tree:", error);
        }
    }

    generateTree(options, position) {
        // Simple seedable random number generator
        this.rng = (seed => {
            let s = seed % 2147483647;
            if (s <= 0) s += 2147483646;
            return () => {
                s = s * 16807 % 2147483647;
                return (s - 1) / 2147483646;
            };
        })(options.seed);

        this.skeleton = [];
        const treeObject = new THREE.Group();
        treeObject.position.copy(position);

        const trunkParams = {
            level: 0,
            origin: new THREE.Vector3(0, 0, 0),
            orientation: new THREE.Euler(0, 0, 0),
            length: options.branch.length[0],
            radius: options.branch.radius[0],
            parent: null,
            branchId: 0
        };

        this.branchIdCounter = 0;
        this._skeletonBranches = [];
        this.generateBranch(trunkParams, options, treeObject, []);
        this.skeleton = this._skeletonBranches;

        // Generate organic mesh
        this.mesh = this.generateOrganicMeshFromSkeleton(this.skeleton, options);
        if (this.mesh) treeObject.add(this.mesh);

        this.scene.add(treeObject);
    }

    // Recursively build skeleton and mesh
    generateBranch(params, options, parentObject, currentBranchPoints) {
        const { level, origin, orientation, length, radius, parent, branchId } = params;
        const branchOptions = options.branch;

        // Add this point to the current branch skeleton
        const worldOrigin = origin.clone();
        if (parent) worldOrigin.applyEuler(parent.orientation).add(parent.origin);
        currentBranchPoints = currentBranchPoints.slice();
        currentBranchPoints.push({
            position: worldOrigin.clone(),
            radius: radius,
            level: level
        });

        // If this is the start of a new branch, push to skeleton array
        if (currentBranchPoints.length === 1) {
            this.branchIdCounter++;
        }

        // --- Recursive call for child branches ---
        let isLeaf = false;
        if (level < branchOptions.levels) {
            const childCount = branchOptions.children[level];
            const childLevel = level + 1;
            for (let i = 0; i < childCount; i++) {
                // Calculate new origin at some point along this branch
                const startRatio = branchOptions.start[level] + this.rng() * (1 - branchOptions.start[level]);
                const newOrigin = new THREE.Vector3(0, startRatio * length, 0);
                // Calculate the orientation for the child branch
                const angle = (branchOptions.angle[level] + (this.rng() - 0.5) * 2 * branchOptions.angle_variance[level]) * (Math.PI / 180);
                const radialAngle = (i / childCount) * 2 * Math.PI + this.rng() * Math.PI;
                const qAngle = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), angle);
                const qRadial = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), radialAngle);
                const childQuaternion = new THREE.Quaternion().setFromEuler(orientation);
                childQuaternion.multiply(qRadial.multiply(qAngle));
                const childParams = {
                    level: childLevel,
                    origin: newOrigin,
                    orientation: new THREE.Euler().setFromQuaternion(childQuaternion, 'YXZ'),
                    length: branchOptions.length[childLevel],
                    radius: branchOptions.radius[childLevel],
                    parent: { origin, orientation },
                    branchId: this.branchIdCounter
                };
                // Recursively build child branch
                this.generateBranch(childParams, options, parentObject, currentBranchPoints);
            }
        } else {
            isLeaf = true;
        }
        // If this is a leaf or end of branch, store the branch skeleton
        if (isLeaf || level === branchOptions.levels) {
            this._skeletonBranches.push(currentBranchPoints);
        }
    }

    // Generate a single organic mesh from the skeleton
    generateOrganicMeshFromSkeleton(skeleton, options) {
        const radialSegments = 20;
        const noiseAmount = 0.15;
        const geometry = new THREE.BufferGeometry();
        let vertices = [];
        let faces = [];
        // For each branch
        for (const branch of skeleton) {
            // Interpolate more points along each branch segment
            for (let i = 0; i < branch.length - 1; i++) {
                const p0 = branch[i].position;
                const p1 = branch[i + 1].position;
                const r0 = branch[i].radius;
                const r1 = branch[i + 1].radius;
                const steps = 5; // Number of interpolated segments per branch segment
                let prevRing = null;
                for (let s = 0; s < steps; s++) {
                    const t0 = s / steps;
                    const t1 = (s + 1) / steps;
                    // Interpolate position and radius
                    const posA = p0.clone().lerp(p1, t0);
                    const posB = p0.clone().lerp(p1, t1);
                    const radA = r0 + (r1 - r0) * t0;
                    const radB = r0 + (r1 - r0) * t1;
                    // Direction and frame
                    const dir = new THREE.Vector3().subVectors(posB, posA).normalize();
                    let up = Math.abs(dir.y) < 0.99 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
                    const right = new THREE.Vector3().crossVectors(dir, up).normalize();
                    up = new THREE.Vector3().crossVectors(right, dir).normalize();
                    // Generate rings
                    const ringA = [];
                    const ringB = [];
                    for (let j = 0; j < radialSegments; j++) {
                        const theta = (j / radialSegments) * Math.PI * 2;
                        const cos = Math.cos(theta);
                        const sin = Math.sin(theta);
                        // Add noise for organic look
                        const noiseA = (this.rng() - 0.5) * noiseAmount * radA;
                        const noiseB = (this.rng() - 0.5) * noiseAmount * radB;
                        const vA = posA.clone().add(right.clone().multiplyScalar((radA + noiseA) * cos)).add(up.clone().multiplyScalar((radA + noiseA) * sin));
                        const vB = posB.clone().add(right.clone().multiplyScalar((radB + noiseB) * cos)).add(up.clone().multiplyScalar((radB + noiseB) * sin));
                        ringA.push(vertices.length);
                        vertices.push(vA.x, vA.y, vA.z);
                        ringB.push(vertices.length);
                        vertices.push(vB.x, vB.y, vB.z);
                    }
                    // Connect rings with faces
                    if (prevRing) {
                        for (let j = 0; j < radialSegments; j++) {
                            const a = prevRing[j];
                            const b = ringA[j];
                            const c = ringA[(j + 1) % radialSegments];
                            const d = prevRing[(j + 1) % radialSegments];
                            faces.push(a / 3, b / 3, c / 3);
                            faces.push(a / 3, c / 3, d / 3);
                        }
                    }
                    prevRing = ringB;
                }
            }
        }
        if (vertices.length === 0 || faces.length === 0) return null;
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(faces);
        geometry.computeVertexNormals();
        const material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        return new THREE.Mesh(geometry, material);
    }

    // Export the generated mesh as OBJ
    exportOBJ(filename = 'tree.obj') {
        if (!this.mesh) return;
        const geometry = this.mesh.geometry;
        const pos = geometry.getAttribute('position');
        const idx = geometry.getIndex();
        let obj = '';
        for (let i = 0; i < pos.count; i++) {
            obj += `v ${pos.getX(i)} ${pos.getY(i)} ${pos.getZ(i)}\n`;
        }
        for (let i = 0; i < idx.count; i += 3) {
            obj += `f ${idx.getX(i) + 1} ${idx.getX(i + 1) + 1} ${idx.getX(i + 2) + 1}\n`;
        }
        // Download as file
        const blob = new Blob([obj], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

export default ProceduralTreeGenerator; 