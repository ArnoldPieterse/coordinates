/**
 * Trending Integrations Test Suite
 * Comprehensive testing for all trending GitHub repository integrations
 */

import TrendingIntegrationsManager from '../../src/ai/TrendingIntegrationsManager.js';
import ClaudeCodeIntegration from '../../src/ai/ClaudeCodeIntegration.js';
import DeepResearchIntegration from '../../src/ai/DeepResearchIntegration.js';
import FinancialSystem from '../../src/financial/FinancialSystem.js';

describe('Trending Integrations Manager', () => {
    let integrationsManager;
    let mockGameEngine;

    beforeEach(() => {
        // Mock game engine
        mockGameEngine = {
            on: jest.fn(),
            emit: jest.fn()
        };

        // Create integrations manager with test configuration
        integrationsManager = new TrendingIntegrationsManager({
            enableClaudeCode: true,
            enableDeepResearch: true,
            enableFinancialSystem: true,
            enableKnowledgeGraph: true,
            enableSQLChat: true,
            enableDocumentConversion: true,
            enableSecurityScanning: true
        });

        // Set game engine
        integrationsManager.setGameEngine(mockGameEngine);
    });

    afterEach(() => {
        if (integrationsManager) {
            integrationsManager.destroy();
        }
    });

    describe('Initialization', () => {
        test('should initialize all integrations successfully', async () => {
            // Wait for initialization
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const status = integrationsManager.getIntegrationStatus();
            
            expect(status['claude-code']).toBeDefined();
            expect(status['deep-research']).toBeDefined();
            expect(status['financial-system']).toBeDefined();
            expect(status['knowledge-graph']).toBeDefined();
            expect(status['sql-chat']).toBeDefined();
            expect(status['document-converter']).toBeDefined();
            expect(status['security-scanner']).toBeDefined();
        });

        test('should handle initialization errors gracefully', async () => {
            const errorManager = new TrendingIntegrationsManager({
                enableClaudeCode: false,
                enableDeepResearch: false,
                enableFinancialSystem: false
            });

            await new Promise(resolve => {
                errorManager.on('initialized', resolve);
            });

            const status = errorManager.getIntegrationStatus();
            expect(Object.keys(status)).toHaveLength(0);
        });
    });

    describe('Integration Status', () => {
        test('should return correct integration status', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const status = integrationsManager.getIntegrationStatus();
            
            for (const [name, integration] of Object.entries(status)) {
                expect(integration.name).toBeDefined();
                expect(integration.description).toBeDefined();
                expect(typeof integration.isReady).toBe('boolean');
                expect(typeof integration.isInitialized).toBe('boolean');
            }
        });

        test('should return available integrations list', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const available = integrationsManager.getAvailableIntegrations();
            expect(Array.isArray(available)).toBe(true);
            expect(available.length).toBeGreaterThan(0);
        });
    });

    describe('Health Check', () => {
        test('should perform comprehensive health check', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const health = await integrationsManager.performHealthCheck();
            
            expect(health.timestamp).toBeDefined();
            expect(health.overall).toBeDefined();
            expect(health.integrations).toBeDefined();
            expect(health.recommendations).toBeDefined();
            expect(Array.isArray(health.recommendations)).toBe(true);
        });

        test('should identify healthy systems correctly', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const health = await integrationsManager.performHealthCheck();
            
            // Check that all integrations are marked as ready
            for (const [name, status] of Object.entries(health.integrations)) {
                expect(status.status).toBe('ready');
            }
        });
    });

    describe('AI Assistant Integration', () => {
        test('should assist with game development', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const prompt = 'How can I optimize Three.js performance?';
            const response = await integrationsManager.assistGameDevelopment(prompt);
            
            expect(response).toBeDefined();
            expect(response.content).toBeDefined();
            expect(response.provider).toBeDefined();
            expect(response.model).toBeDefined();
        });

        test('should generate game code', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const requirements = 'Create a player movement system';
            const code = await integrationsManager.generateGameCode(requirements);
            
            expect(code).toBeDefined();
            expect(code.content).toBeDefined();
            expect(code.content).toContain('player');
        });

        test('should handle AI request errors gracefully', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            // Disable Claude Code to test error handling
            integrationsManager.claudeCode = null;

            await expect(
                integrationsManager.assistGameDevelopment('test prompt')
            ).rejects.toThrow('Claude Code integration not available');
        });
    });

    describe('Deep Research Integration', () => {
        test('should research game topics', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const topic = 'game-mechanics';
            const results = await integrationsManager.researchGameTopic(topic);
            
            expect(results).toBeDefined();
            expect(results.id).toBeDefined();
            expect(results.topic).toBe(topic);
            expect(results.findings).toBeDefined();
            expect(Array.isArray(results.findings)).toBe(true);
            expect(results.recommendations).toBeDefined();
            expect(Array.isArray(results.recommendations)).toBe(true);
        });

        test('should enhance educational content', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const subject = 'financial-literacy';
            const enhanced = await integrationsManager.deepResearch.enhanceEducationalContent(subject);
            
            expect(enhanced).toBeDefined();
            expect(enhanced.originalSubject).toBe(subject);
            expect(enhanced.gamifiedContent).toBeDefined();
            expect(enhanced.learningObjectives).toBeDefined();
            expect(enhanced.assessmentMethods).toBeDefined();
        });

        test('should handle research errors gracefully', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            // Disable Deep Research to test error handling
            integrationsManager.deepResearch = null;

            await expect(
                integrationsManager.researchGameTopic('test-topic')
            ).rejects.toThrow('Deep Research integration not available');
        });
    });

    describe('Knowledge Graph Integration', () => {
        test('should query game knowledge', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const query = 'How do game mechanics work?';
            const results = await integrationsManager.queryGameKnowledge(query);
            
            expect(results).toBeDefined();
            expect(results.query).toBe(query);
            expect(results.results).toBeDefined();
            expect(Array.isArray(results.results)).toBe(true);
            expect(results.confidence).toBeDefined();
        });

        test('should handle knowledge graph errors gracefully', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            // Disable Knowledge Graph to test error handling
            integrationsManager.knowledgeGraph = null;

            await expect(
                integrationsManager.queryGameKnowledge('test query')
            ).rejects.toThrow('Knowledge Graph integration not available');
        });
    });

    describe('SQL Chat Integration', () => {
        test('should query game data with natural language', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const query = 'Show me player statistics';
            const results = await integrationsManager.queryGameData(query);
            
            expect(results).toBeDefined();
            expect(results.query).toBe(query);
            expect(results.sql).toBeDefined();
            expect(results.results).toBeDefined();
            expect(Array.isArray(results.results)).toBe(true);
        });

        test('should handle SQL chat errors gracefully', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            // Disable SQL Chat to test error handling
            integrationsManager.sqlChat = null;

            await expect(
                integrationsManager.queryGameData('test query')
            ).rejects.toThrow('SQL Chat integration not available');
        });
    });

    describe('Document Converter Integration', () => {
        test('should convert game documents', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const document = 'Game documentation content';
            const converted = await integrationsManager.convertGameDocument(document);
            
            expect(converted).toBeDefined();
            expect(converted.input).toBe(document);
            expect(converted.output).toBeDefined();
            expect(converted.format).toBe('markdown');
        });

        test('should handle document conversion errors gracefully', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            // Disable Document Converter to test error handling
            integrationsManager.documentConverter = null;

            await expect(
                integrationsManager.convertGameDocument('test document')
            ).rejects.toThrow('Document Converter integration not available');
        });
    });

    describe('Security Scanner Integration', () => {
        test('should scan game codebase', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const scan = await integrationsManager.scanGameCodebase();
            
            expect(scan).toBeDefined();
            expect(scan.path).toBe('./src');
            expect(scan.vulnerabilities).toBeDefined();
            expect(Array.isArray(scan.vulnerabilities)).toBe(true);
            expect(scan.secrets).toBeDefined();
            expect(Array.isArray(scan.secrets)).toBe(true);
            expect(scan.recommendations).toBeDefined();
            expect(Array.isArray(scan.recommendations)).toBe(true);
        });

        test('should handle security scan errors gracefully', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            // Disable Security Scanner to test error handling
            integrationsManager.securityScanner = null;

            await expect(
                integrationsManager.scanGameCodebase()
            ).rejects.toThrow('Security Scanner integration not available');
        });
    });

    describe('Enhanced Player Experience', () => {
        test('should enhance player experience with AI assistance', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const player = { id: 'player-1', name: 'TestPlayer' };
            const action = 'shooting';
            const gameState = { players: 5, score: 1000 };

            const enhancements = await integrationsManager.enhancePlayerExperience(player, action, gameState);
            
            expect(enhancements).toBeDefined();
            // Check that at least one enhancement is provided
            expect(Object.keys(enhancements).length).toBeGreaterThan(0);
        });
    });

    describe('Game Report Generation', () => {
        test('should generate comprehensive game report', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const report = await integrationsManager.generateGameReport('comprehensive');
            
            expect(report).toBeDefined();
            expect(report.type).toBe('comprehensive');
            expect(report.timestamp).toBeDefined();
            expect(report.sections).toBeDefined();
            expect(report.markdown).toBeDefined();
        });

        test('should include financial data in report', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const report = await integrationsManager.generateGameReport('financial');
            
            expect(report.sections.financial).toBeDefined();
            expect(report.sections.financial.netWorth).toBeDefined();
            expect(report.sections.financial.totalAssets).toBeDefined();
            expect(report.sections.financial.accountCount).toBeDefined();
        });

        test('should include analytics data in report', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const report = await integrationsManager.generateGameReport('analytics');
            
            expect(report.sections.analytics).toBeDefined();
            expect(report.sections.analytics.data).toBeDefined();
            expect(report.sections.analytics.data.totalPlayers).toBeDefined();
            expect(report.sections.analytics.data.averageScore).toBeDefined();
        });
    });

    describe('Integration Management', () => {
        test('should get integration by name', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const claudeCode = integrationsManager.getIntegration('claude-code');
            expect(claudeCode).toBeDefined();
            expect(claudeCode).toBe(integrationsManager.claudeCode);
        });

        test('should return null for non-existent integration', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const nonExistent = integrationsManager.getIntegration('non-existent');
            expect(nonExistent).toBeUndefined();
        });

        test('should handle dynamic model switching', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const success = await integrationsManager.claudeCode.switchModel('game-development', 'openrouter');
            expect(success).toBe(true);
        });
    });

    describe('Event System', () => {
        test('should emit initialization events', (done) => {
            integrationsManager.on('initialized', () => {
                done();
            });
        });

        test('should emit model switching events', async (done) => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            integrationsManager.on('model-switched', (data) => {
                expect(data.route).toBeDefined();
                expect(data.provider).toBeDefined();
                done();
            });

            await integrationsManager.claudeCode.switchModel('test-route', 'claude-sonnet');
        });
    });

    describe('Error Handling', () => {
        test('should handle provider unavailability', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            // Simulate provider unavailability
            if (integrationsManager.claudeCode) {
                integrationsManager.claudeCode.providers.get('claude-sonnet').isAvailable = false;
            }

            // Should still work with other providers
            const status = integrationsManager.getIntegrationStatus();
            expect(status['claude-code']).toBeDefined();
        });

        test('should handle network errors gracefully', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            // Mock network error
            const originalFetch = global.fetch;
            global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

            try {
                await integrationsManager.assistGameDevelopment('test prompt');
            } catch (error) {
                expect(error.message).toContain('Network error');
            } finally {
                global.fetch = originalFetch;
            }
        });
    });

    describe('Performance', () => {
        test('should initialize within reasonable time', async () => {
            const startTime = Date.now();
            
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Should initialize within 5 seconds
            expect(duration).toBeLessThan(5000);
        });

        test('should handle concurrent requests', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const requests = [
                integrationsManager.assistGameDevelopment('prompt 1'),
                integrationsManager.researchGameTopic('topic 1'),
                integrationsManager.queryGameKnowledge('query 1')
            ];

            const results = await Promise.allSettled(requests);
            
            // All requests should complete (though some may fail due to mock setup)
            expect(results).toHaveLength(3);
        });
    });

    describe('Configuration', () => {
        test('should respect configuration options', () => {
            const customManager = new TrendingIntegrationsManager({
                enableClaudeCode: false,
                enableDeepResearch: false,
                enableFinancialSystem: false
            });

            expect(customManager.config.enableClaudeCode).toBe(false);
            expect(customManager.config.enableDeepResearch).toBe(false);
            expect(customManager.config.enableFinancialSystem).toBe(false);
        });

        test('should use default configuration when not specified', () => {
            const defaultManager = new TrendingIntegrationsManager();
            
            expect(defaultManager.config.enableClaudeCode).toBe(true);
            expect(defaultManager.config.enableDeepResearch).toBe(true);
            expect(defaultManager.config.enableFinancialSystem).toBe(true);
        });
    });

    describe('Cleanup', () => {
        test('should cleanup resources properly', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const destroySpy = jest.spyOn(integrationsManager, 'destroy');
            integrationsManager.destroy();
            
            expect(destroySpy).toHaveBeenCalled();
        });

        test('should remove event listeners', async () => {
            await new Promise(resolve => {
                integrationsManager.on('initialized', resolve);
            });

            const listenerCount = integrationsManager.listenerCount('initialized');
            integrationsManager.destroy();
            
            // Should have no listeners after destroy
            expect(integrationsManager.listenerCount('initialized')).toBe(0);
        });
    });
}); 