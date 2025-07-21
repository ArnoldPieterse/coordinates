import WeaponSystem from '../../../src/components/Weapon/WeaponSystem.js';
import * as THREE from 'three';

// Mock services
const mockServices = {
    resolve: jest.fn()
};

const mockMathEngine = {
    ALPHA: 0.0072973525693,
    SQRT_TEN: { x: 3.1622776601683795 },
    SQRT_POINT_ONE: { x: 0.31622776601683794 }
};

const mockGameState = {
    playerHealth: 100,
    maxHealth: 100,
    isDead: false,
    deaths: 0,
    score: 0
};

describe('WeaponSystem', () => {
    let weaponSystem;
    let mockScene;

    beforeEach(() => {
        // Setup mocks
        mockServices.resolve.mockImplementation((serviceName) => {
            switch (serviceName) {
                case 'mathematicalEngine':
                    return mockMathEngine;
                case 'gameState':
                    return mockGameState;
                default:
                    return null;
            }
        });

        // Reset game state
        mockGameState.playerHealth = 100;
        mockGameState.maxHealth = 100;
        mockGameState.isDead = false;
        mockGameState.deaths = 0;
        mockGameState.score = 0;

        // Mock THREE.js
        global.THREE = THREE;

        weaponSystem = new WeaponSystem(mockServices);
        mockScene = {
            add: jest.fn(),
            remove: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with correct properties', () => {
            expect(weaponSystem.weapons).toBeDefined();
            expect(weaponSystem.currentWeapon).toBeDefined();
            expect(weaponSystem.ammo).toBeDefined();
            expect(weaponSystem.isReloading).toBe(false);
            expect(weaponSystem.lastShotTime).toBe(0);
        });

        it('should resolve required services', () => {
            expect(mockServices.resolve).toHaveBeenCalledWith('mathematicalEngine');
            expect(mockServices.resolve).toHaveBeenCalledWith('gameState');
        });
    });

    describe('weapon initialization', () => {
        it('should create weapon configurations', () => {
            expect(weaponSystem.weapons.rifle).toBeDefined();
            expect(weaponSystem.weapons.shotgun).toBeDefined();
            expect(weaponSystem.weapons.sniper).toBeDefined();
            expect(weaponSystem.weapons.grenade).toBeDefined();
            expect(weaponSystem.weapons.rocket).toBeDefined();
        });

        it('should set default weapon properties', () => {
            const rifle = weaponSystem.weapons.rifle;
            expect(rifle.damage).toBeGreaterThan(0);
            expect(rifle.fireRate).toBeGreaterThan(0);
            expect(rifle.ammoCapacity).toBeGreaterThan(0);
        });
    });

    describe('switchWeapon', () => {

        it('should switch to valid weapon', () => {
            const originalWeapon = weaponSystem.currentWeapon;
            weaponSystem.switchWeapon('shotgun');

            expect(weaponSystem.currentWeapon).toBe('shotgun');
            expect(weaponSystem.currentWeapon).not.toBe(originalWeapon);
        });

        it('should not switch to invalid weapon', () => {
            const originalWeapon = weaponSystem.currentWeapon;
            weaponSystem.switchWeapon('invalidWeapon');

            expect(weaponSystem.currentWeapon).toBe(originalWeapon);
        });
    });

    describe('shoot', () => {
        it('should shoot weapon when conditions are met', () => {
            const currentTime = Date.now() / 1000;
            weaponSystem.lastShotTime = currentTime - 1; // 1 second ago
            weaponSystem.ammo[weaponSystem.currentWeapon] = 10;
            const mockPosition = new THREE.Vector3(0, 0, 0);
            const mockDirection = new THREE.Vector3(0, 0, 1);
            const mockScene = { add: jest.fn() };

            const result = weaponSystem.shoot(mockPosition, mockDirection, mockScene);

            expect(result).toBe(true);
            expect(weaponSystem.lastShotTime).toBeGreaterThanOrEqual(currentTime);
            expect(weaponSystem.ammo[weaponSystem.currentWeapon]).toBe(9);
        });

        it('should not shoot when out of ammo', () => {
            weaponSystem.ammo[weaponSystem.currentWeapon] = 0;
            const mockPosition = new THREE.Vector3(0, 0, 0);
            const mockDirection = new THREE.Vector3(0, 0, 1);
            const mockScene = { add: jest.fn() };

            const result = weaponSystem.shoot(mockPosition, mockDirection, mockScene);

            expect(result).toBe(false);
        });

        it('should not shoot when rate limit exceeded', () => {
            weaponSystem.lastShotTime = Date.now() / 1000;
            weaponSystem.ammo[weaponSystem.currentWeapon] = 10;
            const mockPosition = new THREE.Vector3(0, 0, 0);
            const mockDirection = new THREE.Vector3(0, 0, 1);
            const mockScene = { add: jest.fn() };

            const result = weaponSystem.shoot(mockPosition, mockDirection, mockScene);

            expect(result).toBe(false);
        });

        it('should not shoot when reloading', () => {
            weaponSystem.isReloading = true;
            weaponSystem.ammo[weaponSystem.currentWeapon] = 10;
            const mockPosition = new THREE.Vector3(0, 0, 0);
            const mockDirection = new THREE.Vector3(0, 0, 1);
            const mockScene = { add: jest.fn() };

            const result = weaponSystem.shoot(mockPosition, mockDirection, mockScene);

            expect(result).toBe(false);
        });
    });

    describe('reload', () => {
        it('should start reload process', () => {
            weaponSystem.isReloading = false;
            weaponSystem.ammo[weaponSystem.currentWeapon] = 5;

            weaponSystem.reload();

            expect(weaponSystem.isReloading).toBe(true);
        });

        it('should not reload when already reloading', () => {
            weaponSystem.isReloading = true;

            weaponSystem.reload();

            expect(weaponSystem.isReloading).toBe(true);
        });
    });

    describe('updateReload', () => {
        it('should complete reload after sufficient time', () => {
            weaponSystem.isReloading = true;
            weaponSystem.reloadTimer = 0.1; // Almost done
            const weapon = weaponSystem.weapons[weaponSystem.currentWeapon];

            weaponSystem.updateReload(0.2); // More than enough time

            expect(weaponSystem.isReloading).toBe(false);
            expect(weaponSystem.ammo[weaponSystem.currentWeapon]).toBe(weapon.ammoCapacity);
        });

        it('should handle reload timing correctly', () => {
            weaponSystem.isReloading = true;
            weaponSystem.reloadTimer = 2.0; // Just started

            weaponSystem.updateReload(0.1); // Not enough time

            expect(weaponSystem.isReloading).toBe(true);
        });
    });

    describe('getCurrentWeapon', () => {
        it('should return current weapon data', () => {
            const weapon = weaponSystem.getCurrentWeapon();

            expect(weapon.name).toBeDefined();
            expect(weapon.damage).toBeDefined();
            expect(weapon.fireRate).toBeDefined();
            expect(weapon.ammoCapacity).toBeDefined();
        });
    });

    describe('addAmmo', () => {

        it('should add ammo to specified weapon', () => {
            const weaponName = 'rifle';
            weaponSystem.ammo[weaponName] = 20; // Start with less ammo
            const initialAmmo = weaponSystem.ammo[weaponName];
            const ammoToAdd = 5; // Very small amount to avoid hitting capacity

            weaponSystem.addAmmo(weaponName, ammoToAdd);

            expect(weaponSystem.ammo[weaponName]).toBe(initialAmmo + ammoToAdd);
        });

        it('should not exceed max ammo capacity', () => {
            const weaponName = 'rifle';
            const weapon = weaponSystem.weapons[weaponName];
            weaponSystem.ammo[weaponName] = weapon.ammoCapacity;
            const ammoToAdd = 30;

            weaponSystem.addAmmo(weaponName, ammoToAdd);

            expect(weaponSystem.ammo[weaponName]).toBe(weapon.ammoCapacity);
        });
    });

    describe('update', () => {
        it('should update weapon system state', () => {
            weaponSystem.isReloading = true;
            weaponSystem.reloadTimer = 0.1; // Almost done
            const mockScene = { remove: jest.fn() };

            weaponSystem.update(0.2, mockScene); // More than enough time

            // Should complete reload after sufficient time
            expect(weaponSystem.isReloading).toBe(false);
        });

        it('should handle reload timing correctly', () => {
            weaponSystem.isReloading = true;
            weaponSystem.reloadTimer = 2.0; // Just started
            const mockScene = { remove: jest.fn() };

            weaponSystem.update(0.1, mockScene); // Not enough time

            // Should still be reloading
            expect(weaponSystem.isReloading).toBe(true);
        });
    });
}); 