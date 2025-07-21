import React, { useState } from 'react';
import TerminalInterface from '../components/TerminalInterface.jsx';

const Tools = () => {
  const [activeTool, setActiveTool] = useState('terminal');

  const tools = [
    {
      id: 'terminal',
      name: '🔌 Terminal Access',
      description: 'Fast local message transfers to LM Studio',
      component: <TerminalInterface />
    },
    {
      id: 'debug',
      name: '🐛 Debug Console',
      description: 'System debugging and monitoring tools',
      component: <div className="tool-placeholder">Debug Console - Coming Soon</div>
    },
    {
      id: 'performance',
      name: '⚡ Performance Monitor',
      description: 'Real-time performance metrics and optimization',
      component: <div className="tool-placeholder">Performance Monitor - Coming Soon</div>
    },
    {
      id: 'network',
      name: '🌐 Network Analyzer',
      description: 'Network connectivity and latency analysis',
      component: <div className="tool-placeholder">Network Analyzer - Coming Soon</div>
    }
  ];

  const activeToolData = tools.find(tool => tool.id === activeTool);

  return (
    <div className="tools-page">
      <div className="tools-header">
        <h1>🛠️ Development Tools</h1>
        <p>Advanced tools for system development and debugging</p>
      </div>

      <div className="tools-container">
        {/* Tool Navigation */}
        <div className="tools-sidebar">
          <h3>Available Tools</h3>
          <div className="tools-list">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`tool-button ${activeTool === tool.id ? 'active' : ''}`}
              >
                <div className="tool-info">
                  <div className="tool-name">{tool.name}</div>
                  <div className="tool-description">{tool.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tool Content */}
        <div className="tool-content">
          <div className="tool-header">
            <h2>{activeToolData?.name}</h2>
            <p>{activeToolData?.description}</p>
          </div>
          
          <div className="tool-body">
            {activeToolData?.component}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tools; 