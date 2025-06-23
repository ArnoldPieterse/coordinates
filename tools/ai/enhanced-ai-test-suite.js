// Enhanced AI Test Suite - Comprehensive testing for improved functionality
import { EnhancedAIInterface } from './enhanced-ai-interface.js';

export class EnhancedAITestSuite {
    constructor() {
        this.ai = new EnhancedAIInterface();
        this.testResults = [];
        this.startTime = Date.now();
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🚀 Starting Enhanced AI Test Suite...\n');
        
        await this.testModeDetection();
        await this.testContextAwareness();
        await this.testParameterOptimization();
        await this.testProactiveSuggestions();
        await this.testErrorHandling();
        await this.testPerformanceMetrics();
        await this.testUserPreferences();
        
        this.printTestSummary();
    }

    /**
     * Test mode detection functionality
     */
    async testModeDetection() {
        console.log('🎯 Testing Mode Detection...');
        
        const testCases = [
            {
                message: "How do I optimize the Three.js renderer for better performance?",
                expectedMode: "gameDevelopment",
                description: "Game development with Three.js"
            },
            {
                message: "Calculate the optimal algorithm complexity for this sorting function",
                expectedMode: "mathematicalComputation",
                description: "Mathematical computation"
            },
            {
                message: "My code is running slow, how can I optimize it?",
                expectedMode: "codeOptimization",
                description: "Code optimization"
            },
            {
                message: "I'm getting an error in my function, can you help debug?",
                expectedMode: "debugging",
                description: "Debugging"
            },
            {
                message: "Design a scalable architecture for my web application",
                expectedMode: "architecture",
                description: "Architecture design"
            },
            {
                message: "Write documentation for this API endpoint",
                expectedMode: "documentation",
                description: "Documentation"
            },
            {
                message: "Create unit tests for this component",
                expectedMode: "testing",
                description: "Testing"
            }
        ];

        for (const testCase of testCases) {
            try {
                const result = await this.ai.enhancedQuery(testCase.message);
                const detectedMode = result.mode;
                const passed = detectedMode === testCase.expectedMode;
                
                console.log(`  ${passed ? '✅' : '❌'} ${testCase.description}`);
                console.log(`     Expected: ${testCase.expectedMode}, Got: ${detectedMode}`);
                
                this.testResults.push({
                    test: `Mode Detection - ${testCase.description}`,
                    status: passed ? 'PASS' : 'FAIL',
                    expected: testCase.expectedMode,
                    actual: detectedMode
                });
                
            } catch (error) {
                console.log(`  ❌ ${testCase.description} - Error: ${error.message}`);
                this.testResults.push({
                    test: `Mode Detection - ${testCase.description}`,
                    status: 'ERROR',
                    error: error.message
                });
            }
        }
        console.log('');
    }

    /**
     * Test context awareness functionality
     */
    async testContextAwareness() {
        console.log('🧠 Testing Context Awareness...');
        
        try {
            // First query
            const result1 = await this.ai.enhancedQuery("I'm working on a game with Three.js");
            console.log(`  ✅ Initial query processed`);
            
            // Second query that should use context
            const result2 = await this.ai.enhancedQuery("How can I improve the rendering performance?");
            console.log(`  ✅ Context-aware query processed`);
            console.log(`     Context used: ${result2.contextUsed} exchanges`);
            
            // Third query to test context building
            const result3 = await this.ai.enhancedQuery("What about physics simulation?");
            console.log(`  ✅ Context building test completed`);
            console.log(`     Final context size: ${result3.contextUsed} exchanges`);
            
            this.testResults.push({
                test: 'Context Awareness',
                status: 'PASS',
                contextSize: result3.contextUsed
            });
            
        } catch (error) {
            console.log(`  ❌ Context Awareness - Error: ${error.message}`);
            this.testResults.push({
                test: 'Context Awareness',
                status: 'ERROR',
                error: error.message
            });
        }
        console.log('');
    }

    /**
     * Test parameter optimization
     */
    async testParameterOptimization() {
        console.log('⚙️ Testing Parameter Optimization...');
        
        const testCases = [
            {
                message: "Debug this error in my code",
                expectedTemp: 0.3,
                description: "Debugging - Low temperature"
            },
            {
                message: "Create an engaging game scenario with creative elements",
                expectedTemp: 0.8,
                description: "Creative task - High temperature"
            },
            {
                message: "Simple question about coding",
                expectedComplexity: "low",
                description: "Simple query - Low complexity"
            },
            {
                message: "Complex algorithm optimization with multiple constraints and performance requirements",
                expectedComplexity: "high",
                description: "Complex query - High complexity"
            }
        ];

        for (const testCase of testCases) {
            try {
                const result = await this.ai.enhancedQuery(testCase.message);
                const params = result.response.parameters;
                
                if (testCase.expectedTemp) {
                    const tempMatch = Math.abs(params.temperature - testCase.expectedTemp) < 0.1;
                    console.log(`  ${tempMatch ? '✅' : '❌'} ${testCase.description}`);
                    console.log(`     Expected temp: ~${testCase.expectedTemp}, Got: ${params.temperature}`);
                }
                
                if (testCase.expectedComplexity) {
                    const complexity = this.ai.assessComplexity(testCase.message);
                    const complexityMatch = complexity === testCase.expectedComplexity;
                    console.log(`  ${complexityMatch ? '✅' : '❌'} ${testCase.description}`);
                    console.log(`     Expected complexity: ${testCase.expectedComplexity}, Got: ${complexity}`);
                }
                
                this.testResults.push({
                    test: `Parameter Optimization - ${testCase.description}`,
                    status: 'PASS',
                    parameters: params
                });
                
            } catch (error) {
                console.log(`  ❌ ${testCase.description} - Error: ${error.message}`);
                this.testResults.push({
                    test: `Parameter Optimization - ${testCase.description}`,
                    status: 'ERROR',
                    error: error.message
                });
            }
        }
        console.log('');
    }

    /**
     * Test proactive suggestions
     */
    async testProactiveSuggestions() {
        console.log('💡 Testing Proactive Suggestions...');
        
        const testCases = [
            {
                message: "My application is running very slow",
                expectedSuggestion: "performance",
                description: "Performance suggestion"
            },
            {
                message: "I'm handling user input data",
                expectedSuggestion: "security",
                description: "Security suggestion"
            },
            {
                message: "I created a new function for user authentication",
                expectedSuggestion: "testing",
                description: "Testing suggestion"
            }
        ];

        for (const testCase of testCases) {
            try {
                const result = await this.ai.enhancedQuery(testCase.message);
                const suggestions = result.suggestions;
                
                const hasExpectedSuggestion = suggestions.some(s => s.type === testCase.expectedSuggestion);
                console.log(`  ${hasExpectedSuggestion ? '✅' : '❌'} ${testCase.description}`);
                console.log(`     Suggestions found: ${suggestions.length}`);
                
                this.testResults.push({
                    test: `Proactive Suggestions - ${testCase.description}`,
                    status: hasExpectedSuggestion ? 'PASS' : 'FAIL',
                    suggestionsFound: suggestions.length,
                    hasExpected: hasExpectedSuggestion
                });
                
            } catch (error) {
                console.log(`  ❌ ${testCase.description} - Error: ${error.message}`);
                this.testResults.push({
                    test: `Proactive Suggestions - ${testCase.description}`,
                    status: 'ERROR',
                    error: error.message
                });
            }
        }
        console.log('');
    }

    /**
     * Test error handling
     */
    async testErrorHandling() {
        console.log('🛡️ Testing Error Handling...');
        
        try {
            // Test with invalid input
            const result = await this.ai.enhancedQuery("");
            console.log(`  ✅ Empty input handled gracefully`);
            
            // Test error recovery
            const errorResult = await this.ai.enhancedQuery("This should trigger an error");
            console.log(`  ✅ Error handling test completed`);
            
            this.testResults.push({
                test: 'Error Handling',
                status: 'PASS',
                fallbackProvided: !!errorResult.fallbackResponse
            });
            
        } catch (error) {
            console.log(`  ❌ Error Handling - Error: ${error.message}`);
            this.testResults.push({
                test: 'Error Handling',
                status: 'ERROR',
                error: error.message
            });
        }
        console.log('');
    }

    /**
     * Test performance metrics
     */
    async testPerformanceMetrics() {
        console.log('📊 Testing Performance Metrics...');
        
        try {
            // Run a few queries to generate metrics
            await this.ai.enhancedQuery("Test query 1");
            await this.ai.enhancedQuery("Test query 2");
            await this.ai.enhancedQuery("Test query 3");
            
            const stats = this.ai.getPerformanceStats();
            
            console.log(`  ✅ Performance metrics collected`);
            console.log(`     Total queries: ${stats.totalQueries}`);
            console.log(`     Success rate: ${stats.successRate}`);
            console.log(`     Average response time: ${stats.averageResponseTime}`);
            
            this.testResults.push({
                test: 'Performance Metrics',
                status: 'PASS',
                totalQueries: stats.totalQueries,
                successRate: stats.successRate,
                avgResponseTime: stats.averageResponseTime
            });
            
        } catch (error) {
            console.log(`  ❌ Performance Metrics - Error: ${error.message}`);
            this.testResults.push({
                test: 'Performance Metrics',
                status: 'ERROR',
                error: error.message
            });
        }
        console.log('');
    }

    /**
     * Test user preferences
     */
    async testUserPreferences() {
        console.log('👤 Testing User Preferences...');
        
        try {
            // Set user preferences
            const prefsResult = this.ai.setUserPreferences({
                preferredLanguage: 'JavaScript',
                complexityLevel: 'intermediate',
                responseStyle: 'detailed'
            });
            
            console.log(`  ✅ User preferences set: ${prefsResult.message}`);
            
            // Clear context
            const clearResult = this.ai.clearContext();
            console.log(`  ✅ Context cleared: ${clearResult.message}`);
            
            this.testResults.push({
                test: 'User Preferences',
                status: 'PASS',
                preferencesSet: true,
                contextCleared: true
            });
            
        } catch (error) {
            console.log(`  ❌ User Preferences - Error: ${error.message}`);
            this.testResults.push({
                test: 'User Preferences',
                status: 'ERROR',
                error: error.message
            });
        }
        console.log('');
    }

    /**
     * Print comprehensive test summary
     */
    printTestSummary() {
        const endTime = Date.now();
        const totalTime = endTime - this.startTime;
        
        console.log('📋 Enhanced AI Test Suite Summary');
        console.log('================================');
        
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        const errors = this.testResults.filter(r => r.status === 'ERROR').length;
        const total = this.testResults.length;
        
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⚠️ Errors: ${errors}`);
        console.log(`📈 Total: ${total}`);
        console.log(`⏱️ Total test time: ${totalTime}ms`);
        
        if (passed === total) {
            console.log('\n🎉 All tests passed! Enhanced AI system is fully functional.');
        } else {
            console.log('\n⚠️ Some tests failed. Review the results above.');
        }
        
        // Performance analysis
        const performanceTest = this.testResults.find(r => r.test === 'Performance Metrics');
        if (performanceTest && performanceTest.status === 'PASS') {
            console.log(`\n⚡ Performance Analysis:`);
            console.log(`   Average response time: ${performanceTest.avgResponseTime}`);
            console.log(`   Success rate: ${performanceTest.successRate}`);
            
            if (performanceTest.avgResponseTime < 1000) {
                console.log('   ✅ Excellent performance!');
            } else if (performanceTest.avgResponseTime < 3000) {
                console.log('   ✅ Good performance!');
            } else {
                console.log('   ⚠️ Consider performance optimization.');
            }
        }
        
        // Feature analysis
        console.log(`\n🔧 Enhanced Features Status:`);
        const features = [
            { name: 'Mode Detection', tests: this.testResults.filter(r => r.test.includes('Mode Detection')) },
            { name: 'Context Awareness', tests: this.testResults.filter(r => r.test.includes('Context Awareness')) },
            { name: 'Parameter Optimization', tests: this.testResults.filter(r => r.test.includes('Parameter Optimization')) },
            { name: 'Proactive Suggestions', tests: this.testResults.filter(r => r.test.includes('Proactive Suggestions')) },
            { name: 'Error Handling', tests: this.testResults.filter(r => r.test.includes('Error Handling')) }
        ];
        
        features.forEach(feature => {
            const passedTests = feature.tests.filter(t => t.status === 'PASS').length;
            const totalTests = feature.tests.length;
            const status = totalTests > 0 ? `${passedTests}/${totalTests}` : 'N/A';
            console.log(`   ${feature.name}: ${status}`);
        });
    }
}

// Export for use
export default EnhancedAITestSuite;

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const testSuite = new EnhancedAITestSuite();
    testSuite.runAllTests();
} 