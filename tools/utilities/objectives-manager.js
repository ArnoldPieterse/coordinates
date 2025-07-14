/**
 * Objectives Manager Tool
 * Web interface for managing project objectives and development roadmap
 */

export default class ObjectivesManager {
    constructor() {
        this.name = 'Objectives Manager';
        this.visible = false;
        this.objectivesData = null;
        this.currentSection = 'all';
        this.init();
    }

    init() {
        this.createUI();
        this.loadObjectives();
        this.bindEvents();
    }

    createUI() {
        this.container = document.createElement('div');
        this.container.id = 'objectivesManager';
        this.container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90vw;
            height: 85vh;
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid #4CAF50;
            border-radius: 12px;
            color: white;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            z-index: 10000;
            display: none;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            background: #4CAF50;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #45a049;
        `;
        header.innerHTML = `
            <h2 style="margin: 0; color: white;">📋 Project Objectives Manager</h2>
            <button id="closeObjectives" style="background: #f44336; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-size: 12px;">
                ✕ Close
            </button>
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            display: flex;
            height: calc(100% - 60px);
        `;

        // Create sidebar
        const sidebar = document.createElement('div');
        sidebar.style.cssText = `
            width: 250px;
            background: rgba(255,255,255,0.1);
            padding: 15px;
            overflow-y: auto;
            border-right: 1px solid #333;
        `;

        sidebar.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #4CAF50;">📊 Quick Stats</h3>
                <div id="objectivesStats" style="font-size: 12px; line-height: 1.4;">
                    Loading...
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #4CAF50;">🎯 Categories</h3>
                <div id="categoryFilters" style="font-size: 12px;">
                    <div class="filter-item" data-category="all" style="padding: 5px; cursor: pointer; border-radius: 3px; margin-bottom: 5px; background: #4CAF50;">
                        📋 All Objectives
                    </div>
                    <div class="filter-item" data-category="completed" style="padding: 5px; cursor: pointer; border-radius: 3px; margin-bottom: 5px; background: rgba(255,255,255,0.1);">
                        ✅ Completed
                    </div>
                    <div class="filter-item" data-category="planned" style="padding: 5px; cursor: pointer; border-radius: 3px; margin-bottom: 5px; background: rgba(255,255,255,0.1);">
                        🎯 Planned
                    </div>
                    <div class="filter-item" data-category="ideas" style="padding: 5px; cursor: pointer; border-radius: 3px; margin-bottom: 5px; background: rgba(255,255,255,0.1);">
                        💡 Ideas
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #4CAF50;">🚀 Quick Actions</h3>
                <button id="addObjective" style="width: 100%; background: #2196F3; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-bottom: 8px;">
                    ➕ Add Objective
                </button>
                <button id="exportObjectives" style="width: 100%; background: #FF9800; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-bottom: 8px;">
                    📤 Export Data
                </button>
                <button id="refreshObjectives" style="width: 100%; background: #9C27B0; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer; font-size: 12px;">
                    🔄 Refresh
                </button>
            </div>
        `;

        // Create main content
        const mainContent = document.createElement('div');
        mainContent.style.cssText = `
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        `;

        mainContent.innerHTML = `
            <div id="objectivesContent">
                <div style="text-align: center; padding: 50px; color: #ccc;">
                    <h3>Loading objectives...</h3>
                    <p>Please wait while we load the project objectives.</p>
                </div>
            </div>
        `;

        content.appendChild(sidebar);
        content.appendChild(mainContent);
        this.container.appendChild(header);
        this.container.appendChild(content);
        document.body.appendChild(this.container);
    }

    bindEvents() {
        document.getElementById('closeObjectives').addEventListener('click', () => {
            this.hide();
        });

        // Category filters
        document.querySelectorAll('.filter-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.currentSection = e.target.dataset.category;
                this.updateFilterUI();
                this.renderObjectives();
            });
        });

        // Quick action buttons
        document.getElementById('addObjective').addEventListener('click', () => {
            this.showAddObjectiveModal();
        });

        document.getElementById('exportObjectives').addEventListener('click', () => {
            this.exportObjectivesData();
        });

        document.getElementById('refreshObjectives').addEventListener('click', () => {
            this.loadObjectives();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.visible) {
                this.hide();
            }
        });
    }

    updateFilterUI() {
        document.querySelectorAll('.filter-item').forEach(item => {
            if (item.dataset.category === this.currentSection) {
                item.style.background = '#4CAF50';
            } else {
                item.style.background = 'rgba(255,255,255,0.1)';
            }
        });
    }

    async loadObjectives() {
        try {
            this.objectivesData = this.createSampleObjectivesData();
            this.updateStats();
            this.renderObjectives();
        } catch (error) {
            console.error('Failed to load objectives:', error);
        }
    }

    createSampleObjectivesData() {
        return {
            completed: [
                {
                    title: 'Multiplayer System',
                    description: 'Implemented real-time multiplayer with Socket.IO',
                    category: 'platform',
                    priority: 'high',
                    status: 'completed'
                },
                {
                    title: 'Planetary Travel',
                    description: 'Added rocket travel system between planets',
                    category: 'gameplay',
                    priority: 'high',
                    status: 'completed'
                }
            ],
            planned: [
                {
                    title: 'Combat System',
                    description: 'Add health, damage, and combat mechanics',
                    category: 'combat',
                    priority: 'high',
                    status: 'planned'
                },
                {
                    title: 'AI Integration',
                    description: 'Interface with LM Studio for local LLM queries',
                    category: 'ai',
                    priority: 'medium',
                    status: 'planned'
                }
            ],
            ideas: [
                {
                    title: 'Space Stations',
                    description: 'Add orbital space stations as new locations',
                    category: 'content',
                    priority: 'low',
                    status: 'ideas'
                },
                {
                    title: 'Particle Effects',
                    description: 'Add visual effects for rocket launches and impacts',
                    category: 'ui',
                    priority: 'low',
                    status: 'ideas'
                }
            ]
        };
    }

    updateStats() {
        const stats = document.getElementById('objectivesStats');
        const total = this.objectivesData.completed.length + this.objectivesData.planned.length + this.objectivesData.ideas.length;
        const completed = this.objectivesData.completed.length;
        const planned = this.objectivesData.planned.length;
        const ideas = this.objectivesData.ideas.length;
        
        stats.innerHTML = `
            <div style="margin-bottom: 8px;">
                <strong>Total:</strong> ${total}
            </div>
            <div style="margin-bottom: 8px;">
                <strong>Completed:</strong> ${completed} (${total > 0 ? Math.round(completed/total*100) : 0}%)
            </div>
            <div style="margin-bottom: 8px;">
                <strong>Planned:</strong> ${planned}
            </div>
            <div>
                <strong>Ideas:</strong> ${ideas}
            </div>
        `;
    }

    renderObjectives() {
        const content = document.getElementById('objectivesContent');
        let objectives = [];

        switch (this.currentSection) {
            case 'completed':
                objectives = this.objectivesData.completed;
                break;
            case 'planned':
                objectives = this.objectivesData.planned;
                break;
            case 'ideas':
                objectives = this.objectivesData.ideas;
                break;
            default:
                objectives = [...this.objectivesData.completed, ...this.objectivesData.planned, ...this.objectivesData.ideas];
        }

        content.innerHTML = this.generateObjectivesHTML(objectives);
        this.bindActionButtons();
    }

    bindActionButtons() {
        document.querySelectorAll('.mark-complete').forEach(button => {
            button.addEventListener('click', (e) => {
                const objectiveItem = e.target.closest('.objective-item');
                const title = objectiveItem.dataset.title;
                this.markAsCompleted(title);
            });
        });

        document.querySelectorAll('.edit-objective').forEach(button => {
            button.addEventListener('click', (e) => {
                const objectiveItem = e.target.closest('.objective-item');
                const title = objectiveItem.dataset.title;
                this.editObjective(title);
            });
        });

        document.querySelectorAll('.delete-objective').forEach(button => {
            button.addEventListener('click', (e) => {
                const objectiveItem = e.target.closest('.objective-item');
                const title = objectiveItem.dataset.title;
                this.deleteObjective(title);
            });
        });
    }

    markAsCompleted(title) {
        let foundObjective = null;
        
        const plannedIndex = this.objectivesData.planned.findIndex(obj => obj.title === title);
        if (plannedIndex !== -1) {
            foundObjective = this.objectivesData.planned.splice(plannedIndex, 1)[0];
        }
        
        const ideasIndex = this.objectivesData.ideas.findIndex(obj => obj.title === title);
        if (ideasIndex !== -1) {
            foundObjective = this.objectivesData.ideas.splice(ideasIndex, 1)[0];
        }
        
        if (foundObjective) {
            this.objectivesData.completed.push(foundObjective);
            this.updateStats();
            this.renderObjectives();
            this.showSuccess(`Objective "${title}" marked as completed!`);
        }
    }

    editObjective(title) {
        // IDX-OBJ-EDIT: Edit an objective by title
        const allObjectives = [...this.objectivesData.completed, ...this.objectivesData.planned, ...this.objectivesData.ideas];
        const obj = allObjectives.find(o => o.title === title);
        if (!obj) {
            this.showError(`Objective "${title}" not found!`);
            return;
        }
        const newTitle = prompt('Edit objective title:', obj.title);
        if (newTitle !== null && newTitle.trim() !== '') obj.title = newTitle.trim();
        const newDesc = prompt('Edit objective description:', obj.description);
        if (newDesc !== null && newDesc.trim() !== '') obj.description = newDesc.trim();
        const newCategory = prompt('Edit objective category:', obj.category);
        if (newCategory !== null && newCategory.trim() !== '') obj.category = newCategory.trim();
        const newPriority = prompt('Edit objective priority:', obj.priority);
        if (newPriority !== null && newPriority.trim() !== '') obj.priority = newPriority.trim();
        this.renderObjectives();
        this.showSuccess(`Objective "${title}" updated!`);
    }

    deleteObjective(title) {
        if (confirm(`Are you sure you want to delete "${title}"?`)) {
            this.objectivesData.completed = this.objectivesData.completed.filter(obj => obj.title !== title);
            this.objectivesData.planned = this.objectivesData.planned.filter(obj => obj.title !== title);
            this.objectivesData.ideas = this.objectivesData.ideas.filter(obj => obj.title !== title);
            
            this.updateStats();
            this.renderObjectives();
            this.showSuccess(`Objective "${title}" deleted successfully!`);
        }
    }

    generateObjectivesHTML(objectives) {
        if (objectives.length === 0) {
            return `
                <div style="text-align: center; padding: 50px; color: #ccc;">
                    <h3>No objectives found</h3>
                    <p>No objectives match the current filter.</p>
                </div>
            `;
        }

        const objectivesHTML = objectives.map((obj, index) => {
            const statusIcon = obj.status === 'completed' ? '✅' : obj.status === 'planned' ? '🎯' : '💡';
            const statusColor = obj.status === 'completed' ? '#4CAF50' : obj.status === 'planned' ? '#FF9800' : '#9C27B0';
            const priorityBadge = obj.priority ? `<span style="background: ${this.getPriorityColor(obj.priority)}; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-left: 8px;">${obj.priority}</span>` : '';
            
            return `
                <div class="objective-item" data-index="${index}" data-title="${obj.title}" style="background: rgba(255,255,255,0.05); padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid ${statusColor};">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <h4 style="margin: 0; color: ${statusColor};">
                            ${statusIcon} ${obj.title}
                        </h4>
                        <div style="display: flex; gap: 5px;">
                            ${priorityBadge}
                            <span style="background: #333; padding: 2px 6px; border-radius: 3px; font-size: 10px;">${obj.category}</span>
                        </div>
                    </div>
                    <p style="margin: 0; color: #ccc; font-size: 13px; line-height: 1.4;">
                        ${obj.description}
                    </p>
                    <div style="margin-top: 10px; display: flex; gap: 5px;">
                        ${obj.status !== 'completed' ? `
                            <button class="action-btn mark-complete" style="background: #4CAF50; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">
                                ✅ Mark Complete
                            </button>
                        ` : ''}
                        <button class="action-btn edit-objective" style="background: #2196F3; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">
                            ✏️ Edit
                        </button>
                        <button class="action-btn delete-objective" style="background: #f44336; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #4CAF50;">
                    ${this.getSectionTitle()}
                </h3>
                <div style="color: #ccc; font-size: 12px; margin-bottom: 20px;">
                    Showing ${objectives.length} objective${objectives.length !== 1 ? 's' : ''}
                </div>
            </div>
            ${objectivesHTML}
        `;
    }

    getSectionTitle() {
        switch (this.currentSection) {
            case 'completed': return '✅ Completed Objectives';
            case 'planned': return '🎯 Planned Objectives';
            case 'ideas': return '💡 Ideas & Concepts';
            default: return '📋 All Objectives';
        }
    }

    getPriorityColor(priority) {
        switch (priority) {
            case 'high': return '#f44336';
            case 'medium': return '#FF9800';
            case 'low': return '#4CAF50';
            default: return '#333';
        }
    }

    showAddObjectiveModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10001;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        modal.innerHTML = `
            <div style="background: rgba(0,0,0,0.95); padding: 25px; border-radius: 12px; border: 2px solid #4CAF50; width: 500px; max-width: 90vw;">
                <h3 style="margin: 0 0 20px 0; color: #4CAF50;">➕ Add New Objective</h3>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #ccc;">Title:</label>
                    <input type="text" id="newObjectiveTitle" style="width: 100%; padding: 8px; background: #333; border: 1px solid #555; color: white; border-radius: 4px;">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #ccc;">Description:</label>
                    <textarea id="newObjectiveDesc" rows="3" style="width: 100%; padding: 8px; background: #333; border: 1px solid #555; color: white; border-radius: 4px; resize: vertical;"></textarea>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #ccc;">Category:</label>
                    <select id="newObjectiveCategory" style="width: 100%; padding: 8px; background: #333; border: 1px solid #555; color: white; border-radius: 4px;">
                        <option value="combat">Combat</option>
                        <option value="ai">AI</option>
                        <option value="tools">Tools</option>
                        <option value="ui">UI</option>
                        <option value="content">Content</option>
                        <option value="platform">Platform</option>
                        <option value="social">Social</option>
                        <option value="monetization">Monetization</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #ccc;">Priority:</label>
                    <select id="newObjectivePriority" style="width: 100%; padding: 8px; background: #333; border: 1px solid #555; color: white; border-radius: 4px;">
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button id="cancelAddObjective" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                        Cancel
                    </button>
                    <button id="saveObjective" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                        Save Objective
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('cancelAddObjective').addEventListener('click', () => {
            modal.remove();
        });

        document.getElementById('saveObjective').addEventListener('click', () => {
            this.saveNewObjective(modal);
        });
    }

    saveNewObjective(modal) {
        const title = document.getElementById('newObjectiveTitle').value.trim();
        const description = document.getElementById('newObjectiveDesc').value.trim();
        const category = document.getElementById('newObjectiveCategory').value;
        const priority = document.getElementById('newObjectivePriority').value;

        if (!title || !description) {
            this.showError('Please fill in all required fields');
            return;
        }

        const newObjective = {
            title,
            description,
            category,
            priority,
            status: 'planned'
        };

        this.objectivesData.planned.push(newObjective);
        this.updateStats();
        this.renderObjectives();
        modal.remove();
        this.showSuccess('Objective added successfully!');
    }

    exportObjectivesData() {
        const data = {
            completed: this.objectivesData.completed,
            planned: this.objectivesData.planned,
            ideas: this.objectivesData.ideas,
            exportDate: new Date().toISOString(),
            totalObjectives: this.objectivesData.completed.length + this.objectivesData.planned.length + this.objectivesData.ideas.length
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `project-objectives-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showSuccess('Objectives data exported successfully!');
    }

    showError(message) {
        this.showNotification(message, '#f44336');
    }

    showSuccess(message) {
        this.showNotification(message, '#4CAF50');
    }

    showNotification(message, color) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10002;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    show() {
        this.visible = true;
        this.container.style.display = 'block';
        this.loadObjectives();
    }

    hide() {
        this.visible = false;
        this.container.style.display = 'none';
    }

    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
} 