/**
 * Debug Console Tool
 * Provides real-time debugging capabilities for the multiplayer planetary shooter
 */

class DebugConsole {
    constructor() {
        this.isVisible = false;
        this.commands = new Map();
        this.history = [];
        this.historyIndex = 0;
        this.maxHistory = 50;
        
        this.init();
        this.registerDefaultCommands();
    }
    
    init() {
        // Create debug console UI
        this.createUI();
        this.bindEvents();
        
        // Auto-hide after 5 seconds of inactivity
        this.hideTimeout = null;
    }
    
    createUI() {
        const consoleDiv = document.createElement('div');
        consoleDiv.id = 'debugConsole';
        consoleDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 300px;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 10000;
            display: none;
            overflow-y: auto;
            padding: 10px;
        `;
        
        const outputDiv = document.createElement('div');
        outputDiv.id = 'debugOutput';
        outputDiv.style.cssText = `
            height: 250px;
            overflow-y: auto;
            margin-bottom: 10px;
            border-bottom: 1px solid #333;
            padding-bottom: 10px;
        `;
        
        const inputDiv = document.createElement('div');
        inputDiv.style.cssText = `
            display: flex;
            align-items: center;
        `;
        
        const prompt = document.createElement('span');
        prompt.textContent = '> ';
        prompt.style.marginRight = '5px';
        
        const input = document.createElement('input');
        input.id = 'debugInput';
        input.type = 'text';
        input.style.cssText = `
            flex: 1;
            background: transparent;
            border: none;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            outline: none;
        `;
        
        inputDiv.appendChild(prompt);
        inputDiv.appendChild(input);
        consoleDiv.appendChild(outputDiv);
        consoleDiv.appendChild(inputDiv);
        
        document.body.appendChild(consoleDiv);
        
        this.consoleDiv = consoleDiv;
        this.outputDiv = outputDiv;
        this.input = input;
    }
    
    bindEvents() {
        // Toggle console with backtick key
        document.addEventListener('keydown', (e) => {
            if (e.key === '`' && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                this.toggle();
            }
        });
        
        // Handle input
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand(this.input.value);
                this.input.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory(1);
            }
        });
        
        // Auto-hide on click outside
        document.addEventListener('click', (e) => {
            if (!this.consoleDiv.contains(e.target) && this.isVisible) {
                this.hide();
            }
        });
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
        this.consoleDiv.style.display = 'block';
        this.input.focus();
        this.resetHideTimeout();
    }
    
    hide() {
        this.isVisible = false;
        this.consoleDiv.style.display = 'none';
        this.clearHideTimeout();
    }
    
    resetHideTimeout() {
        this.clearHideTimeout();
        this.hideTimeout = setTimeout(() => this.hide(), 5000);
    }
    
    clearHideTimeout() {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
    }
    
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.style.cssText = `
            margin-bottom: 2px;
            color: ${this.getColorForType(type)};
        `;
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        this.outputDiv.appendChild(logEntry);
        this.outputDiv.scrollTop = this.outputDiv.scrollHeight;
        
        // Keep only last 1000 lines
        while (this.outputDiv.children.length > 1000) {
            this.outputDiv.removeChild(this.outputDiv.firstChild);
        }
    }
    
    getColorForType(type) {
        switch (type) {
            case 'error': return '#ff0000';
            case 'warning': return '#ffff00';
            case 'success': return '#00ff00';
            case 'info': return '#00ff00';
            default: return '#00ff00';
        }
    }
    
    executeCommand(command) {
        if (!command.trim()) return;
        
        this.log(`> ${command}`, 'info');
        this.addToHistory(command);
        
        const parts = command.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        if (this.commands.has(cmd)) {
            try {
                this.commands.get(cmd)(args);
            } catch (error) {
                this.log(`Error executing command: ${error.message}`, 'error');
            }
        } else {
            this.log(`Unknown command: ${cmd}. Type 'help' for available commands.`, 'warning');
        }
    }
    
    addToHistory(command) {
        this.history.unshift(command);
        if (this.history.length > this.maxHistory) {
            this.history.pop();
        }
        this.historyIndex = 0;
    }
    
    navigateHistory(direction) {
        if (this.history.length === 0) return;
        
        this.historyIndex += direction;
        if (this.historyIndex < 0) this.historyIndex = this.history.length - 1;
        if (this.historyIndex >= this.history.length) this.historyIndex = 0;
        
        this.input.value = this.history[this.historyIndex];
    }
    
    registerCommand(name, description, handler) {
        this.commands.set(name.toLowerCase(), handler);
    }
    
    registerDefaultCommands() {
        // Help command
        this.registerCommand('help', 'Show available commands', () => {
            this.log('Available commands:', 'info');
            this.commands.forEach((handler, name) => {
                this.log(`  ${name}`, 'info');
            });
        });
        
        // Clear command
        this.registerCommand('clear', 'Clear console output', () => {
            this.outputDiv.innerHTML = '';
        });
        
        // Game state commands
        this.registerCommand('players', 'Show connected players', () => {
            if (window.game && window.game.players) {
                this.log(`Connected players: ${window.game.players.size + 1}`, 'info');
                window.game.players.forEach((player, id) => {
                    this.log(`  Player ${id}: Planet ${player.planet}`, 'info');
                });
            } else {
                this.log('Game not available', 'warning');
            }
        });
        
        this.registerCommand('planet', 'Show current planet info', () => {
            if (window.game) {
                const planetInfo = window.game.planetData[window.game.currentPlanet];
                this.log(`Current planet: ${planetInfo.name}`, 'info');
                this.log(`  Gravity: ${planetInfo.gravity}`, 'info');
                this.log(`  Sky color: #${planetInfo.skyColor.toString(16)}`, 'info');
                this.log(`  Ground color: #${planetInfo.groundColor.toString(16)}`, 'info');
            } else {
                this.log('Game not available', 'warning');
            }
        });
        
        this.registerCommand('goto', 'Travel to planet', (args) => {
            if (!args[0]) {
                this.log('Usage: goto <planet> (earth, mars, moon, venus)', 'warning');
                return;
            }
            
            if (window.game && window.game.travelToPlanet) {
                window.game.travelToPlanet(args[0]);
                this.log(`Traveling to ${args[0]}...`, 'success');
            } else {
                this.log('Game not available', 'warning');
            }
        });
        
        this.registerCommand('fps', 'Show current FPS', () => {
            const fpsElement = document.getElementById('fps');
            if (fpsElement) {
                this.log(`Current FPS: ${fpsElement.textContent}`, 'info');
            } else {
                this.log('FPS counter not available', 'warning');
            }
        });
        
        this.registerCommand('position', 'Show player position', () => {
            if (window.game && window.game.player) {
                const pos = window.game.player.position;
                this.log(`Player position: x=${pos.x.toFixed(2)}, y=${pos.y.toFixed(2)}, z=${pos.z.toFixed(2)}`, 'info');
            } else {
                this.log('Game not available', 'warning');
            }
        });
        
        this.registerCommand('shoot', 'Fire a bullet', () => {
            if (window.game && window.game.shoot) {
                window.game.shoot();
                this.log('Bullet fired!', 'success');
            } else {
                this.log('Game not available', 'warning');
            }
        });
        
        this.registerCommand('gravity', 'Set gravity value', (args) => {
            if (!args[0]) {
                this.log('Usage: gravity <value>', 'warning');
                return;
            }
            
            const gravity = parseFloat(args[0]);
            if (window.game) {
                window.game.gravity = gravity;
                this.log(`Gravity set to ${gravity}`, 'success');
            } else {
                this.log('Game not available', 'warning');
            }
        });
        
        this.registerCommand('speed', 'Set player speed', (args) => {
            if (!args[0]) {
                this.log('Usage: speed <value>', 'warning');
                return;
            }
            
            const speed = parseFloat(args[0]);
            if (window.game) {
                window.game.playerSpeed = speed;
                this.log(`Player speed set to ${speed}`, 'success');
            } else {
                this.log('Game not available', 'warning');
            }
        });
    }
}

// Initialize debug console when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.debugConsole = new DebugConsole();
    });
} else {
    window.debugConsole = new DebugConsole();
}

export default DebugConsole; 