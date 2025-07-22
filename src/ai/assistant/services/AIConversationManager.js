import { v4 as uuidv4 } from 'uuid';
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

export class AIConversationManager {
  constructor(aiModelRunner, redisManager) {
    this.aiModelRunner = aiModelRunner;
    this.redisManager = redisManager;
    this.sessions = new Map();
    this.conversationHistory = new Map();
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
  }

  async processMessage(message, sessionId, context = {}) {
    try {
      const startTime = Date.now();
      
      // Get or create session
      let session = await this.getSession(sessionId);
      if (!session) {
        session = await this.createSession(sessionId, context);
      }

      // Update session activity
      session.lastActivity = new Date();
      session.messageCount = (session.messageCount || 0) + 1;

      // Add message to conversation history
      const messageId = uuidv4();
      const messageRecord = {
        id: messageId,
        sessionId,
        content: message,
        timestamp: new Date(),
        type: 'user',
        context
      };

      await this.addMessageToHistory(sessionId, messageRecord);

      // Determine appropriate model based on context
      const modelId = this.selectModel(message, context);
      
      // Generate AI response
      const aiResponse = await this.generateResponse(message, session, modelId, context);
      
      // Add AI response to history
      const aiMessageRecord = {
        id: uuidv4(),
        sessionId,
        content: aiResponse.content,
        timestamp: new Date(),
        type: 'ai',
        metadata: aiResponse.metadata,
        modelId
      };

      await this.addMessageToHistory(sessionId, aiMessageRecord);

      // Update session
      session.lastResponse = aiResponse.content;
      session.lastModelUsed = modelId;
      session.responseCount = (session.responseCount || 0) + 1;
      
      await this.updateSession(sessionId, session);

      const processingTime = Date.now() - startTime;
      
      logger.info(`Message processed in ${processingTime}ms`, {
        sessionId,
        messageLength: message.length,
        modelId,
        processingTime
      });

      return {
        content: aiResponse.content,
        metadata: {
          ...aiResponse.metadata,
          sessionId,
          messageId: aiMessageRecord.id,
          processingTime,
          modelId
        }
      };

    } catch (error) {
      logger.error('Error processing message:', error);
      throw error;
    }
  }

  selectModel(message, context) {
    // Determine the best model based on message content and context
    const lowerMessage = message.toLowerCase();
    
    // Code-related queries
    if (lowerMessage.includes('code') || 
        lowerMessage.includes('function') || 
        lowerMessage.includes('class') ||
        lowerMessage.includes('bug') ||
        lowerMessage.includes('fix') ||
        lowerMessage.includes('implement')) {
      return 'codellama-7b';
    }
    
    // Issue analysis
    if (lowerMessage.includes('issue') || 
        lowerMessage.includes('problem') || 
        lowerMessage.includes('analyze') ||
        lowerMessage.includes('review')) {
      return 'llama2-7b';
    }
    
    // General conversation
    return 'mistral-7b';
  }

  async generateResponse(message, session, modelId, context) {
    try {
      // Get conversation history for context
      const history = await this.getConversationHistory(session.id);
      const recentHistory = history.slice(-10); // Last 10 messages for context
      
      // Build context-aware prompt
      const prompt = this.buildPrompt(message, recentHistory, context);
      
      // Generate response using AI model
      const result = await this.aiModelRunner.generateText(modelId, prompt, {
        temperature: 0.7,
        max_tokens: 1024
      });

      return {
        content: result.text,
        metadata: result.metadata
      };

    } catch (error) {
      logger.error('Error generating AI response:', error);
      
      // Fallback response
      return {
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        metadata: {
          error: error.message,
          fallback: true
        }
      };
    }
  }

  buildPrompt(message, history, context) {
    let prompt = "You are an AI assistant integrated with the Coordinates project. ";
    
    // Add context information
    if (context.project) {
      prompt += `You're working on the ${context.project} project. `;
    }
    
    if (context.role) {
      prompt += `You're acting as a ${context.role}. `;
    }

    // Add conversation history for context
    if (history.length > 0) {
      prompt += "\n\nRecent conversation:\n";
      history.forEach(msg => {
        const role = msg.type === 'user' ? 'User' : 'Assistant';
        prompt += `${role}: ${msg.content}\n`;
      });
    }

    // Add current message
    prompt += `\nUser: ${message}\nAssistant:`;

    return prompt;
  }

  async createSession(sessionId, context = {}) {
    const session = {
      id: sessionId,
      createdAt: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      responseCount: 0,
      context,
      status: 'active'
    };

    // Store in memory
    this.sessions.set(sessionId, session);
    
    // Store in Redis for persistence
    if (this.redisManager) {
      await this.redisManager.set(`session:${sessionId}`, JSON.stringify(session), 1800); // 30 minutes
    }

    logger.info(`Created new session: ${sessionId}`);
    return session;
  }

  async getSession(sessionId) {
    // Check memory first
    if (this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId);
    }

    // Check Redis
    if (this.redisManager) {
      try {
        const sessionData = await this.redisManager.get(`session:${sessionId}`);
        if (sessionData) {
          const session = JSON.parse(sessionData);
          this.sessions.set(sessionId, session);
          return session;
        }
      } catch (error) {
        logger.error(`Error retrieving session ${sessionId}:`, error);
      }
    }

    return null;
  }

  async updateSession(sessionId, session) {
    // Update memory
    this.sessions.set(sessionId, session);
    
    // Update Redis
    if (this.redisManager) {
      await this.redisManager.set(`session:${sessionId}`, JSON.stringify(session), 1800);
    }
  }

  async deleteSession(sessionId) {
    // Remove from memory
    this.sessions.delete(sessionId);
    this.conversationHistory.delete(sessionId);
    
    // Remove from Redis
    if (this.redisManager) {
      await this.redisManager.del(`session:${sessionId}`);
      await this.redisManager.del(`history:${sessionId}`);
    }

    logger.info(`Deleted session: ${sessionId}`);
  }

  async addMessageToHistory(sessionId, message) {
    // Add to memory
    if (!this.conversationHistory.has(sessionId)) {
      this.conversationHistory.set(sessionId, []);
    }
    this.conversationHistory.get(sessionId).push(message);
    
    // Keep only last 50 messages in memory
    const history = this.conversationHistory.get(sessionId);
    if (history.length > 50) {
      this.conversationHistory.set(sessionId, history.slice(-50));
    }
    
    // Store in Redis
    if (this.redisManager) {
      await this.redisManager.lpush(`history:${sessionId}`, JSON.stringify(message));
      await this.redisManager.ltrim(`history:${sessionId}`, 0, 49); // Keep only last 50
      await this.redisManager.expire(`history:${sessionId}`, 3600); // 1 hour
    }
  }

  async getConversationHistory(sessionId) {
    // Check memory first
    if (this.conversationHistory.has(sessionId)) {
      return this.conversationHistory.get(sessionId);
    }

    // Check Redis
    if (this.redisManager) {
      try {
        const historyData = await this.redisManager.lrange(`history:${sessionId}`, 0, -1);
        const history = historyData.map(item => JSON.parse(item)).reverse();
        this.conversationHistory.set(sessionId, history);
        return history;
      } catch (error) {
        logger.error(`Error retrieving history for session ${sessionId}:`, error);
      }
    }

    return [];
  }

  async cleanupExpiredSessions() {
    const now = new Date();
    const expiredSessions = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      const timeSinceActivity = now - new Date(session.lastActivity);
      if (timeSinceActivity > this.sessionTimeout) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      await this.deleteSession(sessionId);
    }

    if (expiredSessions.length > 0) {
      logger.info(`Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  async getSessionStats(sessionId) {
    const session = await this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const history = await this.getConversationHistory(sessionId);
    const userMessages = history.filter(msg => msg.type === 'user');
    const aiMessages = history.filter(msg => msg.type === 'ai');

    return {
      sessionId,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      totalMessages: history.length,
      userMessages: userMessages.length,
      aiMessages: aiMessages.length,
      averageResponseTime: this.calculateAverageResponseTime(history),
      modelsUsed: this.getModelsUsed(history)
    };
  }

  calculateAverageResponseTime(history) {
    let totalTime = 0;
    let responseCount = 0;

    for (let i = 0; i < history.length - 1; i++) {
      const currentMsg = history[i];
      const nextMsg = history[i + 1];

      if (currentMsg.type === 'user' && nextMsg.type === 'ai') {
        const responseTime = new Date(nextMsg.timestamp) - new Date(currentMsg.timestamp);
        totalTime += responseTime;
        responseCount++;
      }
    }

    return responseCount > 0 ? totalTime / responseCount : 0;
  }

  getModelsUsed(history) {
    const models = new Set();
    history.forEach(msg => {
      if (msg.metadata && msg.metadata.modelId) {
        models.add(msg.metadata.modelId);
      }
    });
    return Array.from(models);
  }

  async getAllSessions() {
    const sessions = [];
    
    // Get from memory
    for (const [sessionId, session] of this.sessions.entries()) {
      sessions.push({
        id: sessionId,
        ...session
      });
    }

    // Get from Redis if not in memory
    if (this.redisManager) {
      try {
        const keys = await this.redisManager.keys('session:*');
        for (const key of keys) {
          const sessionId = key.replace('session:', '');
          if (!this.sessions.has(sessionId)) {
            const sessionData = await this.redisManager.get(key);
            if (sessionData) {
              const session = JSON.parse(sessionData);
              sessions.push({
                id: sessionId,
                ...session
              });
            }
          }
        }
      } catch (error) {
        logger.error('Error retrieving all sessions:', error);
      }
    }

    return sessions;
  }
} 