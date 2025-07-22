/**
 * Security and Error Handling Integration Test
 * Tests the complete integration of AI error handling and security fixes
 */

import { jest } from '@jest/globals';
import AIErrorHandler from '../../src/ai/AIErrorHandler.js';
import SecurityAndCSPFixer from '../../src/security/SecurityAndCSPFixer.js';
import AdvancedAICoordinationSystem from '../../src/ai/AdvancedAICoordinationSystem.js';

// Mock services
const mockServices = new Map();
mockServices.set('gitIssueSolver', {
    executeTask: jest.fn().mockResolvedValue({ success: true, result: 'issue_solved' })
});

describe('Security and Error Handling Integration', () => {
    let aiErrorHandler;
    let securityFixer;
    let aiCoordinationSystem;

    beforeEach(async () => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Initialize components
        aiErrorHandler = new AIErrorHandler();
        securityFixer = new SecurityAndCSPFixer();
        aiCoordinationSystem = new AdvancedAICoordinationSystem(mockServices);
        
        // Wait for initialization
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    afterEach(async () => {
        if (aiErrorHandler) await aiErrorHandler.shutdown();
        if (securityFixer) await securityFixer.shutdown();
        if (aiCoordinationSystem) await aiCoordinationSystem.shutdown();
    });

    describe('AI Error Handler', () => {
        test('should handle LLM generation failures', async () => {
            const error = new Error('anthropic_free connection failed: LLM generation failed: Failed to fetch');
            const context = { provider: 'anthropic_free', prompt: 'test prompt' };

            const result = await aiErrorHandler.handleError(error, context);

            expect(result).toBeDefined();
            expect(result.errorId).toBeDefined();
            expect(result.error.type).toBe('llm_generation_failed');
            expect(result.error.provider).toBe('anthropic_free');
        });

        test('should handle authentication failures', async () => {
            const error = new Error('OpenAI API error: Error: OpenAI API error: 401');
            const context = { provider: 'openai_free', prompt: 'test prompt' };

            const result = await aiErrorHandler.handleError(error, context);

            expect(result).toBeDefined();
            expect(result.error.type).toBe('authentication_failed');
            expect(result.error.provider).toBe('openai_free');
        });

        test('should handle connection failures', async () => {
            const error = new Error('Terminal connection failed: Failed to fetch');
            const context = { provider: 'local_lm_studio', prompt: 'test prompt' };

            const result = await aiErrorHandler.handleError(error, context);

            expect(result).toBeDefined();
            expect(result.error.type).toBe('terminal_connection_failed');
            expect(result.error.provider).toBe('local_lm_studio');
        });

        test('should handle mixed content errors', async () => {
            const error = new Error('Mixed Content: The page was loaded over HTTPS, but requested an insecure resource');
            const context = { provider: 'browser', url: 'https://www.rekursing.com' };

            const result = await aiErrorHandler.handleError(error, context);

            expect(result).toBeDefined();
            expect(result.error.type).toBe('mixed_content');
            expect(result.error.provider).toBe('browser');
        });

        test('should provide fallback providers', async () => {
            const fallbacks = aiErrorHandler.fallbackProviders.get('anthropic_free');
            
            expect(fallbacks).toBeDefined();
            expect(Array.isArray(fallbacks)).toBe(true);
            expect(fallbacks).toContain('openai_free');
            expect(fallbacks).toContain('local_lm_studio');
        });

        test('should track error history', async () => {
            const error = new Error('Test error');
            const context = { provider: 'test' };

            await aiErrorHandler.handleError(error, context);
            const history = aiErrorHandler.getErrorHistory();

            expect(history.length).toBeGreaterThan(0);
            expect(history[0].provider).toBe('test');
        });

        test('should monitor provider health', async () => {
            const error = new Error('LLM generation failed');
            const context = { provider: 'anthropic_free' };

            await aiErrorHandler.handleError(error, context);
            const health = aiErrorHandler.getHealthStatus();

            expect(health).toBeDefined();
            expect(Array.isArray(health)).toBe(true);
            
            const anthropicHealth = health.find(h => h.provider === 'anthropic_free');
            expect(anthropicHealth).toBeDefined();
            expect(anthropicHealth.errorCount).toBeGreaterThan(0);
        });
    });

    describe('Security and CSP Fixer', () => {
        test('should fix mixed content issues', async () => {
            const result = await securityFixer.fixSecurityIssues();

            expect(result).toBeDefined();
            expect(result.success).toBe(true);
            expect(result.mixedContentFixed).toBeGreaterThan(0);
        });

        test('should generate CSP headers', async () => {
            const headers = await securityFixer.updateSecurityHeaders();

            expect(headers).toBeDefined();
            expect(headers['Content-Security-Policy']).toBeDefined();
            expect(headers['X-Content-Type-Options']).toBe('nosniff');
            expect(headers['X-Frame-Options']).toBe('DENY');
            expect(headers['X-XSS-Protection']).toBe('1; mode=block');
        });

        test('should convert HTTP to HTTPS', async () => {
            const fromUrl = 'http://10.3.129.26:1234/v1/models';
            const toUrl = 'https://10.3.129.26:1234/v1/models';

            await securityFixer.convertHttpToHttps(fromUrl, toUrl);
            const fixedResources = securityFixer.fixedResources.get(fromUrl);

            expect(fixedResources).toBeDefined();
            expect(fixedResources.type).toBe('http_to_https');
            expect(fixedResources.from).toBe(fromUrl);
            expect(fixedResources.to).toBe(toUrl);
        });

        test('should detect security issues', () => {
            const issues = securityFixer.detectSecurityIssues();

            expect(Array.isArray(issues)).toBe(true);
        });

        test('should provide security status', () => {
            const status = securityFixer.getSecurityStatus();

            expect(status).toBeDefined();
            expect(status.security).toBeDefined();
            expect(status.security.status).toBe('active');
            expect(status.fixedResources).toBeDefined();
        });
    });

    describe('Advanced AI Coordination System', () => {
        test('should coordinate workflows with error handling', async () => {
            const result = await aiCoordinationSystem.coordinateAdvancedWorkflow('issue_resolution', {
                issue: { id: 123, title: 'Test Issue', priority: 'medium' },
                priority: 'medium',
                urgency: 'normal',
                complexity: 'medium'
            });

            expect(result).toBeDefined();
            expect(result.workflowId).toBeDefined();
            expect(result.type).toBe('issue_resolution');
            expect(result.strategy).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
        });

        test('should coordinate agent collaboration', async () => {
            const result = await aiCoordinationSystem.coordinateAgentCollaboration(
                ['gitIssueSolver', 'aiResearcher'],
                'test_collaboration',
                { priority: 'medium' }
            );

            expect(result).toBeDefined();
            expect(result.collaborationId).toBeDefined();
            expect(result.strategy).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
        });

        test('should provide system status', () => {
            const status = aiCoordinationSystem.getSystemStatus();

            expect(status).toBeDefined();
            expect(status.system).toBeDefined();
            expect(status.system.status).toBe('active');
            expect(status.coordination).toBeDefined();
            expect(status.communication).toBeDefined();
            expect(status.quantum).toBeDefined();
        });
    });

    describe('Integration Scenarios', () => {
        test('should handle complete error scenario', async () => {
            // Simulate LLM generation failure
            const llmError = new Error('anthropic_free connection failed: LLM generation failed: Failed to fetch');
            const llmContext = { provider: 'anthropic_free', prompt: 'test prompt' };

            const llmResult = await aiErrorHandler.handleError(llmError, llmContext);
            expect(llmResult.error.type).toBe('llm_generation_failed');

            // Fix security issues
            const securityResult = await securityFixer.fixSecurityIssues();
            expect(securityResult.success).toBe(true);

            // Coordinate AI workflow
            const workflowResult = await aiCoordinationSystem.coordinateAdvancedWorkflow('issue_resolution', {
                issue: { id: 456, title: 'Integration Test Issue', priority: 'high' },
                priority: 'high',
                urgency: 'high',
                complexity: 'medium'
            });

            expect(workflowResult).toBeDefined();
            expect(workflowResult.strategy).toBeDefined();
        });

        test('should handle mixed content and authentication errors', async () => {
            // Simulate mixed content error
            const mixedContentError = new Error('Mixed Content: HTTP request blocked');
            const mixedContentContext = { provider: 'browser' };

            const mixedContentResult = await aiErrorHandler.handleError(mixedContentError, mixedContentContext);
            expect(mixedContentResult.error.type).toBe('mixed_content');

            // Simulate authentication error
            const authError = new Error('OpenAI API error: 401 Unauthorized');
            const authContext = { provider: 'openai_free' };

            const authResult = await aiErrorHandler.handleError(authError, authContext);
            expect(authResult.error.type).toBe('authentication_failed');

            // Verify security fixes
            const securityStatus = securityFixer.getSecurityStatus();
            expect(securityStatus.security.issuesFixed).toBeGreaterThan(0);
        });

        test('should coordinate multiple agents with error recovery', async () => {
            // Coordinate multiple agents
            const collaborationResult = await aiCoordinationSystem.coordinateAgentCollaboration(
                ['gitIssueSolver', 'aiResearcher', 'graphicsSpecialist'],
                'complex_optimization',
                { priority: 'high', urgency: 'high', complexity: 'high' }
            );

            expect(collaborationResult).toBeDefined();
            expect(collaborationResult.strategy).toBeDefined();

            // Simulate error during collaboration
            const error = new Error('Collaboration error');
            const errorContext = { provider: 'collaboration' };

            const errorResult = await aiErrorHandler.handleError(error, errorContext);
            expect(errorResult).toBeDefined();

            // Verify system still functional
            const systemStatus = aiCoordinationSystem.getSystemStatus();
            expect(systemStatus.system.status).toBe('active');
        });
    });

    describe('Performance and Reliability', () => {
        test('should handle multiple concurrent errors', async () => {
            const errors = [];
            const numErrors = 5;

            // Generate multiple errors concurrently
            for (let i = 0; i < numErrors; i++) {
                const error = new Error(`Test error ${i}`);
                const context = { provider: `provider_${i}` };
                errors.push(aiErrorHandler.handleError(error, context));
            }

            const results = await Promise.all(errors);

            expect(results).toHaveLength(numErrors);
            results.forEach(result => {
                expect(result).toBeDefined();
                expect(result.errorId).toBeDefined();
            });
        });

        test('should maintain system stability under load', async () => {
            const startTime = Date.now();
            const operations = [];

            // Perform multiple operations
            for (let i = 0; i < 10; i++) {
                operations.push(
                    aiCoordinationSystem.coordinateAdvancedWorkflow('issue_resolution', {
                        issue: { id: i, title: `Load Test Issue ${i}` }
                    })
                );
            }

            const results = await Promise.all(operations);
            const endTime = Date.now();

            expect(results).toHaveLength(10);
            expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds

            // Verify system is still stable
            const status = aiCoordinationSystem.getSystemStatus();
            expect(status.system.status).toBe('active');
        });

        test('should recover from errors gracefully', async () => {
            // Simulate a series of errors
            const errorSequence = [
                { error: new Error('LLM generation failed'), provider: 'anthropic_free' },
                { error: new Error('Authentication failed'), provider: 'openai_free' },
                { error: new Error('Connection failed'), provider: 'local_lm_studio' },
                { error: new Error('Mixed content error'), provider: 'browser' }
            ];

            for (const { error, provider } of errorSequence) {
                const context = { provider, timestamp: Date.now() };
                const result = await aiErrorHandler.handleError(error, context);
                expect(result).toBeDefined();
            }

            // Verify error handler is still functional
            const healthStatus = aiErrorHandler.getHealthStatus();
            expect(healthStatus).toBeDefined();
            expect(Array.isArray(healthStatus)).toBe(true);
        });
    });

    describe('Error Recovery Strategies', () => {
        test('should implement retry strategies', () => {
            const strategies = aiErrorHandler.retryStrategies;

            expect(strategies.get('llm_generation_failed')).toBeDefined();
            expect(strategies.get('authentication_failed')).toBeDefined();
            expect(strategies.get('connection_failed')).toBeDefined();
            expect(strategies.get('mixed_content')).toBeDefined();

            // Verify strategy properties
            const llmStrategy = strategies.get('llm_generation_failed');
            expect(llmStrategy.maxRetries).toBe(3);
            expect(llmStrategy.backoffMultiplier).toBe(2);
            expect(llmStrategy.initialDelay).toBe(1000);
        });

        test('should provide fallback mechanisms', () => {
            const fallbacks = aiErrorHandler.fallbackProviders;

            expect(fallbacks.get('anthropic_free')).toBeDefined();
            expect(fallbacks.get('openai_free')).toBeDefined();
            expect(fallbacks.get('local_lm_studio')).toBeDefined();

            // Verify fallback chains
            const anthropicFallbacks = fallbacks.get('anthropic_free');
            expect(anthropicFallbacks).toContain('openai_free');
            expect(anthropicFallbacks).toContain('local_lm_studio');
        });

        test('should categorize errors correctly', () => {
            const testCases = [
                {
                    error: new Error('anthropic_free connection failed: LLM generation failed'),
                    expectedType: 'llm_generation_failed'
                },
                {
                    error: new Error('OpenAI API error: 401 Unauthorized'),
                    expectedType: 'authentication_failed'
                },
                {
                    error: new Error('Terminal connection failed: Failed to fetch'),
                    expectedType: 'terminal_connection_failed'
                },
                {
                    error: new Error('Mixed Content: HTTP request blocked'),
                    expectedType: 'mixed_content'
                }
            ];

            testCases.forEach(({ error, expectedType }) => {
                const actualType = aiErrorHandler.categorizeError(error);
                expect(actualType).toBe(expectedType);
            });
        });
    });
}); 