import React, { useState, useEffect } from 'react';

const AGENT_ROLES = [
  'Project Manager', 'Code Reviewer', 'Performance Optimizer', 'AI Systems Engineer',
  'Gameplay Designer', 'Graphics Artist', 'Testing Engineer', 'Documentation Writer',
  'Security Analyst', 'Deployment Engineer', 'Manager Agent', 'AWS Specialist',
  'Sales Team', 'Messenger', 'Creative Spawner'
];

function randomStatus() {
  return Math.random() > 0.8 ? 'Idle' : (Math.random() > 0.5 ? 'Working' : 'Ready');
}

function randomJob() {
  const jobs = [
    'Code Review', 'Performance Analysis', 'AI Model Training', 'Texture Generation',
    'Bug Fix', 'Feature Implementation', 'Documentation Update', 'Security Audit',
    'Deployment Check', 'Testing', 'Agent Management', 'Prompt Optimization',
    'AWS Deployment', 'Sales Analysis', 'Creative Generation'
  ];
  return jobs[Math.floor(Math.random() * jobs.length)];
}

export default function AIAgentDashboard() {
  const [agents, setAgents] = useState([]);
  const [jobQueue, setJobQueue] = useState([]);

  // Simulate async agent activity
  useEffect(() => {
    // Initialize agents
    setAgents(AGENT_ROLES.map((role, i) => ({
      id: i + 1,
      name: role,
      status: randomStatus(),
      jobsCompleted: Math.floor(Math.random() * 20),
      currentJob: randomJob(),
    })));
    // Simulate job queue
    setJobQueue(Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      type: randomJob(),
      assignedTo: AGENT_ROLES[Math.floor(Math.random() * AGENT_ROLES.length)],
      status: Math.random() > 0.5 ? 'In Progress' : 'Queued',
    })));
    // Simulate async updates
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: randomStatus(),
        currentJob: randomJob(),
        jobsCompleted: agent.jobsCompleted + (Math.random() > 0.8 ? 1 : 0),
      })));
      setJobQueue(prev => prev.map(job => ({
        ...job,
        status: Math.random() > 0.7 ? 'In Progress' : job.status,
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ai-dashboard-page">
      <h1>AI Agent Dashboard</h1>
      <div className="dashboard-panels">
        <div className="agents-panel">
          <h2>Agents</h2>
          <table>
            <thead>
              <tr><th>Name</th><th>Status</th><th>Current Job</th><th>Jobs Completed</th></tr>
            </thead>
            <tbody>
              {agents.map(agent => (
                <tr key={agent.id}>
                  <td>{agent.name}</td>
                  <td>{agent.status}</td>
                  <td>{agent.currentJob}</td>
                  <td>{agent.jobsCompleted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="jobs-panel">
          <h2>Job Queue</h2>
          <table>
            <thead>
              <tr><th>Type</th><th>Assigned To</th><th>Status</th></tr>
            </thead>
            <tbody>
              {jobQueue.map(job => (
                <tr key={job.id}>
                  <td>{job.type}</td>
                  <td>{job.assignedTo}</td>
                  <td>{job.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 