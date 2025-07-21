// Advanced Optimization System - Phase 7 Implementation
// Implements LOD, frustum culling, object pooling, and WebGL optimizations

import * as THREE from './three.module.js';

// ============================================================================
// 1. LEVEL OF DETAIL (LOD) SYSTEM
// ============================================================================

class LODSystem {
    constructor() {
        this.lodLevels = new Map();
        this.lodObjects = new Map();
        this.transitionThresholds = [0, 10, 50, 100]; // distance thresholds
        this.qualityLevels = ['ultra', 'high', 'medium', 'low'];
        this.currentLOD = new Map();
        
        this.config = {
            enableLOD: true,
            autoLOD: true,
            transitionSmoothness: 0.1,
            maxLODDistance: 200,
            minLODDistance: 5
        };
    }

    createLODLevels(object, levels = ['ultra', 'high', 'medium', 'low']) {
        const lods = [];
        
        for (const level of levels) {
            const geometry = this.generateLODGeometry(object, level);
            const material = this.generateLODMaterial(object, level);
            const mesh = new THREE.Mesh(geometry, material);
            
            // Copy original object properties
            mesh.position.copy(object.position);
            mesh.rotation.copy(object.rotation);
            mesh.scale.copy(object.scale);
            mesh.castShadow = object.castShadow;
            mesh.receiveShadow = object.receiveShadow;
            
            lods.push(mesh);
        }
        
        const lodObject = new THREE.LOD();
        for (let i = 0; i < lods.length; i++) {
            lodObject.addLevel(lods[i], this.transitionThresholds[i]);
        }
        
        this.lodLevels.set(object.id, lodObject);
        this.lodObjects.set(object.id, { original: object, lods: lods });
        
        return lodObject;
    }

    generateLODGeometry(object, level) {
        const geometry = object.geometry.clone();
        
        switch (level) {
            case 'ultra':
                return geometry; // Keep original geometry
                
            case 'high':
                return this.simplifyGeometry(geometry, 0.5);
                
            case 'medium':
                return this.simplifyGeometry(geometry, 0.25);
                
            case 'low':
                return this.simplifyGeometry(geometry, 0.1);
                
            default:
                return geometry;
        }
    }

    simplifyGeometry(geometry, factor) {
        // Simple geometry simplification
        const positions = geometry.getAttribute('position');
        const indices = geometry.getIndex();
        
        if (!indices) return geometry;
        
        // Create simplified geometry by removing vertices
        const newIndices = [];
        const skipFactor = Math.floor(1 / factor);
        
        for (let i = 0; i < indices.count; i += skipFactor) {
            newIndices.push(indices.getX(i));
            if (i + 1 < indices.count) newIndices.push(indices.getX(i + 1));
            if (i + 2 < indices.count) newIndices.push(indices.getX(i + 2));
        }
        
        const newGeometry = geometry.clone();
        newGeometry.setIndex(newIndices);
        newGeometry.computeVertexNormals();
        
        return newGeometry;
    }

    generateLODMaterial(object, level) {
        const material = object.material.clone();
        
        switch (level) {
            case 'ultra':
                return material; // Keep original material
                
            case 'high':
                material.wireframe = false;
                material.transparent = false;
                break;
                
            case 'medium':
                material.wireframe = false;
                material.transparent = false;
                material.roughness = 0.8;
                break;
                
            case 'low':
                material.wireframe = true;
                material.transparent = false;
                break;
        }
        
        return material;
    }

    updateLOD(object, camera, renderer) {
        if (!this.config.enableLOD) return;
        
        const distance = camera.position.distanceTo(object.position);
        const screenSize = this.calculateScreenSize(object, camera, renderer);
        
        const targetLOD = this.determineTargetLOD(distance, screenSize);
        const currentLOD = this.currentLOD.get(object.id) || 'high';
        
        if (targetLOD !== currentLOD) {
            this.switchLOD(object, targetLOD);
            this.currentLOD.set(object.id, targetLOD);
        }
    }

    calculateScreenSize(object, camera, renderer) {
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        // Transform to camera space
        const cameraSpace = center.clone().applyMatrix4(camera.matrixWorldInverse);
        
        // Project to screen space
        const screenSpace = cameraSpace.clone().project(camera);
        
        // Convert to pixel coordinates
        const pixelSize = Math.max(size.x, size.y, size.z) * renderer.domElement.height / (2 * Math.tan(camera.fov * Math.PI / 360) * cameraSpace.length());
        
        return pixelSize;
    }

    determineTargetLOD(distance, screenSize) {
        if (distance < this.config.minLODDistance) return 'ultra';
        if (distance > this.config.maxLODDistance) return 'low';
        
        if (screenSize > 100) return 'ultra';
        if (screenSize > 50) return 'high';
        if (screenSize > 20) return 'medium';
        return 'low';
    }

    switchLOD(object, targetLOD) {
        const lodData = this.lodObjects.get(object.id);
        if (!lodData) return;
        
        const lodIndex = this.qualityLevels.indexOf(targetLOD);
        if (lodIndex === -1) return;
        
        // Replace object with appropriate LOD level
        const parent = object.parent;
        const lodObject = this.lodLevels.get(object.id);
        
        if (parent && lodObject) {
            parent.remove(object);
            parent.add(lodObject);
        }
    }

    setConfig(config) {
        this.config = { ...this.config, ...config };
    }
}

// ============================================================================
// 2. FRUSTUM CULLING SYSTEM
// ============================================================================

class FrustumCullingSystem {
    constructor() {
        this.frustum = new THREE.Frustum();
        this.projectionMatrix = new THREE.Matrix4();
        this.viewMatrix = new THREE.Matrix4();
        this.culledObjects = new Set();
        this.visibleObjects = new Set();
        
        this.config = {
            enableCulling: true,
            cullingMargin: 1.0,
            updateInterval: 100, // ms
            lastUpdate: 0
        };
    }

    updateFrustum(camera) {
        this.projectionMatrix.copy(camera.projectionMatrix);
        this.viewMatrix.copy(camera.matrixWorldInverse);
        
        this.frustum.setFromProjectionMatrix(
            new THREE.Matrix4().multiplyMatrices(this.projectionMatrix, this.viewMatrix)
        );
    }

    isInFrustum(object) {
        if (!this.config.enableCulling) return true;
        
        const box = new THREE.Box3().setFromObject(object);
        
        // Apply culling margin
        const margin = this.config.cullingMargin;
        box.expandByScalar(margin);
        
        return this.frustum.intersectsBox(box);
    }

    updateCulling(objects, camera) {
        const currentTime = performance.now();
        if (currentTime - this.config.lastUpdate < this.config.updateInterval) {
            return;
        }
        
        this.updateFrustum(camera);
        this.visibleObjects.clear();
        this.culledObjects.clear();
        
        objects.forEach(object => {
            if (this.isInFrustum(object)) {
                this.visibleObjects.add(object);
                if (object.visible === false) {
                    object.visible = true;
                }
            } else {
                this.culledObjects.add(object);
                if (object.visible === true) {
                    object.visible = false;
                }
            }
        });
        
        this.config.lastUpdate = currentTime;
    }

    getVisibleObjects() {
        return Array.from(this.visibleObjects);
    }

    getCulledObjects() {
        return Array.from(this.culledObjects);
    }

    setConfig(config) {
        this.config = { ...this.config, ...config };
    }
}

// ============================================================================
// 3. OBJECT POOLING SYSTEM
// ============================================================================

class ObjectPool {
    constructor() {
        this.pools = new Map();
        this.activeObjects = new Map();
        this.inactiveObjects = new Map();
        
        this.config = {
            enablePooling: true,
            maxPoolSize: 1000,
            cleanupInterval: 5000, // ms
            lastCleanup: 0
        };
    }

    createPool(objectType, factory, maxSize = 100) {
        const pool = {
            factory: factory,
            maxSize: maxSize,
            active: [],
            inactive: [],
            stats: {
                created: 0,
                reused: 0,
                destroyed: 0
            }
        };
        
        this.pools.set(objectType, pool);
        return pool;
    }

    getObject(objectType, ...args) {
        if (!this.config.enablePooling) {
            return this.pools.get(objectType)?.factory(...args);
        }
        
        const pool = this.pools.get(objectType);
        if (!pool) return null;
        
        let object;
        
        if (pool.inactive.length > 0) {
            object = pool.inactive.pop();
            pool.stats.reused++;
        } else if (pool.active.length < pool.maxSize) {
            object = pool.factory(...args);
            pool.stats.created++;
        } else {
            // Pool is full, destroy oldest object
            const oldestObject = pool.active.shift();
            this.destroyObject(oldestObject);
            object = pool.factory(...args);
            pool.stats.created++;
        }
        
        pool.active.push(object);
        this.activeObjects.set(object.id, { type: objectType, pool: pool });
        
        return object;
    }

    returnObject(object) {
        if (!this.config.enablePooling) {
            this.destroyObject(object);
            return;
        }
        
        const objectData = this.activeObjects.get(object.id);
        if (!objectData) return;
        
        const pool = objectData.pool;
        const index = pool.active.indexOf(object);
        
        if (index > -1) {
            pool.active.splice(index, 1);
            this.activeObjects.delete(object.id);
            
            // Reset object state
            this.resetObject(object);
            
            if (pool.inactive.length < pool.maxSize) {
                pool.inactive.push(object);
            } else {
                this.destroyObject(object);
                pool.stats.destroyed++;
            }
        }
    }

    resetObject(object) {
        // Reset object to initial state
        if (object.position) object.position.set(0, 0, 0);
        if (object.rotation) object.rotation.set(0, 0, 0);
        if (object.scale) object.scale.set(1, 1, 1);
        if (object.visible !== undefined) object.visible = false;
        
        // Reset material properties
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(mat => this.resetMaterial(mat));
            } else {
                this.resetMaterial(object.material);
            }
        }
    }

    resetMaterial(material) {
        if (material.opacity !== undefined) material.opacity = 1.0;
        if (material.transparent !== undefined) material.transparent = false;
        if (material.wireframe !== undefined) material.wireframe = false;
    }

    destroyObject(object) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(mat => mat.dispose());
            } else {
                object.material.dispose();
            }
        }
    }

    cleanup() {
        const currentTime = performance.now();
        if (currentTime - this.config.lastCleanup < this.config.cleanupInterval) {
            return;
        }
        
        this.pools.forEach((pool, type) => {
            // Clean up inactive objects that exceed max size
            while (pool.inactive.length > pool.maxSize / 2) {
                const object = pool.inactive.pop();
                this.destroyObject(object);
                pool.stats.destroyed++;
            }
        });
        
        this.config.lastCleanup = currentTime;
    }

    getStats() {
        const stats = {};
        this.pools.forEach((pool, type) => {
            stats[type] = {
                active: pool.active.length,
                inactive: pool.inactive.length,
                total: pool.active.length + pool.inactive.length,
                created: pool.stats.created,
                reused: pool.stats.reused,
                destroyed: pool.stats.destroyed
            };
        });
        return stats;
    }

    setConfig(config) {
        this.config = { ...this.config, ...config };
    }
}

// ============================================================================
// 4. WEBGL OPTIMIZATION SYSTEM
// ============================================================================

class WebGLOptimizationSystem {
    constructor(renderer) {
        this.renderer = renderer;
        this.optimizations = new Map();
        
        this.config = {
            enableOptimizations: true,
            maxDrawCalls: 1000,
            maxTriangles: 100000,
            textureCompression: true,
            instancedRendering: true,
            geometryBatching: true
        };
        
        this.initializeOptimizations();
    }

    initializeOptimizations() {
        // Enable WebGL optimizations
        this.renderer.sortObjects = false; // Disable automatic sorting for better performance
        this.renderer.powerPreference = "high-performance";
        
        // Enable texture compression if supported
        if (this.config.textureCompression) {
            this.enableTextureCompression();
        }
        
        // Enable instanced rendering
        if (this.config.instancedRendering) {
            this.setupInstancedRendering();
        }
    }

    enableTextureCompression() {
        // Check for texture compression support
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        if (gl) {
            const extensions = gl.getSupportedExtensions();
            if (extensions.includes('WEBGL_compressed_texture_s3tc')) {
                console.log('S3TC texture compression supported');
            }
            if (extensions.includes('WEBGL_compressed_texture_etc')) {
                console.log('ETC texture compression supported');
            }
        }
    }

    setupInstancedRendering() {
        // Create instanced rendering utilities
        this.instancedMeshes = new Map();
        this.instanceCounts = new Map();
    }

    createInstancedMesh(geometry, material, maxInstances = 1000) {
        const instancedMesh = new THREE.InstancedMesh(geometry, material, maxInstances);
        return instancedMesh;
    }

    batchGeometry(geometries) {
        if (!this.config.geometryBatching) return geometries;
        
        const mergedGeometry = new THREE.BufferGeometry();
        const positions = [];
        const normals = [];
        const uvs = [];
        const indices = [];
        
        let indexOffset = 0;
        
        geometries.forEach(geometry => {
            const pos = geometry.getAttribute('position');
            const norm = geometry.getAttribute('normal');
            const uv = geometry.getAttribute('uv');
            const idx = geometry.getIndex();
            
            // Add vertices
            for (let i = 0; i < pos.count; i++) {
                positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
                if (norm) normals.push(norm.getX(i), norm.getY(i), norm.getZ(i));
                if (uv) uvs.push(uv.getX(i), uv.getY(i));
            }
            
            // Add indices
            if (idx) {
                for (let i = 0; i < idx.count; i++) {
                    indices.push(idx.getX(i) + indexOffset);
                }
            }
            
            indexOffset += pos.count;
        });
        
        mergedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        if (normals.length > 0) {
            mergedGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        }
        if (uvs.length > 0) {
            mergedGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        }
        if (indices.length > 0) {
            mergedGeometry.setIndex(indices);
        }
        
        return mergedGeometry;
    }

    optimizeMaterial(material) {
        // Optimize material for better performance
        if (material.transparent && material.opacity === 1.0) {
            material.transparent = false;
        }
        
        if (material.alphaTest > 0) {
            material.transparent = false;
        }
        
        // Use simpler blending for better performance
        if (material.blending === THREE.AdditiveBlending) {
            material.blending = THREE.NormalBlending;
        }
        
        return material;
    }

    checkPerformanceLimits() {
        const info = this.renderer.info;
        const drawCalls = info.render.calls;
        const triangles = info.render.triangles;
        
        const warnings = [];
        
        if (drawCalls > this.config.maxDrawCalls) {
            warnings.push(`High draw calls: ${drawCalls}/${this.config.maxDrawCalls}`);
        }
        
        if (triangles > this.config.maxTriangles) {
            warnings.push(`High triangle count: ${triangles}/${this.config.maxTriangles}`);
        }
        
        return warnings;
    }

    getPerformanceStats() {
        const info = this.renderer.info;
        return {
            drawCalls: info.render.calls,
            triangles: info.render.triangles,
            points: info.render.points,
            lines: info.render.lines,
            memory: {
                geometries: info.memory.geometries,
                textures: info.memory.textures
            },
            programs: info.programs?.length || 0
        };
    }

    setConfig(config) {
        this.config = { ...this.config, ...config };
    }
}

// ============================================================================
// 5. MOBILE OPTIMIZATION SYSTEM
// ============================================================================

class MobileOptimizationSystem {
    constructor() {
        this.isMobile = this.detectMobile();
        this.touchControls = null;
        this.mobileConfig = this.getMobileConfig();
        
        this.config = {
            enableMobileOptimizations: true,
            touchSensitivity: 1.0,
            autoQualityAdjustment: true,
            batteryOptimization: true
        };
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth < 768;
    }

    getMobileConfig() {
        return {
            maxDrawCalls: this.isMobile ? 500 : 1000,
            maxTriangles: this.isMobile ? 50000 : 100000,
            textureQuality: this.isMobile ? 'medium' : 'high',
            shadowQuality: this.isMobile ? 'low' : 'high',
            antialiasing: this.isMobile ? false : true
        };
    }

    setupTouchControls(camera, renderer) {
        if (!this.isMobile) return;
        
        this.touchControls = {
            touchStart: null,
            touchMove: null,
            sensitivity: this.config.touchSensitivity
        };
        
        const canvas = renderer.domElement;
        
        canvas.addEventListener('touchstart', (event) => {
            event.preventDefault();
            this.touchControls.touchStart = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        });
        
        canvas.addEventListener('touchmove', (event) => {
            event.preventDefault();
            if (!this.touchControls.touchStart) return;
            
            const touch = event.touches[0];
            const deltaX = (touch.clientX - this.touchControls.touchStart.x) * this.touchControls.sensitivity;
            const deltaY = (touch.clientY - this.touchControls.touchStart.y) * this.touchControls.sensitivity;
            
            // Rotate camera
            camera.rotation.y -= deltaX * 0.01;
            camera.rotation.x -= deltaY * 0.01;
            
            // Clamp vertical rotation
            camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
            
            this.touchControls.touchStart = {
                x: touch.clientX,
                y: touch.clientY
            };
        });
        
        canvas.addEventListener('touchend', (event) => {
            event.preventDefault();
            this.touchControls.touchStart = null;
        });
    }

    adjustQualityForBattery() {
        if (!this.config.batteryOptimization) return;
        
        // Check battery level if available
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                if (battery.level < 0.2) {
                    // Low battery - reduce quality
                    this.setLowBatteryMode();
                }
            });
        }
    }

    setLowBatteryMode() {
        this.config.maxDrawCalls = 200;
        this.config.maxTriangles = 25000;
        this.config.textureQuality = 'low';
        this.config.shadowQuality = 'none';
        this.config.antialiasing = false;
    }

    getMobileOptimizations() {
        return {
            isMobile: this.isMobile,
            config: this.mobileConfig,
            touchControls: this.touchControls !== null
        };
    }

    setConfig(config) {
        this.config = { ...this.config, ...config };
    }
}

// ============================================================================
// 6. MAIN OPTIMIZATION SYSTEM
// ============================================================================

export class AdvancedOptimizationSystem {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        
        this.lodSystem = new LODSystem();
        this.frustumCulling = new FrustumCullingSystem();
        this.objectPool = new ObjectPool();
        this.webglOptimization = new WebGLOptimizationSystem(renderer);
        this.mobileOptimization = new MobileOptimizationSystem();
        
        this.objects = new Set();
        this.enabled = true;
        
        this.initializeSystem();
    }

    initializeSystem() {
        // Setup mobile optimizations
        this.mobileOptimization.setupTouchControls(this.camera, this.renderer);
        
        // Apply mobile config to other systems
        const mobileConfig = this.mobileOptimization.getMobileOptimizations();
        if (mobileConfig.isMobile) {
            this.webglOptimization.setConfig(mobileConfig.config);
        }
        
        console.log('Advanced Optimization System initialized');
    }

    addObject(object) {
        this.objects.add(object);
        
        // Create LOD levels for the object
        if (object.geometry && object.material) {
            this.lodSystem.createLODLevels(object);
        }
    }

    removeObject(object) {
        this.objects.delete(object);
        
        // Return to pool if applicable
        this.objectPool.returnObject(object);
    }

    update() {
        if (!this.enabled) return;
        
        const objects = Array.from(this.objects);
        
        // Update frustum culling
        this.frustumCulling.updateCulling(objects, this.camera);
        
        // Update LOD for visible objects
        const visibleObjects = this.frustumCulling.getVisibleObjects();
        visibleObjects.forEach(object => {
            this.lodSystem.updateLOD(object, this.camera, this.renderer);
        });
        
        // Cleanup object pools
        this.objectPool.cleanup();
        
        // Check performance limits
        const warnings = this.webglOptimization.checkPerformanceLimits();
        if (warnings.length > 0) {
            console.warn('Performance warnings:', warnings);
        }
        
        // Adjust quality for battery
        this.mobileOptimization.adjustQualityForBattery();
    }

    getObject(type, ...args) {
        return this.objectPool.getObject(type, ...args);
    }

    returnObject(object) {
        this.objectPool.returnObject(object);
    }

    getPerformanceStats() {
        return {
            webgl: this.webglOptimization.getPerformanceStats(),
            pooling: this.objectPool.getStats(),
            culling: {
                visible: this.frustumCulling.getVisibleObjects().length,
                culled: this.frustumCulling.getCulledObjects().length,
                total: this.objects.size
            },
            mobile: this.mobileOptimization.getMobileOptimizations()
        };
    }

    setConfig(config) {
        if (config.lod) this.lodSystem.setConfig(config.lod);
        if (config.culling) this.frustumCulling.setConfig(config.culling);
        if (config.pooling) this.objectPool.setConfig(config.pooling);
        if (config.webgl) this.webglOptimization.setConfig(config.webgl);
        if (config.mobile) this.mobileOptimization.setConfig(config.mobile);
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }
} 