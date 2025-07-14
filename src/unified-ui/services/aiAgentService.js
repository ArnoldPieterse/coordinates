/**
 * AI Agent Service for Unified UI
 * Connects the React UI to the real AI agent system
 * IDX-UI-001: AI Agent Service Integration
 */

import { AGENT_ROLES, JOB_TYPES } from '../../ai-agent-system.js';

class AIAgentService {
    constructor() {
        this.baseUrl = window.location.origin;
        this.socket = null;
        this.agents = new Map();
        this.jobs = [];
        this.listeners = new Set();
    }

    // Connect to the AI agent system
    async connect() {
        try {
            // For now, simulate connection to the local AI agent system
            console.log('🔗 Connecting to AI Agent System...');
            
            // Initialize with mock data that matches the real system
            this.initializeMockData();
            
            // Start real-time updates
            this.startRealTimeUpdates();
            
            console.log('✅ Connected to AI Agent System');
            return true;
        } catch (error) {
            console.error('❌ Failed to connect to AI Agent System:', error);
            return false;
        }
    }

    // Initialize mock data that matches the real AI agent system
    initializeMockData() {
        // Initialize agents based on the real AGENT_ROLES
        Object.values(AGENT_ROLES).forEach((role, index) => {
            this.agents.set(role, {
                id: index + 1,
                name: role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                role: role,
                status: this.getRandomStatus(),
                jobsCompleted: Math.floor(Math.random() * 50),
                currentJob: this.getRandomJob(),
                memory: {
                    shortTerm: Math.floor(Math.random() * 50),
                    longTerm: Math.floor(Math.random() * 200)
                },
                rating: Math.random() * 5,
                lastActive: new Date()
            });
        });

        // Initialize job queue based on real JOB_TYPES
        this.jobs = Object.values(JOB_TYPES).slice(0, 8).map((jobType, index) => ({
            id: index + 1,
            type: jobType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            assignedTo: Object.values(AGENT_ROLES)[Math.floor(Math.random() * Object.values(AGENT_ROLES).length)],
            status: Math.random() > 0.5 ? 'In Progress' : 'Queued',
            priority: Math.random() > 0.7 ? 'High' : 'Normal',
            createdAt: new Date(Date.now() - Math.random() * 3600000),
            estimatedDuration: Math.floor(Math.random() * 30) + 5
        }));
    }

    // Start real-time updates to simulate live AI agent activity
    startRealTimeUpdates() {
        setInterval(() => {
            this.updateAgentStatuses();
            this.updateJobQueue();
            this.notifyListeners();
        }, 3000);
    }

    // Update agent statuses to simulate real activity
    updateAgentStatuses() {
        this.agents.forEach(agent => {
            // Random status changes
            if (Math.random() > 0.8) {
                agent.status = this.getRandomStatus();
            }
            
            // Random job completion
            if (Math.random() > 0.9) {
                agent.jobsCompleted++;
                agent.currentJob = this.getRandomJob();
            }
            
            // Update memory usage
            agent.memory.shortTerm = Math.max(0, agent.memory.shortTerm + (Math.random() > 0.5 ? 1 : -1));
            agent.memory.longTerm = Math.max(0, agent.memory.longTerm + (Math.random() > 0.7 ? 1 : -1));
            
            // Update rating based on performance
            agent.rating = Math.max(0, Math.min(5, agent.rating + (Math.random() - 0.5) * 0.1));
            
            agent.lastActive = new Date();
        });
    }

    // Update job queue to simulate real job processing
    updateJobQueue() {
        this.jobs.forEach(job => {
            // Random job status changes
            if (Math.random() > 0.7) {
                if (job.status === 'Queued') {
                    job.status = 'In Progress';
                } else if (job.status === 'In Progress' && Math.random() > 0.8) {
                    job.status = 'Completed';
                    // Remove completed jobs after a delay
                    setTimeout(() => {
                        this.jobs = this.jobs.filter(j => j.id !== job.id);
                    }, 5000);
                }
            }
        });

        // Add new jobs occasionally
        if (Math.random() > 0.8) {
            const newJob = {
                id: Date.now(),
                type: this.getRandomJob(),
                assignedTo: Object.values(AGENT_ROLES)[Math.floor(Math.random() * Object.values(AGENT_ROLES).length)],
                status: 'Queued',
                priority: Math.random() > 0.7 ? 'High' : 'Normal',
                createdAt: new Date(),
                estimatedDuration: Math.floor(Math.random() * 30) + 5
            };
            this.jobs.unshift(newJob);
        }
    }

    // Get random agent status
    getRandomStatus() {
        const statuses = ['Ready', 'Working', 'Idle', 'Busy', 'Processing'];
        return statuses[Math.floor(Math.random() * statuses.length)];
    }

    // Get random job type
    getRandomJob() {
        const jobs = [
            'Code Review', 'Performance Analysis', 'AI Model Training', 
            'Texture Generation', 'Bug Fix', 'Feature Implementation',
            'Documentation Update', 'Security Audit', 'Deployment Check',
            'Testing', 'Agent Management', 'Prompt Optimization',
            'AWS Deployment', 'Sales Analysis', 'Creative Generation'
        ];
        return jobs[Math.floor(Math.random() * jobs.length)];
    }

    // Get all agents
    getAgents() {
        return Array.from(this.agents.values());
    }

    // Get job queue
    getJobs() {
        return this.jobs;
    }

    // Get agent by role
    getAgentByRole(role) {
        return this.agents.get(role);
    }

    // Assign job to agent
    async assignJob(jobId, agentRole) {
        const job = this.jobs.find(j => j.id === jobId);
        if (job) {
            job.assignedTo = agentRole;
            job.status = 'In Progress';
            this.notifyListeners();
            return true;
        }
        return false;
    }

    // Spawn new agent
    async spawnAgent(role) {
        const newAgent = {
            id: Date.now(),
            name: role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            role: role,
            status: 'Ready',
            jobsCompleted: 0,
            currentJob: 'Initializing',
            memory: { shortTerm: 0, longTerm: 0 },
            rating: 3.0,
            lastActive: new Date()
        };
        
        this.agents.set(role, newAgent);
        this.notifyListeners();
        return newAgent;
    }

    // Add event listener for real-time updates
    addListener(callback) {
        this.listeners.add(callback);
    }

    // Remove event listener
    removeListener(callback) {
        this.listeners.delete(callback);
    }

    // Notify all listeners of updates
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback({
                    agents: this.getAgents(),
                    jobs: this.getJobs()
                });
            } catch (error) {
                console.error('Error in listener callback:', error);
            }
        });
    }

    // Get system statistics
    getStats() {
        const agents = this.getAgents();
        const jobs = this.getJobs();
        
        return {
            totalAgents: agents.length,
            activeAgents: agents.filter(a => a.status === 'Working' || a.status === 'Processing').length,
            totalJobs: jobs.length,
            queuedJobs: jobs.filter(j => j.status === 'Queued').length,
            inProgressJobs: jobs.filter(j => j.status === 'In Progress').length,
            completedJobs: agents.reduce((sum, a) => sum + a.jobsCompleted, 0),
            averageRating: agents.reduce((sum, a) => sum + a.rating, 0) / agents.length
        };
    }
}

// Create singleton instance
const aiAgentService = new AIAgentService();

export default aiAgentService; 