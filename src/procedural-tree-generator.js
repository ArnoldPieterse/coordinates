import * as THREE from 'three';

class ProceduralTreeGenerator {
    constructor(scene) {
        this.scene = scene;
        this.rng = null;
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

        const treeObject = new THREE.Group();
        treeObject.position.copy(position);

        const trunkParams = {
            level: 0,
            origin: new THREE.Vector3(0, 0, 0),
            orientation: new THREE.Euler(0, 0, 0),
            length: options.branch.length[0],
            radius: options.branch.radius[0],
        };

        this.generateBranch(trunkParams, options, treeObject);

        this.scene.add(treeObject);
    }

    generateBranch(params, options, parentObject) {
        const { level, origin, orientation, length, radius } = params;
        const branchOptions = options.branch;

        // Create the branch geometry (a simple cylinder for now)
        const geometry = new THREE.CylinderGeometry(radius * 0.8, radius, length, branchOptions.segments[level]);
        const material = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown color for branches
        const branchMesh = new THREE.Mesh(geometry, material);

        // Position and orient the branch
        branchMesh.position.copy(origin);
        branchMesh.quaternion.setFromEuler(orientation);
        
        // Offset cylinder to start at the origin
        branchMesh.position.y += length / 2;

        parentObject.add(branchMesh);

        // --- Recursive call for child branches ---
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
                };

                this.generateBranch(childParams, options, branchMesh);
            }
        } else {
             // --- Generate leaves at the end of the final branches ---
             if (options.leaves.enabled) {
                const leafOptions = options.leaves;
                for (let i = 0; i < leafOptions.count_per_branch; i++) {
                    const leafSize = leafOptions.size + (this.rng() - 0.5) * 2 * leafOptions.size_variance;
                    const leafGeometry = new THREE.PlaneGeometry(leafSize, leafSize);
                    const leafMaterial = new THREE.MeshBasicMaterial({ 
                        color: new THREE.Color(parseInt(leafOptions.color)), 
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.8
                    });
                    const leafMesh = new THREE.Mesh(leafGeometry, leafMaterial);

                    // Position leaf at the end of the branch
                    const leafOrigin = new THREE.Vector3(0, length, 0);

                    // Give it a random-ish orientation
                    leafOrigin.x += (this.rng() - 0.5) * leafSize * 2;
                    leafOrigin.z += (this.rng() - 0.5) * leafSize * 2;
                    leafMesh.position.copy(leafOrigin);
                    leafMesh.rotation.set(this.rng() * Math.PI, this.rng() * Math.PI, this.rng() * Math.PI);
                    
                    branchMesh.add(leafMesh);
                }
            }
        }
    }
}

export default ProceduralTreeGenerator; 