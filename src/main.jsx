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

// Global application state
window.RekursingApp = {
  // Core systems
  llmManager: null,
  aiAgentSystem: null,
  gameSystem: null,
  
  // UI state
  currentView: 'home',
  isLoading: false,
  
  // Configuration
  config: {
    performance: {
      enableMonitoring: false
    }
  },
  features: {
    LLM_INTEGRATION_ENABLED: false,
    AI_AGENTS_ENABLED: false
  },
  
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
      // Simulate initialization delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    
    console.log('🎉 Rekursing application ready!');
    
  } catch (error) {
    console.error('❌ Failed to initialize Rekursing application:', error);
    showErrorState(error);
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
        <button 
          onclick="window.location.reload()" 
          style="
            background: #6366f1;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.2s;
          "
          onmouseover="this.style.background='#4f46e5'"
          onmouseout="this.style.background='#6366f1'"
        >
          Refresh Page
        </button>
        <div style="margin-top: 2rem; font-size: 0.9rem; color: #64748b;">
          Error: ${error.message}
        </div>
      </div>
    `;
  }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Performance monitoring
window.addEventListener('load', () => {
  if ('performance' in window) {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
  }
});
