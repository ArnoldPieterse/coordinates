import * as THREE from 'three';

/**
 * Weapon System Component
 * Manages weapons, shooting mechanics, and ammunition
 */
class WeaponSystem {
    constructor(services) {
        this.services = services;
        this.mathEngine = services.resolve('mathematicalEngine');
        this.gameState = services.resolve('gameState');
        
        // Weapon properties
        this.weapons = {
            rifle: { 
                name: 'Rifle', 
                damage: 15, 
                fireRate: 0.1, 
                ammoCapacity: 30, 
                reloadTime: 2.0, 
                bulletSpeed: 30, 
                bulletSize: 0.1, 
                bulletColor: 0xFFFF00, 
                spread: 0.02, 
                automatic: true, 
                mathematicalInfluence: this.mathEngine.ALPHA 
            },
            shotgun: { 
                name: 'Shotgun', 
                damage: 10, 
                fireRate: 0.8, 
                ammoCapacity: 8, 
                reloadTime: 3.0, 
                bulletSpeed: 25, 
                bulletSize: 0.08, 
                bulletColor: 0xFF6B35, 
                spread: 0.15, 
                pelletCount: 8, 
                automatic: false, 
                mathematicalInfluence: this.mathEngine.SQRT_TEN.x 
            },
            sniper: { 
                name: 'Sniper', 
                damage: 75, 
                fireRate: 1.5, 
                ammoCapacity: 5, 
                reloadTime: 4.0, 
                bulletSpeed: 50, 
                bulletSize: 0.05, 
                bulletColor: 0x00FFFF, 
                spread: 0.001, 
                automatic: false, 
                mathematicalInfluence: this.mathEngine.ALPHA 
            },
            grenade: { 
                name: 'Grenade', 
                damage: 80, 
                fireRate: 2.0, 
                ammoCapacity: 3, 
                reloadTime: 1.0, 
                bulletSpeed: 15, 
                bulletSize: 0.3, 
                bulletColor: 0x8B4513, 
                spread: 0.05, 
                automatic: false, 
                fuseTime: 3.0, 
                explosionRadius: 8, 
                particleCount: 50, 
                mathematicalInfluence: this.mathEngine.SQRT_POINT_ONE.x 
            },
            rocket: { 
                name: 'Rocket', 
                damage: 120, 
                fireRate: 3.0, 
                ammoCapacity: 2, 
                reloadTime: 5.0, 
                bulletSpeed: 25, 
                bulletSize: 0.2, 
                bulletColor: 0xFF0000, 
                spread: 0.01, 
                automatic: false, 
                explosive: true, 
                explosionRadius: 12, 
                tracking: true, 
                particleCount: 30, 
                mathematicalInfluence: this.mathEngine.ALPHA 
            }
        };
        
        this.currentWeapon = 'rifle';
        this.ammo = { rifle: 30, shotgun: 8, sniper: 5, grenade: 3, rocket: 2 };
        this.isReloading = false;
        this.reloadTimer = 0;
        this.lastShotTime = 0;
        this.bullets = [];
        this.weaponUI = null;
        
        this.createWeaponUI();
    }

    /**
     * Create weapon UI
     */
    createWeaponUI() {
        this.weaponUI = document.createElement('div');
        this.weaponUI.style.position = 'absolute';
        this.weaponUI.style.bottom = '20px';
        this.weaponUI.style.left = '20px';
        this.weaponUI.style.backgroundColor = 'rgba(0,0,0,0.7)';
        this.weaponUI.style.padding = '10px';
        this.weaponUI.style.borderRadius = '10px';
        this.weaponUI.style.color = '#fff';
        this.weaponUI.style.fontFamily = 'Arial, sans-serif';
        this.weaponUI.style.fontSize = '14px';
        
        document.body.appendChild(this.weaponUI);
        this.updateWeaponUI();
    }

    /**
     * Update weapon UI display
     */
    updateWeaponUI() {
        if (!this.weaponUI) return;
        
        const weapon = this.weapons[this.currentWeapon];
        const currentAmmo = this.ammo[this.currentWeapon];
        
        this.weaponUI.innerHTML = `
            <div style="margin-bottom: 5px;">
                <strong>${weapon.name}</strong>
            </div>
            <div style="margin-bottom: 5px;">
                Ammo: ${currentAmmo}/${weapon.ammoCapacity}
            </div>
            <div style="margin-bottom: 5px;">
                Damage: ${weapon.damage}
            </div>
            <div style="margin-bottom: 5px;">
                Fire Rate: ${(1/weapon.fireRate).toFixed(1)}/s
            </div>
            ${this.isReloading ? '<div style="color: #ff0000;">Reloading...</div>' : ''}
        `;
    }

    /**
     * Switch to a different weapon
     * @param {string} weaponKey - Weapon key to switch to
     */
    switchWeapon(weaponKey) {
        if (this.weapons[weaponKey] && this.ammo[weaponKey] > 0) {
            this.currentWeapon = weaponKey;
            this.updateWeaponUI();
        }
    }

    /**
     * Shoot the current weapon
     * @param {THREE.Vector3} position - Shooting position
     * @param {THREE.Vector3} direction - Shooting direction
     * @param {THREE.Scene} scene - Three.js scene
     * @returns {boolean} Whether the shot was fired
     */
    shoot(position, direction, scene) {
        const weapon = this.weapons[this.currentWeapon];
        const currentTime = Date.now() / 1000;
        
        // Check if can shoot
        if (this.isReloading || 
            this.ammo[this.currentWeapon] <= 0 || 
            currentTime - this.lastShotTime < weapon.fireRate) {
            return false;
        }
        
        // Consume ammo
        this.ammo[this.currentWeapon]--;
        this.lastShotTime = currentTime;
        this.gameState.shotsFired++;
        
        // Create bullets based on weapon type
        if (this.currentWeapon === 'shotgun') {
            this.createShotgunBullets(position, direction, scene, weapon);
        } else {
            this.createBullet(position, direction, scene, weapon);
        }
        
        this.updateWeaponUI();
        return true;
    }

    /**
     * Create a single bullet
     * @param {THREE.Vector3} position - Bullet position
     * @param {THREE.Vector3} direction - Bullet direction
     * @param {THREE.Scene} scene - Three.js scene
     * @param {Object} weapon - Weapon data
     */
    createBullet(position, direction, scene, weapon) {
        const bulletGeometry = new THREE.SphereGeometry(weapon.bulletSize, 8, 8);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: weapon.bulletColor });
        const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
        
        // Apply spread
        const spread = weapon.spread;
        const spreadX = (Math.random() - 0.5) * spread;
        const spreadY = (Math.random() - 0.5) * spread;
        const spreadZ = (Math.random() - 0.5) * spread;
        
        const spreadDirection = direction.clone().add(new THREE.Vector3(spreadX, spreadY, spreadZ)).normalize();
        
        bulletMesh.position.copy(position);
        bulletMesh.velocity = spreadDirection.clone().multiplyScalar(weapon.bulletSpeed);
        bulletMesh.damage = weapon.damage;
        bulletMesh.life = 5.0; // 5 seconds life
        bulletMesh.weaponType = this.currentWeapon;
        
        // Apply mathematical effects
        this.applyMathematicalEffects(bulletMesh, weapon);
        
        this.bullets.push(bulletMesh);
        scene.add(bulletMesh);
    }

    /**
     * Create shotgun pellets
     * @param {THREE.Vector3} position - Bullet position
     * @param {THREE.Vector3} direction - Bullet direction
     * @param {THREE.Scene} scene - Three.js scene
     * @param {Object} weapon - Weapon data
     */
    createShotgunBullets(position, direction, scene, weapon) {
        for (let i = 0; i < weapon.pelletCount; i++) {
            this.createBullet(position, direction, scene, weapon);
        }
    }

    /**
     * Apply mathematical effects to bullet
     * @param {THREE.Mesh} bullet - Bullet mesh
     * @param {Object} weapon - Weapon data
     */
    applyMathematicalEffects(bullet, weapon) {
        const alphaInfluence = this.mathEngine.ALPHA;
        const sqrtTenInfluence = this.mathEngine.SQRT_TEN.x;
        
        // Apply weapon-specific mathematical effects
        bullet.velocity.multiplyScalar(1 + (weapon.mathematicalInfluence * alphaInfluence));
        bullet.damage *= (1 + (weapon.mathematicalInfluence * sqrtTenInfluence));
    }

    /**
     * Update bullets
     * @param {number} deltaTime - Time since last frame
     * @param {THREE.Scene} scene - Three.js scene
     */
    updateBullets(deltaTime, scene) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            // Update position
            bullet.position.add(bullet.velocity.clone().multiplyScalar(deltaTime));
            
            // Update life
            bullet.life -= deltaTime;
            
            // Remove dead bullets
            if (bullet.life <= 0) {
                scene.remove(bullet);
                bullet.geometry.dispose();
                bullet.material.dispose();
                this.bullets.splice(i, 1);
            }
        }
    }

    /**
     * Reload current weapon
     */
    reload() {
        if (this.isReloading) return;
        
        const weapon = this.weapons[this.currentWeapon];
        this.isReloading = true;
        this.reloadTimer = weapon.reloadTime;
        this.updateWeaponUI();
    }

    /**
     * Update reload timer
     * @param {number} deltaTime - Time since last frame
     */
    updateReload(deltaTime) {
        if (this.isReloading) {
            this.reloadTimer -= deltaTime;
            
            if (this.reloadTimer <= 0) {
                this.isReloading = false;
                this.ammo[this.currentWeapon] = this.weapons[this.currentWeapon].ammoCapacity;
                this.updateWeaponUI();
            }
        }
    }

    /**
     * Get current weapon
     * @returns {Object} Current weapon data
     */
    getCurrentWeapon() {
        return this.weapons[this.currentWeapon];
    }

    /**
     * Get bullet list
     * @returns {Array} Array of active bullets
     */
    getBullets() {
        return this.bullets;
    }

    /**
     * Remove a bullet
     * @param {THREE.Mesh} bullet - Bullet to remove
     * @param {THREE.Scene} scene - Three.js scene
     */
    removeBullet(bullet, scene) {
        const index = this.bullets.indexOf(bullet);
        if (index > -1) {
            scene.remove(bullet);
            bullet.geometry.dispose();
            bullet.material.dispose();
            this.bullets.splice(index, 1);
        }
    }

    /**
     * Add ammo
     * @param {string} weaponKey - Weapon key
     * @param {number} amount - Amount to add
     */
    addAmmo(weaponKey, amount) {
        if (this.ammo[weaponKey] !== undefined) {
            this.ammo[weaponKey] = Math.min(this.ammo[weaponKey] + amount, this.weapons[weaponKey].ammoCapacity);
            this.updateWeaponUI();
        }
    }

    /**
     * Get ammo for a weapon
     * @param {string} weaponKey - Weapon key
     * @returns {number} Current ammo
     */
    getAmmo(weaponKey) {
        return this.ammo[weaponKey] || 0;
    }

    /**
     * Check if weapon can shoot
     * @returns {boolean} Whether weapon can shoot
     */
    canShoot() {
        const weapon = this.weapons[this.currentWeapon];
        const currentTime = Date.now() / 1000;
        
        return !this.isReloading && 
               this.ammo[this.currentWeapon] > 0 && 
               currentTime - this.lastShotTime >= weapon.fireRate;
    }

    /**
     * Update weapon system
     * @param {number} deltaTime - Time since last frame
     * @param {THREE.Scene} scene - Three.js scene
     */
    update(deltaTime, scene) {
        this.updateBullets(deltaTime, scene);
        this.updateReload(deltaTime);
    }

    /**
     * Clean up weapon system
     */
    dispose() {
        // Remove all bullets
        this.bullets.forEach(bullet => {
            bullet.geometry.dispose();
            bullet.material.dispose();
        });
        this.bullets = [];
        
        // Remove UI
        if (this.weaponUI && this.weaponUI.parentNode) {
            this.weaponUI.parentNode.removeChild(this.weaponUI);
        }
    }
}

export default WeaponSystem; 