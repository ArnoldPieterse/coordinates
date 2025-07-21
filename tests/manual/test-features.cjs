/**
 * Feature Test Script
 * Tests specific features of the Rekursing platform
 */

const https = require('https');
const http = require('http');

class FeatureTester {
    constructor() {
        this.baseUrl = 'https://www.rekursing.com';
        this.localUrl = 'http://localhost:4175';
        this.results = [];
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

    addResult(feature, passed, details) {
        const result = { feature, passed, details, timestamp: new Date().toISOString() };
        this.results.push(result);
        
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${feature}: ${details}`);
    }

    async testMainFeatures() {
        console.log('🧪 Testing Main Features...\n');

        try {
            // Test home page
            const homeResponse = await this.makeRequest(this.baseUrl);
            this.addResult('Home Page', homeResponse.statusCode === 200, `Status: ${homeResponse.statusCode}`);

            // Test trading page
            const tradingResponse = await this.makeRequest(`${this.baseUrl}/trading`);
            this.addResult('Trading Page', tradingResponse.statusCode === 200, `Status: ${tradingResponse.statusCode}`);

            // Test AI dashboard
            const aiResponse = await this.makeRequest(`${this.baseUrl}/ai-dashboard`);
            this.addResult('AI Dashboard', aiResponse.statusCode === 200, `Status: ${aiResponse.statusCode}`);

            // Test context page
            const contextResponse = await this.makeRequest(`${this.baseUrl}/context`);
            this.addResult('Context Page', contextResponse.statusCode === 200, `Status: ${contextResponse.statusCode}`);

            // Test social AI page
            const socialResponse = await this.makeRequest(`${this.baseUrl}/social-ai`);
            this.addResult('Social AI Page', socialResponse.statusCode === 200, `Status: ${socialResponse.statusCode}`);

            // Test GenLab page
            const genlabResponse = await this.makeRequest(`${this.baseUrl}/genlab`);
            this.addResult('GenLab Page', genlabResponse.statusCode === 200, `Status: ${genlabResponse.statusCode}`);

            // Test tools page
            const toolsResponse = await this.makeRequest(`${this.baseUrl}/tools`);
            this.addResult('Tools Page', toolsResponse.statusCode === 200, `Status: ${toolsResponse.statusCode}`);

            // Test docs page
            const docsResponse = await this.makeRequest(`${this.baseUrl}/docs`);
            this.addResult('Docs Page', docsResponse.statusCode === 200, `Status: ${docsResponse.statusCode}`);

            // Test settings page
            const settingsResponse = await this.makeRequest(`${this.baseUrl}/settings`);
            this.addResult('Settings Page', settingsResponse.statusCode === 200, `Status: ${settingsResponse.statusCode}`);

        } catch (error) {
            this.addResult('Feature Testing', false, `Error: ${error.message}`);
        }
    }

    async testContentFeatures() {
        console.log('\n📄 Testing Content Features...\n');

        try {
            const response = await this.makeRequest(this.baseUrl);
            const body = response.body;

            // Test for React app
            this.addResult('React App', body.includes('id="root"'), 'React root element found');

            // Test for navigation
            this.addResult('Navigation', body.includes('navbar'), 'Navigation component found');

            // Test for main content
            this.addResult('Main Content', body.includes('main-content'), 'Main content area found');

            // Test for theme system
            this.addResult('Theme System', body.includes('theme-'), 'Theme system found');

            // Test for notifications
            this.addResult('Notifications', body.includes('notifications'), 'Notification system found');

            // Test for trading features
            this.addResult('Trading Features', body.includes('trading'), 'Trading features found');

            // Test for AI features
            this.addResult('AI Features', body.includes('ai'), 'AI features found');

            // Test for responsive design
            this.addResult('Responsive Design', body.includes('@media'), 'Responsive CSS found');

        } catch (error) {
            this.addResult('Content Testing', false, `Error: ${error.message}`);
        }
    }

    async testLocalPreview() {
        console.log('\n🏠 Testing Local Preview...\n');

        try {
            const response = await this.makeRequest(this.localUrl);
            this.addResult('Local Preview', response.statusCode === 200, `Status: ${response.statusCode}`);

            const body = response.body;
            this.addResult('Local Content', body.length > 0, `Content length: ${body.length} bytes`);
            this.addResult('Local React', body.includes('id="root"'), 'React app found');

        } catch (error) {
            this.addResult('Local Preview', false, `Error: ${error.message}`);
        }
    }

    generateReport() {
        console.log('\n📊 Feature Test Results\n');
        console.log('='.repeat(50));
        
        const total = this.results.length;
        const passed = this.results.filter(r => r.passed).length;
        const failed = total - passed;
        
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
        
        console.log('\n📋 Detailed Results:');
        console.log('-'.repeat(50));
        
        this.results.forEach(result => {
            const status = result.passed ? '✅' : '❌';
            console.log(`${status} ${result.feature}`);
            console.log(`   Details: ${result.details}`);
            console.log('');
        });

        return {
            summary: { total, passed, failed, successRate: ((passed / total) * 100).toFixed(1) },
            results: this.results,
            timestamp: new Date().toISOString()
        };
    }

    async runAllTests() {
        console.log('🚀 Starting Feature Tests...\n');
        
        await this.testMainFeatures();
        await this.testContentFeatures();
        await this.testLocalPreview();
        
        const report = this.generateReport();
        
        console.log('\n🎉 Feature testing completed!');
        console.log(`🌐 Live site: ${this.baseUrl}`);
        console.log(`🏠 Local preview: ${this.localUrl}`);
        
        return report;
    }
}

// Run tests
async function runFeatureTests() {
    const tester = new FeatureTester();
    
    try {
        const report = await tester.runAllTests();
        return report;
        
    } catch (error) {
        console.error('❌ Feature testing failed:', error);
        return null;
    }
}

// Export for use in other scripts
module.exports = { FeatureTester, runFeatureTests };

// Run if called directly
if (require.main === module) {
    runFeatureTests().then(report => {
        if (report) {
            process.exit(report.summary.failed === 0 ? 0 : 1);
        } else {
            process.exit(1);
        }
    });
} 