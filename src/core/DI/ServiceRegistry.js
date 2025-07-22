import Container from './Container.js';
import MathematicalEngine from '../../mathematical-engine.js';
import MathematicalAI from '../../mathematical-ai.js';
import AdvancedRenderer from '../../advanced-renderer.js';
import AdvancedPhysics from '../../advanced-physics.js';

/**
 * Service Registry
 * Manages all game services and their dependencies
 */
class ServiceRegistry {
    constructor() {
        this.container = new Container();
        this.registerServices();
    }

    /**
     * Register all game services with the container
     */
    registerServices() {
        // Core mathematical services
        this.container.register('mathematicalEngine', (container) => {
            const engine = new MathematicalEngine();
            engine.initializeTHREE(window.THREE);
            return engine;
        });

        this.container.register('mathematicalAI', (container) => {
            const mathEngine = container.resolve('mathematicalEngine');
            return new MathematicalAI(mathEngine);
        });

        // Rendering services
        this.container.register('renderer', (container) => {
            return new AdvancedRenderer();
        });

        // Physics services
        this.container.register('physics', (container) => {
            return new AdvancedPhysics();
        });

        // Game state services
        this.container.register('gameState', (container) => {
            return {
                currentPlanet: 'earth',
                playerHealth: 100,
                maxHealth: 100,
                kills: 0,
                deaths: 0,
                shotsFired: 0,
                shotsHit: 0,
                isDead: false,
                isInRocket: false
            };
        });

        // Weapon system services
        this.container.register('weaponSystem', (container) => {
            const mathEngine = container.resolve('mathematicalEngine');
            return {
                weapons: {
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
                        mathematicalInfluence: mathEngine.ALPHA 
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
                        mathematicalInfluence: mathEngine.SQRT_TEN.x 
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
                        mathematicalInfluence: mathEngine.ALPHA 
                    }
                },
                currentWeapon: 'rifle',
                ammo: { rifle: 30, shotgun: 8, sniper: 5 },
                isReloading: false,
                reloadTimer: 0,
                lastShotTime: 0
            };
        });

        // Planet system services
        this.container.register('planetSystem', (container) => {
            const mathEngine = container.resolve('mathematicalEngine');
            return {
                planets: new Map(),
                planetData: {
                    earth: { 
                        name: 'Earth', 
                        gravity: -30 * mathEngine.ALPHA, 
                        skyColor: 0x87CEEB, 
                        groundColor: 0x90EE90, 
                        obstacles: 10, 
                        position: new window.THREE.Vector3(0, 0, 0), 
                        mathematicalInfluence: mathEngine.ALPHA 
                    },
                    mars: { 
                        name: 'Mars', 
                        gravity: -12 * mathEngine.SQRT_TEN.x, 
                        skyColor: 0xFF6B35, 
                        groundColor: 0xCD5C5C, 
                        obstacles: 15, 
                        position: new window.THREE.Vector3(200, 0, 0), 
                        mathematicalInfluence: mathEngine.SQRT_TEN.x 
                    },
                    moon: { 
                        name: 'Moon', 
                        gravity: -5 * mathEngine.ALPHA, 
                        skyColor: 0x2C3E50, 
                        groundColor: 0x95A5A6, 
                        obstacles: 8, 
                        position: new window.THREE.Vector3(-200, 0, 0), 
                        mathematicalInfluence: mathEngine.SQRT_POINT_ONE.x 
                    }
                }
            };
        });

        // Input system services
        this.container.register('inputSystem', (container) => {
            return {
                keys: {},
                mouseX: 0,
                mouseY: 0,
                mouseSensitivity: 0.002,
                setupInput: function() {
                    // Input setup logic will be implemented here
                },
                handleKeyDown: function(event) {
                    this.keys[event.code] = true;
                },
                handleKeyUp: function(event) {
                    this.keys[event.code] = false;
                },
                handleMouseMove: function(event) {
                    this.mouseX = event.clientX;
                    this.mouseY = event.clientY;
                }
            };
        });

        // Networking services
        this.container.register('networkSystem', (container) => {
            return {
                socket: null,
                players: new Map(),
                playerId: null,
                setupNetworking: function() {
                    // Networking setup logic will be implemented here
                },
                addPlayer: function(id, playerData) {
                    this.players.set(id, playerData);
                },
                removePlayer: function(id) {
                    this.players.delete(id);
                }
            };
        });
    }

    /**
     * Get the dependency injection container
     * @returns {Container} The DI container
     */
    getContainer() {
        return this.container;
    }

    /**
     * Resolve a service
     * @param {string} name - Service name
     * @returns {*} The resolved service
     */
    resolve(name) {
        return this.container.resolve(name);
    }

    /**
     * Check if a service exists
     * @param {string} name - Service name
     * @returns {boolean} Whether the service exists
     */
    has(name) {
        return this.container.has(name);
    }
}

export default ServiceRegistry; 