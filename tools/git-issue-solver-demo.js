#!/usr/bin/env node

/**
 * Git Issue Solver Team Demonstration
 * Shows the five-persona team working on GitHub issues systematically
 */

import GitIssueSolverTeam from '../src/personas/git-issue-solver/GitIssueSolverTeam.js';
import ServiceRegistry from '../src/core/DI/ServiceRegistry.js';

class GitIssueSolverDemo {
    constructor() {
        this.services = new ServiceRegistry();
        this.demoIssues = this.createDemoIssues();
        this.team = new GitIssueSolverTeam(this.services);
    }

    createDemoIssues() {
        return [
            {
                number: 1,
                title: 'Fix ESLint errors in mathematical-ai.js',
                body: `There are several unused variables and parameters that need to be cleaned up:

\`\`\`javascript
// Unused variables found:
let timeDilationFactor = 1.0; // Line 45
const unusedParameter = 'test'; // Line 67

// Unused parameters in functions:
function calculateInfluence(playerData, unusedParam) { // Line 89
    // playerData is used, but unusedParam is not
}
\`\`\`

Please review and fix all ESLint issues to maintain code quality.`,
                labels: [
                    { name: 'bug' },
                    { name: 'enhancement' },
                    { name: 'code-quality' }
                ],
                comments: 2,
                state: 'open'
            },
            {
                number: 2,
                title: 'Implement unit tests for Player component',
                body: `The Player component needs comprehensive unit tests to ensure reliability:

- Test player initialization
- Test movement mechanics
- Test damage and health systems
- Test respawn functionality
- Test UI updates

Please implement Jest tests with 90%+ coverage.`,
                labels: [
                    { name: 'feature' },
                    { name: 'testing' },
                    { name: 'enhancement' }
                ],
                comments: 1,
                state: 'open'
            },
            {
                number: 3,
                title: 'Optimize Three.js rendering performance',
                body: `Performance issues detected in the Three.js renderer:

- Frame rate drops during complex scenes
- Memory usage increases over time
- GPU utilization is suboptimal

Please implement:
1. Frustum culling
2. Level of detail (LOD) system
3. Object pooling
4. Texture optimization

Target: 60 FPS stable performance.`,
                labels: [
                    { name: 'performance' },
                    { name: 'optimization' },
                    { name: 'critical' }
                ],
                comments: 5,
                state: 'open'
            }
        ];
    }

    async runDemo() {
        console.log('🎯 Git Issue Solver Team Demonstration');
        console.log('=====================================\n');

        for (const issue of this.demoIssues) {
            await this.solveIssue(issue);
            console.log('\n' + '='.repeat(60) + '\n');
        }

        console.log('✅ All demo issues processed successfully!');
    }

    async solveIssue(issue) {
        console.log(`🚀 Starting work on Issue #${issue.number}: ${issue.title}`);
        console.log(`📋 Labels: ${issue.labels.map(l => l.name).join(', ')}`);
        console.log(`💬 Comments: ${issue.comments}`);
        console.log();

        // Register current issue service
        this.services.container.register('currentIssue', () => issue, false);

        try {
            const startTime = Date.now();
            const result = await this.team.solveIssue(issue);
            const duration = Date.now() - startTime;

            if (result.success) {
                console.log(`✅ Issue #${issue.number} completed successfully in ${duration}ms`);
                this.displayPhaseResults(result.phases);
                this.displaySummary(result.summary);
            } else {
                console.log(`❌ Issue #${issue.number} failed: ${result.error}`);
            }

        } catch (error) {
            console.log(`💥 Unexpected error processing issue #${issue.number}: ${error.message}`);
        }
    }

    displayPhaseResults(phases) {
        console.log('\n📊 Phase Results:');
        console.log('----------------');

        const phaseNames = {
            analysis: '🔍 Analysis',
            implementation: '💻 Implementation', 
            review: '👀 Code Review',
            testing: '🧪 Testing',
            deployment: '🚀 Deployment'
        };

        Object.entries(phases).forEach(([phase, result]) => {
            const status = result.success ? '✅' : '❌';
            const name = phaseNames[phase] || phase;
            console.log(`${status} ${name}: ${result.success ? 'Completed' : 'Failed'}`);
        });
    }

    displaySummary(summary) {
        console.log('\n📋 Workflow Summary:');
        console.log('-------------------');
        console.log(`Issue: #${summary.issueNumber} - ${summary.title}`);
        console.log(`Status: ${summary.workflowState}`);
        console.log(`Team Members: ${summary.teamMembers.join(', ')}`);
        console.log(`Completion Time: ${summary.completionTime}`);
        console.log(`Success: ${summary.success ? 'Yes' : 'No'}`);
    }

    async runInteractiveDemo() {
        console.log('🎮 Interactive Git Issue Solver Demo');
        console.log('===================================\n');

        console.log('Available demo issues:');
        this.demoIssues.forEach((issue, index) => {
            console.log(`${index + 1}. #${issue.number}: ${issue.title}`);
        });

        console.log('\nEnter issue number to solve (or "all" for all issues):');
        
        // In a real implementation, this would read from stdin
        // For demo purposes, we'll solve all issues
        console.log('Solving all issues...\n');
        await this.runDemo();
    }

    async runPerformanceTest() {
        console.log('⚡ Performance Test: Solving Multiple Issues');
        console.log('===========================================\n');

        const startTime = Date.now();
        const promises = this.demoIssues.map(issue => this.team.solveIssue(issue));
        
        const results = await Promise.all(promises);
        const totalTime = Date.now() - startTime;

        const successful = results.filter(r => r.success).length;
        const failed = results.length - successful;

        console.log(`📈 Performance Results:`);
        console.log(`Total Issues: ${results.length}`);
        console.log(`Successful: ${successful}`);
        console.log(`Failed: ${failed}`);
        console.log(`Total Time: ${totalTime}ms`);
        console.log(`Average Time per Issue: ${Math.round(totalTime / results.length)}ms`);
    }
}

// Main execution
async function main() {
    const demo = new GitIssueSolverDemo();
    
    const args = process.argv.slice(2);
    
    switch (args[0]) {
        case 'interactive':
            await demo.runInteractiveDemo();
            break;
        case 'performance':
            await demo.runPerformanceTest();
            break;
        default:
            await demo.runDemo();
    }
}

// Run the demo if this file is executed directly
if (process.argv[1] && process.argv[1].includes('git-issue-solver-demo.js')) {
    main().catch(console.error);
}

export default GitIssueSolverDemo; 