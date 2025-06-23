import * as THREE from 'three';
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js';

class VoxelObjectGenerator {
    constructor(resolution) {
        this.resolution = resolution;
        this.data = new Float32Array(resolution * resolution * resolution);
        this.size = new THREE.Vector3(1, 1, 1);
        this.isolation = 0; 
    }

    fill(value) {
        this.data.fill(value);
    }

    generateMesh(material) {
        const effect = new MarchingCubes(this.resolution, material, true, true, this.data.length);
        effect.position.set(0, 0, 0);
        effect.scale.set(this.size.x, this.size.y, this.size.z);
        effect.isolation = this.isolation;
        effect.field = this.data;

        return effect;
    }

    getIndex(x, y, z) {
        return Math.floor(x) + this.resolution * (Math.floor(y) + this.resolution * Math.floor(z));
    }
    
    addSphere(center, radius) {
        for (let i = 0; i < this.resolution; i++) {
            for (let j = 0; j < this.resolution; j++) {
                for (let k = 0; k < this.resolution; k++) {
                    const point = new THREE.Vector3(
                        (i / (this.resolution - 1)) * this.size.x,
                        (j / (this.resolution - 1)) * this.size.y,
                        (k / (this.resolution - 1)) * this.size.z
                    );
                    const distance = point.distanceTo(center);

                    if (distance <= radius) {
                        const index = this.getIndex(i, j, k);
                        const value = (1.0 - (distance / radius)) * 2;
                        this.data[index] += value;
                    }
                }
            }
        }
    }

    addCylinder(start, end, radius) {
        const line = new THREE.Line3(start, end);
        const closestPoint = new THREE.Vector3();

        for (let i = 0; i < this.resolution; i++) {
            for (let j = 0; j < this.resolution; j++) {
                for (let k = 0; k < this.resolution; k++) {
                     const point = new THREE.Vector3(
                        (i / (this.resolution - 1)) * this.size.x,
                        (j / (this.resolution - 1)) * this.size.y,
                        (k / (this.resolution - 1)) * this.size.z
                    );

                    line.closestPointToPoint(point, true, closestPoint);
                    const distance = point.distanceTo(closestPoint);

                    if (distance <= radius) {
                        const index = this.getIndex(i, j, k);
                        const value = (1.0 - (distance / radius)) * 2;
                        this.data[index] += value;
                    }
                }
            }
        }
    }
}

export default VoxelObjectGenerator; 