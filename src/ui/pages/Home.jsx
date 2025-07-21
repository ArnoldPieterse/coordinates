import React from 'react';

export default function Home({ appContext }) {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>🌌 Welcome to Rekursing</h1>
        <p>Recursive AI Gaming System</p>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">{appContext?.getAgentCount() || 0}</span>
            <span className="stat-label">AI Agents</span>
          </div>
          <div className="stat">
            <span className="stat-number">{appContext?.getPlayerCount() || 0}</span>
            <span className="stat-label">Players</span>
          </div>
          <div className="stat">
            <span className="stat-number">{appContext?.getJobCount() || 0}</span>
            <span className="stat-label">Active Jobs</span>
          </div>
        </div>
      </div>
    </div>
  );
} 