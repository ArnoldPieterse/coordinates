// IDX-DOC-00: For index reference format, see INDEX_DESCRIBER.md
// IDX-FLOW-01: Flow Diagram Visualizer Module
import * as THREE from 'three';

export default class FlowDiagramVisualizer {
    constructor(scene) {
        this.scene = scene;
        this.nodes = new Map();
        this.container = new THREE.Group();
        this.scene.add(this.container);
        this.clock = new THREE.Clock();
    }

    async loadAndRender(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            this.renderDiagram(data);
        } catch (error) {
            console.error('Error loading or rendering flow diagram:', error);
        }
    }

    renderDiagram(data) {
        // First, create all the node meshes
        data.nodes.forEach(nodeData => {
            const nodeGroup = this.createNode(nodeData);
            this.nodes.set(nodeData.id, nodeGroup);
            this.container.add(nodeGroup);
        });

        // Position nodes (for now, in a circle)
        this.positionNodes();

        // Then, create the edges
        data.edges.forEach(edgeData => {
            const edgeLine = this.createEdgeLine(edgeData);
            if (edgeLine) {
                this.container.add(edgeLine);
            }
        });
        
        this.container.position.set(0, 20, 0); // Elevate the whole diagram
    }

    createNode(nodeData) {
        const nodeGroup = new THREE.Group();
        
        const geometry = this.generateGeometryForNode(nodeData);
        const material = new THREE.MeshStandardMaterial({
            color: this.getColorForType(nodeData.type),
            metalness: 0.7,
            roughness: 0.3,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = nodeData; // Store data for later
        nodeGroup.add(mesh);
        
        // Apply Blender-inspired modifiers
        if (nodeData.modifiers) {
            nodeData.modifiers.forEach(modifier => {
                this.applyModifier(nodeGroup, mesh, modifier);
            });
        }
        
        return nodeGroup;
    }
    
    generateGeometryForNode(nodeData) {
        switch (nodeData.type) {
            case 'start':
            case 'loop':
                return new THREE.TorusGeometry(1, 0.4, 16, 100);
            case 'process':
                return new THREE.BoxGeometry(1.5, 1.5, 1.5);
            case 'io':
                return new THREE.ConeGeometry(1, 2, 32);
            case 'event':
            case 'game_event':
                return new THREE.OctahedronGeometry(1.2, 0);
            case 'network':
                return new THREE.IcosahedronGeometry(1.5, 0);
            default:
                return new THREE.SphereGeometry(1, 16, 16);
        }
    }
    
    applyModifier(nodeGroup, mesh, modifier) {
        if (modifier === 'bevel' && mesh.geometry.type === 'BoxGeometry') {
            const edges = new THREE.EdgesGeometry(mesh.geometry);
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 }));
            line.scale.set(1.01, 1.01, 1.01); // Slightly larger to simulate bevel
            nodeGroup.add(line);
        }
        
        if (modifier === 'wireframe') {
            const wireframeMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                wireframe: true
            });
            const wireframeMesh = new THREE.Mesh(mesh.geometry, wireframeMaterial);
            wireframeMesh.scale.set(1.02, 1.02, 1.02);
            nodeGroup.add(wireframeMesh);
        }
    }

    positionNodes() {
        const radius = 20;
        let angle = 0;
        const step = (2 * Math.PI) / this.nodes.size;

        for (const node of this.nodes.values()) {
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            node.position.set(x, 0, z);
            angle += step;
        }
    }

    createEdgeLine(edgeData) {
        const sourceNode = this.nodes.get(edgeData.source);
        const targetNode = this.nodes.get(edgeData.target);

        if (!sourceNode || !targetNode) return null;

        const material = new THREE.LineBasicMaterial({
            color: 0xaaaaaa,
            transparent: true,
            opacity: 0.7
        });
        
        const points = [
            sourceNode.position,
            targetNode.position
        ];

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        return line;
    }

    getColorForType(type) {
        switch (type) {
            case 'start': return 0x00ff00;
            case 'process': return 0x00aaff;
            case 'io': return 0xffaa00;
            case 'event': return 0xff00ff;
            case 'network': return 0x00ffff;
            case 'game_event': return 0xff4444;
            case 'loop': return 0xffff00;
            case 'input': return 0xcccccc;
            default: return 0xffffff;
        }
    }

    update(deltaTime) {
        this.container.rotation.y += deltaTime * 0.05;

        // "Amplifier" animation
        const time = this.clock.getElapsedTime();
        this.nodes.forEach(nodeGroup => {
            const pulse = Math.sin(time * 2 + nodeGroup.position.x) * 0.05 + 1; // Unique pulse per node
            nodeGroup.scale.set(pulse, pulse, pulse);
        });
    }
} 