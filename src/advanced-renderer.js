import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

class AdvancedRenderer {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.composer = null;
        this.postProcessing = {};
        this.shaders = {};
        this.particleSystems = [];
        this.lightProbes = [];
        
        this.init();
    }

    init() {
        this.setupRenderer();
        this.setupPostProcessing();
        this.setupAdvancedLighting();
        this.setupParticleSystems();
        this.setupShaders();
    }

    setupRenderer() {
        // Enable advanced rendering features
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.autoUpdate = false;
        this.renderer.shadowMap.needsUpdate = true;
        
        // Enable advanced features
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Enable antialiasing
        this.renderer.antialias = true;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    setupPostProcessing() {
        // Create effect composer
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
        this.postProcessing.ssao = ssaoPass;
        
        // Bloom effect
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        this.composer.addPass(bloomPass);
        this.postProcessing.bloom = bloomPass;
        
        // FXAA (Fast Approximate Anti-aliasing)
        const fxaaPass = new ShaderPass(FXAAShader);
        fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * this.renderer.getPixelRatio());
        fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * this.renderer.getPixelRatio());
        this.composer.addPass(fxaaPass);
        this.postProcessing.fxaa = fxaaPass;
        
        // Output pass for tone mapping
        const outputPass = new OutputPass();
        this.composer.addPass(outputPass);
        this.postProcessing.output = outputPass;
    }

    setupAdvancedLighting() {
        // Create light probes for global illumination
        const lightProbe = new THREE.LightProbe();
        this.scene.add(lightProbe);
        this.lightProbes.push(lightProbe);
        
        // Enhanced directional light
        if (this.scene.getObjectByName('directionalLight')) {
            const dirLight = this.scene.getObjectByName('directionalLight');
            dirLight.shadow.mapSize.width = 4096;
            dirLight.shadow.mapSize.height = 4096;
            dirLight.shadow.camera.near = 0.5;
            dirLight.shadow.camera.far = 500;
            dirLight.shadow.camera.left = -100;
            dirLight.shadow.camera.right = 100;
            dirLight.shadow.camera.top = 100;
            dirLight.shadow.camera.bottom = -100;
            dirLight.shadow.bias = -0.0001;
            dirLight.shadow.normalBias = 0.02;
        }
        
        // Add point lights for dynamic lighting
        this.addPointLight(new THREE.Vector3(50, 20, 50), 0xffffff, 1000, 50);
        this.addPointLight(new THREE.Vector3(-50, 20, -50), 0xff6b35, 800, 40);
    }

    addPointLight(position, color, intensity, distance) {
        const light = new THREE.PointLight(color, intensity, distance);
        light.position.copy(position);
        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = distance;
        this.scene.add(light);
        return light;
    }

    setupParticleSystems() {
        // Create GPU-accelerated particle systems
        this.createExplosionParticles();
        this.createSmokeParticles();
        this.createSparkParticles();
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
            colors[i3] = 1.0; // Red
            colors[i3 + 1] = colorMix * 0.4; // Green (orange to red)
            colors[i3 + 2] = 0.0; // Blue
            
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
                    
                    // Calculate particle life
                    float life = mod(time, 3.0) / 3.0;
                    vLife = 1.0 - life;
                    
                    // Apply physics
                    vec3 pos = position + velocity * time + vec3(0.0, 0.5 * gravity * time * time, 0.0);
                    
                    // Fade out
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
            
            colors[i3] = 1.0; // Red
            colors[i3 + 1] = 1.0; // Green
            colors[i3 + 2] = 0.0; // Blue (yellow sparks)
            
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

    setupShaders() {
        // Create advanced shaders for materials
        this.shaders.pbr = this.createPBRShader();
        this.shaders.dissolve = this.createDissolveShader();
        this.shaders.hologram = this.createHologramShader();
    }

    createPBRShader() {
        return new THREE.ShaderMaterial({
            uniforms: {
                baseColor: { value: new THREE.Color(0.8, 0.8, 0.8) },
                metallic: { value: 0.0 },
                roughness: { value: 0.5 },
                normalMap: { value: null },
                aoMap: { value: null },
                lightPosition: { value: new THREE.Vector3(50, 50, 50) },
                lightColor: { value: new THREE.Color(1, 1, 1) },
                lightIntensity: { value: 1.0 },
                cameraPosition: { value: new THREE.Vector3() }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                varying vec3 vNormal;
                varying vec2 vUv;
                varying vec3 vViewDirection;
                
                void main() {
                    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                    vNormal = normalize(normalMatrix * normal);
                    vUv = uv;
                    vViewDirection = normalize(cameraPosition - vWorldPosition);
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 baseColor;
                uniform float metallic;
                uniform float roughness;
                uniform vec3 lightPosition;
                uniform vec3 lightColor;
                uniform float lightIntensity;
                uniform vec3 cameraPosition;
                
                varying vec3 vWorldPosition;
                varying vec3 vNormal;
                varying vec2 vUv;
                varying vec3 vViewDirection;
                
                const float PI = 3.14159265359;
                
                vec3 fresnelSchlick(float cosTheta, vec3 F0) {
                    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
                }
                
                float DistributionGGX(vec3 N, vec3 H, float roughness) {
                    float a = roughness * roughness;
                    float a2 = a * a;
                    float NdotH = max(dot(N, H), 0.0);
                    float NdotH2 = NdotH * NdotH;
                    
                    float nom = a2;
                    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
                    denom = PI * denom * denom;
                    
                    return nom / denom;
                }
                
                float GeometrySchlickGGX(float NdotV, float roughness) {
                    float r = (roughness + 1.0);
                    float k = (r * r) / 8.0;
                    
                    float nom = NdotV;
                    float denom = NdotV * (1.0 - k) + k;
                    
                    return nom / denom;
                }
                
                float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
                    float NdotV = max(dot(N, V), 0.0);
                    float NdotL = max(dot(N, L), 0.0);
                    float ggx2 = GeometrySchlickGGX(NdotV, roughness);
                    float ggx1 = GeometrySchlickGGX(NdotL, roughness);
                    
                    return ggx1 * ggx2;
                }
                
                void main() {
                    vec3 N = normalize(vNormal);
                    vec3 V = normalize(vViewDirection);
                    vec3 L = normalize(lightPosition - vWorldPosition);
                    vec3 H = normalize(V + L);
                    
                    float distance = length(lightPosition - vWorldPosition);
                    float attenuation = 1.0 / (distance * distance);
                    vec3 radiance = lightColor * lightIntensity * attenuation;
                    
                    vec3 F0 = vec3(0.04);
                    F0 = mix(F0, baseColor, metallic);
                    
                    float NDF = DistributionGGX(N, H, roughness);
                    float G = GeometrySmith(N, V, L, roughness);
                    vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
                    
                    vec3 numerator = NDF * G * F;
                    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
                    vec3 specular = numerator / denominator;
                    
                    vec3 kS = F;
                    vec3 kD = vec3(1.0) - kS;
                    kD *= 1.0 - metallic;
                    
                    float NdotL = max(dot(N, L), 0.0);
                    
                    vec3 Lo = (kD * baseColor / PI + specular) * radiance * NdotL;
                    
                    vec3 ambient = vec3(0.03) * baseColor;
                    vec3 color = ambient + Lo;
                    
                    color = color / (color + vec3(1.0));
                    color = pow(color, vec3(1.0 / 2.2));
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `
        });
    }

    createDissolveShader() {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                dissolveThreshold: { value: 0.0 },
                edgeColor: { value: new THREE.Color(1.0, 0.5, 0.0) },
                edgeWidth: { value: 0.1 }
            },
            vertexShader: `
                varying vec3 vPosition;
                varying vec3 vNormal;
                
                void main() {
                    vPosition = position;
                    vNormal = normal;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float dissolveThreshold;
                uniform vec3 edgeColor;
                uniform float edgeWidth;
                
                varying vec3 vPosition;
                varying vec3 vNormal;
                
                void main() {
                    float noise = fract(sin(dot(vPosition, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
                    
                    if (noise < dissolveThreshold) {
                        discard;
                    }
                    
                    if (noise < dissolveThreshold + edgeWidth) {
                        float edgeFactor = (noise - dissolveThreshold) / edgeWidth;
                        gl_FragColor = vec4(edgeColor, edgeFactor);
                    } else {
                        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                    }
                }
            `,
            transparent: true
        });
    }

    createHologramShader() {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                baseColor: { value: new THREE.Color(0.0, 1.0, 1.0) },
                scanlineSpeed: { value: 2.0 },
                scanlineIntensity: { value: 0.5 }
            },
            vertexShader: `
                varying vec3 vPosition;
                varying vec2 vUv;
                
                void main() {
                    vPosition = position;
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 baseColor;
                uniform float scanlineSpeed;
                uniform float scanlineIntensity;
                
                varying vec3 vPosition;
                varying vec2 vUv;
                
                void main() {
                    float scanline = sin(vUv.y * 100.0 + time * scanlineSpeed) * 0.5 + 0.5;
                    scanline *= scanlineIntensity;
                    
                    float flicker = sin(time * 10.0) * 0.1 + 0.9;
                    
                    vec3 color = baseColor * (scanline + 0.5) * flicker;
                    float alpha = 0.3 + scanline * 0.2;
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
    }

    update(time) {
        // Update post-processing
        if (this.composer) {
            this.composer.render();
        }
        
        // Update particle systems
        this.particleSystems.forEach(system => {
            if (system.material.uniforms.time) {
                system.material.uniforms.time.value = time;
            }
        });
        
        // Update shader uniforms
        if (this.shaders.pbr) {
            this.shaders.pbr.uniforms.cameraPosition.value.copy(this.camera.position);
        }
    }

    resize(width, height) {
        if (this.composer) {
            this.composer.setSize(width, height);
        }
        
        if (this.postProcessing.fxaa) {
            this.postProcessing.fxaa.material.uniforms['resolution'].value.x = 1 / (width * this.renderer.getPixelRatio());
            this.postProcessing.fxaa.material.uniforms['resolution'].value.y = 1 / (height * this.renderer.getPixelRatio());
        }
    }

    // Public methods for creating effects
    createExplosion(position) {
        // Trigger explosion effect at position
        console.log('Explosion at:', position);
    }

    createSmokeTrail(position, direction) {
        // Create smoke trail effect
        console.log('Smoke trail at:', position, 'direction:', direction);
    }

    createMuzzleFlash(position, direction) {
        // Create muzzle flash effect
        console.log('Muzzle flash at:', position, 'direction:', direction);
    }
}

export default AdvancedRenderer; 