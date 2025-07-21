/**
 * Simple Live Version Test
 * Tests basic functionality without browser automation
 */

const https = require('https');
const http = require('http');
const fs = require('fs');

class SimpleLiveTester {
    constructor() {
        this.baseUrl = 'https://www.rekursing.com';
        this.localUrl = 'http://localhost:4173';
        this.testResults = [];
    }

    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            const client = url.startsWith('https') ? https : http;
            
            client.get(url, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: data
                    });
                });
            }).on('error', (err) => {
                reject(err);
            });
        });
    }

    addResult(testName, passed, details) {
        const result = {
            test: testName,
            passed,
            details,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${testName}: ${details}`);
    }

    async testLiveSite() {
        console.log('🌐 Testing Live Site...\n');
        
        try {
            const response = await this.makeRequest(this.baseUrl);
            
            this.addResult('Live Site Status', response.statusCode === 200, `Status: ${response.statusCode}`);
            this.addResult('Live Site Content', response.body.length > 0, `Content length: ${response.body.length} bytes`);
            this.addResult('Live Site HTML', response.body.includes('<!DOCTYPE html>'), 'Valid HTML document');
            this.addResult('Live Site Title', response.body.includes('Rekursing'), 'Contains "Rekursing" in content');
            
        } catch (error) {
            this.addResult('Live Site Access', false, `Error: ${error.message}`);
        }
    }

    async testLocalPreview() {
        console.log('\n🏠 Testing Local Preview...\n');
        
        try {
            const response = await this.makeRequest(this.localUrl);
            
            this.addResult('Local Preview Status', response.statusCode === 200, `Status: ${response.statusCode}`);
            this.addResult('Local Preview Content', response.body.length > 0, `Content length: ${response.body.length} bytes`);
            this.addResult('Local Preview HTML', response.body.includes('<!DOCTYPE html>'), 'Valid HTML document');
            this.addResult('Local Preview Title', response.body.includes('Rekursing'), 'Contains "Rekursing" in content');
            
        } catch (error) {
            this.addResult('Local Preview Access', false, `Error: ${error.message}`);
        }
    }

    async testKeyFeatures() {
        console.log('\n🔍 Testing Key Features...\n');
        
        try {
            const response = await this.makeRequest(this.baseUrl);
            const body = response.body;
            
            // Test for React app
            this.addResult('React App', body.includes('id="root"'), 'React root element found');
            
            // Test for navigation
            this.addResult('Navigation', body.includes('navbar'), 'Navigation component found');
            
            // Test for main content
            this.addResult('Main Content', body.includes('main-content'), 'Main content area found');
            
            // Test for CSS
            this.addResult('CSS Loading', body.includes('.css'), 'CSS files referenced');
            
            // Test for JavaScript
            this.addResult('JavaScript Loading', body.includes('.js'), 'JavaScript files referenced');
            
            // Test for modern features
            this.addResult('Modern Features', body.includes('unified-ui-root'), 'Modern UI system found');
            
        } catch (error) {
            this.addResult('Key Features', false, `Error: ${error.message}`);
        }
    }

    async testTradingFeatures() {
        console.log('\n📈 Testing Trading Features...\n');
        
        try {
            const response = await this.makeRequest(`${this.baseUrl}/trading`);
            const body = response.body;
            
            this.addResult('Trading Page Status', response.statusCode === 200, `Status: ${response.statusCode}`);
            this.addResult('Trading Dashboard', body.includes('trading-dashboard'), 'Trading dashboard found');
            this.addResult('AI Trading', body.includes('AI Trading'), 'AI trading content found');
            
        } catch (error) {
            this.addResult('Trading Features', false, `Error: ${error.message}`);
        }
    }

    async testResponsiveDesign() {
        console.log('\n📱 Testing Responsive Design...\n');
        
        try {
            const response = await this.makeRequest(this.baseUrl);
            const body = response.body;
            
            // Check for responsive CSS
            this.addResult('Responsive CSS', body.includes('@media'), 'Media queries found');
            this.addResult('Mobile Support', body.includes('viewport'), 'Viewport meta tag found');
            this.addResult('Touch Support', body.includes('touch'), 'Touch-friendly features found');
            
        } catch (error) {
            this.addResult('Responsive Design', false, `Error: ${error.message}`);
        }
    }

    async testPerformance() {
        console.log('\n⚡ Testing Performance...\n');
        
        try {
            const startTime = Date.now();
            const response = await this.makeRequest(this.baseUrl);
            const loadTime = Date.now() - startTime;
            
            this.addResult('Load Time', loadTime < 5000, `Load time: ${loadTime}ms`);
            this.addResult('Content Size', response.body.length < 100000, `Content size: ${response.body.length} bytes`);
            
            // Check for compression
            const contentEncoding = response.headers['content-encoding'];
            this.addResult('Compression', !!contentEncoding, `Compression: ${contentEncoding || 'none'}`);
            
        } catch (error) {
            this.addResult('Performance', false, `Error: ${error.message}`);
        }
    }

    generateReport() {
        console.log('\n📊 Test Results Summary\n');
        console.log('='.repeat(50));
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${failedTests}`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        console.log('\n📋 Detailed Results:');
        console.log('-'.repeat(50));
        
        this.testResults.forEach(result => {
            const status = result.passed ? '✅' : '❌';
            console.log(`${status} ${result.test}`);
            console.log(`   Details: ${result.details}`);
            console.log('');
        });
        
        // Save report to file
        const report = {
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                successRate: ((passedTests / totalTests) * 100).toFixed(1)
            },
            results: this.testResults,
            timestamp: new Date().toISOString(),
            urls: {
                live: this.baseUrl,
                local: this.localUrl
            }
        };
        
        fs.writeFileSync('simple-live-test-report.json', JSON.stringify(report, null, 2));
        console.log('📄 Test report saved to: simple-live-test-report.json');
        
        return report;
    }

    async runAllTests() {
        console.log('🚀 Starting Simple Live Version Tests...\n');
        
        await this.testLiveSite();
        await this.testLocalPreview();
        await this.testKeyFeatures();
        await this.testTradingFeatures();
        await this.testResponsiveDesign();
        await this.testPerformance();
        
        const report = this.generateReport();
        
        console.log('\n🎉 Testing completed!');
        console.log(`🌐 Live site: ${this.baseUrl}`);
        console.log(`🏠 Local preview: ${this.localUrl}`);
        
        return report;
    }
}

// Run tests
async function runSimpleTests() {
    const tester = new SimpleLiveTester();
    
    try {
        const report = await tester.runAllTests();
        return report;
        
    } catch (error) {
        console.error('❌ Simple testing failed:', error);
        return null;
    }
}

// Export for use in other scripts
module.exports = { SimpleLiveTester, runSimpleTests };

// Run if called directly
if (require.main === module) {
    runSimpleTests().then(report => {
        if (report) {
            process.exit(report.summary.failed === 0 ? 0 : 1);
        } else {
            process.exit(1);
        }
    });
} 