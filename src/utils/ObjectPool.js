/**
 * Object Pool Utility
 * Provides efficient object reuse for performance optimization
 * Reduces garbage collection and memory allocation overhead
 */
export class ObjectPool {
    constructor(createFn, resetFn, maxSize = 100) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.maxSize = maxSize;
        this.pool = [];
        this.createdCount = 0;
        this.reusedCount = 0;
    }
    
    /**
     * Get an object from the pool or create a new one
     * @returns {*} The object from pool or newly created
     */
    get() {
        if (this.pool.length > 0) {
            this.reusedCount++;
            return this.pool.pop();
        }
        
        this.createdCount++;
        return this.createFn();
    }
    
    /**
     * Return an object to the pool for reuse
     * @param {*} obj - The object to return to the pool
     */
    return(obj) {
        if (this.pool.length < this.maxSize && obj) {
            this.resetFn(obj);
            this.pool.push(obj);
        }
    }
    
    /**
     * Clear all objects from the pool
     */
    clear() {
        this.pool.length = 0;
    }
    
    /**
     * Get pool statistics
     * @returns {Object} Pool statistics
     */
    getStats() {
        return {
            poolSize: this.pool.length,
            maxSize: this.maxSize,
            createdCount: this.createdCount,
            reusedCount: this.reusedCount,
            efficiency: this.createdCount > 0 ? 
                (this.reusedCount / (this.createdCount + this.reusedCount) * 100).toFixed(2) + '%' : '0%'
        };
    }
    
    /**
     * Pre-populate the pool with objects
     * @param {number} count - Number of objects to pre-create
     */
    prePopulate(count) {
        const toCreate = Math.min(count, this.maxSize - this.pool.length);
        for (let i = 0; i < toCreate; i++) {
            this.pool.push(this.createFn());
        }
    }
}

/**
 * Bullet Pool - Specialized pool for bullet objects
 */
export class BulletPool extends ObjectPool {
    constructor(maxSize = 100) {
        super(
            () => this.createBullet(),
            (bullet) => this.resetBullet(bullet),
            maxSize
        );
    }
    
    createBullet() {
        return {
            mesh: null,
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            damage: 0,
            lifetime: 0,
            maxLifetime: 5000,
            active: false
        };
    }
    
    resetBullet(bullet) {
        if (bullet.mesh) {
            bullet.mesh.position.set(0, 0, 0);
            bullet.mesh.visible = false;
        }
        bullet.position = { x: 0, y: 0, z: 0 };
        bullet.velocity = { x: 0, y: 0, z: 0 };
        bullet.damage = 0;
        bullet.lifetime = 0;
        bullet.active = false;
    }
}

/**
 * Effect Pool - Specialized pool for visual effects
 */
export class EffectPool extends ObjectPool {
    constructor(maxSize = 50) {
        super(
            () => this.createEffect(),
            (effect) => this.resetEffect(effect),
            maxSize
        );
    }
    
    createEffect() {
        return {
            mesh: null,
            position: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            rotation: { x: 0, y: 0, z: 0 },
            lifetime: 0,
            maxLifetime: 2000,
            active: false,
            type: 'damage'
        };
    }
    
    resetEffect(effect) {
        if (effect.mesh) {
            effect.mesh.position.set(0, 0, 0);
            effect.mesh.scale.set(1, 1, 1);
            effect.mesh.rotation.set(0, 0, 0);
            effect.mesh.visible = false;
        }
        effect.position = { x: 0, y: 0, z: 0 };
        effect.scale = { x: 1, y: 1, z: 1 };
        effect.rotation = { x: 0, y: 0, z: 0 };
        effect.lifetime = 0;
        effect.active = false;
        effect.type = 'damage';
    }
} 