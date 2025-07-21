import { ObjectPool, BulletPool, EffectPool } from '../../../src/utils/ObjectPool.js';

describe('ObjectPool', () => {
    let pool;
    
    beforeEach(() => {
        const createFn = () => ({ id: Math.random(), data: 'test' });
        const resetFn = (obj) => { obj.data = 'reset'; return obj; };
        pool = new ObjectPool(createFn, resetFn, 5);
    });
    
    describe('constructor', () => {
        test('should initialize with correct properties', () => {
            expect(pool.maxSize).toBe(5);
            expect(pool.pool).toEqual([]);
            expect(pool.createdCount).toBe(0);
            expect(pool.reusedCount).toBe(0);
        });
    });
    
    describe('get', () => {
        test('should create new object when pool is empty', () => {
            const obj = pool.get();
            
            expect(obj).toHaveProperty('id');
            expect(obj).toHaveProperty('data', 'test');
            expect(pool.createdCount).toBe(1);
            expect(pool.reusedCount).toBe(0);
        });
        
        test('should reuse object from pool when available', () => {
            const obj1 = pool.get();
            pool.return(obj1);
            const obj2 = pool.get();
            
            expect(obj2).toBe(obj1);
            expect(pool.createdCount).toBe(1);
            expect(pool.reusedCount).toBe(1);
        });
    });
    
    describe('return', () => {
        test('should add object to pool when under max size', () => {
            const obj = pool.get();
            pool.return(obj);
            
            expect(pool.pool).toHaveLength(1);
            expect(pool.pool[0]).toBe(obj);
        });
        
        test('should not add object when pool is full', () => {
            // Fill the pool to max size
            const objects = [];
            for (let i = 0; i < 5; i++) {
                objects.push(pool.get());
            }
            
            // Return all objects to fill the pool
            objects.forEach(obj => pool.return(obj));
            expect(pool.pool).toHaveLength(5);
            
            // Try to add one more - should not be added
            const extraObj = pool.get();
            pool.return(extraObj);
            expect(pool.pool).toHaveLength(5);
        });
        
        test('should reset object before adding to pool', () => {
            const obj = pool.get();
            obj.data = 'modified';
            pool.return(obj);
            
            expect(pool.pool[0].data).toBe('reset');
        });
        
        test('should handle null/undefined objects gracefully', () => {
            expect(() => pool.return(null)).not.toThrow();
            expect(() => pool.return(undefined)).not.toThrow();
        });
    });
    
    describe('clear', () => {
        test('should clear all objects from pool', () => {
            const obj = pool.get();
            pool.return(obj);
            expect(pool.pool).toHaveLength(1);
            
            pool.clear();
            expect(pool.pool).toHaveLength(0);
        });
    });
    
    describe('getStats', () => {
        test('should return correct statistics', () => {
            const obj1 = pool.get();
            const obj2 = pool.get();
            pool.return(obj1);
            const obj3 = pool.get();
            
            const stats = pool.getStats();
            
            expect(stats.poolSize).toBe(0);
            expect(stats.maxSize).toBe(5);
            expect(stats.createdCount).toBe(2);
            expect(stats.reusedCount).toBe(1);
            expect(stats.efficiency).toBe('33.33%');
        });
        
        test('should handle zero created objects', () => {
            const stats = pool.getStats();
            expect(stats.efficiency).toBe('0%');
        });
    });
    
    describe('prePopulate', () => {
        test('should pre-populate pool with specified count', () => {
            pool.prePopulate(3);
            expect(pool.pool).toHaveLength(3);
        });
        
        test('should not exceed max size', () => {
            pool.prePopulate(10);
            expect(pool.pool).toHaveLength(5);
        });
        
        test('should not add more than available space', () => {
            pool.prePopulate(2);
            pool.prePopulate(4);
            expect(pool.pool).toHaveLength(5);
        });
    });
});

describe('BulletPool', () => {
    let bulletPool;
    
    beforeEach(() => {
        bulletPool = new BulletPool(3);
    });
    
    describe('createBullet', () => {
        test('should create bullet with correct structure', () => {
            const bullet = bulletPool.createBullet();
            
            expect(bullet).toHaveProperty('mesh', null);
            expect(bullet).toHaveProperty('position');
            expect(bullet.position).toEqual({ x: 0, y: 0, z: 0 });
            expect(bullet).toHaveProperty('velocity');
            expect(bullet.velocity).toEqual({ x: 0, y: 0, z: 0 });
            expect(bullet).toHaveProperty('damage', 0);
            expect(bullet).toHaveProperty('lifetime', 0);
            expect(bullet).toHaveProperty('maxLifetime', 5000);
            expect(bullet).toHaveProperty('active', false);
        });
    });
    
    describe('resetBullet', () => {
        test('should reset bullet properties', () => {
            const bullet = bulletPool.createBullet();
            bullet.mesh = { position: { set: jest.fn() }, visible: true };
            bullet.position = { x: 10, y: 20, z: 30 };
            bullet.velocity = { x: 1, y: 2, z: 3 };
            bullet.damage = 50;
            bullet.lifetime = 1000;
            bullet.active = true;
            
            bulletPool.resetBullet(bullet);
            
            expect(bullet.mesh.position.set).toHaveBeenCalledWith(0, 0, 0);
            expect(bullet.mesh.visible).toBe(false);
            expect(bullet.position).toEqual({ x: 0, y: 0, z: 0 });
            expect(bullet.velocity).toEqual({ x: 0, y: 0, z: 0 });
            expect(bullet.damage).toBe(0);
            expect(bullet.lifetime).toBe(0);
            expect(bullet.active).toBe(false);
        });
        
        test('should handle bullet without mesh', () => {
            const bullet = bulletPool.createBullet();
            bullet.mesh = null;
            
            expect(() => bulletPool.resetBullet(bullet)).not.toThrow();
        });
    });
    
    describe('pool operations', () => {
        test('should reuse bullets from pool', () => {
            const bullet1 = bulletPool.get();
            bulletPool.return(bullet1);
            const bullet2 = bulletPool.get();
            
            expect(bullet2).toBe(bullet1);
            expect(bulletPool.reusedCount).toBe(1);
        });
    });
});

describe('EffectPool', () => {
    let effectPool;
    
    beforeEach(() => {
        effectPool = new EffectPool(3);
    });
    
    describe('createEffect', () => {
        test('should create effect with correct structure', () => {
            const effect = effectPool.createEffect();
            
            expect(effect).toHaveProperty('mesh', null);
            expect(effect).toHaveProperty('position');
            expect(effect.position).toEqual({ x: 0, y: 0, z: 0 });
            expect(effect).toHaveProperty('scale');
            expect(effect.scale).toEqual({ x: 1, y: 1, z: 1 });
            expect(effect).toHaveProperty('rotation');
            expect(effect.rotation).toEqual({ x: 0, y: 0, z: 0 });
            expect(effect).toHaveProperty('lifetime', 0);
            expect(effect).toHaveProperty('maxLifetime', 2000);
            expect(effect).toHaveProperty('active', false);
            expect(effect).toHaveProperty('type', 'damage');
        });
    });
    
    describe('resetEffect', () => {
        test('should reset effect properties', () => {
            const effect = effectPool.createEffect();
            effect.mesh = { 
                position: { set: jest.fn() }, 
                scale: { set: jest.fn() }, 
                rotation: { set: jest.fn() }, 
                visible: true 
            };
            effect.position = { x: 10, y: 20, z: 30 };
            effect.scale = { x: 2, y: 2, z: 2 };
            effect.rotation = { x: 1, y: 1, z: 1 };
            effect.lifetime = 1000;
            effect.active = true;
            effect.type = 'heal';
            
            effectPool.resetEffect(effect);
            
            expect(effect.mesh.position.set).toHaveBeenCalledWith(0, 0, 0);
            expect(effect.mesh.scale.set).toHaveBeenCalledWith(1, 1, 1);
            expect(effect.mesh.rotation.set).toHaveBeenCalledWith(0, 0, 0);
            expect(effect.mesh.visible).toBe(false);
            expect(effect.position).toEqual({ x: 0, y: 0, z: 0 });
            expect(effect.scale).toEqual({ x: 1, y: 1, z: 1 });
            expect(effect.rotation).toEqual({ x: 0, y: 0, z: 0 });
            expect(effect.lifetime).toBe(0);
            expect(effect.active).toBe(false);
            expect(effect.type).toBe('damage');
        });
        
        test('should handle effect without mesh', () => {
            const effect = effectPool.createEffect();
            effect.mesh = null;
            
            expect(() => effectPool.resetEffect(effect)).not.toThrow();
        });
    });
    
    describe('pool operations', () => {
        test('should reuse effects from pool', () => {
            const effect1 = effectPool.get();
            effectPool.return(effect1);
            const effect2 = effectPool.get();
            
            expect(effect2).toBe(effect1);
            expect(effectPool.reusedCount).toBe(1);
        });
    });
}); 