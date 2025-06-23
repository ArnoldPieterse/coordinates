/**
 * Network Analyzer Tool
 * Monitors multiplayer network connections, latency, and data flow
 */

class NetworkAnalyzer {
    constructor() {
        this.stats = {
            connected: false,
            latency: 0,
            packetLoss: 0,
            bytesSent: 0,
            bytesReceived: 0,
            packetsSent: 0,
            packetsReceived: 0,
            connectionTime: 0,
            lastPing: 0,
            pingHistory: [],
            disconnectCount: 0,
            reconnectCount: 0
        };
        
        this.events = [];
        this.maxEvents = 100;
        this.isVisible = false;
        this.updateInterval = null;
        this.pingInterval = null;
        
        this.init();
    }
    
    init() {
        this.createUI();
        this.startMonitoring();
    }
    
    createUI() {
        const analyzerDiv = document.createElement('div');
        analyzerDiv.id = 'networkAnalyzer';
        analyzerDiv.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            width: 300px;
            max-height: 400px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            padding: 10px;
            border-radius: 5px;
            z-index: 9999;
            display: none;
            border: 1px solid #333;
            overflow-y: auto;
        `;
        
        analyzerDiv.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 5px;">
                Network Analyzer
                <button id="closeAnalyzer" style="float: right; background: #f44336; color: white; border: none; border-radius: 3px; padding: 2px 6px; cursor: pointer; font-size: 10px;">X</button>
            </div>
            
            <div style="margin-bottom: 5px;">
                <span style="color: #4CAF50;">Status:</span> <span id="networkStatus">Disconnected</span>
                <span style="margin-left: 10px; color: #FF9800;">Latency:</span> <span id="networkLatency">0ms</span>
            </div>
            
            <div style="margin-bottom: 5px;">
                <span style="color: #2196F3;">Packets Sent:</span> <span id="packetsSent">0</span>
                <span style="margin-left: 10px; color: #9C27B0;">Packets Received:</span> <span id="packetsReceived">0</span>
            </div>
            
            <div style="margin-bottom: 5px;">
                <span style="color: #FF5722;">Bytes Sent:</span> <span id="bytesSent">0B</span>
                <span style="margin-left: 10px; color: #607D8B;">Bytes Received:</span> <span id="bytesReceived">0B</span>
            </div>
            
            <div style="margin-bottom: 5px;">
                <span style="color: #795548;">Packet Loss:</span> <span id="packetLoss">0%</span>
                <span style="margin-left: 10px; color: #E91E63;">Uptime:</span> <span id="uptime">0s</span>
            </div>
            
            <div style="margin-bottom: 5px;">
                <span style="color: #00BCD4;">Disconnects:</span> <span id="disconnectCount">0</span>
                <span style="margin-left: 10px; color: #FFC107;">Reconnects:</span> <span id="reconnectCount">0</span>
            </div>
            
            <div style="margin-top: 10px; border-top: 1px solid #333; padding-top: 5px;">
                <div style="font-weight: bold; margin-bottom: 5px;">Recent Events:</div>
                <div id="networkEvents" style="max-height: 150px; overflow-y: auto; font-size: 10px;"></div>
            </div>
            
            <div style="margin-top: 10px; border-top: 1px solid #333; padding-top: 5px;">
                <canvas id="latencyChart" width="280" height="60" style="background: rgba(0,0,0,0.3); border-radius: 3px;"></canvas>
            </div>
            
            <div style="margin-top: 5px; font-size: 10px; color: #888;">
                Press F4 to toggle | Ctrl+F4 for connection test
            </div>
        `;
        
        document.body.appendChild(analyzerDiv);
        
        // Bind close button
        document.getElementById('closeAnalyzer').addEventListener('click', () => {
            this.hide();
        });
        
        this.analyzerDiv = analyzerDiv;
        this.canvas = document.getElementById('latencyChart');
        this.ctx = this.canvas.getContext('2d');
    }
    
    startMonitoring() {
        // Update stats every 500ms
        this.updateInterval = setInterval(() => {
            this.updateStats();
            this.updateUI();
            this.updateChart();
        }, 500);
        
        // Start ping monitoring
        this.startPingMonitoring();
        
        // Bind keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F4' && !e.ctrlKey) {
                e.preventDefault();
                this.toggle();
            } else if (e.ctrlKey && e.key === 'F4') {
                e.preventDefault();
                this.runConnectionTest();
            }
        });
        
        // Monitor game socket events
        this.monitorSocketEvents();
    }
    
    monitorSocketEvents() {
        // Override socket methods to track events
        if (window.game && window.game.socket) {
            const originalEmit = window.game.socket.emit.bind(window.game.socket);
            
            window.game.socket.emit = (event, data) => {
                this.trackEvent('SENT', event, data);
                this.stats.packetsSent++;
                this.stats.bytesSent += JSON.stringify(data).length;
                return originalEmit(event, data);
            };
            
            // Track received events
            const originalOn = window.game.socket.on.bind(window.game.socket);
            window.game.socket.on = (event, callback) => {
                const wrappedCallback = (data) => {
                    this.trackEvent('RECEIVED', event, data);
                    this.stats.packetsReceived++;
                    this.stats.bytesReceived += JSON.stringify(data).length;
                    return callback(data);
                };
                return originalOn(event, wrappedCallback);
            };
        }
    }
    
    startPingMonitoring() {
        this.pingInterval = setInterval(() => {
            if (window.game && window.game.socket && window.game.socket.connected) {
                const startTime = Date.now();
                
                // Send a ping packet
                window.game.socket.emit('ping', { timestamp: startTime });
                
                // Listen for pong response
                const pongHandler = (data) => {
                    const latency = Date.now() - data.timestamp;
                    this.stats.latency = latency;
                    this.stats.lastPing = Date.now();
                    this.stats.pingHistory.push(latency);
                    
                    // Keep only last 50 pings
                    if (this.stats.pingHistory.length > 50) {
                        this.stats.pingHistory.shift();
                    }
                    
                    window.game.socket.off('pong', pongHandler);
                };
                
                window.game.socket.on('pong', pongHandler);
                
                // Timeout after 5 seconds
                setTimeout(() => {
                    window.game.socket.off('pong', pongHandler);
                    if (this.stats.latency === 0) {
                        this.stats.packetLoss += 1;
                    }
                }, 5000);
            }
        }, 2000);
    }
    
    updateStats() {
        if (window.game && window.game.socket) {
            this.stats.connected = window.game.socket.connected;
            
            if (this.stats.connected && this.stats.connectionTime === 0) {
                this.stats.connectionTime = Date.now();
                this.trackEvent('CONNECTED', 'Connection established');
            } else if (!this.stats.connected && this.stats.connectionTime > 0) {
                this.stats.disconnectCount++;
                this.stats.connectionTime = 0;
                this.trackEvent('DISCONNECTED', 'Connection lost');
            }
            
            // Calculate packet loss
            if (this.stats.packetsSent > 0) {
                this.stats.packetLoss = Math.round((this.stats.packetLoss / this.stats.packetsSent) * 100);
            }
        }
    }
    
    trackEvent(type, event, data = null) {
        const timestamp = new Date().toLocaleTimeString();
        const eventObj = {
            timestamp,
            type,
            event,
            data: data ? JSON.stringify(data).substring(0, 50) + '...' : null
        };
        
        this.events.unshift(eventObj);
        
        // Keep only recent events
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(0, this.maxEvents);
        }
    }
    
    updateUI() {
        if (!this.isVisible) return;
        
        // Update status
        const statusElement = document.getElementById('networkStatus');
        const statusText = this.stats.connected ? 'Connected' : 'Disconnected';
        const statusColor = this.stats.connected ? '#4CAF50' : '#f44336';
        statusElement.textContent = statusText;
        statusElement.style.color = statusColor;
        
        // Update metrics
        document.getElementById('networkLatency').textContent = `${this.stats.latency}ms`;
        document.getElementById('packetsSent').textContent = this.stats.packetsSent;
        document.getElementById('packetsReceived').textContent = this.stats.packetsReceived;
        document.getElementById('bytesSent').textContent = this.formatBytes(this.stats.bytesSent);
        document.getElementById('bytesReceived').textContent = this.formatBytes(this.stats.bytesReceived);
        document.getElementById('packetLoss').textContent = `${this.stats.packetLoss}%`;
        document.getElementById('disconnectCount').textContent = this.stats.disconnectCount;
        document.getElementById('reconnectCount').textContent = this.stats.reconnectCount;
        
        // Update uptime
        if (this.stats.connectionTime > 0) {
            const uptime = Math.floor((Date.now() - this.stats.connectionTime) / 1000);
            document.getElementById('uptime').textContent = `${uptime}s`;
        } else {
            document.getElementById('uptime').textContent = '0s';
        }
        
        // Update events
        this.updateEventsList();
    }
    
    updateEventsList() {
        const eventsDiv = document.getElementById('networkEvents');
        eventsDiv.innerHTML = '';
        
        this.events.slice(0, 10).forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.style.cssText = `
                margin-bottom: 2px;
                padding: 2px;
                border-radius: 2px;
                background: ${this.getEventColor(event.type)};
                font-size: 9px;
            `;
            eventDiv.textContent = `[${event.timestamp}] ${event.type}: ${event.event}`;
            eventsDiv.appendChild(eventDiv);
        });
    }
    
    getEventColor(type) {
        switch (type) {
            case 'CONNECTED': return 'rgba(76, 175, 80, 0.3)';
            case 'DISCONNECTED': return 'rgba(244, 67, 54, 0.3)';
            case 'SENT': return 'rgba(33, 150, 243, 0.3)';
            case 'RECEIVED': return 'rgba(156, 39, 176, 0.3)';
            default: return 'rgba(128, 128, 128, 0.3)';
        }
    }
    
    updateChart() {
        if (!this.isVisible || !this.ctx || this.stats.pingHistory.length < 2) return;
        
        const canvas = this.canvas;
        const ctx = this.ctx;
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw latency chart
        ctx.strokeStyle = '#FF9800';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const maxLatency = Math.max(...this.stats.pingHistory, 100);
        
        this.stats.pingHistory.forEach((latency, index) => {
            const x = (index / (this.stats.pingHistory.length - 1)) * width;
            const y = height - (latency / maxLatency) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw threshold lines
        ctx.strokeStyle = '#f44336';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, height - (100 / maxLatency) * height);
        ctx.lineTo(width, height - (100 / maxLatency) * height);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
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
        this.analyzerDiv.style.display = 'block';
    }
    
    hide() {
        this.isVisible = false;
        this.analyzerDiv.style.display = 'none';
    }
    
    runConnectionTest() {
        if (!window.game || !window.game.socket) {
            alert('No game connection available');
            return;
        }
        
        const testResults = {
            connected: this.stats.connected,
            latency: this.stats.latency,
            packetLoss: this.stats.packetLoss,
            uptime: this.stats.connectionTime > 0 ? Math.floor((Date.now() - this.stats.connectionTime) / 1000) : 0
        };
        
        const report = `
Network Connection Test:
=======================
Status: ${testResults.connected ? 'Connected' : 'Disconnected'}
Latency: ${testResults.latency}ms
Packet Loss: ${testResults.packetLoss}%
Uptime: ${testResults.uptime}s
Packets Sent: ${this.stats.packetsSent}
Packets Received: ${this.stats.packetsReceived}
Data Sent: ${this.formatBytes(this.stats.bytesSent)}
Data Received: ${this.formatBytes(this.stats.bytesReceived)}
Disconnects: ${this.stats.disconnectCount}
        `;
        
        console.log(report);
        alert(report);
    }
    
    getNetworkReport() {
        return {
            connected: this.stats.connected,
            latency: this.stats.latency,
            packetLoss: this.stats.packetLoss,
            packetsSent: this.stats.packetsSent,
            packetsReceived: this.stats.packetsReceived,
            bytesSent: this.stats.bytesSent,
            bytesReceived: this.stats.bytesReceived,
            disconnectCount: this.stats.disconnectCount,
            uptime: this.stats.connectionTime > 0 ? Math.floor((Date.now() - this.stats.connectionTime) / 1000) : 0
        };
    }
    
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }
        if (this.analyzerDiv) {
            this.analyzerDiv.remove();
        }
    }
}

// Initialize network analyzer when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.networkAnalyzer = new NetworkAnalyzer();
    });
} else {
    window.networkAnalyzer = new NetworkAnalyzer();
}

export default NetworkAnalyzer; 