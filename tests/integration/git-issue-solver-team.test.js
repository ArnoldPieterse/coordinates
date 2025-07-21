import GitIssueSolverTeam from '../../src/personas/git-issue-solver/GitIssueSolverTeam.js';
import ServiceRegistry from '../../src/core/DI/ServiceRegistry.js';

describe('Git Issue Solver Team Integration', () => {
    let team;
    let services;
    let mockIssue;

    beforeEach(() => {
        // Initialize service registry
        services = new ServiceRegistry();
        
        // Register current issue service
        services.container.register('currentIssue', () => ({ number: 123 }), false);
        
        // Initialize the team
        team = new GitIssueSolverTeam(services);
        
        // Mock GitHub issue
        mockIssue = {
            number: 123,
            title: 'Fix ESLint errors in mathematical-ai.js',
            body: 'There are several unused variables and parameters that need to be cleaned up. Please review and fix all ESLint issues.',
            labels: [
                { name: 'bug' },
                { name: 'enhancement' }
            ],
            comments: 3,
            state: 'open'
        };
    });

    describe('Team Initialization', () => {
        it('should initialize all five personas', () => {
            expect(team.personas.analyzer).toBeDefined();
            expect(team.personas.solver).toBeDefined();
            expect(team.personas.reviewer).toBeDefined();
            expect(team.personas.tester).toBeDefined();
            expect(team.personas.deployer).toBeDefined();
        });

        it('should start in idle state', () => {
            expect(team.workflowState).toBe('idle');
        });
    });

    describe('Complete Workflow', () => {
        it('should execute full workflow successfully', async () => {
            const result = await team.solveIssue(mockIssue);
            
            expect(result.success).toBe(true);
            expect(result.issue).toBe(mockIssue);
            expect(result.phases).toBeDefined();
            expect(result.phases.analysis).toBeDefined();
            expect(result.phases.implementation).toBeDefined();
            expect(result.phases.review).toBeDefined();
            expect(result.phases.testing).toBeDefined();
            expect(result.phases.deployment).toBeDefined();
        });

        it('should complete workflow in correct order', async () => {
            const result = await team.solveIssue(mockIssue);
            
            // Verify all phases completed successfully
            expect(result.phases.analysis.success).toBe(true);
            expect(result.phases.implementation.success).toBe(true);
            expect(result.phases.review.success).toBe(true);
            expect(result.phases.testing.success).toBe(true);
            expect(result.phases.deployment.success).toBe(true);
        });
    });

    describe('Issue Analysis Phase', () => {
        it('should analyze issue correctly', async () => {
            const analysis = await team.runAnalysisPhase(mockIssue);
            
            expect(analysis.success).toBe(true);
            expect(analysis.data.initialAssessment).toBeDefined();
            expect(analysis.data.deepAnalysis).toBeDefined();
            expect(analysis.data.handoff).toBeDefined();
            expect(analysis.recommendations).toBeDefined();
        });

        it('should categorize bug issues correctly', async () => {
            const analysis = await team.runAnalysisPhase(mockIssue);
            const assessment = analysis.data.initialAssessment;
            
            expect(assessment.category).toBe('bug-fix');
            expect(assessment.priority).toBe('medium');
        });
    });

    describe('Implementation Phase', () => {
        it('should implement solution based on analysis', async () => {
            const analysis = await team.runAnalysisPhase(mockIssue);
            const implementation = await team.runImplementationPhase(analysis);
            
            expect(implementation.success).toBe(true);
            expect(implementation.data.design).toBeDefined();
            expect(implementation.data.implementation).toBeDefined();
            expect(implementation.data.review).toBeDefined();
            expect(implementation.pullRequest).toBeDefined();
        });
    });

    describe('Code Review Phase', () => {
        it('should review implementation thoroughly', async () => {
            const analysis = await team.runAnalysisPhase(mockIssue);
            const implementation = await team.runImplementationPhase(analysis);
            const review = await team.runReviewPhase(implementation);
            
            expect(review.success).toBe(true);
            expect(review.data.codeReview).toBeDefined();
            expect(review.data.securityReview).toBeDefined();
            expect(review.data.performanceReview).toBeDefined();
            expect(review.approval).toBeDefined();
        });
    });

    describe('Testing Phase', () => {
        it('should test solution comprehensively', async () => {
            const analysis = await team.runAnalysisPhase(mockIssue);
            const implementation = await team.runImplementationPhase(analysis);
            const review = await team.runReviewPhase(implementation);
            const testing = await team.runTestingPhase(review);
            
            expect(testing.success).toBe(true);
            expect(testing.data.testStrategy).toBeDefined();
            expect(testing.data.testImplementation).toBeDefined();
            expect(testing.data.integrationTests).toBeDefined();
            expect(testing.data.e2eTests).toBeDefined();
            expect(testing.testReport).toBeDefined();
        });
    });

    describe('Deployment Phase', () => {
        it('should deploy solution safely', async () => {
            const analysis = await team.runAnalysisPhase(mockIssue);
            const implementation = await team.runImplementationPhase(analysis);
            const review = await team.runReviewPhase(implementation);
            const testing = await team.runTestingPhase(review);
            const deployment = await team.runDeploymentPhase(testing);
            
            expect(deployment.success).toBe(true);
            expect(deployment.data.deploymentPlan).toBeDefined();
            expect(deployment.data.deployment).toBeDefined();
            expect(deployment.data.validation).toBeDefined();
            expect(deployment.deploymentReport).toBeDefined();
        });
    });

    describe('Status Tracking', () => {
        it('should track workflow status correctly', async () => {
            expect(team.getStatus().workflowState).toBe('idle');
            
            const solvePromise = team.solveIssue(mockIssue);
            
            // Check status during execution
            expect(team.getStatus().workflowState).toBe('started');
            
            await solvePromise;
            
            // Check final status
            expect(team.getStatus().workflowState).toBe('completed');
        });

        it('should track persona statuses', () => {
            const status = team.getStatus();
            
            expect(status.personas).toHaveLength(5);
            status.personas.forEach(persona => {
                expect(persona.name).toBeDefined();
                expect(persona.status).toBeDefined();
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle workflow failures gracefully', async () => {
            // Mock a failure in the analysis phase
            const originalAnalyze = team.personas.analyzer.analyzeIssue;
            team.personas.analyzer.analyzeIssue = jest.fn().mockRejectedValue(new Error('Analysis failed'));
            
            const result = await team.solveIssue(mockIssue);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('Analysis failed');
            expect(team.workflowState).toBe('failed');
            
            // Restore original method
            team.personas.analyzer.analyzeIssue = originalAnalyze;
        });
    });

    describe('Summary Generation', () => {
        it('should generate comprehensive summary', async () => {
            await team.solveIssue(mockIssue);
            const summary = team.generateSummary();
            
            expect(summary.issueNumber).toBe(123);
            expect(summary.title).toBe(mockIssue.title);
            expect(summary.workflowState).toBe('completed');
            expect(summary.teamMembers).toHaveLength(5);
            expect(summary.success).toBe(true);
        });
    });
}); 