import axios from 'axios';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

export class AIModelRunner {
  constructor() {
    this.baseUrl = process.env.AI_MODEL_RUNNER_URL || 'http://localhost:8080';
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    this.loadedModels = new Map();
    this.modelConfigs = new Map();
  }

  async initialize() {
    try {
      // Test connection to Docker Model Runner
      const response = await this.client.get('/health');
      logger.info('AI Model Runner connection established', response.data);
      
      // Load default model configurations
      await this.loadModelConfigurations();
      
      return true;
    } catch (error) {
      logger.error('Failed to initialize AI Model Runner:', error.message);
      throw error;
    }
  }

  async loadModelConfigurations() {
    try {
      // Load predefined model configurations
      const configs = [
        {
          id: 'llama2-7b',
          name: 'Llama 2 7B',
          type: 'text-generation',
          parameters: {
            max_tokens: 2048,
            temperature: 0.7,
            top_p: 0.9
          },
          dockerImage: 'ghcr.io/ollama/ollama:latest'
        },
        {
          id: 'codellama-7b',
          name: 'Code Llama 7B',
          type: 'code-generation',
          parameters: {
            max_tokens: 4096,
            temperature: 0.3,
            top_p: 0.95
          },
          dockerImage: 'ghcr.io/ollama/ollama:latest'
        },
        {
          id: 'mistral-7b',
          name: 'Mistral 7B',
          type: 'text-generation',
          parameters: {
            max_tokens: 2048,
            temperature: 0.8,
            top_p: 0.9
          },
          dockerImage: 'ghcr.io/ollama/ollama:latest'
        }
      ];

      configs.forEach(config => {
        this.modelConfigs.set(config.id, config);
      });

      logger.info(`Loaded ${configs.length} model configurations`);
    } catch (error) {
      logger.error('Failed to load model configurations:', error);
    }
  }

  async listModels() {
    try {
      const response = await this.client.get('/models');
      const availableModels = response.data.models || [];
      
      // Merge with our configurations
      const models = availableModels.map(model => {
        const config = this.modelConfigs.get(model.id);
        return {
          ...model,
          ...config,
          isLoaded: this.loadedModels.has(model.id)
        };
      });

      return models;
    } catch (error) {
      logger.error('Failed to list models:', error);
      // Return configured models if API is unavailable
      return Array.from(this.modelConfigs.values()).map(config => ({
        ...config,
        isLoaded: false,
        status: 'unavailable'
      }));
    }
  }

  async loadModel(modelId) {
    try {
      const config = this.modelConfigs.get(modelId);
      if (!config) {
        throw new Error(`Model configuration not found: ${modelId}`);
      }

      logger.info(`Loading model: ${modelId}`);

      // Check if model is already loaded
      if (this.loadedModels.has(modelId)) {
        logger.info(`Model ${modelId} is already loaded`);
        return { success: true, modelId, status: 'already_loaded' };
      }

      // Load model via Docker Model Runner
      const response = await this.client.post('/models/load', {
        model_id: modelId,
        model_type: config.type,
        parameters: config.parameters
      });

      if (response.data.success) {
        this.loadedModels.set(modelId, {
          config,
          loadedAt: new Date(),
          status: 'loaded'
        });
        
        logger.info(`Model ${modelId} loaded successfully`);
        return { success: true, modelId, status: 'loaded' };
      } else {
        throw new Error(`Failed to load model: ${response.data.error}`);
      }
    } catch (error) {
      logger.error(`Failed to load model ${modelId}:`, error);
      throw error;
    }
  }

  async unloadModel(modelId) {
    try {
      logger.info(`Unloading model: ${modelId}`);

      const response = await this.client.post('/models/unload', {
        model_id: modelId
      });

      if (response.data.success) {
        this.loadedModels.delete(modelId);
        logger.info(`Model ${modelId} unloaded successfully`);
        return { success: true, modelId, status: 'unloaded' };
      } else {
        throw new Error(`Failed to unload model: ${response.data.error}`);
      }
    } catch (error) {
      logger.error(`Failed to unload model ${modelId}:`, error);
      throw error;
    }
  }

  async generateText(modelId, prompt, options = {}) {
    try {
      // Ensure model is loaded
      if (!this.loadedModels.has(modelId)) {
        await this.loadModel(modelId);
      }

      const config = this.modelConfigs.get(modelId);
      const parameters = {
        ...config.parameters,
        ...options
      };

      logger.info(`Generating text with model: ${modelId}`);

      const response = await this.client.post('/generate', {
        model_id: modelId,
        prompt,
        parameters
      });

      if (response.data.success) {
        return {
          success: true,
          text: response.data.text,
          metadata: {
            modelId,
            tokensUsed: response.data.tokens_used,
            generationTime: response.data.generation_time,
            parameters
          }
        };
      } else {
        throw new Error(`Generation failed: ${response.data.error}`);
      }
    } catch (error) {
      logger.error(`Text generation failed for model ${modelId}:`, error);
      throw error;
    }
  }

  async generateCode(modelId, prompt, language = 'javascript', options = {}) {
    try {
      // Use code-specific model if available
      const codeModelId = modelId.includes('code') ? modelId : 'codellama-7b';
      
      const enhancedPrompt = `Generate ${language} code for the following request:\n\n${prompt}\n\nProvide only the code without explanations:`;
      
      const result = await this.generateText(codeModelId, enhancedPrompt, {
        ...options,
        max_tokens: 4096,
        temperature: 0.3
      });

      return {
        ...result,
        language,
        code: result.text
      };
    } catch (error) {
      logger.error(`Code generation failed for model ${modelId}:`, error);
      throw error;
    }
  }

  async analyzeIssue(issue, modelId = 'llama2-7b') {
    try {
      const prompt = `Analyze the following GitHub issue and provide a structured analysis:

Issue Title: ${issue.title}
Issue Body: ${issue.body}
Labels: ${issue.labels?.map(l => l.name).join(', ') || 'None'}
Comments: ${issue.comments || 0}

Please provide analysis in the following JSON format:
{
  "priority": "high|medium|low",
  "complexity": "high|medium|low", 
  "category": "bug|feature|enhancement|documentation",
  "estimatedTime": "time estimate",
  "technicalRequirements": ["requirement1", "requirement2"],
  "dependencies": ["dependency1", "dependency2"],
  "risks": ["risk1", "risk2"],
  "recommendations": ["recommendation1", "recommendation2"]
}`;

      const result = await this.generateText(modelId, prompt, {
        temperature: 0.3,
        max_tokens: 1024
      });

      try {
        const analysis = JSON.parse(result.text);
        return {
          success: true,
          analysis,
          metadata: result.metadata
        };
      } catch (parseError) {
        logger.warn('Failed to parse AI analysis as JSON, returning raw text');
        return {
          success: true,
          analysis: { rawResponse: result.text },
          metadata: result.metadata
        };
      }
    } catch (error) {
      logger.error('Issue analysis failed:', error);
      throw error;
    }
  }

  async generateSolution(issue, analysis, modelId = 'codellama-7b') {
    try {
      const prompt = `Based on the following issue analysis, generate a solution:

Issue: ${issue.title}
${issue.body}

Analysis: ${JSON.stringify(analysis, null, 2)}

Generate a solution that includes:
1. Implementation approach
2. Code changes needed
3. Testing strategy
4. Deployment considerations

Provide the solution in a structured format.`;

      const result = await this.generateText(modelId, prompt, {
        temperature: 0.4,
        max_tokens: 2048
      });

      return {
        success: true,
        solution: result.text,
        metadata: result.metadata
      };
    } catch (error) {
      logger.error('Solution generation failed:', error);
      throw error;
    }
  }

  async getModelStatus(modelId) {
    try {
      const response = await this.client.get(`/models/${modelId}/status`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get model status for ${modelId}:`, error);
      return {
        model_id: modelId,
        status: 'unknown',
        error: error.message
      };
    }
  }

  async getHealth() {
    try {
      const response = await this.client.get('/health');
      return {
        status: 'healthy',
        details: response.data
      };
    } catch (error) {
      logger.error('AI Model Runner health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  getLoadedModels() {
    return Array.from(this.loadedModels.keys());
  }

  isModelLoaded(modelId) {
    return this.loadedModels.has(modelId);
  }
} 