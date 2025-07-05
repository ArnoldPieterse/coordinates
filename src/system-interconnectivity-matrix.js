// System Interconnectivity Matrix Visualizer
// Implements the Matrix concept: visualizing all program interconnectivity and butterfly effects
import * as THREE from 'three';

export default class SystemInterconnectivityMatrix {
    constructor(scene, mathematicalEngine) {
        this.scene = scene;
        this.mathematicalEngine = mathematicalEngine;
        
        // Matrix visualization components
        this.matrixContainer = new THREE.Group();
        this.scene.add(this.matrixContainer);
        
        // System nodes and connections
        this.systemNodes = new Map();
        this.connectionLines = new Map();
        this.dataFlowParticles = new Map();
        
        // Matrix state
        this.matrixState = {
            isActive: false,
            visualizationMode: 'interconnectivity', // 'interconnectivity', 'butterfly-effect', 'perspective-shift'
            sensitivityFactor: this.mathematicalEngine.ALPHA,
            propagationSpeed: 1.0,
            recursionDepth: 3,
            perspectiveCount: 0
        };
        
        // Function mapping and relationships
        this.functionRegistry = new Map();
        this.recursiveRelationships = new Map();
        this.perspectiveMappings = new Map();
        
        // Butterfly effect tracking
        this.changePropagation = {
            activeChanges: new Set(),
            propagationWaves: new Map(),
            affectedSystems: new Set(),
            timeStamp: 0
        };
        
        // Initialize the matrix
        this.initializeMatrix();
        this.setupFunctionRegistry();
        this.createPerspectiveMappings();
    }
    
    initializeMatrix() {
        // Create the main matrix visualization container
        this.matrixContainer.position.set(0, 50, 0);
        this.matrixContainer.scale.set(0.5, 0.5, 0.5);
        
        // Add ambient lighting for matrix effect
        const ambientLight = new THREE.AmbientLight(0x00ff00, 0.3);
        this.matrixContainer.add(ambientLight);
        
        // Add directional lighting for depth
        const directionalLight = new THREE.DirectionalLight(0x00ff00, 0.7);
        directionalLight.position.set(10, 10, 10);
        this.matrixContainer.add(directionalLight);
    }
    
    setupFunctionRegistry() {
        // Register all major system functions with their relationships
        this.registerSystemFunction('mathematicalEngine', {
            category: 'core',
            dependencies: ['physicsEngine', 'aiSystem', 'renderingSystem'],
            recursiveCalls: ['updateQuantumStates', 'calculateMathematicalPhysics'],
            perspectiveViews: ['player', 'ai', 'physics', 'rendering']
        });
        
        this.registerSystemFunction('physicsEngine', {
            category: 'simulation',
            dependencies: ['mathematicalEngine', 'playerSystem', 'bulletSystem'],
            recursiveCalls: ['updatePhysics', 'calculateCollisions'],
            perspectiveViews: ['player', 'physics', 'rendering']
        });
        
        this.registerSystemFunction('aiSystem', {
            category: 'intelligence',
            dependencies: ['mathematicalEngine', 'playerSystem', 'gameState'],
            recursiveCalls: ['analyzePlayerData', 'updatePatterns'],
            perspectiveViews: ['ai', 'player', 'gameState']
        });
        
        this.registerSystemFunction('renderingSystem', {
            category: 'visualization',
            dependencies: ['mathematicalEngine', 'physicsEngine', 'playerSystem'],
            recursiveCalls: ['updateRendering', 'applyVisualEffects'],
            perspectiveViews: ['rendering', 'player', 'physics']
        });
        
        this.registerSystemFunction('playerSystem', {
            category: 'interaction',
            dependencies: ['physicsEngine', 'aiSystem', 'inputSystem'],
            recursiveCalls: ['updatePlayer', 'processInput'],
            perspectiveViews: ['player', 'ai', 'physics']
        });
        
        this.registerSystemFunction('bulletSystem', {
            category: 'projectile',
            dependencies: ['physicsEngine', 'mathematicalEngine', 'playerSystem'],
            recursiveCalls: ['updateBullets', 'calculateTrajectory'],
            perspectiveViews: ['physics', 'player', 'rendering']
        });
    }
    
    registerSystemFunction(functionName, metadata) {
        this.functionRegistry.set(functionName, {
            id: functionName,
            name: functionName,
            category: metadata.category,
            dependencies: metadata.dependencies || [],
            recursiveCalls: metadata.recursiveCalls || [],
            perspectiveViews: metadata.perspectiveViews || [],
            position: new THREE.Vector3(),
            connections: new Set(),
            changeHistory: [],
            lastModified: 0
        });
    }
    
    createPerspectiveMappings() {
        // Define how different perspectives view the same system
        this.perspectiveMappings.set('player', {
            name: 'Player Perspective',
            color: 0x00ff00,
            priority: ['playerSystem', 'physicsEngine', 'renderingSystem'],
            sensitivity: this.mathematicalEngine.ALPHA
        });
        
        this.perspectiveMappings.set('ai', {
            name: 'AI Perspective',
            color: 0x0000ff,
            priority: ['aiSystem', 'playerSystem', 'mathematicalEngine'],
            sensitivity: this.mathematicalEngine.SQRT_TEN.x
        });
        
        this.perspectiveMappings.set('physics', {
            name: 'Physics Perspective',
            color: 0xff0000,
            priority: ['physicsEngine', 'mathematicalEngine', 'bulletSystem'],
            sensitivity: this.mathematicalEngine.SQRT_POINT_ONE.x
        });
        
        this.perspectiveMappings.set('rendering', {
            name: 'Rendering Perspective',
            color: 0xffff00,
            priority: ['renderingSystem', 'physicsEngine', 'playerSystem'],
            sensitivity: this.mathematicalEngine.ALPHA
        });
    }
    
    createMatrixVisualization() {
        // Clear existing visualization
        this.clearMatrixVisualization();
        
        // Create nodes for each registered function
        this.functionRegistry.forEach((functionData, functionName) => {
            const node = this.createSystemNode(functionData);
            this.systemNodes.set(functionName, node);
            this.matrixContainer.add(node);
        });
        
        // Position nodes in 3D space
        this.positionSystemNodes();
        
        // Create connection lines between related functions
        this.createSystemConnections();
        
        // Create data flow particles
        this.createDataFlowParticles();
        
        this.matrixState.isActive = true;
    }
    
    createSystemNode(functionData) {
        const nodeGroup = new THREE.Group();
        
        // Create node geometry based on category
        const geometry = this.getNodeGeometry(functionData.category);
        const material = new THREE.MeshStandardMaterial({
            color: this.getCategoryColor(functionData.category),
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0x00ff00,
            emissiveIntensity: 0.1
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = functionData;
        nodeGroup.add(mesh);
        
        return nodeGroup;
    }
    
    getNodeGeometry(category) {
        switch (category) {
            case 'core': return new THREE.OctahedronGeometry(1.5, 0);
            case 'simulation': return new THREE.BoxGeometry(2, 2, 2);
            case 'intelligence': return new THREE.IcosahedronGeometry(1.2, 0);
            case 'visualization': return new THREE.SphereGeometry(1.5, 8, 8);
            case 'interaction': return new THREE.ConeGeometry(1, 2, 8);
            case 'projectile': return new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
            default: return new THREE.SphereGeometry(1, 8, 8);
        }
    }
    
    getCategoryColor(category) {
        switch (category) {
            case 'core': return 0x00ff00;
            case 'simulation': return 0x0000ff;
            case 'intelligence': return 0xff0000;
            case 'visualization': return 0xffff00;
            case 'interaction': return 0xff00ff;
            case 'projectile': return 0x00ffff;
            default: return 0xffffff;
        }
    }
    
    positionSystemNodes() {
        const positions = [
            new THREE.Vector3(0, 0, 0),      // mathematicalEngine (center)
            new THREE.Vector3(5, 0, 0),      // physicsEngine
            new THREE.Vector3(-5, 0, 0),     // aiSystem
            new THREE.Vector3(0, 5, 0),      // renderingSystem
            new THREE.Vector3(0, -5, 0),     // playerSystem
            new THREE.Vector3(3, 3, 0)       // bulletSystem
        ];
        
        let index = 0;
        this.functionRegistry.forEach((functionData, functionName) => {
            if (index < positions.length) {
                functionData.position.copy(positions[index]);
                const node = this.systemNodes.get(functionName);
                if (node) {
                    node.position.copy(positions[index]);
                }
                index++;
            }
        });
    }
    
    createSystemConnections() {
        this.functionRegistry.forEach((functionData, functionName) => {
            functionData.dependencies.forEach(dependencyName => {
                const sourceNode = this.systemNodes.get(functionName);
                const targetNode = this.systemNodes.get(dependencyName);
                
                if (sourceNode && targetNode) {
                    const connection = this.createConnectionLine(sourceNode, targetNode);
                    const connectionId = `${functionName}-${dependencyName}`;
                    this.connectionLines.set(connectionId, connection);
                    this.matrixContainer.add(connection);
                }
            });
        });
    }
    
    createConnectionLine(sourceNode, targetNode) {
        const points = [
            sourceNode.position,
            targetNode.position
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.6
        });
        
        return new THREE.Line(geometry, material);
    }
    
    createDataFlowParticles() {
        this.connectionLines.forEach((connection, connectionId) => {
            const particleSystem = this.createParticleSystem(connection);
            this.dataFlowParticles.set(connectionId, particleSystem);
            this.matrixContainer.add(particleSystem);
        });
    }
    
    createParticleSystem(connection) {
        const particleCount = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0x00ff00,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });
        
        return new THREE.Points(geometry, material);
    }
    
    triggerButterflyEffect(sourceFunction, changeType = 'modification') {
        if (!this.matrixState.isActive) return;
        
        const wave = {
            id: Date.now(),
            source: sourceFunction,
            type: changeType,
            timestamp: this.mathematicalEngine.clock.getElapsedTime(),
            affectedSystems: new Set([sourceFunction]),
            propagationLevel: 0,
            intensity: this.mathematicalEngine.ALPHA
        };
        
        this.changePropagation.activeChanges.add(wave.id);
        this.changePropagation.propagationWaves.set(wave.id, wave);
        
        // Start propagation
        this.propagateChange(wave);
        
        return wave;
    }
    
    propagateChange(wave) {
        if (wave.propagationLevel >= this.matrixState.recursionDepth) return;
        
        const sourceData = this.functionRegistry.get(wave.source);
        if (!sourceData) return;
        
        // Propagate to dependencies
        sourceData.dependencies.forEach(dependencyName => {
            if (!wave.affectedSystems.has(dependencyName)) {
                this.propagateToSystem(wave, dependencyName);
            }
        });
        
        // Propagate to recursive calls
        sourceData.recursiveCalls.forEach(recursiveCall => {
            if (!wave.affectedSystems.has(recursiveCall)) {
                this.propagateToSystem(wave, recursiveCall);
            }
        });
        
        // Schedule next propagation level
        setTimeout(() => {
            if (this.changePropagation.activeChanges.has(wave.id)) {
                wave.propagationLevel++;
                this.propagateChange(wave);
            }
        }, this.calculatePropagationDelay(wave.source, wave.propagationLevel));
    }
    
    propagateToSystem(wave, systemName) {
        wave.affectedSystems.add(systemName);
        this.changePropagation.affectedSystems.add(systemName);
        
        // Visual feedback
        const node = this.systemNodes.get(systemName);
        if (node) {
            // Pulse effect
            const originalScale = node.scale.clone();
            node.scale.multiplyScalar(1.5);
            setTimeout(() => {
                node.scale.copy(originalScale);
            }, 500);
        }
        
        // Update change history
        const systemData = this.functionRegistry.get(systemName);
        if (systemData) {
            systemData.changeHistory.push({
                timestamp: wave.timestamp,
                type: wave.type,
                source: wave.source,
                intensity: wave.intensity
            });
            systemData.lastModified = wave.timestamp;
        }
    }
    
    calculatePropagationDelay(source, level) {
        const baseDelay = 1000; // 1 second
        const levelMultiplier = Math.pow(2, level);
        const sensitivityFactor = this.mathematicalEngine.ALPHA;
        return baseDelay * levelMultiplier * sensitivityFactor;
    }
    
    updateButterflyEffectVisualization() {
        this.changePropagation.propagationWaves.forEach((wave, waveId) => {
            if (this.changePropagation.activeChanges.has(waveId)) {
                // Update wave visualization
                wave.affectedSystems.forEach(systemName => {
                    const node = this.systemNodes.get(systemName);
                    if (node) {
                        const timeSinceStart = this.mathematicalEngine.clock.getElapsedTime() - wave.timestamp;
                        const pulseIntensity = Math.sin(timeSinceStart * 5) * 0.5 + 0.5;
                        node.material.emissiveIntensity = pulseIntensity * wave.intensity;
                    }
                });
            } else {
                // Remove completed waves
                this.changePropagation.propagationWaves.delete(waveId);
            }
        });
    }
    
    isSystemAffected(systemName) {
        return this.changePropagation.affectedSystems.has(systemName);
    }
    
    switchPerspective(perspectiveName) {
        if (!this.perspectiveMappings.has(perspectiveName)) return;
        
        const perspective = this.perspectiveMappings.get(perspectiveName);
        this.matrixState.visualizationMode = 'perspective-shift';
        this.matrixState.perspectiveCount++;
        
        // Reorganize nodes based on perspective
        this.reorganizeNodesByPerspective(perspective);
        
        // Update colors based on perspective
        this.updatePerspectiveColors(perspective);
    }
    
    reorganizeNodesByPerspective(perspective) {
        const prioritySystems = perspective.priority;
        
        prioritySystems.forEach((systemName, index) => {
            const node = this.systemNodes.get(systemName);
            if (node) {
                const targetPosition = new THREE.Vector3(
                    (index - prioritySystems.length / 2) * 3,
                    0,
                    0
                );
                
                // Animate to new position
                const originalPosition = node.position.clone();
                const duration = 1000;
                const startTime = Date.now();
                
                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    node.position.lerpVectors(originalPosition, targetPosition, progress);
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    }
                };
                
                animate();
            }
        });
    }
    
    updatePerspectiveColors(perspective) {
        this.systemNodes.forEach((node, systemName) => {
            const systemData = this.functionRegistry.get(systemName);
            if (systemData && systemData.perspectiveViews.includes(perspective.name.toLowerCase().split(' ')[0])) {
                node.children[0].material.color.setHex(perspective.color);
            }
        });
    }
    
    update(deltaTime) {
        if (!this.matrixState.isActive) return;
        
        // Update data flow particles
        this.updateDataFlowParticles(deltaTime);
        
        // Update node animations
        this.updateNodeAnimations(deltaTime);
        
        // Update connection animations
        this.updateConnectionAnimations(deltaTime);
        
        // Update butterfly effect visualization
        this.updateButterflyEffectVisualization();
    }
    
    updateDataFlowParticles(deltaTime) {
        this.dataFlowParticles.forEach((particleSystem, connectionId) => {
            const positions = particleSystem.geometry.attributes.position.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                // Move particles along connection lines
                positions[i] += Math.sin(Date.now() * 0.001 + i) * deltaTime * 2;
                positions[i + 1] += Math.cos(Date.now() * 0.001 + i) * deltaTime * 2;
                positions[i + 2] += Math.sin(Date.now() * 0.002 + i) * deltaTime * 2;
            }
            
            particleSystem.geometry.attributes.position.needsUpdate = true;
        });
    }
    
    updateNodeAnimations(deltaTime) {
        const time = Date.now() * 0.001;
        
        this.systemNodes.forEach((node, systemName) => {
            // Gentle floating animation
            const float = Math.sin(time * 0.5 + node.position.x) * 0.3;
            node.position.y += float * deltaTime;
            
            // Rotation based on system activity
            node.rotation.y += deltaTime * 0.5;
        });
    }
    
    updateConnectionAnimations(deltaTime) {
        const time = Date.now() * 0.001;
        
        this.connectionLines.forEach((connection, connectionId) => {
            const opacity = 0.4 + Math.sin(time * 2 + connection.position.x) * 0.3;
            connection.material.opacity = Math.max(0.1, opacity);
        });
    }
    
    clearMatrixVisualization() {
        // Remove all existing visualization elements
        this.systemNodes.forEach(node => {
            this.matrixContainer.remove(node);
        });
        
        this.connectionLines.forEach(connection => {
            this.matrixContainer.remove(connection);
        });
        
        this.dataFlowParticles.forEach(particleSystem => {
            this.matrixContainer.remove(particleSystem);
        });
        
        this.systemNodes.clear();
        this.connectionLines.clear();
        this.dataFlowParticles.clear();
    }
    
    toggleMatrix() {
        if (this.matrixState.isActive) {
            this.clearMatrixVisualization();
            this.matrixState.isActive = false;
        } else {
            this.createMatrixVisualization();
        }
    }
    
    getMatrixStatistics() {
        return {
            activeFunctions: this.systemNodes.size,
            activeConnections: this.connectionLines.size,
            activeChanges: this.changePropagation.activeChanges.size,
            propagationWaves: this.changePropagation.propagationWaves.size
        };
    }
} 