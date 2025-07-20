import React, { useState, useEffect } from 'react';
import aiAgentService from '../services/aiAgentService';

export default function AIAgentDashboard() {
  const [agents, setAgents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [selectedAgentRole, setSelectedAgentRole] = useState('navigator');
  const [selectedJobType, setSelectedJobType] = useState('pathfinding');
  const [jobDescription, setJobDescription] = useState('');
  
  // LLM-specific state
  const [llmStatus, setLlmStatus] = useState({});
  const [agentThinkingHistory, setAgentThinkingHistory] = useState({});
  const [selectedAgentForThinking, setSelectedAgentForThinking] = useState('');
  const [thinkingContext, setThinkingContext] = useState('');
  const [generatedThinking, setGeneratedThinking] = useState(null);
  const [selectedLlmProvider, setSelectedLlmProvider] = useState('');

  const [objectives, setObjectives] = useState(null);
  const [focusObjective, setFocusObjective] = useState('');
  const [taskThreshold, setTaskThreshold] = useState(0.3);
  const [memoryThreshold, setMemoryThreshold] = useState(0.2);

  useEffect(() => {
    // Connect to AI agent service
    const connectToService = async () => {
      const connected = await aiAgentService.connect();
      setIsConnected(connected);
      
      if (connected) {
        // Get initial data
        const [agentsData, jobsData, statsData, llmStatusData, thinkingHistoryData] = await Promise.all([
          aiAgentService.getAgents(),
          aiAgentService.getJobs(),
          aiAgentService.getStats(),
          aiAgentService.getLLMStatus(),
          aiAgentService.getAgentThinkingHistory()
        ]);
        
        setAgents(agentsData);
        setJobs(jobsData);
        setStats(statsData);
        setLlmStatus(llmStatusData);
        setAgentThinkingHistory(thinkingHistoryData);
        
        // Listen for real-time updates
        aiAgentService.addListener((data) => {
          setAgents(data.agents);
          setJobs(data.jobs);
          setStats(data.stats);
        });
      }
    };

    connectToService();

    return () => {
      // Cleanup listener
      aiAgentService.removeListener(setAgents);
    };
  }, []);

  // Refresh LLM data periodically
  useEffect(() => {
    const refreshLLMData = async () => {
      if (isConnected) {
        try {
          const [llmStatusData, thinkingHistoryData] = await Promise.all([
            aiAgentService.getLLMStatus(),
            aiAgentService.getAgentThinkingHistory()
          ]);
          setLlmStatus(llmStatusData);
          setAgentThinkingHistory(thinkingHistoryData);
        } catch (error) {
          console.error('Failed to refresh LLM data:', error);
        }
      }
    };

    const interval = setInterval(refreshLLMData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [isConnected]);

  const handleSpawnAgent = async () => {
    try {
      await aiAgentService.spawnAgent(selectedAgentRole);
      setSelectedAgentRole('navigator'); // Reset selection
    } catch (error) {
      console.error('Failed to spawn agent:', error);
    }
  };

  const handleCreateJob = async () => {
    if (!jobDescription.trim()) {
      alert('Please enter a job description');
      return;
    }
    
    try {
      await aiAgentService.createJob(selectedJobType, jobDescription);
      setJobDescription(''); // Reset description
      setSelectedJobType('pathfinding'); // Reset selection
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const handleDismissAgent = async (agentId) => {
    if (window.confirm('Are you sure you want to dismiss this agent?')) {
      try {
        await aiAgentService.dismissAgent(agentId);
      } catch (error) {
        console.error('Failed to dismiss agent:', error);
      }
    }
  };

  const handleCancelJob = async (jobId) => {
    if (window.confirm('Are you sure you want to cancel this job?')) {
      try {
        await aiAgentService.cancelJob(jobId);
      } catch (error) {
        console.error('Failed to cancel job:', error);
      }
    }
  };

  const handleGenerateAgentThinking = async () => {
    if (!selectedAgentForThinking) {
      alert('Please select an agent');
      return;
    }

    try {
      const context = thinkingContext ? { projectStatus: thinkingContext } : {};
      const thinking = await aiAgentService.generateAgentThinking(selectedAgentForThinking, context);
      setGeneratedThinking(thinking);
    } catch (error) {
      console.error('Failed to generate thinking:', error);
      alert('Failed to generate agent thinking');
    }
  };

  const handleSwitchLLMProvider = async () => {
    if (!selectedLlmProvider) {
      alert('Please select a provider');
      return;
    }

    try {
      const success = await aiAgentService.switchLLMProvider(selectedLlmProvider);
      if (success) {
        alert(`Successfully switched to ${selectedLlmProvider}`);
        // Refresh LLM status
        const newLlmStatus = await aiAgentService.getLLMStatus();
        setLlmStatus(newLlmStatus);
      } else {
        alert('Failed to switch provider');
      }
    } catch (error) {
      console.error('Failed to switch LLM provider:', error);
      alert('Failed to switch LLM provider');
    }
  };

  const handlePrioritizeJob = async (jobId) => {
    try {
      await fetch(`http://localhost:3001/api/jobs/${jobId}/priority`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: 'high' })
      });
      alert('Job prioritized!');
    } catch (error) {
      alert('Failed to prioritize job: ' + error.message);
    }
  };

  const handleRestartAgent = async (agentId) => {
    try {
      await fetch(`http://localhost:3001/api/agents/${agentId}/restart`, { method: 'POST' });
      alert('Agent restarted!');
    } catch (error) {
      alert('Failed to restart agent: ' + error.message);
    }
  };

  const fetchObjectives = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/objectives/status');
      const data = await response.json();
      setObjectives(data);
      setFocusObjective(data.currentFocus);
      setTaskThreshold(data.thresholds.taskExecution);
      setMemoryThreshold(data.thresholds.memoryRetrieval);
    } catch (error) {
      console.error('Failed to fetch objectives:', error);
    }
  };

  const updateFocus = async () => {
    try {
      await fetch('http://localhost:3001/api/objectives/focus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focus: focusObjective })
      });
      alert('Focus updated!');
      fetchObjectives();
    } catch (error) {
      alert('Failed to update focus: ' + error.message);
    }
  };

  const updateThresholds = async () => {
    try {
      await fetch('http://localhost:3001/api/objectives/thresholds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          taskExecution: taskThreshold, 
          memoryRetrieval: memoryThreshold 
        })
      });
      alert('Thresholds updated!');
      fetchObjectives();
    } catch (error) {
      alert('Failed to update thresholds: ' + error.message);
    }
  };

  useEffect(() => {
    fetchObjectives();
    const interval = setInterval(fetchObjectives, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'idle': return 'status-idle';
      case 'working': return 'status-working';
      case 'queued': return 'status-queued';
      case 'in_progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-unknown';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getLLMStatusColor = (enabled) => {
    return enabled ? 'status-enabled' : 'status-disabled';
  };

  function LLMProviderHelp() {
    return (
      <div className="llm-help">
        <h3>LLM Provider Setup</h3>
        <ul>
          <li><b>LM Studio:</b> <a href="https://lmstudio.ai/" target="_blank" rel="noopener noreferrer">Download</a> & run <code>lms server start</code></li>
          <li><b>Ollama:</b> <a href="https://ollama.com/" target="_blank" rel="noopener noreferrer">Download</a> & run <code>ollama serve</code></li>
          <li><b>OpenAI/Anthropic/HuggingFace:</b> Set API keys as environment variables before starting the server.</li>
        </ul>
        <p>The dashboard will auto-detect and connect to any available LLM provider.</p>
      </div>
    );
  }

  return (
    <div className="ai-dashboard-page">
      <div className="dashboard-header">
        <h1>AI Agent Dashboard</h1>
        <div className="connection-status">
          Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>
      
      {/* LLM Status Panel */}
      <div className="llm-status-panel">
        <h2>🤖 LLM Integration Status</h2>
        <div className="llm-status-grid">
          <div className="llm-status-item">
            <span className="llm-status-label">LLM Enabled:</span>
            <span className={`llm-status-value ${getLLMStatusColor(llmStatus.enabled)}`}>
              {llmStatus.enabled ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div className="llm-status-item">
            <span className="llm-status-label">Active Provider:</span>
            <span className="llm-status-value">{llmStatus.activeProvider || 'None'}</span>
          </div>
          <div className="llm-status-item">
            <span className="llm-status-label">Available Providers:</span>
            <span className="llm-status-value">
              {llmStatus.availableProviders ? llmStatus.availableProviders.join(', ') : 'None'}
            </span>
          </div>
          {llmStatus.message && (
            <div className="llm-status-item">
              <span className="llm-status-label">Message:</span>
              <span className="llm-status-value">{llmStatus.message}</span>
            </div>
          )}
        </div>
        
        {/* LLM Provider Controls */}
        <div className="llm-controls">
          <h3>Switch LLM Provider</h3>
          <div className="control-group">
            <select 
              value={selectedLlmProvider} 
              onChange={(e) => setSelectedLlmProvider(e.target.value)}
            >
              <option value="">Select Provider</option>
              <option value="lm_studio">LM Studio (Local)</option>
              <option value="ollama">Ollama (Local)</option>
              <option value="openai_free">OpenAI Free</option>
              <option value="anthropic_free">Anthropic Free</option>
              <option value="huggingface_free">HuggingFace Free</option>
            </select>
            <button onClick={handleSwitchLLMProvider} className="btn-primary">
              Switch Provider
            </button>
          </div>
        </div>
      </div>
      
      <div className="stats-panel">
        <h2>System Statistics</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total Agents:</span>
            <span className="stat-value">{stats.totalAgents || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Active Agents:</span>
            <span className="stat-value">{stats.activeAgents || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Jobs:</span>
            <span className="stat-value">{stats.totalJobs || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Queued Jobs:</span>
            <span className="stat-value">{stats.queuedJobs || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">In Progress:</span>
            <span className="stat-value">{stats.inProgressJobs || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completed:</span>
            <span className="stat-value">{stats.completedJobs || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Avg Rating:</span>
            <span className="stat-value">{(stats.averageRating || 0).toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Agent Thinking Panel */}
      <div className="agent-thinking-panel">
        <h2>🧠 Agent LLM Thinking</h2>
        <div className="thinking-controls">
          <div className="control-group">
            <select 
              value={selectedAgentForThinking} 
              onChange={(e) => setSelectedAgentForThinking(e.target.value)}
            >
              <option value="">Select Agent</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.role})
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Context (optional)..."
              value={thinkingContext}
              onChange={(e) => setThinkingContext(e.target.value)}
              className="thinking-context-input"
            />
            <button onClick={handleGenerateAgentThinking} className="btn-primary">
              Generate Thinking
            </button>
          </div>
        </div>
        
        {generatedThinking && (
          <div className="generated-thinking">
            <h3>Generated Thinking for {selectedAgentForThinking}</h3>
            <div className="thinking-content">
              <div className="thinking-section">
                <h4>Thoughts:</h4>
                <p>{generatedThinking.thoughts}</p>
              </div>
              <div className="thinking-section">
                <h4>Confidence: {(generatedThinking.confidence * 100).toFixed(1)}%</h4>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill" 
                    style={{ width: `${generatedThinking.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
              {generatedThinking.nextActions && generatedThinking.nextActions.length > 0 && (
                <div className="thinking-section">
                  <h4>Recommended Actions:</h4>
                  <ul>
                    {generatedThinking.nextActions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
              {generatedThinking.reasoning && generatedThinking.reasoning.length > 0 && (
                <div className="thinking-section">
                  <h4>Reasoning:</h4>
                  <ul>
                    {generatedThinking.reasoning.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h3>🎯 Objectives Management</h3>
        {objectives && (
          <div className="objectives-panel">
            <div className="objective-controls">
              <div className="control-group">
                <label>Current Focus:</label>
                <select value={focusObjective} onChange={(e) => setFocusObjective(e.target.value)}>
                  {objectives.objectives.map(obj => (
                    <option key={obj.id} value={obj.id}>{obj.name}</option>
                  ))}
                </select>
                <button onClick={updateFocus}>Update Focus</button>
              </div>
              <div className="control-group">
                <label>Task Execution Threshold:</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={taskThreshold} 
                  onChange={(e) => setTaskThreshold(parseFloat(e.target.value))}
                />
                <span>{taskThreshold}</span>
              </div>
              <div className="control-group">
                <label>Memory Retrieval Threshold:</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={memoryThreshold} 
                  onChange={(e) => setMemoryThreshold(parseFloat(e.target.value))}
                />
                <span>{memoryThreshold}</span>
              </div>
              <button onClick={updateThresholds}>Update Thresholds</button>
            </div>
            <div className="objectives-list">
              {objectives.objectives.map(obj => (
                <div key={obj.id} className={`objective-item ${obj.id === objectives.currentFocus ? 'focused' : ''}`}>
                  <h4>{obj.name}</h4>
                  <p>Priority: {obj.priority} | Weight: {(obj.weight * 100).toFixed(0)}%</p>
                  <p>Criteria: {obj.criteria.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="control-panels">
        <div className="agent-controls">
          <h3>Spawn New Agent</h3>
          <div className="control-group">
            <select 
              value={selectedAgentRole} 
              onChange={(e) => setSelectedAgentRole(e.target.value)}
            >
              <option value="navigator">Navigator</option>
              <option value="strategist">Strategist</option>
              <option value="engineer">Engineer</option>
              <option value="scout">Scout</option>
              <option value="coordinator">Coordinator</option>
            </select>
            <button onClick={handleSpawnAgent} className="btn-primary">
              Spawn Agent
            </button>
          </div>
        </div>

        <div className="job-controls">
          <h3>Create New Job</h3>
          <div className="control-group">
            <select 
              value={selectedJobType} 
              onChange={(e) => setSelectedJobType(e.target.value)}
            >
              <option value="pathfinding">Pathfinding</option>
              <option value="tactical_analysis">Tactical Analysis</option>
              <option value="system_repair">System Repair</option>
              <option value="exploration">Exploration</option>
              <option value="team_coordination">Team Coordination</option>
            </select>
            <input
              type="text"
              placeholder="Job description..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="job-description-input"
            />
            <button onClick={handleCreateJob} className="btn-primary">
              Create Job
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Agents Panel with LLM Info */}
      <div className="agents-panel">
        <h2>AI Agents</h2>
        <div className="agents-grid">
          {agents.map(agent => (
            <div key={agent.id} className="agent-card">
              <div className="agent-header">
                <h3>{agent.name}</h3>
                <span className={`agent-status ${getStatusColor(agent.status)}`}>
                  {agent.status}
                </span>
              </div>
              <div className="agent-details">
                <p><strong>Role:</strong> {agent.role}</p>
                <p><strong>Rating:</strong> {agent.rating?.toFixed(1) || 'N/A'}</p>
                <p><strong>Jobs Completed:</strong> {agent.jobsCompleted || 0}</p>
                
                {/* LLM Enhancement Info */}
                {agent.llmStatus && (
                  <div className="agent-llm-info">
                    <p><strong>LLM Enhanced:</strong> {agent.llmStatus.enhanced ? '✅ Yes' : '❌ No'}</p>
                    {agent.llmStatus.enhanced && (
                      <>
                        <p><strong>LLM Provider:</strong> {agent.llmStatus.provider || 'Unknown'}</p>
                        <p><strong>LLM Confidence:</strong> {(agent.llmStatus.confidence * 100).toFixed(1)}%</p>
                        <p><strong>Thinking History:</strong> {agent.llmStatus.thinkingHistoryCount || 0} entries</p>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="agent-actions">
                <button 
                  onClick={() => handleDismissAgent(agent.id)}
                  className="btn-danger"
                >
                  Dismiss
                </button>
                <button onClick={() => handleRestartAgent(agent.id)} className="btn-restart">Restart</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Jobs Panel */}
      <div className="jobs-panel">
        <h2>Job Queue</h2>
        <div className="jobs-list">
          {jobs.map(job => (
            <div key={job.id} className="job-item">
              <div className="job-header">
                <h4>{job.type}</h4>
                <span className={`status ${job.status}`}>{job.status}</span>
              </div>
              <p>{job.description}</p>
              {job.relativity && (
                <div className="relativity-info">
                  <div className="relativity-rating">
                    <span className={`priority ${job.relativity.priority}`}>
                      Relativity: {job.relativity.rating.toFixed(2)} ({job.relativity.priority})
                    </span>
                  </div>
                  {job.relativity.breakdown && (
                    <details>
                      <summary>Objective Breakdown</summary>
                      <div className="breakdown-list">
                        {job.relativity.breakdown.map((item, index) => (
                          <div key={index} className="breakdown-item">
                            <span>{item.objective}: {item.score.toFixed(2)}</span>
                            <span>Weight: {(item.weight * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
              {job.skipReason && (
                <div className="skip-reason">
                  <span>⏭️ Skipped: {job.skipReason}</span>
                </div>
              )}
              <div className="job-actions">
                <button onClick={() => handleCancelJob(job.id)} className="btn-cancel">
                  Cancel
                </button>
                <button onClick={() => handlePrioritizeJob(job.id)} className="btn-prioritize">
                  Prioritize
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 