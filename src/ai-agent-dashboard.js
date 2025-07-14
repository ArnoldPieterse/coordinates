/**
 * Coordinates - AI Agent Dashboard
 * Real-time monitoring and control interface for AI agents
 * IDX-AI-002: Agent Dashboard Implementation
 */

import AIAgentManager, { AGENT_ROLES, JOB_TYPES } from './ai-agent-system.js';

// ===== DASHBOARD CLASS =====
export class AIAgentDashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.agentManager = new AIAgentManager();
        this.updateInterval = null;
        this.isInitialized = false;
        
        if (!this.container) {
            throw new Error(`Container with ID '${containerId}' not found`);
        }
        
        this.initialize();
    }

    async initialize() {
        console.log('🎛️ Initializing AI Agent Dashboard...');
        
        this.renderDashboard();
        this.bindEvents();
        
        // Spawn all agents
        await this.agentManager.spawnAllAgents();
        
        // Start real-time updates
        this.startUpdates();
        
        this.isInitialized = true;
        console.log('✅ AI Agent Dashboard initialized');
    }

    renderDashboard() {
        this.container.innerHTML = `
            <div class="ai-dashboard">
                <div class="dashboard-header">
                    <h1>🤖 AI Agent Management System</h1>
                    <div class="system-stats" id="systemStats"></div>
                </div>
                
                <div class="dashboard-grid">
                    <div class="dashboard-section">
                        <h2>🚀 Agent Control</h2>
                        <div class="agent-controls">
                            <button class="btn btn-primary" id="spawnAllBtn">
                                <span class="btn-icon">🚀</span>
                                <span class="btn-text">Spawn All Agents</span>
                            </button>
                            <button class="btn btn-secondary" id="stopAllBtn">
                                <span class="btn-icon">🛑</span>
                                <span class="btn-text">Stop All Agents</span>
                            </button>
                            <button class="btn btn-secondary" id="restartAllBtn">
                                <span class="btn-icon">🔄</span>
                                <span class="btn-text">Restart All Agents</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="dashboard-section">
                        <h2>📋 Job Queue</h2>
                        <div class="job-queue-controls">
                            <button class="btn btn-primary" id="addJobBtn">
                                <span class="btn-icon">➕</span>
                                <span class="btn-text">Add Job</span>
                            </button>
                            <button class="btn btn-secondary" id="clearQueueBtn">
                                <span class="btn-icon">🗑️</span>
                                <span class="btn-text">Clear Queue</span>
                            </button>
                        </div>
                        <div class="job-queue" id="jobQueue"></div>
                    </div>
                </div>
                
                <div class="agents-grid" id="agentsGrid"></div>
                
                <div class="dashboard-section">
                    <h2>📊 Job History</h2>
                    <div class="job-history" id="jobHistory"></div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Agent control buttons
        document.getElementById('spawnAllBtn').addEventListener('click', () => {
            this.agentManager.spawnAllAgents();
        });
        
        document.getElementById('stopAllBtn').addEventListener('click', () => {
            this.stopAllAgents();
        });
        
        document.getElementById('restartAllBtn').addEventListener('click', () => {
            this.restartAllAgents();
        });
        
        // Job queue buttons
        document.getElementById('addJobBtn').addEventListener('click', () => {
            this.showAddJobModal();
        });
        
        document.getElementById('clearQueueBtn').addEventListener('click', () => {
            this.clearJobQueue();
        });
    }

    startUpdates() {
        this.updateInterval = setInterval(() => {
            this.updateDashboard();
        }, 1000); // Update every second
    }

    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    updateDashboard() {
        this.updateSystemStats();
        this.updateAgentsGrid();
        this.updateJobQueue();
        this.updateJobHistory();
    }

    updateSystemStats() {
        const stats = this.agentManager.getSystemStats();
        const statsContainer = document.getElementById('systemStats');
        
        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Total Agents</span>
                    <span class="stat-value">${stats.totalAgents}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Active</span>
                    <span class="stat-value active">${stats.activeAgents}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Idle</span>
                    <span class="stat-value idle">${stats.idleAgents}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Busy</span>
                    <span class="stat-value busy">${stats.busyAgents}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Offline</span>
                    <span class="stat-value offline">${stats.offlineAgents}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Jobs Queued</span>
                    <span class="stat-value">${stats.totalJobs}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Completed</span>
                    <span class="stat-value success">${stats.completedJobs}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Failed</span>
                    <span class="stat-value error">${stats.failedJobs}</span>
                </div>
            </div>
        `;
    }

    updateAgentsGrid() {
        const agentsStatus = this.agentManager.getAllAgentsStatus();
        const agentsGrid = document.getElementById('agentsGrid');
        
        agentsGrid.innerHTML = Object.entries(agentsStatus).map(([agentId, status]) => `
            <div class="agent-card ${status.status}">
                <div class="agent-header">
                    <h3 class="agent-title">${this.getRoleDisplayName(status.role)}</h3>
                    <span class="agent-id">${agentId}</span>
                </div>
                
                <div class="agent-status">
                    <div class="status-indicator ${status.status}">
                        <span class="status-dot"></span>
                        <span class="status-text">${status.status.toUpperCase()}</span>
                    </div>
                </div>
                
                <div class="agent-info">
                    <div class="info-item">
                        <span class="info-label">Current Job:</span>
                        <span class="info-value">${status.currentJob ? status.currentJob.description : 'None'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Queue Length:</span>
                        <span class="info-value">${status.queueLength}</span>
                    </div>
                </div>
                
                <div class="agent-stats">
                    <div class="stat-item">
                        <span class="stat-label">Completed</span>
                        <span class="stat-value">${status.stats.jobsCompleted}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Failed</span>
                        <span class="stat-value">${status.stats.jobsFailed}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Avg Time</span>
                        <span class="stat-value">${Math.round(status.stats.averageJobTime)}ms</span>
                    </div>
                </div>
                
                <div class="agent-controls">
                    <button class="btn btn-sm btn-secondary" onclick="dashboard.restartAgent('${agentId}')">
                        <span class="btn-icon">🔄</span>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="dashboard.stopAgent('${agentId}')">
                        <span class="btn-icon">🛑</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateJobQueue() {
        const jobQueue = this.agentManager.getJobQueue();
        const queueContainer = document.getElementById('jobQueue');
        
        if (jobQueue.length === 0) {
            queueContainer.innerHTML = '<div class="empty-state">No jobs in queue</div>';
            return;
        }
        
        queueContainer.innerHTML = jobQueue.map(job => `
            <div class="job-item ${job.priority}">
                <div class="job-header">
                    <span class="job-type">${this.getJobTypeDisplayName(job.type)}</span>
                    <span class="job-priority ${job.priority}">${job.priority.toUpperCase()}</span>
                </div>
                <div class="job-description">${job.description}</div>
                <div class="job-meta">
                    <span class="job-id">${job.id}</span>
                    <span class="job-time">${this.formatTime(job.createdAt)}</span>
                </div>
            </div>
        `).join('');
    }

    updateJobHistory() {
        const jobHistory = this.agentManager.getJobHistory();
        const historyContainer = document.getElementById('jobHistory');
        
        if (jobHistory.length === 0) {
            historyContainer.innerHTML = '<div class="empty-state">No job history available</div>';
            return;
        }
        
        historyContainer.innerHTML = jobHistory.slice(-10).reverse().map(job => `
            <div class="history-item ${job.status}">
                <div class="history-header">
                    <span class="history-type">${this.getJobTypeDisplayName(job.type)}</span>
                    <span class="history-status ${job.status}">${job.status.toUpperCase()}</span>
                </div>
                <div class="history-description">${job.description}</div>
                <div class="history-meta">
                    <span class="history-id">${job.id}</span>
                    <span class="history-time">${this.formatTime(job.completedAt || job.failedAt)}</span>
                </div>
            </div>
        `).join('');
    }

    showAddJobModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add New Job</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="modal-body">
                    <form id="addJobForm">
                        <div class="form-group">
                            <label for="jobType">Job Type</label>
                            <select id="jobType" required>
                                ${Object.entries(JOB_TYPES).map(([key, value]) => 
                                    `<option value="${value}">${this.getJobTypeDisplayName(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="jobDescription">Description</label>
                            <input type="text" id="jobDescription" required placeholder="Enter job description">
                        </div>
                        
                        <div class="form-group">
                            <label for="jobPriority">Priority</label>
                            <select id="jobPriority">
                                <option value="low">Low</option>
                                <option value="normal" selected>Normal</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="targetRole">Target Role (Optional)</label>
                            <select id="targetRole">
                                <option value="">Auto-assign</option>
                                ${Object.entries(AGENT_ROLES).map(([key, value]) => 
                                    `<option value="${value}">${this.getRoleDisplayName(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="jobData">Job Data (JSON)</label>
                            <textarea id="jobData" rows="4" placeholder='{"key": "value"}'></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Add Job</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        document.getElementById('addJobForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addJobFromForm();
            modal.remove();
        });
    }

    async addJobFromForm() {
        const jobType = document.getElementById('jobType').value;
        const description = document.getElementById('jobDescription').value;
        const priority = document.getElementById('jobPriority').value;
        const targetRole = document.getElementById('targetRole').value || null;
        const jobData = document.getElementById('jobData').value;
        
        let data = {};
        if (jobData.trim()) {
            try {
                data = JSON.parse(jobData);
            } catch (error) {
                console.error('Invalid JSON data:', error);
                return;
            }
        }
        
        await this.agentManager.queueJob(jobType, description, data, priority, targetRole);
    }

    async stopAgent(agentId) {
        await this.agentManager.stopAgent(agentId);
    }

    async restartAgent(agentId) {
        await this.agentManager.restartAgent(agentId);
    }

    async stopAllAgents() {
        const agentsStatus = this.agentManager.getAllAgentsStatus();
        for (const agentId of Object.keys(agentsStatus)) {
            await this.agentManager.stopAgent(agentId);
        }
    }

    async restartAllAgents() {
        const agentsStatus = this.agentManager.getAllAgentsStatus();
        for (const agentId of Object.keys(agentsStatus)) {
            await this.agentManager.restartAgent(agentId);
        }
    }

    clearJobQueue() {
        this.agentManager.jobQueue = [];
        console.log('🗑️ Job queue cleared');
    }

    // ===== UTILITY METHODS =====
    getRoleDisplayName(role) {
        const displayNames = {
            [AGENT_ROLES.PROJECT_MANAGER]: 'Project Manager',
            [AGENT_ROLES.CODE_REVIEWER]: 'Code Reviewer',
            [AGENT_ROLES.PERFORMANCE_OPTIMIZER]: 'Performance Optimizer',
            [AGENT_ROLES.AI_SYSTEMS_ENGINEER]: 'AI Systems Engineer',
            [AGENT_ROLES.GAMEPLAY_DESIGNER]: 'Gameplay Designer',
            [AGENT_ROLES.GRAPHICS_ARTIST]: 'Graphics Artist',
            [AGENT_ROLES.TESTING_ENGINEER]: 'Testing Engineer',
            [AGENT_ROLES.DOCUMENTATION_WRITER]: 'Documentation Writer',
            [AGENT_ROLES.SECURITY_ANALYST]: 'Security Analyst',
            [AGENT_ROLES.DEPLOYMENT_ENGINEER]: 'Deployment Engineer',
            [AGENT_ROLES.MANAGER_AGENT]: 'Manager Agent',
            [AGENT_ROLES.AWS_SPECIALIST]: 'AWS Specialist',
            [AGENT_ROLES.SALES_TEAM]: 'Sales Team',
            [AGENT_ROLES.MESSENGER]: 'Messenger',
            [AGENT_ROLES.CREATIVE_SPAWNER]: 'Creative Spawner'
        };
        return displayNames[role] || role;
    }

    getJobTypeDisplayName(jobType) {
        const displayNames = {
            [JOB_TYPES.CODE_REVIEW]: 'Code Review',
            [JOB_TYPES.PERFORMANCE_ANALYSIS]: 'Performance Analysis',
            [JOB_TYPES.AI_MODEL_TRAINING]: 'AI Model Training',
            [JOB_TYPES.TEXTURE_GENERATION]: 'Texture Generation',
            [JOB_TYPES.BUG_FIX]: 'Bug Fix',
            [JOB_TYPES.FEATURE_IMPLEMENTATION]: 'Feature Implementation',
            [JOB_TYPES.DOCUMENTATION_UPDATE]: 'Documentation Update',
            [JOB_TYPES.SECURITY_AUDIT]: 'Security Audit',
            [JOB_TYPES.DEPLOYMENT_CHECK]: 'Deployment Check',
            [JOB_TYPES.TESTING]: 'Testing',
            [JOB_TYPES.AGENT_MANAGEMENT]: 'Agent Management',
            [JOB_TYPES.PROMPT_OPTIMIZATION]: 'Prompt Optimization',
            [JOB_TYPES.AGENT_EVALUATION]: 'Agent Evaluation',
            [JOB_TYPES.AWS_DEPLOYMENT]: 'AWS Deployment',
            [JOB_TYPES.AWS_OPTIMIZATION]: 'AWS Optimization',
            [JOB_TYPES.SALES_ANALYSIS]: 'Sales Analysis',
            [JOB_TYPES.MARKETING_STRATEGY]: 'Marketing Strategy',
            [JOB_TYPES.COMMUNICATION_ROUTING]: 'Communication Routing',
            [JOB_TYPES.CREATIVE_GENERATION]: 'Creative Generation',
            [JOB_TYPES.MEMORY_MANAGEMENT]: 'Memory Management'
        };
        return displayNames[jobType] || jobType;
    }

    formatTime(date) {
        if (!date) return 'N/A';
        return new Date(date).toLocaleTimeString();
    }

    destroy() {
        this.stopUpdates();
        this.container.innerHTML = '';
    }
}

// ===== GLOBAL INSTANCE =====
let dashboard = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('aiAgentDashboard');
    if (container) {
        dashboard = new AIAgentDashboard('aiAgentDashboard');
    }
});

// ===== EXPORTS =====
export default AIAgentDashboard; 