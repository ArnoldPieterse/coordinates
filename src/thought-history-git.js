/**
 * Thought History Git Integration
 * Advanced Git repository management for thought history
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

export class ThoughtHistoryGit {
    constructor(config = {}) {
        this.config = {
            repoPath: './thought-history',
            branchPrefix: 'thoughts',
            commitInterval: 30000, // 30 seconds
            maxCommitsPerDay: 100,
            enableBranches: true,
            enableTags: true,
            enableCollaboration: false,
            remoteUrl: null,
            ...config
        };

        this.pendingThoughts = [];
        this.lastCommit = Date.now();
        this.dailyCommits = 0;
        this.lastCommitDate = new Date().toDateString();
        
        this.branches = new Set();
        this.tags = new Map();
        this.collaborators = new Set();
        
        this.initialize();
    }

    async initialize() {
        console.log('🔧 Initializing Thought History Git Integration...');
        
        try {
            // Create repository directory
            await fs.mkdir(this.config.repoPath, { recursive: true });
            
            // Initialize Git repository
            await this.runGitCommand('init');
            
            // Create initial structure
            await this.createInitialStructure();
            
            // Set up remote if configured
            if (this.config.remoteUrl) {
                await this.setupRemote();
            }
            
            // Create main branch
            await this.createBranch('main');
            
            console.log('✅ Thought History Git Integration initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Git integration:', error);
            throw error;
        }
    }

    async createInitialStructure() {
        const structure = {
            'README.md': this.generateReadme(),
            '.gitignore': this.generateGitignore(),
            'config.json': JSON.stringify(this.config, null, 2),
            'thoughts/': {},
            'analysis/': {},
            'exports/': {},
            'collaborators/': {}
        };

        for (const [name, content] of Object.entries(structure)) {
            const filePath = path.join(this.config.repoPath, name);
            
            if (typeof content === 'string') {
                await fs.writeFile(filePath, content);
            } else {
                await fs.mkdir(filePath, { recursive: true });
            }
        }
    }

    generateReadme() {
        return `# Thought History Repository

This repository contains the thought history and reasoning patterns of AI agents.

## Structure

- \`thoughts/\` - Individual thought records
- \`analysis/\` - Analysis and insights
- \`exports/\` - Exported data
- \`collaborators/\` - Collaboration data

## Branches

- \`main\` - Main thought history
- \`thoughts/agent-{id}\` - Agent-specific thoughts
- \`thoughts/date-{YYYY-MM-DD}\` - Date-specific thoughts
- \`analysis/patterns\` - Reasoning pattern analysis
- \`analysis/learning\` - Learning progress analysis

## Tags

- \`v1.0.0\` - Major releases
- \`milestone-{name}\` - Important milestones
- \`agent-{id}-{date}\` - Agent-specific snapshots

## Usage

\`\`\`bash
# Clone the repository
git clone <remote-url>

# View thought history
git log --oneline

# View specific agent thoughts
git log --grep="agent-{id}"

# Export thoughts
git archive --format=zip --output=thoughts.zip HEAD
\`\`\`

## Configuration

See \`config.json\` for current configuration.

## Collaboration

This repository supports collaborative thought analysis and improvement.
`;
    }

    generateGitignore() {
        return `# Temporary files
*.tmp
*.log
*.cache

# Node modules
node_modules/

# Environment files
.env
.env.local

# IDE files
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db

# Large files
*.zip
*.tar.gz
*.mp4
*.avi

# Sensitive data
secrets/
private/
`;
    }

    async setupRemote() {
        try {
            await this.runGitCommand(`remote add origin ${this.config.remoteUrl}`);
            await this.runGitCommand('fetch origin');
            console.log('✅ Remote repository configured');
        } catch (error) {
            console.warn('⚠️ Failed to setup remote:', error.message);
        }
    }

    /**
     * Add thought to Git repository
     */
    async addThought(thoughtRecord) {
        this.pendingThoughts.push(thoughtRecord);
        
        // Check if we should commit
        if (this.shouldCommit()) {
            await this.commitThoughts();
        }
    }

    /**
     * Determine if we should commit thoughts
     */
    shouldCommit() {
        const now = Date.now();
        const today = new Date().toDateString();
        
        // Reset daily commit counter
        if (today !== this.lastCommitDate) {
            this.dailyCommits = 0;
            this.lastCommitDate = today;
        }
        
        // Check commit interval
        if (now - this.lastCommit < this.config.commitInterval) {
            return false;
        }
        
        // Check daily limit
        if (this.dailyCommits >= this.config.maxCommitsPerDay) {
            return false;
        }
        
        // Check if we have pending thoughts
        return this.pendingThoughts.length > 0;
    }

    /**
     * Commit pending thoughts to Git
     */
    async commitThoughts() {
        if (this.pendingThoughts.length === 0) return;

        try {
            const timestamp = new Date().toISOString();
            const batchId = `batch_${Date.now()}`;
            
            // Group thoughts by agent
            const thoughtsByAgent = this.groupThoughtsByAgent(this.pendingThoughts);
            
            // Create commit for each agent
            for (const [agentId, thoughts] of Object.entries(thoughtsByAgent)) {
                await this.commitAgentThoughts(agentId, thoughts, batchId);
            }
            
            // Create main branch commit
            await this.commitMainBranch(batchId);
            
            // Create analysis commit
            await this.commitAnalysis(batchId);
            
            // Update metrics
            this.lastCommit = Date.now();
            this.dailyCommits++;
            
            console.log(`✅ Committed ${this.pendingThoughts.length} thoughts in batch ${batchId}`);
            
            // Clear pending thoughts
            this.pendingThoughts = [];
            
        } catch (error) {
            console.error('❌ Failed to commit thoughts:', error);
            throw error;
        }
    }

    /**
     * Group thoughts by agent
     */
    groupThoughtsByAgent(thoughts) {
        const groups = {};
        
        thoughts.forEach(thought => {
            const agentId = thought.agentId;
            if (!groups[agentId]) {
                groups[agentId] = [];
            }
            groups[agentId].push(thought);
        });
        
        return groups;
    }

    /**
     * Commit thoughts for a specific agent
     */
    async commitAgentThoughts(agentId, thoughts, batchId) {
        const agentBranch = `thoughts/agent-${agentId}`;
        
        // Create or switch to agent branch
        await this.createOrSwitchBranch(agentBranch);
        
        // Create thought file
        const thoughtFile = path.join(this.config.repoPath, 'thoughts', `agent-${agentId}.json`);
        const thoughtData = {
            agentId,
            batchId,
            timestamp: new Date(),
            thoughts: thoughts,
            summary: {
                totalThoughts: thoughts.length,
                averageConfidence: thoughts.reduce((sum, t) => sum + t.confidence, 0) / thoughts.length,
                averageQuality: thoughts.reduce((sum, t) => sum + t.metadata.reasoningQuality, 0) / thoughts.length
            }
        };
        
        await fs.writeFile(thoughtFile, JSON.stringify(thoughtData, null, 2));
        
        // Add and commit
        await this.runGitCommand('add', thoughtFile);
        await this.runGitCommand('commit', '-m', `Add thoughts for agent ${agentId} - batch ${batchId}`);
        
        // Create tag for significant thoughts
        if (thoughts.some(t => t.confidence > 0.8)) {
            await this.createTag(`agent-${agentId}-${new Date().toISOString().split('T')[0]}`, `High confidence thoughts from agent ${agentId}`);
        }
    }

    /**
     * Commit to main branch
     */
    async commitMainBranch(batchId) {
        await this.createOrSwitchBranch('main');
        
        // Create summary file
        const summaryFile = path.join(this.config.repoPath, 'thoughts', `summary-${batchId}.json`);
        const summaryData = {
            batchId,
            timestamp: new Date(),
            totalThoughts: this.pendingThoughts.length,
            agents: [...new Set(this.pendingThoughts.map(t => t.agentId))],
            summary: {
                averageConfidence: this.pendingThoughts.reduce((sum, t) => sum + t.confidence, 0) / this.pendingThoughts.length,
                averageQuality: this.pendingThoughts.reduce((sum, t) => sum + t.metadata.reasoningQuality, 0) / this.pendingThoughts.length,
                highConfidenceThoughts: this.pendingThoughts.filter(t => t.confidence > 0.7).length,
                lowConfidenceThoughts: this.pendingThoughts.filter(t => t.confidence < 0.3).length
            }
        };
        
        await fs.writeFile(summaryFile, JSON.stringify(summaryData, null, 2));
        
        // Add and commit
        await this.runGitCommand('add', summaryFile);
        await this.runGitCommand('commit', '-m', `Add thought summary - batch ${batchId}`);
    }

    /**
     * Commit analysis data
     */
    async commitAnalysis(batchId) {
        const analysisBranch = 'analysis/patterns';
        await this.createOrSwitchBranch(analysisBranch);
        
        // Create analysis file
        const analysisFile = path.join(this.config.repoPath, 'analysis', `patterns-${batchId}.json`);
        const analysisData = {
            batchId,
            timestamp: new Date(),
            patterns: this.analyzeThoughtPatterns(this.pendingThoughts),
            insights: this.generateInsights(this.pendingThoughts)
        };
        
        await fs.writeFile(analysisFile, JSON.stringify(analysisData, null, 2));
        
        // Add and commit
        await this.runGitCommand('add', analysisFile);
        await this.runGitCommand('commit', '-m', `Add pattern analysis - batch ${batchId}`);
    }

    /**
     * Create or switch to branch
     */
    async createOrSwitchBranch(branchName) {
        try {
            // Check if branch exists
            const branches = await this.runGitCommand('branch', '--list');
            const branchExists = branches.includes(branchName);
            
            if (branchExists) {
                await this.runGitCommand('checkout', branchName);
            } else {
                await this.runGitCommand('checkout', '-b', branchName);
                this.branches.add(branchName);
            }
        } catch (error) {
            console.error(`❌ Failed to create/switch to branch ${branchName}:`, error);
            throw error;
        }
    }

    /**
     * Create branch
     */
    async createBranch(branchName) {
        try {
            await this.runGitCommand('checkout', '-b', branchName);
            this.branches.add(branchName);
            console.log(`✅ Created branch: ${branchName}`);
        } catch (error) {
            console.error(`❌ Failed to create branch ${branchName}:`, error);
            throw error;
        }
    }

    /**
     * Create tag
     */
    async createTag(tagName, message) {
        try {
            await this.runGitCommand('tag', '-a', tagName, '-m', message);
            this.tags.set(tagName, {
                message,
                timestamp: new Date()
            });
            console.log(`✅ Created tag: ${tagName}`);
        } catch (error) {
            console.error(`❌ Failed to create tag ${tagName}:`, error);
        }
    }

    /**
     * Analyze thought patterns
     */
    analyzeThoughtPatterns(thoughts) {
        const patterns = {
            confidenceDistribution: {
                high: thoughts.filter(t => t.confidence > 0.7).length,
                medium: thoughts.filter(t => t.confidence >= 0.4 && t.confidence <= 0.7).length,
                low: thoughts.filter(t => t.confidence < 0.4).length
            },
            qualityDistribution: {
                high: thoughts.filter(t => t.metadata.reasoningQuality > 0.7).length,
                medium: thoughts.filter(t => t.metadata.reasoningQuality >= 0.4 && t.metadata.reasoningQuality <= 0.7).length,
                low: thoughts.filter(t => t.metadata.reasoningQuality < 0.4).length
            },
            complexityDistribution: {
                high: thoughts.filter(t => t.metadata.thoughtComplexity > 0.7).length,
                medium: thoughts.filter(t => t.metadata.thoughtComplexity >= 0.4 && t.metadata.thoughtComplexity <= 0.7).length,
                low: thoughts.filter(t => t.metadata.thoughtComplexity < 0.4).length
            },
            agentPerformance: {}
        };

        // Analyze per-agent performance
        const thoughtsByAgent = this.groupThoughtsByAgent(thoughts);
        for (const [agentId, agentThoughts] of Object.entries(thoughtsByAgent)) {
            patterns.agentPerformance[agentId] = {
                totalThoughts: agentThoughts.length,
                averageConfidence: agentThoughts.reduce((sum, t) => sum + t.confidence, 0) / agentThoughts.length,
                averageQuality: agentThoughts.reduce((sum, t) => sum + t.metadata.reasoningQuality, 0) / agentThoughts.length,
                averageComplexity: agentThoughts.reduce((sum, t) => sum + t.metadata.thoughtComplexity, 0) / agentThoughts.length
            };
        }

        return patterns;
    }

    /**
     * Generate insights from thoughts
     */
    generateInsights(thoughts) {
        const insights = {
            highConfidenceInsights: [],
            lowConfidenceWarnings: [],
            qualityTrends: [],
            recommendations: []
        };

        // High confidence insights
        const highConfidenceThoughts = thoughts.filter(t => t.confidence > 0.8);
        insights.highConfidenceInsights = highConfidenceThoughts.map(t => ({
            thought: t.thought.substring(0, 100) + '...',
            confidence: t.confidence,
            quality: t.metadata.reasoningQuality,
            agentId: t.agentId
        }));

        // Low confidence warnings
        const lowConfidenceThoughts = thoughts.filter(t => t.confidence < 0.3);
        insights.lowConfidenceWarnings = lowConfidenceThoughts.map(t => ({
            thought: t.thought.substring(0, 100) + '...',
            confidence: t.confidence,
            agentId: t.agentId,
            recommendation: 'Consider providing more context or training data'
        }));

        // Quality trends
        const avgQuality = thoughts.reduce((sum, t) => sum + t.metadata.reasoningQuality, 0) / thoughts.length;
        insights.qualityTrends.push({
            timestamp: new Date(),
            averageQuality: avgQuality,
            trend: avgQuality > 0.6 ? 'improving' : avgQuality < 0.4 ? 'declining' : 'stable'
        });

        // Recommendations
        if (lowConfidenceThoughts.length > thoughts.length * 0.2) {
            insights.recommendations.push({
                type: 'confidence',
                priority: 'high',
                message: 'High rate of low-confidence thoughts detected',
                action: 'Review agent training and context provision'
            });
        }

        if (avgQuality < 0.5) {
            insights.recommendations.push({
                type: 'quality',
                priority: 'medium',
                message: 'Reasoning quality below optimal levels',
                action: 'Implement structured reasoning frameworks'
            });
        }

        return insights;
    }

    /**
     * Export repository data
     */
    async exportRepository(format = 'json') {
        try {
            const exportPath = path.join(this.config.repoPath, 'exports');
            await fs.mkdir(exportPath, { recursive: true });
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `thought-history-${timestamp}`;
            
            if (format === 'zip') {
                const zipPath = path.join(exportPath, `${filename}.zip`);
                await this.runGitCommand('archive', '--format=zip', '--output', zipPath, 'HEAD');
                return zipPath;
            } else {
                const jsonPath = path.join(exportPath, `${filename}.json`);
                const data = await this.getRepositoryData();
                await fs.writeFile(jsonPath, JSON.stringify(data, null, 2));
                return jsonPath;
            }
        } catch (error) {
            console.error('❌ Failed to export repository:', error);
            throw error;
        }
    }

    /**
     * Get repository data
     */
    async getRepositoryData() {
        const data = {
            metadata: {
                exportDate: new Date(),
                config: this.config,
                branches: Array.from(this.branches),
                tags: Array.from(this.tags.entries()),
                collaborators: Array.from(this.collaborators)
            },
            statistics: {
                totalCommits: await this.getCommitCount(),
                totalBranches: this.branches.size,
                totalTags: this.tags.size,
                dailyCommits: this.dailyCommits
            },
            thoughts: await this.getAllThoughts(),
            analysis: await this.getAllAnalysis()
        };

        return data;
    }

    /**
     * Get commit count
     */
    async getCommitCount() {
        try {
            const result = await this.runGitCommand('rev-list', '--count', 'HEAD');
            return parseInt(result.trim());
        } catch (error) {
            return 0;
        }
    }

    /**
     * Get all thoughts from repository
     */
    async getAllThoughts() {
        const thoughts = [];
        const thoughtsDir = path.join(this.config.repoPath, 'thoughts');
        
        try {
            const files = await fs.readdir(thoughtsDir);
            
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(thoughtsDir, file);
                    const content = await fs.readFile(filePath, 'utf8');
                    const data = JSON.parse(content);
                    thoughts.push(data);
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to read thoughts directory:', error.message);
        }
        
        return thoughts;
    }

    /**
     * Get all analysis from repository
     */
    async getAllAnalysis() {
        const analysis = [];
        const analysisDir = path.join(this.config.repoPath, 'analysis');
        
        try {
            const files = await fs.readdir(analysisDir);
            
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(analysisDir, file);
                    const content = await fs.readFile(filePath, 'utf8');
                    const data = JSON.parse(content);
                    analysis.push(data);
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to read analysis directory:', error.message);
        }
        
        return analysis;
    }

    /**
     * Run Git command
     */
    async runGitCommand(...args) {
        try {
            const result = execSync(`git ${args.join(' ')}`, {
                cwd: this.config.repoPath,
                encoding: 'utf8'
            });
            return result;
        } catch (error) {
            console.error(`❌ Git command failed: git ${args.join(' ')}`);
            throw error;
        }
    }

    /**
     * Push to remote repository
     */
    async pushToRemote() {
        if (!this.config.remoteUrl) {
            console.warn('⚠️ No remote URL configured');
            return;
        }

        try {
            await this.runGitCommand('push', 'origin', '--all');
            await this.runGitCommand('push', 'origin', '--tags');
            console.log('✅ Pushed to remote repository');
        } catch (error) {
            console.error('❌ Failed to push to remote:', error);
            throw error;
        }
    }

    /**
     * Pull from remote repository
     */
    async pullFromRemote() {
        if (!this.config.remoteUrl) {
            console.warn('⚠️ No remote URL configured');
            return;
        }

        try {
            await this.runGitCommand('pull', 'origin', '--all');
            console.log('✅ Pulled from remote repository');
        } catch (error) {
            console.error('❌ Failed to pull from remote:', error);
            throw error;
        }
    }

    /**
     * Get repository status
     */
    async getStatus() {
        try {
            const status = await this.runGitCommand('status', '--porcelain');
            const branches = await this.runGitCommand('branch', '--list');
            const tags = await this.runGitCommand('tag', '--list');
            
            return {
                hasChanges: status.trim().length > 0,
                currentBranch: branches.split('\n').find(b => b.startsWith('*'))?.replace('* ', '') || 'main',
                branches: branches.split('\n').filter(b => b.trim()).map(b => b.replace('* ', '')),
                tags: tags.split('\n').filter(t => t.trim()),
                pendingThoughts: this.pendingThoughts.length,
                lastCommit: this.lastCommit,
                dailyCommits: this.dailyCommits
            };
        } catch (error) {
            console.error('❌ Failed to get repository status:', error);
            return null;
        }
    }

    /**
     * Cleanup and shutdown
     */
    async shutdown() {
        console.log('🔄 Shutting down Thought History Git Integration...');
        
        // Commit any pending thoughts
        if (this.pendingThoughts.length > 0) {
            await this.commitThoughts();
        }
        
        // Push to remote if configured
        if (this.config.remoteUrl) {
            await this.pushToRemote();
        }
        
        console.log('✅ Thought History Git Integration shutdown complete');
    }
}

export default ThoughtHistoryGit; 