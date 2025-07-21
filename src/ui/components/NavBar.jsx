import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

export default function NavBar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/play', label: 'Play', icon: '🎮' },
    { path: '/ai-dashboard', label: 'AI Agents', icon: '🤖' },
    { path: '/genlab', label: 'GenLab', icon: '🧬' },
    { path: '/social-ai', label: 'Social AI', icon: '��' },
    { path: '/context', label: 'Context', icon: '🧠' },
    { path: '/tools', label: 'Tools', icon: '🛠️' },
    { path: '/docs', label: 'Docs', icon: '📚' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">🌌</span>
            <span className="brand-text">Rekursing</span>
          </Link>
        </div>

        <div className="navbar-menu">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="navbar-status">
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span className="status-text">Live</span>
          </div>
        </div>
      </div>
    </nav>
  );
} 