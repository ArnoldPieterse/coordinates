# API Documentation

## Overview

The Coordinates project provides a comprehensive REST API for managing AI agents, jobs, game actions, and player interactions. All endpoints return JSON responses and use standard HTTP status codes.

**Base URL**: `http://localhost:3001/api`

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

Error responses:

```json
{
  "error": "Error description",
  "status": 400
}
```

## Endpoints

### Health & System

#### GET `/api/health`
Returns system health status and basic statistics.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "players": 5,
  "agents": 12,
  "jobs": 8
}
```

#### GET `/api/system/info`
Returns detailed system information.

**Response:**
```json
{
  "systemInfo": {
    "version": "1.0.0",
    "uptime": 3600,
    "memory": {
      "rss": 52428800,
      "heapTotal": 20971520,
      "heapUsed": 10485760
    },
    "platform": "win32",
    "nodeVersion": "v18.0.0",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### POST `/api/system/restart`
Initiates a system restart (simulated).

**Response:**
```json
{
  "success": true,
  "message": "System restart initiated"
}
```

### AI Agent Management

#### GET `/api/agents`
Returns all AI agents in the system.

**Response:**
```json
{
  "agents": [
    {
      "id": "agent_1",
      "name": "Navigator 1",
      "role": "navigator",
      "status": "idle",
      "currentJobId": null,
      "currentJobProgress": 0,
      "jobsCompleted": 5,
      "rating": 4.2,
      "memory": {
        "shortTerm": 50,
        "longTerm": 200
      },
      "capabilities": ["pathfinding", "spatial_analysis", "route_optimization"],
      "createdAt": "2024-01-15T10:00:00.000Z",
      "lastActivity": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### POST `/api/agents/spawn`
Creates a new AI agent.

**Request Body:**
```json
{
  "role": "navigator"
}
```

**Available Roles:**
- `navigator` - Pathfinding and spatial awareness
- `strategist` - Tactical planning and combat analysis
- `engineer` - System repair and technical operations
- `scout` - Exploration and intelligence gathering
- `coordinator` - Team coordination and communication

**Response:**
```json
{
  "success": true,
  "agent": {
    "id": "agent_2",
    "name": "Strategist 2",
    "role": "strategist",
    "status": "idle",
    "currentJobId": null,
    "currentJobProgress": 0,
    "jobsCompleted": 0,
    "rating": 4.5,
    "memory": {
      "shortTerm": 75,
      "longTerm": 300
    },
    "capabilities": ["tactical_planning", "combat_analysis", "resource_management"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "lastActivity": "2024-01-15T10:30:00.000Z"
  },
  "message": "Agent Strategist 2 spawned successfully"
}
```

#### DELETE `/api/agents/:agentId`
Dismisses an AI agent.

**Response:**
```json
{
  "success": true,
  "message": "Agent Navigator 1 dismissed successfully"
}
```

#### PUT `/api/agents/:agentId/upgrade`
Upgrades an agent with new capabilities.

**Request Body:**
```json
{
  "capability": "advanced_pathfinding"
}
```

**Response:**
```json
{
  "success": true,
  "agent": {
    "id": "agent_1",
    "name": "Navigator 1",
    "capabilities": ["pathfinding", "spatial_analysis", "route_optimization", "advanced_pathfinding"],
    "rating": 4.4
  },
  "message": "Agent Navigator 1 upgraded with advanced_pathfinding"
}
```

### Job Management

#### GET `/api/jobs`
Returns all jobs in the system.

**Response:**
```json
{
  "jobs": [
    {
      "id": "job_1",
      "type": "pathfinding",
      "description": "Find route to enemy base",
      "status": "in_progress",
      "priority": "high",
      "assignedAgentId": "agent_1",
      "progress": 65,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "estimatedDuration": 2,
      "requiredCapability": "pathfinding"
    }
  ]
}
```

#### POST `/api/jobs/create`
Creates a new job.

**Request Body:**
```json
{
  "type": "pathfinding",
  "description": "Find optimal route to destination",
  "priority": "high"
}
```

**Available Job Types:**
- `pathfinding` - Find optimal route to destination
- `tactical_analysis` - Analyze combat situation and recommend strategy
- `system_repair` - Repair damaged systems or equipment
- `exploration` - Explore new area and gather intelligence
- `team_coordination` - Coordinate team activities and resources

**Priorities:**
- `low` - Low priority jobs
- `medium` - Medium priority jobs (default)
- `high` - High priority jobs

**Response:**
```json
{
  "success": true,
  "job": {
    "id": "job_2",
    "type": "tactical_analysis",
    "description": "Analyze current battlefield situation",
    "status": "queued",
    "priority": "high",
    "assignedAgentId": null,
    "progress": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "estimatedDuration": 5,
    "requiredCapability": "tactical_planning"
  },
  "message": "Job Tactical Analysis created successfully"
}
```

#### DELETE `/api/jobs/:jobId`
Cancels a job.

**Response:**
```json
{
  "success": true,
  "message": "Job cancelled successfully"
}
```

#### PUT `/api/jobs/:jobId/priority`
Updates job priority.

**Request Body:**
```json
{
  "priority": "low"
}
```

**Response:**
```json
{
  "success": true,
  "job": {
    "id": "job_1",
    "priority": "low"
  },
  "message": "Job priority updated to low"
}
```

### Game Management

#### GET `/api/game/status`
Returns game statistics and status.

**Response:**
```json
{
  "stats": {
    "totalAgents": 12,
    "activeAgents": 8,
    "totalJobs": 15,
    "queuedJobs": 3,
    "inProgressJobs": 8,
    "completedJobs": 4,
    "averageRating": 4.3
  }
}
```

#### POST `/api/game/start`
Starts the game for a player.

**Request Body:**
```json
{
  "playerId": "player_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Game started successfully",
  "player": {
    "id": "player_123",
    "gameState": "playing",
    "lastActivity": "2024-01-15T10:30:00.000Z"
  }
}
```

#### POST `/api/game/pause`
Pauses the game for a player.

**Request Body:**
```json
{
  "playerId": "player_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Game paused successfully",
  "player": {
    "id": "player_123",
    "gameState": "paused",
    "lastActivity": "2024-01-15T10:30:00.000Z"
  }
}
```

### Player Management

#### GET `/api/players`
Returns all players in the system.

**Response:**
```json
{
  "players": [
    {
      "id": "player_123",
      "name": "TestPlayer",
      "position": { "x": 10, "y": 5, "z": 15 },
      "rotation": { "x": 0, "y": 45, "z": 0 },
      "planet": "mars",
      "health": 100,
      "energy": 100,
      "score": 1500,
      "level": 3,
      "isDead": false,
      "kills": 5,
      "deaths": 2,
      "gameState": "playing",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "lastActivity": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### POST `/api/players/join`
Creates a new player.

**Request Body:**
```json
{
  "playerName": "NewPlayer"
}
```

**Response:**
```json
{
  "success": true,
  "player": {
    "id": "player_456",
    "name": "NewPlayer",
    "position": { "x": 0, "y": 1, "z": 0 },
    "rotation": { "x": 0, "y": 0, "z": 0 },
    "planet": "earth",
    "health": 100,
    "energy": 100,
    "score": 0,
    "level": 1,
    "isDead": false,
    "kills": 0,
    "deaths": 0,
    "gameState": "menu",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "lastActivity": "2024-01-15T10:30:00.000Z"
  },
  "message": "Player joined successfully"
}
```

#### PUT `/api/players/:playerId/position`
Updates player position and rotation.

**Request Body:**
```json
{
  "position": { "x": 20, "y": 10, "z": 30 },
  "rotation": { "x": 0, "y": 90, "z": 0 },
  "planet": "venus"
}
```

**Response:**
```json
{
  "success": true,
  "player": {
    "id": "player_123",
    "position": { "x": 20, "y": 10, "z": 30 },
    "rotation": { "x": 0, "y": 90, "z": 0 },
    "planet": "venus",
    "lastActivity": "2024-01-15T10:30:00.000Z"
  },
  "message": "Player position updated"
}
```

#### POST `/api/players/:playerId/shoot`
Handles player shooting actions.

**Request Body:**
```json
{
  "targetId": "player_456",
  "damage": 25,
  "weaponType": "laser"
}
```

**Response:**
```json
{
  "success": true,
  "target": {
    "id": "player_456",
    "health": 75,
    "isDead": false
  },
  "attacker": {
    "id": "player_123",
    "kills": 6,
    "score": 1600
  },
  "message": "Shot fired: 25 damage dealt"
}
```

## Error Codes

- `400` - Bad Request (invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Testing

Run the API test suite:

```bash
npm test
# or
npm run test:api
```

The test suite covers:
- All endpoint functionality
- Error handling
- Performance testing
- Concurrent operations

## WebSocket Events

The server also supports real-time communication via WebSocket (Socket.IO) on the same port:

- `playerUpdate` - Player position/rotation updates
- `bulletFired` - Bullet firing events
- `playerHit` - Player damage events
- `playerKilled` - Player death events
- `weaponSwitch` - Weapon switching events
- `reload` - Weapon reload events

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## Security Considerations

- All endpoints are publicly accessible
- Input validation is performed on all endpoints
- Consider implementing authentication for production use
- Sanitize all user inputs to prevent injection attacks 