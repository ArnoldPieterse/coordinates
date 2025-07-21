/**
 * Dependency Injection Container
 * Manages dependencies and implements the dependency injection pattern
 */
class Container {
    constructor() {
        this.services = new Map();
        this.singletons = new Map();
        this.factories = new Map();
    }

    /**
     * Register a service with the container
     * @param {string} name - Service name
     * @param {Function} factory - Factory function to create the service
     * @param {boolean} singleton - Whether to create as singleton
     */
    register(name, factory, singleton = true) {
        if (singleton) {
            this.singletons.set(name, factory);
        } else {
            this.factories.set(name, factory);
        }
    }

    /**
     * Resolve a service from the container
     * @param {string} name - Service name
     * @returns {*} The resolved service instance
     */
    resolve(name) {
        // Check if already resolved as singleton
        if (this.services.has(name)) {
            return this.services.get(name);
        }

        // Check if it's a singleton factory
        if (this.singletons.has(name)) {
            const factory = this.singletons.get(name);
            const instance = factory(this);
            this.services.set(name, instance);
            return instance;
        }

        // Check if it's a factory
        if (this.factories.has(name)) {
            const factory = this.factories.get(name);
            return factory(this);
        }

        throw new Error(`Service '${name}' not registered`);
    }

    /**
     * Check if a service is registered
     * @param {string} name - Service name
     * @returns {boolean} Whether the service is registered
     */
    has(name) {
        return this.singletons.has(name) || this.factories.has(name) || this.services.has(name);
    }

    /**
     * Clear all services (useful for testing)
     */
    clear() {
        this.services.clear();
        this.singletons.clear();
        this.factories.clear();
    }
}

export default Container; 