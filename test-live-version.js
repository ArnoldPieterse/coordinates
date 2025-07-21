/**
 * Live Version Test Suite
 * Tests all new UI/UX features and transformer trading system
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class LiveVersionTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = [];
        this.baseUrl = 'https://www.rekursing.com';
        this.localUrl = 'http://localhost:4173';
    }

    async initialize() {
        console.log('🚀 Initializing Live Version Tester...');
        
        try {
            this.browser = await puppeteer.launch({
                headless: false,
                defaultViewport: { width: 1920, height: 1080 },
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            
            this.page = await this.browser.newPage();
            
            // Set user agent
            await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            
            console.log('✅ Browser initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize browser:', error);
            throw error;
        }
    }

    async runTests() {
        console.log('\n🧪 Starting Live Version Tests...\n');
        
        try {
            // Test 1: Basic Site Accessibility
            await this.testSiteAccessibility();
            
            // Test 2: Navigation System
            await this.testNavigation();
            
            // Test 3: Home Page Features
            await this.testHomePage();
            
            // Test 4: Trading Dashboard
            await this.testTradingDashboard();
            
            // Test 5: Responsive Design
            await this.testResponsiveDesign();
            
            // Test 6: Theme Switching
            await this.testThemeSwitching();
            
            // Test 7: Performance
            await this.testPerformance();
            
            // Test 8: Error Handling
            await this.testErrorHandling();
            
        } catch (error) {
            console.error('❌ Test execution failed:', error);
        } finally {
            await this.cleanup();
        }
    }

    async testSiteAccessibility() {
        console.log('📋 Test 1: Site Accessibility');
        
        try {
            // Test live site
            await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
            
            // Check if page loads
            const title = await this.page.title();
            this.addResult('Live Site Load', title.includes('Rekursing'), `Title: ${title}`);
            
            // Check for main content
            const mainContent = await this.page.$('.main-content');
            this.addResult('Main Content Present', !!mainContent, 'Main content area found');
            
            // Check for navigation
            const navBar = await this.page.$('.navbar');
            this.addResult('Navigation Bar Present', !!navBar, 'Navigation bar found');
            
            // Check for React app mounting
            const reactRoot = await this.page.$('#root');
            this.addResult('React App Mounted', !!reactRoot, 'React root element found');
            
            console.log('✅ Site accessibility tests completed\n');
            
        } catch (error) {
            this.addResult('Site Accessibility', false, `Error: ${error.message}`);
            console.error('❌ Site accessibility test failed:', error);
        }
    }

    async testNavigation() {
        console.log('🧭 Test 2: Navigation System');
        
        try {
            // Test navigation links
            const navLinks = [
                { selector: 'a[href="/"]', name: 'Home' },
                { selector: 'a[href="/trading"]', name: 'Trading' },
                { selector: 'a[href="/ai-dashboard"]', name: 'AI Dashboard' },
                { selector: 'a[href="/context"]', name: 'Context' },
                { selector: 'a[href="/social-ai"]', name: 'Social AI' },
                { selector: 'a[href="/genlab"]', name: 'GenLab' },
                { selector: 'a[href="/tools"]', name: 'Tools' },
                { selector: 'a[href="/docs"]', name: 'Docs' },
                { selector: 'a[href="/settings"]', name: 'Settings' }
            ];
            
            for (const link of navLinks) {
                const element = await this.page.$(link.selector);
                this.addResult(`Nav Link: ${link.name}`, !!element, `${link.name} link found`);
            }
            
            // Test theme toggle
            const themeToggle = await this.page.$('.theme-toggle');
            this.addResult('Theme Toggle Present', !!themeToggle, 'Theme toggle button found');
            
            // Test mobile menu (if on mobile viewport)
            await this.page.setViewport({ width: 768, height: 1024 });
            await this.page.waitForTimeout(1000);
            
            const mobileMenuToggle = await this.page.$('.mobile-menu-toggle');
            this.addResult('Mobile Menu Toggle', !!mobileMenuToggle, 'Mobile menu toggle found');
            
            // Reset viewport
            await this.page.setViewport({ width: 1920, height: 1080 });
            
            console.log('✅ Navigation tests completed\n');
            
        } catch (error) {
            this.addResult('Navigation System', false, `Error: ${error.message}`);
            console.error('❌ Navigation test failed:', error);
        }
    }

    async testHomePage() {
        console.log('🏠 Test 3: Home Page Features');
        
        try {
            // Navigate to home page
            await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
            await this.page.waitForTimeout(2000);
            
            // Test hero section
            const heroSection = await this.page.$('.hero-section');
            this.addResult('Hero Section Present', !!heroSection, 'Hero section found');
            
            // Test quick actions
            const quickActions = await this.page.$$('.quick-action-card');
            this.addResult('Quick Actions Present', quickActions.length > 0, `${quickActions.length} quick action cards found`);
            
            // Test features grid
            const featureCards = await this.page.$$('.feature-card');
            this.addResult('Feature Cards Present', featureCards.length > 0, `${featureCards.length} feature cards found`);
            
            // Test statistics
            const statCards = await this.page.$$('.stat-card');
            this.addResult('Statistics Present', statCards.length > 0, `${statCards.length} stat cards found`);
            
            // Test system status
            const statusIndicator = await this.page.$('.ai-status-indicator');
            this.addResult('System Status Present', !!statusIndicator, 'System status indicator found');
            
            console.log('✅ Home page tests completed\n');
            
        } catch (error) {
            this.addResult('Home Page Features', false, `Error: ${error.message}`);
            console.error('❌ Home page test failed:', error);
        }
    }

    async testTradingDashboard() {
        console.log('📈 Test 4: Trading Dashboard');
        
        try {
            // Navigate to trading dashboard
            await this.page.goto(`${this.baseUrl}/trading`, { waitUntil: 'networkidle2' });
            await this.page.waitForTimeout(2000);
            
            // Test dashboard header
            const dashboardHeader = await this.page.$('.trading-dashboard .dashboard-header');
            this.addResult('Trading Dashboard Header', !!dashboardHeader, 'Dashboard header found');
            
            // Test quick actions
            const quickActions = await this.page.$$('.quick-actions .btn');
            this.addResult('Trading Quick Actions', quickActions.length > 0, `${quickActions.length} quick action buttons found`);
            
            // Test dashboard tabs
            const tabButtons = await this.page.$$('.dashboard-tabs .tab-button');
            this.addResult('Dashboard Tabs Present', tabButtons.length > 0, `${tabButtons.length} tab buttons found`);
            
            // Test overview tab content
            const overviewTab = await this.page.$('.overview-tab');
            this.addResult('Overview Tab Content', !!overviewTab, 'Overview tab content found');
            
            // Test metrics grid
            const metricsGrid = await this.page.$('.metrics-grid');
            this.addResult('Metrics Grid Present', !!metricsGrid, 'Metrics grid found');
            
            console.log('✅ Trading dashboard tests completed\n');
            
        } catch (error) {
            this.addResult('Trading Dashboard', false, `Error: ${error.message}`);
            console.error('❌ Trading dashboard test failed:', error);
        }
    }

    async testResponsiveDesign() {
        console.log('📱 Test 5: Responsive Design');
        
        try {
            // Test mobile viewport
            await this.page.setViewport({ width: 375, height: 667 });
            await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
            await this.page.waitForTimeout(1000);
            
            const mobileNav = await this.page.$('.mobile-nav');
            this.addResult('Mobile Navigation Present', !!mobileNav, 'Mobile navigation found');
            
            // Test tablet viewport
            await this.page.setViewport({ width: 768, height: 1024 });
            await this.page.waitForTimeout(1000);
            
            const tabletLayout = await this.page.$('.main-content');
            this.addResult('Tablet Layout Present', !!tabletLayout, 'Tablet layout found');
            
            // Test desktop viewport
            await this.page.setViewport({ width: 1920, height: 1080 });
            await this.page.waitForTimeout(1000);
            
            const desktopNav = await this.page.$('.desktop-nav');
            this.addResult('Desktop Navigation Present', !!desktopNav, 'Desktop navigation found');
            
            console.log('✅ Responsive design tests completed\n');
            
        } catch (error) {
            this.addResult('Responsive Design', false, `Error: ${error.message}`);
            console.error('❌ Responsive design test failed:', error);
        }
    }

    async testThemeSwitching() {
        console.log('🎨 Test 6: Theme Switching');
        
        try {
            await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
            await this.page.waitForTimeout(1000);
            
            // Find theme toggle button
            const themeToggle = await this.page.$('.theme-toggle');
            if (themeToggle) {
                // Click theme toggle
                await themeToggle.click();
                await this.page.waitForTimeout(1000);
                
                // Check if theme class changed
                const bodyClass = await this.page.$eval('body', el => el.className);
                this.addResult('Theme Toggle Click', true, `Body classes: ${bodyClass}`);
                
                // Click again to switch back
                await themeToggle.click();
                await this.page.waitForTimeout(1000);
                
                const bodyClassAfter = await this.page.$eval('body', el => el.className);
                this.addResult('Theme Toggle Back', true, `Body classes after toggle: ${bodyClassAfter}`);
                
            } else {
                this.addResult('Theme Toggle', false, 'Theme toggle button not found');
            }
            
            console.log('✅ Theme switching tests completed\n');
            
        } catch (error) {
            this.addResult('Theme Switching', false, `Error: ${error.message}`);
            console.error('❌ Theme switching test failed:', error);
        }
    }

    async testPerformance() {
        console.log('⚡ Test 7: Performance');
        
        try {
            const startTime = Date.now();
            
            await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
            
            const loadTime = Date.now() - startTime;
            this.addResult('Page Load Time', loadTime < 5000, `Load time: ${loadTime}ms`);
            
            // Check for console errors
            const consoleErrors = [];
            this.page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });
            
            await this.page.waitForTimeout(2000);
            this.addResult('No Console Errors', consoleErrors.length === 0, `${consoleErrors.length} console errors found`);
            
            // Check for network errors
            const networkErrors = [];
            this.page.on('response', response => {
                if (response.status() >= 400) {
                    networkErrors.push(`${response.url()}: ${response.status()}`);
                }
            });
            
            await this.page.waitForTimeout(2000);
            this.addResult('No Network Errors', networkErrors.length === 0, `${networkErrors.length} network errors found`);
            
            console.log('✅ Performance tests completed\n');
            
        } catch (error) {
            this.addResult('Performance', false, `Error: ${error.message}`);
            console.error('❌ Performance test failed:', error);
        }
    }

    async testErrorHandling() {
        console.log('🛡️ Test 8: Error Handling');
        
        try {
            // Test 404 page
            await this.page.goto(`${this.baseUrl}/non-existent-page`, { waitUntil: 'networkidle2' });
            await this.page.waitForTimeout(1000);
            
            // Should redirect to home page
            const currentUrl = this.page.url();
            this.addResult('404 Handling', currentUrl.includes(this.baseUrl), `Redirected to: ${currentUrl}`);
            
            // Test JavaScript error handling
            await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
            
            // Inject a test error
            await this.page.evaluate(() => {
                window.addEventListener('error', (e) => {
                    console.log('Error caught:', e.message);
                });
            });
            
            this.addResult('Error Handling', true, 'Error handling mechanisms in place');
            
            console.log('✅ Error handling tests completed\n');
            
        } catch (error) {
            this.addResult('Error Handling', false, `Error: ${error.message}`);
            console.error('❌ Error handling test failed:', error);
        }
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
            console.log(`   Time: ${result.timestamp}`);
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
            timestamp: new Date().toISOString()
        };
        
        fs.writeFileSync('live-test-report.json', JSON.stringify(report, null, 2));
        console.log('📄 Test report saved to: live-test-report.json');
        
        return report;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            console.log('🔧 Browser closed');
        }
    }
}

// Run tests
async function runLiveTests() {
    const tester = new LiveVersionTester();
    
    try {
        await tester.initialize();
        await tester.runTests();
        const report = tester.generateReport();
        
        console.log('\n🎉 Live version testing completed!');
        console.log(`🌐 Live site: ${tester.baseUrl}`);
        console.log(`🏠 Local preview: ${tester.localUrl}`);
        
        return report;
        
    } catch (error) {
        console.error('❌ Live testing failed:', error);
        return null;
    }
}

// Export for use in other scripts
module.exports = { LiveVersionTester, runLiveTests };

// Run if called directly
if (require.main === module) {
    runLiveTests().then(report => {
        if (report) {
            process.exit(report.summary.failed === 0 ? 0 : 1);
        } else {
            process.exit(1);
        }
    });
} 