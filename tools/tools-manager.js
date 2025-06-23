/**
 * Tools Manager
 * Manages and loads all development tools for the multiplayer planetary shooter
 */

class ToolsManager {
    constructor() {
        this.tools = new Map();
        this.isVisible = false;
        this.toolsLoaded = false;
        
        this.init();
    }
    
    async init() {
        this.createUI();
        await this.loadTools();
        this.bindEvents();
    }
    
    createUI() {
        const managerDiv = document.createElement('div');
        managerDiv.id = 'toolsManager';
        managerDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            max-height: 600px;
            background: rgba(0, 0, 0, 0.95);
            color: white;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            padding: 15px;
            border-radius: 8px;
            z-index: 10001;
            display: none;
            border: 2px solid #2196F3;
            overflow-y: auto;
        `;
        
        managerDiv.innerHTML = `
            <div style="margin-bottom: 15px; font-weight: bold; border-bottom: 2px solid #2196F3; padding-bottom: 10px; text-align: center; font-size: 14px;">
                🛠️ Development Tools Manager
                <button id="closeManager" style="float: right; background: #f44336; color: white; border: none; border-radius: 3px; padding: 2px 6px; cursor: pointer; font-size: 10px;">X</button>
            </div>
            
            <div style="margin-bottom: 10px;">
                <div style="font-weight: bold; margin-bottom: 8px;">Available Tools:</div>
                <div id="toolsList">
                    <div style="text-align: center; color: #888;">Loading tools...</div>
                </div>
            </div>
            
            <div style="margin-top: 15px; border-top: 1px solid #333; padding-top: 10px;">
                <div style="font-weight: bold; margin-bottom: 8px;">Quick Actions:</div>
                
                <button id="loadAllTools" style="width: 100%; margin-bottom: 5px; padding: 8px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    🔧 Load All Tools
                </button>
                
                <button id="unloadAllTools" style="width: 100%; margin-bottom: 5px; padding: 8px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    🧹 Unload All Tools
                </button>
                
                <button id="showAllTools" style="width: 100%; margin-bottom: 5px; padding: 8px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    👁️ Show All Tools
                </button>
                
                <button id="hideAllTools" style="width: 100%; margin-bottom: 5px; padding: 8px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    🙈 Hide All Tools
                </button>
            </div>
            
            <div style="margin-top: 15px; border-top: 1px solid #333; padding-top: 10px;">
                <div style="font-weight: bold; margin-bottom: 8px;">Keyboard Shortcuts:</div>
                <div style="font-size: 10px; line-height: 1.4;">
                    <div>F1 - Debug Console</div>
                    <div>F2 - Tools Manager</div>
                    <div>F3 - Performance Monitor</div>
                    <div>F4 - Network Analyzer</div>
                    <div>F5 - Gameplay Enhancer</div>
                    <div>F6 - Game Utilities</div>
                </div>
            </div>
            
            <div style="margin-top: 15px; border-top: 1px solid #333; padding-top: 10px; font-size: 10px; color: #888;">
                Press F2 to toggle | Ctrl+F2 to reload tools
            </div>
        `;
        
        document.body.appendChild(managerDiv);
        
        // Bind close button
        document.getElementById('closeManager').addEventListener('click', () => {
            this.hide();
        });
        
        this.managerDiv = managerDiv;
    }
    
    async loadTools() {
        const toolConfigs = [
            {
                name: 'Debug Console',
                key: 'debugConsole',
                shortcut: 'F1',
                description: 'Real-time debugging and command console',
                category: 'development',
                file: './tools/development/debug-console.js'
            },
            {
                name: 'Performance Monitor',
                key: 'performanceMonitor',
                shortcut: 'F3',
                description: 'Track FPS, memory, and rendering performance',
                category: 'performance',
                file: './tools/performance/performance-monitor.js'
            },
            {
                name: 'Network Analyzer',
                key: 'networkAnalyzer',
                shortcut: 'F4',
                description: 'Monitor multiplayer connections and latency',
                category: 'multiplayer',
                file: './tools/multiplayer/network-analyzer.js'
            },
            {
                name: 'Gameplay Enhancer',
                key: 'gameplayEnhancer',
                shortcut: 'F5',
                description: 'Cheats, mods, and gameplay enhancements',
                category: 'gameplay',
                file: './tools/gameplay/gameplay-enhancer.js'
            },
            {
                name: 'Game Utilities',
                key: 'gameUtilities',
                shortcut: 'F6',
                description: 'Screenshots, recordings, and data export',
                category: 'utilities',
                file: './tools/utilities/game-utilities.js'
            },
            {
                name: 'Objectives Manager',
                key: 'objectivesManager',
                shortcut: 'F7',
                description: 'Project objectives management',
                category: 'utilities',
                file: './tools/utilities/objectives-manager.js'
            }
        ];
        
        this.updateToolsList(toolConfigs);
        
        // Load tools dynamically
        for (const config of toolConfigs) {
            try {
                const module = await import(config.file);
                const ToolClass = module.default;
                
                if (ToolClass) {
                    this.tools.set(config.key, {
                        config,
                        instance: new ToolClass(),
                        loaded: true
                    });
                }
            } catch (error) {
                console.warn(`Failed to load tool ${config.name}:`, error);
                this.tools.set(config.key, {
                    config,
                    instance: null,
                    loaded: false,
                    error: error.message
                });
            }
        }
        
        this.toolsLoaded = true;
        this.updateToolsList(toolConfigs);
    }
    
    updateToolsList(configs) {
        const toolsListDiv = document.getElementById('toolsList');
        if (!toolsListDiv) return;
        
        toolsListDiv.innerHTML = '';
        
        configs.forEach(config => {
            const tool = this.tools.get(config.key);
            const isLoaded = tool && tool.loaded;
            const hasError = tool && tool.error;
            
            const toolDiv = document.createElement('div');
            toolDiv.style.cssText = `
                margin-bottom: 8px;
                padding: 8px;
                border-radius: 4px;
                background: ${isLoaded ? 'rgba(76, 175, 80, 0.2)' : hasError ? 'rgba(244, 67, 54, 0.2)' : 'rgba(128, 128, 128, 0.2)'};
                border: 1px solid ${isLoaded ? '#4CAF50' : hasError ? '#f44336' : '#666'};
            `;
            
            toolDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-weight: bold; color: ${isLoaded ? '#4CAF50' : hasError ? '#f44336' : '#888'};">
                        ${config.name}
                    </span>
                    <span style="font-size: 10px; color: #888;">
                        ${config.shortcut}
                    </span>
                </div>
                <div style="font-size: 10px; color: #ccc; margin-bottom: 4px;">
                    ${config.description}
                </div>
                <div style="font-size: 9px; color: #888;">
                    Category: ${config.category}
                </div>
                ${hasError ? `<div style="font-size: 9px; color: #f44336; margin-top: 4px;">Error: ${tool.error}</div>` : ''}
            `;
            
            toolsListDiv.appendChild(toolDiv);
        });
    }
    
    bindEvents() {
        // Bind keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F2' && !e.ctrlKey) {
                e.preventDefault();
                this.toggle();
            } else if (e.ctrlKey && e.key === 'F2') {
                e.preventDefault();
                this.reloadTools();
            }
        });
        
        // Bind button events
        document.getElementById('loadAllTools').addEventListener('click', () => {
            this.loadAllTools();
        });
        
        document.getElementById('unloadAllTools').addEventListener('click', () => {
            this.unloadAllTools();
        });
        
        document.getElementById('showAllTools').addEventListener('click', () => {
            this.showAllTools();
        });
        
        document.getElementById('hideAllTools').addEventListener('click', () => {
            this.hideAllTools();
        });
    }
    
    loadAllTools() {
        this.tools.forEach((tool, key) => {
            if (!tool.loaded && tool.instance) {
                try {
                    tool.instance = new tool.instance.constructor();
                    tool.loaded = true;
                    tool.error = null;
                } catch (error) {
                    tool.error = error.message;
                }
            }
        });
        
        this.updateToolsList(Array.from(this.tools.values()).map(t => t.config));
        console.log('🔧 All tools loaded');
    }
    
    unloadAllTools() {
        this.tools.forEach((tool, key) => {
            if (tool.loaded && tool.instance && tool.instance.destroy) {
                try {
                    tool.instance.destroy();
                } catch (error) {
                    console.warn(`Error destroying tool ${key}:`, error);
                }
            }
            tool.loaded = false;
            tool.instance = null;
        });
        
        this.updateToolsList(Array.from(this.tools.values()).map(t => t.config));
        console.log('🧹 All tools unloaded');
    }
    
    showAllTools() {
        this.tools.forEach((tool, key) => {
            if (tool.loaded && tool.instance && tool.instance.show) {
                try {
                    tool.instance.show();
                } catch (error) {
                    console.warn(`Error showing tool ${key}:`, error);
                }
            }
        });
        console.log('👁️ All tools shown');
    }
    
    hideAllTools() {
        this.tools.forEach((tool, key) => {
            if (tool.loaded && tool.instance && tool.instance.hide) {
                try {
                    tool.instance.hide();
                } catch (error) {
                    console.warn(`Error hiding tool ${key}:`, error);
                }
            }
        });
        console.log('🙈 All tools hidden');
    }
    
    async reloadTools() {
        console.log('🔄 Reloading tools...');
        this.unloadAllTools();
        await this.loadTools();
        console.log('✅ Tools reloaded');
    }
    
    getTool(key) {
        const tool = this.tools.get(key);
        return tool && tool.loaded ? tool.instance : null;
    }
    
    isToolLoaded(key) {
        const tool = this.tools.get(key);
        return tool && tool.loaded;
    }
    
    getLoadedTools() {
        const loaded = [];
        this.tools.forEach((tool, key) => {
            if (tool.loaded) {
                loaded.push({
                    key,
                    config: tool.config,
                    instance: tool.instance
                });
            }
        });
        return loaded;
    }
    
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    show() {
        this.isVisible = true;
        this.managerDiv.style.display = 'block';
    }
    
    hide() {
        this.isVisible = false;
        this.managerDiv.style.display = 'none';
    }
    
    destroy() {
        this.unloadAllTools();
        if (this.managerDiv) {
            this.managerDiv.remove();
        }
    }
}

// Initialize tools manager when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.toolsManager = new ToolsManager();
    });
} else {
    window.toolsManager = new ToolsManager();
}

export default ToolsManager; 