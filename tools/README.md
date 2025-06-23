# Development Tools Suite

A comprehensive collection of development tools for the Multiplayer Planetary Shooter game, designed to enhance debugging, performance monitoring, multiplayer testing, and development workflow.

## 🚀 Quick Start

The tools are automatically loaded when you start the game. You'll see a welcome screen with an overview of all available tools and their keyboard shortcuts.

### Automatic Loading
- Tools are loaded automatically when the game starts
- A welcome screen shows tool status and quick access shortcuts
- All tools are ready to use immediately

### Manual Loading
```javascript
// Access the tools index
const toolsIndex = window.toolsIndex;

// Load a specific tool
await toolsIndex.loadTool('debugConsole');

// Load all tools
await toolsIndex.loadAllTools();

// Get tool status
const status = toolsIndex.getStatusReport();
```

## 📋 Tools Overview

### Core Management
- **🛠️ Tools Manager** (F2) - Central management interface for all tools
- **📊 Tools Index** - Central registry and documentation system

### Development Tools
- **🐛 Debug Console** (F1) - Real-time debugging with command interface
- **📈 Performance Monitor** (F3) - FPS, memory, and render statistics
- **🌐 Network Analyzer** (F4) - Multiplayer connection monitoring
- **🎮 Gameplay Enhancer** (F5) - Gameplay modifications and cheats
- **🛠️ Game Utilities** (F6) - Screenshots, recording, and data management

## 🎯 Keyboard Shortcuts

| Key | Tool | Description |
|-----|------|-------------|
| `F1` | Debug Console | Open debugging console |
| `F2` | Tools Manager | Show/hide all tools |
| `F3` | Performance Monitor | Show performance metrics |
| `F4` | Network Analyzer | Monitor multiplayer connections |
| `F5` | Gameplay Enhancer | Enable gameplay modifications |
| `F6` | Game Utilities | Access utility functions |
| `` ` `` | Debug Console | Alternative debug console access |
| `Ctrl+F2` | Tools Manager | Reload all tools |
| `Ctrl+F5` | Gameplay Enhancer | Reset all features |

## 🏗️ Architecture

### Tools Index System
The tools system is built around a central index (`tools/index.js`) that provides:

- **Tool Registry**: Complete metadata for all tools
- **Category Management**: Organized tool categories
- **Dependency Tracking**: Tool dependency validation
- **Loading System**: Dynamic tool loading and unloading
- **Status Reporting**: Real-time tool status information

### File Structure
```
tools/
├── index.js                 # Central tools registry and management
├── launcher.js              # Automatic tool launcher
├── tools-manager.js         # Tools management interface
├── development/
│   └── debug-console.js     # Debug console tool
├── performance/
│   └── performance-monitor.js # Performance monitoring
├── multiplayer/
│   └── network-analyzer.js  # Network analysis
├── gameplay/
│   └── gameplay-enhancer.js # Gameplay modifications
├── utilities/
│   └── game-utilities.js    # Utility functions
└── README.md               # This documentation
```

## 🛠️ Tool Details

### Tools Manager (F2)
**Category**: Management  
**File**: `tools-manager.js`

Central interface for managing all development tools.

**Features**:
- Load/unload individual tools
- Show/hide all tools at once
- Tool status monitoring
- Keyboard shortcut reference
- Tool reload functionality

**Usage**:
```javascript
// Access tools manager
const manager = window.toolsIndex.getToolInstance('toolsManager');

// Show all tools
manager.showAllTools();

// Hide all tools
manager.hideAllTools();

// Reload tools
manager.reloadTools();
```

### Debug Console (F1)
**Category**: Development  
**File**: `development/debug-console.js`

Real-time debugging console with command interface.

**Features**:
- Command history with arrow keys
- Game state inspection commands
- Player position and planet info
- Real-time variable modification
- Custom command registration
- Auto-hide functionality

**Available Commands**:
- `help` - Show available commands
- `clear` - Clear console output
- `players` - Show connected players
- `planet` - Show current planet info
- `goto <planet>` - Travel to planet
- `fps` - Show current FPS
- `position` - Show player position
- `shoot` - Fire a bullet
- `gravity <value>` - Set gravity value
- `speed <value>` - Set player speed

**Usage**:
```javascript
// Access debug console
const console = window.toolsIndex.getToolInstance('debugConsole');

// Show console
console.show();

// Hide console
console.hide();

// Execute command
console.executeCommand('players');
```

### Performance Monitor (F3)
**Category**: Performance  
**File**: `performance/performance-monitor.js`

Real-time performance metrics and monitoring.

**Features**:
- FPS tracking with live chart
- Memory usage monitoring
- Render statistics (draw calls, triangles)
- Network latency tracking
- Performance history
- Detailed performance reports

**Metrics Tracked**:
- FPS and frame time
- Memory usage (MB)
- Draw calls and triangles
- Network latency
- Render and update times

**Usage**:
```javascript
// Access performance monitor
const monitor = window.toolsIndex.getToolInstance('performanceMonitor');

// Show monitor
monitor.show();

// Get current metrics
const metrics = monitor.getMetrics();

// Export performance data
monitor.exportData();
```

### Network Analyzer (F4)
**Category**: Multiplayer  
**File**: `multiplayer/network-analyzer.js`

Multiplayer network connection monitoring.

**Features**:
- Connection status tracking
- Latency measurement with charts
- Packet loss detection
- Data transfer statistics
- Network event logging
- Connection testing

**Metrics Tracked**:
- Connection status (Connected/Disconnected)
- Latency in milliseconds
- Packets sent/received
- Bytes transferred
- Packet loss percentage
- Connection uptime
- Disconnect/reconnect counts

**Usage**:
```javascript
// Access network analyzer
const analyzer = window.toolsIndex.getToolInstance('networkAnalyzer');

// Show analyzer
analyzer.show();

// Get connection stats
const stats = analyzer.getConnectionStats();

// Test connection
analyzer.testConnection();
```

### Gameplay Enhancer (F5)
**Category**: Gameplay  
**File**: `gameplay/gameplay-enhancer.js`

Gameplay modifications and cheats for testing.

**Features**:
- God mode (invincibility)
- Infinite ammo
- Super speed and jump
- No gravity mode
- Fly mode (Q/E controls)
- Auto-shoot functionality
- Bullet rain effect
- Time warp (slow motion)
- Teleportation options
- Player reset functionality

**Quick Actions**:
- Teleport to center
- Teleport to random location
- Reset player position
- Clear all bullets
- Reset all features (Ctrl+F5)

**Usage**:
```javascript
// Access gameplay enhancer
const enhancer = window.toolsIndex.getToolInstance('gameplayEnhancer');

// Enable god mode
enhancer.enableGodMode();

// Enable fly mode
enhancer.enableFlyMode();

// Teleport to center
enhancer.teleportToCenter();

// Reset all features
enhancer.resetAllFeatures();
```

### Game Utilities (F6)
**Category**: Utilities  
**File**: `utilities/game-utilities.js`

General utility functions and data management.

**Features**:
- Screenshot capture
- Game recording (frame capture)
- Game data export/import
- System information display
- Game state information
- Utility helper functions

**Utility Functions**:
- `formatBytes()` - Format byte sizes
- `formatTime()` - Format time display
- `getRandomColor()` - Generate random colors
- `distance()` - Calculate 3D distance
- `lerp()` - Linear interpolation
- `clamp()` - Value clamping

**Usage**:
```javascript
// Access game utilities
const utils = window.toolsIndex.getToolInstance('gameUtilities');

// Take screenshot
utils.takeScreenshot();

// Start recording
utils.startRecording();

// Export game data
utils.exportGameData();

// Get system info
const sysInfo = utils.getSystemInfo();
```

## 🔧 API Reference

### Tools Index API

```javascript
// Get tools index instance
const toolsIndex = window.toolsIndex;

// Load a specific tool
await toolsIndex.loadTool('debugConsole');

// Load all tools
await toolsIndex.loadAllTools();

// Unload a tool
toolsIndex.unloadTool('debugConsole');

// Show/hide tools
toolsIndex.showTool('debugConsole');
toolsIndex.hideTool('debugConsole');

// Get tool status
const status = toolsIndex.getStatusReport();

// Get tool instance
const instance = toolsIndex.getToolInstance('debugConsole');

// Get all tools
const allTools = toolsIndex.getAllTools();

// Get tools by category
const devTools = toolsIndex.getToolsByCategory('development');
```

### Tool Registry

```javascript
// Access tool registry
const registry = window.ToolsLauncher.getRegistry();

// Get tool metadata
const toolInfo = registry.debugConsole;

// Access categories
const categories = window.ToolsLauncher.getCategories();

// Get shortcuts
const shortcuts = window.ToolsLauncher.getShortcuts();
```

### Tool Utilities

```javascript
// Access tool utilities
const utils = window.ToolUtils;

// Format tool list
const formattedTools = utils.formatToolList();

// Get tools by feature
const fpsTools = utils.getToolsByFeature('fps');

// Validate dependencies
const validation = utils.validateDependencies('networkAnalyzer');

// Generate summary
const summary = utils.generateSummary();
```

## 🎮 Multiplayer Testing

The tools are specifically designed to enhance multiplayer testing:

### Network Testing
1. Open multiple browser tabs to simulate multiple players
2. Use Network Analyzer (F4) to monitor connections
3. Watch for connection issues and latency spikes
4. Test reconnection scenarios

### Gameplay Testing
1. Use Gameplay Enhancer (F5) to test different scenarios
2. Enable god mode for unlimited testing
3. Use teleportation to quickly test different areas
4. Test planet travel with rockets

### Performance Testing
1. Monitor FPS with Performance Monitor (F3)
2. Watch memory usage during extended sessions
3. Test with multiple players to see performance impact
4. Monitor render statistics

### Debug Testing
1. Use Debug Console (F1) to inspect game state
2. Check player positions and planet info
3. Test commands and variable modifications
4. Monitor real-time game data

## 🚀 Development Workflow

### Adding New Tools

1. Create tool file in appropriate category folder
2. Add tool metadata to `tools/index.js` registry
3. Implement tool class with required methods
4. Add keyboard shortcut if needed
5. Update documentation

### Tool Template

```javascript
export default class MyTool {
    constructor() {
        this.name = 'My Tool';
        this.visible = false;
        this.init();
    }

    init() {
        // Initialize tool
    }

    show() {
        this.visible = true;
        // Show tool UI
    }

    hide() {
        this.visible = false;
        // Hide tool UI
    }

    destroy() {
        // Cleanup tool
    }
}
```

### Tool Categories

- **Management**: Core management and control tools
- **Development**: Debugging and development workflow tools
- **Performance**: Performance monitoring and optimization tools
- **Multiplayer**: Multiplayer and networking analysis tools
- **Gameplay**: Gameplay enhancement and modification tools
- **Utilities**: General-purpose utility functions

## 🔍 Troubleshooting

### Tools Not Loading
- Check browser console for errors
- Verify all tool files exist
- Check for missing dependencies
- Ensure game is fully loaded before tools initialize

### Performance Issues
- Disable unused tools to reduce overhead
- Monitor memory usage with Performance Monitor
- Check for memory leaks in tool implementations
- Use browser dev tools for additional profiling

### Network Issues
- Use Network Analyzer to diagnose connection problems
- Check server status and WebSocket connections
- Monitor packet loss and latency
- Test with different network conditions

## 📈 Performance Impact

The tools are designed to have minimal performance impact:

- **Lazy Loading**: Tools are loaded only when needed
- **Efficient Updates**: Status updates are throttled
- **Memory Management**: Proper cleanup and garbage collection
- **Conditional Rendering**: UI elements only render when visible
- **Optimized Monitoring**: Efficient data collection and processing

## 🔮 Future Enhancements

Potential improvements and new tools:

- **Chat System**: In-game chat for multiplayer testing
- **Replay System**: Record and replay game sessions
- **AI Testing**: Automated testing scenarios
- **Plugin System**: Third-party tool support
- **Cloud Integration**: Remote monitoring and logging
- **Mobile Support**: Touch-friendly tool interfaces
- **Advanced Analytics**: Detailed game analytics
- **Custom Scripts**: User-defined testing scripts

## 📞 Support

For issues or questions about the development tools:

1. Check the browser console for error messages
2. Use the Debug Console (F1) for real-time debugging
3. Monitor performance with Performance Monitor (F3)
4. Check network status with Network Analyzer (F4)
5. Review this documentation for usage instructions

The tools are designed to be self-documenting and provide helpful error messages when issues occur. 