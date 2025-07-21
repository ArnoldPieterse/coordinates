/**
 * Project Objectives and Relativity Rating System
 * Manages project objectives and calculates task relativity ratings
 */

export class ProjectObjectives {
  constructor() {
    this.objectives = [
      {
        id: 'core_gameplay',
        name: 'Core Gameplay Functionality',
        priority: 10,
        weight: 0.25,
        criteria: ['multiplayer', 'combat', 'physics', 'planets']
      },
      {
        id: 'ai_integration',
        name: 'AI System Integration',
        priority: 9,
        weight: 0.20,
        criteria: ['neural_networks', 'agent_coordination', 'llm_integration']
      },
      {
        id: 'graphics_quality',
        name: 'Crysis-Level Graphics',
        priority: 8,
        weight: 0.15,
        criteria: ['pbr_materials', 'lighting', 'post_processing', 'performance']
      },
      {
        id: 'procedural_generation',
        name: 'Procedural Content Generation',
        priority: 7,
        weight: 0.15,
        criteria: ['tree_generation', 'world_generation', 'variety']
      },
      {
        id: 'performance_optimization',
        name: 'Performance Optimization',
        priority: 6,
        weight: 0.10,
        criteria: ['fps', 'memory', 'loading', 'scalability']
      },
      {
        id: 'deployment_ready',
        name: 'Production Deployment',
        priority: 5,
        weight: 0.10,
        criteria: ['aws', 'scalability', 'monitoring', 'reliability']
      },
      {
        id: 'user_experience',
        name: 'User Experience',
        priority: 4,
        weight: 0.05,
        criteria: ['ui', 'accessibility', 'documentation', 'onboarding']
      }
    ];
    
    this.currentFocus = 'core_gameplay'; // Current primary objective
    this.relativityThreshold = 0.3; // Minimum rating to execute tasks
    this.memoryRelevanceThreshold = 0.2; // Minimum rating to retrieve memory
  }

  calculateTaskRelativity(task, context = {}) {
    let totalScore = 0;
    let maxPossibleScore = 0;

    for (const objective of this.objectives) {
      const objectiveScore = this.evaluateTaskAgainstObjective(task, objective, context);
      const weightedScore = objectiveScore * objective.weight;
      
      totalScore += weightedScore;
      maxPossibleScore += objective.weight;
    }

    // Normalize to 0-1 scale
    const relativityRating = totalScore / maxPossibleScore;
    
    return {
      rating: relativityRating,
      breakdown: this.objectives.map(obj => ({
        objective: obj.name,
        score: this.evaluateTaskAgainstObjective(task, obj, context),
        weight: obj.weight,
        contribution: this.evaluateTaskAgainstObjective(task, obj, context) * obj.weight
      })),
      shouldExecute: relativityRating >= this.relativityThreshold,
      priority: this.calculatePriorityLevel(relativityRating)
    };
  }

  evaluateTaskAgainstObjective(task, objective, context) {
    const taskKeywords = this.extractKeywords(task);
    const contextKeywords = this.extractKeywords(context);
    const allKeywords = [...taskKeywords, ...contextKeywords];
    
    let score = 0;
    let matches = 0;

    for (const criterion of objective.criteria) {
      for (const keyword of allKeywords) {
        if (this.keywordMatches(keyword, criterion)) {
          matches++;
          score += 1;
        }
      }
    }

    // Bonus for current focus objective
    if (objective.id === this.currentFocus) {
      score *= 1.5;
    }

    // Normalize score
    return Math.min(score / objective.criteria.length, 1.0);
  }

  extractKeywords(input) {
    if (typeof input === 'string') {
      return input.toLowerCase().split(/\s+/);
    } else if (typeof input === 'object') {
      const keywords = [];
      for (const [key, value] of Object.entries(input)) {
        keywords.push(key.toLowerCase());
        if (typeof value === 'string') {
          keywords.push(...value.toLowerCase().split(/\s+/));
        }
      }
      return keywords;
    }
    return [];
  }

  keywordMatches(keyword, criterion) {
    return keyword.includes(criterion) || criterion.includes(keyword);
  }

  calculatePriorityLevel(rating) {
    if (rating >= 0.8) return 'critical';
    if (rating >= 0.6) return 'high';
    if (rating >= 0.4) return 'medium';
    if (rating >= 0.2) return 'low';
    return 'minimal';
  }

  calculateMemoryRelevance(memoryKey, currentContext) {
    const memoryKeywords = this.extractKeywords(memoryKey);
    const contextKeywords = this.extractKeywords(currentContext);
    
    let relevanceScore = 0;
    let totalComparisons = 0;

    for (const memoryKeyword of memoryKeywords) {
      for (const contextKeyword of contextKeywords) {
        totalComparisons++;
        if (this.keywordMatches(memoryKeyword, contextKeyword)) {
          relevanceScore += 1;
        }
      }
    }

    const relevanceRating = totalComparisons > 0 ? relevanceScore / totalComparisons : 0;
    
    return {
      rating: relevanceRating,
      shouldRetrieve: relevanceRating >= this.memoryRelevanceThreshold,
      priority: this.calculatePriorityLevel(relevanceRating)
    };
  }

  updateCurrentFocus(newFocus) {
    if (this.objectives.find(obj => obj.id === newFocus)) {
      this.currentFocus = newFocus;
      console.log(`🎯 Project focus updated to: ${newFocus}`);
    }
  }

  getObjectiveStatus() {
    return {
      currentFocus: this.currentFocus,
      objectives: this.objectives,
      thresholds: {
        taskExecution: this.relativityThreshold,
        memoryRetrieval: this.memoryRelevanceThreshold
      }
    };
  }
} 