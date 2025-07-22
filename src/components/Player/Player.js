import * as THREE from 'three';

/**
 * Player Component
 * Manages player state, movement, and interactions
 */
class Player {
    constructor(services) {
        this.services = services;
        this.mathEngine = services.resolve('mathematicalEngine');
        this.gameState = services.resolve('gameState');
        this.weaponSystem = services.resolve('weaponSystem');
        
        // Player properties
        this.mesh = null;
        this.geometry = null;
        this.material = null;
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.speed = 10 * this.mathEngine.ALPHA;
        this.jumpForce = 15 * this.mathEngine.SQRT_TEN.x;
        this.isGrounded = false;
        this.healthBar = null;
        this.deathScreen = null;
        this.killFeed = null;
        this.damageIndicators = [];
        this.hitIndicators = [];
        
        // Player state
        this.isInvulnerable = false;
        this.invulnerabilityTime = 0;
        this.invulnerabilityDuration = 2 * this.mathEngine.SQRT_TEN.x;
        this.deathTime = 0;
        this.respawnTime = 3 * this.mathEngine.ALPHA;
    }

    /**
     * Initialize the player
     * @param {THREE.Scene} scene - The Three.js scene
     */
    init(scene) {
        this.createPlayerMesh();
        this.createHealthBar();
        this.createDeathScreen();
        this.createKillFeed();
        
        if (scene) {
            scene.add(this.mesh);
        }
    }

    /**
     * Create the player mesh
     */
    createPlayerMesh() {
        this.geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
        this.material = new THREE.MeshLambertMaterial({ 
            color: 0x00ff00,
            transparent: true,
            opacity: 0.8
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(0, 2, 0);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }

    /**
     * Create the health bar UI
     */
    createHealthBar() {
        // Only create UI if we're in a browser environment
        if (typeof document !== 'undefined') {
            this.healthBar = document.createElement('div');
            this.healthBar.style.position = 'absolute';
            this.healthBar.style.top = '20px';
            this.healthBar.style.left = '20px';
            this.healthBar.style.width = '200px';
            this.healthBar.style.height = '20px';
            this.healthBar.style.backgroundColor = '#333';
            this.healthBar.style.border = '2px solid #fff';
            this.healthBar.style.borderRadius = '10px';
            this.healthBar.style.overflow = 'hidden';
            
            const healthFill = document.createElement('div');
            healthFill.style.width = '100%';
            healthFill.style.height = '100%';
            healthFill.style.backgroundColor = '#00ff00';
            healthFill.style.transition = 'width 0.3s ease';
            healthFill.id = 'healthFill';
            
            this.healthBar.appendChild(healthFill);
            document.body.appendChild(this.healthBar);
        }
    }

    /**
     * Create the death screen UI
     */
    createDeathScreen() {
        // Only create UI if we're in a browser environment
        if (typeof document !== 'undefined') {
            this.deathScreen = document.createElement('div');
            this.deathScreen.style.position = 'absolute';
            this.deathScreen.style.top = '0';
            this.deathScreen.style.left = '0';
            this.deathScreen.style.width = '100%';
            this.deathScreen.style.height = '100%';
            this.deathScreen.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
            this.deathScreen.style.display = 'none';
            this.deathScreen.style.justifyContent = 'center';
            this.deathScreen.style.alignItems = 'center';
            this.deathScreen.style.fontSize = '48px';
            this.deathScreen.style.color = '#fff';
            this.deathScreen.style.fontWeight = 'bold';
            this.deathScreen.textContent = 'YOU DIED';
            
            document.body.appendChild(this.deathScreen);
        }
    }

    /**
     * Create the kill feed UI
     */
    createKillFeed() {
        // Only create UI if we're in a browser environment
        if (typeof document !== 'undefined') {
            this.killFeed = document.createElement('div');
            this.killFeed.style.position = 'absolute';
            this.killFeed.style.top = '100px';
            this.killFeed.style.right = '20px';
            this.killFeed.style.width = '300px';
            this.killFeed.style.fontSize = '16px';
            this.killFeed.style.color = '#fff';
            this.killFeed.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            
            document.body.appendChild(this.killFeed);
        }
    }

    /**
     * Update player movement based on input
     * @param {Object} input - Input state
     * @param {number} deltaTime - Time since last frame
     * @param {Object} planetData - Current planet data
     */
    updateMovement(input, deltaTime, planetData) {
        if (this.gameState.isDead) return;

        const moveSpeed = this.speed * deltaTime;
        const jumpSpeed = this.jumpForce * deltaTime;

        // Reset acceleration
        this.acceleration.set(0, 0, 0);

        // Apply gravity
        this.acceleration.y += planetData.gravity * deltaTime;

        // Handle movement input
        if (input.keys['KeyW']) {
            this.acceleration.z -= moveSpeed;
        }
        if (input.keys['KeyS']) {
            this.acceleration.z += moveSpeed;
        }
        if (input.keys['KeyA']) {
            this.acceleration.x -= moveSpeed;
        }
        if (input.keys['KeyD']) {
            this.acceleration.x += moveSpeed;
        }
        if (input.keys['Space'] && this.isGrounded) {
            this.velocity.y = jumpSpeed;
            this.isGrounded = false;
        }

        // Apply acceleration to velocity
        this.velocity.add(this.acceleration);

        // Apply velocity to position
        this.mesh.position.add(this.velocity.clone().multiplyScalar(deltaTime));

        // Ground collision
        if (this.mesh.position.y <= 1) {
            this.mesh.position.y = 1;
            this.velocity.y = 0;
            this.isGrounded = true;
        }

        // Apply mathematical effects
        this.applyMathematicalEffects(planetData);
    }

    /**
     * Apply mathematical effects to player
     * @param {Object} planetData - Current planet data
     */
    applyMathematicalEffects(planetData) {
        const alphaInfluence = this.mathEngine.ALPHA;
        const sqrtTenInfluence = this.mathEngine.SQRT_TEN.x;
        
        // Apply planet-specific mathematical effects
        this.velocity.multiplyScalar(1 + (planetData.mathematicalInfluence * alphaInfluence));
        this.speed *= (1 + (planetData.mathematicalInfluence * sqrtTenInfluence));
    }

    /**
     * Take damage
     * @param {number} damage - Amount of damage to take
     */
    takeDamage(damage) {
        if (this.isInvulnerable) return;

        this.gameState.playerHealth -= damage;
        this.gameState.playerHealth = Math.max(0, this.gameState.playerHealth);
        
        this.updateHealthBar();
        this.createDamageIndicator(damage);
        
        if (this.gameState.playerHealth <= 0) {
            this.die();
        } else {
            this.setInvulnerable();
        }
    }

    /**
     * Create damage indicator
     * @param {number} damage - Damage amount
     */
    createDamageIndicator(damage) {
        if (typeof document === 'undefined') return;
        
        const indicator = document.createElement('div');
        indicator.style.position = 'absolute';
        indicator.style.left = '50%';
        indicator.style.top = '50%';
        indicator.style.transform = 'translate(-50%, -50%)';
        indicator.style.color = '#ff0000';
        indicator.style.fontSize = '24px';
        indicator.style.fontWeight = 'bold';
        indicator.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        indicator.textContent = `-${damage}`;
        
        document.body.appendChild(indicator);
        
        // Animate and remove
        let opacity = 1;
        const fadeOut = setInterval(() => {
            opacity -= 0.02;
            indicator.style.opacity = opacity;
            indicator.style.transform = `translate(-50%, ${-50 - (1 - opacity) * 50}%)`;
            
            if (opacity <= 0) {
                clearInterval(fadeOut);
                if (document.body.contains(indicator)) {
                    document.body.removeChild(indicator);
                }
            }
        }, 16);
    }

    /**
     * Set player as invulnerable
     */
    setInvulnerable() {
        this.isInvulnerable = true;
        this.invulnerabilityTime = 0;
        this.material.opacity = 0.5;
    }

    /**
     * Update invulnerability
     * @param {number} deltaTime - Time since last frame
     */
    updateInvulnerability(deltaTime) {
        if (this.isInvulnerable) {
            this.invulnerabilityTime += deltaTime;
            
            if (this.invulnerabilityTime >= this.invulnerabilityDuration) {
                this.isInvulnerable = false;
                this.material.opacity = 0.8;
            }
        }
    }

    /**
     * Handle player death
     */
    die() {
        this.gameState.isDead = true;
        this.gameState.deaths++;
        this.deathTime = 0;
        
        if (this.deathScreen) {
            this.deathScreen.style.display = 'flex';
        }
        this.mesh.visible = false;
    }

    /**
     * Respawn the player
     */
    respawn() {
        this.gameState.isDead = false;
        this.gameState.playerHealth = this.gameState.maxHealth;
        
        if (this.deathScreen) {
            this.deathScreen.style.display = 'none';
        }
        this.mesh.visible = true;
        this.mesh.position.set(0, 2, 0);
        this.velocity.set(0, 0, 0);
        this.acceleration.set(0, 0, 0);
        
        this.updateHealthBar();
    }

    /**
     * Update death timer
     * @param {number} deltaTime - Time since last frame
     */
    updateDeath(deltaTime) {
        if (this.gameState.isDead) {
            this.deathTime += deltaTime;
            
            if (this.deathTime >= this.respawnTime) {
                this.respawn();
            }
        }
    }

    /**
     * Update health bar display
     */
    updateHealthBar() {
        if (typeof document === 'undefined') return;
        
        const healthFill = document.getElementById('healthFill');
        if (healthFill) {
            const healthPercent = (this.gameState.playerHealth / this.gameState.maxHealth) * 100;
            healthFill.style.width = `${healthPercent}%`;
            
            // Change color based on health
            if (healthPercent > 60) {
                healthFill.style.backgroundColor = '#00ff00';
            } else if (healthPercent > 30) {
                healthFill.style.backgroundColor = '#ffff00';
            } else {
                healthFill.style.backgroundColor = '#ff0000';
            }
        }
    }

    /**
     * Add kill to kill feed
     * @param {string} killer - Killer name
     * @param {string} victim - Victim name
     */
    addKill(killer, victim) {
        if (typeof document === 'undefined' || !this.killFeed) return;
        
        const killEntry = document.createElement('div');
        killEntry.style.marginBottom = '5px';
        killEntry.style.padding = '5px';
        killEntry.style.backgroundColor = 'rgba(0,0,0,0.7)';
        killEntry.style.borderRadius = '5px';
        killEntry.innerHTML = `<span style="color: #ff0000;">${killer}</span> killed <span style="color: #00ff00;">${victim}</span>`;
        
        this.killFeed.appendChild(killEntry);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (this.killFeed && this.killFeed.contains(killEntry)) {
                this.killFeed.removeChild(killEntry);
            }
        }, 5000);
    }

    /**
     * Update player
     * @param {Object} input - Input state
     * @param {number} deltaTime - Time since last frame
     * @param {Object} planetData - Current planet data
     */
    update(input, deltaTime, planetData) {
        this.updateMovement(input, deltaTime, planetData);
        this.updateInvulnerability(deltaTime);
        this.updateDeath(deltaTime);
    }

    /**
     * Get player position
     * @returns {THREE.Vector3} Player position
     */
    getPosition() {
        return this.mesh ? this.mesh.position.clone() : new THREE.Vector3();
    }

    /**
     * Set player position
     * @param {THREE.Vector3} position - New position
     */
    setPosition(position) {
        if (this.mesh) {
            this.mesh.position.copy(position);
        }
    }

    /**
     * Clean up player resources
     */
    dispose() {
        if (this.geometry) {
            this.geometry.dispose();
        }
        if (this.material) {
            this.material.dispose();
        }
        if (typeof document !== 'undefined') {
            if (this.healthBar && this.healthBar.parentNode) {
                this.healthBar.parentNode.removeChild(this.healthBar);
            }
            if (this.deathScreen && this.deathScreen.parentNode) {
                this.deathScreen.parentNode.removeChild(this.deathScreen);
            }
            if (this.killFeed && this.killFeed.parentNode) {
                this.killFeed.parentNode.removeChild(this.killFeed);
            }
        }
    }
}

export default Player; 