# Relativity Rating System Implementation

## Overview

The Relativity Rating System ensures that only high-value tasks are executed and memory is retrieved efficiently based on project objectives. This system prevents low-priority tasks from consuming resources and ensures agents focus on what matters most for the project.

## Key Features

### 🎯 Project Objectives
- **7 Core Objectives** with weighted importance
- **Dynamic Focus** that can be changed in real-time
- **Keyword-based Matching** against objective criteria
- **1.5x Bonus** for tasks matching current focus

### 📊 Task Evaluation
- **Relativity Rating** (0-1 scale) calculated against all objectives
- **Execution Threshold** (default: 0.3) - tasks below this are skipped
- **Priority Levels**: critical, high, medium, low, minimal
- **Detailed Breakdown** showing contribution from each objective

### 🧠 Memory Management
- **Relevance-based Retrieval** - only relevant memories are loaded
- **Memory Threshold** (default: 0.2) - memories below this are ignored
- **Context-aware** memory selection for specific tasks
- **Automatic Cleanup** of low-relevance memories

## Project Objectives

| Objective | Weight | Priority | Criteria |
|-----------|--------|----------|----------|
| Core Gameplay Functionality | 25% | 10 | multiplayer, combat, physics, planets |
| AI System Integration | 20% | 9 | neural_networks, agent_coordination, llm_integration |
| Crysis-Level Graphics | 15% | 8 | pbr_materials, lighting, post_processing, performance |
| Procedural Content Generation | 15% | 7 | tree_generation, world_generation, variety |
| Performance Optimization | 10% | 6 | fps, memory, loading, scalability |
| Production Deployment | 10% | 5 | aws, scalability, monitoring, reliability |
| User Experience | 5% | 4 | ui, accessibility, documentation, onboarding |

## How It Works

### 1. Task Evaluation Process
```javascript
const relativity = objectives.calculateTaskRelativity(job, context);
if (!relativity.shouldExecute) {
  console.log(`⏭️ Skipping low-relevance job: ${job.id}`);
  return;
}
```

### 2. Memory Retrieval Process
```javascript
const context = memory.getContext(currentTask);
// Only retrieves memories with relevance >= threshold
```

### 3. Agent Assignment
```javascript
// Jobs are sorted by relativity rating (highest first)
// Agents are scored based on role match, performance, and queue size
```

## API Endpoints

### Objectives Management
- `GET /api/objectives/status` - Get current objectives and thresholds
- `PUT /api/objectives/focus` - Update current focus objective
- `PUT /api/objectives/thresholds` - Update execution/memory thresholds

### Job Management
- `GET /api/jobs/relativity` - Get jobs with relativity ratings
- `PUT /api/jobs/:jobId/priority` - Prioritize a specific job

## Dashboard Features

### Objectives Panel
- **Focus Selection**: Dropdown to change current focus
- **Threshold Controls**: Sliders for task execution and memory retrieval thresholds
- **Objective Display**: Shows all objectives with current focus highlighted

### Job Display
- **Relativity Rating**: Color-coded priority indicators
- **Objective Breakdown**: Expandable details showing contribution from each objective
- **Skip Reasons**: Clear indication when jobs are skipped due to low relevance

## Configuration

### Default Thresholds
```javascript
relativityThreshold = 0.3;        // Minimum rating to execute tasks
memoryRelevanceThreshold = 0.2;   // Minimum rating to retrieve memory
```

### Adjusting Thresholds
- **Higher thresholds** = More selective, fewer tasks executed
- **Lower thresholds** = Less selective, more tasks executed
- **Dynamic adjustment** = Can be changed in real-time via dashboard

## Example Usage

### High-Relevance Task
```javascript
// Multiplayer combat system
{
  type: 'feature_implementation',
  description: 'Implement multiplayer combat system with physics',
  relativity: {
    rating: 0.75,
    priority: 'high',
    shouldExecute: true
  }
}
```

### Low-Relevance Task
```javascript
// Email template creation
{
  type: 'documentation_update',
  description: 'Create email template for marketing',
  relativity: {
    rating: 0.15,
    priority: 'minimal',
    shouldExecute: false
  }
}
```

## Benefits

### 🚀 Performance
- **Reduced Resource Usage**: Low-value tasks are automatically skipped
- **Focused Processing**: Agents work only on relevant tasks
- **Efficient Memory**: Only relevant memories are loaded

### 🎯 Quality
- **Objective Alignment**: All tasks are evaluated against project goals
- **Dynamic Prioritization**: Focus can be changed based on project phase
- **Transparent Decision Making**: Clear breakdown of why tasks are executed or skipped

### 🔧 Flexibility
- **Real-time Adjustment**: Thresholds and focus can be changed instantly
- **Context Awareness**: Memory retrieval adapts to current task
- **Scalable System**: Easy to add new objectives or modify criteria

## Testing

Run the test script to see the system in action:
```bash
node test-relativity-system.js
```

This demonstrates:
- Task evaluation against objectives
- Focus objective impact
- Memory relevance calculation
- Threshold adjustment effects

## Integration

The relativity system is fully integrated with:
- **AI Agent System**: All jobs are evaluated before execution
- **Memory Management**: Context-aware memory retrieval
- **Dashboard UI**: Real-time monitoring and control
- **API Layer**: RESTful endpoints for management

## Future Enhancements

- **Machine Learning**: Learn optimal thresholds from project performance
- **Objective Evolution**: Automatically adjust objective weights based on progress
- **Predictive Analysis**: Forecast task relevance based on project trajectory
- **Team Collaboration**: Multi-user objective management and voting 