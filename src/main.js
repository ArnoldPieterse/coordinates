import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { io } from 'socket.io-client';
import MathematicalEngine from './mathematical-engine.js';
import MathematicalVisualizer from './mathematical-visualizer.js';
import MathematicalAI from './mathematical-ai.js';
import FlowDiagramVisualizer from './flow-diagram-visualizer.js';
import UniversalObjectGenerator from '../universal-object-generator.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

class MultiplayerPlanetaryShooter {
    constructor() {
        this.mathEngine = new MathematicalEngine();
        this.mathEngine.initializeTHREE(THREE);
        this.mathematicalVisualizer = null;
        this.mathematicalAI = new MathematicalAI(this.mathEngine);
        this.aiAnalysis = {
            lastAnalysis: null,
            playerData: { position: null, velocity: null, actions: [], mathematicalInteractions: 0, fractalComplexity: 0, quantumState: 0, complexRelationships: 0, fineStructureInfluence: 0 },
            adaptiveEffects: { gravity: 1.0 * this.mathEngine.ALPHA, damage: 1.0 * this.mathEngine.SQRT_TEN.x, speed: 1.0 * this.mathEngine.ALPHA, accuracy: 1.0 * this.mathEngine.SQRT_POINT_ONE.x },
            mathematicalAnalysis: { alphaInfluence: this.mathEngine.ALPHA, complexEffects: 0, fractalEffects: 0, quantumEffects: 0, fineStructureEffects: 0 }
        };
        this.basePlayerSpeed = 0.15 * this.mathEngine.ALPHA;
        this.baseWeaponDamage = 25 * this.mathEngine.SQRT_TEN.x;
        this.basePlanetGravity = -30 * this.mathEngine.ALPHA;
        this.baseWeaponAccuracy = 1.0 * this.mathEngine.SQRT_POINT_ONE.x;
        this.mathematicalIntegration = { alphaInfluence: this.mathEngine.ALPHA, sqrtTenInfluence: this.mathEngine.SQRT_TEN.x, sqrtPointOneInfluence: this.mathEngine.SQRT_POINT_ONE.x, complexInfluence: 0, fractalInfluence: 0, quantumInfluence: 0, fineStructureInfluence: this.mathEngine.ALPHA };
        this.player = null;
        this.playerGeometry = null;
        this.playerMaterial = null;
        this.playerMesh = null;
        this.playerVelocity = null;
        this.playerAcceleration = null;
        this.playerSpeed = 10;
        this.playerJumpForce = 15;
        this.playerHealth = 100;
        this.maxHealth = 100;
        this.isDead = false;
        this.deathTime = 0;
        this.respawnTime = 3 * this.mathEngine.ALPHA;
        this.isInvulnerable = false;
        this.invulnerabilityTime = 0;
        this.invulnerabilityDuration = 2 * this.mathEngine.SQRT_TEN.x;
        this.healthBar = null;
        this.deathScreen = null;
        this.killFeed = null;
        this.damageIndicators = [];
        this.hitIndicators = [];
        this.weapons = {
            rifle: { name: 'Rifle', damage: 15, fireRate: 0.1, ammoCapacity: 30, reloadTime: 2.0, bulletSpeed: 30, bulletSize: 0.1, bulletColor: 0xFFFF00, spread: 0.02, automatic: true, mathematicalInfluence: this.mathEngine.ALPHA },
            shotgun: { name: 'Shotgun', damage: 10, fireRate: 0.8, ammoCapacity: 8, reloadTime: 3.0, bulletSpeed: 25, bulletSize: 0.08, bulletColor: 0xFF6B35, spread: 0.15, pelletCount: 8, automatic: false, mathematicalInfluence: this.mathEngine.SQRT_TEN.x },
            sniper: { name: 'Sniper', damage: 75, fireRate: 1.5, ammoCapacity: 5, reloadTime: 4.0, bulletSpeed: 50, bulletSize: 0.05, bulletColor: 0x00FFFF, spread: 0.001, automatic: false, mathematicalInfluence: this.mathEngine.ALPHA },
            grenade: { name: 'Grenade', damage: 80, fireRate: 2.0, ammoCapacity: 3, reloadTime: 1.0, bulletSpeed: 15, bulletSize: 0.3, bulletColor: 0x8B4513, spread: 0.05, automatic: false, fuseTime: 3.0, explosionRadius: 8, particleCount: 50, mathematicalInfluence: this.mathEngine.SQRT_POINT_ONE.x },
            rocket: { name: 'Rocket', damage: 120, fireRate: 3.0, ammoCapacity: 2, reloadTime: 5.0, bulletSpeed: 25, bulletSize: 0.2, bulletColor: 0xFF0000, spread: 0.01, automatic: false, explosive: true, explosionRadius: 12, tracking: true, particleCount: 30, mathematicalInfluence: this.mathEngine.ALPHA },
            mine: { name: 'Mine', damage: 90, fireRate: 1.0, ammoCapacity: 5, reloadTime: 2.0, bulletSpeed: 0, bulletSize: 0.4, bulletColor: 0x808080, spread: 0, automatic: false, explosive: true, explosionRadius: 6, triggerRadius: 2, deployable: true, particleCount: 25, mathematicalInfluence: this.mathEngine.SQRT_TEN.x },
            gravityGrenade: { name: 'Gravity Grenade', damage: 10, fireRate: 2.5, ammoCapacity: 2, reloadTime: 4.0, bulletSpeed: 15, bulletSize: 0.3, bulletColor: 0x9400D3, spread: 0.05, automatic: false, explosive: true, explosionRadius: 10, particleCount: 30, fuseTime: 3.0, gravityEffect: true, gravityDuration: 5.0, mathematicalInfluence: this.mathEngine.SQRT_POINT_ONE.x }
        };
        this.currentWeapon = 'rifle';
        this.ammo = { rifle: 30, shotgun: 8, sniper: 5, grenade: 3, rocket: 2, mine: 5, gravityGrenade: 2 };
        this.isReloading = false;
        this.reloadTimer = 0;
        this.lastShotTime = 0;
        this.weaponUI = null;
        this.cameraDistance = 8 * this.mathEngine.ALPHA;
        this.cameraHeight = 3 * this.mathEngine.SQRT_TEN.x;
        this.cameraControls = null;
        this.cameraMode = 'thirdPerson';
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseSensitivity = 0.002 * this.mathEngine.ALPHA;
        this.bullets = [];
        this.bulletSpeed = 30 * this.mathEngine.SQRT_POINT_ONE.x;
        this.bulletDamage = 25 * this.mathEngine.ALPHA;
        this.planets = new Map();
        this.currentPlanet = 'earth';
        this.planetData = {
            earth: { name: 'Earth', gravity: -30 * this.mathEngine.ALPHA, skyColor: 0x87CEEB, groundColor: 0x90EE90, obstacles: 10, position: new THREE.Vector3(0, 0, 0), mathematicalInfluence: this.mathEngine.ALPHA, alphaEffect: this.mathEngine.ALPHA, sqrtTenEffect: this.mathEngine.SQRT_TEN.x, sqrtPointOneEffect: this.mathEngine.SQRT_POINT_ONE.x },
            mars: { name: 'Mars', gravity: -12 * this.mathEngine.SQRT_TEN.x, skyColor: 0xFF6B35, groundColor: 0xCD5C5C, obstacles: 15, position: new THREE.Vector3(200, 0, 0), mathematicalInfluence: this.mathEngine.SQRT_TEN.x, alphaEffect: this.mathEngine.ALPHA, sqrtTenEffect: this.mathEngine.SQRT_TEN.x, sqrtPointOneEffect: this.mathEngine.SQRT_POINT_ONE.x },
            moon: { name: 'Moon', gravity: -5 * this.mathEngine.ALPHA, skyColor: 0x2C3E50, groundColor: 0x95A5A6, obstacles: 8, position: new THREE.Vector3(-200, 0, 0), mathematicalInfluence: this.mathEngine.SQRT_POINT_ONE.x, alphaEffect: this.mathEngine.ALPHA, sqrtTenEffect: this.mathEngine.SQRT_TEN.x, sqrtPointOneEffect: this.mathEngine.SQRT_POINT_ONE.x },
            jupiter: { name: 'Jupiter', gravity: -50 * this.mathEngine.SQRT_TEN.x, skyColor: 0xFF8C00, groundColor: 0xDAA520, obstacles: 20, position: new THREE.Vector3(0, 0, 200), mathematicalInfluence: this.mathEngine.ALPHA, alphaEffect: this.mathEngine.ALPHA, sqrtTenEffect: this.mathEngine.SQRT_TEN.x, sqrtPointOneEffect: this.mathEngine.SQRT_POINT_ONE.x },
            venus: { name: 'Venus', gravity: -25 * this.mathEngine.ALPHA, skyColor: 0xFFB6C1, groundColor: 0xF4A460, obstacles: 12, position: new THREE.Vector3(0, 0, -200), mathematicalInfluence: this.mathEngine.SQRT_TEN.x, alphaEffect: this.mathEngine.ALPHA, sqrtTenEffect: this.mathEngine.SQRT_TEN.x, sqrtPointOneEffect: this.mathEngine.SQRT_POINT_ONE.x }
        };
        for (const [planetId, planet] of Object.entries(this.planetData)) { this.mathEngine.calculateMathematicalPlanetEffects(planet, { position: new THREE.Vector3() }); }
        this.rocket = null;
        this.isInRocket = false;
        this.rocketTarget = null;
        this.rocketSpeed = 50;
        this.rocketTravelTime = 0;
        this.rocketTravelDuration = 3;
        this.kills = 0;
        this.deaths = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.physicsZones = [];
        this.explosions = [];
        this.particles = [];
        this.magneticFields = [];
        this.zeroGravityZones = [];
        this.destructibleObjects = [];
        this.windZones = [];
        this.timeDilationZones = [];
        this.canDash = true;
        this.dashSpeed = 30;
        this.dashCooldown = 5;
        this.dashTimer = 0;
        this.explosiveWeapons = {
            grenade: { name: 'Grenade', damage: 80, radius: 8, fuseTime: 3.0, throwForce: 15, bounciness: 0.6, gravity: -30, particleCount: 50 },
            rocket: { name: 'Rocket', damage: 120, radius: 12, speed: 25, tracking: true, particleCount: 30 },
            mine: { name: 'Mine', damage: 60, radius: 6, triggerRadius: 2, particleCount: 25 }
        };
        this.physicsObjects = [];
        this.balls = [];
        this.boxes = [];
        this.ladders = [];
        this.softBodies = [];
        this.climbingLadder = null;
        this.climbingSpeed = 3;
        this.isClimbing = false;
        this.physicsConstants = { gravity: -30, airResistance: 0.99, bounceEnergyLoss: 0.7, friction: 0.8, magneticForce: 5.0, windForce: 2.0, timeDilationFactor: 0.5, ballBounce: 0.8, boxFriction: 0.95, ladderClimbSpeed: 3.0, softBodySpringStiffness: 100.0, softBodyDamping: 0.8, softBodyRestLength: 1.0, softBodyMass: 1.0 };
        this.gravityWells = [];
        this.particleSystems = {
            explosion: { count: 50, life: 2.0, speed: 10, gravity: -20, colors: [0xFF4500, 0xFF8C00, 0xFFFF00, 0xFF0000], sizes: [0.1, 0.05, 0.02] },
            smoke: { count: 20, life: 4.0, speed: 2, gravity: -5, colors: [0x666666, 0x888888, 0xAAAAAA], sizes: [0.3, 0.2, 0.1] },
            spark: { count: 15, life: 1.0, speed: 8, gravity: -15, colors: [0xFFFF00, 0xFFA500, 0xFF0000], sizes: [0.02, 0.01] }
        };
        this.chatMessages = [];
        this.maxChatMessages = 50;
        this.chatInput = null;
        this.chatContainer = null;
        this.isChatOpen = false;
        this.chatHistory = [];
        this.toolsUI = null;
        this.toolsContainer = null;
        this.isToolsOpen = false;
        this.availableTools = [
            { key: 'debug-console', name: 'Debug Console', icon: '🐛', shortcut: 'F1', description: 'Advanced debugging and console access' },
            { key: 'performance-monitor', name: 'Performance Monitor', icon: '📊', shortcut: 'F2', description: 'Real-time performance metrics and FPS monitoring' },
            { key: 'network-analyzer', name: 'Network Analyzer', icon: '🌐', shortcut: 'F3', description: 'Multiplayer network statistics and latency analysis' },
            { key: 'gameplay-enhancer', name: 'Gameplay Enhancer', icon: '⚡', shortcut: 'F4', description: 'Gameplay modifications and enhancements' },
            { key: 'game-utilities', name: 'Game Utilities', icon: '🛠️', shortcut: 'F5', description: 'General game utilities and helpers' },
            { key: 'objectives-manager', name: 'Objectives Manager', icon: '🎯', shortcut: 'F6', description: 'Track and manage game objectives' },
            { key: 'web-search', name: 'Web Search', icon: '🔍', shortcut: 'F7', description: 'Search web resources and documentation' }
        ];
        this.isRunning = false;
        this.frameCount = 0;
        this.frameRate = 0;
        this.performanceMetrics = {};
        this.init();
    }
    async init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.clock = new THREE.Clock();
        this.audioListener = new THREE.AudioListener();
        this.camera.add(this.audioListener);
        this.mathEngine.initializeTHREE(THREE);
        this.aiAnalysis.playerData.position = new THREE.Vector3();
        this.aiAnalysis.playerData.velocity = new THREE.Vector3();
        this.playerVelocity = new THREE.Vector3();
        this.playerAcceleration = new THREE.Vector3();
        this.sky = new Sky();
        this.sky.scale.setScalar(450000);
        this.scene.add(this.sky);
        this.sun = new THREE.Vector3();
        const effectController = { turbidity: 10, rayleigh: 2, mieCoefficient: 0.005, mieDirectionalG: 0.8, elevation: 2, azimuth: 180, };
        const uniforms = this.sky.material.uniforms;
        uniforms['turbidity'].value = effectController.turbidity;
        uniforms['rayleigh'].value = effectController.rayleigh;
        uniforms['mieCoefficient'].value = effectController.mieCoefficient;
        uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;
        const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
        const theta = THREE.MathUtils.degToRad(effectController.azimuth);
        this.sun.setFromSphericalCoords(1, phi, theta);
        uniforms['sunPosition'].value.copy(this.sun);
        for (const [weaponKey, weapon] of Object.entries(this.weapons)) { weapon.damage = this.mathEngine.calculateMathematicalWeaponDamage(weapon.damage, weaponKey); }
        this.mathematicalVisualizer = null;
        this.flowDiagramVisualizer = null;
        this.mathematicalConstants = this.mathEngine.getMathematicalConstants();
        this.socket = null;
        this.players = new Map();
        this.playerId = null;
        this.isConnected = false;
        this.jumpForce = 15;
        this.gravity = -30;
        this.isGrounded = false;
        this.playerRadius = 1.0;
        this.playerHeight = 2.0;
        this.playerSpeed *= (1 + this.mathematicalConstants.alphaInfluence);
        this.jumpForce *= (1 + this.mathematicalConstants.alphaInfluence);
        this.gravity *= (1 + this.mathematicalConstants.alphaInfluence);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.5;
        const container = document.getElementById('gameContainer');
        if (container) {
            container.appendChild(this.renderer.domElement);
            this.renderer.domElement.style.position = 'absolute';
            this.renderer.domElement.style.top = '0';
            this.renderer.domElement.style.left = '0';
            this.renderer.domElement.style.width = '100%';
            this.renderer.domElement.style.height = '100%';
        } else {
            document.body.appendChild(this.renderer.domElement);
        }
        this.setupScene();
        this.setupPlayer();
        this.setupCamera();
        this.setupLights();
        this.setupRocket();
        this.setupInput();
        this.setupNetworking();
        this.flowDiagramVisualizer = new FlowDiagramVisualizer(this.scene);
        this.flowDiagramVisualizer.loadAndRender('./game_describers/flow-diagram.json');
        this.universalObjectGenerator = new UniversalObjectGenerator(this.scene);
        try {
            await this.universalObjectGenerator.load('./universal-object-descriptor.json');
        } catch (error) {
            console.error("Halting initialization due to critical file load error.", error);
            return;
        }
        this.setupUniversalObjectControls();
        this.animate();
    }
    setupUniversalObjectControls() {
        document.addEventListener('keydown', (event) => {
            if (event.code === 'KeyG' && !this.isDead) {
                const position = this.player.position.clone();
                position.y = 0; 
                this.universalObjectGenerator.generateObjectById('kameeldoring_001', position);
                if (typeof this.addChatMessage === 'function') this.addChatMessage('System', 'Generated a Kameeldoring tree!', true);
            }
            if (event.code === 'KeyH' && !this.isDead) {
                const randomType = 'tree';
                const position = this.player.position.clone().add(new THREE.Vector3(Math.random() * 10 - 5, 0, Math.random() * 10 - 5));
                position.y = 0;
                this.universalObjectGenerator.generateRandomObject(randomType, position);
                if (typeof this.addChatMessage === 'function') this.addChatMessage('System', `Generated a random ${randomType}!`, true);
            }
            if (event.code === 'KeyJ' && !this.isDead) {
                this.universalObjectGenerator.clearAllObjects();
                if (typeof this.addChatMessage === 'function') this.addChatMessage('System', 'Cleared all generated objects.', true);
            }
            if (event.code === 'KeyK' && !this.isDead) {
                this.universalObjectGenerator.inspectObjects();
            }
        });
    }
    setupScene() {
        for (const [planetId, planetInfo] of Object.entries(this.planetData)) { this.createPlanet(planetId, planetInfo); }
        this.switchToPlanet(this.currentPlanet);
        const gridHelper = new THREE.GridHelper(200, 50);
        this.scene.add(gridHelper);
    }
    setupPlayer() {
        this.playerGeometry = new THREE.CapsuleGeometry(this.playerRadius, this.playerHeight - (2 * this.playerRadius), 4, 8);
        this.playerMaterial = new THREE.MeshLambertMaterial({ color: 0x0077ff, wireframe: false });
        this.player = new THREE.Mesh(this.playerGeometry, this.playerMaterial);
        this.player.castShadow = true;
        this.player.position.set(0, 5, 0);
        this.scene.add(this.player);
        const gunGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.5);
        const gunMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
        this.gun = new THREE.Mesh(gunGeometry, gunMaterial);
        this.gun.position.set(0.3, 0.2, 0.5);
        this.player.add(this.gun);
    }
    setupCamera() {
        this.cameraControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.cameraControls.target.copy(this.player.position);
        this.cameraControls.enableDamping = true;
        this.cameraControls.dampingFactor = 0.05;
        this.cameraControls.screenSpacePanning = false;
        this.cameraControls.minDistance = 2;
        this.cameraControls.maxDistance = 20;
        this.cameraControls.maxPolarAngle = Math.PI / 1.9;
    }
    setupLights() {
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
        hemiLight.position.set(0, 20, 0);
        this.scene.add(hemiLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 2);
        dirLight.position.set(this.sun.x, this.sun.y, this.sun.z).multiplyScalar(50);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.left = -50;
        dirLight.shadow.camera.right = 50;
        dirLight.shadow.camera.top = 50;
        dirLight.shadow.camera.bottom = -50;
        dirLight.shadow.camera.far = 3500;
        dirLight.shadow.bias = -0.0001;
        this.scene.add(dirLight);
        this.dirLight = dirLight;
    }
    setupRocket() {
        const rocketMenu = document.createElement('div');
        rocketMenu.id = 'rocketMenu';
        rocketMenu.style.position = 'absolute';
        rocketMenu.style.top = '50%';
        rocketMenu.style.left = '50%';
        rocketMenu.style.transform = 'translate(-50%, -50%)';
        rocketMenu.style.padding = '20px';
        rocketMenu.style.backgroundColor = 'rgba(0,0,0,0.8)';
        rocketMenu.style.border = '2px solid #0ff';
        rocketMenu.style.display = 'none';
        rocketMenu.innerHTML = `<h2>Select Destination</h2>`;
        document.body.appendChild(rocketMenu);
        this.rocketMenu = rocketMenu;
    }
    setupInput() {
        this.keys = {};
        document.addEventListener('keydown', (event) => { this.keys[event.code] = true; this.handleKeyDown(event); });
        document.addEventListener('keyup', (event) => { this.keys[event.code] = false; });
        this.renderer.domElement.addEventListener('mousedown', (event) => { if (event.button === 0 && document.pointerLockElement === this.renderer.domElement) { this.shoot(); } });
        document.addEventListener('mousemove', (event) => { if (document.pointerLockElement === this.renderer.domElement || this.cameraMode === 'firstPerson') { this.mouseX += event.movementX; this.mouseY += event.movementY; } });
        this.renderer.domElement.addEventListener('click', () => { if (!this.isToolsOpen && !this.isInRocket) { this.renderer.domElement.requestPointerLock(); } });
        document.addEventListener('pointerlockchange', () => { if (document.pointerLockElement !== this.renderer.domElement && this.cameraMode !== 'firstPerson') { this.cameraControls.enabled = true; } else { this.cameraControls.enabled = false; } }, false);
        window.addEventListener('wheel', (event) => {
            if (this.isDead || this.isInRocket) return;
            const weaponKeys = Object.keys(this.weapons);
            const currentIndex = weaponKeys.indexOf(this.currentWeapon);
            let nextIndex = (event.deltaY < 0) ? (currentIndex - 1 + weaponKeys.length) % weaponKeys.length : (currentIndex + 1) % weaponKeys.length;
            this.switchWeapon(weaponKeys[nextIndex]);
        });
    }
    handleKeyDown(event) {
        if (this.isDead || this.isInRocket) return;
        if (event.code.startsWith('Digit')) {
            const weaponIndex = parseInt(event.code.slice(5), 10) - 1;
            const weaponKeys = Object.keys(this.weapons);
            if (weaponIndex >= 0 && weaponIndex < weaponKeys.length) { this.switchWeapon(weaponKeys[weaponIndex]); }
        }
        if (event.code === 'KeyR') this.reload();
        if (event.code === 'ShiftLeft') this.initiateDash();
        if (event.code === 'KeyV') this.switchCameraMode();
    }
    animate() {
        requestAnimationFrame(() => this.animate());
        const deltaTime = this.clock.getDelta();
        if (this.player) { this.updatePlayer(deltaTime); }
        if (this.cameraControls) { this.updateCamera(deltaTime); }
        this.updateBullets(deltaTime);
        this.updateReload(deltaTime);
        this.updateDash(deltaTime);
        this.updateParticles(deltaTime);
        this.updateExplosions(deltaTime);
        this.renderer.render(this.scene, this.camera);
        this.frameCount++;
    }
    shoot() {
        if (this.isReloading || this.isDead || this.isInRocket) return;
        const weapon = this.weapons[this.currentWeapon];
        const now = this.clock.getElapsedTime();
        if (now - this.lastShotTime < weapon.fireRate) return;
        if (this.ammo[this.currentWeapon] <= 0) return;
        this.lastShotTime = now;
        this.ammo[this.currentWeapon]--;
        this.updateWeaponUI();
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: weapon.bulletColor });
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        for (let i = 0; i < (weapon.pelletCount || 1); i++) {
            const bulletGeometry = new THREE.SphereGeometry(weapon.bulletSize, 8, 8);
            const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
            bullet.position.copy(this.player.position).add(new THREE.Vector3(0, 1.5, 0));
            const spread = new THREE.Vector3((Math.random() - 0.5) * weapon.spread, (Math.random() - 0.5) * weapon.spread, (Math.random() - 0.5) * weapon.spread);
            bullet.velocity = cameraDirection.clone().add(spread).normalize().multiplyScalar(weapon.bulletSpeed);
            bullet.owner = this.playerId;
            bullet.weapon = this.currentWeapon;
            bullet.userData.isBullet = true;
            this.bullets.push(bullet);
            this.scene.add(bullet);
        }
        if (this.socket) { this.socket.emit('shoot', { position: this.player.position.toArray(), direction: cameraDirection.toArray(), weapon: this.currentWeapon }); }
    }
    updatePlayer(deltaTime) {
        if (this.isDead) return;
        const moveDirection = new THREE.Vector3();
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();
        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
        if (this.keys['KeyW']) { moveDirection.add(cameraDirection); }
        if (this.keys['KeyS']) { moveDirection.sub(cameraDirection); }
        if (this.keys['KeyA']) { moveDirection.sub(cameraRight); }
        if (this.keys['KeyD']) { moveDirection.add(cameraRight); }
        if (moveDirection.lengthSq() > 0) { this.player.quaternion.slerp(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), moveDirection), 0.15); }
        this.playerAcceleration.copy(moveDirection).normalize().multiplyScalar(this.playerSpeed);
        this.playerVelocity.add(this.playerAcceleration.clone().multiplyScalar(deltaTime));
        this.playerVelocity.x *= 0.9;
        this.playerVelocity.z *= 0.9;
        this.playerVelocity.y += this.gravity * deltaTime;
        if (this.keys['Space'] && this.isGrounded) { this.playerVelocity.y = this.playerJumpForce; this.isGrounded = false; }
        this.player.position.add(this.playerVelocity.clone().multiplyScalar(deltaTime));
        if (this.player.position.y < 1) { this.player.position.y = 1; this.playerVelocity.y = 0; this.isGrounded = true; }
        if (this.socket && this.frameCount % 2 === 0) { this.socket.emit('playerState', { position: this.player.position.toArray(), quaternion: this.player.quaternion.toArray() }); }
    }
    updateBullets(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.position.add(bullet.velocity.clone().multiplyScalar(deltaTime));
            for (const [id, otherPlayer] of this.players) {
                if (otherPlayer.mesh && bullet.owner !== id) {
                    if (bullet.position.distanceTo(otherPlayer.mesh.position) < 1.0) {
                        this.scene.remove(bullet);
                        this.bullets.splice(i, 1);
                        if (this.socket) { this.socket.emit('playerHit', { targetId: id, damage: this.bulletDamage, weapon: bullet.weapon }); }
                        break;
                    }
                }
            }
            if (bullet.position.length() > 500) { this.scene.remove(bullet); this.bullets.splice(i, 1); }
        }
    }
    updateCamera(deltaTime) {
        if (this.cameraMode === 'firstPerson') {
            this.camera.position.copy(this.player.position);
            this.camera.position.y += 1.6;
            this.player.rotation.y -= this.mouseX * this.mouseSensitivity;
            const newRotationX = this.camera.rotation.x - this.mouseY * this.mouseSensitivity;
            this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, newRotationX));
            this.mouseX = 0;
            this.mouseY = 0;
        } else {
            this.cameraControls.update();
        }
    }
    initiateDash() {
        if (!this.canDash) return;
        this.canDash = false;
        this.dashTimer = this.dashCooldown;
        const dashDirection = new THREE.Vector3();
        this.camera.getWorldDirection(dashDirection);
        dashDirection.y = 0;
        dashDirection.normalize();
        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(dashDirection, new THREE.Vector3(0, 1, 0));
        const moveVector = new THREE.Vector3();
        if (this.keys['KeyW']) moveVector.add(dashDirection);
        if (this.keys['KeyS']) moveVector.sub(dashDirection);
        if (this.keys['KeyA']) moveVector.sub(cameraRight);
        if (this.keys['KeyD']) moveVector.add(cameraRight);
        if (moveVector.lengthSq() === 0) { moveVector.copy(dashDirection); }
        moveVector.normalize();
        this.playerVelocity.add(moveVector.multiplyScalar(this.dashSpeed));
        this.createDashEffect();
    }
    createDashEffect() {
        const dashEffect = new THREE.Group();
        for (let i = 0; i < 5; i++) {
            const geometry = new THREE.BoxGeometry(0.2, 0.2, 2);
            const material = new THREE.MeshBasicMaterial({ color: 0x00FFFF, transparent: true, opacity: 0.5 });
            const streak = new THREE.Mesh(geometry, material);
            streak.position.z = -i * 1.5;
            dashEffect.add(streak);
        }
        dashEffect.position.copy(this.player.position);
        dashEffect.quaternion.copy(this.player.quaternion);
        this.scene.add(dashEffect);
    
        let life = 0.3;
        const animateDashEffect = () => {
            life -= 0.016; // Assumes 60fps
            if (life <= 0) {
                if(this.scene) this.scene.remove(dashEffect);
                return;
            }
            dashEffect.children.forEach(child => {
                if(child.material) child.material.opacity = (life / 0.3) * 0.5;
            });
            requestAnimationFrame(animateDashEffect);
        };
        animateDashEffect();
    }
    updateDash(deltaTime) {
        if (!this.canDash) {
            this.dashTimer -= deltaTime;
            if (this.dashTimer <= 0) {
                this.canDash = true;
                this.dashTimer = 0;
            }
        }
    }
    createPlanet(planetId, planetInfo) {
        const planet = new THREE.Group();
        const geometry = new THREE.SphereGeometry(100, 64, 64);
        const material = new THREE.MeshLambertMaterial({ color: planetInfo.groundColor });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.receiveShadow = true;
        planet.add(sphere);
        planet.position.copy(planetInfo.position);
        this.scene.add(planet);
        this.planets.set(planetId, { object: planet, ...planetInfo });
    }
    switchToPlanet(planetId) {
        if (!this.planets.has(planetId)) return;
        this.currentPlanet = planetId;
        const planetInfo = this.planets.get(planetId);
        this.gravity = planetInfo.gravity;
        // You might want to update the sky/lighting based on the planet
        // For example, using planetInfo.skyColor
    }
    setupNetworking() {
        this.socket = io('http://localhost:3001');

        this.socket.on('connect', () => {
            console.log('Connected to server with id:', this.socket.id);
            this.playerId = this.socket.id;
            this.isConnected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.isConnected = false;
        });

        this.socket.on('currentPlayers', (players) => {
            for (const [id, playerData] of Object.entries(players)) {
                if (id !== this.playerId) {
                    this.addPlayer(id, playerData);
                }
            }
        });

        this.socket.on('playerJoined', (player) => {
            if (player.id !== this.playerId) {
                this.addPlayer(player.id, player.data);
            }
        });

        this.socket.on('playerLeft', (id) => {
            this.removePlayer(id);
        });

        this.socket.on('playerState', ({ id, state }) => {
            if (this.players.has(id)) {
                const player = this.players.get(id);
                player.mesh.position.fromArray(state.position);
                player.mesh.quaternion.fromArray(state.quaternion);
            }
        });
        
        this.socket.on('playerHit', ({ targetId, damage, weapon }) => {
            if (targetId === this.playerId) {
                this.takeDamage(damage, weapon);
            }
        });
    }
    addPlayer(id, playerData) {
        if (this.players.has(id)) return;
        const geometry = new THREE.CapsuleGeometry(this.playerRadius, this.playerHeight - (2 * this.playerRadius), 4, 8);
        const material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.position.fromArray(playerData.position);
        this.scene.add(mesh);
        this.players.set(id, { mesh, ...playerData });
    }
    removePlayer(id) {
        if (this.players.has(id)) {
            const player = this.players.get(id);
            this.scene.remove(player.mesh);
            this.players.delete(id);
        }
    }
    takeDamage(damage, weapon) {
        if (this.isDead || this.isInvulnerable) return;

        this.playerHealth -= damage;
        this.updateHealthBar();

        if (this.playerHealth <= 0) {
            this.playerHealth = 0;
            this.die();
        }
    }
    die() {
        this.isDead = true;
        this.deaths++;
        this.deathTime = this.clock.getElapsedTime();
        // Show death screen, disable controls etc.
        if (this.deathScreen) this.deathScreen.style.display = 'block';
    }
    respawn() {
        this.isDead = false;
        this.playerHealth = this.maxHealth;
        this.player.position.set(0, 5, 0); // Reset position
        this.playerVelocity.set(0, 0, 0);
        this.updateHealthBar();
        if(this.deathScreen) this.deathScreen.style.display = 'none';

        this.isInvulnerable = true;
        this.invulnerabilityTime = this.clock.getElapsedTime();
    }
    updateHealthBar() {
        if (this.healthBar) {
            this.healthBar.style.width = `${(this.playerHealth / this.maxHealth) * 100}%`;
        }
    }
    addChatMessage(sender, message, isSystem = false) {
        // Implementation for chat
    }
    updateWeaponUI() {
        // Implementation for weapon UI
    }
    switchWeapon(weaponKey) {
        if (!this.weapons[weaponKey] || this.isDead || this.isInRocket) return;
        this.currentWeapon = weaponKey;
        this.updateWeaponUI();
        if (this.socket) {
            this.socket.emit('weaponSwitch', { weapon: weaponKey });
        }
    }
    reload() {
        if (this.isReloading || this.isDead || this.isInRocket) return;
        const weapon = this.weapons[this.currentWeapon];
        if (this.ammo[this.currentWeapon] >= weapon.ammoCapacity) return;
        this.isReloading = true;
        this.reloadTimer = weapon.reloadTime;
        if (this.socket) {
            this.socket.emit('reload', { weapon: this.currentWeapon });
        }
    }
    updateReload(deltaTime) {
        if (!this.isReloading) return;
        this.reloadTimer -= deltaTime;
        if (this.reloadTimer <= 0) {
            this.isReloading = false;
            this.ammo[this.currentWeapon] = this.weapons[this.currentWeapon].ammoCapacity;
            this.updateWeaponUI();
        }
    }
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.life -= deltaTime;
            if (particle.life <= 0) {
                this.scene.remove(particle);
                this.particles.splice(i, 1);
                continue;
            }
            particle.velocity.y += (particle.gravity || this.gravity) * deltaTime;
            particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
            if (particle.material.opacity) {
                particle.material.opacity = particle.life / particle.maxLife;
            }
        }
    }
    updateExplosions(deltaTime) {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.life -= deltaTime;
            if (explosion.life <= 0) {
                this.scene.remove(explosion.mesh);
                this.explosions.splice(i, 1);
                continue;
            }
            const scale = 1 + (1 - explosion.life / explosion.maxLife) * 2;
            explosion.mesh.scale.set(scale, scale, scale);
            explosion.mesh.material.opacity = explosion.life / explosion.maxLife;
        }
    }
    switchCameraMode() {
        if (this.cameraMode === 'thirdPerson') {
            this.cameraMode = 'firstPerson';
            this.player.visible = false;
            if(this.cameraControls) this.cameraControls.enabled = false;
            this.gun.position.set(0.4, -0.3, -0.8);
            this.camera.add(this.gun);
        } else {
            this.cameraMode = 'thirdPerson';
            this.player.visible = true;
            if(this.cameraControls) this.cameraControls.enabled = true;
            this.gun.position.set(0.3, 0.2, 0.5);
            this.player.add(this.gun);
        }
    }
}

const game = new MultiplayerPlanetaryShooter();
window.game = game;

window.addEventListener('resize', () => {
    const game = window.game;
    if (game) {
        game.camera.aspect = window.innerWidth / window.innerHeight;
        game.camera.updateProjectionMatrix();
        game.renderer.setSize(window.innerWidth, window.innerHeight);
    }
});
