import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../App';
import './NavBar.css';

const NavBar = () => {
  const { systemStatus, userPreferences, updatePreferences } = useAppContext();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: '🏠 Home', icon: '🏠' },
    { path: '/trading', label: '📈 Trading', icon: '📈' },
    { path: '/ai-dashboard', label: '🤖 AI Agents', icon: '🤖' },
    { path: '/genlab', label: '🧪 GenLab', icon: '🧪' },
    { path: '/social-ai', label: '💬 Social AI', icon: '💬' },
    { path: '/context', label: '🧠 Context', icon: '🧠' },
    { path: '/tools', label: '🛠️ Tools', icon: '🛠️' },
    { path: '/docs', label: '📚 Docs', icon: '📚' },
    { path: '/settings', label: '⚙️ Settings', icon: '⚙️' }
  ];

  const toggleTheme = () => {
    const newTheme = userPreferences.theme === 'dark' ? 'light' : 'dark';
    updatePreferences({ theme: newTheme });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <span className="logo-icon">🌌</span>
          <span className="logo-text">Rekursing</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-nav desktop-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label.replace(/^[^\s]*\s/, '')}</span>
            </Link>
          ))}
        </div>

        {/* Right Side Controls */}
        <div className="navbar-controls">
          {/* System Status */}
          <div className="system-status">
            <div className={`status-indicator ${systemStatus}`}>
              {systemStatus === 'ready' && '✅'}
              {systemStatus === 'connecting' && '🔄'}
              {systemStatus === 'error' && '❌'}
            </div>
            <span className="status-text">
              {systemStatus === 'ready' && 'Online'}
              {systemStatus === 'connecting' && 'Connecting'}
              {systemStatus === 'error' && 'Error'}
            </span>
          </div>

          {/* Theme Toggle */}
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {userPreferences.theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-container">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span className="mobile-nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
      )}
    </nav>
  );
};

export default NavBar; 