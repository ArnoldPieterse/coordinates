/**
 * Validation Framework
 * Provides comprehensive input validation for security and data integrity
 * Implements schema-based validation with type checking and sanitization
 */
export class ValidationFramework {
    /**
     * Validate player input data
     * @param {Object} input - Player input object
     * @returns {boolean} Validation result
     */
    static validatePlayerInput(input) {
        const schema = {
            keys: 'object',
            mouse: 'object',
            deltaTime: 'number'
        };
        
        return this.validateSchema(input, schema);
    }
    
    /**
     * Validate weapon input data
     * @param {string} weaponKey - Weapon identifier
     * @param {Object} position - Position vector
     * @param {Object} direction - Direction vector
     * @returns {boolean} Validation result
     */
    static validateWeaponInput(weaponKey, position, direction) {
        if (!weaponKey || typeof weaponKey !== 'string') {
            throw new Error('Invalid weapon key: must be a non-empty string');
        }
        
        if (!position || typeof position !== 'object') {
            throw new Error('Invalid position: must be a valid object');
        }
        
        if (!direction || typeof direction !== 'object') {
            throw new Error('Invalid direction: must be a valid object');
        }
        
        // Validate vector properties
        const vectorProps = ['x', 'y', 'z'];
        for (const prop of vectorProps) {
            if (typeof position[prop] !== 'number' || isNaN(position[prop])) {
                throw new Error(`Invalid position.${prop}: must be a valid number`);
            }
            if (typeof direction[prop] !== 'number' || isNaN(direction[prop])) {
                throw new Error(`Invalid direction.${prop}: must be a valid number`);
            }
        }
        
        return true;
    }
    
    /**
     * Validate AI input data
     * @param {Object} input - AI input object
     * @returns {boolean} Validation result
     */
    static validateAIInput(input) {
        const schema = {
            prompt: 'string',
            modelId: 'string',
            options: 'object'
        };
        
        if (!this.validateSchema(input, schema)) {
            return false;
        }
        
        // Validate prompt length
        if (input.prompt.length > 10000) {
            throw new Error('Prompt too long: maximum 10,000 characters');
        }
        
        // Validate model ID format
        if (!/^[a-zA-Z0-9-_]+$/.test(input.modelId)) {
            throw new Error('Invalid model ID: must contain only alphanumeric characters, hyphens, and underscores');
        }
        
        return true;
    }
    
    /**
     * Validate mathematical engine input
     * @param {Object} input - Mathematical input object
     * @returns {boolean} Validation result
     */
    static validateMathInput(input) {
        const schema = {
            operation: 'string',
            parameters: 'object'
        };
        
        if (!this.validateSchema(input, schema)) {
            return false;
        }
        
        // Validate operation type
        const validOperations = ['add', 'subtract', 'multiply', 'divide', 'power', 'sqrt'];
        if (!validOperations.includes(input.operation)) {
            throw new Error(`Invalid operation: must be one of ${validOperations.join(', ')}`);
        }
        
        // Validate parameters based on operation
        switch (input.operation) {
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                if (!input.parameters.a || !input.parameters.b) {
                    throw new Error(`Operation ${input.operation} requires parameters 'a' and 'b'`);
                }
                if (typeof input.parameters.a !== 'number' || typeof input.parameters.b !== 'number') {
                    throw new Error(`Operation ${input.operation} parameters must be numbers`);
                }
                break;
            case 'power':
                if (!input.parameters.base || !input.parameters.exponent) {
                    throw new Error('Power operation requires parameters "base" and "exponent"');
                }
                break;
            case 'sqrt':
                if (!input.parameters.value) {
                    throw new Error('Square root operation requires parameter "value"');
                }
                break;
        }
        
        return true;
    }
    
    /**
     * Validate schema against data
     * @param {Object} data - Data to validate
     * @param {Object} schema - Schema definition
     * @returns {boolean} Validation result
     */
    static validateSchema(data, schema) {
        if (!data || typeof data !== 'object') {
            throw new Error('Data must be a valid object');
        }
        
        for (const [key, expectedType] of Object.entries(schema)) {
            if (!data.hasOwnProperty(key)) {
                throw new Error(`Missing required property: ${key}`);
            }
            
            const actualType = typeof data[key];
            if (actualType !== expectedType) {
                throw new Error(`Invalid ${key}: expected ${expectedType}, got ${actualType}`);
            }
            
            // Additional validation for specific types
            if (expectedType === 'string' && data[key].length === 0) {
                throw new Error(`Property ${key} cannot be empty`);
            }
            
            if (expectedType === 'number' && (isNaN(data[key]) || !isFinite(data[key]))) {
                throw new Error(`Property ${key} must be a valid finite number`);
            }
        }
        
        return true;
    }
    
    /**
     * Sanitize string input
     * @param {string} input - Input string to sanitize
     * @returns {string} Sanitized string
     */
    static sanitizeString(input) {
        if (typeof input !== 'string') {
            return '';
        }
        
        // Remove potentially dangerous content
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
    }
    
    /**
     * Validate and sanitize user input
     * @param {Object} userInput - User input object
     * @returns {Object} Sanitized user input
     */
    static validateAndSanitizeUserInput(userInput) {
        const sanitized = {};
        
        for (const [key, value] of Object.entries(userInput)) {
            if (typeof value === 'string') {
                sanitized[key] = this.sanitizeString(value);
            } else if (typeof value === 'number') {
                sanitized[key] = isFinite(value) ? value : 0;
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = this.validateAndSanitizeUserInput(value);
            } else {
                sanitized[key] = value;
            }
        }
        
        return sanitized;
    }
    
    /**
     * Validate file upload
     * @param {File} file - File object to validate
     * @param {Object} options - Validation options
     * @returns {boolean} Validation result
     */
    static validateFileUpload(file, options = {}) {
        const {
            maxSize = 10 * 1024 * 1024, // 10MB default
            allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
            allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
        } = options;
        
        if (!file || !(file instanceof File)) {
            throw new Error('Invalid file: must be a valid File object');
        }
        
        // Check file size
        if (file.size > maxSize) {
            throw new Error(`File too large: maximum size is ${maxSize / (1024 * 1024)}MB`);
        }
        
        // Check file type
        if (!allowedTypes.includes(file.type)) {
            throw new Error(`Invalid file type: allowed types are ${allowedTypes.join(', ')}`);
        }
        
        // Check file extension
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(extension)) {
            throw new Error(`Invalid file extension: allowed extensions are ${allowedExtensions.join(', ')}`);
        }
        
        return true;
    }
    
    /**
     * Validate network request
     * @param {Object} request - Request object to validate
     * @returns {boolean} Validation result
     */
    static validateNetworkRequest(request) {
        const schema = {
            url: 'string',
            method: 'string',
            headers: 'object'
        };
        
        if (!this.validateSchema(request, schema)) {
            return false;
        }
        
        // Validate URL format
        try {
            new URL(request.url);
        } catch (error) {
            throw new Error('Invalid URL format');
        }
        
        // Validate HTTP method
        const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
        if (!validMethods.includes(request.method.toUpperCase())) {
            throw new Error(`Invalid HTTP method: must be one of ${validMethods.join(', ')}`);
        }
        
        return true;
    }
} 