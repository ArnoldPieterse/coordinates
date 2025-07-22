/**
 * UI Team Interface
 * Manages and interacts with 10 specialized UI developer personas
 */

import React, { useState, useEffect } from 'react';
import UIDeveloperTeam from '../../personas/ui-developers/UIDeveloperTeam.js';

const UITeamInterface = () => {
    const [uiTeam] = useState(new UIDeveloperTeam());
    const [personas, setPersonas] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedPersona, setSelectedPersona] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [collaborationType, setCollaborationType] = useState('new_component');
    const [isProcessing, setIsProcessing] = useState(false);
    const [teamStatus, setTeamStatus] = useState('initializing');

    useEffect(() => {
        setupTeam();
        setupEventListeners();
    }, []);

    const setupTeam = async () => {
        setTeamStatus('loading');
        
        // Wait for team initialization
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const allPersonas = uiTeam.getPersonas();
        setPersonas(allPersonas);
        setTeamStatus('ready');
    };

    const setupEventListeners = () => {
        uiTeam.on('team-ready', (data) => {
            console.log('[UI-TEAM] Team ready:', data);
            setTeamStatus('ready');
        });

        uiTeam.on('task-assigned', (assignment) => {
            console.log('[UI-TEAM] Task assigned:', assignment);
            setProjects(prev => [...prev, assignment]);
        });

        uiTeam.on('task-completed', ({ assignment, results }) => {
            console.log('[UI-TEAM] Task completed:', results);
            setProjects(prev => prev.map(p => 
                p.id === assignment.id ? { ...p, status: 'completed', results } : p
            ));
            setIsProcessing(false);
        });

        uiTeam.on('persona-updated', ({ personaId, updates }) => {
            console.log('[UI-TEAM] Persona updated:', personaId, updates);
            setPersonas(prev => prev.map(p => 
                p.id === personaId ? { ...p, ...updates } : p
            ));
        });

        uiTeam.on('collaboration-requested', ({ type, data }) => {
            console.log('[UI-TEAM] Collaboration requested:', type, data);
        });
    };

    const handleStartCollaboration = async () => {
        setIsProcessing(true);
        
        try {
            const taskData = {
                title: `Collaborative ${collaborationType.replace('_', ' ')}`,
                description: `Team collaboration for ${collaborationType}`,
                requirements: generateTaskRequirements(collaborationType)
            };
            
            await uiTeam.addCollaborationRequest(collaborationType, taskData);
        } catch (error) {
            console.error('[UI-TEAM] Collaboration failed:', error);
            setIsProcessing(false);
        }
    };

    const generateTaskRequirements = (type) => {
        const requirements = {
            'new_component': {
                componentName: 'AdvancedButton',
                props: ['variant', 'size', 'disabled'],
                features: ['accessibility', 'animations', 'responsive']
            },
            'performance_optimization': {
                target: 'existing_components',
                metrics: ['bundle_size', 'render_time', 'memory_usage'],
                optimizations: ['code_splitting', 'lazy_loading', 'memoization']
            },
            'responsive_implementation': {
                breakpoints: ['mobile', 'tablet', 'desktop'],
                features: ['touch_optimization', 'adaptive_layout', 'flexible_grid']
            },
            'accessibility_audit': {
                standards: ['WCAG_2_1', 'ARIA_guidelines'],
                focus: ['keyboard_navigation', 'screen_readers', 'color_contrast']
            },
            'animation_integration': {
                animations: ['micro_interactions', 'transitions', 'loading_states'],
                performance: ['css_animations', 'gpu_acceleration', 'smooth_60fps']
            },
            'security_review': {
                focus: ['xss_prevention', 'input_validation', 'csp_headers'],
                testing: ['security_tests', 'vulnerability_scan', 'best_practices']
            }
        };
        
        return requirements[type] || {};
    };

    const renderPersonasGrid = () => {
        return (
            <div className="personas-section">
                <h3>UI Developer Team ({personas.length})</h3>
                <div className="personas-grid">
                    {personas.map(persona => (
                        <div 
                            key={persona.id}
                            className={`persona-card ${selectedPersona?.id === persona.id ? 'selected' : ''} ${!persona.availability ? 'busy' : ''}`}
                            onClick={() => setSelectedPersona(persona)}
                        >
                            <div className="persona-header">
                                <h4>{persona.name}</h4>
                                <span className={`status ${persona.availability ? 'available' : 'busy'}`}>
                                    {persona.availability ? 'Available' : 'Busy'}
                                </span>
                            </div>
                            <p className="persona-role">{persona.role}</p>
                            <p className="persona-specialization">{persona.specialization}</p>
                            
                            <div className="persona-skills">
                                {Object.entries(persona.skills).slice(0, 3).map(([skill, level]) => (
                                    <div key={skill} className="skill-bar">
                                        <span className="skill-name">{skill}</span>
                                        <div className="skill-progress">
                                            <div 
                                                className="skill-fill" 
                                                style={{ width: `${level}%` }}
                                            ></div>
                                        </div>
                                        <span className="skill-level">{level}%</span>
                                    </div>
                                ))}
                            </div>
                            
                            {persona.currentTask && (
                                <div className="current-task">
                                    <span>Working on: {persona.currentTask}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderPersonaDetails = () => {
        if (!selectedPersona) return null;

        return (
            <div className="persona-details">
                <h3>{selectedPersona.name} - {selectedPersona.role}</h3>
                
                <div className="persona-info">
                    <div className="info-section">
                        <h4>Specialization</h4>
                        <p>{selectedPersona.specialization}</p>
                    </div>
                    
                    <div className="info-section">
                        <h4>Expertise</h4>
                        <ul>
                            {selectedPersona.expertise.map((exp, i) => (
                                <li key={i}>{exp}</li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="info-section">
                        <h4>Tools</h4>
                        <div className="tools-list">
                            {selectedPersona.tools.map((tool, i) => (
                                <span key={i} className="tool-tag">{tool}</span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="info-section">
                        <h4>Goals</h4>
                        <ul>
                            {selectedPersona.goals.map((goal, i) => (
                                <li key={i}>{goal}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                
                <div className="skills-section">
                    <h4>Skills Assessment</h4>
                    <div className="skills-grid">
                        {Object.entries(selectedPersona.skills).map(([skill, level]) => (
                            <div key={skill} className="skill-item">
                                <span className="skill-name">{skill}</span>
                                <div className="skill-bar-large">
                                    <div 
                                        className="skill-fill-large" 
                                        style={{ width: `${level}%` }}
                                    ></div>
                                </div>
                                <span className="skill-level">{level}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderCollaborationPanel = () => {
        const collaborationTypes = [
            { value: 'new_component', label: 'New Component Development' },
            { value: 'performance_optimization', label: 'Performance Optimization' },
            { value: 'responsive_implementation', label: 'Responsive Implementation' },
            { value: 'accessibility_audit', label: 'Accessibility Audit' },
            { value: 'animation_integration', label: 'Animation Integration' },
            { value: 'security_review', label: 'Security Review' }
        ];

        return (
            <div className="collaboration-panel">
                <h3>Start Team Collaboration</h3>
                
                <div className="collaboration-form">
                    <div className="form-group">
                        <label>Collaboration Type:</label>
                        <select 
                            value={collaborationType} 
                            onChange={(e) => setCollaborationType(e.target.value)}
                        >
                            {collaborationTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="workflow-preview">
                        <h4>Workflow Preview</h4>
                        <div className="workflow-steps">
                            {uiTeam.collaborationWorkflows?.[collaborationType]?.map((personaId, index) => {
                                const persona = personas.find(p => p.id === personaId);
                                return persona ? (
                                    <div key={personaId} className="workflow-step">
                                        <span className="step-number">{index + 1}</span>
                                        <span className="step-persona">{persona.name}</span>
                                        <span className="step-role">{persona.role}</span>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>
                    
                    <button 
                        className={`start-collaboration-btn ${isProcessing ? 'processing' : ''}`}
                        onClick={handleStartCollaboration}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Processing...' : 'Start Collaboration'}
                    </button>
                </div>
            </div>
        );
    };

    const renderProjectsList = () => {
        return (
            <div className="projects-section">
                <h3>Active Projects ({projects.length})</h3>
                
                {projects.length === 0 && (
                    <div className="no-projects">
                        <p>No active projects. Start a collaboration to see projects here.</p>
                    </div>
                )}
                
                <div className="projects-grid">
                    {projects.map(project => (
                        <div 
                            key={project.id}
                            className={`project-card ${selectedProject?.id === project.id ? 'selected' : ''} ${project.status}`}
                            onClick={() => setSelectedProject(project)}
                        >
                            <div className="project-header">
                                <h4>{project.task.title}</h4>
                                <span className={`status ${project.status}`}>{project.status}</span>
                            </div>
                            
                            <p>{project.task.description}</p>
                            
                            <div className="project-meta">
                                <span>Personas: {project.assignedPersonas.length}</span>
                                <span>Progress: {Math.round(project.progress)}%</span>
                                <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                            </div>
                            
                            {project.status === 'completed' && project.results && (
                                <div className="project-results">
                                    <h5>Results</h5>
                                    <div className="results-summary">
                                        <span>Contributions: {project.results.metrics?.totalContributions}</span>
                                        <span>Quality: {Math.round(project.results.metrics?.qualityScore || 0)}%</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderProjectDetails = () => {
        if (!selectedProject) return null;

        return (
            <div className="project-details">
                <h3>Project: {selectedProject.task.title}</h3>
                
                <div className="project-info">
                    <div className="info-section">
                        <h4>Description</h4>
                        <p>{selectedProject.task.description}</p>
                    </div>
                    
                    <div className="info-section">
                        <h4>Assigned Personas</h4>
                        <div className="assigned-personas">
                            {selectedProject.assignedPersonas.map(personaId => {
                                const persona = personas.find(p => p.id === personaId);
                                return persona ? (
                                    <span key={personaId} className="persona-tag">
                                        {persona.name} ({persona.role})
                                    </span>
                                ) : null;
                            })}
                        </div>
                    </div>
                    
                    <div className="info-section">
                        <h4>Progress</h4>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${selectedProject.progress}%` }}
                            ></div>
                        </div>
                        <span>{Math.round(selectedProject.progress)}% Complete</span>
                    </div>
                </div>
                
                {selectedProject.status === 'completed' && selectedProject.results && (
                    <div className="results-section">
                        <h4>Collaboration Results</h4>
                        
                        <div className="metrics-grid">
                            {Object.entries(selectedProject.results.metrics || {}).map(([metric, value]) => (
                                <div key={metric} className="metric-card">
                                    <span className="metric-name">{metric.replace('_', ' ').toUpperCase()}</span>
                                    <span className="metric-value">
                                        {typeof value === 'number' ? value.toFixed(2) : value}
                                    </span>
                                </div>
                            ))}
                        </div>
                        
                        {selectedProject.results.finalOutput && (
                            <div className="final-output">
                                <h5>Final Output</h5>
                                <div className="output-content">
                                    <h6>Recommendations</h6>
                                    <ul>
                                        {selectedProject.results.finalOutput.recommendations?.slice(0, 5).map((rec, i) => (
                                            <li key={i}>{rec}</li>
                                        ))}
                                    </ul>
                                    
                                    {selectedProject.results.finalOutput.combinedCode && (
                                        <div className="code-preview">
                                            <h6>Generated Code</h6>
                                            <pre>
                                                <code>{selectedProject.results.finalOutput.combinedCode.slice(0, 200)}...</code>
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="ui-team-interface">
            <div className="interface-header">
                <h2>🎨 UI Developer Team</h2>
                <p>10 Specialized UI Frontend Developer Personas</p>
                <div className="team-status">
                    Status: <span className={`status ${teamStatus}`}>{teamStatus}</span>
                </div>
            </div>
            
            <div className="interface-content">
                <div className="left-panel">
                    {renderPersonasGrid()}
                    {renderCollaborationPanel()}
                </div>
                
                <div className="right-panel">
                    {renderPersonaDetails()}
                    {renderProjectsList()}
                    {renderProjectDetails()}
                </div>
            </div>
            
            <style jsx>{`
                .ui-team-interface {
                    padding: 20px;
                    background: #1a1a1a;
                    color: #ffffff;
                    min-height: 100vh;
                }
                
                .interface-header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                
                .team-status {
                    margin-top: 10px;
                    font-size: 14px;
                }
                
                .status.initializing { color: #ffaa00; }
                .status.loading { color: #0088ff; }
                .status.ready { color: #00ff00; }
                
                .interface-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                }
                
                .left-panel, .right-panel {
                    background: #2a2a2a;
                    padding: 20px;
                    border-radius: 8px;
                    border: 1px solid #333;
                }
                
                .personas-grid {
                    display: grid;
                    gap: 15px;
                    margin-bottom: 30px;
                }
                
                .persona-card {
                    background: #333;
                    padding: 15px;
                    border-radius: 6px;
                    border: 1px solid #555;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .persona-card:hover {
                    border-color: #00ff00;
                }
                
                .persona-card.selected {
                    border-color: #00ff00;
                    background: #2a2a2a;
                }
                
                .persona-card.busy {
                    opacity: 0.7;
                    border-color: #ffaa00;
                }
                
                .persona-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                
                .persona-header h4 {
                    margin: 0;
                    color: #00ff00;
                }
                
                .status.available { color: #00ff00; }
                .status.busy { color: #ffaa00; }
                
                .persona-role {
                    font-weight: bold;
                    margin: 5px 0;
                }
                
                .persona-specialization {
                    font-size: 12px;
                    color: #888;
                    margin-bottom: 10px;
                }
                
                .persona-skills {
                    margin-bottom: 10px;
                }
                
                .skill-bar {
                    display: flex;
                    align-items: center;
                    margin-bottom: 5px;
                    font-size: 12px;
                }
                
                .skill-name {
                    width: 80px;
                    color: #888;
                }
                
                .skill-progress {
                    flex: 1;
                    height: 4px;
                    background: #555;
                    border-radius: 2px;
                    margin: 0 10px;
                    overflow: hidden;
                }
                
                .skill-fill {
                    height: 100%;
                    background: #00ff00;
                    transition: width 0.3s ease;
                }
                
                .skill-level {
                    width: 30px;
                    text-align: right;
                    color: #00ff00;
                }
                
                .current-task {
                    font-size: 12px;
                    color: #ffaa00;
                    margin-top: 10px;
                }
                
                .collaboration-panel {
                    background: #333;
                    padding: 20px;
                    border-radius: 6px;
                }
                
                .form-group {
                    margin-bottom: 15px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    color: #00ff00;
                }
                
                .form-group select {
                    width: 100%;
                    padding: 8px;
                    background: #1a1a1a;
                    border: 1px solid #555;
                    color: #ffffff;
                    border-radius: 4px;
                }
                
                .workflow-preview {
                    margin: 20px 0;
                }
                
                .workflow-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .workflow-step {
                    display: flex;
                    align-items: center;
                    background: #1a1a1a;
                    padding: 10px;
                    border-radius: 4px;
                }
                
                .step-number {
                    background: #00ff00;
                    color: #000;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    margin-right: 10px;
                }
                
                .step-persona {
                    font-weight: bold;
                    margin-right: 10px;
                }
                
                .step-role {
                    color: #888;
                    font-size: 12px;
                }
                
                .start-collaboration-btn {
                    width: 100%;
                    background: #0088ff;
                    color: #ffffff;
                    border: none;
                    padding: 15px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                    transition: all 0.3s ease;
                }
                
                .start-collaboration-btn:hover:not(:disabled) {
                    background: #0066cc;
                }
                
                .start-collaboration-btn.processing {
                    background: #666;
                    cursor: not-allowed;
                }
                
                .persona-details, .project-details {
                    background: #333;
                    padding: 20px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                }
                
                .info-section {
                    margin-bottom: 20px;
                }
                
                .info-section h4 {
                    color: #00ff00;
                    margin-bottom: 10px;
                }
                
                .tools-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;
                }
                
                .tool-tag {
                    background: #1a1a1a;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    border: 1px solid #555;
                }
                
                .skills-grid {
                    display: grid;
                    gap: 15px;
                }
                
                .skill-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .skill-name {
                    width: 100px;
                    font-size: 14px;
                }
                
                .skill-bar-large {
                    flex: 1;
                    height: 8px;
                    background: #555;
                    border-radius: 4px;
                    overflow: hidden;
                }
                
                .skill-fill-large {
                    height: 100%;
                    background: #00ff00;
                    transition: width 0.3s ease;
                }
                
                .skill-level {
                    width: 40px;
                    text-align: right;
                    color: #00ff00;
                    font-weight: bold;
                }
                
                .projects-grid {
                    display: grid;
                    gap: 15px;
                }
                
                .project-card {
                    background: #333;
                    padding: 15px;
                    border-radius: 6px;
                    border: 1px solid #555;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .project-card:hover {
                    border-color: #00ff00;
                }
                
                .project-card.selected {
                    border-color: #00ff00;
                    background: #2a2a2a;
                }
                
                .project-card.assigned { border-color: #0088ff; }
                .project-card.completed { border-color: #00ff00; }
                
                .project-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                
                .project-header h4 {
                    margin: 0;
                    color: #00ff00;
                }
                
                .project-meta {
                    display: flex;
                    gap: 15px;
                    font-size: 12px;
                    color: #888;
                    margin: 10px 0;
                }
                
                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: #555;
                    border-radius: 4px;
                    overflow: hidden;
                    margin: 10px 0;
                }
                
                .progress-fill {
                    height: 100%;
                    background: #00ff00;
                    transition: width 0.3s ease;
                }
                
                .assigned-personas {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;
                }
                
                .persona-tag {
                    background: #1a1a1a;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    border: 1px solid #555;
                }
                
                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                    margin: 20px 0;
                }
                
                .metric-card {
                    background: #1a1a1a;
                    padding: 15px;
                    border-radius: 4px;
                    text-align: center;
                    border: 1px solid #555;
                }
                
                .metric-name {
                    display: block;
                    font-size: 12px;
                    color: #888;
                    margin-bottom: 5px;
                }
                
                .metric-value {
                    display: block;
                    font-size: 18px;
                    font-weight: bold;
                    color: #00ff00;
                }
                
                .final-output {
                    background: #1a1a1a;
                    padding: 15px;
                    border-radius: 4px;
                    margin-top: 20px;
                }
                
                .output-content h6 {
                    color: #00ff00;
                    margin-bottom: 10px;
                }
                
                .code-preview {
                    margin-top: 15px;
                }
                
                .code-preview pre {
                    background: #000;
                    padding: 10px;
                    border-radius: 4px;
                    overflow-x: auto;
                    font-size: 12px;
                }
                
                .code-preview code {
                    color: #00ff00;
                }
                
                .no-projects, .no-datasets {
                    text-align: center;
                    padding: 40px;
                    color: #888;
                }
            `}</style>
        </div>
    );
};

export default UITeamInterface; 