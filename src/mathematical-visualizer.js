// Mathematical Visualizer - Real-time visualization of mathematical effects
// Shows fractal patterns, quantum states, complex number relationships, and fine structure constant effects

class MathematicalVisualizer {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        
        // Visualization objects with mathematical integration
        this.fractalParticles = [];
        this.quantumIndicators = [];
        this.complexNumberLines = [];
        this.fineStructureEffects = [];
        this.mathematicalConstants = [];
        
        // Advanced mathematical features with enhanced integration
        this.entanglementLines = [];
        this.mathematicalParticles = [];
        this.enhancedFractals = [];
        this.mathematicalWaves = [];
        this.quantumEntanglementVisualization = [];
        this.mathematicalParticleSystems = [];
        this.enhancedFractalEffects = [];
        this.mathematicalWaveFunctions = [];
        
        // Visualization settings with mathematical integration
        this.showFractals = true;
        this.showQuantumStates = true;
        this.showComplexNumbers = true;
        this.showFineStructure = true;
        this.showConstants = true;
        this.showEntanglement = true;
        this.showMathematicalParticles = true;
        this.showEnhancedFractals = true;
        this.showMathematicalWaves = true;
        this.showQuantumEntanglement = true;
        this.showMathematicalParticleSystems = true;
        this.showEnhancedFractalEffects = true;
        this.showMathematicalWaveFunctions = true;
        
        // Mathematical constants with enhanced precision
        this.ALPHA = 1 / 137.035999084; // Fine structure constant
        this.SQRT_POINT_ONE = Math.sqrt(0.1);
        this.SQRT_TEN = Math.sqrt(10);
        this.SQRT_MINUS_ONE = null; // Will be initialized when THREE.js is available
        
        // Mathematical integration system
        this.mathematicalIntegration = {
            alphaInfluence: this.ALPHA,
            sqrtTenInfluence: this.SQRT_TEN,
            sqrtPointOneInfluence: this.SQRT_POINT_ONE,
            complexInfluence: 0,
            fractalInfluence: 0,
            quantumInfluence: 0
        };
        
        // THREE.js reference
        this.THREE = null;
        
        // Initialize visualizations if THREE.js is available
        if (typeof THREE !== 'undefined') {
            this.initializeTHREE(THREE);
        }
    }
    
    // Initialize THREE.js reference when available
    initializeTHREE(THREE) {
        this.THREE = THREE;
        this.SQRT_MINUS_ONE = new this.THREE.Vector2(0, 1); // √(-1) = i
        this.initializeVisualizations();
    }
    
    initializeVisualizations() {
        this.createFractalParticles();
        this.createQuantumIndicators();
        this.createComplexNumberLines();
        this.createFineStructureEffects();
        this.createMathematicalConstants();
        
        // Create advanced mathematical features with enhanced integration
        this.createEntanglementVisualization();
        this.createMathematicalParticles();
        this.createEnhancedFractals();
        this.createMathematicalWaves();
        this.createQuantumEntanglementVisualization();
        this.createMathematicalParticleSystems();
        this.createEnhancedFractalEffects();
        this.createMathematicalWaveFunctions();
    }
    
    createFractalParticles() {
        // Create particles that follow fractal patterns with mathematical integration
        const particleCount = 137; // Fine structure constant reference
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new this.THREE.SphereGeometry(0.05 * this.ALPHA, 8, 8);
            const material = new this.THREE.MeshBasicMaterial({
                color: new this.THREE.Color().setHSL(i / particleCount, 1, 0.5),
                transparent: true,
                opacity: 0.7 * this.ALPHA
            });
            
            const particle = new this.THREE.Mesh(geometry, material);
            
            // Initialize with complex number position and mathematical integration
            const angle = (i / particleCount) * 2 * Math.PI;
            const radius = 10 + Math.sin(angle * this.ALPHA * 137) * 5 * this.SQRT_TEN;
            
            particle.position.set(
                Math.cos(angle) * radius * this.ALPHA,
                Math.sin(angle * this.ALPHA) * 2 * this.SQRT_POINT_ONE,
                Math.sin(angle) * radius * this.ALPHA
            );
            
            particle.velocity = new this.THREE.Vector3(
                Math.sin(angle) * 0.1 * this.ALPHA,
                Math.cos(angle * this.ALPHA) * 0.1 * this.SQRT_TEN,
                Math.cos(angle) * 0.1 * this.ALPHA
            );
            
            particle.originalPosition = particle.position.clone();
            particle.angle = angle;
            particle.index = i;
            particle.mathematicalInfluence = this.ALPHA;
            
            this.fractalParticles.push(particle);
            this.scene.add(particle);
        }
    }
    
    createQuantumIndicators() {
        // Create visual indicators for quantum states with mathematical integration
        const indicatorCount = 10;
        
        for (let i = 0; i < indicatorCount; i++) {
            const geometry = new this.THREE.BoxGeometry(0.2 * this.ALPHA, 0.2 * this.SQRT_TEN, 0.2 * this.ALPHA);
            const material = new this.THREE.MeshBasicMaterial({
                color: 0x00FFFF,
                transparent: true,
                opacity: 0.6 * this.ALPHA,
                wireframe: true
            });
            
            const indicator = new this.THREE.Mesh(geometry, material);
            
            // Position in a quantum-inspired pattern with mathematical integration
            const angle = (i / indicatorCount) * 2 * Math.PI;
            const radius = 15 + Math.sin(angle * this.ALPHA * 137) * 3 * this.SQRT_TEN;
            
            indicator.position.set(
                Math.cos(angle) * radius * this.ALPHA,
                5 + Math.sin(angle * this.ALPHA) * 2 * this.SQRT_POINT_ONE,
                Math.sin(angle) * radius * this.ALPHA
            );
            
            indicator.rotation.set(
                angle * this.ALPHA,
                angle * this.ALPHA * 2 * this.SQRT_TEN,
                angle * this.ALPHA * 3 * this.ALPHA
            );
            
            indicator.originalPosition = indicator.position.clone();
            indicator.originalRotation = indicator.rotation.clone();
            indicator.angle = angle;
            indicator.index = i;
            indicator.mathematicalInfluence = this.SQRT_POINT_ONE;
            
            this.quantumIndicators.push(indicator);
            this.scene.add(indicator);
        }
    }
    
    createComplexNumberLines() {
        // Create lines representing complex number relationships with mathematical integration
        const lineCount = 20;
        
        for (let i = 0; i < lineCount; i++) {
            const geometry = new this.THREE.BufferGeometry();
            const material = new this.THREE.LineBasicMaterial({
                color: new this.THREE.Color().setHSL(i / lineCount, 1, 0.6),
                transparent: true,
                opacity: 0.5 * this.ALPHA
            });
            
            // Create complex number line with mathematical integration
            const points = [];
            const segments = 50;
            
            for (let j = 0; j <= segments; j++) {
                const t = j / segments;
                const angle = t * 2 * Math.PI * this.ALPHA * 137;
                const radius = 8 + Math.sin(angle * (i + 1)) * 3 * this.SQRT_TEN;
                
                points.push(new this.THREE.Vector3(
                    Math.cos(angle) * radius * this.ALPHA,
                    Math.sin(angle * this.ALPHA) * 2 * this.SQRT_POINT_ONE,
                    Math.sin(angle) * radius * this.ALPHA
                ));
            }
            
            geometry.setFromPoints(points);
            const line = new this.THREE.Line(geometry, material);
            
            line.originalPoints = points.map(p => p.clone());
            line.index = i;
            line.mathematicalInfluence = this.ALPHA;
            
            this.complexNumberLines.push(line);
            this.scene.add(line);
        }
    }
    
    createFineStructureEffects() {
        // Create visual effects based on fine structure constant with mathematical integration
        const effectCount = 15;
        
        for (let i = 0; i < effectCount; i++) {
            const geometry = new this.THREE.TorusGeometry(0.5 * this.ALPHA, 0.1 * this.SQRT_TEN, 8, 16);
            const material = new this.THREE.MeshBasicMaterial({
                color: 0xFFD700,
                transparent: true,
                opacity: 0.4 * this.ALPHA,
                wireframe: true
            });
            
            const effect = new this.THREE.Mesh(geometry, material);
            
            // Position in fine structure pattern with mathematical integration
            const angle = (i / effectCount) * 2 * Math.PI;
            const radius = 12 + Math.sin(angle * this.ALPHA * 137) * 4 * this.SQRT_TEN;
            
            effect.position.set(
                Math.cos(angle) * radius * this.ALPHA,
                3 + Math.sin(angle * this.ALPHA) * 1.5 * this.SQRT_POINT_ONE,
                Math.sin(angle) * radius * this.ALPHA
            );
            
            effect.rotation.set(
                angle * this.ALPHA,
                angle * this.ALPHA * 2 * this.SQRT_TEN,
                angle * this.ALPHA * 3 * this.ALPHA
            );
            
            effect.originalPosition = effect.position.clone();
            effect.originalRotation = effect.rotation.clone();
            effect.angle = angle;
            effect.index = i;
            effect.mathematicalInfluence = this.SQRT_TEN;
            
            this.fineStructureEffects.push(effect);
            this.scene.add(effect);
        }
    }
    
    createMathematicalConstants() {
        // Create visual representations of mathematical constants
        const constants = [
            { name: 'α', value: this.ALPHA, color: 0xFF0000 },
            { name: '√(-1)', value: 1, color: 0x00FF00 },
            { name: '√(0.1)', value: this.SQRT_POINT_ONE, color: 0x0000FF },
            { name: '√(10)', value: this.SQRT_TEN, color: 0xFFFF00 },
            { name: '137', value: 137, color: 0xFF00FF }
        ];
        
        constants.forEach((constant, index) => {
            const geometry = new this.THREE.OctahedronGeometry(0.3);
            const material = new this.THREE.MeshBasicMaterial({
                color: constant.color,
                transparent: true,
                opacity: 0.8
            });
            
            const constantMesh = new this.THREE.Mesh(geometry, material);
            
            // Position in a mathematical pattern
            const angle = (index / constants.length) * 2 * Math.PI;
            const radius = 18;
            
            constantMesh.position.set(
                Math.cos(angle) * radius,
                8,
                Math.sin(angle) * radius
            );
            
            constantMesh.constant = constant;
            constantMesh.originalPosition = constantMesh.position.clone();
            constantMesh.angle = angle;
            
            this.mathematicalConstants.push(constantMesh);
            this.scene.add(constantMesh);
        });
    }
    
    createEntanglementVisualization() {
        // Create quantum entanglement visualization lines
        const entanglementCount = 5;
        
        for (let i = 0; i < entanglementCount; i++) {
            const geometry = new this.THREE.BufferGeometry();
            const material = new this.THREE.LineBasicMaterial({
                color: 0x00FFFF,
                transparent: true,
                opacity: 0.6,
                linewidth: 2
            });
            
            // Create entanglement line with quantum phase
            const points = [];
            const segments = 20;
            for (let j = 0; j <= segments; j++) {
                const t = j / segments;
                const phase = (i / entanglementCount) * 2 * Math.PI + t * Math.PI;
                const amplitude = Math.sin(phase * this.ALPHA * 137) * 3;
                
                points.push(new this.THREE.Vector3(
                    Math.sin(phase) * amplitude * 5,
                    Math.cos(phase) * amplitude * 3,
                    Math.sin(phase * 2) * amplitude * 2
                ));
            }
            
            geometry.setFromPoints(points);
            const line = new this.THREE.Line(geometry, material);
            line.originalPoints = points.map(p => p.clone());
            line.index = i;
            
            this.entanglementLines.push(line);
            this.scene.add(line);
        }
    }
    
    createMathematicalParticles() {
        // Create mathematical particle system
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new this.THREE.SphereGeometry(0.1, 8, 8);
            const material = new this.THREE.MeshBasicMaterial({
                color: new this.THREE.Color().setHSL(i / particleCount, 1, 0.5),
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new this.THREE.Mesh(geometry, material);
            
            // Initialize with mathematical position
            const angle = (i / particleCount) * 2 * Math.PI * this.ALPHA * 137;
            const radius = 10 + Math.sin(angle * this.ALPHA) * 5;
            
            particle.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle * this.ALPHA) * 3,
                Math.sin(angle) * radius
            );
            
            particle.velocity = new this.THREE.Vector3(
                Math.sin(angle) * 0.2,
                Math.cos(angle * this.ALPHA) * 0.2,
                Math.cos(angle) * 0.2
            );
            
            particle.originalPosition = particle.position.clone();
            particle.angle = angle;
            particle.index = i;
            particle.mathematicalPhase = 0;
            
            this.mathematicalParticles.push(particle);
            this.scene.add(particle);
        }
    }
    
    createEnhancedFractals() {
        // Create enhanced fractal effects
        const iterations = 20;
        
        for (let i = 0; i < iterations; i++) {
            const geometry = new this.THREE.IcosahedronGeometry(0.5, 1);
            const material = new this.THREE.MeshBasicMaterial({
                color: new this.THREE.Color().setHSL(i / iterations, 1, 0.6),
                transparent: true,
                opacity: 0.7,
                wireframe: true
            });
            
            const fractal = new this.THREE.Mesh(geometry, material);
            
            // Position using enhanced fractal algorithm
            const complexPos = new this.THREE.Vector2(
                Math.cos(i * this.ALPHA * 137) * 15,
                Math.sin(i * this.ALPHA * 137) * 15
            );
            
            const fractalResult = this.fractalRoot(complexPos, 10);
            const escapeFactor = fractalResult.escaped ? fractalResult.escapeVelocity / 4.0 : 1;
            
            fractal.position.set(
                complexPos.x * escapeFactor,
                Math.sin(i * this.ALPHA) * 5 * escapeFactor,
                complexPos.y * escapeFactor
            );
            
            fractal.originalPosition = fractal.position.clone();
            fractal.fractalData = fractalResult;
            fractal.index = i;
            fractal.rotationSpeed = this.ALPHA * (i + 1);
            
            this.enhancedFractals.push(fractal);
            this.scene.add(fractal);
        }
    }
    
    createMathematicalWaves() {
        // Create mathematical wave functions
        const waveCount = 8;
        
        for (let i = 0; i < waveCount; i++) {
            const geometry = new this.THREE.PlaneGeometry(20, 20, 32, 32);
            const material = new this.THREE.MeshBasicMaterial({
                color: new this.THREE.Color().setHSL(i / waveCount, 1, 0.5),
                transparent: true,
                opacity: 0.3,
                wireframe: true,
                side: this.THREE.DoubleSide
            });
            
            const wave = new this.THREE.Mesh(geometry, material);
            
            // Position waves in mathematical pattern
            const angle = (i / waveCount) * 2 * Math.PI;
            const radius = 25;
            
            wave.position.set(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
            
            wave.rotation.x = Math.PI / 2;
            wave.rotation.y = angle;
            
            wave.originalPosition = wave.position.clone();
            wave.originalRotation = wave.rotation.clone();
            wave.index = i;
            wave.frequency = this.ALPHA * (i + 1) * 137;
            wave.amplitude = 2 + Math.sin(angle * this.ALPHA) * 1;
            
            this.mathematicalWaves.push(wave);
            this.scene.add(wave);
        }
    }
    
    // Create quantum entanglement visualization with mathematical integration
    createQuantumEntanglementVisualization() {
        const entanglementCount = 8;
        
        for (let i = 0; i < entanglementCount; i++) {
            const geometry = new this.THREE.SphereGeometry(0.1 * this.ALPHA, 12, 12);
            const material = new this.THREE.MeshBasicMaterial({
                color: 0xFF00FF,
                transparent: true,
                opacity: 0.8 * this.ALPHA,
                wireframe: true
            });
            
            const entanglement = new this.THREE.Mesh(geometry, material);
            
            const angle = (i / entanglementCount) * 2 * Math.PI;
            const radius = 18 + Math.sin(angle * this.ALPHA * 137) * 6 * this.SQRT_TEN;
            
            entanglement.position.set(
                Math.cos(angle) * radius * this.ALPHA,
                8 + Math.sin(angle * this.ALPHA) * 3 * this.SQRT_POINT_ONE,
                Math.sin(angle) * radius * this.ALPHA
            );
            
            entanglement.originalPosition = entanglement.position.clone();
            entanglement.angle = angle;
            entanglement.index = i;
            entanglement.mathematicalInfluence = this.ALPHA;
            
            this.quantumEntanglementVisualization.push(entanglement);
            this.scene.add(entanglement);
        }
    }
    
    // Create mathematical particle systems with mathematical integration
    createMathematicalParticleSystems() {
        const systemCount = 5;
        
        for (let i = 0; i < systemCount; i++) {
            const particles = [];
            const particleCount = 20;
            
            for (let j = 0; j < particleCount; j++) {
                const geometry = new this.THREE.SphereGeometry(0.02 * this.ALPHA, 6, 6);
                const material = new this.THREE.MeshBasicMaterial({
                    color: new this.THREE.Color().setHSL(j / particleCount, 1, 0.7),
                    transparent: true,
                    opacity: 0.6 * this.ALPHA
                });
                
                const particle = new this.THREE.Mesh(geometry, material);
                
                const angle = (j / particleCount) * 2 * Math.PI;
                const radius = 2 + Math.sin(angle * this.ALPHA * 137) * 1 * this.SQRT_TEN;
                
                particle.position.set(
                    Math.cos(angle) * radius * this.ALPHA,
                    Math.sin(angle * this.ALPHA) * 0.5 * this.SQRT_POINT_ONE,
                    Math.sin(angle) * radius * this.ALPHA
                );
                
                particle.originalPosition = particle.position.clone();
                particle.angle = angle;
                particle.mathematicalInfluence = this.SQRT_TEN;
                
                particles.push(particle);
                this.scene.add(particle);
            }
            
            this.mathematicalParticleSystems.push({
                particles: particles,
                center: new this.THREE.Vector3(
                    (i - systemCount / 2) * 8 * this.ALPHA,
                    10 + Math.sin(i * this.ALPHA) * 2 * this.SQRT_POINT_ONE,
                    0
                ),
                index: i,
                mathematicalInfluence: this.ALPHA
            });
        }
    }
    
    // Create enhanced fractal effects with mathematical integration
    createEnhancedFractalEffects() {
        const fractalCount = 12;
        
        for (let i = 0; i < fractalCount; i++) {
            const geometry = new this.THREE.IcosahedronGeometry(0.3 * this.ALPHA, 1);
            const material = new this.THREE.MeshBasicMaterial({
                color: 0x00FF00,
                transparent: true,
                opacity: 0.5 * this.ALPHA,
                wireframe: true
            });
            
            const fractal = new this.THREE.Mesh(geometry, material);
            
            const angle = (i / fractalCount) * 2 * Math.PI;
            const radius = 20 + Math.sin(angle * this.ALPHA * 137) * 8 * this.SQRT_TEN;
            
            fractal.position.set(
                Math.cos(angle) * radius * this.ALPHA,
                12 + Math.sin(angle * this.ALPHA) * 4 * this.SQRT_POINT_ONE,
                Math.sin(angle) * radius * this.ALPHA
            );
            
            fractal.originalPosition = fractal.position.clone();
            fractal.angle = angle;
            fractal.index = i;
            fractal.mathematicalInfluence = this.SQRT_TEN;
            
            this.enhancedFractalEffects.push(fractal);
            this.scene.add(fractal);
        }
    }
    
    // Create mathematical wave functions with mathematical integration
    createMathematicalWaveFunctions() {
        const waveCount = 6;
        
        for (let i = 0; i < waveCount; i++) {
            const geometry = new this.THREE.BufferGeometry();
            const material = new this.THREE.LineBasicMaterial({
                color: 0xFFFF00,
                transparent: true,
                opacity: 0.7 * this.ALPHA
            });
            
            const points = [];
            const segments = 100;
            
            for (let j = 0; j <= segments; j++) {
                const t = j / segments;
                const x = (t - 0.5) * 20 * this.ALPHA;
                const y = Math.sin(t * 2 * Math.PI * this.ALPHA * 137 * (i + 1)) * 3 * this.SQRT_TEN;
                const z = Math.cos(t * 2 * Math.PI * this.ALPHA * 137 * (i + 1)) * 3 * this.SQRT_POINT_ONE;
                
                points.push(new this.THREE.Vector3(x, y, z));
            }
            
            geometry.setFromPoints(points);
            const wave = new this.THREE.Line(geometry, material);
            
            wave.originalPoints = points.map(p => p.clone());
            wave.index = i;
            wave.mathematicalInfluence = this.ALPHA;
            
            this.mathematicalWaveFunctions.push(wave);
            this.scene.add(wave);
        }
    }
    
    updateFractalParticles(deltaTime) {
        for (const particle of this.fractalParticles) {
            // Apply fractal rooting to particle movement
            const complexPos = new this.THREE.Vector2(particle.position.x, particle.position.z);
            const fractalResult = this.fractalRoot(complexPos, 5);
            
            if (fractalResult.escaped) {
                const escapeFactor = fractalResult.escapeVelocity / 4.0;
                particle.position.x += particle.velocity.x * escapeFactor * deltaTime;
                particle.position.y += particle.velocity.y * escapeFactor * deltaTime;
                particle.position.z += particle.velocity.z * escapeFactor * deltaTime;
            } else {
                // Return to original position with mathematical oscillation
                const targetPos = particle.originalPosition.clone();
                const currentPos = particle.position;
                
                particle.position.lerp(targetPos, deltaTime * this.ALPHA);
            }
            
            // Update color based on fractal iterations
            const hue = (fractalResult.iterations / 137) % 1;
            particle.material.color.setHSL(hue, 1, 0.5);
            
            // Apply quantum uncertainty
            const uncertainty = this.ALPHA * Math.random() * 0.1;
            particle.position.add(new this.THREE.Vector3(
                (Math.random() - 0.5) * uncertainty,
                (Math.random() - 0.5) * uncertainty,
                (Math.random() - 0.5) * uncertainty
            ));
        }
    }
    
    updateQuantumIndicators(deltaTime) {
        for (const indicator of this.quantumIndicators) {
            // Apply quantum superposition effects
            const superposition = Math.sin(deltaTime * this.ALPHA * 137 + indicator.angle);
            
            // Oscillate position
            indicator.position.y = indicator.originalPosition.y + superposition * 2;
            
            // Rotate based on quantum phase
            indicator.rotation.x += deltaTime * this.ALPHA * 137;
            indicator.rotation.y += deltaTime * this.ALPHA * 137 * 2;
            indicator.rotation.z += deltaTime * this.ALPHA * 137 * 3;
            
            // Update opacity based on quantum amplitude
            indicator.material.opacity = 0.3 + Math.abs(superposition) * 0.4;
            
            // Apply quantum tunneling effect
            if (Math.random() < this.ALPHA * 0.01) {
                const tunnelDistance = this.ALPHA * 3;
                indicator.position.add(new this.THREE.Vector3(
                    (Math.random() - 0.5) * tunnelDistance,
                    (Math.random() - 0.5) * tunnelDistance,
                    (Math.random() - 0.5) * tunnelDistance
                ));
            }
        }
    }
    
    updateComplexNumberLines(deltaTime) {
        for (const line of this.complexNumberLines) {
            const points = line.geometry.attributes.position.array;
            const originalPoints = line.originalPoints;
            
            // Update line points based on complex number transformations
            for (let i = 0; i < originalPoints.length; i++) {
                const originalPoint = originalPoints[i];
                const index = i * 3;
                
                // Apply complex number transformation
                const complexPoint = new this.THREE.Vector2(originalPoint.x, originalPoint.z);
                const transformed = this.complexMultiply(complexPoint, this.SQRT_MINUS_ONE);
                
                // Add mathematical oscillation
                const oscillation = Math.sin(deltaTime * this.ALPHA * 137 + i * 0.1);
                
                points[index] = transformed.x + oscillation * 0.5;
                points[index + 1] = originalPoint.y + Math.sin(deltaTime * this.ALPHA + i * 0.1) * 0.3;
                points[index + 2] = transformed.y + oscillation * 0.5;
            }
            
            line.geometry.attributes.position.needsUpdate = true;
            
            // Update color based on complex number magnitude
            const magnitude = Math.sqrt(
                Math.pow(points[0], 2) + Math.pow(points[2], 2)
            );
            const hue = (magnitude / 10) % 1;
            line.material.color.setHSL(hue, 1, 0.6);
        }
    }
    
    updateFineStructureEffects(deltaTime) {
        for (const effect of this.fineStructureEffects) {
            // Apply fine structure constant effects
            const fineStructureEffect = this.ALPHA * Math.sin(deltaTime * 137 + effect.angle);
            
            // Oscillate position
            effect.position.y = effect.originalPosition.y + fineStructureEffect * 2;
            
            // Rotate based on fine structure constant
            effect.rotation.x += deltaTime * this.ALPHA * 137;
            effect.rotation.y += deltaTime * this.ALPHA * 137 * 1.5;
            effect.rotation.z += deltaTime * this.ALPHA * 137 * 2;
            
            // Scale based on fine structure effect
            const scale = 1 + fineStructureEffect * 0.3;
            effect.scale.set(scale, scale, scale);
            
            // Update opacity
            effect.material.opacity = 0.2 + Math.abs(fineStructureEffect) * 0.3;
        }
    }
    
    updateMathematicalConstants(deltaTime) {
        for (const constant of this.mathematicalConstants) {
            // Rotate constants
            constant.rotation.x += deltaTime * this.ALPHA;
            constant.rotation.y += deltaTime * this.ALPHA * 2;
            constant.rotation.z += deltaTime * this.ALPHA * 3;
            
            // Oscillate position based on constant value
            const oscillation = Math.sin(deltaTime * this.ALPHA * constant.constant.value);
            constant.position.y = constant.originalPosition.y + oscillation * 0.5;
            
            // Scale based on constant value
            const scale = 1 + (constant.constant.value / 137) * 0.5;
            constant.scale.set(scale, scale, scale);
            
            // Update color intensity
            const intensity = 0.5 + Math.abs(oscillation) * 0.5;
            constant.material.color.setHex(constant.constant.color);
            constant.material.opacity = intensity;
        }
    }
    
    updateEntanglementVisualization(deltaTime) {
        for (const line of this.entanglementLines) {
            const points = line.geometry.attributes.position.array;
            const originalPoints = line.originalPoints;
            
            // Update line points based on quantum phase
            for (let i = 0; i < originalPoints.length; i++) {
                const originalPoint = originalPoints[i];
                const index = i * 3;
                const t = i / (originalPoints.length - 1);
                
                // Apply quantum phase evolution
                const phase = deltaTime * this.ALPHA * 137 * (1 + t);
                const amplitude = Math.sin(phase) * 0.5;
                
                points[index] = originalPoint.x + amplitude * Math.sin(phase);
                points[index + 1] = originalPoint.y + amplitude * Math.cos(phase);
                points[index + 2] = originalPoint.z + amplitude * Math.sin(phase * 2);
            }
            
            line.geometry.attributes.position.needsUpdate = true;
            
            // Update color based on entanglement strength
            const entanglementStrength = Math.abs(Math.sin(deltaTime * this.ALPHA * 137));
            line.material.opacity = 0.3 + entanglementStrength * 0.4;
        }
    }
    
    updateMathematicalParticles(deltaTime) {
        for (const particle of this.mathematicalParticles) {
            // Apply quantum effects
            particle.mathematicalPhase += deltaTime * this.ALPHA * 137;
            
            // Update position using mathematical transformations
            const complexPos = new this.THREE.Vector2(particle.position.x, particle.position.z);
            const transformed = this.applyMathematicalTransform(complexPos, 'quantum');
            
            particle.position.x = transformed.x;
            particle.position.z = transformed.y;
            particle.position.y += Math.sin(particle.mathematicalPhase) * 0.1;
            
            // Update color based on mathematical phase
            const hue = (particle.mathematicalPhase / (2 * Math.PI)) % 1;
            particle.material.color.setHSL(hue, 1, 0.5);
            
            // Apply quantum uncertainty
            const uncertainty = this.ALPHA * Math.random() * 0.2;
            particle.position.add(new this.THREE.Vector3(
                (Math.random() - 0.5) * uncertainty,
                (Math.random() - 0.5) * uncertainty,
                (Math.random() - 0.5) * uncertainty
            ));
        }
    }
    
    updateEnhancedFractals(deltaTime) {
        for (const fractal of this.enhancedFractals) {
            // Rotate based on fractal data
            fractal.rotation.x += deltaTime * fractal.rotationSpeed;
            fractal.rotation.y += deltaTime * fractal.rotationSpeed * 1.5;
            fractal.rotation.z += deltaTime * fractal.rotationSpeed * 2;
            
            // Scale based on escape velocity
            const scale = 1 + (fractal.fractalData.escapeVelocity / 10) * Math.sin(deltaTime * this.ALPHA * 137);
            fractal.scale.set(scale, scale, scale);
            
            // Update opacity based on iterations
            const opacity = 0.3 + (fractal.fractalData.iterations / 137) * 0.4;
            fractal.material.opacity = opacity;
            
            // Oscillate position
            const oscillation = Math.sin(deltaTime * this.ALPHA * 137 + fractal.index);
            fractal.position.y = fractal.originalPosition.y + oscillation * 2;
        }
    }
    
    updateMathematicalWaves(deltaTime) {
        for (const wave of this.mathematicalWaves) {
            // Update wave geometry based on mathematical wave function
            const positions = wave.geometry.attributes.position.array;
            const time = deltaTime * wave.frequency;
            
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const z = positions[i + 2];
                
                // Apply wave function
                const waveFunction = Math.sin(x * this.ALPHA + time) * 
                                   Math.cos(z * this.ALPHA + time) * 
                                   wave.amplitude;
                
                positions[i + 1] = waveFunction;
            }
            
            wave.geometry.attributes.position.needsUpdate = true;
            
            // Rotate wave
            wave.rotation.y += deltaTime * this.ALPHA * 137;
            
            // Update color based on wave amplitude
            const hue = (Math.sin(time) + 1) / 2;
            wave.material.color.setHSL(hue, 1, 0.5);
        }
    }
    
    // Helper method for mathematical transformations
    applyMathematicalTransform(position, transformType = 'quantum') {
        switch (transformType) {
            case 'quantum':
                // Apply quantum superposition effects to position
                const superposition = Math.sin(this.ALPHA * position.length * 137);
                return new this.THREE.Vector2(
                    position.x + superposition * 0.1,
                    position.y + superposition * 0.1
                );
            default:
                return position;
        }
    }
    
    // Complex number operations
    complexMultiply(a, b) {
        return new this.THREE.Vector2(
            a.x * b.x - a.y * b.y,
            a.x * b.y + a.y * b.x
        );
    }
    
    // Fractal rooting system
    fractalRoot(complexNumber, iterations = 137) {
        const z = new this.THREE.Vector2(complexNumber.x, complexNumber.y);
        const c = new this.THREE.Vector2(complexNumber.x, complexNumber.y);
        
        for (let i = 0; i < iterations; i++) {
            const x2 = z.x * z.x - z.y * z.y;
            const y2 = 2 * z.x * z.y;
            z.x = x2 + c.x;
            z.y = y2 + c.y;
            
            if (z.x * z.x + z.y * z.y > 4.0) {
                return {
                    escaped: true,
                    iterations: i,
                    finalZ: z,
                    escapeVelocity: Math.sqrt(z.x * z.x + z.y * z.y)
                };
            }
        }
        
        return {
            escaped: false,
            iterations: iterations,
            finalZ: z,
            escapeVelocity: 0
        };
    }
    
    // Update all visualizations
    update(deltaTime) {
        if (this.showFractals) {
            this.updateFractalParticles(deltaTime);
        }
        
        if (this.showQuantumStates) {
            this.updateQuantumIndicators(deltaTime);
        }
        
        if (this.showComplexNumbers) {
            this.updateComplexNumberLines(deltaTime);
        }
        
        if (this.showFineStructure) {
            this.updateFineStructureEffects(deltaTime);
        }
        
        if (this.showConstants) {
            this.updateMathematicalConstants(deltaTime);
        }
        
        // Update advanced mathematical features
        if (this.showEntanglement) {
            this.updateEntanglementVisualization(deltaTime);
        }
        
        if (this.showMathematicalParticles) {
            this.updateMathematicalParticles(deltaTime);
        }
        
        if (this.showEnhancedFractals) {
            this.updateEnhancedFractals(deltaTime);
        }
        
        if (this.showMathematicalWaves) {
            this.updateMathematicalWaves(deltaTime);
        }
    }
    
    // Toggle visualization types
    toggleFractals() {
        this.showFractals = !this.showFractals;
        this.fractalParticles.forEach(particle => {
            particle.visible = this.showFractals;
        });
    }
    
    toggleQuantumStates() {
        this.showQuantumStates = !this.showQuantumStates;
        this.quantumIndicators.forEach(indicator => {
            indicator.visible = this.showQuantumStates;
        });
    }
    
    toggleComplexNumbers() {
        this.showComplexNumbers = !this.showComplexNumbers;
        this.complexNumberLines.forEach(line => {
            line.visible = this.showComplexNumbers;
        });
    }
    
    toggleFineStructure() {
        this.showFineStructure = !this.showFineStructure;
        this.fineStructureEffects.forEach(effect => {
            effect.visible = this.showFineStructure;
        });
    }
    
    toggleConstants() {
        this.showConstants = !this.showConstants;
        this.mathematicalConstants.forEach(constant => {
            constant.visible = this.showConstants;
        });
    }
    
    toggleEntanglement() {
        this.showEntanglement = !this.showEntanglement;
        this.entanglementLines.forEach(line => {
            line.visible = this.showEntanglement;
        });
    }
    
    toggleMathematicalParticles() {
        this.showMathematicalParticles = !this.showMathematicalParticles;
        this.mathematicalParticles.forEach(particle => {
            particle.visible = this.showMathematicalParticles;
        });
    }
    
    toggleEnhancedFractals() {
        this.showEnhancedFractals = !this.showEnhancedFractals;
        this.enhancedFractals.forEach(fractal => {
            fractal.visible = this.showEnhancedFractals;
        });
    }
    
    toggleMathematicalWaves() {
        this.showMathematicalWaves = !this.showMathematicalWaves;
        this.mathematicalWaves.forEach(wave => {
            wave.visible = this.showMathematicalWaves;
        });
    }
    
    // Get mathematical information for display
    getMathematicalInfo() {
        return {
            fractalParticles: this.fractalParticles.length,
            quantumIndicators: this.quantumIndicators.length,
            complexNumberLines: this.complexNumberLines.length,
            fineStructureEffects: this.fineStructureEffects.length,
            mathematicalConstants: this.mathematicalConstants.length,
            entanglementLines: this.entanglementLines.length,
            mathematicalParticles: this.mathematicalParticles.length,
            enhancedFractals: this.enhancedFractals.length,
            mathematicalWaves: this.mathematicalWaves.length
        };
    }
    
    // Clean up visualizations
    dispose() {
        // Remove all visualization objects from scene
        this.fractalParticles.forEach(particle => {
            this.scene.remove(particle);
            particle.geometry.dispose();
            particle.material.dispose();
        });
        
        this.quantumIndicators.forEach(indicator => {
            this.scene.remove(indicator);
            indicator.geometry.dispose();
            indicator.material.dispose();
        });
        
        this.complexNumberLines.forEach(line => {
            this.scene.remove(line);
            line.geometry.dispose();
            line.material.dispose();
        });
        
        this.fineStructureEffects.forEach(effect => {
            this.scene.remove(effect);
            effect.geometry.dispose();
            effect.material.dispose();
        });
        
        this.mathematicalConstants.forEach(constant => {
            this.scene.remove(constant);
            constant.geometry.dispose();
            constant.material.dispose();
        });
        
        // Clean up advanced mathematical features
        this.entanglementLines.forEach(line => {
            this.scene.remove(line);
            line.geometry.dispose();
            line.material.dispose();
        });
        
        this.mathematicalParticles.forEach(particle => {
            this.scene.remove(particle);
            particle.geometry.dispose();
            particle.material.dispose();
        });
        
        this.enhancedFractals.forEach(fractal => {
            this.scene.remove(fractal);
            fractal.geometry.dispose();
            fractal.material.dispose();
        });
        
        this.mathematicalWaves.forEach(wave => {
            this.scene.remove(wave);
            wave.geometry.dispose();
            wave.material.dispose();
        });
        
        // Clear arrays
        this.fractalParticles = [];
        this.quantumIndicators = [];
        this.complexNumberLines = [];
        this.fineStructureEffects = [];
        this.mathematicalConstants = [];
        this.entanglementLines = [];
        this.mathematicalParticles = [];
        this.enhancedFractals = [];
        this.mathematicalWaves = [];
    }
}

export default MathematicalVisualizer; 