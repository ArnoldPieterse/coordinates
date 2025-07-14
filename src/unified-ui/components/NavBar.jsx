import React from 'react';

const NAV_ITEMS = [
  { key: 'home', label: 'Home' },
  { key: 'play', label: 'Play' },
  { key: 'ai', label: 'AI Dashboard' },
  { key: 'genlab', label: 'Gen Lab' },
  { key: 'docs', label: 'Docs' },
  { key: 'tools', label: 'Tools' },
  { key: 'settings', label: 'Settings' },
];

export default function NavBar({ current, onNavigate }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">🪐 Coordinates</div>
      <ul className="navbar-list">
        {NAV_ITEMS.map(item => (
          <li
            key={item.key}
            className={current === item.key ? 'active' : ''}
            onClick={() => onNavigate(item.key)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </nav>
  );
} 