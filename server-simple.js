// IDX-DOC-00: For index reference format, see INDEX_DESCRIBER.md
// IDX-SERVER-01: Multiplayer Server Module
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

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

// ====== SIMPLIFIED AGENT SYSTEM ======
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

// Initialize agents without LLM
function initializeAgents() {
  console.log('🤖 Initializing simplified AI agents...');
  
  for (const [role, config] of Object.entries(agentRoles)) {
    const agentId = `agent_${++agentCounter}`;
    const agent = {
      id: agentId,
      name: `${config.name} ${agentCounter}`,
      role: role,
      status: 'idle',
      currentJobId: null,
      currentJobProgress: 0,
      jobsCompleted: 0,
      rating: config.baseRating + (Math.random() - 0.5) * 0.4,
      memory: {
        shortTerm: config.baseMemory.shortTerm,
        longTerm: config.baseMemory.longTerm
      },
      capabilities: [...config.capabilities],
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
    console.log(`🚀 Spawned ${role} agent: ${agentId}`);
  }
  
  console.log(`🚀 Spawned ${aiAgents.size} AI agents for all roles`);
}

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

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'running', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    players: players.size,
    agents: aiAgents.size,
    jobs: aiJobs.size,
    message: 'Server is running successfully'
  });
});

// AI Agent API Endpoints
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

app.get('/api/agents/:id', (req, res) => {
  const agent = aiAgents.get(req.params.id);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  res.json({ agent });
});

app.post('/api/agents/:id/upgrade', (req, res) => {
  const agent = aiAgents.get(req.params.id);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  const { capability, rating } = req.body;
  
  if (capability && !agent.capabilities.includes(capability)) {
    agent.capabilities.push(capability);
  }
  
  if (rating) {
    agent.rating = Math.min(5.0, Math.max(1.0, agent.rating + rating));
  }

  res.json({ 
    success: true, 
    agent,
    message: 'Agent upgraded successfully'
  });
});

// Job API Endpoints
app.get('/api/jobs', (req, res) => {
  const jobs = Array.from(aiJobs.values());
  res.json({ jobs });
});

app.post('/api/jobs', (req, res) => {
  try {
    const { type, description, data, priority = 'normal', targetRole } = req.body;
    
    if (!jobTypes[type]) {
      return res.status(400).json({ error: `Unknown job type: ${type}` });
    }

    const jobId = `job_${++jobCounter}`;
    const job = {
      id: jobId,
      type,
      name: jobTypes[type].name,
      description,
      data,
      priority,
      status: 'queued',
      progress: 0,
      createdAt: new Date(),
      targetRole,
      requiredCapability: jobTypes[type].requiredCapability
    };

    aiJobs.set(jobId, job);
    
    // Assign job to agent
    assignJobToAgent(jobId);
    
    res.json({ 
      success: true, 
      job,
      message: `Job ${job.name} created successfully`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/jobs/:id', (req, res) => {
  const job = aiJobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json({ job });
});

// LLM API Endpoints (simplified)
app.get('/api/llm/status', (req, res) => {
  res.json({
    enabled: false,
    message: 'LLM services not available in simplified mode',
    providers: [],
    activeProvider: null
  });
});

app.post('/api/llm/generate', (req, res) => {
  res.json({
    success: false,
    message: 'LLM services not available in simplified mode',
    text: 'LLM not available',
    provider: 'none',
    responseTime: 0
  });
});

// Thinking History API Endpoints
app.get('/api/agents/:id/thinking', (req, res) => {
  const agent = aiAgents.get(req.params.id);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  res.json({
    agentId: req.params.id,
    thinkingHistory: agent.thinkingHistory || [],
    thoughtProcess: agent.thoughtProcess || {}
  });
});

app.post('/api/agents/:id/thinking', (req, res) => {
  const agent = aiAgents.get(req.params.id);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  const { thought, reasoning, confidence = 0.5, context = {} } = req.body;
  
  const thinkingRecord = {
    id: `thought_${Date.now()}`,
    thought,
    reasoning,
    confidence,
    context,
    timestamp: new Date()
  };

  if (!agent.thinkingHistory) {
    agent.thinkingHistory = [];
  }
  
  agent.thinkingHistory.push(thinkingRecord);
  
  // Keep only recent thoughts
  if (agent.thinkingHistory.length > 100) {
    agent.thinkingHistory = agent.thinkingHistory.slice(-100);
  }

  res.json({
    success: true,
    thinkingRecord,
    message: 'Thinking record added successfully'
  });
});

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
      const thinkingRecord = {
        id: `thought_${Date.now()}`,
        thought: `Assigned to job: ${job.name}`,
        reasoning: `Agent has required capability: ${job.requiredCapability}`,
        confidence: 0.8,
        context: { jobId: job.id, jobType: job.type, phase: 'job_assignment' },
        timestamp: new Date()
      };
      
      if (!agent.thinkingHistory) {
        agent.thinkingHistory = [];
      }
      agent.thinkingHistory.push(thinkingRecord);
      
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
          const thinkingRecord = {
            id: `thought_${Date.now()}`,
            thought: `Making good progress on ${job.name}`,
            reasoning: 'assess progress and adjust approach as needed',
            confidence: 0.7,
            context: { jobId: job.id, jobType: job.type, phase: 'job_progress' },
            timestamp: new Date()
          };
          
          if (!agent.thinkingHistory) {
            agent.thinkingHistory = [];
          }
          agent.thinkingHistory.push(thinkingRecord);
        } else if (agent.currentJobProgress >= 75 && previousProgress < 75) {
          const thinkingRecord = {
            id: `thought_${Date.now()}`,
            thought: `Nearly complete with ${job.name}`,
            reasoning: 'finalize approach and prepare for completion',
            confidence: 0.9,
            context: { jobId: job.id, jobType: job.type, phase: 'job_progress' },
            timestamp: new Date()
          };
          
          if (!agent.thinkingHistory) {
            agent.thinkingHistory = [];
          }
          agent.thinkingHistory.push(thinkingRecord);
        }
        
        if (agent.currentJobProgress >= 100) {
          job.status = 'completed';
          agent.status = 'idle';
          agent.currentJobId = null;
          agent.currentJobProgress = 0;
          agent.jobsCompleted++;
          agent.rating = Math.min(5.0, agent.rating + 0.1);
          
          // Add completion thought
          const thinkingRecord = {
            id: `thought_${Date.now()}`,
            thought: `Successfully completed ${job.name}`,
            reasoning: 'evaluate success and learn from experience',
            confidence: 0.9,
            context: { jobId: job.id, jobType: job.type, phase: 'job_completion' },
            timestamp: new Date()
          };
          
          if (!agent.thinkingHistory) {
            agent.thinkingHistory = [];
          }
          agent.thinkingHistory.push(thinkingRecord);
        }
      }
    }
  });
}, 2000);

// Socket.IO connection handling
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
    
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        players.delete(socket.id);
        io.emit('playerLeft', socket.id);
    });
});

// Initialize agents
initializeAgents();

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Game available at: http://localhost:${PORT}`);
}); 