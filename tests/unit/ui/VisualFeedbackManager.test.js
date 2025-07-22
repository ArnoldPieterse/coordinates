import { VisualFeedbackManager } from '../../../src/ui/VisualFeedbackManager.js';

// Mock Three.js
jest.mock('three', () => ({
    TextGeometry: jest.fn().mockImplementation(() => ({
        dispose: jest.fn()
    })),
    MeshBasicMaterial: jest.fn().mockImplementation(() => ({
        dispose: jest.fn()
    })),
    Mesh: jest.fn().mockImplementation(() => ({
        position: { copy: jest.fn(), set: jest.fn() },
        material: { opacity: 1.0 },
        scale: { set: jest.fn() },
        rotation: { set: jest.fn() },
        visible: true,
        geometry: { dispose: jest.fn() },
        material: { dispose: jest.fn() }
    })),
    Points: jest.fn().mockImplementation(() => ({
        geometry: { setAttribute: jest.fn() },
        userData: {},
        visible: true
    })),
    BufferGeometry: jest.fn().mockImplementation(() => ({
        setAttribute: jest.fn()
    })),
    PointsMaterial: jest.fn().mockImplementation(() => ({
        dispose: jest.fn()
    })),
    BufferAttribute: jest.fn().mockImplementation(() => ({})),
    Vector3: jest.fn().mockImplementation(() => ({
        set: jest.fn()
    }))
}));

describe('VisualFeedbackManager', () => {
    let visualFeedbackManager;
    let mockScene;
    let mockCamera;
    
    beforeEach(() => {
        mockScene = {
            add: jest.fn(),
            remove: jest.fn()
        };
        
        mockCamera = {
            position: { x: 0, y: 0, z: 0 }
        };
        
        // Mock document for browser environment
        global.document = {
            createElement: jest.fn(() => ({
                style: {},
                appendChild: jest.fn(),
                parentNode: { removeChild: jest.fn() }
            })),
            body: {
                appendChild: jest.fn(),
                removeChild: jest.fn()
            },
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        };
        
        visualFeedbackManager = new VisualFeedbackManager(mockScene, mockCamera);
    });
    
    afterEach(() => {
        if (visualFeedbackManager) {
            visualFeedbackManager.dispose();
        }
    });
    
    describe('constructor', () => {
        test('should initialize with correct properties', () => {
            expect(visualFeedbackManager.scene).toBe(mockScene);
            expect(visualFeedbackManager.camera).toBe(mockCamera);
            expect(visualFeedbackManager.effects).toBeInstanceOf(Map);
            expect(visualFeedbackManager.activeEffects).toEqual([]);
            expect(visualFeedbackManager.effectPool).toEqual([]);
            expect(visualFeedbackManager.maxEffects).toBe(50);
        });
        
        test('should setup effects and event listeners', () => {
            expect(visualFeedbackManager.effects.size).toBe(7);
            expect(visualFeedbackManager.effects.has('damage')).toBe(true);
            expect(visualFeedbackManager.effects.has('heal')).toBe(true);
            expect(visualFeedbackManager.effects.has('weaponSwitch')).toBe(true);
            expect(visualFeedbackManager.effects.has('hit')).toBe(true);
            expect(visualFeedbackManager.effects.has('reload')).toBe(true);
            expect(visualFeedbackManager.effects.has('pickup')).toBe(true);
            expect(visualFeedbackManager.effects.has('levelUp')).toBe(true);
        });
    });
    
    describe('createDamageEffect', () => {
        test('should create damage effect with correct properties', () => {
            const damage = 25;
            const position = { x: 0, y: 0, z: 0 };
            
            visualFeedbackManager.createDamageEffect(damage, position);
            
            expect(mockScene.add).toHaveBeenCalled();
            expect(visualFeedbackManager.activeEffects).toHaveLength(1);
            
            const effect = visualFeedbackManager.activeEffects[0];
            expect(effect.type).toBe('damage');
            expect(effect.value).toBe(damage);
            expect(effect.duration).toBe(2000);
            expect(effect.animation).toBe('fadeOut');
            expect(effect.active).toBe(true);
        });
        
        test('should create blood splatter effect', () => {
            const damage = 25;
            const position = { x: 0, y: 0, z: 0 };
            
            visualFeedbackManager.createDamageEffect(damage, position);
            
            // Should have called scene.add twice (damage effect + blood splatter)
            expect(mockScene.add).toHaveBeenCalledTimes(2);
        });
    });
    
    describe('createHealEffect', () => {
        test('should create heal effect with correct properties', () => {
            const amount = 50;
            const position = { x: 0, y: 0, z: 0 };
            
            visualFeedbackManager.createHealEffect(amount, position);
            
            expect(mockScene.add).toHaveBeenCalled();
            expect(visualFeedbackManager.activeEffects).toHaveLength(1);
            
            const effect = visualFeedbackManager.activeEffects[0];
            expect(effect.type).toBe('heal');
            expect(effect.value).toBe(amount);
            expect(effect.duration).toBe(1500);
            expect(effect.animation).toBe('fadeOut');
            expect(effect.active).toBe(true);
        });
        
        test('should create healing particles', () => {
            const amount = 50;
            const position = { x: 0, y: 0, z: 0 };
            
            visualFeedbackManager.createHealEffect(amount, position);
            
            // Should have called scene.add twice (heal effect + healing particles)
            expect(mockScene.add).toHaveBeenCalledTimes(2);
        });
    });
    
    describe('createWeaponSwitchEffect', () => {
        test('should create weapon switch notification', () => {
            const weaponName = 'Rifle';
            
            visualFeedbackManager.createWeaponSwitchEffect(weaponName);
            
            expect(document.createElement).toHaveBeenCalledWith('div');
        });
    });
    
    describe('createHitEffect', () => {
        test('should create hit effect components', () => {
            const position = { x: 0, y: 0, z: 0 };
            
            visualFeedbackManager.createHitEffect(position);
            
            // Should create hit marker, impact particles, and screen flash
            expect(document.createElement).toHaveBeenCalled();
        });
    });
    
    describe('createReloadEffect', () => {
        test('should create reload effect components', () => {
            const weaponName = 'Rifle';
            
            visualFeedbackManager.createReloadEffect(weaponName);
            
            // Should create reload progress and visualization
            expect(document.createElement).toHaveBeenCalled();
        });
    });
    
    describe('createPickupEffect', () => {
        test('should create pickup effect components', () => {
            const itemName = 'Health Pack';
            const position = { x: 0, y: 0, z: 0 };
            
            visualFeedbackManager.createPickupEffect(itemName, position);
            
            // Should create notification, particles, and icon
            expect(document.createElement).toHaveBeenCalled();
        });
    });
    
    describe('createLevelUpEffect', () => {
        test('should create level up effect components', () => {
            const level = 5;
            
            visualFeedbackManager.createLevelUpEffect(level);
            
            // Should create notification, particles, and screen flash
            expect(document.createElement).toHaveBeenCalled();
        });
    });
    
    describe('createUINotification', () => {
        test('should create UI notification with correct properties', () => {
            const message = 'Test notification';
            const type = 'test-type';
            
            visualFeedbackManager.createUINotification(message, type);
            
            expect(document.createElement).toHaveBeenCalledWith('div');
            expect(document.body.appendChild).toHaveBeenCalled();
        });
        
        test('should handle non-browser environment', () => {
            // Temporarily remove document
            const originalDocument = global.document;
            global.document = undefined;
            
            expect(() => {
                visualFeedbackManager.createUINotification('test', 'test-type');
            }).not.toThrow();
            
            // Restore document
            global.document = originalDocument;
        });
    });
    
    describe('createScreenFlash', () => {
        test('should create screen flash effect', () => {
            const duration = 0.5;
            const color = 0xff0000;
            
            visualFeedbackManager.createScreenFlash(duration, color);
            
            expect(document.createElement).toHaveBeenCalledWith('div');
            expect(document.body.appendChild).toHaveBeenCalled();
        });
        
        test('should handle non-browser environment', () => {
            const originalDocument = global.document;
            global.document = undefined;
            
            expect(() => {
                visualFeedbackManager.createScreenFlash(0.5, 0xff0000);
            }).not.toThrow();
            
            global.document = originalDocument;
        });
    });
    
    describe('update', () => {
        test('should update active effects', () => {
            // Create a test effect
            const effect = {
                mesh: { material: { opacity: 1.0 } },
                startTime: Date.now() - 1000, // 1 second ago
                duration: 500, // 0.5 second duration
                active: true
            };
            
            visualFeedbackManager.activeEffects.push(effect);
            
            visualFeedbackManager.update(0.016);
            
            // Effect should be removed since it's expired
            expect(visualFeedbackManager.activeEffects).toHaveLength(0);
            expect(mockScene.remove).toHaveBeenCalled();
        });
        
        test('should animate non-expired effects', () => {
            // Create a test effect that's not expired
            const effect = {
                mesh: { material: { opacity: 1.0 }, position: { y: 0 } },
                startTime: Date.now(),
                duration: 2000,
                animation: 'fadeOut',
                active: true
            };
            
            visualFeedbackManager.activeEffects.push(effect);
            
            visualFeedbackManager.update(0.016);
            
            // Effect should still be active
            expect(visualFeedbackManager.activeEffects).toHaveLength(1);
        });
    });
    
    describe('animateEffect', () => {
        test('should animate fadeOut effect', () => {
            const effect = {
                mesh: { material: { opacity: 1.0 }, position: { y: 0 } },
                animation: 'fadeOut'
            };
            
            visualFeedbackManager.animateEffect(effect, 500, 1000); // 50% progress
            
            expect(effect.mesh.material.opacity).toBe(0.5);
        });
        
        test('should animate scale effect', () => {
            const effect = {
                mesh: { material: { opacity: 1.0 }, scale: { set: jest.fn() } },
                animation: 'scale'
            };
            
            visualFeedbackManager.animateEffect(effect, 500, 1000); // 50% progress
            
            expect(effect.mesh.scale.set).toHaveBeenCalledWith(1.25, 1.25, 1.25);
            expect(effect.mesh.material.opacity).toBe(0.5);
        });
        
        test('should animate rotate effect', () => {
            const effect = {
                mesh: { material: { opacity: 1.0 }, rotation: { z: 0 } },
                animation: 'rotate'
            };
            
            visualFeedbackManager.animateEffect(effect, 500, 1000);
            
            expect(effect.mesh.rotation.z).toBe(0.1);
            expect(effect.mesh.material.opacity).toBe(0.5);
        });
    });
    
    describe('getEffectFromPool', () => {
        test('should return effect from pool when available', () => {
            const pooledEffect = { type: 'pooled' };
            visualFeedbackManager.effectPool.push(pooledEffect);
            
            const effect = visualFeedbackManager.getEffectFromPool();
            
            expect(effect).toBe(pooledEffect);
            expect(visualFeedbackManager.effectPool).toHaveLength(0);
        });
        
        test('should create new effect when pool is empty', () => {
            const effect = visualFeedbackManager.getEffectFromPool();
            
            expect(effect).toEqual({
                mesh: null,
                type: '',
                value: 0,
                duration: 0,
                animation: '',
                active: false,
                startTime: 0
            });
        });
    });
    
    describe('returnEffectToPool', () => {
        test('should return effect to pool when under max size', () => {
            const effect = { type: 'test' };
            
            visualFeedbackManager.returnEffectToPool(effect);
            
            expect(visualFeedbackManager.effectPool).toHaveLength(1);
            expect(visualFeedbackManager.effectPool[0]).toBe(effect);
        });
        
        test('should not return effect when pool is full', () => {
            // Fill the pool
            for (let i = 0; i < visualFeedbackManager.maxEffects; i++) {
                visualFeedbackManager.effectPool.push({});
            }
            
            const effect = { type: 'test' };
            visualFeedbackManager.returnEffectToPool(effect);
            
            expect(visualFeedbackManager.effectPool).toHaveLength(visualFeedbackManager.maxEffects);
        });
        
        test('should reset effect before adding to pool', () => {
            const effect = {
                mesh: { dispose: jest.fn() },
                type: 'test',
                value: 100,
                duration: 2000,
                animation: 'fadeOut',
                active: true,
                startTime: Date.now()
            };
            
            visualFeedbackManager.returnEffectToPool(effect);
            
            expect(effect.mesh).toBeNull();
            expect(effect.type).toBe('');
            expect(effect.value).toBe(0);
            expect(effect.duration).toBe(0);
            expect(effect.animation).toBe('');
            expect(effect.active).toBe(false);
            expect(effect.startTime).toBe(0);
        });
    });
    
    describe('hexToRgb', () => {
        test('should convert hex color to RGB', () => {
            expect(visualFeedbackManager.hexToRgb(0xff0000)).toBe('rgb(255, 0, 0)');
            expect(visualFeedbackManager.hexToRgb(0x00ff00)).toBe('rgb(0, 255, 0)');
            expect(visualFeedbackManager.hexToRgb(0x0000ff)).toBe('rgb(0, 0, 255)');
            expect(visualFeedbackManager.hexToRgb(0xffffff)).toBe('rgb(255, 255, 255)');
            expect(visualFeedbackManager.hexToRgb(0x000000)).toBe('rgb(0, 0, 0)');
        });
    });
    
    describe('dispose', () => {
        test('should cleanup all resources', () => {
            // Add some active effects
            const effect1 = { mesh: { geometry: { dispose: jest.fn() }, material: { dispose: jest.fn() } } };
            const effect2 = { mesh: { geometry: { dispose: jest.fn() }, material: { dispose: jest.fn() } } };
            
            visualFeedbackManager.activeEffects.push(effect1, effect2);
            visualFeedbackManager.effectPool.push({});
            
            visualFeedbackManager.dispose();
            
            expect(visualFeedbackManager.activeEffects).toHaveLength(0);
            expect(visualFeedbackManager.effectPool).toHaveLength(0);
            expect(visualFeedbackManager.effects.size).toBe(0);
            expect(mockScene.remove).toHaveBeenCalledTimes(2);
        });
    });
    
    describe('event handling', () => {
        test('should handle player damage events', () => {
            const damageEvent = new CustomEvent('playerDamage', {
                detail: { damage: 25, position: { x: 0, y: 0, z: 0 } }
            });
            
            document.dispatchEvent(damageEvent);
            
            // Should create damage effect
            expect(mockScene.add).toHaveBeenCalled();
        });
        
        test('should handle player heal events', () => {
            const healEvent = new CustomEvent('playerHeal', {
                detail: { amount: 50, position: { x: 0, y: 0, z: 0 } }
            });
            
            document.dispatchEvent(healEvent);
            
            // Should create heal effect
            expect(mockScene.add).toHaveBeenCalled();
        });
        
        test('should handle weapon switch events', () => {
            const weaponEvent = new CustomEvent('weaponSwitch', {
                detail: { weaponName: 'Rifle' }
            });
            
            document.dispatchEvent(weaponEvent);
            
            // Should create weapon switch effect
            expect(document.createElement).toHaveBeenCalled();
        });
    });
}); 