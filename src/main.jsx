/**
 * Rekursing - Unified Application Entry Point
 * Recursive AI Gaming System
 * 
 * This is the single, unified entry point for the Rekursing application.
 * It integrates React UI, AI systems, and game components efficiently.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './ui/App.jsx';
import './ui/styles/global.css';

// Import core systems
import { LLMManager } from './ai/llm/LLMManager.js';
import AIAgentManager from './ai/agents/AIAgentManager.js';

// Import configuration
import { APP_CONFIG, FEATURE_FLAGS } from './core/config/app.config.js';

// Global application state
window.RekursingApp = {
  // Core systems
  llmManager: null,
  aiAgentSystem: null,
  gameSystem: null,
  
  // UI state
  currentView: 'home',
  isLoading: true,
  
  // Configuration
  config: APP_CONFIG,
  features: FEATURE_FLAGS,
  
  // Utility methods
  getSystemStatus() {
    return {
      llmManager: !!this.llmManager,
      aiAgentSystem: !!this.aiAgentSystem,
      isLoading: this.isLoading,
      timestamp: Date.now()
    };
  },
  
  async initializeSystems() {
    console.log('🚀 Initializing Rekursing Systems...');
    
    try {
      // Initialize LLM Manager
      if (this.features.LLM_INTEGRATION_ENABLED) {
        console.log('🔌 Initializing LLM Manager...');
        this.llmManager = new LLMManager();
        await this.llmManager.initializeServices();
        console.log('✅ LLM Manager ready');
      }
      
      // Initialize AI Agent System
      if (this.features.AI_AGENTS_ENABLED) {
        console.log('🤖 Initializing AI Agent System...');
        this.aiAgentSystem = new AIAgentManager();
        await this.aiAgentSystem.initialize();
        console.log('✅ AI Agent System ready');
      }
      
      this.isLoading = false;
      console.log('🎉 All systems initialized successfully!');
      
    } catch (error) {
      console.error('❌ System initialization failed:', error);
      this.isLoading = false;
    }
  }
};

// Initialize the application
async function initializeApp() {
  console.log('🌌 Starting Rekursing - Recursive AI Gaming System...');
  
  try {
    // Initialize core systems
    await window.RekursingApp.initializeSystems();
    
    // Initialize React UI
    console.log('⚛️ Mounting React UI...');
    const container = document.getElementById('app');
    
    if (!container) {
      throw new Error('App container not found. Expected element with id="app"');
    }
    
    const root = createRoot(container);
    
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
    
    console.log('✅ React UI mounted successfully');
    
    // Mark app as ready
    document.body.classList.add('app-ready');
    
    // Dispatch ready event
    window.dispatchEvent(new CustomEvent('rekursingReady', {
      detail: window.RekursingApp.getSystemStatus()
    }));
    
    // Setup performance monitoring
    if (APP_CONFIG.performance.enableMonitoring) {
      setupPerformanceMonitoring();
    }
    
    console.log('🎉 Rekursing application ready!');
    
  } catch (error) {
    console.error('❌ Failed to initialize Rekursing application:', error);
    showErrorState(error);
  }
}

// Performance monitoring
function setupPerformanceMonitoring() {
  if ('performance' in window) {
    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * APP_CONFIG.performance.memoryWarningThreshold) {
          console.warn('⚠️ High memory usage detected');
        }
      }, 30000);
    }
    
    // Monitor Core Web Vitals if available
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.log('Performance Metric:', entry.name, entry.value);
          }
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (error) {
        console.warn('Performance monitoring not available:', error);
      }
    }
  }
}

// Error handling
function showErrorState(error) {
  const container = document.getElementById('app');
  if (container) {
    container.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        color: #f8fafc;
        font-family: 'Inter', sans-serif;
        text-align: center;
        padding: 2rem;
      ">
        <div style="font-size: 4rem; margin-bottom: 1rem;">❌</div>
        <h1 style="font-size: 2rem; margin-bottom: 1rem; color: #ef4444;">
          Application Error
        </h1>
        <p style="font-size: 1.1rem; margin-bottom: 2rem; color: #cbd5e1; max-width: 600px;">
          Failed to initialize Rekursing application. Please refresh the page or check your connection.
        </p>
        <div style="
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 2rem;
          font-family: monospace;
          font-size: 0.9rem;
          text-align: left;
          max-width: 600px;
          overflow-x: auto;
        ">
          ${error.message}
        </div>
        <button onclick="window.location.reload()" style="
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease;
        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
          🔄 Refresh Page
        </button>
      </div>
    `;
  }
}

// Service Worker registration
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', registration);
    } catch (error) {
      console.warn('⚠️ Service Worker registration failed:', error);
    }
  }
}

// Start the application
document.addEventListener('DOMContentLoaded', () => {
  // Register service worker
  registerServiceWorker();
  
  // Initialize app
  initializeApp();
});

// Export for testing
export { initializeApp };
export default window.RekursingApp;
