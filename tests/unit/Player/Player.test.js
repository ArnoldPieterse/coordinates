import Player from '../../../src/components/Player/Player.js';
import * as THREE from 'three';

// Mock services
const mockServices = {
    resolve: jest.fn()
};

const mockMathEngine = {
    ALPHA: 0.0072973525693,
    SQRT_TEN: { x: 3.1622776601683795 }
};

const mockGameState = {
    playerHealth: 100,
    maxHealth: 100,
    isDead: false,
    deaths: 0
};

const mockWeaponSystem = {
    weapons: {},
    currentWeapon: 'rifle'
};

describe('Player', () => {
    let player;
    let mockScene;

    beforeEach(() => {
        // Setup mocks
        mockServices.resolve.mockImplementation((serviceName) => {
            switch (serviceName) {
                case 'mathematicalEngine':
                    return mockMathEngine;
                case 'gameState':
                    return mockGameState;
                case 'weaponSystem':
                    return mockWeaponSystem;
                default:
                    return null;
            }
        });

        // Reset game state
        mockGameState.playerHealth = 100;
        mockGameState.maxHealth = 100;
        mockGameState.isDead = false;
        mockGameState.deaths = 0;

        // Mock THREE.js
        global.THREE = THREE;

        player = new Player(mockServices);
        mockScene = {
            add: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with correct properties', () => {
            expect(player.mesh).toBeNull();
            expect(player.geometry).toBeNull();
            expect(player.material).toBeNull();
            expect(player.velocity).toBeInstanceOf(THREE.Vector3);
            expect(player.acceleration).toBeInstanceOf(THREE.Vector3);
            expect(player.speed).toBe(10 * mockMathEngine.ALPHA);
            expect(player.jumpForce).toBe(15 * mockMathEngine.SQRT_TEN.x);
            expect(player.isGrounded).toBe(false);
        });

        it('should resolve required services', () => {
            expect(mockServices.resolve).toHaveBeenCalledWith('mathematicalEngine');
            expect(mockServices.resolve).toHaveBeenCalledWith('gameState');
            expect(mockServices.resolve).toHaveBeenCalledWith('weaponSystem');
        });
    });

    describe('createPlayerMesh', () => {
        it('should create a capsule geometry with correct properties', () => {
            player.createPlayerMesh();

            expect(player.geometry).toBeDefined();
            expect(player.material).toBeDefined();
            expect(player.mesh).toBeDefined();
            expect(player.mesh.position.x).toBe(0);
            expect(player.mesh.position.y).toBe(2);
            expect(player.mesh.position.z).toBe(0);
            expect(player.mesh.castShadow).toBe(true);
            expect(player.mesh.receiveShadow).toBe(true);
        });
    });

    describe('takeDamage', () => {
        beforeEach(() => {
            player.createPlayerMesh();
        });

        it('should reduce health when taking damage', () => {
            const initialHealth = mockGameState.playerHealth;
            player.takeDamage(25);

            expect(mockGameState.playerHealth).toBe(initialHealth - 25);
        });

        it('should not reduce health below 0', () => {
            player.takeDamage(150);

            expect(mockGameState.playerHealth).toBe(0);
        });

        it('should not take damage when invulnerable', () => {
            player.isInvulnerable = true;
            const initialHealth = mockGameState.playerHealth;
            
            player.takeDamage(25);

            expect(mockGameState.playerHealth).toBe(initialHealth);
        });

        it('should set invulnerable after taking damage', () => {
            player.createPlayerMesh(); // Ensure mesh is created
            player.takeDamage(25);

            expect(player.isInvulnerable).toBe(true);
            expect(player.material.opacity).toBe(0.5);
        });

        it('should call die when health reaches 0', () => {
            const dieSpy = jest.spyOn(player, 'die');
            
            player.takeDamage(100);

            expect(dieSpy).toHaveBeenCalled();
        });
    });

    describe('die', () => {
        beforeEach(() => {
            player.createPlayerMesh();
        });

        it('should set player as dead', () => {
            player.die();

            expect(mockGameState.isDead).toBe(true);
            expect(mockGameState.deaths).toBe(1);
            expect(player.deathTime).toBe(0);
            expect(player.mesh.visible).toBe(false);
        });
    });

    describe('respawn', () => {
        beforeEach(() => {
            player.createPlayerMesh();
            player.die();
        });

        it('should restore player to alive state', () => {
            player.respawn();

            expect(mockGameState.isDead).toBe(false);
            expect(mockGameState.playerHealth).toBe(mockGameState.maxHealth);
            expect(player.mesh.visible).toBe(true);
            expect(player.mesh.position.x).toBe(0);
            expect(player.mesh.position.y).toBe(2);
            expect(player.mesh.position.z).toBe(0);
        });
    });

    describe('updateMovement', () => {
        beforeEach(() => {
            player.createPlayerMesh();
        });

        it('should not update movement when dead', () => {
            mockGameState.isDead = true;
            const initialPosition = player.mesh.position.clone();

            player.updateMovement({ keys: { KeyW: true } }, 0.016, { 
                gravity: -30, 
                mathematicalInfluence: 1.0 
            });

            expect(player.mesh.position).toEqual(initialPosition);
        });

        it('should apply gravity', () => {
            const planetData = { 
                gravity: -30, 
                mathematicalInfluence: 1.0 
            };
            const initialAcceleration = player.acceleration.clone();

            player.updateMovement({ keys: {} }, 0.016, planetData);

            // Gravity should be applied to acceleration
            expect(player.acceleration.y).toBeLessThan(initialAcceleration.y);
        });

        it('should handle ground collision', () => {
            player.mesh.position.y = 0.5;
            player.isGrounded = false;
            player.velocity.y = -1; // Add downward velocity

            // Run multiple frames to allow physics to settle
            for (let i = 0; i < 10; i++) {
                player.updateMovement({ keys: {} }, 0.016, { 
                    gravity: -30, 
                    mathematicalInfluence: 1.0 
                });
            }

            expect(player.mesh.position.y).toBe(1);
            expect(player.velocity.y).toBe(0);
            expect(player.isGrounded).toBe(true);
        });
    });

    describe('updateInvulnerability', () => {
        beforeEach(() => {
            player.createPlayerMesh();
            player.setInvulnerable();
        });

        it('should remove invulnerability after duration', () => {
            player.updateInvulnerability(player.invulnerabilityDuration + 0.1);

            expect(player.isInvulnerable).toBe(false);
            expect(player.material.opacity).toBe(0.8);
        });

        it('should maintain invulnerability before duration expires', () => {
            player.updateInvulnerability(player.invulnerabilityDuration - 0.1);

            expect(player.isInvulnerable).toBe(true);
            expect(player.material.opacity).toBe(0.5);
        });
    });

    describe('updateDeath', () => {
        beforeEach(() => {
            player.createPlayerMesh();
            player.die();
        });

        it('should respawn after respawn time', () => {
            const respawnSpy = jest.spyOn(player, 'respawn');
            
            player.updateDeath(player.respawnTime + 0.1);

            expect(respawnSpy).toHaveBeenCalled();
        });

        it('should not respawn before respawn time', () => {
            const respawnSpy = jest.spyOn(player, 'respawn');
            
            player.updateDeath(player.respawnTime - 0.1);

            expect(respawnSpy).not.toHaveBeenCalled();
        });
    });

    describe('getPosition and setPosition', () => {
        beforeEach(() => {
            player.createPlayerMesh();
        });

        it('should get current position', () => {
            const position = player.getPosition();
            
            expect(position).toBeInstanceOf(THREE.Vector3);
            expect(position.x).toBe(0);
            expect(position.y).toBe(2);
            expect(position.z).toBe(0);
        });

        it('should set new position', () => {
            const newPosition = new THREE.Vector3(10, 5, -3);
            
            player.setPosition(newPosition);

            expect(player.mesh.position.x).toBe(10);
            expect(player.mesh.position.y).toBe(5);
            expect(player.mesh.position.z).toBe(-3);
        });
    });

    describe('dispose', () => {
        beforeEach(() => {
            player.createPlayerMesh();
        });

        it('should clean up resources', () => {
            const disposeSpy = jest.spyOn(player.geometry, 'dispose');
            const materialDisposeSpy = jest.spyOn(player.material, 'dispose');

            player.dispose();

            expect(disposeSpy).toHaveBeenCalled();
            expect(materialDisposeSpy).toHaveBeenCalled();
        });
    });
}); 