import React, { useState, useEffect } from 'react';

export default function Home() {
  const [apiStatus, setApiStatus] = useState('checking');
  const [agentCount, setAgentCount] = useState(0);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    checkAPIStatus();
  }, []);

  const checkAPIStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        const data = await response.json();
        setApiStatus('connected');
        setAgentCount(data.agents || 0);
      } else {
        setApiStatus('error');
      }
    } catch (error) {
      setApiStatus('error');
    }
  };

  const testSpawnAgent = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/agents/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'navigator' })
      });
      const data = await response.json();
      setTestResults(prev => ({
        ...prev,
        spawnAgent: { success: true, message: `Agent spawned: ${data.agent.name}` }
      }));
      checkAPIStatus(); // Refresh agent count
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        spawnAgent: { success: false, message: error.message }
      }));
    }
  };

  const testCreateJob = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'pathfinding', 
          description: 'Test pathfinding job',
          priority: 'medium'
        })
      });
      const data = await response.json();
      setTestResults(prev => ({
        ...prev,
        createJob: { success: true, message: `Job created: ${data.job.type}` }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        createJob: { success: false, message: error.message }
      }));
    }
  };

  const testGetAgents = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/agents');
      const data = await response.json();
      setTestResults(prev => ({
        ...prev,
        getAgents: { success: true, message: `Found ${data.agents.length} agents` }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        getAgents: { success: false, message: error.message }
      }));
    }
  };

  return (
    <div className="home-page">
      <h1>🪐 Coordinates - Multiplayer Planetary Shooter</h1>
      
      <div className="hero-section">
        <h2>Welcome to the Future of Gaming</h2>
        <p>Experience Crysis-level graphics, advanced AI systems, and real-time multiplayer gameplay across multiple planets.</p>
      </div>

      {/* System Status */}
      <div className="status-section" style={{ 
        margin: '20px 0', 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3>🔧 System Status</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ 
            padding: '10px', 
            backgroundColor: apiStatus === 'connected' ? '#d4edda' : '#f8d7da',
            borderRadius: '4px',
            minWidth: '150px'
          }}>
            <strong>API Status:</strong> 
            <span style={{ color: apiStatus === 'connected' ? '#155724' : '#721c24' }}>
              {apiStatus === 'connected' ? '✅ Connected' : apiStatus === 'checking' ? '⏳ Checking...' : '❌ Error'}
            </span>
          </div>
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#e2e3e5',
            borderRadius: '4px',
            minWidth: '150px'
          }}>
            <strong>Active Agents:</strong> {agentCount}
          </div>
        </div>
      </div>

      {/* AI Agent Tests */}
      <div className="ai-tests-section" style={{ 
        margin: '20px 0', 
        padding: '20px', 
        backgroundColor: '#fff3cd', 
        borderRadius: '8px',
        border: '1px solid #ffeaa7'
      }}>
        <h3>🤖 AI Agent Functionality Tests</h3>
        <p>Click the buttons below to test the AI agent system functionality:</p>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <button 
            onClick={testSpawnAgent}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Spawn Test Agent
          </button>
          <button 
            onClick={testCreateJob}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Create Test Job
          </button>
          <button 
            onClick={testGetAgents}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#17a2b8', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Get Agents List
          </button>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="test-results">
            <h4>Test Results:</h4>
            {Object.entries(testResults).map(([test, result]) => (
              <div key={test} style={{ 
                margin: '5px 0', 
                padding: '8px', 
                backgroundColor: result.success ? '#d4edda' : '#f8d7da',
                borderRadius: '4px',
                border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`
              }}>
                <strong>{test}:</strong> {result.message}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="features-section">
        <h3>🎮 Game Features</h3>
        <ul>
          <li><strong>Multiplayer Combat:</strong> Real-time shooting across 4 unique planets</li>
          <li><strong>Advanced Physics:</strong> Planet-specific gravity and soft body physics</li>
          <li><strong>AI Systems:</strong> Mathematical AI with neural networks and pattern recognition</li>
          <li><strong>Procedural Generation:</strong> Advanced tree generation with hybrid algorithms</li>
          <li><strong>Crysis-Level Graphics:</strong> PBR materials, dynamic lighting, and post-processing</li>
          <li><strong>Development Tools:</strong> Comprehensive debugging and testing suite</li>
        </ul>
      </div>

      <div className="quick-start">
        <h3>🚀 Quick Start</h3>
        <ol>
          <li>Click "Play" to start the game</li>
          <li>Use WASD to move and mouse to aim</li>
          <li>Press F1-F8 for development tools</li>
          <li>Visit "AI Dashboard" to manage AI agents</li>
          <li>Check "Tools" for debugging utilities</li>
        </ol>
      </div>
    </div>
  );
} 