// Real-Time Material System - Implementation based on detailed specifications
// Implements real-time material updates, seasonal effects, and dynamic texture generation

import * as THREE from './three.module.js';

// ============================================================================
// 1. REAL-TIME MATERIAL ANIMATOR
// ============================================================================

class MaterialAnimator {
  constructor() {
    this.animations = new Map();
    this.time = 0;
    this.seasonalEffects = new SeasonalEffectSystem();
    this.textureGenerator = new DynamicTextureGenerator();
    this.materialCache = new Map();
    
    this.config = {
      animationSpeed: 1.0,
      transitionDuration: 2.0,
      enableSeasonalEffects: true,
      enableDynamicTextures: true,
      enableWeatherEffects: true
    };
  }

  animateMaterial(material, season, time, weather = null) {
    this.time = time;
    
    // Get seasonal colors
    const seasonColors = this.seasonalEffects.getSeasonalColors(season);
    
    // Animate color transition
    this.animateColor(material, seasonColors, time);
    
    // Animate other properties
    this.animateRoughness(material, season, time);
    this.animateMetallic(material, season, time);
    this.animateNormalScale(material, season, time);
    this.animateEmissive(material, season, time);
    
    // Apply weather effects
    if (weather && this.config.enableWeatherEffects) {
      this.applyWeatherEffects(material, weather, time);
    }
    
    // Update dynamic textures
    if (this.config.enableDynamicTextures) {
      this.updateDynamicTextures(material, season, time);
    }
  }

  animateColor(material, colors, time) {
    const trunkColor = new THREE.Color(colors.trunk);
    const branchColor = new THREE.Color(colors.branch);
    const leafColor = new THREE.Color(colors.leaf);
    
    // Create smooth transition
    const transitionTime = this.config.transitionDuration;
    const progress = (time % transitionTime) / transitionTime;
    
    // Determine material type and apply appropriate color
    if (material.name && material.name.includes('trunk')) {
      material.color.lerp(trunkColor, 0.01);
    } else if (material.name && material.name.includes('branch')) {
      material.color.lerp(branchColor, 0.01);
    } else if (material.name && material.name.includes('leaf')) {
      material.color.lerp(leafColor, 0.01);
    } else {
      // Default to trunk color
      material.color.lerp(trunkColor, 0.01);
    }
  }

  animateRoughness(material, season, time) {
    const seasonRoughness = this.seasonalEffects.getSeasonalRoughness(season);
    const targetRoughness = seasonRoughness[material.name?.includes('leaf') ? 'leaf' : 'wood'];
    
    material.roughness = THREE.MathUtils.lerp(
      material.roughness || 0.5, 
      targetRoughness, 
      0.01
    );
  }

  animateMetallic(material, season, time) {
    const seasonMetallic = this.seasonalEffects.getSeasonalMetallic(season);
    const targetMetallic = seasonMetallic[material.name?.includes('leaf') ? 'leaf' : 'wood'];
    
    material.metallic = THREE.MathUtils.lerp(
      material.metallic || 0.0, 
      targetMetallic, 
      0.01
    );
  }

  animateNormalScale(material, season, time) {
    const seasonNormalScale = this.seasonalEffects.getSeasonalNormalScale(season);
    const targetScale = seasonNormalScale[material.name?.includes('leaf') ? 'leaf' : 'wood'];
    
    if (material.normalScale) {
      material.normalScale.x = THREE.MathUtils.lerp(
        material.normalScale.x, 
        targetScale, 
        0.01
      );
      material.normalScale.y = THREE.MathUtils.lerp(
        material.normalScale.y, 
        targetScale, 
        0.01
      );
    }
  }

  animateEmissive(material, season, time) {
    const seasonEmissive = this.seasonalEffects.getSeasonalEmissive(season);
    const targetEmissive = seasonEmissive[material.name?.includes('leaf') ? 'leaf' : 'wood'];
    
    if (!material.emissive) {
      material.emissive = new THREE.Color(0, 0, 0);
    }
    
    material.emissive.lerp(targetEmissive, 0.01);
  }

  applyWeatherEffects(material, weather, time) {
    switch (weather.type) {
      case 'rain':
        this.applyRainEffect(material, weather.intensity, time);
        break;
      case 'snow':
        this.applySnowEffect(material, weather.intensity, time);
        break;
      case 'wind':
        this.applyWindEffect(material, weather.intensity, time);
        break;
      case 'sun':
        this.applySunEffect(material, weather.intensity, time);
        break;
    }
  }

  applyRainEffect(material, intensity, time) {
    // Add wetness to material
    const wetness = intensity * 0.5;
    material.roughness = THREE.MathUtils.lerp(material.roughness, 0.1, wetness);
    
    // Add subtle blue tint
    const blueTint = new THREE.Color(0.9, 0.95, 1.0);
    material.color.lerp(blueTint, wetness * 0.1);
  }

  applySnowEffect(material, intensity, time) {
    // Add snow accumulation
    const snowCover = intensity * 0.8;
    const snowColor = new THREE.Color(0.95, 0.95, 0.95);
    material.color.lerp(snowColor, snowCover);
    
    // Increase roughness for snow
    material.roughness = THREE.MathUtils.lerp(material.roughness, 0.9, snowCover);
  }

  applyWindEffect(material, intensity, time) {
    // Add subtle color variation based on wind
    const windVariation = Math.sin(time * 0.1) * intensity * 0.1;
    const windColor = new THREE.Color(1 + windVariation, 1, 1);
    material.color.lerp(windColor, 0.01);
  }

  applySunEffect(material, intensity, time) {
    // Add sun bleaching effect
    const bleaching = intensity * 0.3;
    const bleachedColor = new THREE.Color(1.1, 1.05, 0.9);
    material.color.lerp(bleachedColor, bleaching);
  }

  updateDynamicTextures(material, season, time) {
    // Update normal maps
    if (material.normalMap) {
      const normalTexture = this.textureGenerator.generateNormalTexture(season, time);
      material.normalMap = normalTexture;
    }
    
    // Update roughness maps
    if (material.roughnessMap) {
      const roughnessTexture = this.textureGenerator.generateRoughnessTexture(season, time);
      material.roughnessMap = roughnessTexture;
    }
    
    // Update emissive maps
    if (material.emissiveMap) {
      const emissiveTexture = this.textureGenerator.generateEmissiveTexture(season, time);
      material.emissiveMap = emissiveTexture;
    }
  }

  createAnimatedMaterial(type, season, options = {}) {
    const materialKey = `${type}_${season}_${JSON.stringify(options)}`;
    
    if (this.materialCache.has(materialKey)) {
      return this.materialCache.get(materialKey);
    }
    
    const material = this.createBaseMaterial(type, options);
    material.name = type;
    
    // Apply seasonal effects
    this.animateMaterial(material, season, this.time);
    
    // Cache the material
    this.materialCache.set(materialKey, material);
    
    return material;
  }

  createBaseMaterial(type, options = {}) {
    const baseOptions = {
      roughness: 0.8,
      metalness: 0.0,
      transparent: false,
      opacity: 1.0,
      ...options
    };
    
    switch (type) {
      case 'trunk':
        return new THREE.MeshStandardMaterial({
          color: 0x8B4513,
          roughness: baseOptions.roughness,
          metalness: baseOptions.metalness,
          ...baseOptions
        });
      case 'branch':
        return new THREE.MeshStandardMaterial({
          color: 0xA0522D,
          roughness: baseOptions.roughness,
          metalness: baseOptions.metalness,
          ...baseOptions
        });
      case 'leaf':
        return new THREE.MeshStandardMaterial({
          color: 0x228B22,
          roughness: 0.3,
          metalness: 0.0,
          transparent: true,
          opacity: 0.9,
          ...baseOptions
        });
      case 'root':
        return new THREE.MeshStandardMaterial({
          color: 0x654321,
          roughness: 0.9,
          metalness: 0.0,
          ...baseOptions
        });
      default:
        return new THREE.MeshStandardMaterial({
          color: 0x8B4513,
          roughness: baseOptions.roughness,
          metalness: baseOptions.metalness,
          ...baseOptions
        });
    }
  }
}

// ============================================================================
// 2. SEASONAL EFFECT SYSTEM
// ============================================================================

class SeasonalEffectSystem {
  constructor() {
    this.seasons = {
      spring: {
        colors: {
          trunk: '#8B4513',
          branch: '#A0522D',
          leaf: '#90EE90'
        },
        roughness: { wood: 0.7, leaf: 0.4 },
        metallic: { wood: 0.0, leaf: 0.0 },
        normalScale: { wood: 1.2, leaf: 0.8 },
        emissive: { wood: [0, 0, 0], leaf: [0.1, 0.2, 0] }
      },
      summer: {
        colors: {
          trunk: '#8B4513',
          branch: '#A0522D',
          leaf: '#228B22'
        },
        roughness: { wood: 0.8, leaf: 0.3 },
        metallic: { wood: 0.0, leaf: 0.0 },
        normalScale: { wood: 1.0, leaf: 1.0 },
        emissive: { wood: [0, 0, 0], leaf: [0, 0, 0] }
      },
      autumn: {
        colors: {
          trunk: '#8B4513',
          branch: '#A0522D',
          leaf: '#FF8C00'
        },
        roughness: { wood: 0.6, leaf: 0.5 },
        metallic: { wood: 0.1, leaf: 0.0 },
        normalScale: { wood: 1.1, leaf: 1.2 },
        emissive: { wood: [0, 0, 0], leaf: [0.1, 0.05, 0] }
      },
      winter: {
        colors: {
          trunk: '#696969',
          branch: '#808080',
          leaf: '#F0F8FF'
        },
        roughness: { wood: 0.9, leaf: 0.8 },
        metallic: { wood: 0.2, leaf: 0.1 },
        normalScale: { wood: 0.8, leaf: 0.6 },
        emissive: { wood: [0.05, 0.05, 0.05], leaf: [0.1, 0.1, 0.1] }
      }
    };
    
    this.currentSeason = 'summer';
    this.transitionProgress = 0;
    this.transitionDuration = 5.0;
  }

  getSeasonalColors(season) {
    return this.seasons[season]?.colors || this.seasons.summer.colors;
  }

  getSeasonalRoughness(season) {
    return this.seasons[season]?.roughness || this.seasons.summer.roughness;
  }

  getSeasonalMetallic(season) {
    return this.seasons[season]?.metallic || this.seasons.summer.metallic;
  }

  getSeasonalNormalScale(season) {
    return this.seasons[season]?.normalScale || this.seasons.summer.normalScale;
  }

  getSeasonalEmissive(season) {
    const emissive = this.seasons[season]?.emissive || this.seasons.summer.emissive;
    return {
      wood: new THREE.Color(emissive.wood[0], emissive.wood[1], emissive.wood[2]),
      leaf: new THREE.Color(emissive.leaf[0], emissive.leaf[1], emissive.leaf[2])
    };
  }

  updateSeason(newSeason, transitionDuration = 5.0) {
    if (this.currentSeason === newSeason) return;
    
    this.startSeasonTransition(newSeason, transitionDuration);
  }

  startSeasonTransition(newSeason, duration) {
    const oldSeason = this.currentSeason;
    const startTime = performance.now();
    
    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      this.transitionProgress = Math.min(elapsed / duration, 1);
      
      // Apply seasonal effects
      this.applySeasonalEffects(oldSeason, newSeason, this.transitionProgress);
      
      if (this.transitionProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.currentSeason = newSeason;
        this.transitionProgress = 0;
      }
    };
    
    animate();
  }

  applySeasonalEffects(oldSeason, newSeason, progress) {
    // Interpolate between old and new seasonal properties
    const oldColors = this.getSeasonalColors(oldSeason);
    const newColors = this.getSeasonalColors(newSeason);
    
    const interpolatedColors = {
      trunk: this.interpolateColor(oldColors.trunk, newColors.trunk, progress),
      branch: this.interpolateColor(oldColors.branch, newColors.branch, progress),
      leaf: this.interpolateColor(oldColors.leaf, newColors.leaf, progress)
    };
    
    // Update global seasonal colors
    this.seasons[newSeason].colors = interpolatedColors;
  }

  interpolateColor(color1, color2, progress) {
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    const interpolated = new THREE.Color();
    
    interpolated.lerpColors(c1, c2, progress);
    return '#' + interpolated.getHexString();
  }

  getCurrentSeason() {
    return this.currentSeason;
  }

  getTransitionProgress() {
    return this.transitionProgress;
  }
}

// ============================================================================
// 3. DYNAMIC TEXTURE GENERATOR
// ============================================================================

class DynamicTextureGenerator {
  constructor() {
    this.textureCache = new Map();
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.width = 512;
    this.canvas.height = 512;
  }

  generateNormalTexture(season, time) {
    const cacheKey = `normal_${season}_${Math.floor(time / 10)}`;
    
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey);
    }
    
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Generate normal map based on season
    switch (season) {
      case 'spring':
        this.generateSpringNormalMap(time);
        break;
      case 'summer':
        this.generateSummerNormalMap(time);
        break;
      case 'autumn':
        this.generateAutumnNormalMap(time);
        break;
      case 'winter':
        this.generateWinterNormalMap(time);
        break;
    }
    
    const texture = new THREE.CanvasTexture(this.canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    
    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  generateSpringNormalMap(time) {
    // Spring: fresh bark with subtle variations
    for (let x = 0; x < this.canvas.width; x += 4) {
      for (let y = 0; y < this.canvas.height; y += 4) {
        const noise = this.perlinNoise(x * 0.01, y * 0.01, time * 0.1);
        const color = Math.floor(128 + noise * 64);
        this.context.fillStyle = `rgb(${color}, ${color}, 255)`;
        this.context.fillRect(x, y, 4, 4);
      }
    }
  }

  generateSummerNormalMap(time) {
    // Summer: mature bark with more texture
    for (let x = 0; x < this.canvas.width; x += 2) {
      for (let y = 0; y < this.canvas.height; y += 2) {
        const noise = this.perlinNoise(x * 0.02, y * 0.02, time * 0.05);
        const color = Math.floor(128 + noise * 96);
        this.context.fillStyle = `rgb(${color}, ${color}, 255)`;
        this.context.fillRect(x, y, 2, 2);
      }
    }
  }

  generateAutumnNormalMap(time) {
    // Autumn: rough bark with leaf texture
    for (let x = 0; x < this.canvas.width; x += 3) {
      for (let y = 0; y < this.canvas.height; y += 3) {
        const noise = this.perlinNoise(x * 0.015, y * 0.015, time * 0.08);
        const color = Math.floor(128 + noise * 112);
        this.context.fillStyle = `rgb(${color}, ${color}, 255)`;
        this.context.fillRect(x, y, 3, 3);
      }
    }
  }

  generateWinterNormalMap(time) {
    // Winter: smooth bark with frost texture
    for (let x = 0; x < this.canvas.width; x += 6) {
      for (let y = 0; y < this.canvas.height; y += 6) {
        const noise = this.perlinNoise(x * 0.008, y * 0.008, time * 0.03);
        const color = Math.floor(128 + noise * 48);
        this.context.fillStyle = `rgb(${color}, ${color}, 255)`;
        this.context.fillRect(x, y, 6, 6);
      }
    }
  }

  generateRoughnessTexture(season, time) {
    const cacheKey = `roughness_${season}_${Math.floor(time / 10)}`;
    
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey);
    }
    
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Generate roughness map based on season
    const baseRoughness = this.getSeasonalRoughness(season);
    
    for (let x = 0; x < this.canvas.width; x += 4) {
      for (let y = 0; y < this.canvas.height; y += 4) {
        const noise = this.perlinNoise(x * 0.01, y * 0.01, time * 0.1);
        const roughness = Math.floor(baseRoughness * 255 + noise * 64);
        const color = Math.max(0, Math.min(255, roughness));
        this.context.fillStyle = `rgb(${color}, ${color}, ${color})`;
        this.context.fillRect(x, y, 4, 4);
      }
    }
    
    const texture = new THREE.CanvasTexture(this.canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    
    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  getSeasonalRoughness(season) {
    const roughnessMap = {
      spring: 0.6,
      summer: 0.8,
      autumn: 0.7,
      winter: 0.9
    };
    return roughnessMap[season] || 0.8;
  }

  generateEmissiveTexture(season, time) {
    const cacheKey = `emissive_${season}_${Math.floor(time / 10)}`;
    
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey);
    }
    
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Generate emissive map based on season
    const emissiveIntensity = this.getSeasonalEmissive(season);
    
    for (let x = 0; x < this.canvas.width; x += 8) {
      for (let y = 0; y < this.canvas.height; y += 8) {
        const noise = this.perlinNoise(x * 0.005, y * 0.005, time * 0.05);
        const emissive = Math.floor(emissiveIntensity * 255 + noise * 32);
        const color = Math.max(0, Math.min(255, emissive));
        this.context.fillStyle = `rgb(${color}, ${color}, ${color})`;
        this.context.fillRect(x, y, 8, 8);
      }
    }
    
    const texture = new THREE.CanvasTexture(this.canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    
    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  getSeasonalEmissive(season) {
    const emissiveMap = {
      spring: 0.1,
      summer: 0.0,
      autumn: 0.05,
      winter: 0.08
    };
    return emissiveMap[season] || 0.0;
  }

  perlinNoise(x, y, z) {
    // Simplified Perlin noise implementation
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    
    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);
    
    const A = this.p[X] + Y;
    const AA = this.p[A] + Z;
    const AB = this.p[A + 1] + Z;
    const B = this.p[X + 1] + Y;
    const BA = this.p[B] + Z;
    const BB = this.p[B + 1] + Z;
    
    return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p[AA], x, y, z),
      this.grad(this.p[BA], x - 1, y, z)),
      this.lerp(u, this.grad(this.p[AB], x, y - 1, z),
        this.grad(this.p[BB], x - 1, y - 1, z))),
      this.lerp(v, this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1),
        this.grad(this.p[BA + 1], x - 1, y, z - 1)),
        this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1),
          this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))));
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(t, a, b) {
    return a + t * (b - a);
  }

  grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  // Permutation table for Perlin noise
  p = new Array(512);
  
  constructor() {
    // Initialize permutation table
    for (let i = 0; i < 256; i++) {
      this.p[i] = Math.floor(Math.random() * 256);
    }
    for (let i = 0; i < 256; i++) {
      this.p[256 + i] = this.p[i];
    }
  }
}

// ============================================================================
// 4. MAIN REAL-TIME MATERIAL SYSTEM
// ============================================================================

export class RealTimeMaterialSystem {
  constructor(config = {}) {
    this.animator = new MaterialAnimator();
    this.seasonalEffects = new SeasonalEffectSystem();
    this.textureGenerator = new DynamicTextureGenerator();
    
    // Merge config
    Object.assign(this.animator.config, config);
    
    this.materials = new Map();
    this.weather = { type: 'clear', intensity: 0 };
    this.isActive = false;
    this.animationLoop = null;
  }

  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.animationLoop = setInterval(() => {
      this.update();
    }, 16); // ~60 FPS
    
    console.log('Real-time material system started');
  }

  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    if (this.animationLoop) {
      clearInterval(this.animationLoop);
      this.animationLoop = null;
    }
    
    console.log('Real-time material system stopped');
  }

  update() {
    const time = performance.now() / 1000;
    
    // Update all materials
    for (const [id, material] of this.materials) {
      this.animator.animateMaterial(
        material, 
        this.seasonalEffects.getCurrentSeason(), 
        time, 
        this.weather
      );
    }
  }

  createMaterial(type, season, options = {}) {
    const material = this.animator.createAnimatedMaterial(type, season, options);
    const id = `${type}_${Date.now()}_${Math.random()}`;
    
    this.materials.set(id, material);
    return { id, material };
  }

  updateMaterial(id, properties) {
    const materialData = this.materials.get(id);
    if (!materialData) return;
    
    Object.assign(materialData.material, properties);
  }

  removeMaterial(id) {
    const materialData = this.materials.get(id);
    if (materialData) {
      materialData.material.dispose();
      this.materials.delete(id);
    }
  }

  setSeason(season) {
    this.seasonalEffects.updateSeason(season);
  }

  setWeather(weather) {
    this.weather = weather;
  }

  getCurrentSeason() {
    return this.seasonalEffects.getCurrentSeason();
  }

  getWeather() {
    return this.weather;
  }

  setConfig(config) {
    Object.assign(this.animator.config, config);
  }

  getConfig() {
    return { ...this.animator.config };
  }

  clearCache() {
    this.animator.materialCache.clear();
    this.textureGenerator.textureCache.clear();
  }
}

// Export individual classes for specific use cases
export {
  MaterialAnimator,
  SeasonalEffectSystem,
  DynamicTextureGenerator
}; 