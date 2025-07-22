import * as THREE from 'three';

/**
 * Visual Feedback Manager
 * Provides enhanced visual feedback for user interactions
 * Implements smooth animations and visual effects
 */
export class VisualFeedbackManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.effects = new Map();
        this.activeEffects = [];
        this.effectPool = [];
        this.maxEffects = 50;
        
        this.setupEffects();
        this.setupEventListeners();
    }
    
    /**
     * Setup available effect types
     */
    setupEffects() {
        this.effects.set('damage', this.createDamageEffect.bind(this));
        this.effects.set('heal', this.createHealEffect.bind(this));
        this.effects.set('weaponSwitch', this.createWeaponSwitchEffect.bind(this));
        this.effects.set('hit', this.createHitEffect.bind(this));
        this.effects.set('reload', this.createReloadEffect.bind(this));
        this.effects.set('pickup', this.createPickupEffect.bind(this));
        this.effects.set('levelUp', this.createLevelUpEffect.bind(this));
    }
    
    /**
     * Setup event listeners for visual feedback
     */
    setupEventListeners() {
        // Listen for custom events
        document.addEventListener('playerDamage', (event) => {
            this.createDamageEffect(event.detail.damage, event.detail.position);
        });
        
        document.addEventListener('playerHeal', (event) => {
            this.createHealEffect(event.detail.amount, event.detail.position);
        });
        
        document.addEventListener('weaponSwitch', (event) => {
            this.createWeaponSwitchEffect(event.detail.weaponName);
        });
        
        document.addEventListener('hitMarker', (event) => {
            this.createHitEffect(event.detail.position);
        });
        
        document.addEventListener('reloadStart', (event) => {
            this.createReloadEffect(event.detail.weaponName);
        });
        
        document.addEventListener('itemPickup', (event) => {
            this.createPickupEffect(event.detail.itemName, event.detail.position);
        });
        
        document.addEventListener('levelUp', (event) => {
            this.createLevelUpEffect(event.detail.level);
        });
    }
    
    /**
     * Create damage effect
     * @param {number} damage - Damage amount
     * @param {Object} position - Position vector
     */
    createDamageEffect(damage, position) {
        const effect = this.getEffectFromPool();
        
        // Create damage text geometry
        const textGeometry = new THREE.TextGeometry(damage.toString(), {
            font: this.getFont(),
            size: 0.5,
            height: 0.1
        });
        
        const textMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 1.0
        });
        
        effect.mesh = new THREE.Mesh(textGeometry, textMaterial);
        effect.mesh.position.copy(position);
        effect.mesh.position.y += 2;
        
        effect.type = 'damage';
        effect.value = damage;
        effect.duration = 2000;
        effect.animation = 'fadeOut';
        effect.active = true;
        effect.startTime = Date.now();
        
        // Add to scene
        this.scene.add(effect.mesh);
        this.activeEffects.push(effect);
        
        // Create blood splatter effect
        this.createBloodSplatter(position);
    }
    
    /**
     * Create heal effect
     * @param {number} amount - Heal amount
     * @param {Object} position - Position vector
     */
    createHealEffect(amount, position) {
        const effect = this.getEffectFromPool();
        
        // Create heal text geometry
        const textGeometry = new THREE.TextGeometry(`+${amount}`, {
            font: this.getFont(),
            size: 0.4,
            height: 0.1
        });
        
        const textMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00,
            transparent: true,
            opacity: 1.0
        });
        
        effect.mesh = new THREE.Mesh(textGeometry, textMaterial);
        effect.mesh.position.copy(position);
        effect.mesh.position.y += 2;
        
        effect.type = 'heal';
        effect.value = amount;
        effect.duration = 1500;
        effect.animation = 'fadeOut';
        effect.active = true;
        effect.startTime = Date.now();
        
        // Add to scene
        this.scene.add(effect.mesh);
        this.activeEffects.push(effect);
        
        // Create healing particles
        this.createHealingParticles(position);
    }
    
    /**
     * Create weapon switch effect
     * @param {string} weaponName - Name of the weapon
     */
    createWeaponSwitchEffect(weaponName) {
        // Create UI notification
        this.createUINotification(`Switched to ${weaponName}`, 'weapon-switch');
        
        // Create weapon model preview
        this.createWeaponPreview(weaponName);
    }
    
    /**
     * Create hit effect
     * @param {Object} position - Hit position
     */
    createHitEffect(position) {
        // Create hit marker
        this.createHitMarker(position);
        
        // Create impact particles
        this.createImpactParticles(position);
        
        // Screen flash effect
        this.createScreenFlash(0.1, 0xff0000);
    }
    
    /**
     * Create reload effect
     * @param {string} weaponName - Weapon being reloaded
     */
    createReloadEffect(weaponName) {
        // Create reload progress bar
        this.createReloadProgress(weaponName);
        
        // Create reload sound visualization
        this.createReloadVisualization();
    }
    
    /**
     * Create pickup effect
     * @param {string} itemName - Name of the item
     * @param {Object} position - Pickup position
     */
    createPickupEffect(itemName, position) {
        // Create pickup notification
        this.createUINotification(`Picked up ${itemName}`, 'pickup');
        
        // Create pickup particles
        this.createPickupParticles(position);
        
        // Create item icon
        this.createItemIcon(itemName);
    }
    
    /**
     * Create level up effect
     * @param {number} level - New level
     */
    createLevelUpEffect(level) {
        // Create level up notification
        this.createUINotification(`Level Up! ${level}`, 'level-up');
        
        // Create celebration particles
        this.createCelebrationParticles();
        
        // Screen flash effect
        this.createScreenFlash(0.3, 0xffff00);
    }
    
    /**
     * Create blood splatter effect
     * @param {Object} position - Splatter position
     */
    createBloodSplatter(position) {
        const particleCount = 20;
        const particles = new THREE.Points(
            new THREE.BufferGeometry(),
            new THREE.PointsMaterial({
                color: 0x8b0000,
                size: 0.1,
                transparent: true,
                opacity: 0.8
            })
        );
        
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = position.x + (Math.random() - 0.5) * 2;
            positions[i * 3 + 1] = position.y + Math.random() * 2;
            positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 2;
            
            velocities.push({
                x: (Math.random() - 0.5) * 10,
                y: Math.random() * 5,
                z: (Math.random() - 0.5) * 10
            });
        }
        
        particles.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.userData = { velocities, startTime: Date.now() };
        
        this.scene.add(particles);
        
        // Animate particles
        this.animateParticles(particles, 2000);
    }
    
    /**
     * Create healing particles
     * @param {Object} position - Healing position
     */
    createHealingParticles(position) {
        const particleCount = 15;
        const particles = new THREE.Points(
            new THREE.BufferGeometry(),
            new THREE.PointsMaterial({
                color: 0x00ff00,
                size: 0.15,
                transparent: true,
                opacity: 0.6
            })
        );
        
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = position.x + (Math.random() - 0.5) * 1;
            positions[i * 3 + 1] = position.y + Math.random() * 1;
            positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 1;
        }
        
        particles.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.userData = { startTime: Date.now() };
        
        this.scene.add(particles);
        
        // Animate healing particles
        this.animateHealingParticles(particles, 1500);
    }
    
    /**
     * Create UI notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type
     */
    createUINotification(message, type) {
        if (typeof document === 'undefined') return;
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    /**
     * Create screen flash effect
     * @param {number} duration - Flash duration in seconds
     * @param {number} color - Flash color
     */
    createScreenFlash(duration, color) {
        if (typeof document === 'undefined') return;
        
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${this.hexToRgb(color)};
            opacity: 0.3;
            z-index: 9999;
            pointer-events: none;
            transition: opacity ${duration}s ease;
        `;
        
        document.body.appendChild(flash);
        
        // Fade out
        setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => {
                if (flash.parentNode) {
                    flash.parentNode.removeChild(flash);
                }
            }, duration * 1000);
        }, 50);
    }
    
    /**
     * Animate effects
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        const currentTime = Date.now();
        
        // Update active effects
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];
            const elapsed = currentTime - effect.startTime;
            
            if (elapsed >= effect.duration) {
                // Remove expired effect
                this.scene.remove(effect.mesh);
                this.returnEffectToPool(effect);
                this.activeEffects.splice(i, 1);
            } else {
                // Animate effect
                this.animateEffect(effect, elapsed, effect.duration);
            }
        }
    }
    
    /**
     * Animate individual effect
     * @param {Object} effect - Effect to animate
     * @param {number} elapsed - Elapsed time
     * @param {number} duration - Total duration
     */
    animateEffect(effect, elapsed, duration) {
        const progress = elapsed / duration;
        
        switch (effect.animation) {
            case 'fadeOut':
                effect.mesh.material.opacity = 1 - progress;
                effect.mesh.position.y += 0.02; // Float upward
                break;
                
            case 'scale':
                const scale = 1 + progress * 0.5;
                effect.mesh.scale.set(scale, scale, scale);
                effect.mesh.material.opacity = 1 - progress;
                break;
                
            case 'rotate':
                effect.mesh.rotation.z += 0.1;
                effect.mesh.material.opacity = 1 - progress;
                break;
        }
    }
    
    /**
     * Get effect from pool or create new one
     * @returns {Object} Effect object
     */
    getEffectFromPool() {
        if (this.effectPool.length > 0) {
            return this.effectPool.pop();
        }
        
        return {
            mesh: null,
            type: '',
            value: 0,
            duration: 0,
            animation: '',
            active: false,
            startTime: 0
        };
    }
    
    /**
     * Return effect to pool
     * @param {Object} effect - Effect to return
     */
    returnEffectToPool(effect) {
        if (this.effectPool.length < this.maxEffects) {
            // Reset effect
            effect.mesh = null;
            effect.type = '';
            effect.value = 0;
            effect.duration = 0;
            effect.animation = '';
            effect.active = false;
            effect.startTime = 0;
            
            this.effectPool.push(effect);
        }
    }
    
    /**
     * Get font for text geometry
     * @returns {Object} Font object
     */
    getFont() {
        // Return a default font or load custom font
        return null; // Will use default font
    }
    
    /**
     * Convert hex color to RGB
     * @param {number} hex - Hex color value
     * @returns {string} RGB color string
     */
    hexToRgb(hex) {
        const r = (hex >> 16) & 255;
        const g = (hex >> 8) & 255;
        const b = hex & 255;
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    /**
     * Animate particles
     * @param {THREE.Points} particles - Particle system
     * @param {number} duration - Animation duration
     */
    animateParticles(particles, duration) {
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1) {
                this.scene.remove(particles);
                return;
            }
            
            // Update particle positions
            const positions = particles.geometry.attributes.position.array;
            const velocities = particles.userData.velocities;
            
            for (let i = 0; i < velocities.length; i++) {
                positions[i * 3] += velocities[i].x * 0.016;
                positions[i * 3 + 1] += velocities[i].y * 0.016;
                positions[i * 3 + 2] += velocities[i].z * 0.016;
                
                // Apply gravity
                velocities[i].y -= 0.1;
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
            
            // Fade out particles
            particles.material.opacity = 1 - progress;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    /**
     * Animate healing particles
     * @param {THREE.Points} particles - Particle system
     * @param {number} duration - Animation duration
     */
    animateHealingParticles(particles, duration) {
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1) {
                this.scene.remove(particles);
                return;
            }
            
            // Float particles upward
            const positions = particles.geometry.attributes.position.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += 0.02; // Move upward
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
            
            // Fade out particles
            particles.material.opacity = 1 - progress;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    /**
     * Create weapon preview
     * @param {string} weaponName - Name of the weapon
     */
    createWeaponPreview(weaponName) {
        // Implementation for weapon model preview
        console.log(`Creating weapon preview for ${weaponName}`);
    }
    
    /**
     * Create hit marker
     * @param {Object} position - Hit position
     */
    createHitMarker(position) {
        // Implementation for hit marker
        console.log('Creating hit marker');
    }
    
    /**
     * Create impact particles
     * @param {Object} position - Impact position
     */
    createImpactParticles(position) {
        // Implementation for impact particles
        console.log('Creating impact particles');
    }
    
    /**
     * Create reload progress
     * @param {string} weaponName - Weapon being reloaded
     */
    createReloadProgress(weaponName) {
        // Implementation for reload progress bar
        console.log(`Creating reload progress for ${weaponName}`);
    }
    
    /**
     * Create reload visualization
     */
    createReloadVisualization() {
        // Implementation for reload sound visualization
        console.log('Creating reload visualization');
    }
    
    /**
     * Create pickup particles
     * @param {Object} position - Pickup position
     */
    createPickupParticles(position) {
        // Implementation for pickup particles
        console.log('Creating pickup particles');
    }
    
    /**
     * Create item icon
     * @param {string} itemName - Name of the item
     */
    createItemIcon(itemName) {
        // Implementation for item icon
        console.log(`Creating item icon for ${itemName}`);
    }
    
    /**
     * Create celebration particles
     */
    createCelebrationParticles() {
        // Implementation for celebration particles
        console.log('Creating celebration particles');
    }
    
    /**
     * Cleanup resources
     */
    dispose() {
        // Remove all active effects
        this.activeEffects.forEach(effect => {
            if (effect.mesh) {
                this.scene.remove(effect.mesh);
                effect.mesh.geometry.dispose();
                effect.mesh.material.dispose();
            }
        });
        
        this.activeEffects = [];
        this.effectPool = [];
        this.effects.clear();
    }
} 