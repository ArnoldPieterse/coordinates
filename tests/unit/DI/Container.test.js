import Container from '../../../src/core/DI/Container.js';

describe('Container', () => {
    let container;

    beforeEach(() => {
        container = new Container();
    });

    afterEach(() => {
        container.clear();
    });

    describe('register', () => {
        it('should register a singleton service', () => {
            const factory = jest.fn(() => ({ id: 'test' }));
            container.register('testService', factory, true);
            
            expect(container.has('testService')).toBe(true);
        });

        it('should register a factory service', () => {
            const factory = jest.fn(() => ({ id: 'test' }));
            container.register('testService', factory, false);
            
            expect(container.has('testService')).toBe(true);
        });
    });

    describe('resolve', () => {
        it('should resolve a singleton service', () => {
            const factory = jest.fn(() => ({ id: 'test' }));
            container.register('testService', factory);
            
            const service1 = container.resolve('testService');
            const service2 = container.resolve('testService');
            
            expect(service1).toEqual({ id: 'test' });
            expect(service2).toEqual({ id: 'test' });
            expect(service1).toBe(service2); // Same instance
            expect(factory).toHaveBeenCalledTimes(1);
        });

        it('should resolve a factory service', () => {
            const factory = jest.fn(() => ({ id: 'test' }));
            container.register('testService', factory, false);
            
            const service1 = container.resolve('testService');
            const service2 = container.resolve('testService');
            
            expect(service1).toEqual({ id: 'test' });
            expect(service2).toEqual({ id: 'test' });
            expect(service1).not.toBe(service2); // Different instances
            expect(factory).toHaveBeenCalledTimes(2);
        });

        it('should throw error for unregistered service', () => {
            expect(() => {
                container.resolve('unregisteredService');
            }).toThrow("Service 'unregisteredService' not registered");
        });

        it('should pass container to factory function', () => {
            const factory = jest.fn((container) => {
                expect(container).toBe(container);
                return { id: 'test' };
            });
            
            container.register('testService', factory);
            container.resolve('testService');
            
            expect(factory).toHaveBeenCalledWith(container);
        });
    });

    describe('has', () => {
        it('should return true for registered service', () => {
            container.register('testService', () => ({}));
            expect(container.has('testService')).toBe(true);
        });

        it('should return false for unregistered service', () => {
            expect(container.has('unregisteredService')).toBe(false);
        });

        it('should return true for resolved service', () => {
            container.register('testService', () => ({}));
            container.resolve('testService');
            expect(container.has('testService')).toBe(true);
        });
    });

    describe('clear', () => {
        it('should clear all services', () => {
            container.register('service1', () => ({}));
            container.register('service2', () => ({}));
            
            container.clear();
            
            expect(container.has('service1')).toBe(false);
            expect(container.has('service2')).toBe(false);
        });
    });
}); 