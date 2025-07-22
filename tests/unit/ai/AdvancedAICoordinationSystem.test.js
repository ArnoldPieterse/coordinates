/**
 * Advanced AI Coordination System Test Suite
 * Comprehensive tests for the advanced AI coordination system
 */

import { jest } from '@jest/globals';
import AdvancedAICoordinationSystem from '../../../src/ai/AdvancedAICoordinationSystem.js';
import AdvancedAICoordinator from '../../../src/ai/AdvancedAICoordinator.js';
import RealTimeAgentCommunication from '../../../src/ai/RealTimeAgentCommunication.js';
import QuantumDecisionEngine from '../../../src/ai/QuantumDecisionEngine.js';

// Mock services
const mockServices = new Map();
mockServices.set('gitIssueSolver', {
    executeTask: jest.fn().mockResolvedValue({ success: true, result: 'issue_solved' })
});
mockServices.set('aiResearcher', {
    executeTask: jest.fn().mockResolvedValue({ success: true, result: 'research_completed' })
});
mockServices.set('graphicsSpecialist', {
    executeTask: jest.fn().mockResolvedValue({ success: true, result: 'graphics_optimized' })
});
mockServices.set('mathematicalEngine', {
    executeTask: jest.fn().mockResolvedValue({ success: true, result: 'mathematical_analysis_complete' })
});
mockServices.set('performanceMonitor', {
    executeTask: jest.fn().mockResolvedValue({ success: true, result: 'performance_analyzed' })
});

describe('Advanced AI Coordination System', () => {
    let coordinationSystem;

    beforeEach(async () => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Create new coordination system instance
        coordinationSystem = new AdvancedAICoordinationSystem(mockServices);
        
        // Wait for initialization
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    afterEach(async () => {
        if (coordinationSystem) {
            await coordinationSystem.shutdown();
        }
    });

    describe('Initialization', () => {
        test('should initialize all components successfully', () => {
            expect(coordinationSystem.status).toBe('active');
            expect(coordinationSystem.quantumEngine).toBeInstanceOf(QuantumDecisionEngine);
            expect(coordinationSystem.communication).toBeInstanceOf(RealTimeAgentCommunication);
            expect(coordinationSystem.coordinator).toBeInstanceOf(AdvancedAICoordinator);
        });

        test('should have unique system ID', () => {
            expect(coordinationSystem.systemId).toBeDefined();
            expect(typeof coordinationSystem.systemId).toBe('string');
            expect(coordinationSystem.systemId.length).toBeGreaterThan(0);
        });

        test('should setup logging correctly', () => {
            expect(coordinationSystem.logger).toBeDefined();
            expect(coordinationSystem.logger.info).toBeDefined();
            expect(coordinationSystem.logger.error).toBeDefined();
        });

        test('should initialize system state', () => {
            expect(coordinationSystem.activeWorkflows).toBeInstanceOf(Map);
            expect(coordinationSystem.agentConnections).toBeInstanceOf(Map);
            expect(coordinationSystem.systemMetrics).toBeInstanceOf(Map);
        });
    });

    describe('Advanced Workflow Coordination', () => {
        test('should coordinate issue resolution workflow', async () => {
            const parameters = {
                issue: { id: 123, title: 'Test Issue', priority: 'high' },
                priority: 'high',
                urgency: 'high',
                complexity: 'medium'
            };

            const result = await coordinationSystem.coordinateAdvancedWorkflow('issue_resolution', parameters);

            expect(result).toBeDefined();
            expect(result.workflowId).toBeDefined();
            expect(result.type).toBe('issue_resolution');
            expect(result.strategy).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
            expect(result.result).toBeDefined();
            expect(result.duration).toBeGreaterThan(0);
        });

        test('should coordinate performance optimization workflow', async () => {
            const parameters = {
                target: 'gpu_streaming',
                priority: 'medium',
                urgency: 'normal',
                complexity: 'high'
            };

            const result = await coordinationSystem.coordinateAdvancedWorkflow('performance_optimization', parameters);

            expect(result).toBeDefined();
            expect(result.workflowId).toBeDefined();
            expect(result.type).toBe('performance_optimization');
            expect(result.strategy).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
        });

        test('should coordinate AI enhancement workflow', async () => {
            const parameters = {
                enhancement: 'algorithm_optimization',
                priority: 'low',
                urgency: 'low',
                complexity: 'medium'
            };

            const result = await coordinationSystem.coordinateAdvancedWorkflow('ai_enhancement', parameters);

            expect(result).toBeDefined();
            expect(result.workflowId).toBeDefined();
            expect(result.type).toBe('ai_enhancement');
            expect(result.strategy).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
        });

        test('should handle workflow errors gracefully', async () => {
            // Mock service to throw error
            mockServices.get('gitIssueSolver').executeTask.mockRejectedValue(new Error('Service unavailable'));

            const parameters = {
                issue: { id: 456, title: 'Error Issue', priority: 'high' }
            };

            await expect(
                coordinationSystem.coordinateAdvancedWorkflow('issue_resolution', parameters)
            ).rejects.toThrow('Service unavailable');
        });
    });

    describe('Agent Collaboration', () => {
        test('should coordinate sequential collaboration', async () => {
            const agents = ['gitIssueSolver', 'aiResearcher'];
            const task = 'analyze_and_optimize';
            const context = { priority: 'high' };

            const result = await coordinationSystem.coordinateAgentCollaboration(agents, task, context);

            expect(result).toBeDefined();
            expect(result.collaborationId).toBeDefined();
            expect(result.strategy).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
            expect(result.result).toBeDefined();
        });

        test('should coordinate parallel collaboration', async () => {
            const agents = ['graphicsSpecialist', 'mathematicalEngine'];
            const task = 'parallel_analysis';
            const context = { priority: 'medium' };

            const result = await coordinationSystem.coordinateAgentCollaboration(agents, task, context);

            expect(result).toBeDefined();
            expect(result.collaborationId).toBeDefined();
            expect(result.strategy).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
        });

        test('should coordinate hierarchical collaboration', async () => {
            const agents = ['performanceMonitor', 'gitIssueSolver', 'aiResearcher'];
            const task = 'hierarchical_optimization';
            const context = { priority: 'high' };

            const result = await coordinationSystem.coordinateAgentCollaboration(agents, task, context);

            expect(result).toBeDefined();
            expect(result.collaborationId).toBeDefined();
            expect(result.strategy).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
        });

        test('should coordinate distributed collaboration', async () => {
            const agents = ['gitIssueSolver', 'aiResearcher', 'graphicsSpecialist'];
            const task = 'distributed_analysis';
            const context = { priority: 'medium' };

            const result = await coordinationSystem.coordinateAgentCollaboration(agents, task, context);

            expect(result).toBeDefined();
            expect(result.collaborationId).toBeDefined();
            expect(result.strategy).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
        });

        test('should coordinate adaptive collaboration', async () => {
            const agents = ['mathematicalEngine', 'performanceMonitor'];
            const task = 'adaptive_optimization';
            const context = { priority: 'low' };

            const result = await coordinationSystem.coordinateAgentCollaboration(agents, task, context);

            expect(result).toBeDefined();
            expect(result.collaborationId).toBeDefined();
            expect(result.strategy).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
        });
    });

    describe('Quantum Decision Engine Integration', () => {
        test('should make quantum decisions for workflow strategy', async () => {
            const decision = await coordinationSystem.quantumEngine.makeQuantumDecision('workflow_decision', {
                workflowType: 'issue_resolution',
                priority: 'high',
                urgency: 'high',
                complexity: 'medium'
            });

            expect(decision).toBeDefined();
            expect(decision.decisionId).toBeDefined();
            expect(decision.type).toBe('workflow_decision');
            expect(decision.result).toBeDefined();
            expect(decision.confidence).toBeGreaterThan(0);
            expect(decision.confidence).toBeLessThanOrEqual(1);
        });

        test('should make quantum decisions for resource allocation', async () => {
            const decision = await coordinationSystem.quantumEngine.makeQuantumDecision('resource_allocation', {
                task: 'gpu_optimization',
                priority: 'high'
            });

            expect(decision).toBeDefined();
            expect(decision.decisionId).toBeDefined();
            expect(decision.type).toBe('resource_allocation');
            expect(decision.result).toBeDefined();
            expect(decision.confidence).toBeGreaterThan(0);
            expect(decision.confidence).toBeLessThanOrEqual(1);
        });

        test('should make quantum decisions for optimization strategy', async () => {
            const decision = await coordinationSystem.quantumEngine.makeQuantumDecision('optimization_strategy', {
                target: 'performance',
                priority: 'medium'
            });

            expect(decision).toBeDefined();
            expect(decision.decisionId).toBeDefined();
            expect(decision.type).toBe('optimization_strategy');
            expect(decision.result).toBeDefined();
            expect(decision.confidence).toBeGreaterThan(0);
            expect(decision.confidence).toBeLessThanOrEqual(1);
        });

        test('should make quantum decisions for agent coordination', async () => {
            const decision = await coordinationSystem.quantumEngine.makeQuantumDecision('agent_coordination', {
                agents: ['gitIssueSolver', 'aiResearcher'],
                task: 'collaboration'
            });

            expect(decision).toBeDefined();
            expect(decision.decisionId).toBeDefined();
            expect(decision.type).toBe('agent_coordination');
            expect(decision.result).toBeDefined();
            expect(decision.confidence).toBeGreaterThan(0);
            expect(decision.confidence).toBeLessThanOrEqual(1);
        });
    });

    describe('Real-Time Communication Integration', () => {
        test('should setup communication channels', () => {
            const channels = coordinationSystem.communication.channels;
            expect(channels).toBeDefined();
            expect(channels.size).toBeGreaterThan(0);

            // Check for expected channels
            const channelNames = Array.from(channels.keys());
            expect(channelNames).toContain('system');
            expect(channelNames).toContain('workflow');
            expect(channelNames).toContain('urgent');
            expect(channelNames).toContain('debug');
        });

        test('should handle message routing', () => {
            const routingRules = coordinationSystem.communication.routingRules;
            expect(routingRules).toBeDefined();
            expect(Object.keys(routingRules).length).toBeGreaterThan(0);

            // Check for expected routing rules
            expect(routingRules.workflow_update).toBeDefined();
            expect(routingRules.agent_status).toBeDefined();
            expect(routingRules.performance_alert).toBeDefined();
            expect(routingRules.error_report).toBeDefined();
        });

        test('should broadcast messages', () => {
            const message = {
                type: 'test_message',
                content: { test: 'data' }
            };

            const sentCount = coordinationSystem.communication.broadcastMessage(message, 'system');
            expect(sentCount).toBeDefined();
            expect(typeof sentCount).toBe('number');
        });
    });

    describe('System Monitoring', () => {
        test('should update system metrics', () => {
            coordinationSystem.updateSystemMetrics();
            
            const metrics = coordinationSystem.systemMetrics.get('system_health');
            expect(metrics).toBeDefined();
            expect(metrics.uptime).toBeGreaterThan(0);
            expect(metrics.activeWorkflows).toBeDefined();
            expect(metrics.agentConnections).toBeDefined();
            expect(metrics.quantumDecisions).toBeDefined();
            expect(metrics.communicationChannels).toBeDefined();
        });

        test('should monitor agent connections', () => {
            coordinationSystem.monitorAgentConnections();
            
            // Should not throw error
            expect(coordinationSystem.agentConnections).toBeInstanceOf(Map);
        });

        test('should monitor workflow performance', () => {
            coordinationSystem.monitorWorkflowPerformance();
            
            const performanceMetrics = coordinationSystem.systemMetrics.get('workflow_performance');
            expect(performanceMetrics).toBeDefined();
            expect(performanceMetrics.activeWorkflows).toBeDefined();
            expect(Array.isArray(performanceMetrics.activeWorkflows)).toBe(true);
        });
    });

    describe('System Status', () => {
        test('should return comprehensive system status', () => {
            const status = coordinationSystem.getSystemStatus();
            
            expect(status).toBeDefined();
            expect(status.system).toBeDefined();
            expect(status.system.id).toBe(coordinationSystem.systemId);
            expect(status.system.status).toBe(coordinationSystem.status);
            expect(status.system.uptime).toBeGreaterThan(0);
            
            expect(status.coordination).toBeDefined();
            expect(status.communication).toBeDefined();
            expect(status.quantum).toBeDefined();
            expect(status.metrics).toBeDefined();
            expect(status.activeWorkflows).toBeDefined();
        });

        test('should include quantum engine status', () => {
            const status = coordinationSystem.getSystemStatus();
            
            expect(status.quantum).toBeDefined();
            expect(status.quantum.quantum).toBeDefined();
            expect(status.quantum.superposition).toBeDefined();
            expect(status.quantum.entanglement).toBeDefined();
            expect(status.quantum.recentDecisions).toBeDefined();
        });

        test('should include communication status', () => {
            const status = coordinationSystem.getSystemStatus();
            
            expect(status.communication).toBeDefined();
            expect(status.communication.communication).toBeDefined();
            expect(status.communication.agents).toBeDefined();
            expect(status.communication.channels).toBeDefined();
            expect(status.communication.recentMessages).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        test('should handle initialization errors', async () => {
            // Mock service to throw error during initialization
            const errorServices = new Map();
            errorServices.set('gitIssueSolver', {
                executeTask: jest.fn().mockRejectedValue(new Error('Initialization failed'))
            });

            const errorSystem = new AdvancedAICoordinationSystem(errorServices);
            
            // Wait for initialization
            await new Promise(resolve => setTimeout(resolve, 100));
            
            expect(errorSystem.status).toBe('error');
            
            await errorSystem.shutdown();
        });

        test('should handle quantum decision errors', async () => {
            // Mock quantum engine to throw error
            jest.spyOn(coordinationSystem.quantumEngine, 'makeQuantumDecision')
                .mockRejectedValue(new Error('Quantum decision failed'));

            const parameters = {
                issue: { id: 789, title: 'Quantum Error Issue' }
            };

            await expect(
                coordinationSystem.coordinateAdvancedWorkflow('issue_resolution', parameters)
            ).rejects.toThrow('Quantum decision failed');
        });

        test('should handle communication errors', async () => {
            // Mock communication to throw error
            jest.spyOn(coordinationSystem.communication, 'broadcastMessage')
                .mockImplementation(() => {
                    throw new Error('Communication failed');
                });

            const agents = ['gitIssueSolver'];
            const task = 'test_task';
            const context = {};

            await expect(
                coordinationSystem.coordinateAgentCollaboration(agents, task, context)
            ).rejects.toThrow('Communication failed');
        });
    });

    describe('Performance Tests', () => {
        test('should handle multiple concurrent workflows', async () => {
            const workflows = [];
            const numWorkflows = 5;

            // Start multiple workflows concurrently
            for (let i = 0; i < numWorkflows; i++) {
                const parameters = {
                    issue: { id: i, title: `Concurrent Issue ${i}` },
                    priority: 'medium'
                };
                
                workflows.push(
                    coordinationSystem.coordinateAdvancedWorkflow('issue_resolution', parameters)
                );
            }

            // Wait for all workflows to complete
            const results = await Promise.all(workflows);

            expect(results).toHaveLength(numWorkflows);
            results.forEach(result => {
                expect(result).toBeDefined();
                expect(result.workflowId).toBeDefined();
                expect(result.result).toBeDefined();
            });
        });

        test('should handle multiple agent collaborations', async () => {
            const collaborations = [];
            const numCollaborations = 3;

            // Start multiple collaborations concurrently
            for (let i = 0; i < numCollaborations; i++) {
                const agents = ['gitIssueSolver', 'aiResearcher'];
                const task = `collaboration_task_${i}`;
                const context = { priority: 'medium' };
                
                collaborations.push(
                    coordinationSystem.coordinateAgentCollaboration(agents, task, context)
                );
            }

            // Wait for all collaborations to complete
            const results = await Promise.all(collaborations);

            expect(results).toHaveLength(numCollaborations);
            results.forEach(result => {
                expect(result).toBeDefined();
                expect(result.collaborationId).toBeDefined();
                expect(result.strategy).toBeDefined();
            });
        });
    });

    describe('Integration Tests', () => {
        test('should integrate all components for complex workflow', async () => {
            // Create complex workflow with multiple agents
            const agents = ['gitIssueSolver', 'aiResearcher', 'graphicsSpecialist'];
            const task = 'complex_optimization';
            const context = {
                priority: 'high',
                urgency: 'high',
                complexity: 'high'
            };

            // Coordinate agent collaboration
            const collaborationResult = await coordinationSystem.coordinateAgentCollaboration(agents, task, context);

            expect(collaborationResult).toBeDefined();
            expect(collaborationResult.collaborationId).toBeDefined();
            expect(collaborationResult.strategy).toBeDefined();
            expect(collaborationResult.confidence).toBeGreaterThan(0);

            // Coordinate advanced workflow
            const workflowResult = await coordinationSystem.coordinateAdvancedWorkflow('issue_resolution', {
                issue: { id: 999, title: 'Complex Integration Issue' },
                priority: 'high',
                urgency: 'high',
                complexity: 'high'
            });

            expect(workflowResult).toBeDefined();
            expect(workflowResult.workflowId).toBeDefined();
            expect(workflowResult.strategy).toBeDefined();
            expect(workflowResult.confidence).toBeGreaterThan(0);

            // Check system status
            const status = coordinationSystem.getSystemStatus();
            expect(status.system.status).toBe('active');
            expect(status.activeWorkflows.length).toBeGreaterThan(0);
        });

        test('should maintain system stability under load', async () => {
            const startTime = Date.now();
            const operations = [];

            // Perform multiple operations
            for (let i = 0; i < 10; i++) {
                operations.push(
                    coordinationSystem.coordinateAdvancedWorkflow('issue_resolution', {
                        issue: { id: i, title: `Load Test Issue ${i}` }
                    })
                );
            }

            const results = await Promise.all(operations);
            const endTime = Date.now();

            expect(results).toHaveLength(10);
            expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds

            // Check system is still stable
            const status = coordinationSystem.getSystemStatus();
            expect(status.system.status).toBe('active');
        });
    });
}); 