/**
 * ComfyUI Integration Module
 * Provides AI-powered texture and material generation for procedural content
 * IDX-COMFYUI-001: Core integration module
 */

import * as THREE from './three.module.js';

class ComfyUIIntegration {
    constructor() {
        this.baseUrl = 'http://127.0.0.1:8188'; // Default ComfyUI server
        this.isConnected = false;
        this.workflowQueue = [];
        this.generatedTextures = new Map();
        this.materialCache = new Map();
        
        // Default workflow templates
        this.workflowTemplates = {
            terrain: this.createTerrainWorkflow(),
            tree: this.createTreeWorkflow(),
            skybox: this.createSkyboxWorkflow(),
            material: this.createMaterialWorkflow()
        };
    }

    /**
     * Initialize connection to ComfyUI server
     * IDX-COMFYUI-002: Connection management
     */
    async initialize() {
        try {
            const response = await fetch(`${this.baseUrl}/system_stats`);
            if (response.ok) {
                this.isConnected = true;
                console.log('✅ ComfyUI connected successfully');
                return true;
            }
        } catch (error) {
            console.warn('⚠️ ComfyUI server not available:', error.message);
            this.isConnected = false;
        }
        return false;
    }

    /**
     * Create terrain texture generation workflow
     * IDX-COMFYUI-003: Terrain generation
     */
    createTerrainWorkflow(planetType = 'earth') {
        const prompts = {
            earth: 'realistic terrain texture, grass, soil, rocks, natural, high resolution, seamless',
            mars: 'mars surface texture, red soil, rocks, desert, alien landscape, high resolution, seamless',
            moon: 'lunar surface texture, gray regolith, craters, space rocks, high resolution, seamless',
            jupiter: 'jupiter surface texture, golden clouds, gas giant, atmospheric, high resolution, seamless',
            venus: 'venus surface texture, pink sand, volcanic, alien, high resolution, seamless'
        };

        return {
            "3": {
                "inputs": {
                    "seed": 156680208700286,
                    "steps": 20,
                    "cfg": 8,
                    "sampler_name": "euler",
                    "scheduler": "normal",
                    "denoise": 1,
                    "model": ["4", 0],
                    "positive": ["6", 0],
                    "negative": ["7", 0],
                    "latent_image": ["5", 0]
                },
                "class_type": "KSampler"
            },
            "4": {
                "inputs": {
                    "ckpt_name": "realistic_vision_v5.1.safetensors"
                },
                "class_type": "CheckpointLoaderSimple"
            },
            "5": {
                "inputs": {
                    "width": 1024,
                    "height": 1024,
                    "batch_size": 1
                },
                "class_type": "EmptyLatentImage"
            },
            "6": {
                "inputs": {
                    "text": prompts[planetType] || prompts.earth,
                    "clip": ["4", 1]
                },
                "class_type": "CLIPTextEncode"
            },
            "7": {
                "inputs": {
                    "text": "blurry, low quality, distorted, ugly, bad anatomy",
                    "clip": ["4", 1]
                },
                "class_type": "CLIPTextEncode"
            },
            "8": {
                "inputs": {
                    "samples": ["3", 0],
                    "vae": ["4", 2]
                },
                "class_type": "VAEDecode"
            },
            "9": {
                "inputs": {
                    "filename_prefix": `terrain_${planetType}`,
                    "images": ["8", 0]
                },
                "class_type": "SaveImage"
            }
        };
    }

    /**
     * Create tree texture generation workflow
     * IDX-COMFYUI-004: Tree generation
     */
    createTreeWorkflow(treeType = 'kameeldoring') {
        const prompts = {
            kameeldoring: 'realistic tree bark texture, acacia tree, rough bark, natural wood, high resolution, seamless',
            pine: 'realistic pine tree bark, conifer, rough texture, natural wood, high resolution, seamless',
            oak: 'realistic oak tree bark, hardwood, detailed texture, natural wood, high resolution, seamless',
            palm: 'realistic palm tree bark, tropical, smooth texture, natural wood, high resolution, seamless'
        };

        const workflow = this.createTerrainWorkflow();
        workflow["6"]["inputs"]["text"] = prompts[treeType] || prompts.kameeldoring;
        workflow["9"]["inputs"]["filename_prefix"] = `tree_${treeType}`;
        
        return workflow;
    }

    /**
     * Create skybox generation workflow
     * IDX-COMFYUI-005: Skybox generation
     */
    createSkyboxWorkflow(planetType = 'earth') {
        const prompts = {
            earth: 'realistic sky, blue sky, white clouds, daytime, panoramic, 360 degree view',
            mars: 'mars sky, red atmosphere, dust clouds, alien sky, panoramic, 360 degree view',
            moon: 'space sky, stars, black void, lunar surface, panoramic, 360 degree view',
            jupiter: 'jupiter atmosphere, orange clouds, gas giant sky, panoramic, 360 degree view',
            venus: 'venus sky, pink atmosphere, thick clouds, alien sky, panoramic, 360 degree view'
        };

        const workflow = this.createTerrainWorkflow();
        workflow["6"]["inputs"]["text"] = prompts[planetType] || prompts.earth;
        workflow["9"]["inputs"]["filename_prefix"] = `skybox_${planetType}`;
        
        return workflow;
    }

    /**
     * Create material generation workflow
     * IDX-COMFYUI-006: Material generation
     */
    createMaterialWorkflow(materialType = 'metal') {
        const prompts = {
            metal: 'realistic metal texture, metallic surface, industrial, high resolution, seamless',
            wood: 'realistic wood texture, natural grain, hardwood, high resolution, seamless',
            stone: 'realistic stone texture, rock surface, natural, high resolution, seamless',
            fabric: 'realistic fabric texture, cloth, textile, high resolution, seamless',
            plastic: 'realistic plastic texture, synthetic material, smooth, high resolution, seamless'
        };

        const workflow = this.createTerrainWorkflow();
        workflow["6"]["inputs"]["text"] = prompts[materialType] || prompts.metal;
        workflow["9"]["inputs"]["filename_prefix"] = `material_${materialType}`;
        
        return workflow;
    }

    /**
     * Queue a workflow for execution
     * IDX-COMFYUI-007: Workflow execution
     */
    async queueWorkflow(workflow, callback) {
        if (!this.isConnected) {
            console.warn('ComfyUI not connected, skipping workflow');
            return null;
        }

        try {
            // Queue the workflow
            const response = await fetch(`${this.baseUrl}/prompt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: workflow
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const promptId = result.prompt_id;

            // Poll for completion
            this.pollWorkflowStatus(promptId, callback);
            
            return promptId;
        } catch (error) {
            console.error('Error queuing workflow:', error);
            return null;
        }
    }

    /**
     * Poll workflow status until completion
     * IDX-COMFYUI-008: Status monitoring
     */
    async pollWorkflowStatus(promptId, callback) {
        const maxAttempts = 60; // 5 minutes max
        let attempts = 0;

        const poll = async () => {
            try {
                const response = await fetch(`${this.baseUrl}/history/${promptId}`);
                if (response.ok) {
                    const history = await response.json();
                    
                    if (history[promptId] && history[promptId].outputs) {
                        // Workflow completed
                        const outputs = history[promptId].outputs;
                        const images = [];
                        
                        // Extract generated images
                        for (const nodeId in outputs) {
                            if (outputs[nodeId].images) {
                                images.push(...outputs[nodeId].images);
                            }
                        }
                        
                        if (callback) {
                            callback(images);
                        }
                        return;
                    }
                }
                
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(poll, 5000); // Poll every 5 seconds
                } else {
                    console.error('Workflow timed out');
                }
            } catch (error) {
                console.error('Error polling workflow status:', error);
            }
        };

        poll();
    }

    /**
     * Generate terrain texture for a planet
     * IDX-COMFYUI-009: Terrain generation API
     */
    async generateTerrainTexture(planetType = 'earth') {
        return new Promise((resolve, reject) => {
            const workflow = this.workflowTemplates.terrain(planetType);
            
            this.queueWorkflow(workflow, (images) => {
                if (images && images.length > 0) {
                    const imageUrl = `${this.baseUrl}/view?filename=${images[0].filename}&subfolder=${images[0].subfolder}&type=${images[0].type}`;
                    this.loadTextureFromUrl(imageUrl).then(resolve).catch(reject);
                } else {
                    reject(new Error('No images generated'));
                }
            });
        });
    }

    /**
     * Generate tree texture
     * IDX-COMFYUI-010: Tree texture generation
     */
    async generateTreeTexture(treeType = 'kameeldoring') {
        return new Promise((resolve, reject) => {
            const workflow = this.workflowTemplates.tree(treeType);
            
            this.queueWorkflow(workflow, (images) => {
                if (images && images.length > 0) {
                    const imageUrl = `${this.baseUrl}/view?filename=${images[0].filename}&subfolder=${images[0].subfolder}&type=${images[0].type}`;
                    this.loadTextureFromUrl(imageUrl).then(resolve).catch(reject);
                } else {
                    reject(new Error('No images generated'));
                }
            });
        });
    }

    /**
     * Generate skybox texture
     * IDX-COMFYUI-011: Skybox generation
     */
    async generateSkyboxTexture(planetType = 'earth') {
        return new Promise((resolve, reject) => {
            const workflow = this.workflowTemplates.skybox(planetType);
            
            this.queueWorkflow(workflow, (images) => {
                if (images && images.length > 0) {
                    const imageUrl = `${this.baseUrl}/view?filename=${images[0].filename}&subfolder=${images[0].subfolder}&type=${images[0].type}`;
                    this.loadTextureFromUrl(imageUrl).then(resolve).catch(reject);
                } else {
                    reject(new Error('No images generated'));
                }
            });
        });
    }

    /**
     * Generate material texture
     * IDX-COMFYUI-012: Material generation
     */
    async generateMaterialTexture(materialType = 'metal') {
        return new Promise((resolve, reject) => {
            const workflow = this.workflowTemplates.material(materialType);
            
            this.queueWorkflow(workflow, (images) => {
                if (images && images.length > 0) {
                    const imageUrl = `${this.baseUrl}/view?filename=${images[0].filename}&subfolder=${images[0].subfolder}&type=${images[0].type}`;
                    this.loadTextureFromUrl(imageUrl).then(resolve).catch(reject);
                } else {
                    reject(new Error('No images generated'));
                }
            });
        });
    }

    /**
     * Load texture from URL and create Three.js texture
     * IDX-COMFYUI-013: Texture loading
     */
    async loadTextureFromUrl(url) {
        return new Promise((resolve, reject) => {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(
                url,
                (texture) => {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.set(1, 1);
                    resolve(texture);
                },
                undefined,
                reject
            );
        });
    }

    /**
     * Create PBR material with generated textures
     * IDX-COMFYUI-014: Material creation
     */
    async createPBRMaterial(materialType = 'metal', properties = {}) {
        const cacheKey = `${materialType}_${JSON.stringify(properties)}`;
        
        if (this.materialCache.has(cacheKey)) {
            return this.materialCache.get(cacheKey);
        }

        try {
            const texture = await this.generateMaterialTexture(materialType);
            
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: properties.roughness || 0.5,
                metalness: properties.metalness || 0.5,
                normalScale: properties.normalScale || new THREE.Vector2(1, 1),
                ...properties
            });

            this.materialCache.set(cacheKey, material);
            return material;
        } catch (error) {
            console.error('Error creating PBR material:', error);
            // Fallback to basic material
            return new THREE.MeshStandardMaterial({
                color: properties.color || 0x888888,
                roughness: properties.roughness || 0.5,
                metalness: properties.metalness || 0.5
            });
        }
    }

    /**
     * Get system status and available models
     * IDX-COMFYUI-015: System information
     */
    async getSystemInfo() {
        if (!this.isConnected) {
            return null;
        }

        try {
            const [statsResponse, modelsResponse] = await Promise.all([
                fetch(`${this.baseUrl}/system_stats`),
                fetch(`${this.baseUrl}/object_info`)
            ]);

            const stats = await statsResponse.json();
            const models = await modelsResponse.json();

            return {
                stats,
                models,
                isConnected: this.isConnected
            };
        } catch (error) {
            console.error('Error getting system info:', error);
            return null;
        }
    }

    /**
     * Clear texture and material caches
     * IDX-COMFYUI-016: Cache management
     */
    clearCaches() {
        this.generatedTextures.clear();
        this.materialCache.clear();
        console.log('ComfyUI caches cleared');
    }
}

// Export singleton instance
const comfyUI = new ComfyUIIntegration();
export default comfyUI; 