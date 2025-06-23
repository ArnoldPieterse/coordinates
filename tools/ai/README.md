# LM Studio Integration

AI-powered interface for dynamic game scenarios and content generation using local LLMs via LM Studio.

## 🚀 Features

- **Command Line Interface** - Standalone CLI for AI queries
- **Server Integration** - Call AI scenarios from the game server
- **Web Interface** - Visual interface for AI interactions (F8)
- **Multiple Scenarios** - Game Master, NPC Generator, Quest Designer, Story Generator, Event Planner, Balance Advisor
- **JSON Output** - Structured responses for server integration
- **Statistics Tracking** - Monitor AI usage and performance
- **Consolidated Testing** - Comprehensive test suite for all AI functionality
- **Performance Optimization** - Optimized models and configurations for faster responses

## 📋 Prerequisites

1. **LM Studio** - Download and install from [https://lmstudio.ai/](https://lmstudio.ai/)
2. **Local Model** - Download a model (e.g., Llama 2, Mistral, etc.)
3. **Node.js** - Version 14 or higher

## ⚙️ Setup

### 1. Install LM Studio
- Download LM Studio from the official website
- Install and launch the application
- Download a model (recommended: Llama 2 7B Chat)

### 2. Start LM Studio Server
1. Open LM Studio
2. Load your model
3. Click "Start Server" 
4. Note the server URL (default: `http://localhost:1234`)

### 3. Configure the Interface
Edit `tools/ai/lm-studio-config.json`:
```json
{
  "serverUrl": "http://localhost:1234",
  "defaultModel": "llama-2-7b-chat",
  "maxTokens": 500,
  "temperature": 0.7
}
```

## 🧪 Testing

### Consolidated Test Suite
Run the comprehensive AI test suite to verify all functionality:

```bash
# Run all tests
node tools/ai/ai-test-suite.js

# Test includes:
# - HTTP API connectivity
# - SDK functionality
# - Performance testing
# - Game scenario testing
# - Response time analysis
```

### Individual Tests
The test suite combines functionality from:
- `lm-studio-http-test.js` - HTTP API testing
- `lm-studio-sdk-test.js` - SDK connectivity testing
- `performance-test.js` - Performance optimization testing

## 🚀 Performance Optimization

### Quick Setup for Faster Responses

Since the automated optimizer can't handle interactive prompts, follow these manual steps:

#### Step 1: Download the Optimized Model

```bash
lms get llama-3-8b-instruct
```

**When prompted, select:**
- `PrunaAI/Meta-Llama-3-8B-Instruct-GGUF-smashed`
- Choose quantization: `Q4_K_M` (good balance) or `Q5_K_M` (better quality)

#### Step 2: Load the Optimized Model

```bash
lms load PrunaAI/Meta-Llama-3-8B-Instruct-GGUF-smashed
```

#### Step 3: Test Performance

```bash
node tools/ai/ai-test-suite.js
```

### Expected Improvements

- **Response Time:** 2-5 seconds (vs 10-30 seconds with 70B)
- **Memory Usage:** ~8GB (vs ~30GB with 70B)
- **Quality:** Still excellent for game scenarios

### Alternative Models

If the above doesn't work, try these alternatives:

```bash
# Alternative 1: Different provider
lms get QuantFactory/Meta-Llama-3-8B-Instruct-GGUF

# Alternative 2: Different quantization
lms get NousResearch/Meta-Llama-3-8B-Instruct-GGUF

# Alternative 3: Function calling version
lms get smangrul/llama-3-8B-instruct-function-calling
```

### Optimized Configuration

The optimized configuration is already saved in `tools/ai/lm-studio-config.json` with:

- Shorter max tokens (150-180)
- Optimized temperature (0.6-0.8)
- Game-specific prompts
- Faster generation parameters

## 🎮 Usage

### Command Line Interface

```bash
# General query
node tools/ai/lm-studio-cli.js query "Create a meteor shower event"

# Specific scenario
node tools/ai/lm-studio-cli.js scenario gameMaster "Design a boss battle"

# Generate NPC
node tools/ai/lm-studio-cli.js npc "Space trader with mysterious past"

# Generate quest
node tools/ai/lm-studio-cli.js quest "Resource gathering on Mars"

# Generate story
node tools/ai/lm-studio-cli.js story "Planet with ancient ruins"

# Plan event
node tools/ai/lm-studio-cli.js event "Weekend tournament"

# Get balance suggestions
node tools/ai/lm-studio-cli.js balance "Weapon balance analysis"

# List available scenarios
node tools/ai/lm-studio-cli.js list

# Show statistics
node tools/ai/lm-studio-cli.js stats
```

### Web Interface (F8)
- Press F8 or click the "🤖 LM Studio Interface" button
- Select a scenario from the dropdown
- Enter your message
- Click "🚀 Send to AI"

### Server Integration

```javascript
import lmStudioIntegration from './tools/ai/server-integration.js';

// Generate dynamic scenario
const scenario = await lmStudioIntegration.generateScenario("Create a meteor shower event");

// Generate NPC
const npc = await lmStudioIntegration.generateNPC("Space trader with mysterious past");

// Generate quest
const quest = await lmStudioIntegration.generateQuest("Resource gathering mission");

// Get statistics
const stats = lmStudioIntegration.getStats();
```

## 🎭 AI Scenarios

### Game Master
- Creates dynamic game scenarios
- Designs challenges and events
- Generates interactive content

**Example:**
```bash
node tools/ai/lm-studio-cli.js scenario gameMaster "Create a meteor shower event on Mars that affects gameplay"
```

### NPC Generator
- Creates non-player characters
- Generates personalities and backstories
- Designs character motivations

**Example:**
```bash
node tools/ai/lm-studio-cli.js npc "Create a mysterious space trader who sells rare weapons"
```

### Quest Designer
- Designs missions and objectives
- Creates engaging challenges
- Generates meaningful rewards

**Example:**
```bash
node tools/ai/lm-studio-cli.js quest "Design a resource gathering mission on Venus"
```

### Story Generator
- Creates narrative content
- Generates lore and world-building
- Designs compelling stories

**Example:**
```bash
node tools/ai/lm-studio-cli.js story "Create lore for a new planet with ancient ruins"
```

### Event Planner
- Plans special game events
- Designs tournaments and challenges
- Creates community activities

**Example:**
```bash
node tools/ai/lm-studio-cli.js event "Plan a weekend capture-the-flag tournament"
```

### Balance Advisor
- Analyzes game mechanics
- Suggests balance improvements
- Reviews player feedback

**Example:**
```bash
node tools/ai/lm-studio-cli.js balance "Analyze weapon balance and suggest improvements"
```

## 📊 Output Format

The CLI returns JSON responses for easy server integration:

```json
{
  "success": true,
  "command": "scenario",
  "scenario": "Game Master",
  "responseTime": 1250,
  "content": "Here's a dynamic meteor shower event for Mars...",
  "timestamp": "2024-12-19T15:30:00.000Z"
}
```

## 🔧 Configuration

### Server Settings
- `serverUrl`: LM Studio server URL (default: `http://localhost:1234`)
- `apiEndpoint`: API endpoint (default: `/v1/chat/completions`)
- `timeout`: Request timeout in milliseconds (default: 10000)

### Model Settings
- `defaultModel`: Model name to use (default: `llama-2-7b-chat`)
- `maxTokens`: Maximum response length (default: 500)
- `temperature`: Creativity level 0.0-1.0 (default: 0.7)

### Custom Scenarios
Add new scenarios to `lm-studio-config.json`:

```json
{
  "scenarios": {
    "customScenario": {
      "name": "Custom Scenario",
      "description": "Description of the scenario",
      "systemPrompt": "You are an AI that...",
      "examples": ["Example 1", "Example 2"]
    }
  }
}
```

## 📈 Performance Monitoring

### Test Results
The consolidated test suite provides comprehensive performance analysis:

- **Response Time Tracking**: Monitor average response times
- **Success Rate Analysis**: Track test pass/fail rates
- **Performance Recommendations**: Automatic suggestions for optimization
- **Scenario Testing**: Verify all AI scenarios work correctly

### Performance Benchmarks
- **Excellent**: <3 seconds average response time
- **Good**: 3-5 seconds average response time
- **Moderate**: 5-10 seconds average response time
- **Slow**: >10 seconds average response time (recommend smaller model)

## 🛠️ Troubleshooting

### Common Issues

1. **Server Not Running**
   - Ensure LM Studio is started
   - Check server URL in configuration
   - Verify port 1234 is available

2. **Slow Response Times**
   - Use the optimized 8B model
   - Reduce max_tokens in configuration
   - Check system resources

3. **Model Not Found**
   - Download the correct model
   - Check model name in configuration
   - Verify model is loaded in LM Studio

4. **Connection Errors**
   - Check firewall settings
   - Verify network connectivity
   - Test with the consolidated test suite

### Getting Help

1. **Run the test suite**: `node tools/ai/ai-test-suite.js`
2. **Check configuration**: Verify `lm-studio-config.json`
3. **Test connectivity**: Use the HTTP test in the test suite
4. **Monitor performance**: Check response times and success rates

## 📚 Additional Resources

- **LM Studio Documentation**: [https://lmstudio.ai/docs](https://lmstudio.ai/docs)
- **Model Repository**: [https://huggingface.co/models](https://huggingface.co/models)
- **Performance Guide**: See optimization section above
- **Test Suite**: Use `ai-test-suite.js` for comprehensive testing

---

*Last Updated: December 2024*  
*Version: 1.2.0 - Consolidated AI Tools* 