/**
 * Tools Launcher
 * Simple launcher using the tools index for easy tool management
 */

import toolsIndex, { TOOL_REGISTRY, TOOL_CATEGORIES, KEYBOARD_SHORTCUTS } from './index.js';

class ToolsLauncher {
    constructor() {
        this.initialized = false;
        this.init();
    }

    async init() {
        console.log('🚀 Tools Launcher starting...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.start();
            });
        } else {
            this.start();
        }
    }

    async start() {
        try {
            // Wait for game to initialize
            await this.waitForGame();
            
            // Load all tools
            const results = await toolsIndex.loadAllTools();
            
            // Show results
            this.showLoadResults(results);
            
            // Show welcome message
            this.showWelcomeMessage();
            
            this.initialized = true;
            
        } catch (error) {
            console.error('❌ Tools Launcher failed:', error);
        }
    }

    async waitForGame() {
        return new Promise((resolve) => {
            const checkGame = () => {
                if (window.game) {
                    resolve();
                } else {
                    setTimeout(checkGame, 100);
                }
            };
            checkGame();
        });
    }

    showLoadResults(results) {
        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;
        
        console.log(`✅ Tools loaded: ${successCount}/${results.length}`);
        
        if (failCount > 0) {
            console.warn(`⚠️ Failed to load ${failCount} tools:`);
            results.filter(r => !r.success).forEach(r => {
                console.warn(`  - ${r.key}: ${r.error}`);
            });
        }
    }

    showWelcomeMessage() {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 25px;
            border-radius: 12px;
            border: 2px solid #4CAF50;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            z-index: 10000;
            text-align: center;
            max-width: 500px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        `;

        const summary = toolsIndex.getStatusReport();
        const toolsSummary = ToolUtils.generateSummary();
        
        welcomeDiv.innerHTML = `
            <h2 style="margin: 0 0 15px 0; color: #4CAF50;">🛠️ Development Tools Suite</h2>
            <p style="margin: 0 0 20px 0; color: #ccc;">
                ${toolsSummary.totalTools} tools loaded across ${toolsSummary.categories} categories
            </p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; text-align: left;">
                <div>
                    <strong style="color: #4CAF50;">📋 Quick Access:</strong><br>
                    <div style="font-size: 12px; margin-top: 8px;">
                        ${Object.entries(KEYBOARD_SHORTCUTS)
                            .filter(([key, shortcut]) => !key.includes('Ctrl'))
                            .slice(0, 6)
                            .map(([key, shortcut]) => 
                                `<kbd style="background: #333; padding: 2px 6px; border-radius: 3px;">${key}</kbd> ${shortcut.description}<br>`
                            ).join('')}
                    </div>
                </div>
                
                <div>
                    <strong style="color: #FF9800;">📊 Status:</strong><br>
                    <div style="font-size: 12px; margin-top: 8px;">
                        Loaded: ${summary.loaded}/${summary.total}<br>
                        Categories: ${Object.keys(summary.categories).length}<br>
                        Shortcuts: ${Object.keys(KEYBOARD_SHORTCUTS).length}<br>
                        <span style="color: #4CAF50;">✓ Ready to use!</span>
                    </div>
                </div>
            </div>
            
            <div style="margin: 20px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; font-size: 12px;">
                <strong>🎮 Multiplayer Testing:</strong><br>
                • Open multiple browser tabs to test multiplayer<br>
                • Use Network Analyzer (F4) to monitor connections<br>
                • Travel between planets with rockets (R key)<br>
                • Use Gameplay Enhancer (F5) for testing scenarios
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="showAllTools" style="background: #2196F3; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-size: 12px;">
                    👁️ Show All Tools
                </button>
                <button id="closeWelcome" style="background: #4CAF50; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-size: 12px;">
                    Got it!
                </button>
            </div>
        `;

        document.body.appendChild(welcomeDiv);

        // Bind buttons
        document.getElementById('showAllTools').addEventListener('click', () => {
            toolsIndex.showAllTools();
        });

        document.getElementById('closeWelcome').addEventListener('click', () => {
            welcomeDiv.remove();
        });

        // Auto-hide after 15 seconds
        setTimeout(() => {
            if (welcomeDiv.parentNode) {
                welcomeDiv.remove();
            }
        }, 15000);
    }

    // Utility methods
    static getToolsIndex() {
        return toolsIndex;
    }

    static getRegistry() {
        return TOOL_REGISTRY;
    }

    static getCategories() {
        return TOOL_CATEGORIES;
    }

    static getShortcuts() {
        return KEYBOARD_SHORTCUTS;
    }

    static isReady() {
        return toolsIndex && toolsIndex.initialized;
    }
}

// Import ToolUtils from index
import { ToolUtils } from './index.js';

// Launch tools when script is loaded
const launcher = new ToolsLauncher();

// Make launcher available globally
if (typeof window !== 'undefined') {
    window.toolsLauncher = launcher;
    window.ToolsLauncher = ToolsLauncher;
}

export default ToolsLauncher; 