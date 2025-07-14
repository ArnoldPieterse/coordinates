import React, { useState, useEffect } from 'react';
import aiAgentService from '../services/aiAgentService';

export default function AIAgentDashboard() {
  const [agents, setAgents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to AI agent service
    const connectToService = async () => {
      const connected = await aiAgentService.connect();
      setIsConnected(connected);
      
      if (connected) {
        // Get initial data
        setAgents(aiAgentService.getAgents());
        setJobs(aiAgentService.getJobs());
        setStats(aiAgentService.getStats());
        
        // Listen for real-time updates
        aiAgentService.addListener((data) => {
          setAgents(data.agents);
          setJobs(data.jobs);
          setStats(aiAgentService.getStats());
        });
      }
    };

    connectToService();

    return () => {
      // Cleanup listener
      aiAgentService.removeListener(setAgents);
    };
  }, []);

  const handleSpawnAgent = async (role) => {
    await aiAgentService.spawnAgent(role);
  };

  const handleAssignJob = async (jobId, agentRole) => {
    await aiAgentService.assignJob(jobId, agentRole);
  };

  return (
    <div className="ai-dashboard-page">
      <h1>AI Agent Dashboard</h1>
      <div className="connection-status">
        Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
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

      <div className="dashboard-panels">
        <div className="agents-panel">
          <h2>Agents</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Current Job</th>
                <th>Jobs Completed</th>
                <th>Rating</th>
                <th>Memory</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(agent => (
                <tr key={agent.id}>
                  <td>{agent.name}</td>
                  <td className={`status-${agent.status.toLowerCase()}`}>{agent.status}</td>
                  <td>{agent.currentJob}</td>
                  <td>{agent.jobsCompleted}</td>
                  <td>⭐ {agent.rating.toFixed(1)}</td>
                  <td>{agent.memory.shortTerm}/{agent.memory.longTerm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="jobs-panel">
          <h2>Job Queue</h2>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td>{job.type}</td>
                  <td>{job.assignedTo}</td>
                  <td className={`status-${job.status.toLowerCase().replace(' ', '-')}`}>
                    {job.status}
                  </td>
                  <td className={`priority-${job.priority.toLowerCase()}`}>
                    {job.priority}
                  </td>
                  <td>{job.estimatedDuration}m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 