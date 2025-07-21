import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import './styles/global.css';

// Create global context
export const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default function App() {
  const [systemStatus, setSystemStatus] = useState('ready');
  const [systemStats, setSystemStats] = useState({
    agents: { total: 5, active: 3 },
    players: { total: 12, online: 8 },
    jobs: { total: 15 }
  });
  const [userPreferences, setUserPreferences] = useState({
    theme: 'dark',
    language: 'en',
    notifications: true,
    autoSave: true
  });
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('home');

  // Initialize the application
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setSystemStatus('connecting');
        
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSystemStatus('ready');
        
        // Load user preferences
        loadUserPreferences();
        
        // Add welcome notification
        addNotification({
          id: Date.now(),
          type: 'success',
          title: 'Welcome to Rekursing',
          message: 'AI-powered gaming and trading platform is ready!',
          duration: 5000
        });
        
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setSystemStatus('error');
        addNotification({
          id: Date.now(),
          type: 'error',
          title: 'Initialization Error',
          message: error.message,
          duration: 10000
        });
      }
    };

    initializeApp();
  }, []);

  // Load user preferences from localStorage
  const loadUserPreferences = () => {
    try {
      const saved = localStorage.getItem('rekursing-preferences');
      if (saved) {
        const prefs = JSON.parse(saved);
        setUserPreferences(prev => ({ ...prev, ...prefs }));
      }
    } catch (error) {
      console.warn('Failed to load preferences:', error);
    }
  };

  // Save user preferences to localStorage
  const saveUserPreferences = (newPrefs) => {
    try {
      const updated = { ...userPreferences, ...newPrefs };
      setUserPreferences(updated);
      localStorage.setItem('rekursing-preferences', JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save preferences:', error);
    }
  };

  // Add notification
  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: notification.id || Date.now(),
      timestamp: Date.now()
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove notification after duration
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, notification.duration);
    }
  };

  // Remove notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Global context for all components
  const appContext = {
    systemStatus,
    systemStats,
    userPreferences,
    notifications,
    activeTab,
    
    // Utility methods
    isReady: systemStatus === 'ready',
    hasError: systemStatus === 'error',
    isConnecting: systemStatus === 'connecting',
    
    // Quick access to stats
    getAgentCount: () => systemStats.agents?.total || 0,
    getPlayerCount: () => systemStats.players?.total || 0,
    getJobCount: () => systemStats.jobs?.total || 0,
    
    // User preferences
    updatePreferences: saveUserPreferences,
    
    // Notifications
    addNotification,
    removeNotification,
    
    // Tab management
    setActiveTab
  };

  return (
    <AppContext.Provider value={appContext}>
      <div className={`unified-ui-root theme-${userPreferences.theme}`}>
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/play" element={<div className="page-placeholder">🎮 Play Page - Coming Soon</div>} />
            <Route path="/trading" element={<div className="page-placeholder">📈 Trading Dashboard - Coming Soon</div>} />
            <Route path="/ai-dashboard" element={<div className="page-placeholder">🤖 AI Dashboard - Coming Soon</div>} />
            <Route path="/genlab" element={<div className="page-placeholder">🧪 GenLab - Coming Soon</div>} />
            <Route path="/tools" element={<div className="page-placeholder">🛠️ Tools - Coming Soon</div>} />
            <Route path="/docs" element={<div className="page-placeholder">📚 Documentation - Coming Soon</div>} />
            <Route path="/settings" element={<div className="page-placeholder">⚙️ Settings - Coming Soon</div>} />
            <Route path="/social-ai" element={<div className="page-placeholder">💬 Social AI - Coming Soon</div>} />
            <Route path="/context" element={<div className="page-placeholder">🧠 Context - Coming Soon</div>} />
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
              className="retry-button"
            >
              Retry
            </button>
          </div>
        )}
        
        {systemStatus === 'ready' && (
          <div className="ai-status-indicator ready">
            <span>✅ Rekursing Systems Active</span>
            <span className="status-details">
              {systemStats.agents?.active || 0} agents • {systemStats.players?.online || 0} players
            </span>
          </div>
        )}

        {/* Notifications */}
        <div className="notifications-container">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification notification-${notification.type}`}
              onClick={() => removeNotification(notification.id)}
            >
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
              </div>
              <button 
                className="notification-close"
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notification.id);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppContext.Provider>
  );
} 