/**
 * Rekursing - Main Application Configuration
 * Central configuration for all application systems
 */

export const APP_CONFIG = {
  // Application metadata
  name: 'Rekursing',
  version: '1.0.0',
  description: 'Recursive AI Gaming System',
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // API endpoints
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3001/api',
    timeout: 30000,
    retries: 3
  },
  
  // LLM configuration
  llm: {
    lmStudioUrl: process.env.LM_STUDIO_URL || 'http://10.3.129.26:1234',
    defaultModel: 'meta-llama-3-70b-instruct-smashed',
    maxTokens: 1000,
    temperature: 0.7
  },
  
  // Graphics configuration
  graphics: {
    enableAdvancedRendering: true,
    enableCrysisEnhancement: true,
    enableRealTimeMaterials: true,
    enableProceduralGeneration: true,
    maxFPS: 144,
    enableVSync: true
  },
  
  // Game configuration
  game: {
    enableMultiplayer: true,
    enableAI: true,
    enablePhysics: true,
    enableProceduralWorlds: true,
    maxPlayers: 100,
    tickRate: 60
  },
  
  // AI configuration
  ai: {
    enableAgents: true,
    enableNeuralNetworks: true,
    enableMathematicalAI: true,
    enableThoughtFrames: true,
    maxAgents: 50,
    agentUpdateRate: 1000
  },
  
  // Performance configuration
  performance: {
    enableMonitoring: true,
    enableMemoryTracking: true,
    enableWebVitals: true,
    logLevel: 'info'
  },
  
  // UI configuration
  ui: {
    theme: 'dark',
    enableAnimations: true,
    enableResponsiveDesign: true,
    enableAccessibility: true
  }
};

// Feature flags
export const FEATURE_FLAGS = {
  // AI features
  AI_AGENTS_ENABLED: true,
  LLM_INTEGRATION_ENABLED: true,
  NEURAL_NETWORKS_ENABLED: true,
  THOUGHT_FRAMES_ENABLED: true,
  
  // Graphics features
  ADVANCED_RENDERING_ENABLED: true,
  CRYSIS_ENHANCEMENT_ENABLED: true,
  PROCEDURAL_GENERATION_ENABLED: true,
  REAL_TIME_MATERIALS_ENABLED: true,
  
  // Game features
  MULTIPLAYER_ENABLED: true,
  PHYSICS_ENABLED: true,
  WORLD_GENERATION_ENABLED: true,
  
  // Development features
  DEBUG_MODE_ENABLED: process.env.NODE_ENV === 'development',
  PERFORMANCE_MONITORING_ENABLED: true,
  ERROR_REPORTING_ENABLED: true
};

// Development configuration
export const DEV_CONFIG = {
  enableHotReload: true,
  enableSourceMaps: true,
  enableDebugLogging: true,
  enablePerformanceProfiling: false
};

// Production configuration
export const PROD_CONFIG = {
  enableMinification: true,
  enableTreeShaking: true,
  enableCodeSplitting: true,
  enableCaching: true
};

export default APP_CONFIG; 