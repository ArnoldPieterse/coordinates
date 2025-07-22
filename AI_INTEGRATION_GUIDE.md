# AI Integration Guide

## Overview

This guide covers the comprehensive integration of the `simple_AI_assistant` project with Docker Model Runner into the Coordinates project. The integration provides a complete AI-powered system with chat capabilities, code generation, issue analysis, and Git Issue Solver enhancement.

## Architecture

The AI system consists of several microservices orchestrated by Docker Compose:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Gateway    │    │  AI Assistant   │    │  AI Model       │
│   (Port 3002)   │◄──►│   (Port 3001)   │◄──►│   Runner        │
│                 │    │                 │    │  (Port 8080)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Redis       │    │    Grafana      │    │   AI Models     │
│   (Port 6379)   │    │   (Port 3003)   │    │   & Config      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Services

### 1. AI Model Runner
- **Purpose**: Runs AI models locally using Docker
- **Port**: 8080
- **Features**: Model loading/unloading, text generation, code generation
- **Configuration**: `ai-models/` and `ai-config/` volumes

### 2. AI Assistant
- **Purpose**: Core AI service with conversation management
- **Port**: 3001
- **Features**: Chat, session management, Git Issue Solver integration
- **Dependencies**: Redis, AI Model Runner

### 3. AI Gateway
- **Purpose**: Unified API interface and load balancer
- **Port**: 3002
- **Features**: Request routing, circuit breakers, metrics collection
- **Dependencies**: AI Assistant, AI Model Runner

### 4. Redis
- **Purpose**: Session storage and caching
- **Port**: 6379
- **Features**: Conversation history, session management

### 5. Grafana
- **Purpose**: Monitoring and visualization
- **Port**: 3003
- **Features**: Health monitoring, performance metrics, dashboards

## Quick Start

### 1. Prerequisites
```bash
# Install Docker and Docker Compose
# Ensure ports 3001-3003, 6379, 8080 are available
```

### 2. Start the AI System
```bash
# Start all AI services
docker-compose -f docker-compose.ai.yml up -d

# Check service status
docker-compose -f docker-compose.ai.yml ps

# View logs
docker-compose -f docker-compose.ai.yml logs -f
```

### 3. Verify Installation
```bash
# Check AI Gateway health
curl http://localhost:3002/health

# Check AI Assistant health
curl http://localhost:3001/health

# Check AI Model Runner health
curl http://localhost:8080/health
```

## API Endpoints

### AI Gateway (Port 3002)

#### Health & Metrics
- `GET /health` - System health status
- `GET /metrics` - Performance metrics
- `GET /` - Service information

#### Chat & Generation
- `POST /api/chat` - AI chat conversation
- `POST /api/generate/text` - Text generation
- `POST /api/generate/code` - Code generation

#### Model Management
- `GET /api/models` - List available models
- `POST /api/models/{modelId}/load` - Load a model
- `DELETE /api/models/{modelId}/unload` - Unload a model

#### Git Issue Solver Integration
- `POST /api/issues/analyze` - Analyze GitHub issues
- `POST /api/issues/solve` - Generate issue solutions

#### Session Management
- `GET /api/sessions/{sessionId}` - Get session data
- `DELETE /api/sessions/{sessionId}` - Delete session

### AI Assistant (Port 3001)

#### Core Endpoints
- `POST /api/chat` - Process chat messages
- `POST /api/generate/text` - Generate text
- `POST /api/generate/code` - Generate code
- `GET /api/models` - List loaded models
- `POST /api/models/{modelId}/load` - Load model
- `DELETE /api/models/{modelId}/unload` - Unload model

#### Git Issue Solver
- `POST /api/issues/analyze` - Analyze issues with AI
- `POST /api/issues/solve` - Solve issues with AI
- `GET /api/issues/history` - Get issue history

#### Session Management
- `GET /api/sessions/{sessionId}` - Get session
- `DELETE /api/sessions/{sessionId}` - Delete session
- `GET /api/sessions` - List all sessions

## Usage Examples

### 1. Basic Chat
```bash
curl -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how can you help me?",
    "sessionId": "user123"
  }'
```

### 2. Code Generation
```bash
curl -X POST http://localhost:3002/api/generate/code \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a React component for a todo list",
    "language": "javascript",
    "modelId": "codellama"
  }'
```

### 3. Issue Analysis
```bash
curl -X POST http://localhost:3002/api/issues/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "issue": {
      "title": "Fix login bug",
      "body": "Users cannot log in with valid credentials",
      "labels": ["bug", "frontend"]
    }
  }'
```

### 4. Model Management
```bash
# List available models
curl http://localhost:3002/api/models

# Load a model
curl -X POST http://localhost:3002/api/models/codellama/load \
  -H "Content-Type: application/json" \
  -d '{"config": {"maxTokens": 2048}}'

# Unload a model
curl -X DELETE http://localhost:3002/api/models/codellama/unload
```

## WebSocket Support

The AI Gateway supports real-time communication via WebSocket:

```javascript
const ws = new WebSocket('ws://localhost:3002');

// Send chat message
ws.send(JSON.stringify({
  type: 'chat',
  payload: {
    message: 'Hello AI!',
    sessionId: 'user123'
  }
}));

// Send code generation request
ws.send(JSON.stringify({
  type: 'code_generation',
  payload: {
    prompt: 'Create a Python function to sort a list',
    language: 'python'
  }
}));

// Handle responses
ws.onmessage = (event) => {
  const response = JSON.parse(event.data);
  console.log('AI Response:', response);
};
```

## Git Issue Solver Integration

The AI system enhances the existing Git Issue Solver Team with AI capabilities:

### Enhanced Workflow
1. **Analysis Phase**: AI analyzes issues and provides insights
2. **Implementation Phase**: AI suggests code improvements
3. **Review Phase**: AI reviews code for quality and security
4. **Testing Phase**: AI generates test cases
5. **Deployment Phase**: AI optimizes deployment strategies

### Usage
```bash
# Run enhanced issue solving
node tools/git-issue-solver-demo.js

# The AI will automatically enhance each phase
# with insights, code suggestions, and optimizations
```

## Configuration

### Environment Variables

#### AI Assistant
```bash
NODE_ENV=production
AI_MODEL_RUNNER_URL=http://ai-model-runner:8080
AI_ASSISTANT_PORT=3001
AI_ASSISTANT_LOG_LEVEL=info
```

#### AI Gateway
```bash
AI_ASSISTANT_URL=http://ai-assistant:3001
AI_MODEL_RUNNER_URL=http://ai-model-runner:8080
GATEWAY_PORT=3002
ALLOWED_ORIGINS=http://localhost:3000
```

#### AI Model Runner
```bash
MODEL_RUNNER_PORT=8080
MODEL_RUNNER_LOG_LEVEL=info
```

### Model Configuration

Create model configurations in `ai-config/`:

```json
{
  "codellama": {
    "model": "codellama:7b",
    "maxTokens": 2048,
    "temperature": 0.7,
    "topP": 0.9
  },
  "llama2": {
    "model": "llama2:7b",
    "maxTokens": 1024,
    "temperature": 0.8,
    "topP": 0.9
  }
}
```

## Monitoring

### Grafana Dashboard
Access the monitoring dashboard at `http://localhost:3003`:
- Username: `admin`
- Password: `admin`

### Metrics Available
- Service health status
- Request rates and response times
- Error rates and types
- Active sessions and loaded models
- Memory and CPU usage
- Circuit breaker status

### Health Checks
```bash
# Check all services
curl http://localhost:3002/health

# Check individual services
curl http://localhost:3001/health
curl http://localhost:8080/health
```

## Troubleshooting

### Common Issues

#### 1. Service Not Starting
```bash
# Check Docker logs
docker-compose -f docker-compose.ai.yml logs [service-name]

# Check service dependencies
docker-compose -f docker-compose.ai.yml ps
```

#### 2. Model Loading Issues
```bash
# Check model configuration
ls -la ai-config/
ls -la ai-models/

# Check Model Runner logs
docker logs coordinates-ai-runner
```

#### 3. Connection Issues
```bash
# Check network connectivity
docker network ls
docker network inspect coordinates_ai-network

# Test service connectivity
curl http://ai-assistant:3001/health
curl http://ai-model-runner:8080/health
```

#### 4. Performance Issues
```bash
# Check resource usage
docker stats

# Check metrics
curl http://localhost:3002/metrics
```

### Logs
```bash
# View all logs
docker-compose -f docker-compose.ai.yml logs -f

# View specific service logs
docker-compose -f docker-compose.ai.yml logs -f ai-assistant
docker-compose -f docker-compose.ai.yml logs -f ai-gateway
docker-compose -f docker-compose.ai.yml logs -f ai-model-runner
```

## Development

### Local Development
```bash
# Start services in development mode
NODE_ENV=development docker-compose -f docker-compose.ai.yml up

# Run tests
cd src/ai/assistant && npm test
cd src/ai/gateway && npm test
```

### Adding New Models
1. Add model configuration to `ai-config/`
2. Update model loading logic in `AIModelRunner.js`
3. Test model loading and generation
4. Update documentation

### Extending Functionality
1. Add new endpoints to the appropriate service
2. Update the ServiceRouter for new routes
3. Add metrics collection
4. Update health checks
5. Test thoroughly

## Security Considerations

### Network Security
- Services communicate over internal Docker network
- External access only through AI Gateway
- Rate limiting and circuit breakers implemented

### Data Security
- Session data stored in Redis with TTL
- No sensitive data logged
- Input validation on all endpoints

### Access Control
- CORS configured for allowed origins
- Request validation and sanitization
- Error messages don't expose internal details

## Performance Optimization

### Caching
- Redis for session and conversation caching
- Model response caching
- Static asset caching

### Load Balancing
- AI Gateway provides load balancing
- Circuit breakers prevent cascading failures
- Health checks ensure service availability

### Resource Management
- Model unloading when not in use
- Memory usage monitoring
- Automatic cleanup of expired sessions

## Future Enhancements

### Planned Features
1. **Multi-modal AI**: Image and audio processing
2. **Advanced Analytics**: Detailed usage analytics
3. **Custom Models**: Training and fine-tuning support
4. **API Versioning**: Backward compatibility
5. **Advanced Security**: Authentication and authorization
6. **Scalability**: Horizontal scaling support

### Integration Opportunities
1. **CI/CD Pipeline**: Automated testing and deployment
2. **Monitoring**: Prometheus and AlertManager integration
3. **Logging**: Centralized logging with ELK stack
4. **Backup**: Automated backup and recovery
5. **Documentation**: Auto-generated API documentation

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review service logs
3. Check health endpoints
4. Consult the monitoring dashboard
5. Review this documentation

The AI integration provides a robust, scalable foundation for AI-powered features in the Coordinates project, with comprehensive monitoring, error handling, and extensibility for future enhancements. 