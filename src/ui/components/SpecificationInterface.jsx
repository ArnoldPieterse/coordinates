/**
 * Specification-Driven Development Interface
 * Inspired by Kiro.dev's spec-driven development approach
 */

import React, { useState, useEffect } from 'react';
import SpecificationEngine from '../../core/SpecificationEngine.js';

const SpecificationInterface = () => {
    const [specEngine] = useState(new SpecificationEngine());
    const [specifications, setSpecifications] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('game-mechanic');
    const [specData, setSpecData] = useState({});
    const [selectedSpec, setSelectedSpec] = useState(null);
    const [implementation, setImplementation] = useState(null);

    useEffect(() => {
        loadSpecifications();
    }, []);

    const loadSpecifications = () => {
        const specs = specEngine.getAllSpecifications();
        setSpecifications(specs);
    };

    const handleCreateSpecification = async () => {
        try {
            const spec = await specEngine.createSpecification(selectedTemplate, specData);
            setSpecifications([...specifications, spec]);
            setSpecData({});
            console.log('[SPEC] Specification created:', spec);
        } catch (error) {
            console.error('[SPEC] Failed to create specification:', error);
        }
    };

    const handleGenerateImplementation = async (specId) => {
        try {
            const result = await specEngine.generateImplementation(specId);
            setImplementation(result.implementation);
            setSelectedSpec(result.specification);
            console.log('[SPEC] Implementation generated:', result);
        } catch (error) {
            console.error('[SPEC] Failed to generate implementation:', error);
        }
    };

    const handleSelectSpecification = (spec) => {
        setSelectedSpec(spec);
        setImplementation(spec.implementation || null);
    };

    const renderTemplateForm = () => {
        const templates = {
            'game-mechanic': {
                fields: [
                    { name: 'title', label: 'Title', type: 'text', placeholder: 'Player Movement System' },
                    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Responsive player movement with physics integration' },
                    { name: 'requirements', label: 'Requirements', type: 'array', placeholder: 'WASD controls, Smooth movement' },
                    { name: 'constraints', label: 'Constraints', type: 'object', placeholder: 'maxSpeed: 10, acceleration: 2' },
                    { name: 'expectedBehavior', label: 'Expected Behavior', type: 'textarea', placeholder: 'Player moves smoothly in response to input' }
                ]
            },
            'ai-system': {
                fields: [
                    { name: 'title', label: 'Title', type: 'text', placeholder: 'Adaptive Enemy AI' },
                    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Enemy AI that learns from player behavior' },
                    { name: 'capabilities', label: 'Capabilities', type: 'array', placeholder: 'Pattern recognition, Adaptive difficulty' },
                    { name: 'learning', label: 'Learning', type: 'object', placeholder: 'algorithm: reinforcement, updateRate: 0.1' },
                    { name: 'performance', label: 'Performance', type: 'object', placeholder: 'maxAgents: 50, updateInterval: 16' }
                ]
            },
            'ui-component': {
                fields: [
                    { name: 'title', label: 'Title', type: 'text', placeholder: 'Interactive Dashboard' },
                    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Real-time gaming dashboard with live updates' },
                    { name: 'functionality', label: 'Functionality', type: 'array', placeholder: 'Real-time stats, Interactive charts' },
                    { name: 'design', label: 'Design', type: 'object', placeholder: 'theme: dark, responsive: true' },
                    { name: 'accessibility', label: 'Accessibility', type: 'object', placeholder: 'screenReader: true, keyboardNav: true' }
                ]
            }
        };

        const currentTemplate = templates[selectedTemplate];

        return (
            <div className="template-form">
                <h3>Create New Specification</h3>
                <div className="template-selector">
                    <label>Template:</label>
                    <select 
                        value={selectedTemplate} 
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                    >
                        <option value="game-mechanic">Game Mechanic</option>
                        <option value="ai-system">AI System</option>
                        <option value="ui-component">UI Component</option>
                    </select>
                </div>
                
                <div className="form-fields">
                    {currentTemplate.fields.map(field => (
                        <div key={field.name} className="form-field">
                            <label>{field.label}:</label>
                            {field.type === 'textarea' ? (
                                <textarea
                                    value={specData[field.name] || ''}
                                    onChange={(e) => setSpecData({
                                        ...specData,
                                        [field.name]: e.target.value
                                    })}
                                    placeholder={field.placeholder}
                                />
                            ) : field.type === 'array' ? (
                                <input
                                    type="text"
                                    value={specData[field.name] || ''}
                                    onChange={(e) => setSpecData({
                                        ...specData,
                                        [field.name]: e.target.value.split(',').map(s => s.trim())
                                    })}
                                    placeholder={field.placeholder}
                                />
                            ) : field.type === 'object' ? (
                                <input
                                    type="text"
                                    value={specData[field.name] || ''}
                                    onChange={(e) => {
                                        try {
                                            const obj = JSON.parse(e.target.value);
                                            setSpecData({
                                                ...specData,
                                                [field.name]: obj
                                            });
                                        } catch {
                                            setSpecData({
                                                ...specData,
                                                [field.name]: e.target.value
                                            });
                                        }
                                    }}
                                    placeholder={field.placeholder}
                                />
                            ) : (
                                <input
                                    type={field.type}
                                    value={specData[field.name] || ''}
                                    onChange={(e) => setSpecData({
                                        ...specData,
                                        [field.name]: e.target.value
                                    })}
                                    placeholder={field.placeholder}
                                />
                            )}
                        </div>
                    ))}
                </div>
                
                <button 
                    className="create-button"
                    onClick={handleCreateSpecification}
                >
                    Create Specification
                </button>
            </div>
        );
    };

    const renderSpecificationsList = () => {
        return (
            <div className="specifications-list">
                <h3>Specifications ({specifications.length})</h3>
                <div className="specs-grid">
                    {specifications.map(spec => (
                        <div 
                            key={spec.id} 
                            className={`spec-card ${selectedSpec?.id === spec.id ? 'selected' : ''}`}
                            onClick={() => handleSelectSpecification(spec)}
                        >
                            <div className="spec-header">
                                <h4>{spec.data.title}</h4>
                                <span className={`status ${spec.status}`}>{spec.status}</span>
                            </div>
                            <p>{spec.data.description}</p>
                            <div className="spec-meta">
                                <span>Template: {spec.template}</span>
                                <span>Created: {new Date(spec.createdAt).toLocaleDateString()}</span>
                            </div>
                            {spec.implementation && (
                                <button 
                                    className="view-implementation"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setImplementation(spec.implementation);
                                    }}
                                >
                                    View Implementation
                                </button>
                            )}
                            {!spec.implementation && (
                                <button 
                                    className="generate-implementation"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleGenerateImplementation(spec.id);
                                    }}
                                >
                                    Generate Implementation
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderImplementation = () => {
        if (!implementation) return null;

        return (
            <div className="implementation-viewer">
                <h3>Generated Implementation</h3>
                <div className="code-container">
                    <pre>
                        <code>{implementation}</code>
                    </pre>
                </div>
                <div className="implementation-actions">
                    <button className="copy-code">Copy Code</button>
                    <button className="download-code">Download</button>
                    <button className="refine-code">Refine</button>
                </div>
            </div>
        );
    };

    return (
        <div className="specification-interface">
            <div className="interface-header">
                <h2>🎯 Specification-Driven Development</h2>
                <p>Create, manage, and generate implementations from specifications</p>
            </div>
            
            <div className="interface-content">
                <div className="left-panel">
                    {renderTemplateForm()}
                    {renderSpecificationsList()}
                </div>
                
                <div className="right-panel">
                    {selectedSpec && (
                        <div className="selected-spec">
                            <h3>Selected Specification</h3>
                            <div className="spec-details">
                                <h4>{selectedSpec.data.title}</h4>
                                <p>{selectedSpec.data.description}</p>
                                <div className="spec-data">
                                    <h5>Specification Data:</h5>
                                    <pre>{JSON.stringify(selectedSpec.data, null, 2)}</pre>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {renderImplementation()}
                </div>
            </div>
            
            <style jsx>{`
                .specification-interface {
                    padding: 20px;
                    background: #1a1a1a;
                    color: #ffffff;
                    min-height: 100vh;
                }
                
                .interface-header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                
                .interface-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                }
                
                .template-form, .specifications-list {
                    background: #2a2a2a;
                    padding: 20px;
                    border-radius: 8px;
                    border: 1px solid #333;
                }
                
                .form-field {
                    margin-bottom: 15px;
                }
                
                .form-field label {
                    display: block;
                    margin-bottom: 5px;
                    color: #00ff00;
                }
                
                .form-field input, .form-field textarea, .form-field select {
                    width: 100%;
                    padding: 8px;
                    background: #333;
                    border: 1px solid #555;
                    color: #ffffff;
                    border-radius: 4px;
                }
                
                .create-button {
                    background: #00ff00;
                    color: #000000;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                }
                
                .specs-grid {
                    display: grid;
                    gap: 15px;
                }
                
                .spec-card {
                    background: #333;
                    padding: 15px;
                    border-radius: 6px;
                    border: 1px solid #555;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .spec-card:hover {
                    border-color: #00ff00;
                }
                
                .spec-card.selected {
                    border-color: #00ff00;
                    background: #2a2a2a;
                }
                
                .spec-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                
                .status {
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: bold;
                }
                
                .status.draft { background: #ffaa00; color: #000; }
                .status.implemented { background: #00ff00; color: #000; }
                .status.refined { background: #0088ff; color: #fff; }
                
                .spec-meta {
                    display: flex;
                    gap: 15px;
                    font-size: 12px;
                    color: #888;
                    margin-top: 10px;
                }
                
                .generate-implementation, .view-implementation {
                    background: #0088ff;
                    color: #ffffff;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    margin-top: 10px;
                }
                
                .implementation-viewer {
                    background: #2a2a2a;
                    padding: 20px;
                    border-radius: 8px;
                    border: 1px solid #333;
                }
                
                .code-container {
                    background: #1a1a1a;
                    border: 1px solid #555;
                    border-radius: 4px;
                    padding: 15px;
                    margin: 15px 0;
                    overflow-x: auto;
                }
                
                .code-container pre {
                    margin: 0;
                    color: #00ff00;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                }
                
                .implementation-actions {
                    display: flex;
                    gap: 10px;
                }
                
                .implementation-actions button {
                    background: #333;
                    color: #ffffff;
                    border: 1px solid #555;
                    padding: 8px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .implementation-actions button:hover {
                    background: #444;
                }
                
                .selected-spec {
                    background: #2a2a2a;
                    padding: 20px;
                    border-radius: 8px;
                    border: 1px solid #333;
                    margin-bottom: 20px;
                }
                
                .spec-data pre {
                    background: #1a1a1a;
                    padding: 10px;
                    border-radius: 4px;
                    overflow-x: auto;
                    font-size: 12px;
                }
            `}</style>
        </div>
    );
};

export default SpecificationInterface; 