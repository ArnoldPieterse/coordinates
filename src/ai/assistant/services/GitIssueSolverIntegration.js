import winston from 'winston';
import { GitIssueSolverTeam } from '../../../personas/git-issue-solver/GitIssueSolverTeam.js';
import ServiceRegistry from '../../../core/DI/ServiceRegistry.js';

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

export class GitIssueSolverIntegration {
  constructor(conversationManager) {
    this.conversationManager = conversationManager;
    this.services = new ServiceRegistry();
    this.team = new GitIssueSolverTeam(this.services);
    this.activeIssues = new Map();
    this.issueHistory = new Map();
  }

  async processIssue(issue, action = 'analyze') {
    try {
      logger.info(`Processing issue #${issue.number} with action: ${action}`);

      // Register current issue in service registry
      this.services.container.register('currentIssue', () => issue, false);

      switch (action) {
        case 'analyze':
          return await this.analyzeIssue(issue);
        case 'solve':
          return await this.solveIssue(issue);
        case 'review':
          return await this.reviewIssue(issue);
        case 'test':
          return await this.testIssue(issue);
        case 'deploy':
          return await this.deployIssue(issue);
        case 'full-workflow':
          return await this.runFullWorkflow(issue);
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      logger.error(`Error processing issue #${issue.number}:`, error);
      throw error;
    }
  }

  async analyzeIssue(issue) {
    try {
      logger.info(`Starting analysis for issue #${issue.number}`);

      // Use AI to enhance the analysis
      const aiAnalysis = await this.conversationManager.aiModelRunner.analyzeIssue(issue);
      
      // Run the Issue Analyzer persona
      const analysis = await this.team.runAnalysisPhase(issue);

      // Combine AI analysis with persona analysis
      const enhancedAnalysis = {
        ...analysis,
        aiInsights: aiAnalysis.analysis,
        enhancedRecommendations: this.enhanceRecommendations(
          analysis.recommendations,
          aiAnalysis.analysis
        )
      };

      // Store analysis in history
      this.issueHistory.set(issue.number, {
        ...this.issueHistory.get(issue.number),
        analysis: enhancedAnalysis,
        lastUpdated: new Date()
      });

      return {
        success: true,
        action: 'analyze',
        issueNumber: issue.number,
        analysis: enhancedAnalysis,
        aiEnhanced: true
      };

    } catch (error) {
      logger.error(`Analysis failed for issue #${issue.number}:`, error);
      throw error;
    }
  }

  async solveIssue(issue) {
    try {
      logger.info(`Starting solution implementation for issue #${issue.number}`);

      // First analyze if not already done
      let analysis = this.issueHistory.get(issue.number)?.analysis;
      if (!analysis) {
        const analysisResult = await this.analyzeIssue(issue);
        analysis = analysisResult.analysis;
      }

      // Use AI to generate solution suggestions
      const aiSolution = await this.conversationManager.aiModelRunner.generateSolution(
        issue,
        analysis.aiInsights || analysis.data?.initialAssessment
      );

      // Run the Issue Solver persona
      const implementation = await this.team.runImplementationPhase(analysis);

      // Enhance implementation with AI suggestions
      const enhancedImplementation = {
        ...implementation,
        aiSuggestions: aiSolution.solution,
        enhancedCode: await this.enhanceCodeWithAI(implementation, aiSolution)
      };

      // Update history
      this.issueHistory.set(issue.number, {
        ...this.issueHistory.get(issue.number),
        implementation: enhancedImplementation,
        lastUpdated: new Date()
      });

      return {
        success: true,
        action: 'solve',
        issueNumber: issue.number,
        implementation: enhancedImplementation,
        aiEnhanced: true
      };

    } catch (error) {
      logger.error(`Solution implementation failed for issue #${issue.number}:`, error);
      throw error;
    }
  }

  async reviewIssue(issue) {
    try {
      logger.info(`Starting code review for issue #${issue.number}`);

      // Get previous phases
      const history = this.issueHistory.get(issue.number);
      if (!history?.implementation) {
        throw new Error('Implementation must be completed before review');
      }

      // Run the Code Reviewer persona
      const review = await this.team.runReviewPhase(history.implementation);

      // Use AI to enhance the review
      const aiReview = await this.enhanceReviewWithAI(history.implementation, review);

      const enhancedReview = {
        ...review,
        aiEnhancements: aiReview,
        securityScore: this.calculateSecurityScore(review, aiReview),
        qualityScore: this.calculateQualityScore(review, aiReview)
      };

      // Update history
      this.issueHistory.set(issue.number, {
        ...history,
        review: enhancedReview,
        lastUpdated: new Date()
      });

      return {
        success: true,
        action: 'review',
        issueNumber: issue.number,
        review: enhancedReview,
        aiEnhanced: true
      };

    } catch (error) {
      logger.error(`Code review failed for issue #${issue.number}:`, error);
      throw error;
    }
  }

  async testIssue(issue) {
    try {
      logger.info(`Starting testing for issue #${issue.number}`);

      // Get previous phases
      const history = this.issueHistory.get(issue.number);
      if (!history?.review) {
        throw new Error('Review must be completed before testing');
      }

      // Run the Testing Specialist persona
      const testing = await this.team.runTestingPhase(history.review);

      // Use AI to generate additional test cases
      const aiTests = await this.generateAITestCases(issue, history.implementation);

      const enhancedTesting = {
        ...testing,
        aiGeneratedTests: aiTests,
        testCoverage: this.calculateTestCoverage(testing, aiTests)
      };

      // Update history
      this.issueHistory.set(issue.number, {
        ...history,
        testing: enhancedTesting,
        lastUpdated: new Date()
      });

      return {
        success: true,
        action: 'test',
        issueNumber: issue.number,
        testing: enhancedTesting,
        aiEnhanced: true
      };

    } catch (error) {
      logger.error(`Testing failed for issue #${issue.number}:`, error);
      throw error;
    }
  }

  async deployIssue(issue) {
    try {
      logger.info(`Starting deployment for issue #${issue.number}`);

      // Get previous phases
      const history = this.issueHistory.get(issue.number);
      if (!history?.testing) {
        throw new Error('Testing must be completed before deployment');
      }

      // Run the Deployment Coordinator persona
      const deployment = await this.team.runDeploymentPhase(history.testing);

      // Use AI to optimize deployment strategy
      const aiDeployment = await this.optimizeDeploymentWithAI(issue, history, deployment);

      const enhancedDeployment = {
        ...deployment,
        aiOptimizations: aiDeployment,
        deploymentScore: this.calculateDeploymentScore(deployment, aiDeployment)
      };

      // Update history
      this.issueHistory.set(issue.number, {
        ...history,
        deployment: enhancedDeployment,
        lastUpdated: new Date(),
        status: 'completed'
      });

      return {
        success: true,
        action: 'deploy',
        issueNumber: issue.number,
        deployment: enhancedDeployment,
        aiEnhanced: true
      };

    } catch (error) {
      logger.error(`Deployment failed for issue #${issue.number}:`, error);
      throw error;
    }
  }

  async runFullWorkflow(issue) {
    try {
      logger.info(`Running full workflow for issue #${issue.number}`);

      // Run the complete Git Issue Solver Team workflow
      const result = await this.team.solveIssue(issue);

      // Enhance each phase with AI
      const enhancedResult = await this.enhanceWorkflowWithAI(issue, result);

      // Store complete workflow in history
      this.issueHistory.set(issue.number, {
        ...enhancedResult,
        lastUpdated: new Date(),
        status: 'completed'
      });

      return {
        success: true,
        action: 'full-workflow',
        issueNumber: issue.number,
        result: enhancedResult,
        aiEnhanced: true
      };

    } catch (error) {
      logger.error(`Full workflow failed for issue #${issue.number}:`, error);
      throw error;
    }
  }

  // AI Enhancement Methods

  async enhanceRecommendations(personaRecommendations, aiAnalysis) {
    try {
      const prompt = `Based on the AI analysis and persona recommendations, provide enhanced recommendations:

AI Analysis: ${JSON.stringify(aiAnalysis, null, 2)}
Persona Recommendations: ${JSON.stringify(personaRecommendations, null, 2)}

Provide enhanced recommendations that combine both insights:`;

      const result = await this.conversationManager.aiModelRunner.generateText(
        'llama2-7b',
        prompt,
        { temperature: 0.5, max_tokens: 1024 }
      );

      return {
        original: personaRecommendations,
        aiEnhanced: result.text,
        combined: this.mergeRecommendations(personaRecommendations, result.text)
      };
    } catch (error) {
      logger.error('Failed to enhance recommendations:', error);
      return personaRecommendations;
    }
  }

  async enhanceCodeWithAI(implementation, aiSolution) {
    try {
      const prompt = `Review the implementation and AI solution suggestions to provide enhanced code:

Implementation: ${JSON.stringify(implementation, null, 2)}
AI Solution: ${aiSolution.solution}

Provide specific code improvements and optimizations:`;

      const result = await this.conversationManager.aiModelRunner.generateCode(
        'codellama-7b',
        prompt,
        'javascript',
        { temperature: 0.3, max_tokens: 2048 }
      );

      return {
        original: implementation,
        aiSuggestions: aiSolution.solution,
        enhancedCode: result.code
      };
    } catch (error) {
      logger.error('Failed to enhance code with AI:', error);
      return implementation;
    }
  }

  async enhanceReviewWithAI(implementation, review) {
    try {
      const prompt = `Enhance the code review with additional insights:

Implementation: ${JSON.stringify(implementation, null, 2)}
Review: ${JSON.stringify(review, null, 2)}

Provide additional review insights, security considerations, and performance optimizations:`;

      const result = await this.conversationManager.aiModelRunner.generateText(
        'llama2-7b',
        prompt,
        { temperature: 0.4, max_tokens: 1024 }
      );

      return {
        original: review,
        aiEnhancements: result.text,
        additionalInsights: this.extractInsights(result.text)
      };
    } catch (error) {
      logger.error('Failed to enhance review with AI:', error);
      return review;
    }
  }

  async generateAITestCases(issue, implementation) {
    try {
      const prompt = `Generate comprehensive test cases for the following implementation:

Issue: ${issue.title}
${issue.body}

Implementation: ${JSON.stringify(implementation, null, 2)}

Generate unit tests, integration tests, and edge case tests:`;

      const result = await this.conversationManager.aiModelRunner.generateCode(
        'codellama-7b',
        prompt,
        'javascript',
        { temperature: 0.3, max_tokens: 2048 }
      );

      return {
        unitTests: this.extractUnitTests(result.code),
        integrationTests: this.extractIntegrationTests(result.code),
        edgeCaseTests: this.extractEdgeCaseTests(result.code)
      };
    } catch (error) {
      logger.error('Failed to generate AI test cases:', error);
      return {};
    }
  }

  async optimizeDeploymentWithAI(issue, history, deployment) {
    try {
      const prompt = `Optimize the deployment strategy based on the issue and implementation history:

Issue: ${issue.title}
History: ${JSON.stringify(history, null, 2)}
Deployment: ${JSON.stringify(deployment, null, 2)}

Provide deployment optimizations and risk mitigation strategies:`;

      const result = await this.conversationManager.aiModelRunner.generateText(
        'llama2-7b',
        prompt,
        { temperature: 0.4, max_tokens: 1024 }
      );

      return {
        original: deployment,
        aiOptimizations: result.text,
        riskMitigation: this.extractRiskMitigation(result.text)
      };
    } catch (error) {
      logger.error('Failed to optimize deployment with AI:', error);
      return deployment;
    }
  }

  async enhanceWorkflowWithAI(issue, result) {
    try {
      const prompt = `Enhance the complete workflow result with AI insights:

Issue: ${issue.title}
Workflow Result: ${JSON.stringify(result, null, 2)}

Provide overall workflow improvements and optimization suggestions:`;

      const aiEnhancement = await this.conversationManager.aiModelRunner.generateText(
        'llama2-7b',
        prompt,
        { temperature: 0.5, max_tokens: 1024 }
      );

      return {
        ...result,
        aiEnhancement: aiEnhancement.text,
        workflowScore: this.calculateWorkflowScore(result, aiEnhancement.text)
      };
    } catch (error) {
      logger.error('Failed to enhance workflow with AI:', error);
      return result;
    }
  }

  // Utility Methods

  mergeRecommendations(original, aiEnhanced) {
    // Simple merge logic - can be enhanced
    return {
      priority: aiEnhanced.priority || original.priority,
      complexity: aiEnhanced.complexity || original.complexity,
      approach: aiEnhanced.approach || original.approach,
      testing: aiEnhanced.testing || original.testing,
      deployment: aiEnhanced.deployment || original.deployment,
      aiInsights: aiEnhanced
    };
  }

  extractInsights(text) {
    // Extract key insights from AI text
    const insights = {
      security: [],
      performance: [],
      maintainability: [],
      bestPractices: []
    };

    // Simple keyword-based extraction
    if (text.toLowerCase().includes('security')) {
      insights.security.push('Security considerations identified');
    }
    if (text.toLowerCase().includes('performance')) {
      insights.performance.push('Performance optimizations suggested');
    }
    if (text.toLowerCase().includes('maintain')) {
      insights.maintainability.push('Maintainability improvements noted');
    }

    return insights;
  }

  extractUnitTests(code) {
    // Extract unit test patterns from generated code
    const unitTestPattern = /describe\(.*?\)[\s\S]*?it\(.*?\)[\s\S]*?\);/g;
    const matches = code.match(unitTestPattern) || [];
    return matches;
  }

  extractIntegrationTests(code) {
    // Extract integration test patterns
    const integrationTestPattern = /test\(.*?integration.*?\)[\s\S]*?\);/g;
    const matches = code.match(integrationTestPattern) || [];
    return matches;
  }

  extractEdgeCaseTests(code) {
    // Extract edge case test patterns
    const edgeCasePattern = /test\(.*?edge.*?\)[\s\S]*?\);/g;
    const matches = code.match(edgeCasePattern) || [];
    return matches;
  }

  extractRiskMitigation(text) {
    // Extract risk mitigation strategies
    const risks = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('risk') || line.toLowerCase().includes('mitigation')) {
        risks.push(line.trim());
      }
    });

    return risks;
  }

  calculateSecurityScore(review, aiReview) {
    // Calculate security score based on review findings
    let score = 100;
    
    if (review.data?.securityReview?.vulnerabilities) {
      const vulns = Object.values(review.data.securityReview.vulnerabilities);
      score -= vulns.filter(v => v !== 'protected').length * 10;
    }

    return Math.max(0, score);
  }

  calculateQualityScore(review, aiReview) {
    // Calculate quality score based on review findings
    let score = 100;
    
    if (review.data?.codeReview?.quality) {
      const quality = review.data.codeReview.quality;
      if (quality.readability !== 'excellent') score -= 10;
      if (quality.structure !== 'clean') score -= 10;
      if (quality.complexity !== 'appropriate') score -= 10;
    }

    return Math.max(0, score);
  }

  calculateTestCoverage(testing, aiTests) {
    // Calculate test coverage percentage
    const baseCoverage = testing.data?.testReport?.summary?.coverage || '0%';
    const aiTestCount = (aiTests.unitTests?.length || 0) + 
                       (aiTests.integrationTests?.length || 0) + 
                       (aiTests.edgeCaseTests?.length || 0);
    
    const basePercentage = parseInt(baseCoverage) || 0;
    const aiBonus = Math.min(aiTestCount * 2, 10); // Max 10% bonus from AI tests
    
    return Math.min(100, basePercentage + aiBonus);
  }

  calculateDeploymentScore(deployment, aiDeployment) {
    // Calculate deployment readiness score
    let score = 100;
    
    if (deployment.data?.validation?.health?.status !== 'healthy') score -= 20;
    if (deployment.data?.validation?.functionality?.features !== 'working') score -= 20;
    if (deployment.data?.validation?.performance?.response !== 'fast') score -= 10;

    return Math.max(0, score);
  }

  calculateWorkflowScore(result, aiEnhancement) {
    // Calculate overall workflow score
    let score = 100;
    
    if (!result.success) score -= 50;
    if (result.phases?.analysis?.success === false) score -= 10;
    if (result.phases?.implementation?.success === false) score -= 10;
    if (result.phases?.review?.success === false) score -= 10;
    if (result.phases?.testing?.success === false) score -= 10;
    if (result.phases?.deployment?.success === false) score -= 10;

    return Math.max(0, score);
  }

  // History and Status Methods

  getIssueHistory(issueNumber) {
    return this.issueHistory.get(issueNumber);
  }

  getAllIssueHistory() {
    return Array.from(this.issueHistory.entries()).map(([number, history]) => ({
      issueNumber: number,
      ...history
    }));
  }

  getActiveIssues() {
    return Array.from(this.activeIssues.values());
  }

  clearIssueHistory(issueNumber) {
    this.issueHistory.delete(issueNumber);
    this.activeIssues.delete(issueNumber);
  }
} 