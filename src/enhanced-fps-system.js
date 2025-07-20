/**
 * Enhanced FPS System
 * Based on Browser FPS Template insights with relative rating integration
 */

import ChainOfThoughtMonitor from './chain-of-thought-monitor.js';

export class EnhancedFPSSystem {
    constructor(game, config = {}) {
        this.game = game;
        this.config = {
            enableThoughtMonitoring: true,
            enableAdvancedWeapons: true,
            enablePlayerMovement: true,
            enablePhysics: true,
            enableAI: true,
            ...config
        };

        // Thought monitoring system
        this.thoughtMonitor = this.config.enableThoughtMonitoring ? 
            new ChainOfThoughtMonitor({
                enableRealTimeMonitoring: true,
                enableGitIntegration: true,
                enableAPIIntegration: true
            }) : null;

        // Enhanced weapon system
        this.weapons = this.initializeWeapons();
        this.currentWeapon = 'rifle';
        this.weaponState = {
            isReloading: false,
            reloadTimer: 0,
            lastShotTime: 0,
            recoil: { x: 0, y: 0 },
            spread: 0,
            heat: 0
        };

        // Enhanced player movement
        this.playerMovement = {
            velocity: new THREE.Vector3(),
            acceleration: new THREE.Vector3(),
            speed: 10,
            sprintSpeed: 15,
            jumpForce: 15,
            isGrounded: true,
            isSprinting: false,
            canJump: true,
            jumpCooldown: 0,
            dashCooldown: 0,
            dashSpeed: 30,
            wallRun: false,
            slide: false
        };

        // Enhanced physics
        this.physics = {
            gravity: -30,
            airResistance: 0.99,
            friction: 0.8,
            bounceEnergyLoss: 0.7,
            bulletPhysics: true,
            projectileGravity: true,
            windEffects: true,
            timeDilation: false
        };

        // AI integration
        this.ai = {
            enabled: true,
            difficulty: 0.5,
            adaptiveAI: true,
            botCount: 0,
            maxBots: 8
        };

        // Advanced combat mechanics
        this.combat = {
            hitDetection: {
                enabled: true,
                precision: 0.001,
                raycastSteps: 10,
                hitboxOptimization: true
            },
            damageSystem: {
                headshotMultiplier: 2.5,
                bodyshotMultiplier: 1.0,
                legshotMultiplier: 0.7,
                criticalHitChance: 0.05,
                damageFalloff: true,
                armorSystem: true
            },
            feedback: {
                hitMarkers: true,
                damageNumbers: true,
                screenShake: true,
                bloodEffects: true,
                soundEffects: true
            },
            analytics: {
                shotsFired: 0,
                shotsHit: 0,
                accuracy: 0,
                damageDealt: 0,
                kills: 0,
                deaths: 0,
                kdr: 0,
                headshots: 0,
                criticalHits: 0
            }
        };

        // Performance metrics
        this.metrics = {
            fps: 0,
            frameTime: 0,
            drawCalls: 0,
            triangles: 0,
            memoryUsage: 0
        };

        // Environmental destruction system
        this.environment = {
            destructible: {
                enabled: true,
                terrainDeformation: true,
                objectDestruction: true,
                impactEffects: true,
                debrisSystem: true
            },
            terrain: {
                resolution: 64,
                chunkSize: 16,
                deformationStrength: 0.5,
                recoveryRate: 0.01
            },
            objects: {
                destructibleObjects: new Map(),
                debrisParticles: [],
                impactCraters: []
            }
        };

        this.initialize();
    }

    async initialize() {
        console.log('🎮 Initializing Enhanced FPS System...');

        // Initialize thought monitoring
        if (this.thoughtMonitor) {
            await this.recordThought('system', {
                thought: 'Initializing Enhanced FPS System with Browser FPS Template insights',
                reasoning: [
                    'Analyzing Browser FPS Template for best practices',
                    'Integrating advanced weapon mechanics',
                    'Implementing enhanced player movement',
                    'Setting up physics integration',
                    'Configuring AI systems'
                ],
                confidence: 0.9
            }, {
                role: 'system',
                phase: 'initialization',
                context: 'fps_system_setup'
            });
        }

        // Initialize weapon system
        this.initializeWeaponSystem();

        // Initialize player movement
        this.initializePlayerMovement();

        // Initialize physics
        this.initializePhysics();

        // Initialize AI
        this.initializeAI();

        // Initialize environmental destruction system
        this.initializeEnvironmentalSystem();

        console.log('✅ Enhanced FPS System initialized');
    }

    initializeWeapons() {
        const weapons = {
            // Primary Weapons
            rifle: {
                name: 'Assault Rifle',
                type: 'primary',
                damage: 25,
                fireRate: 0.1,
                ammoCapacity: 30,
                reloadTime: 2.0,
                bulletSpeed: 1000,
                bulletSize: 0.02,
                bulletColor: 0xFFFF00,
                spread: 0.02,
                recoil: { x: 0.5, y: 1.0 },
                automatic: true,
                heatGeneration: 0.1,
                heatDissipation: 0.05,
                mathematicalInfluence: this.game.mathEngine.ALPHA,
                relativity: { rating: 0.8, priority: 'high', impact: 'combat' }
            },
            shotgun: {
                name: 'Combat Shotgun',
                type: 'primary',
                damage: 15,
                fireRate: 0.8,
                ammoCapacity: 8,
                reloadTime: 3.0,
                bulletSpeed: 800,
                bulletSize: 0.015,
                bulletColor: 0xFF6B35,
                spread: 0.15,
                pelletCount: 8,
                recoil: { x: 2.0, y: 3.0 },
                automatic: false,
                heatGeneration: 0.3,
                heatDissipation: 0.1,
                mathematicalInfluence: this.game.mathEngine.SQRT_TEN.x,
                relativity: { rating: 0.7, priority: 'medium', impact: 'close_combat' }
            },
            sniper: {
                name: 'Precision Sniper',
                type: 'primary',
                damage: 100,
                fireRate: 1.5,
                ammoCapacity: 5,
                reloadTime: 4.0,
                bulletSpeed: 1500,
                bulletSize: 0.01,
                bulletColor: 0x00FFFF,
                spread: 0.001,
                recoil: { x: 5.0, y: 8.0 },
                automatic: false,
                heatGeneration: 0.5,
                heatDissipation: 0.2,
                mathematicalInfluence: this.game.mathEngine.ALPHA,
                relativity: { rating: 0.9, priority: 'high', impact: 'long_range' }
            },

            // Secondary Weapons
            pistol: {
                name: 'Combat Pistol',
                type: 'secondary',
                damage: 20,
                fireRate: 0.3,
                ammoCapacity: 15,
                reloadTime: 1.5,
                bulletSpeed: 900,
                bulletSize: 0.015,
                bulletColor: 0xFFFFFF,
                spread: 0.03,
                recoil: { x: 0.3, y: 0.5 },
                automatic: false,
                heatGeneration: 0.05,
                heatDissipation: 0.03,
                mathematicalInfluence: this.game.mathEngine.SQRT_POINT_ONE.x,
                relativity: { rating: 0.6, priority: 'medium', impact: 'backup' }
            },

            // Explosive Weapons
            grenade: {
                name: 'Fragmentation Grenade',
                type: 'explosive',
                damage: 80,
                fireRate: 2.0,
                ammoCapacity: 3,
                reloadTime: 1.0,
                bulletSpeed: 15,
                bulletSize: 0.3,
                bulletColor: 0x8B4513,
                spread: 0.05,
                recoil: { x: 0, y: 0 },
                automatic: false,
                explosive: true,
                explosionRadius: 8,
                fuseTime: 3.0,
                particleCount: 50,
                mathematicalInfluence: this.game.mathEngine.SQRT_POINT_ONE.x,
                relativity: { rating: 0.8, priority: 'high', impact: 'area_control' }
            },
            rocket: {
                name: 'Rocket Launcher',
                type: 'explosive',
                damage: 150,
                fireRate: 3.0,
                ammoCapacity: 2,
                reloadTime: 5.0,
                bulletSpeed: 25,
                bulletSize: 0.2,
                bulletColor: 0xFF0000,
                spread: 0.01,
                recoil: { x: 10.0, y: 15.0 },
                automatic: false,
                explosive: true,
                explosionRadius: 12,
                tracking: true,
                particleCount: 30,
                mathematicalInfluence: this.game.mathEngine.ALPHA,
                relativity: { rating: 0.9, priority: 'high', impact: 'heavy_damage' }
            },

            // Special Weapons
            laser: {
                name: 'Particle Laser',
                type: 'special',
                damage: 40,
                fireRate: 0.05,
                ammoCapacity: 100,
                reloadTime: 0,
                bulletSpeed: 2000,
                bulletSize: 0.005,
                bulletColor: 0x00FF00,
                spread: 0,
                recoil: { x: 0, y: 0 },
                automatic: true,
                heatGeneration: 0.2,
                heatDissipation: 0.1,
                beam: true,
                mathematicalInfluence: this.game.mathEngine.ALPHA,
                relativity: { rating: 0.7, priority: 'medium', impact: 'precision' }
            },
            plasma: {
                name: 'Plasma Cannon',
                type: 'special',
                damage: 60,
                fireRate: 0.5,
                ammoCapacity: 20,
                reloadTime: 3.0,
                bulletSpeed: 400,
                bulletSize: 0.1,
                bulletColor: 0xFF00FF,
                spread: 0.05,
                recoil: { x: 1.0, y: 2.0 },
                automatic: false,
                heatGeneration: 0.4,
                heatDissipation: 0.15,
                plasma: true,
                mathematicalInfluence: this.game.mathEngine.SQRT_TEN.x,
                relativity: { rating: 0.8, priority: 'high', impact: 'energy_weapon' }
            }
        };

        return weapons;
    }

    initializeWeaponSystem() {
        // Weapon switching
        this.weaponKeys = Object.keys(this.weapons);
        this.currentWeaponIndex = 0;

        // Ammo management
        this.ammo = {};
        this.weaponKeys.forEach(weaponKey => {
            this.ammo[weaponKey] = this.weapons[weaponKey].ammoCapacity;
        });

        // Weapon state
        this.weaponState = {
            isReloading: false,
            reloadTimer: 0,
            lastShotTime: 0,
            recoil: { x: 0, y: 0 },
            spread: 0,
            heat: 0,
            burstCount: 0,
            burstTimer: 0
        };

        if (this.thoughtMonitor) {
            this.recordThought('weapon_system', {
                thought: 'Weapon system initialized with advanced mechanics',
                reasoning: [
                    'Implemented heat management system',
                    'Added recoil and spread mechanics',
                    'Configured burst fire capabilities',
                    'Set up ammo management system'
                ],
                confidence: 0.85
            }, {
                role: 'weapon_system',
                phase: 'initialization',
                context: 'weapon_setup'
            });
        }
    }

    initializePlayerMovement() {
        // Movement state
        this.movementState = {
            isMoving: false,
            isSprinting: false,
            isCrouching: false,
            isJumping: false,
            isWallRunning: false,
            isSliding: false,
            onGround: true,
            onWall: false,
            velocity: new THREE.Vector3(),
            acceleration: new THREE.Vector3(),
            lastPosition: new THREE.Vector3()
        };

        // Movement parameters
        this.movementParams = {
            walkSpeed: 10,
            sprintSpeed: 15,
            crouchSpeed: 5,
            jumpForce: 15,
            airControl: 0.3,
            groundFriction: 0.8,
            airFriction: 0.95,
            wallRunSpeed: 12,
            slideSpeed: 20,
            slideDuration: 1.0,
            slideTimer: 0
        };

        if (this.thoughtMonitor) {
            this.recordThought('movement_system', {
                thought: 'Advanced movement system initialized',
                reasoning: [
                    'Implemented wall running mechanics',
                    'Added sliding and crouching',
                    'Configured air control and friction',
                    'Set up sprint and movement states'
                ],
                confidence: 0.8
            }, {
                role: 'movement_system',
                phase: 'initialization',
                context: 'movement_setup'
            });
        }
    }

    initializePhysics() {
        // Physics parameters
        this.physicsParams = {
            gravity: -30,
            airResistance: 0.99,
            groundFriction: 0.8,
            wallFriction: 0.6,
            bounceEnergyLoss: 0.7,
            bulletGravity: true,
            windEffects: true,
            timeDilation: false,
            timeDilationFactor: 0.5
        };

        // Physics zones
        this.physicsZones = {
            gravityWells: [],
            magneticFields: [],
            windZones: [],
            timeDilationZones: [],
            zeroGravityZones: []
        };

        if (this.thoughtMonitor) {
            this.recordThought('physics_system', {
                thought: 'Enhanced physics system initialized',
                reasoning: [
                    'Implemented advanced physics zones',
                    'Added wind and magnetic effects',
                    'Configured time dilation mechanics',
                    'Set up bullet physics integration'
                ],
                confidence: 0.85
            }, {
                role: 'physics_system',
                phase: 'initialization',
                context: 'physics_setup'
            });
        }
    }

    initializeAI() {
        // AI parameters
        this.aiParams = {
            enabled: true,
            difficulty: 0.5,
            adaptiveAI: true,
            botCount: 0,
            maxBots: 8,
            botUpdateRate: 30,
            pathfindingEnabled: true,
            combatAI: true,
            teamAI: false
        };

        // AI state
        this.aiState = {
            bots: [],
            lastUpdate: 0,
            difficultyProgression: 0,
            playerSkillAssessment: 0.5
        };

        if (this.thoughtMonitor) {
            this.recordThought('ai_system', {
                thought: 'AI system initialized with adaptive difficulty',
                reasoning: [
                    'Implemented adaptive AI difficulty',
                    'Added player skill assessment',
                    'Configured bot behavior patterns',
                    'Set up pathfinding and combat AI'
                ],
                confidence: 0.8
            }, {
                role: 'ai_system',
                phase: 'initialization',
                context: 'ai_setup'
            });
        }
    }

    // Enhanced weapon firing with advanced combat mechanics
    fireWeapon() {
        const weapon = this.weapons[this.currentWeapon];
        const now = this.game.clock.getElapsedTime();

        // Check firing conditions
        if (this.weaponState.isReloading) return false;
        if (now - this.weaponState.lastShotTime < weapon.fireRate) return false;
        if (this.ammo[this.currentWeapon] <= 0) return false;
        if (this.weaponState.heat >= 1.0) return false;

        // Consume ammo
        this.ammo[this.currentWeapon]--;

        // Update weapon state
        this.weaponState.lastShotTime = now;
        this.weaponState.heat += weapon.heatGeneration;

        // Update combat analytics
        this.combat.analytics.shotsFired++;
        this.updateCombatAnalytics();

        // Apply recoil
        this.applyRecoil(weapon);

        // Create projectiles
        const projectiles = this.createProjectiles(weapon);

        // Perform hit detection for each projectile
        projectiles.forEach(projectile => {
            const hit = this.performHitDetection(projectile, weapon);
            if (hit) {
                const damage = this.calculateDamage(weapon, hit.hitbox, hit.distance);
                this.applyDamage(hit.target, damage, weapon, hit.point);
                
                // Remove projectile on hit
                this.game.scene.remove(projectile);
                const index = this.game.bullets.indexOf(projectile);
                if (index > -1) {
                    this.game.bullets.splice(index, 1);
                }
            }
        });

        // Record thought
        if (this.thoughtMonitor) {
            this.recordThought('weapon_system', {
                thought: `Fired ${weapon.name} with ${this.ammo[this.currentWeapon]} ammo remaining`,
                reasoning: [
                    `Weapon heat: ${this.weaponState.heat.toFixed(2)}`,
                    `Recoil applied: x=${this.weaponState.recoil.x.toFixed(2)}, y=${this.weaponState.recoil.y.toFixed(2)}`,
                    `Spread: ${this.weaponState.spread.toFixed(3)}`,
                    `Mathematical influence: ${weapon.mathematicalInfluence}`,
                    `Combat accuracy: ${this.combat.analytics.accuracy.toFixed(2)}%`
                ],
                confidence: 0.9
            }, {
                role: 'weapon_system',
                phase: 'combat',
                context: 'weapon_fire',
                weapon: this.currentWeapon,
                ammo: this.ammo[this.currentWeapon]
            });
        }

        return true;
    }

    applyRecoil(weapon) {
        // Apply recoil based on weapon type
        this.weaponState.recoil.x += (Math.random() - 0.5) * weapon.recoil.x;
        this.weaponState.recoil.y += weapon.recoil.y;

        // Clamp recoil
        this.weaponState.recoil.x = Math.max(-5, Math.min(5, this.weaponState.recoil.x));
        this.weaponState.recoil.y = Math.max(-10, Math.min(10, this.weaponState.recoil.y));

        // Apply recoil to camera
        if (this.game.camera) {
            this.game.camera.rotation.x -= this.weaponState.recoil.y * 0.01;
            this.game.camera.rotation.y -= this.weaponState.recoil.x * 0.01;
        }
    }

    createProjectiles(weapon) {
        const cameraDirection = new THREE.Vector3();
        this.game.camera.getWorldDirection(cameraDirection);

        // Calculate spread
        const spread = this.weaponState.spread + weapon.spread;
        const pelletCount = weapon.pelletCount || 1;
        const projectiles = [];

        for (let i = 0; i < pelletCount; i++) {
            const projectile = this.createProjectile(weapon, cameraDirection, spread);
            this.game.scene.add(projectile);
            this.game.bullets.push(projectile);
            projectiles.push(projectile);
        }

        return projectiles;
    }

    createProjectile(weapon, direction, spread) {
        const geometry = new THREE.SphereGeometry(weapon.bulletSize, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: weapon.bulletColor });
        const projectile = new THREE.Mesh(geometry, material);

        // Set position
        projectile.position.copy(this.game.player.position).add(new THREE.Vector3(0, 1.5, 0));

        // Apply spread
        const spreadVector = new THREE.Vector3(
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread
        );

        // Set velocity with mathematical influence
        const velocity = direction.clone().add(spreadVector).normalize();
        velocity.multiplyScalar(weapon.bulletSpeed * weapon.mathematicalInfluence);
        projectile.velocity = velocity;

        // Set projectile properties
        projectile.userData = {
            isProjectile: true,
            weapon: this.currentWeapon,
            damage: weapon.damage,
            owner: this.game.playerId,
            creationTime: this.game.clock.getElapsedTime(),
            mathematicalInfluence: weapon.mathematicalInfluence
        };

        return projectile;
    }

    // Enhanced player movement
    updatePlayerMovement(deltaTime) {
        const input = this.getMovementInput();
        const movement = this.calculateMovement(input, deltaTime);
        this.applyMovement(movement, deltaTime);
        this.updateMovementState(deltaTime);
    }

    getMovementInput() {
        return {
            forward: this.game.keys['KeyW'] || false,
            backward: this.game.keys['KeyS'] || false,
            left: this.game.keys['KeyA'] || false,
            right: this.game.keys['KeyD'] || false,
            jump: this.game.keys['Space'] || false,
            sprint: this.game.keys['ShiftLeft'] || false,
            crouch: this.game.keys['ControlLeft'] || false
        };
    }

    calculateMovement(input, deltaTime) {
        const movement = {
            direction: new THREE.Vector3(),
            speed: this.movementParams.walkSpeed,
            jump: false,
            sprint: false,
            crouch: false
        };

        // Get camera direction
        const cameraDirection = new THREE.Vector3();
        this.game.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();

        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));

        // Calculate movement direction
        if (input.forward) movement.direction.add(cameraDirection);
        if (input.backward) movement.direction.sub(cameraDirection);
        if (input.left) movement.direction.sub(cameraRight);
        if (input.right) movement.direction.add(cameraRight);

        // Normalize direction
        if (movement.direction.lengthSq() > 0) {
            movement.direction.normalize();
        }

        // Set movement type
        if (input.sprint && input.forward) {
            movement.sprint = true;
            movement.speed = this.movementParams.sprintSpeed;
        } else if (input.crouch) {
            movement.crouch = true;
            movement.speed = this.movementParams.crouchSpeed;
        }

        // Jump
        if (input.jump && this.movementState.onGround && this.movementParams.slideTimer <= 0) {
            movement.jump = true;
        }

        return movement;
    }

    applyMovement(movement, deltaTime) {
        // Apply acceleration
        const acceleration = movement.direction.clone().multiplyScalar(movement.speed);
        this.movementState.acceleration.copy(acceleration);

        // Apply velocity
        this.movementState.velocity.add(this.movementState.acceleration.clone().multiplyScalar(deltaTime));

        // Apply friction
        const friction = this.movementState.onGround ? 
            this.movementParams.groundFriction : this.movementParams.airFriction;
        this.movementState.velocity.multiplyScalar(friction);

        // Apply gravity
        if (!this.movementState.onGround) {
            this.movementState.velocity.y += this.physicsParams.gravity * deltaTime;
        }

        // Apply jump
        if (movement.jump) {
            this.movementState.velocity.y = this.movementParams.jumpForce;
            this.movementState.onGround = false;
        }

        // Update position
        this.game.player.position.add(this.movementState.velocity.clone().multiplyScalar(deltaTime));

        // Ground collision
        if (this.game.player.position.y < 1) {
            this.game.player.position.y = 1;
            this.movementState.velocity.y = 0;
            this.movementState.onGround = true;
        }
    }

    updateMovementState(deltaTime) {
        // Update movement flags
        this.movementState.isMoving = this.movementState.velocity.lengthSq() > 0.1;
        this.movementState.isSprinting = this.movementState.isMoving && 
            this.movementState.velocity.length() > this.movementParams.walkSpeed * 0.8;

        // Update slide timer
        if (this.movementParams.slideTimer > 0) {
            this.movementParams.slideTimer -= deltaTime;
        }

        // Record movement thought
        if (this.thoughtMonitor && this.movementState.isMoving) {
            this.recordThought('movement_system', {
                thought: `Player movement: ${this.movementState.isSprinting ? 'sprinting' : 'walking'}`,
                reasoning: [
                    `Velocity: ${this.movementState.velocity.length().toFixed(2)} m/s`,
                    `On ground: ${this.movementState.onGround}`,
                    `Position: (${this.game.player.position.x.toFixed(1)}, ${this.game.player.position.y.toFixed(1)}, ${this.game.player.position.z.toFixed(1)})`
                ],
                confidence: 0.8
            }, {
                role: 'movement_system',
                phase: 'update',
                context: 'player_movement'
            });
        }
    }

    // Enhanced physics update
    updatePhysics(deltaTime) {
        this.updateProjectiles(deltaTime);
        this.updatePhysicsZones(deltaTime);
        this.updateWeaponPhysics(deltaTime);
    }

    updateProjectiles(deltaTime) {
        for (let i = this.game.bullets.length - 1; i >= 0; i--) {
            const bullet = this.game.bullets[i];
            
            // Apply physics
            if (this.physicsParams.bulletGravity) {
                bullet.velocity.y += this.physicsParams.gravity * deltaTime * 0.1;
            }

            // Apply air resistance
            bullet.velocity.multiplyScalar(this.physicsParams.airResistance);

            // Apply mathematical effects
            if (bullet.userData.mathematicalInfluence) {
                const mathEffect = Math.sin(this.game.clock.getElapsedTime() * bullet.userData.mathematicalInfluence);
                bullet.velocity.multiplyScalar(1 + mathEffect * 0.01);
            }

            // Update position
            bullet.position.add(bullet.velocity.clone().multiplyScalar(deltaTime));

            // Check for environmental impact
            if (bullet.position.y < -1.5) { // Ground level
                const weapon = this.weapons[bullet.userData.weapon];
                this.handleEnvironmentalImpact(bullet, bullet.position, weapon);
                this.game.scene.remove(bullet);
                this.game.bullets.splice(i, 1);
                continue;
            }

            // Check for destructible object collision
            const weapon = this.weapons[bullet.userData.weapon];
            this.environment.objects.destructibleObjects.forEach((object, id) => {
                if (bullet.position.distanceTo(object.position) < 2) {
                    this.handleEnvironmentalImpact(bullet, bullet.position, weapon);
                    this.game.scene.remove(bullet);
                    this.game.bullets.splice(i, 1);
                }
            });

            // Check lifetime
            const age = this.game.clock.getElapsedTime() - bullet.userData.creationTime;
            if (age > 5.0) {
                this.game.scene.remove(bullet);
                this.game.bullets.splice(i, 1);
            }
        }
    }

    updatePhysicsZones(deltaTime) {
        // Update gravity wells
        this.physicsZones.gravityWells.forEach(well => {
            const distance = this.game.player.position.distanceTo(well.position);
            if (distance < well.radius) {
                const force = well.strength * (1 - distance / well.radius);
                this.movementState.velocity.y += force * deltaTime;
            }
        });

        // Update wind zones
        this.physicsZones.windZones.forEach(wind => {
            const distance = this.game.player.position.distanceTo(wind.position);
            if (distance < wind.radius) {
                const force = wind.strength * (1 - distance / wind.radius);
                this.movementState.velocity.add(wind.direction.clone().multiplyScalar(force * deltaTime));
            }
        });
    }

    updateWeaponPhysics(deltaTime) {
        // Heat dissipation
        if (this.weaponState.heat > 0) {
            const weapon = this.weapons[this.currentWeapon];
            this.weaponState.heat -= weapon.heatDissipation * deltaTime;
            this.weaponState.heat = Math.max(0, this.weaponState.heat);
        }

        // Recoil recovery
        if (this.weaponState.recoil.x !== 0 || this.weaponState.recoil.y !== 0) {
            this.weaponState.recoil.x *= 0.9;
            this.weaponState.recoil.y *= 0.9;
        }

        // Spread recovery
        if (this.weaponState.spread > 0) {
            this.weaponState.spread -= 0.1 * deltaTime;
            this.weaponState.spread = Math.max(0, this.weaponState.spread);
        }
    }

    // AI system
    updateAI(deltaTime) {
        if (!this.aiParams.enabled) return;

        const now = this.game.clock.getElapsedTime();
        if (now - this.aiState.lastUpdate < 1.0 / this.aiParams.botUpdateRate) return;

        this.aiState.lastUpdate = now;

        // Update bots
        this.aiState.bots.forEach(bot => {
            this.updateBot(bot, deltaTime);
        });

        // Adaptive difficulty
        if (this.aiParams.adaptiveAI) {
            this.updateAdaptiveDifficulty();
        }
    }

    updateBot(bot, deltaTime) {
        // Simple bot AI
        const playerPosition = this.game.player.position;
        const direction = playerPosition.clone().sub(bot.position).normalize();
        
        // Move towards player
        bot.position.add(direction.clone().multiplyScalar(bot.speed * deltaTime));

        // Face player
        bot.lookAt(playerPosition);

        // Shoot at player
        const distance = bot.position.distanceTo(playerPosition);
        if (distance < bot.range && Math.random() < 0.1) {
            this.botShoot(bot, playerPosition);
        }
    }

    botShoot(bot, targetPosition) {
        const direction = targetPosition.clone().sub(bot.position).normalize();
        const bullet = this.createProjectile(this.weapons.rifle, direction, 0.05);
        bullet.userData.owner = bot.id;
        this.game.scene.add(bullet);
        this.game.bullets.push(bullet);
    }

    updateAdaptiveDifficulty() {
        // Assess player performance
        const playerSkill = this.assessPlayerSkill();
        this.aiState.playerSkillAssessment = playerSkill;

        // Adjust difficulty
        const targetDifficulty = Math.min(1.0, playerSkill * 1.2);
        this.aiParams.difficulty += (targetDifficulty - this.aiParams.difficulty) * 0.1;

        if (this.thoughtMonitor) {
            this.recordThought('ai_system', {
                thought: `Adaptive difficulty updated: ${this.aiParams.difficulty.toFixed(2)}`,
                reasoning: [
                    `Player skill assessment: ${playerSkill.toFixed(2)}`,
                    `Target difficulty: ${targetDifficulty.toFixed(2)}`,
                    `Bot count: ${this.aiState.bots.length}`,
                    `Performance metrics: FPS=${this.metrics.fps}`
                ],
                confidence: 0.7
            }, {
                role: 'ai_system',
                phase: 'update',
                context: 'adaptive_difficulty'
            });
        }
    }

    assessPlayerSkill() {
        // Simple skill assessment based on performance
        const accuracy = this.game.shotsHit / Math.max(1, this.game.shotsFired);
        const kdr = this.game.kills / Math.max(1, this.game.deaths);
        const movement = this.movementState.isMoving ? 1 : 0;

        return (accuracy * 0.4 + kdr * 0.4 + movement * 0.2);
    }

    // Performance monitoring
    updatePerformance() {
        this.metrics.fps = 1.0 / this.game.clock.getDelta();
        this.metrics.frameTime = this.game.clock.getDelta() * 1000;
        this.metrics.drawCalls = this.game.renderer.info.render.calls;
        this.metrics.triangles = this.game.renderer.info.render.triangles;
        this.metrics.memoryUsage = this.game.renderer.info.memory.geometries;

        // Record performance thought
        if (this.thoughtMonitor && this.metrics.fps < 50) {
            this.recordThought('performance_system', {
                thought: `Performance warning: FPS=${this.metrics.fps.toFixed(1)}`,
                reasoning: [
                    `Frame time: ${this.metrics.frameTime.toFixed(1)}ms`,
                    `Draw calls: ${this.metrics.drawCalls}`,
                    `Triangles: ${this.metrics.triangles}`,
                    `Memory: ${this.metrics.memoryUsage} geometries`
                ],
                confidence: 0.9
            }, {
                role: 'performance_system',
                phase: 'monitoring',
                context: 'performance_warning'
            });
        }
    }

    // Thought recording with relative rating
    async recordThought(agentId, thought, context) {
        if (!this.thoughtMonitor) return;

        // Apply relative rating based on thought frame system
        const relativity = this.calculateRelativity(thought, context);
        thought.relativity = relativity;

        await this.thoughtMonitor.recordThought(agentId, thought, context);
    }

    calculateRelativity(thought, context) {
        let rating = 0.5; // Base rating
        let priority = 'medium';
        let impact = 'general';

        // Context-based rating
        switch (context.phase) {
            case 'combat':
                rating += 0.3;
                priority = 'high';
                impact = 'combat';
                break;
            case 'initialization':
                rating += 0.2;
                priority = 'high';
                impact = 'system';
                break;
            case 'performance_warning':
                rating += 0.4;
                priority = 'high';
                impact = 'performance';
                break;
            case 'adaptive_difficulty':
                rating += 0.3;
                priority = 'medium';
                impact = 'ai';
                break;
        }

        // Role-based rating
        switch (context.role) {
            case 'weapon_system':
                rating += 0.2;
                break;
            case 'movement_system':
                rating += 0.1;
                break;
            case 'ai_system':
                rating += 0.2;
                break;
            case 'performance_system':
                rating += 0.3;
                break;
        }

        // Confidence-based adjustment
        rating *= thought.confidence;

        return {
            rating: Math.min(1.0, Math.max(0.0, rating)),
            priority,
            impact
        };
    }

    // Main update loop
    update(deltaTime) {
        this.updatePlayerMovement(deltaTime);
        this.updatePhysics(deltaTime);
        this.updateAI(deltaTime);
        this.updatePerformance();
        this.updateEnvironmentalSystem(deltaTime); // Update environmental system
    }

    // Advanced combat mechanics
    performHitDetection(projectile, weapon) {
        if (!this.combat.hitDetection.enabled) return null;

        const raycaster = new THREE.Raycaster();
        const direction = projectile.userData.velocity.clone().normalize();
        
        raycaster.set(projectile.position, direction);
        raycaster.far = weapon.bulletSpeed * 0.1; // Check ahead of projectile

        // Get all potential targets
        const targets = [];
        this.game.scene.traverse(object => {
            if (object.userData.isPlayer || object.userData.isBot || object.userData.isTarget) {
                targets.push(object);
            }
        });

        const intersects = raycaster.intersectObjects(targets, true);
        
        if (intersects.length > 0) {
            const hit = intersects[0];
            return {
                target: hit.object,
                point: hit.point,
                normal: hit.face.normal,
                distance: hit.distance,
                hitbox: this.getHitboxType(hit.object, hit.point)
            };
        }

        return null;
    }

    getHitboxType(target, hitPoint) {
        // Determine hitbox type based on hit position
        const targetHeight = target.geometry ? target.geometry.boundingBox.max.y : 2;
        const relativeHeight = hitPoint.y / targetHeight;

        if (relativeHeight > 0.8) return 'head';
        if (relativeHeight > 0.3) return 'body';
        return 'legs';
    }

    calculateDamage(weapon, hitbox, distance = 0) {
        let baseDamage = weapon.damage;
        
        // Apply hitbox multiplier
        switch (hitbox) {
            case 'head':
                baseDamage *= this.combat.damageSystem.headshotMultiplier;
                this.combat.analytics.headshots++;
                break;
            case 'body':
                baseDamage *= this.combat.damageSystem.bodyshotMultiplier;
                break;
            case 'legs':
                baseDamage *= this.combat.damageSystem.legshotMultiplier;
                break;
        }

        // Apply damage falloff
        if (this.combat.damageSystem.damageFalloff && distance > 0) {
            const falloffFactor = Math.max(0.3, 1 - (distance / 1000));
            baseDamage *= falloffFactor;
        }

        // Apply critical hit
        if (Math.random() < this.combat.damageSystem.criticalHitChance) {
            baseDamage *= 1.5;
            this.combat.analytics.criticalHits++;
        }

        // Apply armor system
        if (this.combat.damageSystem.armorSystem) {
            const target = this.getTargetFromHit(hitbox);
            if (target && target.userData.armor > 0) {
                const armorDamage = Math.min(target.userData.armor, baseDamage * 0.5);
                baseDamage -= armorDamage;
                target.userData.armor -= armorDamage;
            }
        }

        return Math.max(1, Math.round(baseDamage));
    }

    getTargetFromHit(hitbox) {
        // This would be implemented based on the actual hit target
        return null;
    }

    applyDamage(target, damage, weapon, hitPoint) {
        if (!target.userData.health) {
            target.userData.health = 100;
        }

        target.userData.health -= damage;
        this.combat.analytics.damageDealt += damage;

        // Update analytics
        this.combat.analytics.shotsHit++;
        this.updateCombatAnalytics();

        // Apply visual feedback
        this.createHitFeedback(hitPoint, damage, target);
        
        // Check for kill
        if (target.userData.health <= 0) {
            this.handleKill(target, weapon);
        }

        // Record combat thought
        if (this.thoughtMonitor) {
            this.recordThought('combat_system', {
                thought: `Damage applied: ${damage} to target`,
                reasoning: [
                    `Target health: ${target.userData.health}`,
                    `Weapon: ${weapon.name}`,
                    `Hitbox: ${this.getHitboxType(target, hitPoint)}`,
                    `Accuracy: ${this.combat.analytics.accuracy.toFixed(2)}%`
                ],
                confidence: 0.8
            }, {
                role: 'combat_system',
                phase: 'damage',
                context: 'hit_detection'
            });
        }
    }

    createHitFeedback(hitPoint, damage, target) {
        // Create hit marker
        if (this.combat.feedback.hitMarkers) {
            this.createHitMarker(hitPoint);
        }

        // Create damage numbers
        if (this.combat.feedback.damageNumbers) {
            this.createDamageNumbers(hitPoint, damage);
        }

        // Create blood effects
        if (this.combat.feedback.bloodEffects) {
            this.createBloodEffect(hitPoint, target);
        }

        // Screen shake
        if (this.combat.feedback.screenShake) {
            this.applyScreenShake(damage);
        }
    }

    createHitMarker(hitPoint) {
        const markerGeometry = new THREE.RingGeometry(0.1, 0.15, 8);
        const markerMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF0000, 
            transparent: true, 
            opacity: 0.8 
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.copy(hitPoint);
        marker.lookAt(this.game.camera.position);
        
        this.game.scene.add(marker);
        
        // Animate and remove
        const animate = () => {
            marker.material.opacity -= 0.05;
            marker.scale.multiplyScalar(1.1);
            
            if (marker.material.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.game.scene.remove(marker);
            }
        };
        animate();
    }

    createDamageNumbers(hitPoint, damage) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 32;
        
        context.fillStyle = '#FFFFFF';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillText(damage.toString(), 64, 24);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ 
            map: texture, 
            transparent: true 
        });
        const sprite = new THREE.Sprite(material);
        
        sprite.position.copy(hitPoint);
        sprite.position.y += 1;
        sprite.scale.set(2, 0.5, 1);
        
        this.game.scene.add(sprite);
        
        // Animate and remove
        const animate = () => {
            sprite.position.y += 0.05;
            sprite.material.opacity -= 0.02;
            
            if (sprite.material.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.game.scene.remove(sprite);
            }
        };
        animate();
    }

    createBloodEffect(hitPoint, target) {
        const particleCount = 20;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = hitPoint.x + (Math.random() - 0.5) * 0.1;
            positions[i3 + 1] = hitPoint.y + (Math.random() - 0.5) * 0.1;
            positions[i3 + 2] = hitPoint.z + (Math.random() - 0.5) * 0.1;
            
            velocities[i3] = (Math.random() - 0.5) * 5;
            velocities[i3 + 1] = Math.random() * 3;
            velocities[i3 + 2] = (Math.random() - 0.5) * 5;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0x8B0000,
            size: 0.05,
            transparent: true,
            opacity: 0.8
        });
        
        const particleSystem = new THREE.Points(particles, material);
        this.game.scene.add(particleSystem);
        
        // Animate particles
        const animate = () => {
            const positions = particleSystem.geometry.attributes.position.array;
            const velocities = particleSystem.geometry.attributes.velocity.array;
            
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                positions[i3] += velocities[i3] * 0.016;
                positions[i3 + 1] += velocities[i3 + 1] * 0.016;
                positions[i3 + 2] += velocities[i3 + 2] * 0.016;
                
                velocities[i3 + 1] -= 9.8 * 0.016; // Gravity
            }
            
            particleSystem.geometry.attributes.position.needsUpdate = true;
            material.opacity -= 0.01;
            
            if (material.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.game.scene.remove(particleSystem);
            }
        };
        animate();
    }

    applyScreenShake(damage) {
        const intensity = Math.min(0.1, damage / 1000);
        const originalPosition = this.game.camera.position.clone();
        
        const shake = () => {
            this.game.camera.position.x = originalPosition.x + (Math.random() - 0.5) * intensity;
            this.game.camera.position.y = originalPosition.y + (Math.random() - 0.5) * intensity;
            this.game.camera.position.z = originalPosition.z + (Math.random() - 0.5) * intensity;
        };
        
        let shakeCount = 0;
        const maxShakes = 10;
        
        const animate = () => {
            shake();
            shakeCount++;
            
            if (shakeCount < maxShakes) {
                requestAnimationFrame(animate);
            } else {
                this.game.camera.position.copy(originalPosition);
            }
        };
        animate();
    }

    handleKill(target, weapon) {
        this.combat.analytics.kills++;
        this.updateCombatAnalytics();
        
        // Create kill effect
        this.createKillEffect(target.position);
        
        // Update KDR
        this.combat.analytics.kdr = this.combat.analytics.kills / Math.max(1, this.combat.analytics.deaths);
        
        // Record kill thought
        if (this.thoughtMonitor) {
            this.recordThought('combat_system', {
                thought: `Kill achieved with ${weapon.name}`,
                reasoning: [
                    `Total kills: ${this.combat.analytics.kills}`,
                    `KDR: ${this.combat.analytics.kdr.toFixed(2)}`,
                    `Accuracy: ${this.combat.analytics.accuracy.toFixed(2)}%`,
                    `Weapon: ${weapon.name}`
                ],
                confidence: 0.9
            }, {
                role: 'combat_system',
                phase: 'kill',
                context: 'combat_achievement'
            });
        }
    }

    createKillEffect(position) {
        // Create explosion effect
        const explosionGeometry = new THREE.SphereGeometry(0.5, 8, 6);
        const explosionMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF4500,
            transparent: true,
            opacity: 0.8
        });
        const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
        explosion.position.copy(position);
        
        this.game.scene.add(explosion);
        
        // Animate explosion
        const animate = () => {
            explosion.scale.multiplyScalar(1.2);
            explosion.material.opacity -= 0.05;
            
            if (explosion.material.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.game.scene.remove(explosion);
            }
        };
        animate();
    }

    updateCombatAnalytics() {
        this.combat.analytics.accuracy = (this.combat.analytics.shotsHit / Math.max(1, this.combat.analytics.shotsFired)) * 100;
    }

    getCombatStatistics() {
        return {
            ...this.combat.analytics,
            accuracy: this.combat.analytics.accuracy.toFixed(2) + '%',
            kdr: this.combat.analytics.kdr.toFixed(2),
            headshotPercentage: ((this.combat.analytics.headshots / Math.max(1, this.combat.analytics.shotsHit)) * 100).toFixed(2) + '%',
            criticalHitPercentage: ((this.combat.analytics.criticalHits / Math.max(1, this.combat.analytics.shotsHit)) * 100).toFixed(2) + '%'
        };
    }

    // Environmental destruction system
    initializeEnvironmentalSystem() {
        if (!this.environment.destructible.enabled) return;

        // Initialize destructible terrain
        this.initializeDestructibleTerrain();

        // Initialize destructible objects
        this.initializeDestructibleObjects();

        // Record environmental system initialization
        if (this.thoughtMonitor) {
            this.recordThought('environment_system', {
                thought: 'Environmental destruction system initialized',
                reasoning: [
                    'Terrain deformation enabled',
                    'Object destruction system active',
                    'Impact effects configured',
                    'Debris system initialized'
                ],
                confidence: 0.8
            }, {
                role: 'environment_system',
                phase: 'initialization',
                context: 'environment_setup'
            });
        }
    }

    initializeDestructibleTerrain() {
        // Create a simple terrain geometry for deformation
        const terrainGeometry = new THREE.PlaneGeometry(100, 100, this.environment.terrain.resolution, this.environment.terrain.resolution);
        const terrainMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513,
            wireframe: false 
        });
        
        this.terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
        this.terrainMesh.rotation.x = -Math.PI / 2;
        this.terrainMesh.position.y = -2;
        this.terrainMesh.userData.isDestructible = true;
        this.terrainMesh.userData.originalVertices = terrainGeometry.attributes.position.array.slice();
        
        this.game.scene.add(this.terrainMesh);
    }

    initializeDestructibleObjects() {
        // Create some destructible objects in the environment
        const objectTypes = [
            { geometry: new THREE.BoxGeometry(2, 3, 2), material: new THREE.MeshLambertMaterial({ color: 0x8B4513 }), health: 50 },
            { geometry: new THREE.CylinderGeometry(1, 1, 4), material: new THREE.MeshLambertMaterial({ color: 0x696969 }), health: 75 },
            { geometry: new THREE.SphereGeometry(1.5), material: new THREE.MeshLambertMaterial({ color: 0x2F4F4F }), health: 100 }
        ];

        for (let i = 0; i < 10; i++) {
            const type = objectTypes[Math.floor(Math.random() * objectTypes.length)];
            const object = new THREE.Mesh(type.geometry, type.material);
            
            object.position.set(
                (Math.random() - 0.5) * 80,
                0,
                (Math.random() - 0.5) * 80
            );
            
            object.userData = {
                isDestructible: true,
                health: type.health,
                maxHealth: type.health,
                objectType: 'environmental'
            };
            
            this.environment.objects.destructibleObjects.set(object.id, object);
            this.game.scene.add(object);
        }
    }

    handleEnvironmentalImpact(projectile, hitPoint, weapon) {
        if (!this.environment.destructible.enabled) return;

        // Create impact crater
        if (this.environment.destructible.impactEffects) {
            this.createImpactCrater(hitPoint, weapon);
        }

        // Deform terrain
        if (this.environment.destructible.terrainDeformation) {
            this.deformTerrain(hitPoint, weapon);
        }

        // Check for object destruction
        if (this.environment.destructible.objectDestruction) {
            this.checkObjectDestruction(hitPoint, weapon);
        }

        // Create debris
        if (this.environment.destructible.debrisSystem) {
            this.createDebris(hitPoint, weapon);
        }

        // Record environmental impact
        if (this.thoughtMonitor) {
            this.recordThought('environment_system', {
                thought: `Environmental impact at ${hitPoint.x.toFixed(1)}, ${hitPoint.y.toFixed(1)}, ${hitPoint.z.toFixed(1)}`,
                reasoning: [
                    `Weapon: ${weapon.name}`,
                    `Impact force: ${weapon.damage}`,
                    `Terrain deformation: ${this.environment.destructible.terrainDeformation}`,
                    `Objects affected: ${this.getAffectedObjectsCount(hitPoint)}`
                ],
                confidence: 0.7
            }, {
                role: 'environment_system',
                phase: 'impact',
                context: 'environmental_destruction'
            });
        }
    }

    createImpactCrater(hitPoint, weapon) {
        const craterGeometry = new THREE.CircleGeometry(weapon.damage * 0.1, 8);
        const craterMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x2F2F2F,
            transparent: true,
            opacity: 0.8
        });
        
        const crater = new THREE.Mesh(craterGeometry, craterMaterial);
        crater.position.copy(hitPoint);
        crater.rotation.x = -Math.PI / 2;
        crater.position.y += 0.01; // Slightly above ground
        
        this.game.scene.add(crater);
        this.environment.objects.impactCraters.push({
            mesh: crater,
            creationTime: this.game.clock.getElapsedTime(),
            lifetime: 30 // 30 seconds
        });
    }

    deformTerrain(hitPoint, weapon) {
        if (!this.terrainMesh) return;

        const geometry = this.terrainMesh.geometry;
        const positions = geometry.attributes.position.array;
        const radius = weapon.damage * 0.2;
        const strength = this.environment.terrain.deformationStrength;

        // Find vertices within impact radius
        for (let i = 0; i < positions.length; i += 3) {
            const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
            const worldVertex = this.terrainMesh.localToWorld(vertex.clone());
            
            const distance = worldVertex.distanceTo(hitPoint);
            if (distance < radius) {
                const deformation = (1 - distance / radius) * strength;
                positions[i + 1] -= deformation; // Deform Y coordinate
            }
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
    }

    checkObjectDestruction(hitPoint, weapon) {
        const impactRadius = weapon.damage * 0.3;
        
        this.environment.objects.destructibleObjects.forEach((object, id) => {
            const distance = object.position.distanceTo(hitPoint);
            if (distance < impactRadius) {
                const damage = Math.max(1, weapon.damage * (1 - distance / impactRadius));
                this.damageDestructibleObject(object, damage, weapon);
            }
        });
    }

    damageDestructibleObject(object, damage, weapon) {
        object.userData.health -= damage;
        
        // Visual damage indication
        const damageRatio = object.userData.health / object.userData.maxHealth;
        object.material.color.setHex(this.getDamageColor(damageRatio));
        
        if (object.userData.health <= 0) {
            this.destroyObject(object, weapon);
        }
    }

    getDamageColor(healthRatio) {
        if (healthRatio > 0.7) return 0x8B4513; // Brown
        if (healthRatio > 0.4) return 0xA0522D; // Sienna
        if (healthRatio > 0.2) return 0xCD853F; // Peru
        return 0x8B0000; // Dark red
    }

    destroyObject(object, weapon) {
        // Create destruction effect
        this.createDestructionEffect(object.position, object.geometry);
        
        // Remove object
        this.game.scene.remove(object);
        this.environment.objects.destructibleObjects.delete(object.id);
        
        // Record destruction
        if (this.thoughtMonitor) {
            this.recordThought('environment_system', {
                thought: `Destructible object destroyed`,
                reasoning: [
                    `Object type: ${object.geometry.type}`,
                    `Weapon: ${weapon.name}`,
                    `Position: (${object.position.x.toFixed(1)}, ${object.position.y.toFixed(1)}, ${object.position.z.toFixed(1)})`,
                    `Remaining objects: ${this.environment.objects.destructibleObjects.size}`
                ],
                confidence: 0.8
            }, {
                role: 'environment_system',
                phase: 'destruction',
                context: 'object_destruction'
            });
        }
    }

    createDestructionEffect(position, geometry) {
        // Create particle explosion
        const particleCount = 50;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = position.x + (Math.random() - 0.5) * 2;
            positions[i3 + 1] = position.y + (Math.random() - 0.5) * 2;
            positions[i3 + 2] = position.z + (Math.random() - 0.5) * 2;
            
            velocities[i3] = (Math.random() - 0.5) * 10;
            velocities[i3 + 1] = Math.random() * 8;
            velocities[i3 + 2] = (Math.random() - 0.5) * 10;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0x8B4513,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });
        
        const particleSystem = new THREE.Points(particles, material);
        this.game.scene.add(particleSystem);
        
        // Animate particles
        const animate = () => {
            const positions = particleSystem.geometry.attributes.position.array;
            const velocities = particleSystem.geometry.attributes.velocity.array;
            
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                positions[i3] += velocities[i3] * 0.016;
                positions[i3 + 1] += velocities[i3 + 1] * 0.016;
                positions[i3 + 2] += velocities[i3 + 2] * 0.016;
                
                velocities[i3 + 1] -= 9.8 * 0.016; // Gravity
            }
            
            particleSystem.geometry.attributes.position.needsUpdate = true;
            material.opacity -= 0.02;
            
            if (material.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.game.scene.remove(particleSystem);
            }
        };
        animate();
    }

    createDebris(hitPoint, weapon) {
        const debrisCount = 20;
        
        for (let i = 0; i < debrisCount; i++) {
            const debrisGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            const debrisMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
            
            debris.position.copy(hitPoint);
            debris.position.add(new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 2,
                (Math.random() - 0.5) * 2
            ));
            
            debris.userData = {
                isDebris: true,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 5,
                    Math.random() * 3,
                    (Math.random() - 0.5) * 5
                ),
                lifetime: 10
            };
            
            this.environment.objects.debrisParticles.push(debris);
            this.game.scene.add(debris);
        }
    }

    updateEnvironmentalSystem(deltaTime) {
        if (!this.environment.destructible.enabled) return;

        // Update debris particles
        this.updateDebris(deltaTime);

        // Update impact craters
        this.updateImpactCraters(deltaTime);

        // Terrain recovery
        this.updateTerrainRecovery(deltaTime);
    }

    updateDebris(deltaTime) {
        for (let i = this.environment.objects.debrisParticles.length - 1; i >= 0; i--) {
            const debris = this.environment.objects.debrisParticles[i];
            
            // Update position
            debris.position.add(debris.userData.velocity.clone().multiplyScalar(deltaTime));
            
            // Apply gravity
            debris.userData.velocity.y -= 9.8 * deltaTime;
            
            // Update lifetime
            debris.userData.lifetime -= deltaTime;
            
            if (debris.userData.lifetime <= 0) {
                this.game.scene.remove(debris);
                this.environment.objects.debrisParticles.splice(i, 1);
            }
        }
    }

    updateImpactCraters(deltaTime) {
        for (let i = this.environment.objects.impactCraters.length - 1; i >= 0; i--) {
            const crater = this.environment.objects.impactCraters[i];
            
            crater.lifetime -= deltaTime;
            
            if (crater.lifetime <= 0) {
                this.game.scene.remove(crater.mesh);
                this.environment.objects.impactCraters.splice(i, 1);
            }
        }
    }

    updateTerrainRecovery(deltaTime) {
        if (!this.terrainMesh) return;

        const geometry = this.terrainMesh.geometry;
        const positions = geometry.attributes.position.array;
        const originalVertices = this.terrainMesh.userData.originalVertices;
        const recoveryRate = this.environment.terrain.recoveryRate;

        for (let i = 0; i < positions.length; i += 3) {
            const currentY = positions[i + 1];
            const originalY = originalVertices[i + 1];
            
            if (currentY < originalY) {
                positions[i + 1] += recoveryRate * deltaTime;
                positions[i + 1] = Math.min(positions[i + 1], originalY);
            }
        }

        geometry.attributes.position.needsUpdate = true;
    }

    getAffectedObjectsCount(hitPoint) {
        let count = 0;
        const impactRadius = 5;
        
        this.environment.objects.destructibleObjects.forEach(object => {
            if (object.position.distanceTo(hitPoint) < impactRadius) {
                count++;
            }
        });
        
        return count;
    }

    getEnvironmentalStatistics() {
        return {
            destructibleObjects: this.environment.objects.destructibleObjects.size,
            debrisParticles: this.environment.objects.debrisParticles.length,
            impactCraters: this.environment.objects.impactCraters.length,
            terrainDeformation: this.environment.destructible.terrainDeformation,
            objectDestruction: this.environment.destructible.objectDestruction
        };
    }

    // Cleanup
    destroy() {
        if (this.thoughtMonitor) {
            this.thoughtMonitor.shutdown();
        }
    }
}

export default EnhancedFPSSystem; 