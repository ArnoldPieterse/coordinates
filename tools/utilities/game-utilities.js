/**
 * Game Utilities Tool
 * Provides various utility functions and helpers for the game
 */

class GameUtilities {
    constructor() {
        this.isVisible = false;
        this.screenshotCanvas = null;
        this.recording = false;
        this.recordedFrames = [];
        
        this.init();
    }
    
    init() {
        this.createUI();
        this.bindEvents();
    }
    
    createUI() {
        const utilitiesDiv = document.createElement('div');
        utilitiesDiv.id = 'gameUtilities';
        utilitiesDiv.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            width: 280px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            padding: 10px;
            border-radius: 5px;
            z-index: 9999;
            display: none;
            border: 1px solid #333;
        `;
        
        utilitiesDiv.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 5px;">
                🛠️ Game Utilities
                <button id="closeUtilities" style="float: right; background: #f44336; color: white; border: none; border-radius: 3px; padding: 2px 6px; cursor: pointer; font-size: 10px;">X</button>
            </div>
            
            <div style="margin-bottom: 8px;">
                <button id="takeScreenshot" style="width: 100%; margin-bottom: 5px; padding: 6px; background: #2196F3; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    📸 Take Screenshot
                </button>
                
                <button id="startRecording" style="width: 100%; margin-bottom: 5px; padding: 6px; background: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    🎥 Start Recording
                </button>
                
                <button id="exportData" style="width: 100%; margin-bottom: 5px; padding: 6px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    📊 Export Game Data
                </button>
                
                <button id="importData" style="width: 100%; margin-bottom: 5px; padding: 6px; background: #FF9800; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    📥 Import Game Data
                </button>
            </div>
            
            <div style="margin-top: 10px; border-top: 1px solid #333; padding-top: 8px;">
                <div style="font-weight: bold; margin-bottom: 5px;">Quick Info:</div>
                <div id="gameInfo" style="font-size: 10px; line-height: 1.3;">
                    Loading game info...
                </div>
            </div>
            
            <div style="margin-top: 10px; border-top: 1px solid #333; padding-top: 8px;">
                <div style="font-weight: bold; margin-bottom: 5px;">System Info:</div>
                <div id="systemInfo" style="font-size: 10px; line-height: 1.3;">
                    Loading system info...
                </div>
            </div>
            
            <div style="margin-top: 10px; border-top: 1px solid #333; padding-top: 8px; font-size: 10px; color: #888;">
                Press F6 to toggle
            </div>
        `;
        
        document.body.appendChild(utilitiesDiv);
        
        // Bind close button
        document.getElementById('closeUtilities').addEventListener('click', () => {
            this.hide();
        });
        
        this.utilitiesDiv = utilitiesDiv;
    }
    
    bindEvents() {
        // Bind keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F6' && !e.ctrlKey) {
                e.preventDefault();
                this.toggle();
            }
        });
        
        // Bind button events
        document.getElementById('takeScreenshot').addEventListener('click', () => {
            this.takeScreenshot();
        });
        
        document.getElementById('startRecording').addEventListener('click', () => {
            this.toggleRecording();
        });
        
        document.getElementById('exportData').addEventListener('click', () => {
            this.exportGameData();
        });
        
        document.getElementById('importData').addEventListener('click', () => {
            this.importGameData();
        });
        
        // Update info periodically
        setInterval(() => {
            this.updateInfo();
        }, 2000);
    }
    
    takeScreenshot() {
        if (!window.game || !window.game.renderer) {
            alert('Game not available for screenshot');
            return;
        }
        
        try {
            // Create canvas for screenshot
            const canvas = window.game.renderer.domElement;
            const dataURL = canvas.toDataURL('image/png');
            
            // Create download link
            const link = document.createElement('a');
            link.download = `screenshot_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
            link.href = dataURL;
            link.click();
            
            console.log('📸 Screenshot saved');
        } catch (error) {
            console.error('Screenshot failed:', error);
            alert('Screenshot failed: ' + error.message);
        }
    }
    
    toggleRecording() {
        const button = document.getElementById('startRecording');
        
        if (!this.recording) {
            this.startRecording();
            button.textContent = '⏹️ Stop Recording';
            button.style.background = '#FF5722';
        } else {
            this.stopRecording();
            button.textContent = '🎥 Start Recording';
            button.style.background = '#f44336';
        }
    }
    
    startRecording() {
        this.recording = true;
        this.recordedFrames = [];
        
        const recordFrame = () => {
            if (!this.recording || !window.game || !window.game.renderer) return;
            
            try {
                const canvas = window.game.renderer.domElement;
                const dataURL = canvas.toDataURL('image/jpeg', 0.8);
                this.recordedFrames.push(dataURL);
                
                // Limit recording to 300 frames (10 seconds at 30fps)
                if (this.recordedFrames.length > 300) {
                    this.recordedFrames.shift();
                }
            } catch (error) {
                console.error('Recording frame failed:', error);
            }
            
            if (this.recording) {
                requestAnimationFrame(recordFrame);
            }
        };
        
        recordFrame();
        console.log('🎥 Recording started');
    }
    
    stopRecording() {
        this.recording = false;
        
        if (this.recordedFrames.length > 0) {
            this.downloadRecording();
        }
        
        console.log('⏹️ Recording stopped');
    }
    
    downloadRecording() {
        // Create a simple video-like file (actually a zip of images)
        const zip = new JSZip();
        
        this.recordedFrames.forEach((frame, index) => {
            // Convert data URL to blob
            const base64 = frame.split(',')[1];
            zip.file(`frame_${index.toString().padStart(4, '0')}.jpg`, base64, {base64: true});
        });
        
        zip.generateAsync({type: 'blob'}).then((content) => {
            const link = document.createElement('a');
            link.download = `recording_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.zip`;
            link.href = URL.createObjectURL(content);
            link.click();
            
            console.log(`📁 Recording saved with ${this.recordedFrames.length} frames`);
        });
    }
    
    exportGameData() {
        if (!window.game) {
            alert('Game not available for data export');
            return;
        }
        
        const gameData = {
            timestamp: new Date().toISOString(),
            player: {
                position: window.game.player ? window.game.player.position.toArray() : null,
                rotation: window.game.player ? window.game.player.rotation.toArray() : null,
                velocity: window.game.playerVelocity ? window.game.playerVelocity.toArray() : null
            },
            game: {
                currentPlanet: window.game.currentPlanet,
                isInRocket: window.game.isInRocket,
                bulletCount: window.game.bullets ? window.game.bullets.length : 0,
                playerCount: window.game.players ? window.game.players.size + 1 : 1
            },
            settings: {
                playerSpeed: window.game.playerSpeed,
                jumpForce: window.game.jumpForce,
                gravity: window.game.gravity,
                bulletSpeed: window.game.bulletSpeed
            }
        };
        
        const dataStr = JSON.stringify(gameData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.download = `game_data_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        link.href = URL.createObjectURL(dataBlob);
        link.click();
        
        console.log('📊 Game data exported');
    }
    
    importGameData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const gameData = JSON.parse(event.target.result);
                    this.applyGameData(gameData);
                    console.log('📥 Game data imported');
                } catch (error) {
                    console.error('Import failed:', error);
                    alert('Failed to import game data: ' + error.message);
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    applyGameData(gameData) {
        if (!window.game) return;
        
        // Apply player position
        if (gameData.player && gameData.player.position && window.game.player) {
            window.game.player.position.fromArray(gameData.player.position);
        }
        
        // Apply player rotation
        if (gameData.player && gameData.player.rotation && window.game.player) {
            window.game.player.rotation.fromArray(gameData.player.rotation);
        }
        
        // Apply player velocity
        if (gameData.player && gameData.player.velocity && window.game.playerVelocity) {
            window.game.playerVelocity.fromArray(gameData.player.velocity);
        }
        
        // Apply game settings
        if (gameData.settings) {
            if (gameData.settings.playerSpeed) window.game.playerSpeed = gameData.settings.playerSpeed;
            if (gameData.settings.jumpForce) window.game.jumpForce = gameData.settings.jumpForce;
            if (gameData.settings.gravity) window.game.gravity = gameData.settings.gravity;
            if (gameData.settings.bulletSpeed) window.game.bulletSpeed = gameData.settings.bulletSpeed;
        }
        
        // Travel to planet if different
        if (gameData.game && gameData.game.currentPlanet && 
            gameData.game.currentPlanet !== window.game.currentPlanet) {
            window.game.travelToPlanet(gameData.game.currentPlanet);
        }
    }
    
    updateInfo() {
        if (!this.isVisible) return;
        
        // Update game info
        const gameInfoDiv = document.getElementById('gameInfo');
        if (gameInfoDiv && window.game) {
            const planetInfo = window.game.planetData[window.game.currentPlanet];
            gameInfoDiv.innerHTML = `
                Planet: ${planetInfo ? planetInfo.name : 'Unknown'}<br>
                Players: ${window.game.players ? window.game.players.size + 1 : 1}<br>
                Bullets: ${window.game.bullets ? window.game.bullets.length : 0}<br>
                In Rocket: ${window.game.isInRocket ? 'Yes' : 'No'}<br>
                Connected: ${window.game.isConnected ? 'Yes' : 'No'}
            `;
        }
        
        // Update system info
        const systemInfoDiv = document.getElementById('systemInfo');
        if (systemInfoDiv) {
            const memory = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 'N/A';
            const fps = document.getElementById('fps') ? document.getElementById('fps').textContent : 'N/A';
            
            systemInfoDiv.innerHTML = `
                Memory: ${memory}MB<br>
                FPS: ${fps}<br>
                Platform: ${navigator.platform}<br>
                Browser: ${navigator.userAgent.split(' ').pop()}<br>
                WebGL: ${this.getWebGLInfo()}
            `;
        }
    }
    
    getWebGLInfo() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return 'Not supported';
            
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).split(' ')[0];
            }
            return 'Available';
        } catch (error) {
            return 'Error';
        }
    }
    
    // Utility functions
    static formatBytes(bytes) {
        if (bytes === 0) return '0B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
    }
    
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    static getRandomColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }
    
    static distance(pos1, pos2) {
        return Math.sqrt(
            Math.pow(pos1.x - pos2.x, 2) + 
            Math.pow(pos1.y - pos2.y, 2) + 
            Math.pow(pos1.z - pos2.z, 2)
        );
    }
    
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
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
        this.utilitiesDiv.style.display = 'block';
        this.updateInfo();
    }
    
    hide() {
        this.isVisible = false;
        this.utilitiesDiv.style.display = 'none';
    }
    
    destroy() {
        if (this.recording) {
            this.stopRecording();
        }
        if (this.utilitiesDiv) {
            this.utilitiesDiv.remove();
        }
    }
}

// Initialize game utilities when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.gameUtilities = new GameUtilities();
    });
} else {
    window.gameUtilities = new GameUtilities();
}

export default GameUtilities; 