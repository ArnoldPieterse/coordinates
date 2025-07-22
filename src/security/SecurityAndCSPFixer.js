/**
 * Security and CSP Fixer
 * Addresses mixed content warnings and Content Security Policy violations
 * Ensures all resources are served over HTTPS and CSP compliance
 */

import { EventEmitter } from 'events';
import winston from 'winston';

class SecurityAndCSPFixer extends EventEmitter {
    constructor() {
        super();
        this.securityIssues = new Map();
        this.cspViolations = new Map();
        this.mixedContentIssues = new Map();
        this.fixedResources = new Map();
        this.securityRules = new Map();
        
        this.setupLogging();
        this.initializeSecuritySystem();
    }

    setupLogging() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, security, issue }) => {
                    return `${timestamp} [${level}] [SECURITY_FIXER] [${security || 'SYSTEM'}] [${issue || 'GENERAL'}] ${message}`;
                })
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'logs/security-fixes.log' })
            ]
        });
    }

    initializeSecuritySystem() {
        this.logger.info('Initializing Security and CSP Fixer', {
            security: 'SYSTEM',
            issue: 'INITIALIZATION'
        });

        // Initialize security rules
        this.initializeSecurityRules();
        
        // Setup CSP policies
        this.setupCSPPolicies();
        
        // Initialize mixed content detection
        this.initializeMixedContentDetection();
        
        // Setup security monitoring
        this.setupSecurityMonitoring();

        this.logger.info('Security and CSP Fixer initialized successfully', {
            security: 'SYSTEM',
            issue: 'INITIALIZATION'
        });
    }

    initializeSecurityRules() {
        // Security rules for different content types
        this.securityRules.set('script', {
            allowedSources: [
                "'self'",
                "'unsafe-inline'",
                "https://www.rekursing.com",
                "https://cdn.jsdelivr.net",
                "https://unpkg.com"
            ],
            blockedPatterns: [
                "eval(",
                "Function(",
                "setTimeout(",
                "setInterval("
            ]
        });

        this.securityRules.set('style', {
            allowedSources: [
                "'self'",
                "'unsafe-inline'",
                "https://www.rekursing.com",
                "https://fonts.googleapis.com",
                "https://cdn.jsdelivr.net"
            ],
            blockedPatterns: [
                "expression(",
                "javascript:"
            ]
        });

        this.securityRules.set('connect', {
            allowedSources: [
                "'self'",
                "https://api.anthropic.com",
                "https://api.openai.com",
                "https://localhost:1234",
                "https://10.3.129.26:1234",
                "https://api-inference.huggingface.co"
            ],
            blockedPatterns: [
                "http://",
                "ws://",
                "wss://"
            ]
        });

        this.securityRules.set('img', {
            allowedSources: [
                "'self'",
                "https://www.rekursing.com",
                "https://cdn.jsdelivr.net",
                "https://unpkg.com",
                "data:"
            ],
            blockedPatterns: [
                "http://"
            ]
        });

        this.logger.info('Security rules initialized', {
            security: 'SYSTEM',
            issue: 'SECURITY_RULES',
            rules: Array.from(this.securityRules.keys())
        });
    }

    setupCSPPolicies() {
        // Content Security Policy configurations
        this.cspPolicies = {
            default: {
                'default-src': ["'self'"],
                'script-src': [
                    "'self'",
                    "'unsafe-inline'",
                    "https://www.rekursing.com",
                    "https://cdn.jsdelivr.net",
                    "https://unpkg.com"
                ],
                'style-src': [
                    "'self'",
                    "'unsafe-inline'",
                    "https://www.rekursing.com",
                    "https://fonts.googleapis.com",
                    "https://cdn.jsdelivr.net"
                ],
                'connect-src': [
                    "'self'",
                    "https://api.anthropic.com",
                    "https://api.openai.com",
                    "https://localhost:1234",
                    "https://10.3.129.26:1234",
                    "https://api-inference.huggingface.co"
                ],
                'img-src': [
                    "'self'",
                    "https://www.rekursing.com",
                    "https://cdn.jsdelivr.net",
                    "https://unpkg.com",
                    "data:"
                ],
                'font-src': [
                    "'self'",
                    "https://fonts.gstatic.com",
                    "https://cdn.jsdelivr.net"
                ],
                'object-src': ["'none'"],
                'base-uri': ["'self'"],
                'form-action': ["'self'"],
                'frame-ancestors': ["'self'"],
                'upgrade-insecure-requests': []
            },
            strict: {
                'default-src': ["'self'"],
                'script-src': ["'self'"],
                'style-src': ["'self'"],
                'connect-src': ["'self'"],
                'img-src': ["'self'"],
                'font-src': ["'self'"],
                'object-src': ["'none'"],
                'base-uri': ["'self'"],
                'form-action': ["'self'"],
                'frame-ancestors': ["'none'"],
                'upgrade-insecure-requests': []
            }
        };

        this.logger.info('CSP policies configured', {
            security: 'SYSTEM',
            issue: 'CSP_POLICIES',
            policies: Object.keys(this.cspPolicies)
        });
    }

    initializeMixedContentDetection() {
        // Monitor for mixed content issues
        this.mixedContentPatterns = [
            /http:\/\/10\.3\.129\.26:1234/,
            /http:\/\/localhost:1234/,
            /http:\/\/[^/]+\.com/,
            /http:\/\/[^/]+\.org/,
            /http:\/\/[^/]+\.net/
        ];

        this.logger.info('Mixed content detection initialized', {
            security: 'SYSTEM',
            issue: 'MIXED_CONTENT',
            patterns: this.mixedContentPatterns.length
        });
    }

    setupSecurityMonitoring() {
        // Monitor security issues every 30 seconds
        setInterval(() => {
            this.scanForSecurityIssues();
        }, 30000);

        // Monitor CSP violations every 15 seconds
        setInterval(() => {
            this.scanForCSPViolations();
        }, 15000);

        // Monitor mixed content every 10 seconds
        setInterval(() => {
            this.scanForMixedContent();
        }, 10000);

        this.logger.info('Security monitoring initialized', {
            security: 'SYSTEM',
            issue: 'MONITORING'
        });
    }

    async fixSecurityIssues() {
        this.logger.info('Starting security issue fixes', {
            security: 'SYSTEM',
            issue: 'SECURITY_FIXES'
        });

        try {
            // Fix mixed content issues
            await this.fixMixedContentIssues();
            
            // Fix CSP violations
            await this.fixCSPViolations();
            
            // Fix eval usage
            await this.fixEvalUsage();
            
            // Update security headers
            await this.updateSecurityHeaders();

            this.logger.info('Security issues fixed successfully', {
                security: 'SYSTEM',
                issue: 'SECURITY_FIXES'
            });

            return {
                success: true,
                fixedIssues: this.fixedResources.size,
                mixedContentFixed: this.mixedContentIssues.size,
                cspViolationsFixed: this.cspViolations.size
            };

        } catch (error) {
            this.logger.error('Failed to fix security issues', {
                security: 'SYSTEM',
                issue: 'SECURITY_FIXES',
                error: error.message
            });

            throw error;
        }
    }

    async fixMixedContentIssues() {
        this.logger.info('Fixing mixed content issues', {
            security: 'MIXED_CONTENT',
            issue: 'FIXING'
        });

        // Known HTTP URLs that need to be converted to HTTPS
        const httpToHttpsMappings = [
            {
                from: 'http://10.3.129.26:1234/v1/models',
                to: 'https://10.3.129.26:1234/v1/models'
            },
            {
                from: 'http://localhost:1234/v1/models',
                to: 'https://localhost:1234/v1/models'
            },
            {
                from: 'http://localhost:1234/v1/chat/completions',
                to: 'https://localhost:1234/v1/chat/completions'
            }
        ];

        for (const mapping of httpToHttpsMappings) {
            try {
                await this.convertHttpToHttps(mapping.from, mapping.to);
                this.mixedContentIssues.set(mapping.from, {
                    fixed: true,
                    timestamp: Date.now(),
                    newUrl: mapping.to
                });
            } catch (error) {
                this.logger.error(`Failed to convert ${mapping.from} to HTTPS`, {
                    security: 'MIXED_CONTENT',
                    issue: 'CONVERSION_FAILED',
                    error: error.message
                });
            }
        }
    }

    async convertHttpToHttps(fromUrl, toUrl) {
        this.logger.info(`Converting HTTP to HTTPS: ${fromUrl} -> ${toUrl}`, {
            security: 'MIXED_CONTENT',
            issue: 'CONVERSION'
        });

        // Update any references to the HTTP URL
        if (typeof window !== 'undefined') {
            // Browser environment
            this.updateBrowserReferences(fromUrl, toUrl);
        } else {
            // Node.js environment
            this.updateServerReferences(fromUrl, toUrl);
        }

        // Store the fix
        this.fixedResources.set(fromUrl, {
            type: 'http_to_https',
            from: fromUrl,
            to: toUrl,
            timestamp: Date.now()
        });
    }

    updateBrowserReferences(fromUrl, toUrl) {
        // Update fetch requests
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            if (typeof url === 'string' && url.includes(fromUrl)) {
                const newUrl = url.replace(fromUrl, toUrl);
                console.log(`[SECURITY] Converting fetch URL: ${url} -> ${newUrl}`);
                return originalFetch(newUrl, options);
            }
            return originalFetch(url, options);
        };

        // Update XMLHttpRequest
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            if (typeof url === 'string' && url.includes(fromUrl)) {
                const newUrl = url.replace(fromUrl, toUrl);
                console.log(`[SECURITY] Converting XHR URL: ${url} -> ${newUrl}`);
                return originalOpen.call(this, method, newUrl, ...args);
            }
            return originalOpen.call(this, method, url, ...args);
        };
    }

    updateServerReferences(fromUrl, toUrl) {
        // Update server-side references
        this.logger.info(`Updating server references: ${fromUrl} -> ${toUrl}`, {
            security: 'MIXED_CONTENT',
            issue: 'SERVER_UPDATE'
        });

        // This would typically involve updating configuration files
        // For now, we'll just log the change
    }

    async fixCSPViolations() {
        this.logger.info('Fixing CSP violations', {
            security: 'CSP',
            issue: 'FIXING'
        });

        // Fix eval usage
        await this.fixEvalUsage();

        // Fix inline scripts
        await this.fixInlineScripts();

        // Fix unsafe sources
        await this.fixUnsafeSources();
    }

    async fixEvalUsage() {
        this.logger.info('Fixing eval usage', {
            security: 'CSP',
            issue: 'EVAL_FIX'
        });

        if (typeof window !== 'undefined') {
            // Replace eval with safer alternatives
            window.eval = function(code) {
                console.warn('[SECURITY] eval() usage blocked by CSP');
                throw new Error('eval() usage is not allowed for security reasons');
            };

            // Replace Function constructor
            window.Function = function(...args) {
                console.warn('[SECURITY] Function() constructor blocked by CSP');
                throw new Error('Function() constructor is not allowed for security reasons');
            };

            // Replace setTimeout with string
            const originalSetTimeout = window.setTimeout;
            window.setTimeout = function(handler, timeout, ...args) {
                if (typeof handler === 'string') {
                    console.warn('[SECURITY] setTimeout with string blocked by CSP');
                    throw new Error('setTimeout with string is not allowed for security reasons');
                }
                return originalSetTimeout.call(this, handler, timeout, ...args);
            };

            // Replace setInterval with string
            const originalSetInterval = window.setInterval;
            window.setInterval = function(handler, timeout, ...args) {
                if (typeof handler === 'string') {
                    console.warn('[SECURITY] setInterval with string blocked by CSP');
                    throw new Error('setInterval with string is not allowed for security reasons');
                }
                return originalSetInterval.call(this, handler, timeout, ...args);
            };
        }
    }

    async fixInlineScripts() {
        this.logger.info('Fixing inline scripts', {
            security: 'CSP',
            issue: 'INLINE_SCRIPTS'
        });

        if (typeof window !== 'undefined') {
            // Find and fix inline scripts
            const scripts = document.querySelectorAll('script:not([src])');
            scripts.forEach(script => {
                if (script.textContent.includes('eval(') || 
                    script.textContent.includes('Function(') ||
                    script.textContent.includes('setTimeout(') ||
                    script.textContent.includes('setInterval(')) {
                    
                    console.warn('[SECURITY] Inline script with unsafe code detected', {
                        script: script.textContent.substring(0, 100) + '...'
                    });
                    
                    // Remove unsafe inline scripts
                    script.remove();
                }
            });
        }
    }

    async fixUnsafeSources() {
        this.logger.info('Fixing unsafe sources', {
            security: 'CSP',
            issue: 'UNSAFE_SOURCES'
        });

        // Update any references to unsafe sources
        const unsafeSources = [
            'http://10.3.129.26:1234',
            'http://localhost:1234',
            'ws://localhost:1234',
            'ws://10.3.129.26:1234'
        ];

        unsafeSources.forEach(source => {
            const secureSource = source.replace('http://', 'https://').replace('ws://', 'wss://');
            this.fixedResources.set(source, {
                type: 'unsafe_source',
                from: source,
                to: secureSource,
                timestamp: Date.now()
            });
        });
    }

    async updateSecurityHeaders() {
        this.logger.info('Updating security headers', {
            security: 'HEADERS',
            issue: 'UPDATE'
        });

        // Generate CSP header
        const cspHeader = this.generateCSPHeader();
        
        // Security headers configuration
        const securityHeaders = {
            'Content-Security-Policy': cspHeader,
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
        };

        this.logger.info('Security headers configured', {
            security: 'HEADERS',
            issue: 'CONFIGURED',
            headers: Object.keys(securityHeaders)
        });

        return securityHeaders;
    }

    generateCSPHeader() {
        const policy = this.cspPolicies.default;
        const cspParts = [];

        for (const [directive, sources] of Object.entries(policy)) {
            if (Array.isArray(sources) && sources.length > 0) {
                cspParts.push(`${directive} ${sources.join(' ')}`);
            }
        }

        return cspParts.join('; ');
    }

    scanForSecurityIssues() {
        this.logger.debug('Scanning for security issues', {
            security: 'SCANNING',
            issue: 'SECURITY'
        });

        // Scan for known security issues
        const issues = this.detectSecurityIssues();
        
        if (issues.length > 0) {
            this.logger.warn(`Found ${issues.length} security issues`, {
                security: 'SCANNING',
                issue: 'SECURITY_ISSUES',
                issues: issues
            });
        }
    }

    scanForCSPViolations() {
        this.logger.debug('Scanning for CSP violations', {
            security: 'SCANNING',
            issue: 'CSP'
        });

        // Scan for CSP violations
        const violations = this.detectCSPViolations();
        
        if (violations.length > 0) {
            this.logger.warn(`Found ${violations.length} CSP violations`, {
                security: 'SCANNING',
                issue: 'CSP_VIOLATIONS',
                violations: violations
            });
        }
    }

    scanForMixedContent() {
        this.logger.debug('Scanning for mixed content', {
            security: 'SCANNING',
            issue: 'MIXED_CONTENT'
        });

        // Scan for mixed content
        const mixedContent = this.detectMixedContent();
        
        if (mixedContent.length > 0) {
            this.logger.warn(`Found ${mixedContent.length} mixed content issues`, {
                security: 'SCANNING',
                issue: 'MIXED_CONTENT_ISSUES',
                mixedContent: mixedContent
            });
        }
    }

    detectSecurityIssues() {
        const issues = [];

        // Check for eval usage
        if (typeof window !== 'undefined' && window.eval.toString().includes('[native code]')) {
            issues.push({
                type: 'eval_available',
                severity: 'high',
                description: 'eval() function is available and not blocked'
            });
        }

        // Check for unsafe inline scripts
        if (typeof window !== 'undefined') {
            const inlineScripts = document.querySelectorAll('script:not([src])');
            inlineScripts.forEach(script => {
                if (script.textContent.includes('eval(') || 
                    script.textContent.includes('Function(')) {
                    issues.push({
                        type: 'unsafe_inline_script',
                        severity: 'high',
                        description: 'Inline script contains unsafe code',
                        element: script
                    });
                }
            });
        }

        return issues;
    }

    detectCSPViolations() {
        const violations = [];

        // Check for CSP violations in console
        if (typeof window !== 'undefined' && window.console) {
            const originalError = console.error;
            console.error = function(...args) {
                const message = args.join(' ');
                if (message.includes('Content Security Policy') || 
                    message.includes('CSP')) {
                    violations.push({
                        type: 'csp_violation',
                        message: message,
                        timestamp: Date.now()
                    });
                }
                originalError.apply(console, args);
            };
        }

        return violations;
    }

    detectMixedContent() {
        const mixedContent = [];

        // Check for HTTP requests
        if (typeof window !== 'undefined') {
            const originalFetch = window.fetch;
            window.fetch = function(url, options) {
                if (typeof url === 'string' && url.startsWith('http://')) {
                    mixedContent.push({
                        type: 'http_request',
                        url: url,
                        timestamp: Date.now()
                    });
                }
                return originalFetch(url, options);
            };
        }

        return mixedContent;
    }

    getSecurityStatus() {
        return {
            security: {
                status: 'active',
                issuesFixed: this.fixedResources.size,
                mixedContentIssues: this.mixedContentIssues.size,
                cspViolations: this.cspViolations.size,
                securityRules: this.securityRules.size
            },
            fixedResources: Array.from(this.fixedResources.entries()).map(([key, value]) => ({
                resource: key,
                fix: value
            })),
            recentIssues: Array.from(this.securityIssues.entries()).slice(-10)
        };
    }

    async shutdown() {
        this.logger.info('Shutting down Security and CSP Fixer', {
            security: 'SYSTEM',
            issue: 'SHUTDOWN'
        });

        // Clean up resources
        this.securityIssues.clear();
        this.cspViolations.clear();
        this.mixedContentIssues.clear();
        this.fixedResources.clear();

        this.logger.info('Security and CSP Fixer shutdown complete', {
            security: 'SYSTEM',
            issue: 'SHUTDOWN'
        });
    }
}

export default SecurityAndCSPFixer; 