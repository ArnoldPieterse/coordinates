import React from 'react';

export default function Home() {
  return (
    <div className="home-page">
      <h1>Welcome to Coordinates</h1>
      <p className="subtitle">Multiplayer Planetary Shooter & AI Ecosystem</p>
      <div className="quick-links">
        <a href="#" onClick={e => { e.preventDefault(); window.dispatchEvent(new CustomEvent('navigate', { detail: 'play' })); }}>Play Now</a>
        <a href="#" onClick={e => { e.preventDefault(); window.dispatchEvent(new CustomEvent('navigate', { detail: 'ai' })); }}>AI Dashboard</a>
        <a href="#" onClick={e => { e.preventDefault(); window.dispatchEvent(new CustomEvent('navigate', { detail: 'genlab' })); }}>Procedural Gen Lab</a>
        <a href="#" onClick={e => { e.preventDefault(); window.dispatchEvent(new CustomEvent('navigate', { detail: 'docs' })); }}>Docs</a>
      </div>
      <div className="status-panels">
        <div className="status-panel">
          <h2>Game Status</h2>
          <p>🟢 Online</p>
          <p>Players Online: <b>42</b></p>
        </div>
        <div className="status-panel">
          <h2>AI Agents</h2>
          <p>Active: <b>12</b></p>
          <p>Jobs in Queue: <b>5</b></p>
        </div>
        <div className="status-panel">
          <h2>Deployment</h2>
          <p>rekursing.com</p>
          <p>Last Deploy: <b>2 hours ago</b></p>
        </div>
      </div>
    </div>
  );
} 