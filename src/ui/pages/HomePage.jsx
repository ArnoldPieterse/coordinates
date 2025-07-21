import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../App';
import './Home.css';

const Home = () => {
  const { systemStatus, systemStats } = useAppContext();

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Trading',
      description: 'Advanced transformer models for intelligent market analysis and signal generation',
      link: '/trading',
      color: 'var(--accent)'
    },
    {
      icon: '🎮',
      title: 'Interactive Gaming',
      description: 'Immersive gaming experience with AI agents and dynamic environments',
      link: '/play',
      color: 'var(--success)'
    },
    {
      icon: '🧠',
      title: 'Context Management',
      description: 'Persistent context system with knowledge graphs and memory management',
      link: '/context',
      color: 'var(--info)'
    },
    {
      icon: '💬',
      title: 'Social AI',
      description: 'AI-powered social interactions and collaborative environments',
      link: '/social-ai',
      color: 'var(--warning)'
    },
    {
      icon: '🧪',
      title: 'GenLab',
      description: 'Experimental AI generation and creative tools',
      link: '/genlab',
      color: 'var(--error)'
    },
    {
      icon: '🛠️',
      title: 'Development Tools',
      description: 'Comprehensive toolkit for developers and power users',
      link: '/tools',
      color: 'var(--text-secondary)'
    }
  ];

  const quickActions = [
    {
      title: 'Start Trading',
      description: 'Launch the AI trading system',
      icon: '📈',
      link: '/trading',
      primary: true
    },
    {
      title: 'Play Game',
      description: 'Enter the gaming world',
      icon: '🎮',
      link: '/play',
      primary: false
    },
    {
      title: 'AI Dashboard',
      description: 'Monitor AI agents',
      icon: '🤖',
      link: '/ai-dashboard',
      primary: false
    },
    {
      title: 'View Context',
      description: 'Explore knowledge system',
      icon: '🧠',
      link: '/context',
      primary: false
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome to <span className="highlight">Rekursing</span>
            </h1>
            <p className="hero-subtitle">
              The next-generation AI-powered gaming and trading platform
            </p>
            <p className="hero-description">
              Experience the future of interactive entertainment and intelligent trading 
              with our advanced transformer models, persistent context systems, and 
              immersive gaming environments.
            </p>
            
            <div className="hero-actions">
              <Link to="/trading" className="btn btn-primary btn-lg">
                🚀 Start Trading
              </Link>
              <Link to="/play" className="btn btn-outline btn-lg">
                🎮 Play Now
              </Link>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="hero-card">
              <div className="card-header">
                <h3>System Status</h3>
                <div className={`status-indicator ${systemStatus}`}>
                  {systemStatus === 'ready' && '✅'}
                  {systemStatus === 'connecting' && '🔄'}
                  {systemStatus === 'error' && '❌'}
                </div>
              </div>
              <div className="status-grid">
                <div className="status-item">
                  <span>AI Agents</span>
                  <span>{systemStats.agents?.active || 0}</span>
                </div>
                <div className="status-item">
                  <span>Players Online</span>
                  <span>{systemStats.players?.online || 0}</span>
                </div>
                <div className="status-item">
                  <span>Model Accuracy</span>
                  <span>95.2%</span>
                </div>
                <div className="status-item">
                  <span>Total Signals</span>
                  <span>1,247</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link} className="quick-action-card">
              <div className="action-icon">{action.icon}</div>
              <div className="action-content">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
              <div className="action-arrow">→</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <h2>Platform Features</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon" style={{ color: feature.color }}>
                {feature.icon}
              </div>
              <div className="feature-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <Link to={feature.link} className="feature-link">
                  Learn More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <h2>Platform Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🤖</div>
            <div className="stat-content">
              <div className="stat-value">{systemStats.agents?.total || 0}</div>
              <div className="stat-label">AI Agents</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{systemStats.players?.total || 0}</div>
              <div className="stat-label">Total Players</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{systemStats.jobs?.total || 0}</div>
              <div className="stat-label">Active Jobs</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-value">95.2%</div>
              <div className="stat-label">Model Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="activity-section">
        <h2>Recent Activity</h2>
        <div className="activity-grid">
          <div className="activity-card">
            <div className="activity-header">
              <h3>System Events</h3>
              <span className="activity-time">Live</span>
            </div>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon success">✅</div>
                <div className="activity-content">
                  <div className="activity-title">System Online</div>
                  <div className="activity-subtitle">All services operational</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon info">🤖</div>
                <div className="activity-content">
                  <div className="activity-title">AI Agents Active</div>
                  <div className="activity-subtitle">{systemStats.agents?.active || 0} agents running</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon warning">📈</div>
                <div className="activity-content">
                  <div className="activity-title">Trading System</div>
                  <div className="activity-subtitle">Transformer models ready</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="activity-card">
            <div className="activity-header">
              <h3>Quick Links</h3>
            </div>
            <div className="quick-links">
              <Link to="/docs" className="quick-link">
                <span className="link-icon">📚</span>
                <span>Documentation</span>
              </Link>
              
              <Link to="/settings" className="quick-link">
                <span className="link-icon">⚙️</span>
                <span>Settings</span>
              </Link>
              
              <Link to="/social-ai" className="quick-link">
                <span className="link-icon">💬</span>
                <span>Social AI</span>
              </Link>
              
              <Link to="/genlab" className="quick-link">
                <span className="link-icon">🧪</span>
                <span>GenLab</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="footer-cta">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of users experiencing the future of AI-powered gaming and trading</p>
          <div className="cta-actions">
            <Link to="/trading" className="btn btn-primary btn-lg">
              Start Trading Now
            </Link>
            <Link to="/play" className="btn btn-outline btn-lg">
              Explore Games
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 