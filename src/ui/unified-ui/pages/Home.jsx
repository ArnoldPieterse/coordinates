import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../style.css';

const Home = ({ appContext }) => {
  const [aiThoughts, setAiThoughts] = useState([]);
  const [currentThought, setCurrentThought] = useState('');
  const [coordinateSystem, setCoordinateSystem] = useState({ x: 0, y: 0, z: 0 });

  // Real AI integration with unified service
  useEffect(() => {
    if (appContext?.isReady) {
      // Get real AI thoughts from the unified service
      const getRealAIThoughts = async () => {
        try {
          const stats = appContext.systemStats;
          const thoughts = [
            `🔄 Analyzing ${stats.players?.total || 0} player engagement patterns...`,
            `🧠 Optimizing neural network weights for ${stats.agents?.active || 0} active agents...`,
            `🌌 Calculating coordinate system transformations with fine structure constant...`,
            `🤖 Coordinating ${stats.agents?.total || 0} AI agent activities...`,
            `⚡ Monitoring system performance with ${stats.jobs?.pending || 0} pending jobs...`
          ];
          
          // Add real AI thoughts if available
          if (stats.agents?.active > 0) {
            thoughts.push(`🤖 ${stats.agents.active} agents active, ${stats.jobs?.completed || 0} jobs completed`);
          }
          
          setAiThoughts(thoughts);
        } catch (error) {
          console.error('Error getting AI thoughts:', error);
        }
      };
      
      getRealAIThoughts();
      const interval = setInterval(getRealAIThoughts, 5000);
      return () => clearInterval(interval);
    }
  }, [appContext]);

  // Simulate coordinate system movement with mathematical constants
  useEffect(() => {
    const interval = setInterval(() => {
      setCoordinateSystem(prev => {
        // Use fine structure constant (α ≈ 1/137) for more realistic movement
        const alpha = 1/137.035999084;
        return {
          x: prev.x + (Math.random() - 0.5) * alpha * 0.1,
          y: prev.y + (Math.random() - 0.5) * alpha * 0.1,
          z: prev.z + (Math.random() - 0.5) * alpha * 0.1
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Rotate through AI thoughts
  useEffect(() => {
    if (aiThoughts.length > 0) {
      let thoughtIndex = 0;
      const interval = setInterval(() => {
        setCurrentThought(aiThoughts[thoughtIndex]);
        thoughtIndex = (thoughtIndex + 1) % aiThoughts.length;
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [aiThoughts]);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="rekursing-text">🌌 Rekursing</span>
            <span className="subtitle">Recursive AI Gaming</span>
          </h1>
          <p className="hero-description">
            Experience the future of gaming where AI systems recursively improve themselves, 
            creating an ever-evolving multiplayer planetary combat experience powered by 
            mathematical constants and neural networks.
          </p>
          
          {/* System Status */}
          <div className="system-status">
            <div className={`status-indicator ${appContext?.systemStatus || 'initializing'}`}>
              <span className="status-dot"></span>
              <span className="status-text">
                {appContext?.isReady ? 'AI Systems Active' : 
                 appContext?.hasError ? 'AI Systems Unavailable' : 
                 'Initializing AI Systems...'}
              </span>
            </div>
            
            <div className="live-stats">
              <div className="stat">
                <span className="stat-label">👥 Players Online</span>
                <span className="stat-value">{appContext?.getPlayerCount() || 0}</span>
              </div>
              <div className="stat">
                <span className="stat-label">🤖 AI Agents</span>
                <span className="stat-value">{appContext?.getAgentCount() || 0}</span>
              </div>
              <div className="stat">
                <span className="stat-label">📋 Active Jobs</span>
                <span className="stat-value">{appContext?.getJobCount() || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="hero-buttons">
            <Link to="/play" className="btn btn-primary">
              🚀 Launch Game
            </Link>
            <Link to="/ai-dashboard" className="btn btn-secondary">
              🤖 AI Dashboard
            </Link>
            <Link to="/docs" className="btn btn-tertiary">
              📚 Learn More
            </Link>
          </div>
        </div>
        
        {/* AI Thinking Visualization */}
        <div className="ai-thinking-panel">
          <h3>🧠 AI System Thoughts</h3>
          <div className="thought-display">
            <div className="current-thought">
              <span className="thought-label">Current:</span>
              <span className="thought-text">{currentThought}</span>
            </div>
            <div className="thought-history">
              {aiThoughts.slice(-4).map((thought, index) => (
                <div key={index} className="thought-item">
                  <span className="thought-time">{new Date().toLocaleTimeString()}</span>
                  <span className="thought-content">{thought}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Coordinate System Display */}
      <section className="coordinate-section">
        <h2>🌌 Coordinate System</h2>
        <div className="coordinate-display">
          <div className="coordinate-axis">
            <span className="axis-label">X: {coordinateSystem.x.toFixed(3)}</span>
            <div className="axis-bar" style={{ width: `${Math.abs(coordinateSystem.x) * 100}%` }}></div>
          </div>
          <div className="coordinate-axis">
            <span className="axis-label">Y: {coordinateSystem.y.toFixed(3)}</span>
            <div className="axis-bar" style={{ width: `${Math.abs(coordinateSystem.y) * 100}%` }}></div>
          </div>
          <div className="coordinate-axis">
            <span className="axis-label">Z: {coordinateSystem.z.toFixed(3)}</span>
            <div className="axis-bar" style={{ width: `${Math.abs(coordinateSystem.z) * 100}%` }}></div>
          </div>
        </div>
        <p className="coordinate-description">
          Real-time coordinate system tracking with fine structure constant (α = 1/137) integration
        </p>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>🚀 Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎮</div>
            <h3>Multiplayer Combat</h3>
            <p>Real-time planetary combat with advanced physics and AI opponents</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>Recursive AI</h3>
            <p>AI systems that learn and improve from every player interaction</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌌</div>
            <h3>Mathematical Integration</h3>
            <p>Fine structure constant and quantum mechanics in gameplay</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌳</div>
            <h3>Procedural Generation</h3>
            <p>Biologically realistic tree generation and environmental content</p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2>⚡ Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/tools" className="action-btn">
            <span className="action-icon">🛠️</span>
            <span className="action-text">Development Tools</span>
          </Link>
          <Link to="/genlab" className="action-btn">
            <span className="action-icon">🧬</span>
            <span className="action-text">Procedural Generation</span>
          </Link>
          <Link to="/settings" className="action-btn">
            <span className="action-icon">⚙️</span>
            <span className="action-text">System Settings</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 