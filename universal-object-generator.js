// IDX-DOC-00: For index reference format, see INDEX_DESCRIBER.md
// IDX-UOG-01: Universal Object Generator Module
import * as THREE from 'three';
import VoxelObjectGenerator from './src/voxel-object-generator.js';

class UniversalObjectGenerator {
    constructor(scene) {
        this.scene = scene;
        this.rng = null;
        this.universalData = null;
        this.generatedObjects = new Map();
        this.textureLoader = new THREE.TextureLoader();
        this.materialCache = new Map();
        this.audioBuffers = new Map();
        this.preloadAudio();
    }

    preloadAudio() {
        const audioLoader = new THREE.AudioLoader();
        const sounds = {
            wind: 'https://cdn.freesound.org/previews/352/352514_4939433-lq.ogg',
            birds: 'https://cdn.freesound.org/previews/237/237359_4019027-lq.ogg'
        };

        for (const [key, url] of Object.entries(sounds)) {
            audioLoader.load(url, (buffer) => {
                this.audioBuffers.set(key, buffer);
                console.log(`Audio '${key}' preloaded.`);
            });
        }
    }

    async load(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load ${url}: ${response.statusText}`);
            }
            this.universalData = await response.json();
            console.log('Universal object library loaded successfully.');
        } catch (error) {
            console.error('Failed to load universal object library:', error);
            // Propagate the error to stop further execution if the file is essential
            throw error;
        }
    }

    renderAllObjects() {
        if (!this.universalData || !this.universalData.objects) {
            console.warn('No universal data or objects to render.');
            return;
        }
        
        for (const objectId in this.universalData.objects) {
            const objectData = this.universalData.objects[objectId];
            this.generateObject(objectId, objectData);
        }
    }

    initializeRNG() {
        const seed = this.universalData.seed || 42;
        this.rng = this.seededRandom(seed);
    }

    seededRandom(seed) {
        let m = 0x80000000;
        let a = 1103515245;
        let c = 12345;
        let state = seed ? seed : Math.floor(Math.random() * (m - 1));
        
        return function() {
            state = (a * state + c) % m;
            return state / (m - 1);
        };
    }

    generateAllObjects() {
        if (!this.universalData.objects) return;

        this.universalData.objects.forEach(objectData => {
            this.generateObject(objectData);
        });
    }

    generateObject(objectData) {
        const { id, type, position, rotation, scale, hierarchy, materials, behavior } = objectData;
        
        // Create root object
        const rootObject = new THREE.Group();
        rootObject.position.set(...position);
        rootObject.rotation.set(...rotation.map(r => THREE.MathUtils.degToRad(r)));
        rootObject.scale.set(...scale);
        
        // Generate hierarchical structure
        this.generateHierarchy(rootObject, hierarchy, materials, type);
        
        // Attach behaviors
        this.attachBehavior(rootObject, objectData);
        
        // Add to scene
        this.scene.add(rootObject);
        this.generatedObjects.set(id, {
            object: rootObject,
            type: type,
            behavior: behavior
        });
        
        console.log(`Generated ${type} object: ${id}`);
    }

    attachBehavior(object, objectDef) {
        const behaviorList = this.universalData.universal.objectTypes[objectDef.type]?.behaviors || [];

        if (behaviorList.includes('wind_response')) {
            let listener = null;
            this.scene.traverse(child => {
                if (child.type === "AudioListener") {
                    listener = child;
                }
            });

            if (listener) {
                // Add wind rustling sound
                if (this.audioBuffers.has('wind')) {
                    const windSound = new THREE.PositionalAudio(listener);
                    windSound.setBuffer(this.audioBuffers.get('wind'));
                    windSound.setRefDistance(20);
                    windSound.setLoop(true);
                    windSound.setVolume(0.5);
                    object.add(windSound);
                    windSound.play();
                }

                // Add bird chirping sound
                if (this.audioBuffers.has('birds')) {
                    const birdSound = new THREE.PositionalAudio(listener);
                    birdSound.setBuffer(this.audioBuffers.get('birds'));
                    birdSound.setRefDistance(15);
                    birdSound.setLoop(true);
                    birdSound.setVolume(0.8);
                    object.add(birdSound);
                    birdSound.play();
                }

                console.log(`Attached wind_response behavior to ${objectDef.id}`);
            } else {
                console.warn(`Could not find AudioListener for object ${objectDef.id}`);
            }
        }
    }

    determineComponentType(level, maxLevels) {
        if (level === 0) return 'trunk';
        // Create leaves on the last two levels for a fuller crown
        if (level >= maxLevels - 2) {
            return 'leaves';
        }
        return 'branches';
    }

    generateComponent(componentType, length, radius, material) {
        let component;
        const isOrganic = ['trunk', 'branches', 'leaves', 'flowers'].includes(componentType);

        if (isOrganic) {
            const resolution = 20; 
            const voxelGenerator = new VoxelObjectGenerator(resolution);
            voxelGenerator.fill(0); 

            switch (componentType) {
                case 'trunk':
                case 'branches': {
                    const size = new THREE.Vector3(radius * 2.2, length, radius * 2.2);
                    const start = new THREE.Vector3(size.x / 2, 0, size.z / 2);
                    const end = new THREE.Vector3(size.x / 2, length, size.z / 2);
                    voxelGenerator.size.copy(size);
                    voxelGenerator.addCylinder(start, end, radius);
                    break;
                }
                case 'leaves': {
                    const leafRadius = radius * 2; 
                    const size = new THREE.Vector3(leafRadius * 2.2, leafRadius * 2.2, leafRadius * 2.2);
                    const center = new THREE.Vector3(size.x / 2, size.y / 2, size.z / 2);
                    voxelGenerator.size.copy(size);
                    voxelGenerator.addSphere(center, leafRadius);
                    break;
                }
                case 'flowers': {
                    const flowerRadius = radius;
                    const size = new THREE.Vector3(flowerRadius * 2.2, flowerRadius * 2.2, flowerRadius * 2.2);
                    const center = new THREE.Vector3(size.x / 2, size.y / 2, size.z / 2);
                    voxelGenerator.size.copy(size);
                    voxelGenerator.addSphere(center, flowerRadius);
                    break;
                }
            }
            
            component = voxelGenerator.generateMesh(material);
        } else {
            let geometry;
            switch (componentType) {
                case 'cone':
                    geometry = new THREE.ConeGeometry(radius, length, 8);
                    break;
                default:
                    geometry = new THREE.BoxGeometry(length, radius * 2, radius * 2);
            }
            component = new THREE.Mesh(geometry, material);
        }

        component.castShadow = true;
        component.receiveShadow = true;

        component.userData.componentType = componentType;

        return component;
    }

    generateHierarchy(parentObject, hierarchy, materials, objectDef) {
        this.generateRecursive(parentObject, { hierarchy, materials, definition: this.universalData.universal.objectTypes[objectDef] }, 0);
    }
    
    generateRecursive(parent, objectDef, level) {
        if (level >= objectDef.hierarchy.levels) {
            // Add flowers at the very end of the final branches
            if (parent.userData.componentType === 'branches' && objectDef.definition.components.includes('flowers')) {
                const flowerRadius = objectDef.hierarchy.radii[objectDef.hierarchy.radii.length - 1] * 0.5;
                const flowerMaterial = this.getMaterial(objectDef.materials, 'flowers');
                const flower = this.generateComponent('flowers', 0, flowerRadius, flowerMaterial);
                
                const parentLength = parent.geometry.parameters.height || 0;
                flower.position.y = parentLength / 2;
                parent.add(flower);
            }
            return;
        }
    
        const numBranches = objectDef.hierarchy.branches[level];
        const angle = objectDef.hierarchy.angles[level];
    
        for (let i = 0; i < numBranches; i++) {
            const length = objectDef.hierarchy.lengths[level];
            const radius = objectDef.hierarchy.radii[level];
            const componentType = this.determineComponentType(level, objectDef.hierarchy.levels);
            const material = this.getMaterial(objectDef.materials, componentType);
            const component = this.generateComponent(componentType, length, radius, material);
            
            const randomAngle = (this.rng() - 0.5) * (angle * 2);
            const yAngle = THREE.MathUtils.degToRad(randomAngle);
            const zAngle = THREE.MathUtils.degToRad(this.rng() * 360);
    
            component.rotation.set(0, yAngle, zAngle);
            
            const parentLength = parent.geometry.parameters.height || length;
            component.position.y = parentLength / 2;
    
            parent.add(component);
    
            this.generateRecursive(component, objectDef, level + 1);
        }
    }

    getComponentType(objectType, level) {
        const componentMaps = {
            tree: ['trunk', 'branches', 'branches', 'leaves', 'flowers'],
            house: ['foundation', 'walls', 'roof', 'windows'],
            car: ['chassis', 'body', 'wheels', 'lights'],
            npc: ['body', 'head', 'arms', 'legs'],
            building: ['foundation', 'structure', 'facade', 'interior', 'details'],
            creature: ['body', 'head', 'limbs', 'appendages'],
            vehicle: ['frame', 'body', 'propulsion', 'control'],
            machine: ['frame', 'mechanism', 'power', 'control']
        };

        const components = componentMaps[objectType] || ['component'];
        return components[level] || components[components.length - 1];
    }

    getMaterial(materials, componentType) {
        const materialKey = `${componentType}_material`;
        
        if (this.materialCache.has(materialKey)) {
            return this.materialCache.get(materialKey);
        }

        let materialData = materials[componentType] || materials['default'] || {
            color: '0x808080',
            texture: 'none',
            transparent: false
        };

        const color = new THREE.Color(parseInt(materialData.color));
        const material = new THREE.MeshLambertMaterial({
            color: color,
            transparent: materialData.transparent || false,
            opacity: materialData.opacity || 1.0
        });

        // Apply texture if specified
        if (materialData.texture && materialData.texture !== 'none') {
            this.applyTexture(material, materialData.texture);
        }

        this.materialCache.set(materialKey, material);
        return material;
    }

    applyTexture(material, textureType) {
        const textureMap = {
            wood: this.createWoodTexture(),
            metal: this.createMetalTexture(),
            stone: this.createStoneTexture(),
            fabric: this.createFabricTexture(),
            plastic: this.createPlasticTexture(),
            glass: this.createGlassTexture(),
            foliage: this.createFoliageTexture(),
            concrete: this.createConcreteTexture(),
            brick: this.createBrickTexture(),
            shingles: this.createShinglesTexture(),
            paint: this.createPaintTexture(),
            rubber: this.createRubberTexture(),
            flesh: this.createFleshTexture(),
            fur: this.createFurTexture(),
            drywall: this.createDrywallTexture(),
            steel: this.createSteelTexture()
        };

        const texture = textureMap[textureType];
        if (texture) {
            material.map = texture;
            material.needsUpdate = true;
        }
    }

    // Procedural texture generators
    createWoodTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Wood grain pattern
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 0, 256, 256);
        
        for (let i = 0; i < 20; i++) {
            ctx.strokeStyle = `rgba(139, 69, 19, ${0.3 + this.rng() * 0.4})`;
            ctx.lineWidth = 1 + this.rng() * 3;
            ctx.beginPath();
            ctx.moveTo(0, i * 12 + this.rng() * 10);
            ctx.lineTo(256, i * 12 + this.rng() * 10);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    createMetalTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Metallic pattern
        const gradient = ctx.createLinearGradient(0, 0, 256, 256);
        gradient.addColorStop(0, '#C0C0C0');
        gradient.addColorStop(0.5, '#E0E0E0');
        gradient.addColorStop(1, '#A0A0A0');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        // Add some noise
        for (let i = 0; i < 1000; i++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.rng() * 0.1})`;
            ctx.fillRect(this.rng() * 256, this.rng() * 256, 1, 1);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createStoneTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Stone pattern
        ctx.fillStyle = '#696969';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add stone variations
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(105, 105, 105, ${0.5 + this.rng() * 0.5})`;
            ctx.beginPath();
            ctx.arc(this.rng() * 256, this.rng() * 256, 5 + this.rng() * 15, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createFabricTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Fabric weave pattern
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(0, 0, 256, 256);
        
        for (let i = 0; i < 256; i += 4) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + this.rng() * 0.2})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 256);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createPlasticTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Smooth plastic surface
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, '#FF0000');
        gradient.addColorStop(1, '#CC0000');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        // Add subtle highlights
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(50, 50, 100, 50);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createGlassTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Transparent glass effect
        ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add glass reflections
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(20, 20, 80, 40);
        ctx.fillRect(156, 156, 80, 40);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createFoliageTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Leaf pattern
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add leaf shapes
        for (let i = 0; i < 30; i++) {
            ctx.fillStyle = `rgba(34, 139, 34, ${0.5 + this.rng() * 0.5})`;
            ctx.beginPath();
            ctx.ellipse(
                this.rng() * 256, 
                this.rng() * 256, 
                10 + this.rng() * 20, 
                5 + this.rng() * 10, 
                this.rng() * Math.PI, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createConcreteTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Concrete surface
        ctx.fillStyle = '#696969';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add concrete texture
        for (let i = 0; i < 1000; i++) {
            ctx.fillStyle = `rgba(105, 105, 105, ${0.3 + this.rng() * 0.4})`;
            ctx.fillRect(this.rng() * 256, this.rng() * 256, 1, 1);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createBrickTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Brick pattern
        ctx.fillStyle = '#F5DEB3';
        ctx.fillRect(0, 0, 256, 256);
        
        // Draw brick rows
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 16; col++) {
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 1;
                ctx.strokeRect(
                    col * 16, 
                    row * 32, 
                    16, 
                    32
                );
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createShinglesTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Shingle pattern
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 0, 256, 256);
        
        // Draw shingle rows
        for (let row = 0; row < 16; row++) {
            for (let col = 0; col < 32; col++) {
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 1;
                ctx.strokeRect(
                    col * 8, 
                    row * 16, 
                    8, 
                    16
                );
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createPaintTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Smooth paint surface
        const gradient = ctx.createLinearGradient(0, 0, 256, 256);
        gradient.addColorStop(0, '#FF0000');
        gradient.addColorStop(0.5, '#FF3333');
        gradient.addColorStop(1, '#CC0000');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createRubberTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Rubber texture
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add rubber pattern
        for (let i = 0; i < 500; i++) {
            ctx.fillStyle = `rgba(0, 0, 0, ${0.7 + this.rng() * 0.3})`;
            ctx.fillRect(this.rng() * 256, this.rng() * 256, 2, 2);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createFleshTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Flesh color
        ctx.fillStyle = '#FFB6C1';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add skin texture
        for (let i = 0; i < 200; i++) {
            ctx.fillStyle = `rgba(255, 182, 193, ${0.5 + this.rng() * 0.5})`;
            ctx.beginPath();
            ctx.arc(this.rng() * 256, this.rng() * 256, 1 + this.rng() * 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createFurTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Fur base
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add fur strands
        for (let i = 0; i < 1000; i++) {
            ctx.strokeStyle = `rgba(139, 69, 19, ${0.3 + this.rng() * 0.7})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.rng() * 256, this.rng() * 256);
            ctx.lineTo(this.rng() * 256, this.rng() * 256);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createDrywallTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Drywall surface
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add subtle texture
        for (let i = 0; i < 500; i++) {
            ctx.fillStyle = `rgba(245, 245, 220, ${0.7 + this.rng() * 0.3})`;
            ctx.fillRect(this.rng() * 256, this.rng() * 256, 1, 1);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createSteelTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Steel surface
        const gradient = ctx.createLinearGradient(0, 0, 256, 256);
        gradient.addColorStop(0, '#2F4F4F');
        gradient.addColorStop(0.5, '#4F6F6F');
        gradient.addColorStop(1, '#1F3F3F');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        // Add steel grain
        for (let i = 0; i < 50; i++) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + this.rng() * 0.2})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, i * 5 + this.rng() * 10);
            ctx.lineTo(256, i * 5 + this.rng() * 10);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    // Generate a random object based on the universal parameters
    generateRandomObject(position = new THREE.Vector3(0, 0, 0)) {
        if (!this.universalData) return;

        const objectTypes = Object.keys(this.universalData.universal.objectTypes);
        const randomType = objectTypes[Math.floor(this.rng() * objectTypes.length)];
        
        const randomObject = {
            id: `random_${Date.now()}`,
            type: randomType,
            position: [position.x, position.y, position.z],
            rotation: [0, this.rng() * 360, 0],
            scale: [0.5 + this.rng() * 1.5, 0.5 + this.rng() * 1.5, 0.5 + this.rng() * 1.5],
            hierarchy: this.generateRandomHierarchy(randomType),
            materials: this.generateRandomMaterials(randomType),
            behavior: this.generateRandomBehavior()
        };

        this.generateObject(randomObject);
        return randomObject;
    }

    generateRandomHierarchy(objectType) {
        const levels = 3 + Math.floor(this.rng() * 3);
        const branches = [];
        const angles = [];
        const lengths = [];
        const radii = [];

        for (let i = 0; i < levels; i++) {
            branches.push(1 + Math.floor(this.rng() * 4));
            angles.push(this.rng() * 90);
            lengths.push(1 + this.rng() * 5);
            radii.push(0.1 + this.rng() * 1.5);
        }

        return { levels, branches, angles, lengths, radii };
    }

    generateRandomMaterials(objectType) {
        const materials = {};
        const componentTypes = this.universalData.universal.objectTypes[objectType].components;
        
        componentTypes.forEach(component => {
            const colorPalettes = Object.values(this.universalData.universal.parameters.materials.color.palette);
            const randomPalette = colorPalettes[Math.floor(this.rng() * colorPalettes.length)];
            const randomColor = randomPalette[Math.floor(this.rng() * randomPalette.length)];
            
            const textureTypes = this.universalData.universal.parameters.materials.texture;
            const randomTexture = textureTypes[Math.floor(this.rng() * textureTypes.length)];
            
            materials[component] = {
                color: randomColor,
                texture: randomTexture,
                transparent: this.rng() > 0.8
            };
        });

        return materials;
    }

    generateRandomBehavior() {
        const behaviors = this.universalData.universal.parameters.behavior;
        
        return {
            movement: behaviors.movement[Math.floor(this.rng() * behaviors.movement.length)],
            interaction: behaviors.interaction[Math.floor(this.rng() * behaviors.interaction.length)],
            ai: behaviors.ai[Math.floor(this.rng() * behaviors.ai.length)]
        };
    }

    // Get information about generated objects
    getObjectInfo(id) {
        return this.generatedObjects.get(id);
    }

    getAllObjects() {
        return Array.from(this.generatedObjects.values());
    }

    // Remove an object
    removeObject(id) {
        const objectInfo = this.generatedObjects.get(id);
        if (objectInfo) {
            this.scene.remove(objectInfo.object);
            this.generatedObjects.delete(id);
        }
    }

    // Clear all objects
    clearAllObjects() {
        this.generatedObjects.forEach(objectInfo => {
            this.scene.remove(objectInfo.object);
        });
        this.generatedObjects.clear();
    }
}

export default UniversalObjectGenerator; 