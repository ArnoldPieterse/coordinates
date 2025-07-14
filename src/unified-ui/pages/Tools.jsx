import React from 'react';

const TOOLS = [
  { name: 'Debug Console', key: 'F1', desc: 'Real-time debugging and command interface' },
  { name: 'Performance Monitor', key: 'F2', desc: 'FPS, memory, and render stats' },
  { name: 'Network Analyzer', key: 'F3', desc: 'Connection and latency tracking' },
  { name: 'Gameplay Enhancer', key: 'F4', desc: 'Testing tools and cheats' },
  { name: 'Game Utilities', key: 'F5', desc: 'Screenshots, recording, data management' },
  { name: 'Objectives Manager', key: 'F6', desc: 'Manage project objectives' },
  { name: 'Web Search', key: 'F7', desc: 'Multi-engine dev search' },
  { name: 'LM Studio Interface', key: 'F8', desc: 'AI-powered game enhancement' },
];

export default function Tools() {
  return (
    <div className="tools-page">
      <h1>Developer Tools</h1>
      <ul className="tools-list">
        {TOOLS.map(tool => (
          <li key={tool.key}>
            <b>{tool.name}</b> <span className="tool-key">[{tool.key}]</span>
            <span className="tool-desc">{tool.desc}</span>
            <button className="launch-btn">Launch</button>
          </li>
        ))}
      </ul>
    </div>
  );
} 