/**
 * Tools Launcher
 * Simple script to launch and test all development tools
 */

class ToolsLauncher {
    constructor() {
        this.toolsLoaded = false;
        this.init();
    }
    
    async init() {
        console.log('🚀 Tools Launcher starting...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.launchTools();
            });
        } else {
            this.launchTools();
        }
    }
    
    async launchTools() {
        try {
            // Import and initialize tools manager
            const ToolsManager = await import('./tools-manager.js');
            
            // Wait a bit for the game to initialize
            setTimeout(() => {
                console.log('✅ Tools Launcher ready!');
                console.log('📋 Available shortcuts:');
                console.log('  F1 - Debug Console');
                console.log('  F2 - Tools Manager');
                console.log('  F3 - Performance Monitor');
                console.log('  F4 - Network Analyzer');
                console.log('  F5 - Gameplay Enhancer');
                console.log('  F6 - Game Utilities');
                
                this.toolsLoaded = true;
                
                // Show welcome message
                this.showWelcomeMessage();
            }, 2000);
            
        } catch (error) {
            console.error('❌ Failed to launch tools:', error);
        }
    }
    
    showWelcomeMessage() {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #4CAF50;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            z-index: 10000;
            text-align: center;
            max-width: 400px;
        `;
        
        welcomeDiv.innerHTML = `
            <h3>🛠️ Development Tools Loaded!</h3>
            <p>All development tools are now available for the Multiplayer Planetary Shooter.</p>
            
            <div style="margin: 15px 0; text-align: left;">
                <strong>Quick Start:</strong><br>
                • Press <kbd>F2</kbd> to open Tools Manager<br>
                • Press <kbd>F1</kbd> for Debug Console<br>
                • Press <kbd>F5</kbd> for Gameplay Cheats<br>
                • Press <kbd>F6</kbd> for Screenshots & Data
            </div>
            
            <div style="margin: 15px 0; font-size: 12px; color: #ccc;">
                <strong>Multiplayer Features:</strong><br>
                • Open multiple browser tabs to test multiplayer<br>
                • Use Network Analyzer (F4) to monitor connections<br>
                • Travel between planets with rockets (R key)
            </div>
            
            <button id="closeWelcome" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 12px;">
                Got it!
            </button>
        `;
        
        document.body.appendChild(welcomeDiv);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (welcomeDiv.parentNode) {
                welcomeDiv.remove();
            }
        }, 10000);
        
        // Close button
        document.getElementById('closeWelcome').addEventListener('click', () => {
            welcomeDiv.remove();
        });
    }
    
    // Utility method to check if tools are ready
    static isReady() {
        return window.toolsManager && window.toolsManager.toolsLoaded;
    }
    
    // Utility method to get a specific tool
    static getTool(name) {
        if (window.toolsManager) {
            return window.toolsManager.getTool(name);
        }
        return null;
    }
    
    // Utility method to show all tools
    static showAllTools() {
        if (window.toolsManager) {
            window.toolsManager.showAllTools();
        }
    }
    
    // Utility method to hide all tools
    static hideAllTools() {
        if (window.toolsManager) {
            window.toolsManager.hideAllTools();
        }
    }
}

// Launch tools when script is loaded
const toolsLauncher = new ToolsLauncher();

// Make launcher available globally
window.toolsLauncher = toolsLauncher;

export default ToolsLauncher; 