/**
 * Tools Index
 * Central registry and documentation for all development tools
 * 
 * This file serves as the main entry point for the tools system,
 * providing a comprehensive overview and easy access to all tools.
 */

// Tool Registry - All available tools with their metadata
export const TOOL_REGISTRY = {
    // Core Management
    toolsManager: {
        name: 'Tools Manager',
        key: 'toolsManager',
        shortcut: 'F2',
        category: 'management',
        description: 'Central management interface for all development tools',
        file: './tools-manager.js',
        dependencies: [],
        features: [
            'Load/unload all tools',
            'Show/hide all tools',
            'Tool status monitoring',
            'Keyboard shortcut reference',
            'Tool reload functionality'
        ],
        icon: '🛠️'
    },

    // Development Tools
    debugConsole: {
        name: 'Debug Console',
        key: 'debugConsole',
        shortcut: 'F1',
        category: 'development',
        description: 'Real-time debugging console with command interface',
        file: './development/debug-console.js',
        dependencies: [],
        features: [
            'Command history with arrow keys',
            'Game state inspection commands',
            'Player position and planet info',
            'Real-time variable modification',
            'Custom command registration',
            'Auto-hide functionality'
        ],
        commands: [
            'help - Show available commands',
            'clear - Clear console output',
            'players - Show connected players',
            'planet - Show current planet info',
            'goto <planet> - Travel to planet',
            'fps - Show current FPS',
            'position - Show player position',
            'shoot - Fire a bullet',
            'gravity <value> - Set gravity value',
            'speed <value> - Set player speed'
        ],
        icon: '🐛'
    },

    // Performance Tools
    performanceMonitor: {
        name: 'Performance Monitor',
        key: 'performanceMonitor',
        shortcut: 'F3',
        category: 'performance',
        description: 'Real-time performance metrics and monitoring',
        file: './performance/performance-monitor.js',
        dependencies: [],
        features: [
            'FPS tracking with live chart',
            'Memory usage monitoring',
            'Render statistics (draw calls, triangles)',
            'Network latency tracking',
            'Performance history',
            'Detailed performance reports'
        ],
        metrics: [
            'FPS and frame time',
            'Memory usage (MB)',
            'Draw calls and triangles',
            'Network latency',
            'Render and update times'
        ],
        icon: '📊'
    },

    // Multiplayer Tools
    networkAnalyzer: {
        name: 'Network Analyzer',
        key: 'networkAnalyzer',
        shortcut: 'F4',
        category: 'multiplayer',
        description: 'Multiplayer network connection monitoring',
        file: './multiplayer/network-analyzer.js',
        dependencies: ['socket.io-client'],
        features: [
            'Connection status tracking',
            'Latency measurement with charts',
            'Packet loss detection',
            'Data transfer statistics',
            'Network event logging',
            'Connection testing'
        ],
        metrics: [
            'Connection status (Connected/Disconnected)',
            'Latency in milliseconds',
            'Packets sent/received',
            'Bytes transferred',
            'Packet loss percentage',
            'Connection uptime',
            'Disconnect/reconnect counts'
        ],
        icon: '🌐'
    },

    // Gameplay Tools
    gameplayEnhancer: {
        name: 'Gameplay Enhancer',
        key: 'gameplayEnhancer',
        shortcut: 'F5',
        category: 'gameplay',
        description: 'Gameplay modifications and cheats',
        file: './gameplay/gameplay-enhancer.js',
        dependencies: [],
        features: [
            'God mode (invincibility)',
            'Infinite ammo',
            'Super speed and jump',
            'No gravity mode',
            'Fly mode (Q/E controls)',
            'Auto-shoot functionality',
            'Bullet rain effect',
            'Time warp (slow motion)',
            'Teleportation options',
            'Player reset functionality'
        ],
        quickActions: [
            'Teleport to center',
            'Teleport to random location',
            'Reset player position',
            'Clear all bullets',
            'Reset all features (Ctrl+F5)'
        ],
        icon: '🎮'
    },

    // Utility Tools
    gameUtilities: {
        name: 'Game Utilities',
        key: 'gameUtilities',
        shortcut: 'F6',
        category: 'utilities',
        description: 'General utility functions and data management',
        file: './utilities/game-utilities.js',
        dependencies: [],
        features: [
            'Screenshot capture',
            'Game recording (frame capture)',
            'Game data export/import',
            'System information display',
            'Game state information',
            'Utility helper functions'
        ],
        utilityFunctions: [
            'formatBytes() - Format byte sizes',
            'formatTime() - Format time display',
            'getRandomColor() - Generate random colors',
            'distance() - Calculate 3D distance',
            'lerp() - Linear interpolation',
            'clamp() - Value clamping'
        ],
        icon: '🛠️'
    },

    // Project Management Tools
    objectivesManager: {
        name: 'Objectives Manager',
        key: 'objectivesManager',
        shortcut: 'F7',
        category: 'utilities',
        description: 'Web interface for managing project objectives and development roadmap',
        file: './tools/utilities/objectives-manager.js',
        dependencies: [],
        features: [
            'View all project objectives',
            'Add new objectives',
            'Track completion progress',
            'Filter by category and status',
            'Export objectives data',
            'Visual progress indicators'
        ],
        categories: [
            'All Objectives',
            'Completed',
            'Planned',
            'Ideas'
        ],
        icon: '📋'
    },

    // AI Tools
    lmStudioInterface: {
        name: 'LM Studio Interface',
        key: 'lmStudioInterface',
        shortcut: 'F8',
        category: 'ai',
        description: 'AI-powered interface for dynamic game scenarios and content generation',
        file: './tools/ai/lm-studio-interface.js',
        dependencies: [],
        features: [
            'AI integration',
            'Content generation',
            'Scenario creation',
            'NPC generation'
        ],
        icon: '🤖'
    },

    lmStudioOptimizer: {
        name: 'LM Studio Optimizer',
        key: 'lmStudioOptimizer',
        shortcut: 'F9',
        category: 'ai',
        description: 'Automated optimization of LM Studio models for faster responses',
        file: './tools/ai/lm-studio-optimizer.js',
        dependencies: [],
        features: [
            'Model optimization',
            'Performance tuning',
            'Configuration management',
            'Response time improvement'
        ],
        optimization: [
            'Switch to smaller models (8B vs 70B)',
            'Optimize generation parameters',
            'Configure hardware acceleration',
            'Set up game-specific scenarios'
        ],
        icon: '⚡'
    },

    webSearch: {
        name: 'Web Search Tool',
        key: 'webSearch',
        shortcut: 'F10',
        category: 'utilities',
        description: 'Query search engines and return specified number of results',
        file: './tools/utilities/web-search.js',
        dependencies: [],
        features: [
            'Multiple search engines (Google, Bing, DuckDuckGo, YouTube, GitHub)',
            'Configurable number of results',
            'Search history tracking',
            'Result formatting and display',
            'Clickable result links'
        ],
        searchEngines: [
            'Google (🔍)',
            'Bing (🔎)',
            'DuckDuckGo (🦆)',
            'YouTube (📺)',
            'GitHub (💻)'
        ],
        icon: '🔍'
    }
};

// Tool Categories
export const TOOL_CATEGORIES = {
    management: {
        name: 'Management',
        description: 'Core management and control tools',
        icon: '⚙️',
        color: '#2196F3'
    },
    development: {
        name: 'Development',
        description: 'Debugging and development workflow tools',
        icon: '🐛',
        color: '#FF9800'
    },
    performance: {
        name: 'Performance',
        description: 'Performance monitoring and optimization tools',
        icon: '📊',
        color: '#4CAF50'
    },
    multiplayer: {
        name: 'Multiplayer',
        description: 'Multiplayer and networking analysis tools',
        icon: '🌐',
        color: '#9C27B0'
    },
    gameplay: {
        name: 'Gameplay',
        description: 'Gameplay enhancement and modification tools',
        icon: '🎮',
        color: '#E91E63'
    },
    utilities: {
        name: 'Utilities',
        description: 'General-purpose utility functions',
        icon: '🛠️',
        color: '#607D8B'
    },
    ai: {
        name: 'AI',
        description: 'Artificial Intelligence tools',
        icon: '🤖',
        color: '#FF5722'
    }
};

// Keyboard Shortcuts Registry
export const KEYBOARD_SHORTCUTS = {
    'F1': {
        tool: 'debugConsole',
        description: 'Debug Console',
        global: true
    },
    'F2': {
        tool: 'toolsManager',
        description: 'Tools Manager',
        global: true
    },
    'F3': {
        tool: 'performanceMonitor',
        description: 'Performance Monitor',
        global: true
    },
    'F4': {
        tool: 'networkAnalyzer',
        description: 'Network Analyzer',
        global: true
    },
    'F5': {
        tool: 'gameplayEnhancer',
        description: 'Gameplay Enhancer',
        global: true
    },
    'F6': {
        tool: 'gameUtilities',
        description: 'Game Utilities',
        global: true
    },
    'F7': {
        tool: 'objectivesManager',
        description: 'Objectives Manager',
        global: true
    },
    'F8': {
        tool: 'lmStudioInterface',
        description: 'LM Studio Interface',
        global: true
    },
    'F9': {
        tool: 'lmStudioOptimizer',
        description: 'LM Studio Optimizer',
        global: true
    },
    'F10': {
        tool: 'webSearch',
        description: 'Web Search Tool',
        global: true
    },
    '`': {
        tool: 'debugConsole',
        description: 'Debug Console (Alternative)',
        global: true
    },
    'Ctrl+F2': {
        tool: 'toolsManager',
        description: 'Reload Tools',
        global: true
    },
    'Ctrl+F5': {
        tool: 'gameplayEnhancer',
        description: 'Reset All Features',
        global: true
    }
};

// Tool Loading and Management Functions
export class ToolsIndex {
    constructor() {
        this.loadedTools = new Map();
        this.toolInstances = new Map();
        this.initialized = false;
        this.setupGlobalKeyboardHandler();
    }

    /**
     * Setup global keyboard shortcuts for tools
     */
    setupGlobalKeyboardHandler() {
        document.addEventListener('keydown', (e) => {
            // Handle F-keys for tools
            if (e.key.startsWith('F') && e.key.length === 2 && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                const shortcut = KEYBOARD_SHORTCUTS[e.key];
                if (shortcut) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log(`🎯 Tool shortcut triggered: ${e.key} -> ${shortcut.tool}`);
                    
                    // Load and show the tool
                    this.loadTool(shortcut.tool).then(instance => {
                        if (instance && instance.show) {
                            instance.show();
                        }
                    }).catch(error => {
                        console.error(`Failed to load tool ${shortcut.tool}:`, error);
                    });
                    
                    return true;
                }
            }
            
            // Handle Ctrl+F2 for tools manager reload
            if (e.ctrlKey && e.key === 'F2') {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🔄 Reloading all tools...');
                this.reloadAllTools();
                return true;
            }
            
            // Handle Ctrl+F5 for gameplay enhancer reset
            if (e.ctrlKey && e.key === 'F5') {
                e.preventDefault();
                e.stopPropagation();
                
                const instance = this.toolInstances.get('gameplayEnhancer');
                if (instance && instance.resetAllFeatures) {
                    instance.resetAllFeatures();
                    console.log('🔄 Gameplay features reset');
                }
                return true;
            }
        });
        
        this.initialized = true;
        console.log('⌨️ Global keyboard shortcuts initialized');
    }

    /**
     * Reload all tools
     */
    async reloadAllTools() {
        console.log('🔄 Reloading all tools...');
        this.unloadAllTools();
        await this.loadAllTools();
        console.log('✅ All tools reloaded');
    }

    /**
     * Get all tools in a specific category
     */
    getToolsByCategory(category) {
        return Object.values(TOOL_REGISTRY).filter(tool => tool.category === category);
    }

    /**
     * Get all available tools
     */
    getAllTools() {
        return Object.values(TOOL_REGISTRY);
    }

    /**
     * Get tool by key
     */
    getTool(key) {
        return TOOL_REGISTRY[key];
    }

    /**
     * Check if tool is loaded
     */
    isToolLoaded(key) {
        return this.loadedTools.has(key);
    }

    /**
     * Get tool instance
     */
    getToolInstance(key) {
        return this.toolInstances.get(key);
    }

    /**
     * Load a specific tool
     */
    async loadTool(key) {
        const tool = TOOL_REGISTRY[key];
        if (!tool) {
            throw new Error(`Tool '${key}' not found in registry`);
        }

        if (this.loadedTools.has(key)) {
            console.log(`Tool '${key}' is already loaded`);
            return this.toolInstances.get(key);
        }

        try {
            const module = await import(tool.file);
            const ToolClass = module.default;
            
            if (ToolClass) {
                const instance = new ToolClass();
                this.loadedTools.set(key, true);
                this.toolInstances.set(key, instance);
                console.log(`✅ Tool '${tool.name}' loaded successfully`);
                return instance;
            } else {
                throw new Error(`Tool class not found in module`);
            }
        } catch (error) {
            console.error(`❌ Failed to load tool '${key}':`, error);
            throw error;
        }
    }

    /**
     * Load all tools
     */
    async loadAllTools() {
        const results = [];
        for (const key of Object.keys(TOOL_REGISTRY)) {
            try {
                const instance = await this.loadTool(key);
                results.push({ key, success: true, instance });
            } catch (error) {
                results.push({ key, success: false, error: error.message });
            }
        }
        return results;
    }

    /**
     * Unload a specific tool
     */
    unloadTool(key) {
        const instance = this.toolInstances.get(key);
        if (instance && instance.destroy) {
            try {
                instance.destroy();
                console.log(`🧹 Tool '${key}' unloaded successfully`);
            } catch (error) {
                console.warn(`Warning: Error destroying tool '${key}':`, error);
            }
        }
        
        this.loadedTools.delete(key);
        this.toolInstances.delete(key);
    }

    /**
     * Unload all tools
     */
    unloadAllTools() {
        for (const key of this.loadedTools.keys()) {
            this.unloadTool(key);
        }
    }

    /**
     * Show a specific tool
     */
    showTool(key) {
        const instance = this.toolInstances.get(key);
        if (instance && instance.show) {
            instance.show();
        }
    }

    /**
     * Hide a specific tool
     */
    hideTool(key) {
        const instance = this.toolInstances.get(key);
        if (instance && instance.hide) {
            instance.hide();
        }
    }

    /**
     * Show all loaded tools
     */
    showAllTools() {
        for (const [key, instance] of this.toolInstances) {
            if (instance && instance.show) {
                instance.show();
            }
        }
    }

    /**
     * Hide all loaded tools
     */
    hideAllTools() {
        for (const [key, instance] of this.toolInstances) {
            if (instance && instance.hide) {
                instance.hide();
            }
        }
    }

    /**
     * Get tools status report
     */
    getStatusReport() {
        const report = {
            total: Object.keys(TOOL_REGISTRY).length,
            loaded: this.loadedTools.size,
            categories: {},
            tools: {}
        };

        // Count by category
        for (const tool of Object.values(TOOL_REGISTRY)) {
            if (!report.categories[tool.category]) {
                report.categories[tool.category] = { total: 0, loaded: 0 };
            }
            report.categories[tool.category].total++;
            
            if (this.loadedTools.has(tool.key)) {
                report.categories[tool.category].loaded++;
            }
        }

        // Individual tool status
        for (const [key, tool] of Object.entries(TOOL_REGISTRY)) {
            report.tools[key] = {
                name: tool.name,
                category: tool.category,
                loaded: this.loadedTools.has(key),
                shortcut: tool.shortcut
            };
        }

        return report;
    }

    /**
     * Get tools documentation
     */
    getDocumentation() {
        return {
            registry: TOOL_REGISTRY,
            categories: TOOL_CATEGORIES,
            shortcuts: KEYBOARD_SHORTCUTS,
            status: this.getStatusReport()
        };
    }
}

// Utility Functions
export const ToolUtils = {
    /**
     * Format tool list for display
     */
    formatToolList(tools = Object.values(TOOL_REGISTRY)) {
        return tools.map(tool => ({
            ...tool,
            categoryInfo: TOOL_CATEGORIES[tool.category]
        }));
    },

    /**
     * Get tools by feature
     */
    getToolsByFeature(feature) {
        return Object.values(TOOL_REGISTRY).filter(tool => 
            tool.features && tool.features.some(f => 
                f.toLowerCase().includes(feature.toLowerCase())
            )
        );
    },

    /**
     * Validate tool dependencies
     */
    validateDependencies(toolKey) {
        const tool = TOOL_REGISTRY[toolKey];
        if (!tool || !tool.dependencies) return { valid: true, missing: [] };

        const missing = tool.dependencies.filter(dep => {
            // Check if dependency is available
            if (dep === 'socket.io-client') {
                return typeof io === 'undefined';
            }
            // Add more dependency checks as needed
            return false;
        });

        return {
            valid: missing.length === 0,
            missing
        };
    },

    /**
     * Generate tools summary
     */
    generateSummary() {
        const tools = Object.values(TOOL_REGISTRY);
        const categories = Object.keys(TOOL_CATEGORIES);
        
        return {
            totalTools: tools.length,
            categories: categories.length,
            shortcuts: Object.keys(KEYBOARD_SHORTCUTS).length,
            toolsByCategory: categories.map(cat => ({
                category: cat,
                count: tools.filter(t => t.category === cat).length
            }))
        };
    }
};

// Create and export a global instance
const toolsIndex = new ToolsIndex();

// Make it available globally
if (typeof window !== 'undefined') {
    window.toolsIndex = toolsIndex;
}

export default toolsIndex; 