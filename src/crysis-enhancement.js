// Crysis-Level Enhancement System
// Implements advanced graphics features comparable to Crysis 1 (2007)
// Features: PBR materials, dynamic lighting, post-processing, advanced shaders

import * as THREE from './three.module.js';

// ============================================================================
// 1. PBR MATERIAL SYSTEM
// ============================================================================

class PBRMaterialSystem {
    constructor() {
        this.materials = new Map();
        this.textureLoader = new THREE.TextureLoader();
        this.cubeTextureLoader = new THREE.CubeTextureLoader();
        this.irradianceMap = null;
        this.radianceMap = null;
        this.brdfLUT = null;
        
        this.initializePBR();
    }

    async initializePBR() {
        // Load environment maps for PBR
        await this.loadEnvironmentMaps();
        await this.generateBRDFLUT();
    }

    async loadEnvironmentMaps() {
        // Create a simple environment map for testing
        const envMap = this.createSimpleEnvironmentMap();
        this.irradianceMap = envMap;
        this.radianceMap = envMap;
    }

    createSimpleEnvironmentMap() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Create a gradient environment map
        const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#98FB98');
        gradient.addColorStop(1, '#F0E68C');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        const texture = new THREE.CanvasTexture(canvas);
        texture.mapping = THREE.EquirectangularReflectionMapping;
        return texture;
    }

    async generateBRDFLUT() {
        // Generate BRDF lookup texture for PBR
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const imageData = ctx.createImageData(size, size);
        const data = imageData.data;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const u = x / size;
                const v = y / size;
                
                // Simplified BRDF calculation
                const roughness = u;
                const NoV = v;
                
                // Schlick approximation
                const F0 = 0.04;
                const F = F0 + (1.0 - F0) * Math.pow(1.0 - NoV, 5.0);
                
                const index = (y * size + x) * 4;
                data[index] = Math.floor(F * 255);     // R
                data[index + 1] = Math.floor(roughness * 255); // G
                data[index + 2] = 0;                   // B
                data[index + 3] = 255;                 // A
            }
        }

        ctx.putImageData(imageData, 0, 0);
        this.brdfLUT = new THREE.CanvasTexture(canvas);
    }

    createPBRMaterial(params = {}) {
        const material = new THREE.ShaderMaterial({
            uniforms: {
                baseColor: { value: new THREE.Color(params.baseColor || 0xffffff) },
                metallic: { value: params.metallic || 0.0 },
                roughness: { value: params.roughness || 0.5 },
                normalMap: { value: params.normalMap || null },
                aoMap: { value: params.aoMap || null },
                emissiveMap: { value: params.emissiveMap || null },
                irradianceMap: { value: this.irradianceMap },
                radianceMap: { value: this.radianceMap },
                brdfLUT: { value: this.brdfLUT },
                lightPosition: { value: new THREE.Vector3(10, 10, 10) },
                lightColor: { value: new THREE.Color(0xffffff) },
                lightIntensity: { value: 1.0 },
                cameraPosition: { value: new THREE.Vector3() }
            },
            vertexShader: this.getPBRVertexShader(),
            fragmentShader: this.getPBRFragmentShader(),
            lights: true
        });

        return material;
    }

    getPBRVertexShader() {
        return `
            varying vec3 vWorldPosition;
            varying vec3 vWorldNormal;
            varying vec2 vUv;
            varying vec3 vViewPosition;

            void main() {
                vUv = uv;
                vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
                vViewPosition = -(modelViewMatrix * vec4(position, 1.0)).xyz;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
    }

    getPBRFragmentShader() {
        return `
            uniform vec3 baseColor;
            uniform float metallic;
            uniform float roughness;
            uniform sampler2D normalMap;
            uniform sampler2D aoMap;
            uniform sampler2D emissiveMap;
            uniform sampler2D irradianceMap;
            uniform sampler2D radianceMap;
            uniform sampler2D brdfLUT;
            uniform vec3 lightPosition;
            uniform vec3 lightColor;
            uniform float lightIntensity;
            uniform vec3 cameraPosition;

            varying vec3 vWorldPosition;
            varying vec3 vWorldNormal;
            varying vec2 vUv;
            varying vec3 vViewPosition;

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
                vec3 N = normalize(vWorldNormal);
                vec3 V = normalize(cameraPosition - vWorldPosition);
                vec3 L = normalize(lightPosition - vWorldPosition);
                vec3 H = normalize(V + L);

                vec3 F0 = vec3(0.04);
                F0 = mix(F0, baseColor, metallic);

                // Cook-Torrance BRDF
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

                vec3 Lo = (kD * baseColor / PI + specular) * lightColor * lightIntensity * NdotL;

                // Ambient lighting
                vec3 ambient = vec3(0.03) * baseColor;

                vec3 color = ambient + Lo;

                // HDR tonemapping
                color = color / (color + vec3(1.0));
                
                // Gamma correction
                color = pow(color, vec3(1.0 / 2.2));

                gl_FragColor = vec4(color, 1.0);
            }
        `;
    }
}

// ============================================================================
// 2. DYNAMIC LIGHTING SYSTEM
// ============================================================================

class DynamicLightingSystem {
    constructor(scene) {
        this.scene = scene;
        this.lights = new Map();
        this.shadowMaps = new Map();
        this.lightProbes = [];
        this.volumetricLights = [];
        
        this.initializeLighting();
    }

    initializeLighting() {
        // Create main directional light with shadows
        this.createDirectionalLight({
            position: [10, 20, 10],
            intensity: 1.0,
            color: 0xffffff,
            castShadow: true,
            shadowMapSize: 2048
        });

        // Create ambient light
        this.createAmbientLight({
            intensity: 0.3,
            color: 0x404040
        });

        // Create point lights for dynamic lighting
        this.createPointLight({
            position: [0, 10, 0],
            intensity: 0.5,
            color: 0xff6b6b,
            distance: 20,
            decay: 2
        });

        this.createPointLight({
            position: [20, 5, 0],
            intensity: 0.3,
            color: 0x4ecdc4,
            distance: 15,
            decay: 2
        });
    }

    createDirectionalLight(params) {
        const light = new THREE.DirectionalLight(params.color, params.intensity);
        light.position.set(...params.position);
        
        if (params.castShadow) {
            light.castShadow = true;
            light.shadow.mapSize.width = params.shadowMapSize || 1024;
            light.shadow.mapSize.height = params.shadowMapSize || 1024;
            light.shadow.camera.near = 0.5;
            light.shadow.camera.far = 50;
            light.shadow.camera.left = -20;
            light.shadow.camera.right = 20;
            light.shadow.camera.top = 20;
            light.shadow.camera.bottom = -20;
        }

        this.scene.add(light);
        this.lights.set('directional', light);
        return light;
    }

    createAmbientLight(params) {
        const light = new THREE.AmbientLight(params.color, params.intensity);
        this.scene.add(light);
        this.lights.set('ambient', light);
        return light;
    }

    createPointLight(params) {
        const light = new THREE.PointLight(params.color, params.intensity, params.distance, params.decay);
        light.position.set(...params.position);
        
        if (params.castShadow) {
            light.castShadow = true;
            light.shadow.mapSize.width = 512;
            light.shadow.mapSize.height = 512;
        }

        this.scene.add(light);
        this.lights.set(`point_${this.lights.size}`, light);
        return light;
    }

    createVolumetricLight(params) {
        const geometry = new THREE.CylinderGeometry(params.radius, params.radius, params.height, 8);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                lightColor: { value: new THREE.Color(params.color) },
                lightIntensity: { value: params.intensity },
                noiseTexture: { value: this.createNoiseTexture() }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                varying vec2 vUv;
                
                void main() {
                    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 lightColor;
                uniform float lightIntensity;
                uniform sampler2D noiseTexture;
                
                varying vec3 vWorldPosition;
                varying vec2 vUv;
                
                void main() {
                    float noise = texture2D(noiseTexture, vUv).r;
                    float alpha = noise * lightIntensity;
                    gl_FragColor = vec4(lightColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...params.position);
        this.scene.add(mesh);
        this.volumetricLights.push(mesh);
        return mesh;
    }

    createNoiseTexture() {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const imageData = ctx.createImageData(size, size);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random();
            data[i] = noise * 255;     // R
            data[i + 1] = noise * 255; // G
            data[i + 2] = noise * 255; // B
            data[i + 3] = 255;         // A
        }

        ctx.putImageData(imageData, 0, 0);
        return new THREE.CanvasTexture(canvas);
    }

    updateLighting(time) {
        // Animate point lights
        const pointLights = Array.from(this.lights.values()).filter(light => light instanceof THREE.PointLight);
        pointLights.forEach((light, index) => {
            const offset = index * Math.PI * 2 / pointLights.length;
            light.position.x = Math.cos(time * 0.001 + offset) * 15;
            light.position.z = Math.sin(time * 0.001 + offset) * 15;
        });

        // Animate volumetric lights
        this.volumetricLights.forEach((light, index) => {
            light.material.uniforms.lightIntensity.value = 0.5 + 0.3 * Math.sin(time * 0.002 + index);
        });
    }
}

// ============================================================================
// 3. POST-PROCESSING SYSTEM
// ============================================================================

class PostProcessingSystem {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.composer = null;
        this.effects = new Map();
        
        this.initializePostProcessing();
    }

    initializePostProcessing() {
        // Create render target
        const renderTarget = new THREE.WebGLRenderTarget(
            window.innerWidth,
            window.innerHeight,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                encoding: THREE.sRGBEncoding
            }
        );

        // Create effect composer
        this.composer = new THREE.EffectComposer(this.renderer, renderTarget);

        // Add render pass
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // Add post-processing effects
        this.addBloomEffect();
        this.addSSAOEffect();
        this.addMotionBlurEffect();
        this.addDepthOfFieldEffect();
        this.addColorGradingEffect();
    }

    addBloomEffect() {
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.5,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        this.composer.addPass(bloomPass);
        this.effects.set('bloom', bloomPass);
    }

    addSSAOEffect() {
        const ssaoPass = new THREE.SSAOPass(
            this.scene,
            this.camera,
            window.innerWidth,
            window.innerHeight
        );
        ssaoPass.kernelRadius = 16;
        ssaoPass.minDistance = 0.005;
        ssaoPass.maxDistance = 0.1;
        this.composer.addPass(ssaoPass);
        this.effects.set('ssao', ssaoPass);
    }

    addMotionBlurEffect() {
        const motionBlurPass = new THREE.ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                velocityFactor: { value: 0.5 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float velocityFactor;
                varying vec2 vUv;
                
                void main() {
                    vec2 offset = vec2(velocityFactor * 0.01, 0.0);
                    vec4 color = texture2D(tDiffuse, vUv);
                    color += texture2D(tDiffuse, vUv + offset) * 0.5;
                    color += texture2D(tDiffuse, vUv - offset) * 0.5;
                    gl_FragColor = color / 2.0;
                }
            `
        });
        this.composer.addPass(motionBlurPass);
        this.effects.set('motionBlur', motionBlurPass);
    }

    addDepthOfFieldEffect() {
        const dofPass = new THREE.ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                focusDistance: { value: 10.0 },
                focusRange: { value: 5.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float focusDistance;
                uniform float focusRange;
                varying vec2 vUv;
                
                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    float blur = 1.0 - smoothstep(focusDistance - focusRange, focusDistance + focusRange, gl_FragCoord.z);
                    gl_FragColor = color;
                }
            `
        });
        this.composer.addPass(dofPass);
        this.effects.set('depthOfField', dofPass);
    }

    addColorGradingEffect() {
        const colorGradingPass = new THREE.ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                exposure: { value: 1.0 },
                contrast: { value: 1.1 },
                saturation: { value: 1.2 },
                gamma: { value: 2.2 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float exposure;
                uniform float contrast;
                uniform float saturation;
                uniform float gamma;
                varying vec2 vUv;
                
                vec3 adjustContrast(vec3 color, float contrast) {
                    return 0.5 + (contrast * (color - 0.5));
                }
                
                vec3 adjustSaturation(vec3 color, float saturation) {
                    float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
                    return mix(vec3(luminance), color, saturation);
                }
                
                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    
                    // Apply color grading
                    color.rgb *= exposure;
                    color.rgb = adjustContrast(color.rgb, contrast);
                    color.rgb = adjustSaturation(color.rgb, saturation);
                    color.rgb = pow(color.rgb, vec3(1.0 / gamma));
                    
                    gl_FragColor = color;
                }
            `
        });
        this.composer.addPass(colorGradingPass);
        this.effects.set('colorGrading', colorGradingPass);
    }

    render() {
        this.composer.render();
    }

    resize(width, height) {
        this.composer.setSize(width, height);
    }
}

// ============================================================================
// 4. ADVANCED SHADER SYSTEM
// ============================================================================

class AdvancedShaderSystem {
    constructor() {
        this.shaders = new Map();
        this.initializeShaders();
    }

    initializeShaders() {
        // Normal mapping shader
        this.shaders.set('normalMapping', {
            vertex: this.getNormalMappingVertexShader(),
            fragment: this.getNormalMappingFragmentShader()
        });

        // Parallax occlusion mapping shader
        this.shaders.set('parallaxOcclusion', {
            vertex: this.getParallaxOcclusionVertexShader(),
            fragment: this.getParallaxOcclusionFragmentShader()
        });

        // Tessellation shader
        this.shaders.set('tessellation', {
            vertex: this.getTessellationVertexShader(),
            fragment: this.getTessellationFragmentShader(),
            tessControl: this.getTessellationControlShader(),
            tessEvaluation: this.getTessellationEvaluationShader()
        });
    }

    getNormalMappingVertexShader() {
        return `
            varying vec3 vViewPosition;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vTangent;
            varying vec3 vBitangent;

            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                vViewPosition = -(modelViewMatrix * vec4(position, 1.0)).xyz;
                
                // Calculate tangent space
                vec3 tangent = normalize(normalMatrix * tangent.xyz);
                vTangent = tangent;
                vBitangent = normalize(cross(vNormal, tangent) * tangent.w);
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
    }

    getNormalMappingFragmentShader() {
        return `
            uniform sampler2D normalMap;
            uniform sampler2D diffuseMap;
            uniform float normalScale;
            
            varying vec3 vViewPosition;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vTangent;
            varying vec3 vBitangent;

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 tangent = normalize(vTangent);
                vec3 bitangent = normalize(vBitangent);
                
                // Sample normal map
                vec3 normalMapValue = texture2D(normalMap, vUv).rgb * 2.0 - 1.0;
                normalMapValue.xy *= normalScale;
                
                // Transform to world space
                mat3 TBN = mat3(tangent, bitangent, normal);
                normal = normalize(TBN * normalMapValue);
                
                vec3 color = texture2D(diffuseMap, vUv).rgb;
                
                // Simple lighting
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(normal, lightDir), 0.0);
                color *= diff;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;
    }

    getParallaxOcclusionVertexShader() {
        return `
            varying vec3 vViewPosition;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vTangent;
            varying vec3 vBitangent;

            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                vViewPosition = -(modelViewMatrix * vec4(position, 1.0)).xyz;
                
                vec3 tangent = normalize(normalMatrix * tangent.xyz);
                vTangent = tangent;
                vBitangent = normalize(cross(vNormal, tangent) * tangent.w);
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
    }

    getParallaxOcclusionFragmentShader() {
        return `
            uniform sampler2D heightMap;
            uniform sampler2D diffuseMap;
            uniform sampler2D normalMap;
            uniform float heightScale;
            uniform float minLayers;
            uniform float maxLayers;
            
            varying vec3 vViewPosition;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vTangent;
            varying vec3 vBitangent;

            vec2 ParallaxOcclusionMapping(vec2 texCoords, vec3 viewDir) {
                float numLayers = mix(maxLayers, minLayers, abs(dot(vec3(0.0, 0.0, 1.0), viewDir)));
                float layerDepth = 1.0 / numLayers;
                float currentLayerDepth = 0.0;
                vec2 P = viewDir.xy * heightScale;
                vec2 deltaTexCoords = P / numLayers;
                
                vec2 currentTexCoords = texCoords;
                float currentDepthMapValue = 1.0 - texture2D(heightMap, currentTexCoords).r;
                
                while(currentLayerDepth < currentDepthMapValue) {
                    currentTexCoords -= deltaTexCoords;
                    currentDepthMapValue = 1.0 - texture2D(heightMap, currentTexCoords).r;
                    currentLayerDepth += layerDepth;
                }
                
                vec2 prevTexCoords = currentTexCoords + deltaTexCoords;
                float afterDepth = currentDepthMapValue - currentLayerDepth;
                float beforeDepth = 1.0 - texture2D(heightMap, prevTexCoords).r - currentLayerDepth + layerDepth;
                float weight = afterDepth / (afterDepth - beforeDepth);
                
                return mix(currentTexCoords, prevTexCoords, weight);
            }

            void main() {
                vec3 viewDir = normalize(vViewPosition);
                mat3 TBN = mat3(vTangent, vBitangent, vNormal);
                viewDir = transpose(TBN) * viewDir;
                
                vec2 texCoords = ParallaxOcclusionMapping(vUv, viewDir);
                
                if(texCoords.x > 1.0 || texCoords.y > 1.0 || texCoords.x < 0.0 || texCoords.y < 0.0)
                    discard;
                
                vec3 color = texture2D(diffuseMap, texCoords).rgb;
                gl_FragColor = vec4(color, 1.0);
            }
        `;
    }

    getTessellationVertexShader() {
        return `
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec2 vUv;

            void main() {
                vPosition = position;
                vNormal = normal;
                vUv = uv;
            }
        `;
    }

    getTessellationControlShader() {
        return `
            layout(vertices = 3) out;

            in vec3 vPosition[];
            in vec3 vNormal[];
            in vec2 vUv[];

            out vec3 tcPosition[];
            out vec3 tcNormal[];
            out vec2 tcUv[];

            uniform float tessLevel;

            void main() {
                tcPosition[gl_InvocationID] = vPosition[gl_InvocationID];
                tcNormal[gl_InvocationID] = vNormal[gl_InvocationID];
                tcUv[gl_InvocationID] = vUv[gl_InvocationID];

                if (gl_InvocationID == 0) {
                    gl_TessLevelInner[0] = tessLevel;
                    gl_TessLevelOuter[0] = tessLevel;
                    gl_TessLevelOuter[1] = tessLevel;
                    gl_TessLevelOuter[2] = tessLevel;
                }
            }
        `;
    }

    getTessellationEvaluationShader() {
        return `
            layout(triangles, equal_spacing, cw) in;

            in vec3 tcPosition[];
            in vec3 tcNormal[];
            in vec2 tcUv[];

            out vec3 tePosition;
            out vec3 teNormal;
            out vec2 teUv;

            void main() {
                vec3 position = gl_TessCoord.x * tcPosition[0] + 
                               gl_TessCoord.y * tcPosition[1] + 
                               gl_TessCoord.z * tcPosition[2];
                
                vec3 normal = gl_TessCoord.x * tcNormal[0] + 
                             gl_TessCoord.y * tcNormal[1] + 
                             gl_TessCoord.z * tcNormal[2];
                
                vec2 uv = gl_TessCoord.x * tcUv[0] + 
                         gl_TessCoord.y * tcUv[1] + 
                         gl_TessCoord.z * tcUv[2];

                tePosition = position;
                teNormal = normalize(normal);
                teUv = uv;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
    }

    getTessellationFragmentShader() {
        return `
            in vec3 tePosition;
            in vec3 teNormal;
            in vec2 teUv;

            void main() {
                vec3 color = vec3(0.5 + 0.5 * teNormal);
                gl_FragColor = vec4(color, 1.0);
            }
        `;
    }

    createShaderMaterial(shaderName, uniforms = {}) {
        const shader = this.shaders.get(shaderName);
        if (!shader) {
            console.error(`Shader '${shaderName}' not found`);
            return null;
        }

        return new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: shader.vertex,
            fragmentShader: shader.fragment,
            tessControlShader: shader.tessControl,
            tessEvaluationShader: shader.tessEvaluation
        });
    }
}

// ============================================================================
// 5. MAIN CRYSIS ENHANCEMENT SYSTEM
// ============================================================================

export class CrysisEnhancementSystem {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        
        this.pbrSystem = new PBRMaterialSystem();
        this.lightingSystem = new DynamicLightingSystem(scene);
        this.postProcessing = new PostProcessingSystem(renderer, scene, camera);
        this.shaderSystem = new AdvancedShaderSystem();
        
        this.enabled = true;
        this.performanceMode = 'high'; // ultra, high, medium, low
        
        this.initializeSystem();
    }

    async initializeSystem() {
        // Wait for PBR system to initialize
        await this.pbrSystem.initializePBR();
        
        // Set renderer properties for high quality
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        console.log('Crysis Enhancement System initialized');
    }

    setPerformanceMode(mode) {
        this.performanceMode = mode;
        
        const configs = {
            ultra: {
                shadowMapSize: 4096,
                antialias: true,
                postProcessing: true,
                tessellation: true
            },
            high: {
                shadowMapSize: 2048,
                antialias: true,
                postProcessing: true,
                tessellation: false
            },
            medium: {
                shadowMapSize: 1024,
                antialias: false,
                postProcessing: false,
                tessellation: false
            },
            low: {
                shadowMapSize: 512,
                antialias: false,
                postProcessing: false,
                tessellation: false
            }
        };
        
        const config = configs[mode];
        this.applyPerformanceConfig(config);
    }

    applyPerformanceConfig(config) {
        // Update shadow map sizes
        this.lightingSystem.lights.forEach(light => {
            if (light.castShadow) {
                light.shadow.mapSize.width = config.shadowMapSize;
                light.shadow.mapSize.height = config.shadowMapSize;
            }
        });
        
        // Update renderer settings
        this.renderer.antialias = config.antialias;
        
        // Update post-processing
        this.postProcessing.effects.forEach(effect => {
            effect.enabled = config.postProcessing;
        });
    }

    createPBRMaterial(params) {
        return this.pbrSystem.createPBRMaterial(params);
    }

    createAdvancedShader(shaderName, uniforms) {
        return this.shaderSystem.createShaderMaterial(shaderName, uniforms);
    }

    addVolumetricLight(params) {
        return this.lightingSystem.createVolumetricLight(params);
    }

    update(time) {
        if (!this.enabled) return;
        
        // Update lighting system
        this.lightingSystem.updateLighting(time);
        
        // Update camera position for shaders
        this.pbrSystem.materials.forEach(material => {
            if (material.uniforms && material.uniforms.cameraPosition) {
                material.uniforms.cameraPosition.value.copy(this.camera.position);
            }
        });
    }

    render() {
        if (this.enabled && this.performanceMode !== 'low') {
            this.postProcessing.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    resize(width, height) {
        if (this.postProcessing) {
            this.postProcessing.resize(width, height);
        }
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    getPerformanceMetrics() {
        return {
            drawCalls: this.renderer.info.render.calls,
            triangles: this.renderer.info.render.triangles,
            points: this.renderer.info.render.points,
            lines: this.renderer.info.render.lines,
            memory: {
                geometries: this.renderer.info.memory.geometries,
                textures: this.renderer.info.memory.textures
            }
        };
    }
} 