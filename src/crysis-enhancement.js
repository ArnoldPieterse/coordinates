import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

class CrysisEnhancement {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.world = null;
        this.composer = null;
        this.particleSystems = [];
        this.destructibleObjects = [];
        this.vehicles = [];
        this.ragdolls = [];
        this.fluids = [];
        this.explosions = [];
        
        this.init();
    }

    init() {
        this.setupPhysics();
        this.setupAdvancedRendering();
        this.setupParticleSystems();
        this.setupDestructibleEnvironment();
        this.setupVehicles();
        this.setupFluidSimulation();
    }

    setupPhysics() {
        // Create advanced physics world
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -30, 0),
            allowSleep: true,
            solver: {
                iterations: 10,
                tolerance: 0.001
            }
        });

        // Add broadphase for better performance
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        
        // Setup contact materials
        this.setupContactMaterials();
    }

    setupContactMaterials() {
        const groundMaterial = new CANNON.Material('ground');
        const playerMaterial = new CANNON.Material('player');
        const bulletMaterial = new CANNON.Material('bullet');
        const destructibleMaterial = new CANNON.Material('destructible');

        // Ground-Player contact
        const groundPlayerContact = new CANNON.ContactMaterial(
            groundMaterial,
            playerMaterial,
            {
                friction: 0.8,
                restitution: 0.3,
                contactEquationStiffness: 1e8,
                contactEquationRelaxation: 3,
                frictionEquationStiffness: 1e8
            }
        );

        // Bullet-Destructible contact
        const bulletDestructibleContact = new CANNON.ContactMaterial(
            bulletMaterial,
            destructibleMaterial,
            {
                friction: 0.0,
                restitution: 0.0,
                contactEquationStiffness: 1e8,
                contactEquationRelaxation: 3
            }
        );

        this.world.addContactMaterial(groundPlayerContact);
        this.world.addContactMaterial(bulletDestructibleContact);

        this.materials = {
            ground: groundMaterial,
            player: playerMaterial,
            bullet: bulletMaterial,
            destructible: destructibleMaterial
        };
    }

    setupAdvancedRendering() {
        // Create effect composer for post-processing
        this.composer = new EffectComposer(this.renderer);
        
        // Render pass
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // SSAO (Screen Space Ambient Occlusion)
        const ssaoPass = new SSAOPass(this.scene, this.camera, window.innerWidth, window.innerHeight);
        ssaoPass.kernelRadius = 16;
        ssaoPass.minDistance = 0.005;
        ssaoPass.maxDistance = 0.1;
        this.composer.addPass(ssaoPass);
        
        // Bloom effect
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        this.composer.addPass(bloomPass);
        
        // FXAA (Fast Approximate Anti-aliasing)
        const fxaaPass = new ShaderPass(FXAAShader);
        fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * this.renderer.getPixelRatio());
        fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * this.renderer.getPixelRatio());
        this.composer.addPass(fxaaPass);

        // Enable advanced rendering features
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    setupParticleSystems() {
        // Create advanced particle systems
        this.createExplosionParticles();
        this.createSmokeParticles();
        this.createSparkParticles();
        this.createMuzzleFlashParticles();
    }

    createExplosionParticles() {
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Random position in sphere
            const radius = Math.random() * 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Random velocity
            velocities[i3] = (Math.random() - 0.5) * 20;
            velocities[i3 + 1] = Math.random() * 30;
            velocities[i3 + 2] = (Math.random() - 0.5) * 20;
            
            // Color gradient from orange to red
            const colorMix = Math.random();
            colors[i3] = 1.0;
            colors[i3 + 1] = colorMix * 0.4;
            colors[i3 + 2] = 0.0;
            
            sizes[i] = Math.random() * 2 + 1;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                gravity: { value: -9.8 }
            },
            vertexShader: `
                attribute vec3 velocity;
                attribute vec3 color;
                attribute float size;
                uniform float time;
                uniform float gravity;
                
                varying vec3 vColor;
                varying float vLife;
                
                void main() {
                    vColor = color;
                    
                    float life = mod(time, 3.0) / 3.0;
                    vLife = 1.0 - life;
                    
                    vec3 pos = position + velocity * time + vec3(0.0, 0.5 * gravity * time * time, 0.0);
                    
                    if (life > 0.8) {
                        vLife = (1.0 - life) * 5.0;
                    }
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = size * (300.0 / -mvPosition.z) * vLife;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vLife;
                
                void main() {
                    if (vLife <= 0.0) discard;
                    
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    if (dist > 0.5) discard;
                    
                    float alpha = smoothstep(0.5, 0.0, dist) * vLife;
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        this.particleSystems.push({
            mesh: particles,
            material: material,
            type: 'explosion'
        });
    }

    createSmokeParticles() {
        const particleCount = 500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            positions[i3] = (Math.random() - 0.5) * 10;
            positions[i3 + 1] = Math.random() * 5;
            positions[i3 + 2] = (Math.random() - 0.5) * 10;
            
            velocities[i3] = (Math.random() - 0.5) * 2;
            velocities[i3 + 1] = Math.random() * 3 + 1;
            velocities[i3 + 2] = (Math.random() - 0.5) * 2;
            
            const gray = Math.random() * 0.3 + 0.2;
            colors[i3] = gray;
            colors[i3 + 1] = gray;
            colors[i3 + 2] = gray;
            
            sizes[i] = Math.random() * 3 + 2;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute vec3 velocity;
                attribute vec3 color;
                attribute float size;
                uniform float time;
                
                varying vec3 vColor;
                varying float vLife;
                
                void main() {
                    vColor = color;
                    
                    float life = mod(time, 5.0) / 5.0;
                    vLife = 1.0 - life;
                    
                    vec3 pos = position + velocity * time;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = size * (200.0 / -mvPosition.z) * vLife;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vLife;
                
                void main() {
                    if (vLife <= 0.0) discard;
                    
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    if (dist > 0.5) discard;
                    
                    float alpha = smoothstep(0.5, 0.0, dist) * vLife * 0.7;
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.NormalBlending,
            depthWrite: false
        });
        
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        this.particleSystems.push({
            mesh: particles,
            material: material,
            type: 'smoke'
        });
    }

    createSparkParticles() {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            positions[i3] = (Math.random() - 0.5) * 2;
            positions[i3 + 1] = Math.random() * 2;
            positions[i3 + 2] = (Math.random() - 0.5) * 2;
            
            velocities[i3] = (Math.random() - 0.5) * 10;
            velocities[i3 + 1] = Math.random() * 15;
            velocities[i3 + 2] = (Math.random() - 0.5) * 10;
            
            colors[i3] = 1.0;
            colors[i3 + 1] = 1.0;
            colors[i3 + 2] = 0.0;
            
            sizes[i] = Math.random() * 1 + 0.5;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute vec3 velocity;
                attribute vec3 color;
                attribute float size;
                uniform float time;
                
                varying vec3 vColor;
                varying float vLife;
                
                void main() {
                    vColor = color;
                    
                    float life = mod(time, 2.0) / 2.0;
                    vLife = 1.0 - life;
                    
                    vec3 pos = position + velocity * time;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = size * (100.0 / -mvPosition.z) * vLife;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vLife;
                
                void main() {
                    if (vLife <= 0.0) discard;
                    
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    if (dist > 0.5) discard;
                    
                    float alpha = smoothstep(0.5, 0.0, dist) * vLife;
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        this.particleSystems.push({
            mesh: particles,
            material: material,
            type: 'spark'
        });
    }

    createMuzzleFlashParticles() {
        const particleCount = 50;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            positions[i3] = (Math.random() - 0.5) * 0.5;
            positions[i3 + 1] = (Math.random() - 0.5) * 0.5;
            positions[i3 + 2] = (Math.random() - 0.5) * 0.5;
            
            velocities[i3] = (Math.random() - 0.5) * 5;
            velocities[i3 + 1] = (Math.random() - 0.5) * 5;
            velocities[i3 + 2] = (Math.random() - 0.5) * 5;
            
            colors[i3] = 1.0;
            colors[i3 + 1] = 0.8;
            colors[i3 + 2] = 0.0;
            
            sizes[i] = Math.random() * 0.5 + 0.2;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute vec3 velocity;
                attribute vec3 color;
                attribute float size;
                uniform float time;
                
                varying vec3 vColor;
                varying float vLife;
                
                void main() {
                    vColor = color;
                    
                    float life = mod(time, 0.2) / 0.2;
                    vLife = 1.0 - life;
                    
                    vec3 pos = position + velocity * time;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = size * (150.0 / -mvPosition.z) * vLife;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vLife;
                
                void main() {
                    if (vLife <= 0.0) discard;
                    
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    if (dist > 0.5) discard;
                    
                    float alpha = smoothstep(0.5, 0.0, dist) * vLife;
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        this.particleSystems.push({
            mesh: particles,
            material: material,
            type: 'muzzleFlash'
        });
    }

    setupDestructibleEnvironment() {
        // Create destructible objects
        const destructibleObjects = [
            { type: 'box', position: [10, 2, 10], size: [2, 4, 2], mass: 100 },
            { type: 'box', position: [-10, 2, -10], size: [2, 4, 2], mass: 100 },
            { type: 'sphere', position: [15, 1, 0], radius: 2, mass: 50 },
            { type: 'cylinder', position: [0, 2, 15], radius: 1, height: 4, mass: 75 }
        ];

        destructibleObjects.forEach(obj => {
            let geometry;
            if (obj.type === 'box') {
                geometry = new THREE.BoxGeometry(obj.size[0], obj.size[1], obj.size[2]);
            } else if (obj.type === 'sphere') {
                geometry = new THREE.SphereGeometry(obj.radius, 16, 16);
            } else if (obj.type === 'cylinder') {
                geometry = new THREE.CylinderGeometry(obj.radius, obj.radius, obj.height, 16);
            }

            const material = new THREE.MeshLambertMaterial({ 
                color: 0x8B4513,
                roughness: 0.8,
                metalness: 0.2
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(...obj.position);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);

            const shape = this.createShapeFromGeometry(geometry);
            const body = new CANNON.Body({
                mass: obj.mass,
                shape: shape,
                material: this.materials.destructible,
                position: new CANNON.Vec3(obj.position[0], obj.position[1], obj.position[2])
            });

            body.destructible = {
                health: 100,
                maxHealth: 100,
                destroyed: false,
                fragments: [],
                originalGeometry: geometry,
                originalMaterial: material
            };

            this.world.addBody(body);
            this.destructibleObjects.push({
                mesh: mesh,
                body: body,
                health: 100
            });
        });
    }

    createShapeFromGeometry(geometry) {
        if (geometry.type === 'BoxGeometry') {
            const size = geometry.parameters;
            return new CANNON.Box(new CANNON.Vec3(
                size.width / 2,
                size.height / 2,
                size.depth / 2
            ));
        } else if (geometry.type === 'SphereGeometry') {
            return new CANNON.Sphere(geometry.parameters.radius);
        } else if (geometry.type === 'CylinderGeometry') {
            const params = geometry.parameters;
            return new CANNON.Cylinder(
                params.radiusTop,
                params.radiusBottom,
                params.height,
                params.radialSegments
            );
        } else {
            // Fallback to convex hull
            const vertices = geometry.attributes.position.array;
            const points = [];
            for (let i = 0; i < vertices.length; i += 3) {
                points.push(new CANNON.Vec3(vertices[i], vertices[i + 1], vertices[i + 2]));
            }
            return new CANNON.ConvexPolyhedron({ vertices: points });
        }
    }

    setupVehicles() {
        // Create vehicles
        const vehiclePositions = [
            new THREE.Vector3(20, 1, 20),
            new THREE.Vector3(-20, 1, -20),
            new THREE.Vector3(20, 1, -20)
        ];

        vehiclePositions.forEach(position => {
            const vehicle = this.createVehicle(position);
            this.vehicles.push(vehicle);
        });
    }

    createVehicle(position) {
        const vehicle = {
            body: null,
            wheels: [],
            vehicle: null
        };

        // Create vehicle body
        const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2));
        vehicle.body = new CANNON.Body({
            mass: 1500,
            shape: chassisShape,
            position: new CANNON.Vec3(position.x, position.y, position.z)
        });

        // Create vehicle
        vehicle.vehicle = new CANNON.RaycastVehicle({
            chassisBody: vehicle.body,
            indexRightAxis: 0,
            indexForwardAxis: 2,
            indexUpAxis: 1
        });

        // Create wheels
        const wheelOptions = {
            radius: 0.4,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            suspensionStiffness: 30,
            suspensionRestLength: 0.3,
            frictionSlip: 1.4,
            dampingRelaxation: 2.3,
            dampingCompression: 4.4,
            maxSuspensionForce: 100000,
            rollInfluence: 0.01,
            axleLocal: new CANNON.Vec3(1, 0, 0),
            chassisConnectionPointLocal: new CANNON.Vec3(1, 0, 1),
            maxSuspensionTravel: 0.3,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true
        };

        // Add wheels
        const wheelPositions = [
            { x: -0.8, y: 0, z: 1.2 },   // Front left
            { x: 0.8, y: 0, z: 1.2 },    // Front right
            { x: -0.8, y: 0, z: -1.2 },  // Rear left
            { x: 0.8, y: 0, z: -1.2 }    // Rear right
        ];

        wheelPositions.forEach(pos => {
            wheelOptions.chassisConnectionPointLocal.set(pos.x, pos.y, pos.z);
            vehicle.vehicle.addWheel(wheelOptions);
        });

        // Add vehicle to world
        this.world.addBody(vehicle.body);
        vehicle.vehicle.addToWorld(this.world);

        return vehicle;
    }

    setupFluidSimulation() {
        // Create fluid simulation
        const fluidBounds = {
            min: new THREE.Vector3(-5, 0, -5),
            max: new THREE.Vector3(5, 10, 5)
        };

        const fluid = this.createFluidSimulation(fluidBounds, 500);
        this.fluids.push(fluid);
    }

    createFluidSimulation(bounds, particleCount = 1000) {
        const fluid = {
            particles: [],
            bounds: bounds,
            gravity: new CANNON.Vec3(0, -9.8, 0)
        };

        // Create fluid particles
        for (let i = 0; i < particleCount; i++) {
            const particle = new CANNON.Body({
                mass: 1,
                shape: new CANNON.Sphere(0.1),
                position: new CANNON.Vec3(
                    bounds.min.x + Math.random() * (bounds.max.x - bounds.min.x),
                    bounds.max.y,
                    bounds.min.z + Math.random() * (bounds.max.z - bounds.min.z)
                )
            });

            this.world.addBody(particle);
            fluid.particles.push(particle);
        }

        return fluid;
    }

    // Public methods for game integration
    createExplosion(position, radius = 10, force = 1000) {
        const explosionBodies = [];

        // Find all bodies within explosion radius
        this.world.bodies.forEach(body => {
            const distance = body.position.distanceTo(new CANNON.Vec3(position.x, position.y, position.z));
            if (distance <= radius) {
                const direction = new CANNON.Vec3();
                body.position.vsub(new CANNON.Vec3(position.x, position.y, position.z), direction);
                direction.normalize();

                const forceMagnitude = force * (1 - distance / radius);
                const impulse = direction.scale(forceMagnitude);
                body.applyImpulse(impulse, body.position);

                explosionBodies.push(body);
            }
        });

        // Create explosion effect
        this.createExplosionEffect(position);

        return explosionBodies;
    }

    createExplosionEffect(position) {
        // Trigger explosion particle effect
        const explosionSystem = this.particleSystems.find(system => system.type === 'explosion');
        if (explosionSystem) {
            explosionSystem.mesh.position.copy(position);
            explosionSystem.material.uniforms.time.value = 0;
        }
    }

    createMuzzleFlash(position, direction) {
        // Create muzzle flash effect
        const muzzleSystem = this.particleSystems.find(system => system.type === 'muzzleFlash');
        if (muzzleSystem) {
            muzzleSystem.mesh.position.copy(position);
            muzzleSystem.mesh.lookAt(position.clone().add(direction));
            muzzleSystem.material.uniforms.time.value = 0;
        }
    }

    damageDestructibleObject(bodyId, damage, impactPoint) {
        const destructible = this.destructibleObjects.find(obj => obj.body.id === bodyId);
        if (!destructible) return;

        destructible.health -= damage;

        if (destructible.health <= 0) {
            this.destroyObject(destructible, impactPoint);
        }
    }

    destroyObject(destructible, impactPoint) {
        // Create fragments
        const fragmentCount = Math.floor(Math.random() * 5) + 3;
        const fragments = [];

        for (let i = 0; i < fragmentCount; i++) {
            const fragment = this.createFragment(destructible, impactPoint);
            fragments.push(fragment);
        }

        // Remove original object
        this.scene.remove(destructible.mesh);
        this.world.removeBody(destructible.body);
        this.destructibleObjects = this.destructibleObjects.filter(obj => obj !== destructible);

        // Add fragments to world
        fragments.forEach(fragment => {
            this.world.addBody(fragment);
        });

        return fragments;
    }

    createFragment(originalDestructible, impactPoint) {
        const fragmentSize = Math.random() * 0.5 + 0.2;
        const shape = new CANNON.Box(new CANNON.Vec3(fragmentSize, fragmentSize, fragmentSize));
        
        const fragment = new CANNON.Body({
            mass: 0.1,
            shape: shape,
            material: this.materials.destructible,
            position: new CANNON.Vec3(
                impactPoint.x + (Math.random() - 0.5) * 2,
                impactPoint.y + Math.random() * 2,
                impactPoint.z + (Math.random() - 0.5) * 2
            )
        });

        // Add random velocity
        fragment.velocity.set(
            (Math.random() - 0.5) * 10,
            Math.random() * 5,
            (Math.random() - 0.5) * 10
        );

        return fragment;
    }

    update(deltaTime) {
        // Update physics
        this.world.step(1/60, deltaTime, 3);

        // Update vehicles
        this.vehicles.forEach(vehicle => {
            if (vehicle.vehicle) {
                vehicle.vehicle.update();
            }
        });

        // Update particle systems
        this.particleSystems.forEach(system => {
            if (system.material.uniforms.time) {
                system.material.uniforms.time.value += deltaTime;
            }
        });

        // Update post-processing
        if (this.composer) {
            this.composer.render();
        }
    }

    resize(width, height) {
        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }

    // Performance optimization
    optimize() {
        this.world.allowSleep = true;
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        this.world.solver.iterations = 5;
    }
}

export default CrysisEnhancement; 