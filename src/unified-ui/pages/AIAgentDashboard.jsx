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

  // LM Studio Integration
  const [lmStudioConnected, setLmStudioConnected] = useState(false);
  const [lmStudioModels, setLmStudioModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  // Agent Tools
  const [activeTools, setActiveTools] = useState([]);
  const [toolResults, setToolResults] = useState({});
  const [selectedTool, setSelectedTool] = useState('');

  const [objectives, setObjectives] = useState(null);
  const [focusObjective, setFocusObjective] = useState('');
  const [taskThreshold, setTaskThreshold] = useState(0.3);
  const [memoryThreshold, setMemoryThreshold] = useState(0.2);

  // Available AI Tools
  const availableTools = [
    { id: 'game-master', name: 'Game Master', description: 'Create dynamic game scenarios and challenges' },
    { id: 'npc-generator', name: 'NPC Generator', description: 'Generate interesting non-player characters' },
    { id: 'quest-designer', name: 'Quest Designer', description: 'Design engaging quests and missions' },
    { id: 'story-generator', name: 'Story Generator', description: 'Create compelling storylines and narratives' },
    { id: 'event-planner', name: 'Event Planner', description: 'Plan special events and encounters' },
    { id: 'balance-advisor', name: 'Balance Advisor', description: 'Analyze and balance game mechanics' },
    { id: 'code-assistant', name: 'Code Assistant', description: 'Help with programming and debugging' },
    { id: 'project-manager', name: 'Project Manager', description: 'Manage project tasks and priorities' }
  ];

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

  // Connect to LM Studio
  useEffect(() => {
    const connectToLMStudio = async () => {
      try {
        // Test LM Studio connection
        const response = await fetch('http://localhost:1234/v1/models');
        if (response.ok) {
          const data = await response.json();
          setLmStudioModels(data.data || []);
          setLmStudioConnected(true);
          
          // Set default model
          const chatModel = data.data?.find(m => !m.id.includes('embedding')) || data.data?.[0];
          if (chatModel) {
            setSelectedModel(chatModel.id);
          }
        }
      } catch (error) {
        console.error('Failed to connect to LM Studio:', error);
        setLmStudioConnected(false);
      }
    };

    connectToLMStudio();
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

  // LM Studio AI Interaction
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim() || !selectedModel) {
      alert('Please enter a prompt and select a model');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:1234/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'user', content: aiPrompt }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponseText = data.choices[0].message.content;
        setAiResponse(aiResponseText);
        
        // Add to conversation history
        setConversationHistory(prev => [...prev, {
          role: 'user',
          content: aiPrompt,
          timestamp: new Date()
        }, {
          role: 'assistant',
          content: aiResponseText,
          timestamp: new Date()
        }]);
        
        setAiPrompt(''); // Clear prompt
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      alert('Failed to generate AI response: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Tool Management
  const handleActivateTool = async (toolId) => {
    if (!activeTools.includes(toolId)) {
      setActiveTools(prev => [...prev, toolId]);
      setSelectedTool(toolId);
    }
  };

  const handleDeactivateTool = (toolId) => {
    setActiveTools(prev => prev.filter(id => id !== toolId));
    setToolResults(prev => {
      const newResults = { ...prev };
      delete newResults[toolId];
      return newResults;
    });
  };

  const handleExecuteTool = async (toolId) => {
    if (!aiPrompt.trim()) {
      alert('Please enter a prompt for the tool');
      return;
    }

    setIsGenerating(true);
    try {
      // Get tool-specific system prompt
      const toolPrompts = {
        'game-master': 'You are an AI Game Master for a multiplayer planetary shooter game. Create engaging scenarios, challenges, and story elements.',
        'npc-generator': 'You are an AI that generates interesting NPCs for a space shooter game. Create unique characters with personalities and backstories.',
        'quest-designer': 'You are an AI Quest Designer. Create engaging quests and missions with clear objectives and rewards.',
        'story-generator': 'You are an AI Story Generator. Create compelling storylines and narratives for a space shooter game.',
        'event-planner': 'You are an AI Event Planner. Design special events and encounters that enhance gameplay.',
        'balance-advisor': 'You are an AI Balance Advisor. Analyze game mechanics and suggest improvements for balance.',
        'code-assistant': 'You are an AI Code Assistant. Help with programming, debugging, and code optimization.',
        'project-manager': 'You are an AI Project Manager. Help manage tasks, priorities, and project planning.'
      };

      const systemPrompt = toolPrompts[toolId] || 'You are a helpful AI assistant.';

      const response = await fetch('http://localhost:1234/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: aiPrompt }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        const toolResult = data.choices[0].message.content;
        setToolResults(prev => ({
          ...prev,
          [toolId]: toolResult
        }));
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to execute tool:', error);
      alert('Failed to execute tool: ' + error.message);
    } finally {
      setIsGenerating(false);
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
    } catch (error) {
      alert('Failed to update thresholds: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'idle': return 'yellow';
      case 'busy': return 'orange';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getLLMStatusColor = (enabled) => {
    return enabled ? 'green' : 'red';
  };

  function LLMProviderHelp() {
    return (
      <div className="help-text">
        <p>Select an LLM provider to use for agent thinking and AI interactions.</p>
        <p>Available providers: OpenAI, Anthropic, HuggingFace, LM Studio</p>
      </div>
    );
  }

  return (
    <div className="ai-agent-dashboard">
      <div className="dashboard-header">
        <h1>🤖 AI Agent Dashboard</h1>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
          <span className={`status-indicator ${lmStudioConnected ? 'connected' : 'disconnected'}`}>
            {lmStudioConnected ? '🟢 LM Studio' : '🔴 LM Studio'}
          </span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* LM Studio Integration Panel */}
        <div className="dashboard-panel lm-studio-panel">
          <h2>🧠 LM Studio Integration</h2>
          <div className="lm-studio-status">
            <p><strong>Status:</strong> {lmStudioConnected ? 'Connected' : 'Disconnected'}</p>
            <p><strong>Models Available:</strong> {lmStudioModels.length}</p>
            {lmStudioModels.length > 0 && (
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                className="model-selector"
              >
                {lmStudioModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.id}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="ai-interaction">
            <h3>💬 AI Chat</h3>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              className="ai-prompt-input"
              rows={3}
            />
            <button 
              onClick={handleAIGenerate}
              disabled={isGenerating || !lmStudioConnected}
              className="ai-generate-btn"
            >
              {isGenerating ? 'Generating...' : 'Generate Response'}
            </button>
            {aiResponse && (
              <div className="ai-response">
                <h4>Response:</h4>
                <div className="response-content">{aiResponse}</div>
              </div>
            )}
          </div>
        </div>

        {/* AI Tools Panel */}
        <div className="dashboard-panel tools-panel">
          <h2>🛠️ AI Tools</h2>
          <div className="tools-grid">
            {availableTools.map(tool => (
              <div key={tool.id} className={`tool-card ${activeTools.includes(tool.id) ? 'active' : ''}`}>
                <h4>{tool.name}</h4>
                <p>{tool.description}</p>
                <div className="tool-actions">
                  {!activeTools.includes(tool.id) ? (
                    <button 
                      onClick={() => handleActivateTool(tool.id)}
                      className="activate-tool-btn"
                    >
                      Activate
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleDeactivateTool(tool.id)}
                      className="deactivate-tool-btn"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedTool && (
            <div className="tool-execution">
              <h3>Execute: {availableTools.find(t => t.id === selectedTool)?.name}</h3>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={`Enter prompt for ${availableTools.find(t => t.id === selectedTool)?.name}...`}
                className="tool-prompt-input"
                rows={3}
              />
              <button 
                onClick={() => handleExecuteTool(selectedTool)}
                disabled={isGenerating || !lmStudioConnected}
                className="execute-tool-btn"
              >
                {isGenerating ? 'Executing...' : 'Execute Tool'}
              </button>
              {toolResults[selectedTool] && (
                <div className="tool-result">
                  <h4>Result:</h4>
                  <div className="result-content">{toolResults[selectedTool]}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Agent Management Panel */}
        <div className="dashboard-panel agents-panel">
          <h2>🤖 Agent Management</h2>
          
          <div className="agent-controls">
            <div className="control-group">
              <label>Agent Role:</label>
              <select value={selectedAgentRole} onChange={(e) => setSelectedAgentRole(e.target.value)}>
                <option value="navigator">Navigator</option>
                <option value="strategist">Strategist</option>
                <option value="analyst">Analyst</option>
                <option value="coordinator">Coordinator</option>
              </select>
              <button onClick={handleSpawnAgent} className="spawn-btn">Spawn Agent</button>
            </div>
          </div>

          <div className="agents-list">
            <h3>Active Agents ({agents.length})</h3>
            {agents.map(agent => (
              <div key={agent.id} className="agent-item">
                <div className="agent-info">
                  <span className="agent-name">{agent.role}</span>
                  <span className={`agent-status ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </span>
                </div>
                <div className="agent-actions">
                  <button onClick={() => handleRestartAgent(agent.id)} className="restart-btn">
                    Restart
                  </button>
                  <button onClick={() => handleDismissAgent(agent.id)} className="dismiss-btn">
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Management Panel */}
        <div className="dashboard-panel jobs-panel">
          <h2>📋 Job Management</h2>
          
          <div className="job-controls">
            <div className="control-group">
              <label>Job Type:</label>
              <select value={selectedJobType} onChange={(e) => setSelectedJobType(e.target.value)}>
                <option value="pathfinding">Pathfinding</option>
                <option value="optimization">Optimization</option>
                <option value="analysis">Analysis</option>
                <option value="planning">Planning</option>
              </select>
            </div>
            <div className="control-group">
              <label>Description:</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Enter job description..."
                rows={2}
              />
              <button onClick={handleCreateJob} className="create-job-btn">Create Job</button>
            </div>
          </div>

          <div className="jobs-list">
            <h3>Active Jobs ({jobs.length})</h3>
            {jobs.map(job => (
              <div key={job.id} className="job-item">
                <div className="job-info">
                  <span className="job-type">{job.type}</span>
                  <span className="job-description">{job.description}</span>
                  <span className={`job-priority ${getPriorityColor(job.priority)}`}>
                    {job.priority}
                  </span>
                </div>
                <div className="job-actions">
                  <button onClick={() => handlePrioritizeJob(job.id)} className="prioritize-btn">
                    Prioritize
                  </button>
                  <button onClick={() => handleCancelJob(job.id)} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Thinking Panel */}
        <div className="dashboard-panel thinking-panel">
          <h2>🧠 Agent Thinking</h2>
          
          <div className="thinking-controls">
            <div className="control-group">
              <label>Select Agent:</label>
              <select 
                value={selectedAgentForThinking} 
                onChange={(e) => setSelectedAgentForThinking(e.target.value)}
              >
                <option value="">Choose an agent...</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.role}</option>
                ))}
              </select>
            </div>
            <div className="control-group">
              <label>Context:</label>
              <textarea
                value={thinkingContext}
                onChange={(e) => setThinkingContext(e.target.value)}
                placeholder="Enter context for agent thinking..."
                rows={2}
              />
              <button onClick={handleGenerateAgentThinking} className="generate-thinking-btn">
                Generate Thinking
              </button>
            </div>
          </div>

          {generatedThinking && (
            <div className="thinking-result">
              <h3>Generated Thinking:</h3>
              <div className="thinking-content">{generatedThinking}</div>
            </div>
          )}
        </div>

        {/* LLM Provider Panel */}
        <div className="dashboard-panel llm-panel">
          <h2>🔗 LLM Provider</h2>
          
          <div className="llm-status">
            {Object.entries(llmStatus).map(([provider, status]) => (
              <div key={provider} className="provider-status">
                <span className="provider-name">{provider}</span>
                <span className={`status-indicator ${getLLMStatusColor(status.enabled)}`}>
                  {status.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>

          <div className="llm-controls">
            <div className="control-group">
              <label>Switch Provider:</label>
              <select 
                value={selectedLlmProvider} 
                onChange={(e) => setSelectedLlmProvider(e.target.value)}
              >
                <option value="">Choose provider...</option>
                {Object.keys(llmStatus).map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
              </select>
              <button onClick={handleSwitchLLMProvider} className="switch-provider-btn">
                Switch Provider
              </button>
            </div>
          </div>

          <LLMProviderHelp />
        </div>

        {/* Objectives Panel */}
        <div className="dashboard-panel objectives-panel">
          <h2>🎯 Project Objectives</h2>
          
          <div className="objectives-controls">
            <div className="control-group">
              <label>Current Focus:</label>
              <input
                type="text"
                value={focusObjective}
                onChange={(e) => setFocusObjective(e.target.value)}
                placeholder="Enter current focus..."
              />
              <button onClick={updateFocus} className="update-focus-btn">Update Focus</button>
            </div>
            
            <div className="control-group">
              <label>Task Threshold: {taskThreshold}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={taskThreshold}
                onChange={(e) => setTaskThreshold(parseFloat(e.target.value))}
              />
            </div>
            
            <div className="control-group">
              <label>Memory Threshold: {memoryThreshold}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={memoryThreshold}
                onChange={(e) => setMemoryThreshold(parseFloat(e.target.value))}
              />
              <button onClick={updateThresholds} className="update-thresholds-btn">
                Update Thresholds
              </button>
            </div>
          </div>

          {objectives && (
            <div className="objectives-status">
              <h3>Current Status:</h3>
              <p><strong>Focus:</strong> {objectives.currentFocus}</p>
              <p><strong>Task Execution:</strong> {objectives.thresholds.taskExecution}</p>
              <p><strong>Memory Retrieval:</strong> {objectives.thresholds.memoryRetrieval}</p>
            </div>
          )}
        </div>

        {/* Statistics Panel */}
        <div className="dashboard-panel stats-panel">
          <h2>📊 Statistics</h2>
          
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Active Agents</span>
              <span className="stat-value">{stats.activeAgents || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active Jobs</span>
              <span className="stat-value">{stats.activeJobs || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completed Jobs</span>
              <span className="stat-value">{stats.completedJobs || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Thinking</span>
              <span className="stat-value">{stats.totalThinking || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 