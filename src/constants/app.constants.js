/**
 * Rekursing - Application Constants
 * Centralized constants for the application
 */

// Mathematical constants
export const MATH_CONSTANTS = {
  PI: Math.PI,
  E: Math.E,
  GOLDEN_RATIO: 1.618033988749895,
  FINE_STRUCTURE_CONSTANT: 1 / 137.035999084,
  PLANCK_CONSTANT: 6.62607015e-34,
  SPEED_OF_LIGHT: 299792458
};

// Coordinate system constants
export const COORDINATE_CONSTANTS = {
  WORLD_SCALE: 1000,
  CHUNK_SIZE: 16,
  MAX_DISTANCE: 10000,
  MIN_DISTANCE: 0.001
};

// AI system constants
export const AI_CONSTANTS = {
  MAX_AGENTS: 50,
  MAX_THOUGHTS_PER_AGENT: 100,
  THINKING_INTERVAL: 1000,
  MEMORY_CAPACITY: 1000,
  LEARNING_RATE: 0.01
};

// Graphics constants
export const GRAPHICS_CONSTANTS = {
  MAX_FPS: 144,
  MIN_FPS: 30,
  TARGET_FPS: 60,
  MAX_DRAW_CALLS: 1000,
  MAX_VERTICES: 1000000,
  MAX_TEXTURES: 16
};

// Game constants
export const GAME_CONSTANTS = {
  MAX_PLAYERS: 100,
  TICK_RATE: 60,
  MAX_ENTITIES: 1000,
  WORLD_SIZE: 10000,
  GRAVITY: 9.81
};

// UI constants
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  TRANSITION_DURATION: 200,
  DEBOUNCE_DELAY: 250,
  THROTTLE_DELAY: 100
};

// Performance constants
export const PERFORMANCE_CONSTANTS = {
  MEMORY_WARNING_THRESHOLD: 0.8,
  FPS_WARNING_THRESHOLD: 30,
  NETWORK_TIMEOUT: 30000,
  CACHE_DURATION: 300000 // 5 minutes
};

// Error codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// Status codes
export const STATUS_CODES = {
  IDLE: 'idle',
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
  CONNECTING: 'connecting',
  DISCONNECTED: 'disconnected'
};

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Agent roles
export const AGENT_ROLES = {
  NAVIGATOR: 'navigator',
  COMBAT: 'combat',
  ENGINEER: 'engineer',
  SCIENTIST: 'scientist',
  DIPLOMAT: 'diplomat',
  TRADER: 'trader'
};

// Job types
export const JOB_TYPES = {
  PATHFINDING: 'pathfinding',
  COMBAT: 'combat',
  CONSTRUCTION: 'construction',
  RESEARCH: 'research',
  DIPLOMACY: 'diplomacy',
  TRADE: 'trade'
};

// Material types
export const MATERIAL_TYPES = {
  METAL: 'metal',
  WOOD: 'wood',
  STONE: 'stone',
  CRYSTAL: 'crystal',
  ORGANIC: 'organic',
  SYNTHETIC: 'synthetic'
};

// Physics constants
export const PHYSICS_CONSTANTS = {
  GRAVITY: 9.81,
  AIR_RESISTANCE: 0.1,
  FRICTION: 0.3,
  ELASTICITY: 0.8,
  DENSITY: 1000
};

// Network constants
export const NETWORK_CONSTANTS = {
  MAX_PACKET_SIZE: 1024,
  HEARTBEAT_INTERVAL: 5000,
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 1000
};

// Storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'rekursing_user_preferences',
  GAME_STATE: 'rekursing_game_state',
  AI_SETTINGS: 'rekursing_ai_settings',
  GRAPHICS_SETTINGS: 'rekursing_graphics_settings'
};

// Event types
export const EVENT_TYPES = {
  SYSTEM_READY: 'system_ready',
  AGENT_SPAWNED: 'agent_spawned',
  AGENT_DISMISSED: 'agent_dismissed',
  JOB_CREATED: 'job_created',
  JOB_COMPLETED: 'job_completed',
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left'
};

export default {
  MATH_CONSTANTS,
  COORDINATE_CONSTANTS,
  AI_CONSTANTS,
  GRAPHICS_CONSTANTS,
  GAME_CONSTANTS,
  UI_CONSTANTS,
  PERFORMANCE_CONSTANTS,
  ERROR_CODES,
  STATUS_CODES,
  PRIORITY_LEVELS,
  AGENT_ROLES,
  JOB_TYPES,
  MATERIAL_TYPES,
  PHYSICS_CONSTANTS,
  NETWORK_CONSTANTS,
  STORAGE_KEYS,
  EVENT_TYPES
}; 