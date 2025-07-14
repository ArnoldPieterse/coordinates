/**
 * Coordinates - Game Launcher JavaScript
 * Handles game initialization and launch process
 * IDX-GAME-001: Game launcher functionality
 */

// ===== GLOBAL VARIABLES =====
let currentStep = 0;
let isLaunching = false;
let launchProgress = 0;

// ===== DOM ELEMENTS =====
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const statusText = document.querySelector('.status-text');
const steps = document.querySelectorAll('.step');
const launchBtn = document.getElementById('launchBtn');
const backBtn = document.getElementById('backBtn');
const errorDisplay = document.getElementById('errorDisplay');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');

// Game info elements
const currentPlanetEl = document.getElementById('currentPlanet');
const playerCountEl = document.getElementById('playerCount');
const serverStatusEl = document.getElementById('serverStatus');

// ===== LAUNCHER CONFIGURATION =====
const LAUNCH_CONFIG = {
    steps: [
        {
            name: 'System Check',
            description: 'Verifying system requirements...',
            duration: 2000,
            status: '⏳'
        },
        {
            name: 'Asset Loading',
            description: 'Loading game assets and textures...',
            duration: 3000,
            status: '⏳'
        },
        {
            name: 'Network Connection',
            description: 'Connecting to game servers...',
            duration: 2500,
            status: '⏳'
        },
        {
            name: 'Game Launch',
            description: 'Starting the game engine...',
            duration: 2000,
            status: '⏳'
        }
    ],
    totalDuration: 9500, // Sum of all step durations
    errorChance: 0.05 // 5% chance of error during launch
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Game launcher initializing...');
    
    initLauncher();
    initEventListeners();
    startSystemCheck();
    
    console.log('✅ Game launcher initialized');
});

// ===== LAUNCHER INITIALIZATION =====
function initLauncher() {
    // Set initial state
    updateProgress(0);
    updateStatus('Initializing...');
    
    // Initialize game info
    updateGameInfo();
    
    // Start periodic updates
    setInterval(updateGameInfo, 5000); // Update every 5 seconds
}

function initEventListeners() {
    // Launch button
    if (launchBtn) {
        launchBtn.addEventListener('click', startLaunch);
    }
    
    // Back button
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '/';
        });
    }
    
    // Retry button
    if (retryBtn) {
        retryBtn.addEventListener('click', retryLaunch);
    }
}

// ===== SYSTEM CHECK =====
function startSystemCheck() {
    console.log('🔧 Starting system check...');
    
    // Simulate system requirements check
    setTimeout(() => {
        const systemCheck = performSystemCheck();
        
        if (systemCheck.success) {
            completeStep(1);
            startAssetLoading();
        } else {
            showError('System check failed: ' + systemCheck.error);
        }
    }, 1000);
}

function performSystemCheck() {
    // Simulate system requirements validation
    const checks = [
        { name: 'WebGL Support', check: () => checkWebGL() },
        { name: 'JavaScript ES6', check: () => checkES6Support() },
        { name: 'Network Connection', check: () => checkNetworkConnection() },
        { name: 'Memory Available', check: () => checkMemoryAvailable() }
    ];
    
    for (const check of checks) {
        const result = check.check();
        if (!result.success) {
            return {
                success: false,
                error: `${check.name}: ${result.error}`
            };
        }
    }
    
    return { success: true };
}

function checkWebGL() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return { success: !!gl };
    } catch (e) {
        return { success: false, error: 'WebGL not supported' };
    }
}

function checkES6Support() {
    try {
        // Test ES6 features
        eval('const test = () => {}; let x = 1; const y = 2;');
        return { success: true };
    } catch (e) {
        return { success: false, error: 'ES6 not supported' };
    }
}

function checkNetworkConnection() {
    // Simulate network check
    return { success: navigator.onLine };
}

function checkMemoryAvailable() {
    // Simulate memory check
    const memory = performance.memory;
    if (memory && memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
        return { success: false, error: 'Insufficient memory' };
    }
    return { success: true };
}

// ===== ASSET LOADING =====
function startAssetLoading() {
    console.log('📦 Starting asset loading...');
    
    // Simulate asset loading with progress updates
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5; // 5-20% per update
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            completeStep(2);
            startNetworkConnection();
        }
        
        updateProgress(progress);
        updateStatus(`Loading assets... ${Math.round(progress)}%`);
    }, 200);
}

// ===== NETWORK CONNECTION =====
function startNetworkConnection() {
    console.log('🌐 Starting network connection...');
    
    // Simulate server connection
    setTimeout(() => {
        const connectionResult = connectToServer();
        
        if (connectionResult.success) {
            completeStep(3);
            startGameLaunch();
        } else {
            showError('Network connection failed: ' + connectionResult.error);
        }
    }, LAUNCH_CONFIG.steps[2].duration);
}

function connectToServer() {
    // Simulate server connection
    const servers = [
        { name: 'US-East', ping: 45 },
        { name: 'US-West', ping: 65 },
        { name: 'Europe', ping: 120 },
        { name: 'Asia', ping: 180 }
    ];
    
    // Select best server
    const bestServer = servers.reduce((best, server) => 
        server.ping < best.ping ? server : best
    );
    
    // Simulate connection success/failure
    if (Math.random() > 0.1) { // 90% success rate
        return {
            success: true,
            server: bestServer
        };
    } else {
        return {
            success: false,
            error: 'Server unavailable'
        };
    }
}

// ===== GAME LAUNCH =====
function startGameLaunch() {
    console.log('🎮 Starting game launch...');
    
    // Simulate game engine initialization
    setTimeout(() => {
        const launchResult = initializeGameEngine();
        
        if (launchResult.success) {
            completeStep(4);
            enableLaunchButton();
        } else {
            showError('Game launch failed: ' + launchResult.error);
        }
    }, LAUNCH_CONFIG.steps[3].duration);
}

function initializeGameEngine() {
    // Simulate game engine initialization
    const checks = [
        'Three.js initialization',
        'Physics engine setup',
        'AI systems loading',
        'Multiplayer module',
        'Audio system'
    ];
    
    for (const check of checks) {
        // Simulate potential failure
        if (Math.random() < 0.02) { // 2% failure rate per check
            return {
                success: false,
                error: `${check} failed`
            };
        }
    }
    
    return { success: true };
}

// ===== STEP MANAGEMENT =====
function completeStep(stepNumber) {
    const step = document.querySelector(`[data-step="${stepNumber}"]`);
    if (step) {
        // Mark previous steps as completed
        for (let i = 1; i < stepNumber; i++) {
            const prevStep = document.querySelector(`[data-step="${i}"]`);
            if (prevStep) {
                prevStep.classList.remove('active');
                prevStep.classList.add('completed');
                prevStep.querySelector('.step-status').textContent = '✅';
            }
        }
        
        // Mark current step as completed
        step.classList.remove('active');
        step.classList.add('completed');
        step.querySelector('.step-status').textContent = '✅';
        
        currentStep = stepNumber;
    }
}

function activateStep(stepNumber) {
    const step = document.querySelector(`[data-step="${stepNumber}"]`);
    if (step) {
        step.classList.add('active');
        step.querySelector('.step-status').textContent = '⏳';
    }
}

// ===== PROGRESS UPDATES =====
function updateProgress(percentage) {
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${Math.round(percentage)}%`;
    }
    
    launchProgress = percentage;
}

function updateStatus(message) {
    if (statusText) {
        statusText.textContent = message;
    }
}

// ===== GAME INFO UPDATES =====
function updateGameInfo() {
    // Update current planet (could be from URL params or user selection)
    const urlParams = new URLSearchParams(window.location.search);
    const planet = urlParams.get('planet') || 'Earth';
    if (currentPlanetEl) {
        currentPlanetEl.textContent = planet;
    }
    
    // Simulate player count
    if (playerCountEl) {
        const baseCount = 42;
        const variation = Math.floor(Math.random() * 20) - 10;
        playerCountEl.textContent = Math.max(0, baseCount + variation);
    }
    
    // Update server status
    if (serverStatusEl) {
        const statuses = ['Online', 'Online', 'Online', 'Maintenance'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        serverStatusEl.textContent = randomStatus;
        serverStatusEl.style.color = randomStatus === 'Online' ? '#10b981' : '#f59e0b';
    }
}

// ===== LAUNCH FUNCTIONALITY =====
function startLaunch() {
    if (isLaunching) return;
    
    isLaunching = true;
    launchBtn.disabled = true;
    launchBtn.innerHTML = '<span class="btn-text">Launching...</span><span class="btn-icon">⏳</span>';
    
    console.log('🚀 Starting game launch...');
    
    // Simulate launch process
    setTimeout(() => {
        const launchSuccess = Math.random() > LAUNCH_CONFIG.errorChance;
        
        if (launchSuccess) {
            launchGame();
        } else {
            showError('Launch failed: Unexpected error occurred');
            resetLaunchState();
        }
    }, 2000);
}

function launchGame() {
    console.log('🎮 Launching game...');
    
    // Show final launch animation
    updateStatus('Launching game...');
    updateProgress(100);
    
    // Redirect to game after short delay
    setTimeout(() => {
        window.location.href = '/src/main.html';
    }, 1000);
}

function resetLaunchState() {
    isLaunching = false;
    launchBtn.disabled = false;
    launchBtn.innerHTML = '<span class="btn-text">Launch Game</span><span class="btn-icon">🚀</span>';
}

function enableLaunchButton() {
    launchBtn.disabled = false;
    updateStatus('Ready to launch');
    updateProgress(100);
}

// ===== ERROR HANDLING =====
function showError(message) {
    console.error('❌ Launch error:', message);
    
    if (errorMessage) {
        errorMessage.textContent = message;
    }
    
    if (errorDisplay) {
        errorDisplay.style.display = 'block';
    }
    
    updateStatus('Error occurred');
}

function retryLaunch() {
    // Hide error display
    if (errorDisplay) {
        errorDisplay.style.display = 'none';
    }
    
    // Reset launcher state
    currentStep = 0;
    isLaunching = false;
    launchProgress = 0;
    
    // Reset all steps
    steps.forEach(step => {
        step.classList.remove('active', 'completed');
        step.querySelector('.step-status').textContent = '⏳';
    });
    
    // Restart system check
    startSystemCheck();
}

// ===== UTILITY FUNCTIONS =====
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ===== EXPORTS =====
// Make functions available globally for debugging
window.GameLauncher = {
    startLaunch,
    retryLaunch,
    updateProgress,
    updateStatus,
    showError
};

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('Game launcher error:', e.error);
    showError('An unexpected error occurred');
});

// ===== PERFORMANCE MONITORING =====
window.addEventListener('load', () => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`Game launcher loaded in ${loadTime}ms`);
    
    // Send to analytics if available
    if (typeof gtag !== 'undefined') {
        gtag('event', 'game_launcher_load', {
            load_time: loadTime
        });
    }
}); 