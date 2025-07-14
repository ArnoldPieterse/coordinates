/**
 * ComfyUI Launcher and Management Tool
 * Handles installation, configuration, and management of ComfyUI
 * IDX-COMFYUI-017: Launcher module
 */

import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ComfyUILauncher {
    constructor() {
        this.projectRoot = join(__dirname, '../../');
        this.comfyuiPath = join(this.projectRoot, 'comfyui');
        this.configPath = join(this.projectRoot, 'comfyui-config.json');
        this.port = 8188;
    }

    /**
     * Check if ComfyUI is installed
     * IDX-COMFYUI-018: Installation check
     */
    isInstalled() {
        return existsSync(join(this.comfyuiPath, 'main.py'));
    }

    /**
     * Install ComfyUI
     * IDX-COMFYUI-019: Installation process
     */
    async install() {
        console.log('🚀 Installing ComfyUI...');
        
        try {
            // Create ComfyUI directory
            if (!existsSync(this.comfyuiPath)) {
                mkdirSync(this.comfyuiPath, { recursive: true });
            }

            // Clone ComfyUI repository
            console.log('📥 Cloning ComfyUI repository...');
            execSync(`git clone https://github.com/comfyanonymous/ComfyUI.git "${this.comfyuiPath}"`, {
                stdio: 'inherit',
                cwd: this.projectRoot
            });

            // Install Python dependencies
            console.log('📦 Installing Python dependencies...');
            execSync('pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118', {
                stdio: 'inherit',
                cwd: this.comfyuiPath
            });

            execSync('pip install -r requirements.txt', {
                stdio: 'inherit',
                cwd: this.comfyuiPath
            });

            // Download default models
            await this.downloadDefaultModels();

            console.log('✅ ComfyUI installed successfully!');
            return true;
        } catch (error) {
            console.error('❌ Error installing ComfyUI:', error.message);
            return false;
        }
    }

    /**
     * Download default models for the project
     * IDX-COMFYUI-020: Model management
     */
    async downloadDefaultModels() {
        console.log('📥 Downloading default models...');
        
        const modelsDir = join(this.comfyuiPath, 'models', 'checkpoints');
        if (!existsSync(modelsDir)) {
            mkdirSync(modelsDir, { recursive: true });
        }

        const models = [
            {
                name: 'realistic_vision_v5.1.safetensors',
                url: 'https://huggingface.co/SG161222/Realistic_Vision_V5.1_noVAE/resolve/main/Realistic_Vision_V5.1.safetensors',
                description: 'Realistic Vision V5.1 for high-quality realistic textures'
            }
        ];

        for (const model of models) {
            const modelPath = join(modelsDir, model.name);
            if (!existsSync(modelPath)) {
                console.log(`📥 Downloading ${model.name}...`);
                try {
                    execSync(`curl -L "${model.url}" -o "${modelPath}"`, {
                        stdio: 'inherit',
                        cwd: this.comfyuiPath
                    });
                } catch (error) {
                    console.warn(`⚠️ Failed to download ${model.name}:`, error.message);
                }
            }
        }
    }

    /**
     * Start ComfyUI server
     * IDX-COMFYUI-021: Server management
     */
    startServer() {
        if (!this.isInstalled()) {
            console.error('❌ ComfyUI not installed. Run install() first.');
            return null;
        }

        console.log('🚀 Starting ComfyUI server...');
        
        const serverProcess = spawn('python', ['main.py', '--listen', '0.0.0.0', '--port', this.port.toString()], {
            cwd: this.comfyuiPath,
            stdio: 'inherit',
            detached: true
        });

        // Save process info
        this.saveConfig({
            serverPid: serverProcess.pid,
            port: this.port,
            startTime: Date.now()
        });

        console.log(`✅ ComfyUI server started on port ${this.port}`);
        console.log(`🌐 Web UI: http://localhost:${this.port}`);
        
        return serverProcess;
    }

    /**
     * Stop ComfyUI server
     * IDX-COMFYUI-022: Server shutdown
     */
    stopServer() {
        const config = this.loadConfig();
        if (config && config.serverPid) {
            try {
                execSync(`taskkill /PID ${config.serverPid} /F`, { stdio: 'ignore' });
                console.log('🛑 ComfyUI server stopped');
            } catch (error) {
                console.log('ComfyUI server already stopped');
            }
        }
        
        // Clear config
        this.saveConfig({});
    }

    /**
     * Check server status
     * IDX-COMFYUI-023: Status monitoring
     */
    async checkServerStatus() {
        try {
            const response = await fetch(`http://localhost:${this.port}/system_stats`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Save configuration
     * IDX-COMFYUI-024: Configuration management
     */
    saveConfig(config) {
        writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    }

    /**
     * Load configuration
     * IDX-COMFYUI-025: Configuration loading
     */
    loadConfig() {
        if (existsSync(this.configPath)) {
            try {
                return JSON.parse(readFileSync(this.configPath, 'utf8'));
            } catch (error) {
                console.error('Error loading config:', error);
            }
        }
        return {};
    }

    /**
     * Get installation status and recommendations
     * IDX-COMFYUI-026: Status report
     */
    async getStatus() {
        const installed = this.isInstalled();
        const serverRunning = await this.checkServerStatus();
        const config = this.loadConfig();

        return {
            installed,
            serverRunning,
            port: this.port,
            config,
            recommendations: this.getRecommendations(installed, serverRunning)
        };
    }

    /**
     * Get recommendations based on current status
     * IDX-COMFYUI-027: Recommendations
     */
    getRecommendations(installed, serverRunning) {
        const recommendations = [];

        if (!installed) {
            recommendations.push({
                priority: 'high',
                action: 'install',
                message: 'ComfyUI is not installed. Run launcher.install() to install it.'
            });
        } else if (!serverRunning) {
            recommendations.push({
                priority: 'medium',
                action: 'start',
                message: 'ComfyUI server is not running. Run launcher.startServer() to start it.'
            });
        } else {
            recommendations.push({
                priority: 'low',
                action: 'ready',
                message: 'ComfyUI is ready to use!'
            });
        }

        return recommendations;
    }

    /**
     * Update ComfyUI
     * IDX-COMFYUI-028: Update process
     */
    async update() {
        if (!this.isInstalled()) {
            console.error('❌ ComfyUI not installed. Run install() first.');
            return false;
        }

        console.log('🔄 Updating ComfyUI...');
        
        try {
            execSync('git pull', {
                stdio: 'inherit',
                cwd: this.comfyuiPath
            });

            execSync('pip install -r requirements.txt', {
                stdio: 'inherit',
                cwd: this.comfyuiPath
            });

            console.log('✅ ComfyUI updated successfully!');
            return true;
        } catch (error) {
            console.error('❌ Error updating ComfyUI:', error.message);
            return false;
        }
    }

    /**
     * Open ComfyUI web interface
     * IDX-COMFYUI-029: Web interface
     */
    openWebInterface() {
        const url = `http://localhost:${this.port}`;
        console.log(`🌐 Opening ComfyUI web interface: ${url}`);
        
        try {
            execSync(`start ${url}`, { stdio: 'ignore' });
        } catch (error) {
            console.log(`Please open your browser and navigate to: ${url}`);
        }
    }
}

// Export singleton instance
const launcher = new ComfyUILauncher();
export default launcher; 