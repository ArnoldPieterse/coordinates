/**
 * Performance Monitor Tool
 * Tracks and displays real-time performance metrics for the game
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 0,
            frameTime: 0,
            memory: 0,
            drawCalls: 0,
            triangles: 0,
            points: 0,
            lines: 0,
            renderTime: 0,
            updateTime: 0,
            networkLatency: 0
        };
        
        this.history = {
            fps: [],
            memory: [],
            renderTime: [],
            networkLatency: []
        };
        
        this.maxHistoryLength = 100;
        this.isVisible = false;
        this.updateInterval = null;
        
        this.init();
    }
    
    init() {
        this.createUI();
        this.startMonitoring();
    }
    
    createUI() {
        const monitorDiv = document.createElement('div');
        monitorDiv.id = 'performanceMonitor';
        monitorDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 250px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            padding: 10px;
            border-radius: 5px;
            z-index: 9999;
            display: none;
            border: 1px solid #333;
        `;
        
        monitorDiv.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 5px;">
                Performance Monitor
                <button id="closeMonitor" style="float: right; background: #f44336; color: white; border: none; border-radius: 3px; padding: 2px 6px; cursor: pointer; font-size: 10px;">X</button>
            </div>
            
            <div style="margin-bottom: 5px;">
                <span style="color: #4CAF50;">FPS:</span> <span id="monitorFPS">0</span>
                <span style="margin-left: 10px; color: #FF9800;">Frame Time:</span> <span id="monitorFrameTime">0ms</span>
            </div>
            
            <div style="margin-bottom: 5px;">
                <span style="color: #2196F3;">Memory:</span> <span id="monitorMemory">0MB</span>
                <span style="margin-left: 10px; color: #9C27B0;">Network:</span> <span id="monitorNetwork">0ms</span>
            </div>
            
            <div style="margin-bottom: 5px;">
                <span style="color: #FF5722;">Draw Calls:</span> <span id="monitorDrawCalls">0</span>
                <span style="margin-left: 10px; color: #607D8B;">Triangles:</span> <span id="monitorTriangles">0</span>
            </div>
            
            <div style="margin-bottom: 5px;">
                <span style="color: #795548;">Render Time:</span> <span id="monitorRenderTime">0ms</span>
                <span style="margin-left: 10px; color: #E91E63;">Update Time:</span> <span id="monitorUpdateTime">0ms</span>
            </div>
            
            <div style="margin-top: 10px; border-top: 1px solid #333; padding-top: 5px;">
                <canvas id="fpsChart" width="230" height="60" style="background: rgba(0,0,0,0.3); border-radius: 3px;"></canvas>
            </div>
            
            <div style="margin-top: 5px; font-size: 10px; color: #888;">
                Press F3 to toggle | Ctrl+F3 for detailed view
            </div>
        `;
        
        document.body.appendChild(monitorDiv);
        
        // Bind close button
        document.getElementById('closeMonitor').addEventListener('click', () => {
            this.hide();
        });
        
        this.monitorDiv = monitorDiv;
        this.canvas = document.getElementById('fpsChart');
        this.ctx = this.canvas.getContext('2d');
    }
    
    startMonitoring() {
        // Update metrics every 100ms
        this.updateInterval = setInterval(() => {
            this.updateMetrics();
            this.updateUI();
            this.updateChart();
        }, 100);
        
        // Bind keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F3' && !e.ctrlKey) {
                e.preventDefault();
                this.toggle();
            } else if (e.ctrlKey && e.key === 'F3') {
                e.preventDefault();
                this.showDetailedView();
            }
        });
    }
    
    updateMetrics() {
        // Get FPS from game
        const fpsElement = document.getElementById('fps');
        if (fpsElement) {
            this.metrics.fps = parseInt(fpsElement.textContent) || 0;
            this.metrics.frameTime = fpsElement.textContent > 0 ? (1000 / this.metrics.fps).toFixed(1) : 0;
        }
        
        // Get memory usage
        if (performance.memory) {
            this.metrics.memory = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }
        
        // Get renderer info if available
        if (window.game && window.game.renderer) {
            const info = window.game.renderer.info;
            this.metrics.drawCalls = info.render.calls;
            this.metrics.triangles = info.render.triangles;
            this.metrics.points = info.render.points;
            this.metrics.lines = info.render.lines;
        }
        
        // Get network latency
        if (window.game && window.game.socket) {
            this.metrics.networkLatency = window.game.socket.io.engine.ping || 0;
        }
        
        // Update history
        this.updateHistory();
    }
    
    updateHistory() {
        const timestamp = Date.now();
        
        this.history.fps.push({ time: timestamp, value: this.metrics.fps });
        this.history.memory.push({ time: timestamp, value: this.metrics.memory });
        this.history.renderTime.push({ time: timestamp, value: this.metrics.renderTime });
        this.history.networkLatency.push({ time: timestamp, value: this.metrics.networkLatency });
        
        // Keep only recent history
        Object.keys(this.history).forEach(key => {
            if (this.history[key].length > this.maxHistoryLength) {
                this.history[key] = this.history[key].slice(-this.maxHistoryLength);
            }
        });
    }
    
    updateUI() {
        if (!this.isVisible) return;
        
        document.getElementById('monitorFPS').textContent = this.metrics.fps;
        document.getElementById('monitorFrameTime').textContent = `${this.metrics.frameTime}ms`;
        document.getElementById('monitorMemory').textContent = `${this.metrics.memory}MB`;
        document.getElementById('monitorNetwork').textContent = `${this.metrics.networkLatency}ms`;
        document.getElementById('monitorDrawCalls').textContent = this.metrics.drawCalls;
        document.getElementById('monitorTriangles').textContent = this.metrics.triangles.toLocaleString();
        document.getElementById('monitorRenderTime').textContent = `${this.metrics.renderTime}ms`;
        document.getElementById('monitorUpdateTime').textContent = `${this.metrics.updateTime}ms`;
    }
    
    updateChart() {
        if (!this.isVisible || !this.ctx) return;
        
        const canvas = this.canvas;
        const ctx = this.ctx;
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw FPS chart
        if (this.history.fps.length > 1) {
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            const maxFPS = Math.max(...this.history.fps.map(p => p.value), 60);
            const timeRange = this.history.fps[this.history.fps.length - 1].time - this.history.fps[0].time;
            
            this.history.fps.forEach((point, index) => {
                const x = (index / (this.history.fps.length - 1)) * width;
                const y = height - (point.value / maxFPS) * height;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // Draw target FPS line
            ctx.strokeStyle = '#FF5722';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(0, height - (60 / maxFPS) * height);
            ctx.lineTo(width, height - (60 / maxFPS) * height);
            ctx.stroke();
            ctx.setLineDash([]);
        }
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
        this.monitorDiv.style.display = 'block';
    }
    
    hide() {
        this.isVisible = false;
        this.monitorDiv.style.display = 'none';
    }
    
    showDetailedView() {
        const details = `
Performance Details:
==================
FPS: ${this.metrics.fps}
Frame Time: ${this.metrics.frameTime}ms
Memory Usage: ${this.metrics.memory}MB
Network Latency: ${this.metrics.networkLatency}ms
Draw Calls: ${this.metrics.drawCalls}
Triangles: ${this.metrics.triangles.toLocaleString()}
Points: ${this.metrics.points}
Lines: ${this.metrics.lines}
Render Time: ${this.metrics.renderTime}ms
Update Time: ${this.metrics.updateTime}ms

Game State:
==========
Current Planet: ${window.game ? window.game.currentPlanet : 'N/A'}
Connected Players: ${window.game ? window.game.players.size + 1 : 'N/A'}
Active Bullets: ${window.game ? window.game.bullets.length : 'N/A'}
In Rocket: ${window.game ? window.game.isInRocket : 'N/A'}
        `;
        
        console.log(details);
        alert(details);
    }
    
    getPerformanceReport() {
        const avgFPS = this.history.fps.length > 0 
            ? this.history.fps.reduce((sum, p) => sum + p.value, 0) / this.history.fps.length 
            : 0;
        
        const avgMemory = this.history.memory.length > 0 
            ? this.history.memory.reduce((sum, p) => sum + p.value, 0) / this.history.memory.length 
            : 0;
        
        return {
            averageFPS: Math.round(avgFPS),
            averageMemory: Math.round(avgMemory),
            currentFPS: this.metrics.fps,
            currentMemory: this.metrics.memory,
            drawCalls: this.metrics.drawCalls,
            triangles: this.metrics.triangles,
            networkLatency: this.metrics.networkLatency
        };
    }
    
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.monitorDiv) {
            this.monitorDiv.remove();
        }
    }
}

// Initialize performance monitor when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.performanceMonitor = new PerformanceMonitor();
    });
} else {
    window.performanceMonitor = new PerformanceMonitor();
}

export default PerformanceMonitor; 