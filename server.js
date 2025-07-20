// IDX-DOC-00: For index reference format, see INDEX_DESCRIBER.md
// IDX-SERVER-01: Multiplayer Server Module
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { AIAgentManager } from './src/ai-agent-system.js';
import { exec } from 'child_process';
import path from 'path';
import { ProjectObjectives } from './src/relativity/project-objectives.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// CORS middleware for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Store connected players
const players = new Map();

// ====== LLM-ENABLED AGENT MANAGER SINGLETON ======
const agentManager = new AIAgentManager();

// Initialize all agents and LLMs at server startup
(async () => {
    agentManager.spawnAllAgents();
    await agentManager.initializeLLM();
})();

// AI Agent System (IDX-AI-API-001)
const aiAgents = new Map();
const aiJobs = new Map();
let agentCounter = 0;
let jobCounter = 0;

// Agent roles and capabilities
const agentRoles = {
  navigator: {
    name: 'Navigator',
    description: 'Handles pathfinding and spatial awareness',
    capabilities: ['pathfinding', 'spatial_analysis', 'route_optimization'],
    baseMemory: { shortTerm: 50, longTerm: 200 },
    baseRating: 4.2
  },
  strategist: {
    name: 'Strategist',
    description: 'Develops tactical plans and combat strategies',
    capabilities: ['tactical_planning', 'combat_analysis', 'resource_management'],
    baseMemory: { shortTerm: 75, longTerm: 300 },
    baseRating: 4.5
  },
  engineer: {
    name: 'Engineer',
    description: 'Manages systems, repairs, and technical operations',
    capabilities: ['system_repair', 'technical_analysis', 'equipment_optimization'],
    baseMemory: { shortTerm: 60, longTerm: 250 },
    baseRating: 4.3
  },
  scout: {
    name: 'Scout',
    description: 'Explores and gathers intelligence',
    capabilities: ['exploration', 'intelligence_gathering', 'threat_assessment'],
    baseMemory: { shortTerm: 40, longTerm: 150 },
    baseRating: 4.0
  },
  coordinator: {
    name: 'Coordinator',
    description: 'Manages team coordination and communication',
    capabilities: ['team_coordination', 'communication', 'priority_management'],
    baseMemory: { shortTerm: 80, longTerm: 400 },
    baseRating: 4.4
  }
};

// Job types
const jobTypes = {
  pathfinding: {
    name: 'Pathfinding',
    description: 'Find optimal route to destination',
    requiredCapability: 'pathfinding',
    estimatedDuration: 2,
    priority: 'medium'
  },
  tactical_analysis: {
    name: 'Tactical Analysis',
    description: 'Analyze combat situation and recommend strategy',
    requiredCapability: 'tactical_planning',
    estimatedDuration: 5,
    priority: 'high'
  },
  system_repair: {
    name: 'System Repair',
    description: 'Repair damaged systems or equipment',
    requiredCapability: 'system_repair',
    estimatedDuration: 8,
    priority: 'high'
  },
  exploration: {
    name: 'Exploration',
    description: 'Explore new area and gather intelligence',
    requiredCapability: 'exploration',
    estimatedDuration: 10,
    priority: 'medium'
  },
  team_coordination: {
    name: 'Team Coordination',
    description: 'Coordinate team activities and resources',
    requiredCapability: 'team_coordination',
    estimatedDuration: 3,
    priority: 'high'
  }
};

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    players: players.size,
    agents: aiAgents.size,
    jobs: aiJobs.size
  });
});

// AI Agent API Endpoints (IDX-AI-API-002)
app.get('/api/agents', (req, res) => {
  const agents = Array.from(aiAgents.values());
  res.json({ agents });
});

app.post('/api/agents/spawn', (req, res) => {
  try {
    const { role } = req.body;
    
    if (!agentRoles[role]) {
      return res.status(400).json({ error: `Unknown agent role: ${role}` });
    }

    const roleConfig = agentRoles[role];
    const agentId = `agent_${++agentCounter}`;
    
    const agent = {
      id: agentId,
      name: `${roleConfig.name} ${agentCounter}`,
      role: role,
      status: 'idle',
      currentJobId: null,
      currentJobProgress: 0,
      jobsCompleted: 0,
      rating: roleConfig.baseRating + (Math.random() - 0.5) * 0.4,
      memory: {
        shortTerm: roleConfig.baseMemory.shortTerm,
        longTerm: roleConfig.baseMemory.longTerm
      },
      capabilities: [...roleConfig.capabilities],
      thinkingHistory: [],
      thoughtProcess: {
        currentThought: null,
        decisionHistory: [],
        reasoningPatterns: [],
        learningInsights: []
      },
      createdAt: new Date(),
      lastActivity: new Date()
    };

    aiAgents.set(agentId, agent);
    
    res.json({ 
      success: true, 
      agent,
      message: `Agent ${agent.name} spawned successfully`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/agents/:agentId', (req, res) => {
  try {
    const { agentId } = req.params;
    
    if (!aiAgents.has(agentId)) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const agent = aiAgents.get(agentId);
    aiAgents.delete(agentId);
    
    res.json({ 
      success: true, 
      message: `Agent ${agent.name} dismissed successfully`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/agents/:agentId/upgrade', (req, res) => {
  try {
    const { agentId } = req.params;
    const { capability } = req.body;
    
    if (!aiAgents.has(agentId)) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const agent = aiAgents.get(agentId);
    if (!agent.capabilities.includes(capability)) {
      agent.capabilities.push(capability);
      agent.rating = Math.min(5.0, agent.rating + 0.2);
      
      // Add thinking record for upgrade
      addAgentThought(agent, {
        type: 'upgrade',
        thought: `Acquired new capability: ${capability}`,
        reasoning: `Enhanced capabilities will improve job performance and rating`,
        confidence: 0.9,
        timestamp: new Date()
      });
    }
    
    res.json({ 
      success: true, 
      agent,
      message: `Agent ${agent.name} upgraded with ${capability}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agent Thinking History API Endpoints (IDX-AI-THINKING-001)
app.get('/api/agents/:agentId/thinking', (req, res) => {
  try {
    const { agentId } = req.params;
    const { limit = 50, type, startDate, endDate } = req.query;
    
    if (!aiAgents.has(agentId)) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const agent = aiAgents.get(agentId);
    let thoughts = [...agent.thinkingHistory];
    
    // Filter by type if specified
    if (type) {
      thoughts = thoughts.filter(thought => thought.type === type);
    }
    
    // Filter by date range if specified
    if (startDate || endDate) {
      thoughts = thoughts.filter(thought => {
        const thoughtDate = new Date(thought.timestamp);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        return thoughtDate >= start && thoughtDate <= end;
      });
    }
    
    // Apply limit
    thoughts = thoughts.slice(-parseInt(limit));
    
    res.json({
      success: true,
      agentId,
      agentName: agent.name,
      totalThoughts: agent.thinkingHistory.length,
      thoughts,
      thoughtProcess: agent.thoughtProcess
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/agents/:agentId/thinking/analysis', (req, res) => {
  try {
    const { agentId } = req.params;
    
    if (!aiAgents.has(agentId)) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const agent = aiAgents.get(agentId);
    const thoughts = agent.thinkingHistory;
    
    // Analyze thinking patterns
    const analysis = analyzeAgentThinking(agent);
    
    res.json({
      success: true,
      agentId,
      agentName: agent.name,
      analysis
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/agents/thinking/global', (req, res) => {
  try {
    const { role, limit = 100, type } = req.query;
    
    let allThoughts = [];
    
    // Collect thoughts from all agents or filtered by role
    for (const [agentId, agent] of aiAgents) {
      if (!role || agent.role === role) {
        allThoughts.push(...agent.thinkingHistory.map(thought => ({
          ...thought,
          agentId,
          agentName: agent.name,
          agentRole: agent.role
        })));
      }
    }
    
    // Filter by type if specified
    if (type) {
      allThoughts = allThoughts.filter(thought => thought.type === type);
    }
    
    // Sort by timestamp and apply limit
    allThoughts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    allThoughts = allThoughts.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      totalThoughts: allThoughts.length,
      thoughts: allThoughts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/agents/:agentId/thinking/simulate', (req, res) => {
  try {
    const { agentId } = req.params;
    const { scenario, jobType, context } = req.body;
    
    if (!aiAgents.has(agentId)) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const agent = aiAgents.get(agentId);
    const simulatedThoughts = simulateAgentThinking(agent, scenario, jobType, context);
    
    res.json({
      success: true,
      agentId,
      agentName: agent.name,
      scenario,
      simulatedThoughts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Job API Endpoints (IDX-JOB-API-001)
app.get('/api/jobs', (req, res) => {
  const jobs = Array.from(aiJobs.values());
  res.json({ jobs });
});

app.post('/api/jobs/create', (req, res) => {
  try {
    const { type, description, priority = 'medium' } = req.body;
    
    if (!jobTypes[type]) {
      return res.status(400).json({ error: `Unknown job type: ${type}` });
    }

    const jobType = jobTypes[type];
    const jobId = `job_${++jobCounter}`;
    
    const job = {
      id: jobId,
      name: jobType.name,
      type: type,
      description: description,
      status: 'queued',
      priority: priority,
      assignedAgentId: null,
      assignedTo: null,
      progress: 0,
      createdAt: new Date(),
      estimatedDuration: jobType.estimatedDuration,
      requiredCapability: jobType.requiredCapability
    };

    aiJobs.set(jobId, job);
    
    // Try to assign job to available agent
    assignJobToAgent(jobId);
    
    res.json({ 
      success: true, 
      job,
      message: `Job ${jobType.name} created successfully`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/jobs/:jobId', (req, res) => {
  try {
    const { jobId } = req.params;
    
    if (!aiJobs.has(jobId)) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = aiJobs.get(jobId);
    aiJobs.delete(jobId);
    
    // If job was assigned, free the agent
    if (job.assignedAgentId) {
      const agent = aiAgents.get(job.assignedAgentId);
      if (agent) {
        agent.status = 'idle';
        agent.currentJobId = null;
        agent.currentJobProgress = 0;
      }
    }
    
    res.json({ 
      success: true, 
      message: `Job cancelled successfully`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/jobs/:jobId/priority', (req, res) => {
  try {
    const { jobId } = req.params;
    const { priority } = req.body;
    
    if (!aiJobs.has(jobId)) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = aiJobs.get(jobId);
    job.priority = priority;
    
    res.json({ 
      success: true, 
      job,
      message: `Job priority updated to ${priority}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Prioritize a job
app.put('/api/jobs/:jobId/priority', (req, res) => {
  const { jobId } = req.params;
  const { priority } = req.body;
  const job = agentManager.jobQueue.find(j => j.id === jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  job.priority = priority || 'high';
  // Re-sort the queue
  agentManager.jobQueue.sort((a, b) => {
    const priorityOrder = { high: 3, normal: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
  res.json({ success: true, job });
});
// Restart an agent
app.post('/api/agents/:agentId/restart', (req, res) => {
  const { agentId } = req.params;
  agentManager.restartAgent(agentId);
  res.json({ success: true });
});

// Game API Endpoints (IDX-GAME-API-001)
app.get('/api/game/status', (req, res) => {
  const stats = {
    totalAgents: aiAgents.size,
    activeAgents: Array.from(aiAgents.values()).filter(a => a.status === 'working').length,
    totalJobs: aiJobs.size,
    queuedJobs: Array.from(aiJobs.values()).filter(j => j.status === 'queued').length,
    inProgressJobs: Array.from(aiJobs.values()).filter(j => j.status === 'in_progress').length,
    completedJobs: Array.from(aiJobs.values()).filter(j => j.status === 'completed').length,
    averageRating: aiAgents.size > 0 ? 
      Array.from(aiAgents.values()).reduce((sum, a) => sum + a.rating, 0) / aiAgents.size : 0
  };
  
  res.json({ stats });
});

app.post('/api/game/start', (req, res) => {
  try {
    const { playerId } = req.body;
    
    if (!players.has(playerId)) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const player = players.get(playerId);
    player.gameState = 'playing';
    player.lastActivity = new Date();
    
    res.json({ 
      success: true, 
      message: 'Game started successfully',
      player
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/game/pause', (req, res) => {
  try {
    const { playerId } = req.body;
    
    if (!players.has(playerId)) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const player = players.get(playerId);
    player.gameState = 'paused';
    player.lastActivity = new Date();
    
    res.json({ 
      success: true, 
      message: 'Game paused successfully',
      player
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Player API Endpoints (IDX-PLAYER-API-001)
app.get('/api/players', (req, res) => {
  const playerList = Array.from(players.values());
  res.json({ players: playerList });
});

app.post('/api/players/join', (req, res) => {
  try {
    const { playerName } = req.body;
    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newPlayer = {
      id: playerId,
      name: playerName || `Player ${playerId.slice(-6)}`,
      position: { x: 0, y: 1, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      planet: 'earth',
      health: 100,
      energy: 100,
      score: 0,
      level: 1,
      isDead: false,
      kills: 0,
      deaths: 0,
      gameState: 'menu',
      createdAt: new Date(),
      lastActivity: new Date()
    };
    
    players.set(playerId, newPlayer);
    
    res.json({ 
      success: true, 
      player: newPlayer,
      message: 'Player joined successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/players/:playerId/position', (req, res) => {
  try {
    const { playerId } = req.params;
    const { position, rotation, planet } = req.body;
    
    if (!players.has(playerId)) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const player = players.get(playerId);
    player.position = position;
    player.rotation = rotation;
    player.planet = planet;
    player.lastActivity = new Date();
    
    res.json({ 
      success: true, 
      player,
      message: 'Player position updated'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/players/:playerId/shoot', (req, res) => {
  try {
    const { playerId } = req.params;
    const { targetId, damage, weaponType } = req.body;
    
    if (!players.has(playerId)) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const attacker = players.get(playerId);
    const target = players.get(targetId);
    
    if (!target) {
      return res.status(404).json({ error: 'Target not found' });
    }

    // Apply damage
    target.health = Math.max(0, target.health - damage);
    
    if (target.health <= 0 && !target.isDead) {
      target.isDead = true;
      target.deaths++;
      attacker.kills++;
      attacker.score += 100;
    }
    
    res.json({ 
      success: true, 
      target,
      attacker,
      message: `Shot fired: ${damage} damage dealt`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// System API Endpoints (IDX-SYSTEM-API-001)
app.get('/api/system/info', (req, res) => {
  const systemInfo = {
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    platform: process.platform,
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  };
  
  res.json({ systemInfo });
});

app.post('/api/system/restart', (req, res) => {
  try {
    // Simulate system restart
    setTimeout(() => {
      process.exit(0);
    }, 1000);
    
    res.json({ 
      success: true, 
      message: 'System restart initiated'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====== LLM API ENDPOINTS ======
// LLM status
app.get('/api/llm/status', (req, res) => {
    res.json(agentManager.getLLMStatus());
});

app.post('/api/llm/generate', async (req, res) => {
    try {
        const { provider, prompt, model } = req.body;
        if (!provider || !prompt) {
            return res.status(400).json({ error: 'Missing provider or prompt' });
        }
        const result = await agentManager.llmManager.generateResponse(provider, prompt, model);
        res.json({ success: true, provider, result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all agent LLM thinking history
app.get('/api/llm/agent-thinking', (req, res) => {
    res.json(agentManager.getAllAgentThinkingHistory());
});

// Generate LLM-powered thinking for a specific agent
app.post('/api/llm/agent-thinking/:agentId', async (req, res) => {
    try {
        const { agentId } = req.params;
        const context = req.body.context || {};
        const result = await agentManager.generateAgentThinking(agentId, context);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Switch LLM provider
app.post('/api/llm/switch-provider', async (req, res) => {
    try {
        const { provider } = req.body;
        const result = await agentManager.switchLLMProvider(provider);
        res.json({ success: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ====== MISSING API ENDPOINTS ======

// AI Agents endpoints
app.get('/api/ai/agents', (req, res) => {
    try {
        const agents = agentManager.getAllAgents();
        res.json({ agents });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/ai/status', (req, res) => {
    try {
        const status = {
            totalAgents: agentManager.getAgentCount(),
            activeAgents: agentManager.getActiveAgentCount(),
            llmStatus: agentManager.getLLMStatus(),
            systemHealth: 'operational'
        };
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/agents/status', (req, res) => {
    try {
        const agents = agentManager.getAllAgents();
        const status = agents.map(agent => ({
            id: agent.id,
            role: agent.role,
            status: agent.status,
            currentJob: agent.currentJobId,
            rating: agent.rating,
            jobsCompleted: agent.jobsCompleted
        }));
        res.json({ agents: status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// LLM test and ping endpoints
app.get('/api/llm/test', async (req, res) => {
    try {
        const testResult = await agentManager.testLLMConnection();
        res.json({ success: true, result: testResult });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/llm/ping', (req, res) => {
    res.json({ 
        status: 'pong', 
        timestamp: new Date().toISOString(),
        llmStatus: agentManager.getLLMStatus()
    });
});

// Jobs POST endpoint
app.post('/api/jobs', (req, res) => {
    try {
        const { title, description, priority, assignedAgent, type } = req.body;
        
        if (!title || !description) {
            return res.status(400).json({ error: 'Missing title or description' });
        }

        const jobId = `job_${++jobCounter}`;
        const job = {
            id: jobId,
            title,
            description,
            priority: priority || 'medium',
            status: 'queued',
            assignedAgent: assignedAgent || null,
            type: type || 'general',
            progress: 0,
            createdAt: new Date(),
            startedAt: null,
            completedAt: null,
            rating: null
        };

        aiJobs.set(jobId, job);
        
        // Auto-assign if agent specified
        if (assignedAgent && aiAgents.has(assignedAgent)) {
            assignJobToAgent(jobId);
        }

        res.json({ 
            success: true, 
            job,
            message: `Job "${title}" created successfully`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// System status endpoint
app.get('/api/status', (req, res) => {
    try {
        const status = {
            server: 'running',
            timestamp: new Date().toISOString(),
            players: players.size,
            agents: agentManager.getAgentCount(),
            jobs: aiJobs.size,
            llmStatus: agentManager.getLLMStatus(),
            systemHealth: 'operational'
        };
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Agent Thinking Helper Functions (IDX-AI-THINKING-HELPERS-001)

function addAgentThought(agent, thoughtData) {
  const thought = {
    id: `thought_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    ...thoughtData
  };
  
  agent.thinkingHistory.push(thought);
  
  // Keep only last 1000 thoughts to prevent memory bloat
  if (agent.thinkingHistory.length > 1000) {
    agent.thinkingHistory = agent.thinkingHistory.slice(-1000);
  }
  
  // Update current thought
  agent.thoughtProcess.currentThought = thought;
  
  // Add to decision history if it's a decision
  if (thoughtData.type === 'decision') {
    agent.thoughtProcess.decisionHistory.push(thought);
  }
  
  return thought;
}

function generateAgentThought(agent, job, context = {}) {
  const thoughtTypes = {
    navigator: {
      job_assignment: `Analyzing spatial requirements for ${job.name}. Considering optimal route planning and terrain analysis.`,
      job_progress: `Evaluating pathfinding progress. Assessing route efficiency and potential obstacles.`,
      job_completion: `Route optimization complete. Path verified for safety and efficiency.`
    },
    strategist: {
      job_assignment: `Developing tactical approach for ${job.name}. Analyzing combat situation and resource allocation.`,
      job_progress: `Refining strategic plan based on current progress. Adjusting tactics as needed.`,
      job_completion: `Strategic analysis complete. Tactical recommendations ready for implementation.`
    },
    engineer: {
      job_assignment: `Assessing technical requirements for ${job.name}. Planning system repair and optimization approach.`,
      job_progress: `Monitoring repair progress. Ensuring system stability and performance optimization.`,
      job_completion: `System repair and optimization complete. All systems operational.`
    },
    scout: {
      job_assignment: `Preparing reconnaissance mission for ${job.name}. Planning intelligence gathering approach.`,
      job_progress: `Conducting exploration and threat assessment. Gathering intelligence data.`,
      job_completion: `Reconnaissance mission complete. Intelligence gathered and analyzed.`
    },
    coordinator: {
      job_assignment: `Coordinating team activities for ${job.name}. Managing communication and resource allocation.`,
      job_progress: `Monitoring team coordination. Ensuring effective communication and priority management.`,
      job_completion: `Team coordination complete. All objectives achieved through effective collaboration.`
    }
  };
  
  const roleThoughts = thoughtTypes[agent.role] || thoughtTypes.navigator;
  const thoughtKey = context.phase || 'job_assignment';
  const baseThought = roleThoughts[thoughtKey] || 'Processing task requirements and planning approach.';
  
  return {
    type: 'thinking',
    thought: baseThought,
    reasoning: `As a ${agent.role}, I need to ${context.reasoning || 'apply my specialized capabilities to complete this task effectively.'}`,
    confidence: 0.7 + (Math.random() * 0.3),
    context: {
      jobId: job?.id,
      jobType: job?.type,
      progress: agent.currentJobProgress,
      ...context
    }
  };
}

function analyzeAgentThinking(agent) {
  const thoughts = agent.thinkingHistory;
  
  if (thoughts.length === 0) {
    return {
      totalThoughts: 0,
      thinkingPatterns: [],
      decisionQuality: 0,
      learningProgress: 0,
      recommendations: ['Agent needs more experience to analyze thinking patterns']
    };
  }
  
  // Analyze thought types
  const thoughtTypes = thoughts.reduce((acc, thought) => {
    acc[thought.type] = (acc[thought.type] || 0) + 1;
    return acc;
  }, {});
  
  // Analyze confidence levels
  const confidenceLevels = thoughts
    .filter(t => t.confidence !== undefined)
    .map(t => t.confidence);
  
  const avgConfidence = confidenceLevels.length > 0 ? 
    confidenceLevels.reduce((sum, c) => sum + c, 0) / confidenceLevels.length : 0;
  
  // Analyze decision patterns
  const decisions = thoughts.filter(t => t.type === 'decision');
  const decisionQuality = decisions.length > 0 ? 
    decisions.reduce((sum, d) => sum + (d.confidence || 0), 0) / decisions.length : 0;
  
  // Identify thinking patterns
  const patterns = [];
  if (thoughtTypes.thinking > 10) patterns.push('Analytical thinking');
  if (thoughtTypes.decision > 5) patterns.push('Decision-making');
  if (thoughtTypes.upgrade > 0) patterns.push('Learning and improvement');
  if (avgConfidence > 0.8) patterns.push('High confidence');
  if (avgConfidence < 0.6) patterns.push('Cautious approach');
  
  // Generate recommendations
  const recommendations = [];
  if (avgConfidence < 0.6) recommendations.push('Consider upgrading agent capabilities');
  if (decisions.length < 5) recommendations.push('Agent needs more decision-making opportunities');
  if (thoughts.length < 20) recommendations.push('Agent needs more experience');
  
  return {
    totalThoughts: thoughts.length,
    thoughtTypes,
    avgConfidence,
    decisionQuality,
    thinkingPatterns: patterns,
    learningProgress: (agent.jobsCompleted / Math.max(1, thoughts.length)) * 100,
    recommendations
  };
}

function simulateAgentThinking(agent, scenario, jobType, context) {
  const simulatedThoughts = [];
  
  // Generate initial assessment thought
  simulatedThoughts.push({
    type: 'assessment',
    thought: `Analyzing scenario: ${scenario}`,
    reasoning: `As a ${agent.role}, I need to understand the context and requirements`,
    confidence: 0.8,
    timestamp: new Date()
  });
  
  // Generate job-specific thoughts
  const jobThoughts = {
    pathfinding: `Planning optimal route for ${scenario}. Considering terrain, obstacles, and efficiency.`,
    tactical_analysis: `Developing tactical strategy for ${scenario}. Analyzing threats and opportunities.`,
    system_repair: `Assessing technical requirements for ${scenario}. Planning repair and optimization approach.`,
    exploration: `Preparing reconnaissance for ${scenario}. Planning intelligence gathering strategy.`,
    team_coordination: `Coordinating team response for ${scenario}. Managing communication and resources.`
  };
  
  const jobThought = jobThoughts[jobType] || `Processing ${jobType} requirements for ${scenario}`;
  
  simulatedThoughts.push({
    type: 'planning',
    thought: jobThought,
    reasoning: `Applying ${agent.role} expertise to develop effective approach`,
    confidence: 0.85,
    timestamp: new Date()
  });
  
  // Generate decision thought
  simulatedThoughts.push({
    type: 'decision',
    thought: `Decided on approach for ${scenario}`,
    reasoning: `Based on ${agent.role} capabilities and scenario analysis`,
    confidence: 0.9,
    timestamp: new Date()
  });
  
  return simulatedThoughts;
}

// Helper function to assign jobs to agents
function assignJobToAgent(jobId) {
  const job = aiJobs.get(jobId);
  if (!job || job.status !== 'queued') return;

  // Find available agent with required capability
  for (const [agentId, agent] of aiAgents) {
    if (agent.status === 'idle' && agent.capabilities.includes(job.requiredCapability)) {
      job.status = 'in_progress';
      job.assignedAgentId = agentId;
      job.assignedTo = agentId;
      agent.status = 'working';
      agent.currentJobId = jobId;
      agent.currentJobProgress = 0;
      
      // Add thinking record for job assignment
      addAgentThought(agent, generateAgentThought(agent, job, { phase: 'job_assignment' }));
      
      break;
    }
  }
}

// Update loop for agents and jobs
setInterval(() => {
  // Update agents
  aiAgents.forEach(agent => {
    if (agent.status === 'working' && agent.currentJobId) {
      const job = aiJobs.get(agent.currentJobId);
      if (job) {
        const previousProgress = agent.currentJobProgress;
        agent.currentJobProgress += Math.random() * 20;
        job.progress = agent.currentJobProgress;
        
        // Add thinking record for significant progress updates
        if (agent.currentJobProgress >= 25 && previousProgress < 25) {
          addAgentThought(agent, generateAgentThought(agent, job, { 
            phase: 'job_progress',
            reasoning: 'assess progress and adjust approach as needed'
          }));
        } else if (agent.currentJobProgress >= 75 && previousProgress < 75) {
          addAgentThought(agent, generateAgentThought(agent, job, { 
            phase: 'job_progress',
            reasoning: 'finalize approach and prepare for completion'
          }));
        }
        
        if (agent.currentJobProgress >= 100) {
          job.status = 'completed';
          agent.status = 'idle';
          agent.currentJobId = null;
          agent.currentJobProgress = 0;
          agent.jobsCompleted++;
          agent.rating = Math.min(5.0, agent.rating + 0.1);
          
          // Add completion thought
          addAgentThought(agent, generateAgentThought(agent, job, { 
            phase: 'job_completion',
            reasoning: 'evaluate success and learn from experience'
          }));
          
          // Add decision record for job completion
          addAgentThought(agent, {
            type: 'decision',
            thought: `Successfully completed ${job.name}`,
            reasoning: `Applied ${agent.role} expertise to achieve objectives`,
            confidence: 0.9,
            context: { jobId: job.id, jobType: job.type, outcome: 'success' }
          });
        }
      }
    }
  });
}, 2000);

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    const newPlayer = {
        id: socket.id,
        position: { x: 0, y: 1, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        planet: 'earth',
        health: 100,
        isDead: false,
        kills: 0,
        deaths: 0,
    };
    players.set(socket.id, newPlayer);

    // Send the new player their own ID and the list of other players
    socket.emit('init', {
        id: socket.id,
        players: Array.from(players.values()),
    });
    
    // Notify other players about the new player
    socket.broadcast.emit('playerJoined', newPlayer);
    
    // Handle player updates
    socket.on('playerUpdate', (data) => {
        const player = players.get(socket.id);
        if (player) {
            player.position = data.position;
            player.rotation = data.rotation;
            player.planet = data.planet;
            
            // Broadcast to other players
            socket.broadcast.emit('playerUpdate', {
                id: socket.id,
                position: data.position,
                rotation: data.rotation,
                planet: data.planet,
                mathematicalData: data.mathematicalData
            });
        }
    });
    
    // Handle bullet firing
    socket.on('bulletFired', (data) => {
        socket.broadcast.emit('bulletFired', {
            id: socket.id,
            bulletId: data.id,
            position: data.position,
            direction: data.direction,
            damage: data.damage,
            weaponType: data.weaponType,
            bulletSize: data.bulletSize,
            bulletColor: data.bulletColor
        });
    });
    
    // Handle weapon switching
    socket.on('weaponSwitch', (data) => {
        const player = players.get(socket.id);
        if (player) {
            player.currentWeapon = data.weapon;
            
            socket.broadcast.emit('weaponSwitch', {
                id: socket.id,
                weapon: data.weapon
            });
        }
    });
    
    // Handle reloading
    socket.on('reload', (data) => {
        const player = players.get(socket.id);
        if (player) {
            player.isReloading = true;
            player.reloadStartTime = Date.now();
            
            socket.broadcast.emit('reload', {
                id: socket.id,
                weapon: data.weapon
            });
        }
    });
    
    // Handle explosion damage
    socket.on('explosionDamage', (data) => {
        const target = players.get(data.targetId);
        if (target && !target.isDead) {
            target.health = Math.max(0, target.health - data.damage);
            
            if (target.health <= 0) {
                target.isDead = true;
                target.deaths++;
                
                // Notify all players about the explosion kill
                io.emit('playerKilled', {
                    killerId: socket.id,
                    victimId: data.targetId,
                    killerName: `Player ${socket.id.slice(0, 6)}`,
                    victimName: `Player ${data.targetId.slice(0, 6)}`,
                    method: 'explosion'
                });
            }
            
            // Notify target about explosion damage
            socket.to(data.targetId).emit('playerDamaged', {
                damage: data.damage,
                attackerId: socket.id,
                newHealth: target.health,
                isDead: target.isDead,
                method: 'explosion'
            });
        }
    });
    
    // Handle player hit
    socket.on('playerHit', (data) => {
        const attacker = players.get(socket.id);
        const target = players.get(data.targetId);
        
        if (attacker && target && !target.isDead) {
            // Update target health
            target.health = Math.max(0, target.health - data.damage);
            
            // Update attacker stats
            attacker.shotsHit++;
            
            // Check if target died
            if (target.health <= 0) {
                target.isDead = true;
                target.deaths++;
                attacker.kills++;
                
                // Notify all players about the kill
                io.emit('playerKilled', {
                    killerId: socket.id,
                    victimId: data.targetId,
                    killerName: `Player ${socket.id.slice(0, 6)}`,
                    victimName: `Player ${data.targetId.slice(0, 6)}`
                });
            }
            
            // Notify target about damage
            socket.to(data.targetId).emit('playerDamaged', {
                damage: data.damage,
                attackerId: socket.id,
                newHealth: target.health,
                isDead: target.isDead
            });
            
            // Notify attacker about hit
            socket.emit('hitConfirmed', {
                targetId: data.targetId,
                damage: data.damage,
                targetHealth: target.health,
                killed: target.isDead
            });
        }
    });
    
    // Handle player death
    socket.on('playerDied', (data) => {
        const player = players.get(socket.id);
        if (player) {
            player.isDead = true;
            player.deaths++;
            
            // Notify other players
            socket.broadcast.emit('playerDied', {
                id: socket.id,
                attackerId: data.attackerId,
                victimName: player.playerName,
                method: data.method,
            });
        }
    });
    
    // Handle player respawn
    socket.on('playerRespawned', (data) => {
        const player = players.get(socket.id);
        if (player) {
            player.isDead = false;
            player.health = player.maxHealth;
            player.position = data.position;
            player.planet = data.planet;
            
            // Notify other players
            socket.broadcast.emit('playerRespawned', {
                id: socket.id,
                playerName: player.playerName,
                position: data.position,
                planet: data.planet,
                health: player.health
            });
        }
    });
    
    // Handle planet changes
    socket.on('planetChange', (data) => {
        const player = players.get(socket.id);
        if (player) {
            player.planet = data.planet;
            
            socket.broadcast.emit('planetChange', {
                id: socket.id,
                planet: data.planet
            });
        }
    });
    
    // Handle rocket travel
    socket.on('rocketTravel', (data) => {
        socket.broadcast.emit('rocketTravel', {
            id: socket.id,
            targetPlanet: data.targetPlanet
        });
    });
    
    // Handle chat messages
    socket.on('chatMessage', (data) => {
        const playerName = players.get(socket.id)?.playerName || 'Unknown Player';
        
        // Check for commands
        if (data.message.startsWith('/')) {
            handleChatCommand(socket, data.message, playerName);
            return;
        }
        
        // Broadcast message to all players
        io.emit('chatMessage', {
            playerName: playerName,
            message: data.message,
            timestamp: data.timestamp
        });
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        players.delete(socket.id);
        io.emit('playerLeft', socket.id);
    });
});

// Handle chat commands
function handleChatCommand(socket, message, playerName) {
    const command = message.toLowerCase().split(' ')[0];
    const args = message.split(' ').slice(1);
    
    switch (command) {
        case '/help':
            const helpMessage = `
Available commands:
/help - Show this help message
/players - List all online players
/planet <name> - Travel to a specific planet
/me <action> - Perform an action
/clear - Clear chat history
            `.trim();
            socket.emit('chatMessage', {
                playerName: 'System',
                message: helpMessage,
                timestamp: Date.now(),
                isSystem: true
            });
            break;
            
        case '/players':
            const playerList = Array.from(players.values()).map(p => p.playerName).join(', ');
            socket.emit('chatMessage', {
                playerName: 'System',
                message: `Online players: ${playerList}`,
                timestamp: Date.now(),
                isSystem: true
            });
            break;
            
        case '/planet':
            if (args.length > 0) {
                const planetName = args[0].toLowerCase();
                const validPlanets = ['earth', 'mars', 'moon', 'venus'];
                if (validPlanets.includes(planetName)) {
                    socket.emit('travelToPlanet', { planet: planetName });
                    io.emit('chatMessage', {
                        playerName: 'System',
                        message: `${playerName} is traveling to ${planetName}!`,
                        timestamp: Date.now(),
                        isSystem: true
                    });
                } else {
                    socket.emit('chatMessage', {
                        playerName: 'System',
                        message: `Invalid planet. Available: ${validPlanets.join(', ')}`,
                        timestamp: Date.now(),
                        isSystem: true
                    });
                }
            }
            break;
            
        case '/me':
            if (args.length > 0) {
                const action = args.join(' ');
                io.emit('chatMessage', {
                    playerName: 'System',
                    message: `* ${playerName} ${action}`,
                    timestamp: Date.now(),
                    isSystem: true
                });
            }
            break;
            
        case '/clear':
            socket.emit('clearChat');
            break;
            
        default:
            socket.emit('chatMessage', {
                playerName: 'System',
                message: `Unknown command: ${command}. Type /help for available commands.`,
                timestamp: Date.now(),
                isSystem: true
            });
    }
}

// API endpoint to receive tree output log
app.post('/api/tree-log', (req, res) => {
    const log = req.body.log;
    if (!log) {
        return res.status(400).json({ error: 'No log provided' });
    }
    fs.writeFile('tree-output-log.txt', Array.isArray(log) ? log.join('\n') : String(log), err => {
        if (err) {
            return res.status(500).json({ error: 'Failed to write log' });
        }
        res.json({ success: true });
    });
});

// Start the server (if not already started)
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Game available at: http://localhost:${PORT}`);
}); 

if (process.env.NODE_ENV !== 'production') {
  // Run auto-llm-setup.cjs in the background
  const autoLLM = exec('node auto-llm-setup.cjs', { cwd: __dirname });
  autoLLM.stdout?.on('data', data => console.log('[auto-llm-setup]', data.trim()));
  autoLLM.stderr?.on('data', data => console.error('[auto-llm-setup]', data.trim()));
}

// Add endpoint for LLM test status
app.get('/api/llm/test-status', (req, res) => {
  const statusFile = path.join(__dirname, 'llm-test-status.json');
  if (fs.existsSync(statusFile)) {
    const data = fs.readFileSync(statusFile, 'utf-8');
    res.type('application/json').send(data);
  } else {
    res.json({ status: 'pending', message: 'Test not run yet' });
  }
}); 

// Get objectives status
app.get('/api/objectives/status', (req, res) => {
  const objectives = new ProjectObjectives();
  res.json(objectives.getObjectiveStatus());
});

// Update current focus
app.put('/api/objectives/focus', (req, res) => {
  const { focus } = req.body;
  const objectives = new ProjectObjectives();
  objectives.updateCurrentFocus(focus);
  res.json({ success: true, currentFocus: objectives.currentFocus });
});

// Update thresholds
app.put('/api/objectives/thresholds', (req, res) => {
  const { taskExecution, memoryRetrieval } = req.body;
  const objectives = new ProjectObjectives();
  
  if (taskExecution !== undefined) objectives.relativityThreshold = taskExecution;
  if (memoryRetrieval !== undefined) objectives.memoryRelevanceThreshold = memoryRetrieval;
  
  res.json({ 
    success: true, 
    thresholds: {
      taskExecution: objectives.relativityThreshold,
      memoryRetrieval: objectives.memoryRelevanceThreshold
    }
  });
});

// Get jobs with relativity ratings
app.get('/api/jobs/relativity', (req, res) => {
  const jobs = Array.from(agentManager.jobQueue).map(job => ({
    id: job.id,
    type: job.type,
    description: job.description,
    priority: job.priority,
    status: job.status,
    relativity: job.relativity,
    createdAt: job.createdAt,
    skipReason: job.skipReason
  }));
  
  res.json({ jobs });
}); 