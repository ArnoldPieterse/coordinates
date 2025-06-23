/**
 * Gameplay Enhancer Tool
 * Provides gameplay enhancements, cheats, and modifications
 */

class GameplayEnhancer {
    constructor() {
        this.features = {
            godMode: false,
            infiniteAmmo: false,
            superSpeed: false,
            superJump: false,
            noGravity: false,
            autoShoot: false,
            teleport: false,
            flyMode: false,
            bulletRain: false,
            timeWarp: false
        };
        
        this.originalValues = {};
        this.isVisible = false;
        this.autoShootInterval = null;
        this.bulletRainInterval = null;
        
        this.init();
    }
    
    init() {
        this.createUI();
        this.bindEvents();
        this.storeOriginalValues();
    }
    
    createUI() {
        const enhancerDiv = document.createElement('div');
        enhancerDiv.id = 'gameplayEnhancer';
        enhancerDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 350px;
            max-height: 500px;
            background: rgba(0, 0, 0, 0.95);
            color: white;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            padding: 15px;
            border-radius: 8px;
            z-index: 10000;
            display: none;
            border: 2px solid #4CAF50;
            overflow-y: auto;
        `;
        
        enhancerDiv.innerHTML = `
            <div style="margin-bottom: 15px; font-weight: bold; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; text-align: center; font-size: 14px;">
                🎮 Gameplay Enhancer
                <button id="closeEnhancer" style="float: right; background: #f44336; color: white; border: none; border-radius: 3px; padding: 2px 6px; cursor: pointer; font-size: 10px;">X</button>
            </div>
            
            <div style="margin-bottom: 10px;">
                <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
                    <input type="checkbox" id="godMode" style="margin-right: 8px;">
                    <span style="color: #FFD700;">🛡️ God Mode</span>
                </label>
                
                <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
                    <input type="checkbox" id="infiniteAmmo" style="margin-right: 8px;">
                    <span style="color: #FF6B6B;">🔫 Infinite Ammo</span>
                </label>
                
                <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
                    <input type="checkbox" id="superSpeed" style="margin-right: 8px;">
                    <span style="color: #4ECDC4;">⚡ Super Speed</span>
                </label>
                
                <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
                    <input type="checkbox" id="superJump" style="margin-right: 8px;">
                    <span style="color: #45B7D1;">🦘 Super Jump</span>
                </label>
                
                <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
                    <input type="checkbox" id="noGravity" style="margin-right: 8px;">
                    <span style="color: #96CEB4;">🌌 No Gravity</span>
                </label>
                
                <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
                    <input type="checkbox" id="flyMode" style="margin-right: 8px;">
                    <span style="color: #FFEAA7;">🦅 Fly Mode</span>
                </label>
                
                <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
                    <input type="checkbox" id="autoShoot" style="margin-right: 8px;">
                    <span style="color: #DDA0DD;">🎯 Auto Shoot</span>
                </label>
                
                <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
                    <input type="checkbox" id="bulletRain" style="margin-right: 8px;">
                    <span style="color: #FF8C42;">🌧️ Bullet Rain</span>
                </label>
                
                <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
                    <input type="checkbox" id="timeWarp" style="margin-right: 8px;">
                    <span style="color: #9B59B6;">⏰ Time Warp</span>
                </label>
            </div>
            
            <div style="margin-top: 15px; border-top: 1px solid #333; padding-top: 10px;">
                <div style="font-weight: bold; margin-bottom: 8px;">Quick Actions:</div>
                
                <button id="teleportCenter" style="width: 100%; margin-bottom: 5px; padding: 8px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    🎯 Teleport to Center
                </button>
                
                <button id="teleportRandom" style="width: 100%; margin-bottom: 5px; padding: 8px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    🎲 Teleport Random
                </button>
                
                <button id="resetPlayer" style="width: 100%; margin-bottom: 5px; padding: 8px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    🔄 Reset Player
                </button>
                
                <button id="clearBullets" style="width: 100%; margin-bottom: 5px; padding: 8px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    🧹 Clear All Bullets
                </button>
            </div>
            
            <div style="margin-top: 15px; border-top: 1px solid #333; padding-top: 10px; font-size: 10px; color: #888;">
                Press F5 to toggle | Ctrl+F5 to reset all
            </div>
        `;
        
        document.body.appendChild(enhancerDiv);
        
        // Bind close button
        document.getElementById('closeEnhancer').addEventListener('click', () => {
            this.hide();
        });
        
        this.enhancerDiv = enhancerDiv;
    }
    
    bindEvents() {
        // Bind keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F5' && !e.ctrlKey) {
                e.preventDefault();
                this.toggle();
            } else if (e.ctrlKey && e.key === 'F5') {
                e.preventDefault();
                this.resetAllFeatures();
            }
        });
        
        // Bind checkbox events
        Object.keys(this.features).forEach(feature => {
            const checkbox = document.getElementById(feature);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.toggleFeature(feature, e.target.checked);
                });
            }
        });
        
        // Bind button events
        document.getElementById('teleportCenter').addEventListener('click', () => {
            this.teleportToCenter();
        });
        
        document.getElementById('teleportRandom').addEventListener('click', () => {
            this.teleportRandom();
        });
        
        document.getElementById('resetPlayer').addEventListener('click', () => {
            this.resetPlayer();
        });
        
        document.getElementById('clearBullets').addEventListener('click', () => {
            this.clearAllBullets();
        });
    }
    
    storeOriginalValues() {
        if (window.game) {
            this.originalValues = {
                playerSpeed: window.game.playerSpeed,
                jumpForce: window.game.jumpForce,
                gravity: window.game.gravity,
                bulletSpeed: window.game.bulletSpeed
            };
        }
    }
    
    toggleFeature(feature, enabled) {
        this.features[feature] = enabled;
        
        if (!window.game) return;
        
        switch (feature) {
            case 'godMode':
                this.toggleGodMode(enabled);
                break;
            case 'infiniteAmmo':
                this.toggleInfiniteAmmo(enabled);
                break;
            case 'superSpeed':
                this.toggleSuperSpeed(enabled);
                break;
            case 'superJump':
                this.toggleSuperJump(enabled);
                break;
            case 'noGravity':
                this.toggleNoGravity(enabled);
                break;
            case 'flyMode':
                this.toggleFlyMode(enabled);
                break;
            case 'autoShoot':
                this.toggleAutoShoot(enabled);
                break;
            case 'bulletRain':
                this.toggleBulletRain(enabled);
                break;
            case 'timeWarp':
                this.toggleTimeWarp(enabled);
                break;
        }
    }
    
    toggleGodMode(enabled) {
        if (enabled) {
            console.log('🛡️ God Mode enabled - Player is invincible');
        } else {
            console.log('🛡️ God Mode disabled');
        }
    }
    
    toggleInfiniteAmmo(enabled) {
        if (enabled) {
            console.log('🔫 Infinite Ammo enabled');
        } else {
            console.log('🔫 Infinite Ammo disabled');
        }
    }
    
    toggleSuperSpeed(enabled) {
        if (enabled) {
            window.game.playerSpeed = this.originalValues.playerSpeed * 3;
            console.log('⚡ Super Speed enabled');
        } else {
            window.game.playerSpeed = this.originalValues.playerSpeed;
            console.log('⚡ Super Speed disabled');
        }
    }
    
    toggleSuperJump(enabled) {
        if (enabled) {
            window.game.jumpForce = this.originalValues.jumpForce * 2;
            console.log('🦘 Super Jump enabled');
        } else {
            window.game.jumpForce = this.originalValues.jumpForce;
            console.log('🦘 Super Jump disabled');
        }
    }
    
    toggleNoGravity(enabled) {
        if (enabled) {
            window.game.gravity = 0;
            console.log('🌌 No Gravity enabled');
        } else {
            window.game.gravity = this.originalValues.gravity;
            console.log('🌌 No Gravity disabled');
        }
    }
    
    toggleFlyMode(enabled) {
        if (enabled) {
            // Add fly mode controls
            document.addEventListener('keydown', this.flyModeHandler);
            console.log('🦅 Fly Mode enabled - Use Q/E to fly up/down');
        } else {
            document.removeEventListener('keydown', this.flyModeHandler);
            console.log('🦅 Fly Mode disabled');
        }
    }
    
    flyModeHandler = (e) => {
        if (!window.game || !this.features.flyMode) return;
        
        if (e.code === 'KeyQ') {
            window.game.player.position.y += 1;
        } else if (e.code === 'KeyE') {
            window.game.player.position.y -= 1;
        }
    };
    
    toggleAutoShoot(enabled) {
        if (enabled) {
            this.autoShootInterval = setInterval(() => {
                if (window.game && !window.game.isInRocket) {
                    window.game.shoot();
                }
            }, 200);
            console.log('🎯 Auto Shoot enabled');
        } else {
            if (this.autoShootInterval) {
                clearInterval(this.autoShootInterval);
                this.autoShootInterval = null;
            }
            console.log('🎯 Auto Shoot disabled');
        }
    }
    
    toggleBulletRain(enabled) {
        if (enabled) {
            this.bulletRainInterval = setInterval(() => {
                if (window.game && !window.game.isInRocket) {
                    // Shoot in multiple directions
                    for (let i = 0; i < 8; i++) {
                        setTimeout(() => {
                            if (window.game) {
                                const originalRotation = window.game.player.rotation.y;
                                window.game.player.rotation.y = (i * Math.PI * 2) / 8;
                                window.game.shoot();
                                window.game.player.rotation.y = originalRotation;
                            }
                        }, i * 50);
                    }
                }
            }, 1000);
            console.log('🌧️ Bullet Rain enabled');
        } else {
            if (this.bulletRainInterval) {
                clearInterval(this.bulletRainInterval);
                this.bulletRainInterval = null;
            }
            console.log('🌧️ Bullet Rain disabled');
        }
    }
    
    toggleTimeWarp(enabled) {
        if (enabled) {
            // Slow down time
            if (window.game && window.game.clock) {
                window.game.clock.timeScale = 0.5;
            }
            console.log('⏰ Time Warp enabled - Time slowed down');
        } else {
            // Normal time
            if (window.game && window.game.clock) {
                window.game.clock.timeScale = 1.0;
            }
            console.log('⏰ Time Warp disabled');
        }
    }
    
    teleportToCenter() {
        if (window.game && window.game.player) {
            window.game.player.position.set(0, 1, 0);
            window.game.playerVelocity.set(0, 0, 0);
            console.log('🎯 Teleported to center');
        }
    }
    
    teleportRandom() {
        if (window.game && window.game.player) {
            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;
            window.game.player.position.set(x, 1, z);
            window.game.playerVelocity.set(0, 0, 0);
            console.log(`🎲 Teleported to random position: (${x.toFixed(1)}, 1, ${z.toFixed(1)})`);
        }
    }
    
    resetPlayer() {
        if (window.game && window.game.player) {
            window.game.player.position.set(0, 1, 0);
            window.game.playerVelocity.set(0, 0, 0);
            window.game.player.rotation.set(0, 0, 0);
            console.log('🔄 Player reset to initial position');
        }
    }
    
    clearAllBullets() {
        if (window.game && window.game.bullets) {
            window.game.bullets.forEach(bullet => {
                window.game.scene.remove(bullet);
            });
            window.game.bullets = [];
            console.log('🧹 All bullets cleared');
        }
    }
    
    resetAllFeatures() {
        Object.keys(this.features).forEach(feature => {
            this.features[feature] = false;
            const checkbox = document.getElementById(feature);
            if (checkbox) {
                checkbox.checked = false;
            }
            this.toggleFeature(feature, false);
        });
        
        // Reset to original values
        if (window.game && this.originalValues) {
            window.game.playerSpeed = this.originalValues.playerSpeed;
            window.game.jumpForce = this.originalValues.jumpForce;
            window.game.gravity = this.originalValues.gravity;
            window.game.bulletSpeed = this.originalValues.bulletSpeed;
        }
        
        console.log('🔄 All features reset to default');
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
        this.enhancerDiv.style.display = 'block';
    }
    
    hide() {
        this.isVisible = false;
        this.enhancerDiv.style.display = 'none';
    }
    
    destroy() {
        this.resetAllFeatures();
        if (this.enhancerDiv) {
            this.enhancerDiv.remove();
        }
    }
}

// Initialize gameplay enhancer when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.gameplayEnhancer = new GameplayEnhancer();
    });
} else {
    window.gameplayEnhancer = new GameplayEnhancer();
}

export default GameplayEnhancer; 