import { ValidationFramework } from '../../../src/utils/ValidationFramework.js';

describe('ValidationFramework', () => {
    describe('validatePlayerInput', () => {
        test('should validate correct player input', () => {
            const input = {
                keys: { w: true, s: false },
                mouse: { x: 100, y: 200 },
                deltaTime: 0.016
            };
            
            expect(() => ValidationFramework.validatePlayerInput(input)).not.toThrow();
        });
        
        test('should throw error for missing properties', () => {
            const input = {
                keys: { w: true },
                mouse: { x: 100, y: 200 }
                // missing deltaTime
            };
            
            expect(() => ValidationFramework.validatePlayerInput(input)).toThrow('Missing required property: deltaTime');
        });
        
        test('should throw error for wrong types', () => {
            const input = {
                keys: { w: true },
                mouse: { x: 100, y: 200 },
                deltaTime: '0.016' // should be number
            };
            
            expect(() => ValidationFramework.validatePlayerInput(input)).toThrow('Invalid deltaTime: expected number, got string');
        });
    });
    
    describe('validateWeaponInput', () => {
        test('should validate correct weapon input', () => {
            const weaponKey = 'rifle';
            const position = { x: 0, y: 0, z: 0 };
            const direction = { x: 1, y: 0, z: 0 };
            
            expect(() => ValidationFramework.validateWeaponInput(weaponKey, position, direction)).not.toThrow();
        });
        
        test('should throw error for invalid weapon key', () => {
            const weaponKey = '';
            const position = { x: 0, y: 0, z: 0 };
            const direction = { x: 1, y: 0, z: 0 };
            
            expect(() => ValidationFramework.validateWeaponInput(weaponKey, position, direction)).toThrow('Invalid weapon key: must be a non-empty string');
        });
        
        test('should throw error for invalid position', () => {
            const weaponKey = 'rifle';
            const position = null;
            const direction = { x: 1, y: 0, z: 0 };
            
            expect(() => ValidationFramework.validateWeaponInput(weaponKey, position, direction)).toThrow('Invalid position: must be a valid object');
        });
        
        test('should throw error for invalid vector properties', () => {
            const weaponKey = 'rifle';
            const position = { x: 0, y: 'invalid', z: 0 };
            const direction = { x: 1, y: 0, z: 0 };
            
            expect(() => ValidationFramework.validateWeaponInput(weaponKey, position, direction)).toThrow('Invalid position.y: must be a valid number');
        });
        
        test('should throw error for NaN values', () => {
            const weaponKey = 'rifle';
            const position = { x: 0, y: 0, z: 0 };
            const direction = { x: 1, y: NaN, z: 0 };
            
            expect(() => ValidationFramework.validateWeaponInput(weaponKey, position, direction)).toThrow('Invalid direction.y: must be a valid number');
        });
    });
    
    describe('validateAIInput', () => {
        test('should validate correct AI input', () => {
            const input = {
                prompt: 'Generate some code',
                modelId: 'llama2-7b',
                options: { temperature: 0.7 }
            };
            
            expect(() => ValidationFramework.validateAIInput(input)).not.toThrow();
        });
        
        test('should throw error for prompt too long', () => {
            const input = {
                prompt: 'a'.repeat(10001),
                modelId: 'llama2-7b',
                options: { temperature: 0.7 }
            };
            
            expect(() => ValidationFramework.validateAIInput(input)).toThrow('Prompt too long: maximum 10,000 characters');
        });
        
        test('should throw error for invalid model ID', () => {
            const input = {
                prompt: 'Generate some code',
                modelId: 'llama2@7b', // invalid characters
                options: { temperature: 0.7 }
            };
            
            expect(() => ValidationFramework.validateAIInput(input)).toThrow('Invalid model ID: must contain only alphanumeric characters, hyphens, and underscores');
        });
    });
    
    describe('validateMathInput', () => {
        test('should validate correct math input for basic operations', () => {
            const input = {
                operation: 'add',
                parameters: { a: 5, b: 3 }
            };
            
            expect(() => ValidationFramework.validateMathInput(input)).not.toThrow();
        });
        
        test('should validate power operation', () => {
            const input = {
                operation: 'power',
                parameters: { base: 2, exponent: 3 }
            };
            
            expect(() => ValidationFramework.validateMathInput(input)).not.toThrow();
        });
        
        test('should validate sqrt operation', () => {
            const input = {
                operation: 'sqrt',
                parameters: { value: 16 }
            };
            
            expect(() => ValidationFramework.validateMathInput(input)).not.toThrow();
        });
        
        test('should throw error for invalid operation', () => {
            const input = {
                operation: 'invalid',
                parameters: { a: 5, b: 3 }
            };
            
            expect(() => ValidationFramework.validateMathInput(input)).toThrow('Invalid operation: must be one of add, subtract, multiply, divide, power, sqrt');
        });
        
        test('should throw error for missing parameters in basic operations', () => {
            const input = {
                operation: 'add',
                parameters: { a: 5 }
                // missing b
            };
            
            expect(() => ValidationFramework.validateMathInput(input)).toThrow('Operation add requires parameters \'a\' and \'b\'');
        });
        
        test('should throw error for non-numeric parameters', () => {
            const input = {
                operation: 'add',
                parameters: { a: 5, b: '3' }
            };
            
            expect(() => ValidationFramework.validateMathInput(input)).toThrow('Operation add parameters must be numbers');
        });
    });
    
    describe('validateSchema', () => {
        test('should validate correct schema', () => {
            const data = { name: 'test', age: 25, active: true };
            const schema = { name: 'string', age: 'number', active: 'boolean' };
            
            expect(() => ValidationFramework.validateSchema(data, schema)).not.toThrow();
        });
        
        test('should throw error for invalid data type', () => {
            const data = null;
            const schema = { name: 'string' };
            
            expect(() => ValidationFramework.validateSchema(data, schema)).toThrow('Data must be a valid object');
        });
        
        test('should throw error for missing properties', () => {
            const data = { name: 'test' };
            const schema = { name: 'string', age: 'number' };
            
            expect(() => ValidationFramework.validateSchema(data, schema)).toThrow('Missing required property: age');
        });
        
        test('should throw error for wrong types', () => {
            const data = { name: 'test', age: '25' };
            const schema = { name: 'string', age: 'number' };
            
            expect(() => ValidationFramework.validateSchema(data, schema)).toThrow('Invalid age: expected number, got string');
        });
        
        test('should throw error for empty strings', () => {
            const data = { name: '', age: 25 };
            const schema = { name: 'string', age: 'number' };
            
            expect(() => ValidationFramework.validateSchema(data, schema)).toThrow('Property name cannot be empty');
        });
        
        test('should throw error for invalid numbers', () => {
            const data = { name: 'test', age: NaN };
            const schema = { name: 'string', age: 'number' };
            
            expect(() => ValidationFramework.validateSchema(data, schema)).toThrow('Property age must be a valid finite number');
        });
    });
    
    describe('sanitizeString', () => {
        test('should sanitize script tags', () => {
            const input = '<script>alert("xss")</script>Hello';
            const result = ValidationFramework.sanitizeString(input);
            
            expect(result).toBe('Hello');
        });
        
        test('should sanitize javascript protocol', () => {
            const input = 'javascript:alert("xss")';
            const result = ValidationFramework.sanitizeString(input);
            
            expect(result).toBe('alert("xss")');
        });
        
        test('should sanitize event handlers', () => {
            const input = 'onclick=alert("xss")';
            const result = ValidationFramework.sanitizeString(input);
            
            expect(result).toBe('alert("xss")');
        });
        
        test('should handle non-string input', () => {
            expect(ValidationFramework.sanitizeString(null)).toBe('');
            expect(ValidationFramework.sanitizeString(undefined)).toBe('');
            expect(ValidationFramework.sanitizeString(123)).toBe('');
        });
        
        test('should trim whitespace', () => {
            const input = '  Hello World  ';
            const result = ValidationFramework.sanitizeString(input);
            
            expect(result).toBe('Hello World');
        });
    });
    
    describe('validateAndSanitizeUserInput', () => {
        test('should sanitize string values', () => {
            const input = {
                name: '<script>alert("xss")</script>John',
                age: 25,
                email: 'test@example.com'
            };
            
            const result = ValidationFramework.validateAndSanitizeUserInput(input);
            
            expect(result.name).toBe('John');
            expect(result.age).toBe(25);
            expect(result.email).toBe('test@example.com');
        });
        
        test('should handle nested objects', () => {
            const input = {
                user: {
                    name: '<script>alert("xss")</script>John',
                    preferences: {
                        theme: 'dark'
                    }
                }
            };
            
            const result = ValidationFramework.validateAndSanitizeUserInput(input);
            
            expect(result.user.name).toBe('John');
            expect(result.user.preferences.theme).toBe('dark');
        });
        
        test('should handle invalid numbers', () => {
            const input = {
                name: 'John',
                age: NaN,
                score: Infinity
            };
            
            const result = ValidationFramework.validateAndSanitizeUserInput(input);
            
            expect(result.age).toBe(0);
            expect(result.score).toBe(0);
        });
    });
    
    describe('validateFileUpload', () => {
        test('should validate correct file', () => {
            // Mock File constructor for testing
            global.File = class MockFile {
                constructor(name, size, type) {
                    this.name = name;
                    this.size = size;
                    this.type = type;
                }
            };
            
            const file = new File('test.jpg', 1024 * 1024, 'image/jpeg');
            
            expect(() => ValidationFramework.validateFileUpload(file)).not.toThrow();
        });
        
        test('should throw error for invalid file object', () => {
            const file = null;
            
            expect(() => ValidationFramework.validateFileUpload(file)).toThrow('Invalid file: must be a valid File object');
        });
        
        test('should throw error for file too large', () => {
            const file = new File('test.jpg', 20 * 1024 * 1024, 'image/jpeg');
            
            expect(() => ValidationFramework.validateFileUpload(file)).toThrow('File too large: maximum size is 10MB');
        });
        
        test('should throw error for invalid file type', () => {
            const file = new File('test.txt', 1024, 'text/plain');
            
            expect(() => ValidationFramework.validateFileUpload(file)).toThrow('Invalid file type: allowed types are image/jpeg, image/png, image/gif');
        });
        
        test('should throw error for invalid file extension', () => {
            const file = new File('test.bmp', 1024, 'image/bmp');
            
            expect(() => ValidationFramework.validateFileUpload(file)).toThrow('Invalid file type: allowed types are image/jpeg, image/png, image/gif');
        });
    });
    
    describe('validateNetworkRequest', () => {
        test('should validate correct request', () => {
            const request = {
                url: 'https://api.example.com/data',
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            };
            
            expect(() => ValidationFramework.validateNetworkRequest(request)).not.toThrow();
        });
        
        test('should throw error for invalid URL', () => {
            const request = {
                url: 'invalid-url',
                method: 'GET',
                headers: {}
            };
            
            expect(() => ValidationFramework.validateNetworkRequest(request)).toThrow('Invalid URL format');
        });
        
        test('should throw error for invalid HTTP method', () => {
            const request = {
                url: 'https://api.example.com/data',
                method: 'INVALID',
                headers: {}
            };
            
            expect(() => ValidationFramework.validateNetworkRequest(request)).toThrow('Invalid HTTP method: must be one of GET, POST, PUT, DELETE, PATCH');
        });
        
        test('should handle case-insensitive HTTP methods', () => {
            const request = {
                url: 'https://api.example.com/data',
                method: 'post',
                headers: {}
            };
            
            expect(() => ValidationFramework.validateNetworkRequest(request)).not.toThrow();
        });
    });
}); 