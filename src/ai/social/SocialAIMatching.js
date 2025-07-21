/**
 * Social AI Matching System
 * AI-powered system for connecting like-minded people with shared AI sessions
 * Users can advertise needs/abilities and get actionable suggestions
 */

export class SocialAIMatching {
  constructor(config = {}) {
    this.config = {
      maxSessionSize: config.maxSessionSize || 5,
      matchingThreshold: config.matchingThreshold || 0.7,
      sessionTimeout: config.sessionTimeout || 30 * 60 * 1000, // 30 minutes
      ...config
    };

    this.users = new Map();
    this.sessions = new Map();
    this.needs = new Map();
    this.abilities = new Map();
    this.matches = new Map();
    this.conversations = new Map();
  }

  // User profile management
  createUserProfile(userId, profile) {
    const userProfile = {
      id: userId,
      name: profile.name || 'Anonymous',
      avatar: profile.avatar || null,
      needs: profile.needs || [],
      abilities: profile.abilities || [],
      interests: profile.interests || [],
      availability: profile.availability || 'flexible',
      location: profile.location || null,
      timezone: profile.timezone || 'UTC',
      rating: 0,
      connections: 0,
      createdAt: Date.now(),
      lastActive: Date.now(),
      preferences: {
        sessionSize: profile.preferences?.sessionSize || 3,
        matchingFrequency: profile.preferences?.matchingFrequency || 'daily',
        privacyLevel: profile.preferences?.privacyLevel || 'public'
      }
    };

    this.users.set(userId, userProfile);
    
    // Index needs and abilities
    this.indexUserNeeds(userId, userProfile.needs);
    this.indexUserAbilities(userId, userProfile.abilities);

    return userProfile;
  }

  // Index user needs for matching
  indexUserNeeds(userId, needs) {
    needs.forEach(need => {
      if (!this.needs.has(need.category)) {
        this.needs.set(need.category, new Map());
      }
      
      const needEntry = {
        userId,
        category: need.category,
        description: need.description,
        urgency: need.urgency || 'normal',
        budget: need.budget || null,
        timeline: need.timeline || 'flexible',
        createdAt: Date.now()
      };

      this.needs.get(need.category).set(userId, needEntry);
    });
  }

  // Index user abilities for matching
  indexUserAbilities(userId, abilities) {
    abilities.forEach(ability => {
      if (!this.abilities.has(ability.category)) {
        this.abilities.set(ability.category, new Map());
      }
      
      const abilityEntry = {
        userId,
        category: ability.category,
        description: ability.description,
        experience: ability.experience || 'intermediate',
        rate: ability.rate || null,
        availability: ability.availability || 'flexible',
        portfolio: ability.portfolio || null,
        createdAt: Date.now()
      };

      this.abilities.get(ability.category).set(userId, abilityEntry);
    });
  }

  // Find matches for a user
  findMatches(userId) {
    const user = this.users.get(userId);
    if (!user) return [];

    const matches = [];

    // Find users who can help with this user's needs
    user.needs.forEach(need => {
      const potentialHelpers = this.abilities.get(need.category);
      if (potentialHelpers) {
        potentialHelpers.forEach((ability, helperId) => {
          if (helperId !== userId) {
            const helper = this.users.get(helperId);
            const matchScore = this.calculateMatchScore(user, helper, need, ability);
            
            if (matchScore >= this.config.matchingThreshold) {
              matches.push({
                type: 'need-fulfillment',
                userId: helperId,
                user: helper,
                need: need,
                ability: ability,
                score: matchScore,
                reason: `Can help with ${need.category}`,
                suggestions: this.generateSuggestions(user, helper, need, ability)
              });
            }
          }
        });
      }
    });

    // Find users who need this user's abilities
    user.abilities.forEach(ability => {
      const potentialClients = this.needs.get(ability.category);
      if (potentialClients) {
        potentialClients.forEach((need, clientId) => {
          if (clientId !== userId) {
            const client = this.users.get(clientId);
            const matchScore = this.calculateMatchScore(client, user, need, ability);
            
            if (matchScore >= this.config.matchingThreshold) {
              matches.push({
                type: 'ability-utilization',
                userId: clientId,
                user: client,
                need: need,
                ability: ability,
                score: matchScore,
                reason: `Needs help with ${ability.category}`,
                suggestions: this.generateSuggestions(client, user, need, ability)
              });
            }
          }
        });
      }
    });

    // Find users with similar interests
    const interestMatches = this.findInterestMatches(user);
    matches.push(...interestMatches);

    return matches.sort((a, b) => b.score - a.score);
  }

  // Calculate match score between users
  calculateMatchScore(user1, user2, need, ability) {
    let score = 0;

    // Category match (highest weight)
    if (need.category === ability.category) {
      score += 0.4;
    }

    // Experience level match
    const experienceMatch = this.calculateExperienceMatch(need, ability);
    score += experienceMatch * 0.2;

    // Budget compatibility
    const budgetMatch = this.calculateBudgetMatch(need, ability);
    score += budgetMatch * 0.15;

    // Timeline compatibility
    const timelineMatch = this.calculateTimelineMatch(need, ability);
    score += timelineMatch * 0.1;

    // Interest overlap
    const interestOverlap = this.calculateInterestOverlap(user1, user2);
    score += interestOverlap * 0.1;

    // Availability match
    const availabilityMatch = this.calculateAvailabilityMatch(user1, user2);
    score += availabilityMatch * 0.05;

    return Math.min(1, score);
  }

  // Calculate experience level match
  calculateExperienceMatch(need, ability) {
    const experienceLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const needLevel = need.experience || 'intermediate';
    const abilityLevel = ability.experience || 'intermediate';

    const needIndex = experienceLevels.indexOf(needLevel);
    const abilityIndex = experienceLevels.indexOf(abilityLevel);

    // Perfect match
    if (needIndex === abilityIndex) return 1;
    
    // Ability level higher than need (good)
    if (abilityIndex > needIndex) return 0.8;
    
    // Ability level lower than need (not ideal)
    return Math.max(0, 1 - (needIndex - abilityIndex) * 0.3);
  }

  // Calculate budget compatibility
  calculateBudgetMatch(need, ability) {
    if (!need.budget || !ability.rate) return 0.5; // Neutral if not specified

    const budgetRange = this.parseBudget(need.budget);
    const rateRange = this.parseBudget(ability.rate);

    if (budgetRange.max >= rateRange.min && budgetRange.min <= rateRange.max) {
      return 1; // Overlapping ranges
    }

    return 0; // No overlap
  }

  // Parse budget/rate strings
  parseBudget(budget) {
    if (typeof budget === 'string') {
      const numbers = budget.match(/\d+/g);
      if (numbers.length >= 2) {
        return { min: parseInt(numbers[0]), max: parseInt(numbers[1]) };
      } else if (numbers.length === 1) {
        return { min: parseInt(numbers[0]), max: parseInt(numbers[0]) };
      }
    }
    return { min: 0, max: 0 };
  }

  // Calculate timeline compatibility
  calculateTimelineMatch(need, ability) {
    const timelines = ['urgent', 'asap', 'flexible', 'long-term'];
    const needTimeline = need.timeline || 'flexible';
    const abilityTimeline = ability.availability || 'flexible';

    if (needTimeline === abilityTimeline) return 1;
    if (needTimeline === 'flexible' || abilityTimeline === 'flexible') return 0.8;
    return 0.3;
  }

  // Calculate interest overlap
  calculateInterestOverlap(user1, user2) {
    const interests1 = new Set(user1.interests);
    const interests2 = new Set(user2.interests);
    
    const intersection = new Set([...interests1].filter(x => interests2.has(x)));
    const union = new Set([...interests1, ...interests2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  // Calculate availability match
  calculateAvailabilityMatch(user1, user2) {
    if (user1.availability === user2.availability) return 1;
    if (user1.availability === 'flexible' || user2.availability === 'flexible') return 0.8;
    return 0.3;
  }

  // Find users with similar interests
  findInterestMatches(user) {
    const matches = [];
    const userInterests = new Set(user.interests);

    this.users.forEach((otherUser, otherId) => {
      if (otherId === user.id) return;

      const overlap = this.calculateInterestOverlap(user, otherUser);
      if (overlap >= 0.3) { // At least 30% interest overlap
        matches.push({
          type: 'interest-match',
          userId: otherId,
          user: otherUser,
          score: overlap,
          reason: `Shares ${Math.round(overlap * 100)}% of your interests`,
          suggestions: this.generateInterestSuggestions(user, otherUser)
        });
      }
    });

    return matches;
  }

  // Generate actionable suggestions
  generateSuggestions(user1, user2, need, ability) {
    const suggestions = [];

    // Connection suggestions
    suggestions.push({
      type: 'connection',
      action: 'Connect with this person',
      description: `Reach out to ${user2.name} about ${need.category}`,
      priority: 'high'
    });

    // Meeting suggestions
    suggestions.push({
      type: 'meeting',
      action: 'Schedule a meeting',
      description: `Set up a call to discuss ${need.description}`,
      priority: 'medium'
    });

    // Project suggestions
    if (need.timeline === 'long-term') {
      suggestions.push({
        type: 'project',
        action: 'Start a project',
        description: `Begin working on ${need.category} together`,
        priority: 'medium'
      });
    }

    // Learning suggestions
    if (user1.interests.includes('learning') || user2.interests.includes('teaching')) {
      suggestions.push({
        type: 'learning',
        action: 'Request mentorship',
        description: `Ask ${user2.name} to mentor you in ${ability.category}`,
        priority: 'low'
      });
    }

    return suggestions;
  }

  // Generate interest-based suggestions
  generateInterestSuggestions(user1, user2) {
    const suggestions = [];
    const commonInterests = user1.interests.filter(interest => 
      user2.interests.includes(interest)
    );

    commonInterests.forEach(interest => {
      suggestions.push({
        type: 'interest',
        action: `Discuss ${interest}`,
        description: `Share knowledge and experiences about ${interest}`,
        priority: 'medium'
      });
    });

    return suggestions;
  }

  // Create shared AI session
  createSharedSession(userIds, topic) {
    const sessionId = 'session-' + Date.now();
    
    const session = {
      id: sessionId,
      participants: userIds,
      topic: topic,
      status: 'active',
      createdAt: Date.now(),
      lastActivity: Date.now(),
      messages: [],
      aiContext: {
        topic: topic,
        participants: userIds.map(id => this.users.get(id)),
        suggestions: [],
        insights: []
      }
    };

    this.sessions.set(sessionId, session);
    
    // Initialize conversation
    this.conversations.set(sessionId, {
      messages: [],
      aiSuggestions: [],
      sharedInsights: []
    });

    return session;
  }

  // Add message to shared session
  addMessage(sessionId, userId, message) {
    const session = this.sessions.get(sessionId);
    const conversation = this.conversations.get(sessionId);
    
    if (!session || !conversation) return null;

    const messageObj = {
      id: 'msg-' + Date.now(),
      userId,
      user: this.users.get(userId),
      content: message,
      timestamp: Date.now(),
      type: 'user'
    };

    session.messages.push(messageObj);
    conversation.messages.push(messageObj);
    session.lastActivity = Date.now();

    // Generate AI response and suggestions
    const aiResponse = this.generateAIResponse(session, messageObj);
    if (aiResponse) {
      session.messages.push(aiResponse);
      conversation.messages.push(aiResponse);
    }

    return messageObj;
  }

  // Generate AI response for shared session
  generateAIResponse(session, userMessage) {
    const participants = session.participants.map(id => this.users.get(id));
    const context = this.buildAIContext(session, participants, userMessage);

    // Generate AI response based on context
    const response = {
      id: 'ai-' + Date.now(),
      userId: 'ai',
      user: { name: 'AI Assistant', avatar: '🤖' },
      content: this.generateResponseContent(context),
      timestamp: Date.now(),
      type: 'ai',
      suggestions: this.generateSessionSuggestions(context)
    };

    return response;
  }

  // Build AI context for response generation
  buildAIContext(session, participants, userMessage) {
    return {
      topic: session.topic,
      participants: participants.map(p => ({
        name: p.name,
        needs: p.needs,
        abilities: p.abilities,
        interests: p.interests
      })),
      recentMessages: session.messages.slice(-5),
      userMessage: userMessage.content,
      sessionDuration: Date.now() - session.createdAt
    };
  }

  // Generate response content
  generateResponseContent(context) {
    const { topic, participants, userMessage } = context;
    
    // Analyze message and generate appropriate response
    if (userMessage.toLowerCase().includes('help') || userMessage.toLowerCase().includes('need')) {
      return this.generateHelpResponse(participants, topic);
    } else if (userMessage.toLowerCase().includes('suggest') || userMessage.toLowerCase().includes('idea')) {
      return this.generateSuggestionResponse(participants, topic);
    } else if (userMessage.toLowerCase().includes('connect') || userMessage.toLowerCase().includes('meet')) {
      return this.generateConnectionResponse(participants);
    } else {
      return this.generateGeneralResponse(participants, topic);
    }
  }

  // Generate help-focused response
  generateHelpResponse(participants, topic) {
    const needs = participants.flatMap(p => p.needs);
    const abilities = participants.flatMap(p => p.abilities);
    
    const relevantAbilities = abilities.filter(ability => 
      needs.some(need => need.category === ability.category)
    );

    if (relevantAbilities.length > 0) {
      return `I can see several opportunities for collaboration here! ${participants[0].name} has skills in ${relevantAbilities[0].category} that could help with ${topic}. Would you like me to suggest some specific ways to work together?`;
    } else {
      return `I'm analyzing your needs and abilities to find the best ways to help each other. Let me know more about what you're looking to achieve with ${topic}.`;
    }
  }

  // Generate suggestion-focused response
  generateSuggestionResponse(participants, topic) {
    const suggestions = [
      `Based on your shared interests, you could collaborate on a ${topic} project together.`,
      `I suggest setting up a regular meeting to discuss ${topic} and share insights.`,
      `Consider creating a shared workspace to collaborate on ${topic} more effectively.`,
      `You might benefit from a skill exchange - teaching each other your respective strengths.`
    ];

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }

  // Generate connection-focused response
  generateConnectionResponse(participants) {
    return `Great idea! I can help facilitate connections between you. ${participants[0].name} and ${participants[1].name}, you have complementary skills that could work well together. Would you like me to suggest some next steps for collaboration?`;
  }

  // Generate general response
  generateGeneralResponse(participants, topic) {
    return `I'm here to help facilitate meaningful connections and collaborations around ${topic}. Feel free to ask for suggestions, share your needs, or discuss how you can work together!`;
  }

  // Generate session suggestions
  generateSessionSuggestions(context) {
    const suggestions = [];

    // Connection suggestions
    suggestions.push({
      type: 'action',
      title: 'Schedule Follow-up',
      description: 'Set up a recurring meeting',
      action: 'schedule_meeting'
    });

    // Collaboration suggestions
    suggestions.push({
      type: 'action',
      title: 'Start Project',
      description: 'Begin working together',
      action: 'start_project'
    });

    // Resource suggestions
    suggestions.push({
      type: 'action',
      title: 'Share Resources',
      description: 'Exchange helpful materials',
      action: 'share_resources'
    });

    return suggestions;
  }

  // Get session statistics
  getSessionStats(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return {
      participants: session.participants.length,
      messages: session.messages.length,
      duration: Date.now() - session.createdAt,
      suggestions: session.aiContext.suggestions.length,
      insights: session.aiContext.insights.length
    };
  }

  // Get user statistics
  getUserStats(userId) {
    const user = this.users.get(userId);
    if (!user) return null;

    const userSessions = Array.from(this.sessions.values())
      .filter(s => s.participants.includes(userId));

    const matches = this.findMatches(userId);

    return {
      connections: user.connections,
      sessions: userSessions.length,
      matches: matches.length,
      rating: user.rating,
      activeTime: Date.now() - user.lastActive
    };
  }
}

export default SocialAIMatching; 