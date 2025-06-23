import * as CANNON from 'cannon-es';

class AdvancedPhysics {
    constructor() {
        this.world = null;
        this.bodies = new Map();
        this.constraints = new Map();
        this.destructibleObjects = new Map();
        this.ragdolls = new Map();
        this.vehicles = new Map();
        this.fluids = new Map();
        
        this.init();
    }

    init() {
        // Create physics world with advanced settings
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -30, 0),
            allowSleep: true,
            solver: {
                iterations: 10,
                tolerance: 0.001
            }
        });

        // Add contact material for realistic interactions
        this.setupContactMaterials();
        
        // Add broadphase for better performance
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        
        // Add solver for constraints
        this.world.solver.iterations = 10;
        this.world.solver.tolerance = 0.001;
    }

    setupContactMaterials() {
        // Create materials for different surface types
        const groundMaterial = new CANNON.Material('ground');
        const playerMaterial = new CANNON.Material('player');
        const bulletMaterial = new CANNON.Material('bullet');
        const destructibleMaterial = new CANNON.Material('destructible');

        // Ground-Player contact
        const groundPlayerContact = new CANNON.ContactMaterial(
            groundMaterial,
            playerMaterial,
            {
                friction: 0.8,
                restitution: 0.3,
                contactEquationStiffness: 1e8,
                contactEquationRelaxation: 3,
                frictionEquationStiffness: 1e8
            }
        );

        // Bullet-Destructible contact
        const bulletDestructibleContact = new CANNON.ContactMaterial(
            bulletMaterial,
            destructibleMaterial,
            {
                friction: 0.0,
                restitution: 0.0,
                contactEquationStiffness: 1e8,
                contactEquationRelaxation: 3
            }
        );

        this.world.addContactMaterial(groundPlayerContact);
        this.world.addContactMaterial(bulletDestructibleContact);

        this.materials = {
            ground: groundMaterial,
            player: playerMaterial,
            bullet: bulletMaterial,
            destructible: destructibleMaterial
        };
    }

    // Destructible Environment
    createDestructibleObject(geometry, material, position, mass = 1) {
        const shape = this.createShapeFromGeometry(geometry);
        const body = new CANNON.Body({
            mass: mass,
            shape: shape,
            material: this.materials.destructible,
            position: new CANNON.Vec3(position.x, position.y, position.z)
        });

        // Add destruction properties
        body.destructible = {
            health: 100,
            maxHealth: 100,
            destroyed: false,
            fragments: [],
            originalGeometry: geometry,
            originalMaterial: material
        };

        this.world.addBody(body);
        this.destructibleObjects.set(body.id, body);

        return body;
    }

    createShapeFromGeometry(geometry) {
        if (geometry.type === 'BoxGeometry') {
            const size = geometry.parameters;
            return new CANNON.Box(new CANNON.Vec3(
                size.width / 2,
                size.height / 2,
                size.depth / 2
            ));
        } else if (geometry.type === 'SphereGeometry') {
            return new CANNON.Sphere(geometry.parameters.radius);
        } else if (geometry.type === 'CylinderGeometry') {
            const params = geometry.parameters;
            return new CANNON.Cylinder(
                params.radiusTop,
                params.radiusBottom,
                params.height,
                params.radialSegments
            );
        } else {
            // Fallback to convex hull
            const vertices = geometry.attributes.position.array;
            const points = [];
            for (let i = 0; i < vertices.length; i += 3) {
                points.push(new CANNON.Vec3(vertices[i], vertices[i + 1], vertices[i + 2]));
            }
            return new CANNON.ConvexPolyhedron({ vertices: points });
        }
    }

    damageDestructibleObject(bodyId, damage, impactPoint) {
        const body = this.destructibleObjects.get(bodyId);
        if (!body || !body.destructible) return;

        body.destructible.health -= damage;

        if (body.destructible.health <= 0 && !body.destructible.destroyed) {
            this.destroyObject(body, impactPoint);
        }
    }

    destroyObject(body, impactPoint) {
        body.destructible.destroyed = true;

        // Create fragments
        const fragmentCount = Math.floor(Math.random() * 5) + 3;
        const fragments = [];

        for (let i = 0; i < fragmentCount; i++) {
            const fragment = this.createFragment(body, impactPoint);
            fragments.push(fragment);
        }

        body.destructible.fragments = fragments;

        // Remove original body
        this.world.removeBody(body);
        this.destructibleObjects.delete(body.id);

        // Add fragments to world
        fragments.forEach(fragment => {
            this.world.addBody(fragment);
        });

        return fragments;
    }

    createFragment(originalBody, impactPoint) {
        const fragmentSize = Math.random() * 0.5 + 0.2;
        const shape = new CANNON.Box(new CANNON.Vec3(fragmentSize, fragmentSize, fragmentSize));
        
        const fragment = new CANNON.Body({
            mass: 0.1,
            shape: shape,
            material: this.materials.destructible,
            position: new CANNON.Vec3(
                impactPoint.x + (Math.random() - 0.5) * 2,
                impactPoint.y + Math.random() * 2,
                impactPoint.z + (Math.random() - 0.5) * 2
            )
        });

        // Add random velocity
        fragment.velocity.set(
            (Math.random() - 0.5) * 10,
            Math.random() * 5,
            (Math.random() - 0.5) * 10
        );

        return fragment;
    }

    // Ragdoll Physics
    createRagdoll(position, scale = 1) {
        const ragdoll = {
            bodies: [],
            constraints: [],
            head: null,
            torso: null,
            leftArm: null,
            rightArm: null,
            leftLeg: null,
            rightLeg: null
        };

        // Create body parts
        ragdoll.head = this.createBodyPart('sphere', 0.2 * scale, 1, position);
        ragdoll.torso = this.createBodyPart('box', [0.3 * scale, 0.5 * scale, 0.2 * scale], 3, 
            new CANNON.Vec3(position.x, position.y - 0.7 * scale, position.z));
        ragdoll.leftArm = this.createBodyPart('capsule', [0.1 * scale, 0.4 * scale], 1,
            new CANNON.Vec3(position.x - 0.4 * scale, position.y - 0.5 * scale, position.z));
        ragdoll.rightArm = this.createBodyPart('capsule', [0.1 * scale, 0.4 * scale], 1,
            new CANNON.Vec3(position.x + 0.4 * scale, position.y - 0.5 * scale, position.z));
        ragdoll.leftLeg = this.createBodyPart('capsule', [0.1 * scale, 0.5 * scale], 1.5,
            new CANNON.Vec3(position.x - 0.15 * scale, position.y - 1.2 * scale, position.z));
        ragdoll.rightLeg = this.createBodyPart('capsule', [0.1 * scale, 0.5 * scale], 1.5,
            new CANNON.Vec3(position.x + 0.15 * scale, position.y - 1.2 * scale, position.z));

        // Add bodies to world
        Object.values(ragdoll).forEach(body => {
            if (body && body.id) {
                this.world.addBody(body);
                ragdoll.bodies.push(body);
            }
        });

        // Create constraints
        this.createRagdollConstraints(ragdoll);

        this.ragdolls.set(ragdoll.head.id, ragdoll);
        return ragdoll;
    }

    createBodyPart(type, dimensions, mass, position) {
        let shape;

        if (type === 'sphere') {
            shape = new CANNON.Sphere(dimensions);
        } else if (type === 'box') {
            shape = new CANNON.Box(new CANNON.Vec3(dimensions[0], dimensions[1], dimensions[2]));
        } else if (type === 'capsule') {
            shape = new CANNON.Cylinder(dimensions[0], dimensions[0], dimensions[1], 8);
        }

        return new CANNON.Body({
            mass: mass,
            shape: shape,
            material: this.materials.player,
            position: position
        });
    }

    createRagdollConstraints(ragdoll) {
        // Head to torso
        const headTorsoConstraint = new CANNON.ConeTwistConstraint(ragdoll.head, ragdoll.torso, {
            pivotA: new CANNON.Vec3(0, -0.2, 0),
            pivotB: new CANNON.Vec3(0, 0.25, 0),
            axisA: new CANNON.Vec3(0, 1, 0),
            axisB: new CANNON.Vec3(0, 1, 0),
            angle: Math.PI / 6,
            twistAngle: Math.PI / 4
        });

        // Arms to torso
        const leftArmConstraint = new CANNON.ConeTwistConstraint(ragdoll.torso, ragdoll.leftArm, {
            pivotA: new CANNON.Vec3(-0.3, 0.2, 0),
            pivotB: new CANNON.Vec3(0, 0.2, 0),
            axisA: new CANNON.Vec3(1, 0, 0),
            axisB: new CANNON.Vec3(0, 1, 0),
            angle: Math.PI / 3,
            twistAngle: Math.PI / 2
        });

        const rightArmConstraint = new CANNON.ConeTwistConstraint(ragdoll.torso, ragdoll.rightArm, {
            pivotA: new CANNON.Vec3(0.3, 0.2, 0),
            pivotB: new CANNON.Vec3(0, 0.2, 0),
            axisA: new CANNON.Vec3(-1, 0, 0),
            axisB: new CANNON.Vec3(0, 1, 0),
            angle: Math.PI / 3,
            twistAngle: Math.PI / 2
        });

        // Legs to torso
        const leftLegConstraint = new CANNON.ConeTwistConstraint(ragdoll.torso, ragdoll.leftLeg, {
            pivotA: new CANNON.Vec3(-0.15, -0.25, 0),
            pivotB: new CANNON.Vec3(0, 0.25, 0),
            axisA: new CANNON.Vec3(0, -1, 0),
            axisB: new CANNON.Vec3(0, 1, 0),
            angle: Math.PI / 4,
            twistAngle: Math.PI / 6
        });

        const rightLegConstraint = new CANNON.ConeTwistConstraint(ragdoll.torso, ragdoll.rightLeg, {
            pivotA: new CANNON.Vec3(0.15, -0.25, 0),
            pivotB: new CANNON.Vec3(0, 0.25, 0),
            axisA: new CANNON.Vec3(0, -1, 0),
            axisB: new CANNON.Vec3(0, 1, 0),
            angle: Math.PI / 4,
            twistAngle: Math.PI / 6
        });

        // Add constraints to world
        const constraints = [headTorsoConstraint, leftArmConstraint, rightArmConstraint, leftLegConstraint, rightLegConstraint];
        constraints.forEach(constraint => {
            this.world.addConstraint(constraint);
            ragdoll.constraints.push(constraint);
        });
    }

    // Vehicle Physics
    createVehicle(position) {
        const vehicle = {
            body: null,
            wheels: [],
            vehicle: null
        };

        // Create vehicle body
        const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2));
        vehicle.body = new CANNON.Body({
            mass: 1500,
            shape: chassisShape,
            position: position
        });

        // Create vehicle
        vehicle.vehicle = new CANNON.RaycastVehicle({
            chassisBody: vehicle.body,
            indexRightAxis: 0,
            indexForwardAxis: 2,
            indexUpAxis: 1
        });

        // Create wheels
        const wheelOptions = {
            radius: 0.4,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            suspensionStiffness: 30,
            suspensionRestLength: 0.3,
            frictionSlip: 1.4,
            dampingRelaxation: 2.3,
            dampingCompression: 4.4,
            maxSuspensionForce: 100000,
            rollInfluence: 0.01,
            axleLocal: new CANNON.Vec3(1, 0, 0),
            chassisConnectionPointLocal: new CANNON.Vec3(1, 0, 1),
            maxSuspensionTravel: 0.3,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true
        };

        // Add wheels
        const wheelPositions = [
            { x: -0.8, y: 0, z: 1.2 },   // Front left
            { x: 0.8, y: 0, z: 1.2 },    // Front right
            { x: -0.8, y: 0, z: -1.2 },  // Rear left
            { x: 0.8, y: 0, z: -1.2 }    // Rear right
        ];

        wheelPositions.forEach(pos => {
            wheelOptions.chassisConnectionPointLocal.set(pos.x, pos.y, pos.z);
            vehicle.vehicle.addWheel(wheelOptions);
        });

        // Add vehicle to world
        this.world.addBody(vehicle.body);
        vehicle.vehicle.addToWorld(this.world);

        this.vehicles.set(vehicle.body.id, vehicle);
        return vehicle;
    }

    // Fluid Physics
    createFluidSimulation(bounds, particleCount = 1000) {
        const fluid = {
            particles: [],
            bounds: bounds,
            gravity: new CANNON.Vec3(0, -9.8, 0)
        };

        // Create fluid particles
        for (let i = 0; i < particleCount; i++) {
            const particle = new CANNON.Body({
                mass: 1,
                shape: new CANNON.Sphere(0.1),
                position: new CANNON.Vec3(
                    bounds.min.x + Math.random() * (bounds.max.x - bounds.min.x),
                    bounds.max.y,
                    bounds.min.z + Math.random() * (bounds.max.z - bounds.min.z)
                )
            });

            this.world.addBody(particle);
            fluid.particles.push(particle);
        }

        this.fluids.set(fluid.particles[0].id, fluid);
        return fluid;
    }

    // Bullet Physics
    createBullet(position, direction, velocity = 100) {
        const bulletShape = new CANNON.Sphere(0.05);
        const bullet = new CANNON.Body({
            mass: 0.1,
            shape: bulletShape,
            material: this.materials.bullet,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            velocity: new CANNON.Vec3(
                direction.x * velocity,
                direction.y * velocity,
                direction.z * velocity
            )
        });

        // Add bullet properties
        bullet.bullet = {
            damage: 25,
            penetration: 0.5,
            ricochetChance: 0.3
        };

        this.world.addBody(bullet);
        this.bodies.set(bullet.id, bullet);

        return bullet;
    }

    // Explosion Physics
    createExplosion(position, radius = 10, force = 1000) {
        const explosionBodies = [];

        // Find all bodies within explosion radius
        this.world.bodies.forEach(body => {
            const distance = body.position.distanceTo(position);
            if (distance <= radius) {
                const direction = new CANNON.Vec3();
                body.position.vsub(position, direction);
                direction.normalize();

                const forceMagnitude = force * (1 - distance / radius);
                const impulse = direction.scale(forceMagnitude);
                body.applyImpulse(impulse, body.position);

                explosionBodies.push(body);
            }
        });

        return explosionBodies;
    }

    // Update physics simulation
    update(deltaTime) {
        this.world.step(1/60, deltaTime, 3);

        // Update destructible objects
        this.destructibleObjects.forEach(body => {
            if (body.destructible && body.destructible.health <= 0) {
                this.destroyObject(body, body.position);
            }
        });

        // Update vehicles
        this.vehicles.forEach(vehicle => {
            if (vehicle.vehicle) {
                vehicle.vehicle.update();
            }
        });
    }

    // Utility methods
    getBodyById(id) {
        return this.bodies.get(id);
    }

    removeBody(body) {
        this.world.removeBody(body);
        this.bodies.delete(body.id);
    }

    setGravity(x, y, z) {
        this.world.gravity.set(x, y, z);
    }

    // Performance optimization
    optimize() {
        // Enable sleeping for better performance
        this.world.allowSleep = true;
        
        // Optimize broadphase
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        
        // Reduce solver iterations for better performance
        this.world.solver.iterations = 5;
    }
}

export default AdvancedPhysics; 