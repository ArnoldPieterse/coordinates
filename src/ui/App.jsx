import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Play from './pages/Play';
import AIAgentDashboard from './pages/AIAgentDashboard';
import GenLab from './pages/GenLab';
import Docs from './pages/Docs';
import Tools from './pages/Tools';
import Settings from './pages/Settings';
import unifiedService from '../core/services/unifiedService';
import './styles/global.css';

export default function App() {
  const [systemStatus, setSystemStatus] = useState('initializing');
  const [connectionStatus, setConnectionStatus] = useState({});
  const [systemStats, setSystemStats] = useState({});

  // Initialize the application
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setSystemStatus('connecting');
        
        // Connect to unified service
        const connection = await unifiedService.connect();
        setConnectionStatus(connection);
        
        if (connection.api) {
          setSystemStatus('ready');
          
          // Get initial system stats
          const stats = await unifiedService.getSystemStats();
          setSystemStats(stats);
          
          // Setup real-time updates
          setupRealtimeUpdates();
          
        } else {
          setSystemStatus('error');
        }
        
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setSystemStatus('error');
      }
    };

    // Wait for RekursingApp to be ready
    if (window.RekursingApp) {
      initializeApp();
    } else {
      // Listen for the rekursingReady event
      const handleRekursingReady = () => {
        initializeApp();
      };
      
      window.addEventListener('rekursingReady', handleRekursingReady);
      return () => window.removeEventListener('rekursingReady', handleRekursingReady);
    }
  }, []);

  // Setup real-time updates
  const setupRealtimeUpdates = () => {
    // Update system stats every 30 seconds
    const statsInterval = setInterval(async () => {
      try {
        const stats = await unifiedService.getSystemStats();
        setSystemStats(stats);
      } catch (error) {
        console.error('Failed to update stats:', error);
      }
    }, 30000);

    // Listen for connection status changes
    const healthInterval = setInterval(async () => {
      try {
        const healthy = await unifiedService.healthCheck();
        if (!healthy && systemStatus === 'ready') {
          setSystemStatus('error');
        } else if (healthy && systemStatus === 'error') {
          setSystemStatus('ready');
        }
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, 10000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(healthInterval);
    };
  };

  // Global context for all components
  const appContext = {
    systemStatus,
    connectionStatus,
    systemStats,
    service: unifiedService,
    
    // Utility methods
    isReady: systemStatus === 'ready',
    hasError: systemStatus === 'error',
    isConnecting: systemStatus === 'connecting',
    
    // Quick access to stats
    getAgentCount: () => systemStats.agents?.total || 0,
    getPlayerCount: () => systemStats.players?.total || 0,
    getJobCount: () => systemStats.jobs?.total || 0,
    isLLMConnected: () => connectionStatus.lmStudio || false
  };

  return (
    <Router>
      <div className="unified-ui-root">
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home appContext={appContext} />} />
            <Route path="/play" element={<Play appContext={appContext} />} />
            <Route path="/ai-dashboard" element={<AIAgentDashboard appContext={appContext} />} />
            <Route path="/genlab" element={<GenLab appContext={appContext} />} />
            <Route path="/tools" element={<Tools appContext={appContext} />} />
            <Route path="/docs" element={<Docs appContext={appContext} />} />
            <Route path="/settings" element={<Settings appContext={appContext} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        {/* System Status Indicator */}
        {systemStatus === 'connecting' && (
          <div className="ai-status-indicator loading">
            <div className="spinner"></div>
            <span>Connecting to Rekursing Services...</span>
          </div>
        )}
        
        {systemStatus === 'error' && (
          <div className="ai-status-indicator error">
            <span>⚠️ Service Connection Lost</span>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                marginLeft: '8px',
                textDecoration: 'underline'
              }}
            >
              Retry
            </button>
          </div>
        )}
        
        {systemStatus === 'ready' && (
          <div className="ai-status-indicator ready">
            <span>✅ Rekursing Systems Active</span>
            <span style={{ fontSize: '12px', marginLeft: '8px', opacity: 0.7 }}>
              {systemStats.agents?.active || 0} agents • {systemStats.players?.online || 0} players
            </span>
          </div>
        )}
      </div>
    </Router>
  );
} 