import React, { useState } from 'react';

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
  const [launchedTools, setLaunchedTools] = useState(new Set());
  const [testResults, setTestResults] = useState({});

  const handleLaunchTool = async (toolName) => {
    console.log(`Launching ${toolName}...`);
    
    // Simulate tool launch
    setLaunchedTools(prev => new Set([...prev, toolName]));
    
    // Simulate API call
    try {
      const response = await fetch(`http://localhost:3001/api/health`);
      if (response.ok) {
        setTestResults(prev => ({
          ...prev,
          [toolName]: { status: 'success', message: 'Tool launched successfully!' }
        }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [toolName]: { status: 'error', message: 'Failed to launch tool' }
      }));
    }
  };

  const handleTestAPI = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/agents');
      const data = await response.json();
      alert(`API Test Successful! Found ${data.agents.length} agents.`);
    } catch (error) {
      alert('API Test Failed: ' + error.message);
    }
  };

  const handleSpawnTestAgent = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/agents/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'navigator' })
      });
      const data = await response.json();
      alert(`Test Agent Spawned: ${data.agent.name}`);
    } catch (error) {
      alert('Failed to spawn test agent: ' + error.message);
    }
  };

  return (
    <div className="tools-page">
      <h1>Developer Tools</h1>
      
      {/* Test Controls */}
      <div className="test-controls" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>🧪 Functionality Tests</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleTestAPI}
            style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Test API Connection
          </button>
          <button 
            onClick={handleSpawnTestAgent}
            style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Spawn Test Agent
          </button>
        </div>
      </div>

      <ul className="tools-list">
        {TOOLS.map(tool => {
          const isLaunched = launchedTools.has(tool.name);
          const testResult = testResults[tool.name];
          
          return (
            <li key={tool.key} style={{ 
              padding: '15px', 
              margin: '10px 0', 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              backgroundColor: isLaunched ? '#e8f5e8' : 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <b>{tool.name}</b> <span className="tool-key">[{tool.key}]</span>
                  <div className="tool-desc">{tool.desc}</div>
                  {testResult && (
                    <div style={{ 
                      marginTop: '5px', 
                      padding: '5px', 
                      borderRadius: '4px',
                      backgroundColor: testResult.status === 'success' ? '#d4edda' : '#f8d7da',
                      color: testResult.status === 'success' ? '#155724' : '#721c24'
                    }}>
                      {testResult.message}
                    </div>
                  )}
                </div>
                <button 
                  className="launch-btn"
                  onClick={() => handleLaunchTool(tool.name)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isLaunched ? '#28a745' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {isLaunched ? '✅ Launched' : 'Launch'}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
} 