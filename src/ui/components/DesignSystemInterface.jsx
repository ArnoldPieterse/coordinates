/**
 * Enhanced Design System Interface
 * Integrates RealtimeColors, Icons8, Spline, Freehand, Balsamiq, and Stacksorted
 */

import React, { useState, useEffect } from 'react';
import DesignSystem from '../../core/DesignSystem.js';

const DesignSystemInterface = () => {
    const [designSystem] = useState(new DesignSystem());
    const [activeTab, setActiveTab] = useState('colors');
    const [systemStatus, setSystemStatus] = useState('initializing');
    const [currentTheme, setCurrentTheme] = useState('gaming');
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [collaborationSession, setCollaborationSession] = useState(null);

    useEffect(() => {
        setupDesignSystem();
    }, []);

    const setupDesignSystem = () => {
        designSystem.on('system-ready', (data) => {
            console.log('[DESIGN] System ready:', data);
            setSystemStatus('ready');
        });

        designSystem.getColorSystem().on('theme-changed', (data) => {
            console.log('[DESIGN] Theme changed:', data);
            setCurrentTheme(data.theme);
        });

        designSystem.getColorSystem().on('palette-generated', (data) => {
            console.log('[DESIGN] New palette generated:', data);
        });

        designSystem.getThreeDSystem().on('performance-updated', (data) => {
            console.log('[DESIGN] 3D performance updated:', data);
        });

        designSystem.getCollaborationSystem().on('session-created', (data) => {
            console.log('[DESIGN] Collaboration session created:', data);
        });

        designSystem.getComponentLibrary().on('component-created', (data) => {
            console.log('[DESIGN] Component created:', data);
        });
    };

    const renderColorSystem = () => {
        const colorSystem = designSystem.getColorSystem();
        const currentPalette = colorSystem.getCurrentPalette();
        const accessibility = colorSystem.validateAccessibility(currentPalette);

        return (
            <div className="color-system">
                <h3>🎨 Color System (RealtimeColors.com)</h3>
                
                <div className="theme-selector">
                    <h4>Theme Selection</h4>
                    <div className="theme-buttons">
                        {['gaming', 'professional', 'dark', 'realtime'].map(theme => (
                            <button
                                key={theme}
                                className={`theme-btn ${currentTheme === theme ? 'active' : ''}`}
                                onClick={() => colorSystem.setTheme(theme)}
                            >
                                {theme.charAt(0).toUpperCase() + theme.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="color-palette">
                    <h4>Current Palette</h4>
                    <div className="color-grid">
                        {currentPalette && Object.entries(currentPalette).map(([name, color]) => (
                            <div key={name} className="color-item">
                                <div 
                                    className="color-swatch" 
                                    style={{ backgroundColor: color }}
                                ></div>
                                <span className="color-name">{name}</span>
                                <span className="color-value">{color}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="accessibility-check">
                    <h4>Accessibility Validation</h4>
                    <div className={`accessibility-status ${accessibility.valid ? 'valid' : 'invalid'}`}>
                        <span className="status-icon">
                            {accessibility.valid ? '✅' : '❌'}
                        </span>
                        <span className="status-text">
                            {accessibility.valid ? 'WCAG Compliant' : 'Needs Improvement'}
                        </span>
                    </div>
                    <div className="contrast-ratios">
                        {Object.entries(accessibility.ratios || {}).map(([color, ratio]) => (
                            <div key={color} className="contrast-item">
                                <span className="color-name">{color}</span>
                                <span className="ratio">{ratio.toFixed(2)}:1</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderIconSystem = () => {
        const iconSystem = designSystem.getIconSystem();
        const categories = Array.from(iconSystem.categories.keys());

        return (
            <div className="icon-system">
                <h3>🎯 Icon System (Icons8.com)</h3>
                
                <div className="icon-categories">
                    <h4>Icon Categories</h4>
                    <div className="category-grid">
                        {categories.map(category => (
                            <div key={category} className="category-card">
                                <h5>{category.charAt(0).toUpperCase() + category.slice(1)}</h5>
                                <div className="icon-preview">
                                    {iconSystem.categories.get(category).slice(0, 4).map(iconName => (
                                        <div key={iconName} className="icon-item">
                                            <div 
                                                className="icon-display"
                                                dangerouslySetInnerHTML={{ 
                                                    __html: iconSystem.getIcon(category, iconName).svg 
                                                }}
                                            ></div>
                                            <span className="icon-name">{iconName}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="icon-animations">
                    <h4>Icon Animations</h4>
                    <div className="animation-demo">
                        {['pulse', 'rotate', 'bounce'].map(animation => (
                            <div key={animation} className="animation-item">
                                <div 
                                    className={`animated-icon ${animation}`}
                                    dangerouslySetInnerHTML={{ 
                                        __html: iconSystem.getIcon('ui', 'star').svg 
                                    }}
                                ></div>
                                <span className="animation-name">{animation}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const render3DSystem = () => {
        const threeDSystem = designSystem.getThreeDSystem();
        const performance = threeDSystem.performance;

        return (
            <div className="three-d-system">
                <h3>🎮 3D System (Spline.design)</h3>
                
                <div className="performance-metrics">
                    <h4>Performance Metrics</h4>
                    <div className="metrics-grid">
                        <div className="metric-card">
                            <span className="metric-label">FPS</span>
                            <span className="metric-value">{performance.fps.toFixed(1)}</span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">Memory</span>
                            <span className="metric-value">{performance.memory.toFixed(1)}%</span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">Triangles</span>
                            <span className="metric-value">{performance.triangles.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="scene-management">
                    <h4>Scene Management</h4>
                    <div className="scene-list">
                        {Array.from(threeDSystem.scenes.keys()).map(sceneName => (
                            <div key={sceneName} className="scene-item">
                                <h5>{threeDSystem.scenes.get(sceneName).name}</h5>
                                <div className="scene-details">
                                    <span>Objects: {threeDSystem.scenes.get(sceneName).objects.length}</span>
                                    <span>Lighting: {threeDSystem.scenes.get(sceneName).lighting}</span>
                                    <span>Camera: {threeDSystem.scenes.get(sceneName).camera}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="component-creation">
                    <h4>3D Component Creation</h4>
                    <button 
                        className="create-3d-btn"
                        onClick={() => {
                            const component = threeDSystem.create3DComponent('button', {
                                lod: 'high',
                                culling: true,
                                altText: '3D Button Component'
                            });
                            console.log('3D Component created:', component);
                        }}
                    >
                        Create 3D Button
                    </button>
                </div>
            </div>
        );
    };

    const renderCollaborationSystem = () => {
        const collaborationSystem = designSystem.getCollaborationSystem();

        return (
            <div className="collaboration-system">
                <h3>🤝 Collaboration System (FreehandApp.com)</h3>
                
                <div className="session-management">
                    <h4>Session Management</h4>
                    <button 
                        className="create-session-btn"
                        onClick={() => {
                            const session = collaborationSystem.createSession('Design Review', [
                                { id: 'user1', name: 'Sarah Chen', role: 'UI Architect' },
                                { id: 'user2', name: 'Marcus Rodriguez', role: 'Visual Designer' }
                            ]);
                            setCollaborationSession(session);
                        }}
                    >
                        Create Design Review Session
                    </button>
                    
                    {collaborationSession && (
                        <div className="active-session">
                            <h5>Active Session: {collaborationSession.name}</h5>
                            <div className="session-details">
                                <span>Participants: {collaborationSession.participants.length}</span>
                                <span>Status: {collaborationSession.status}</span>
                                <span>Created: {collaborationSession.createdAt.toLocaleTimeString()}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="feedback-system">
                    <h4>Feedback System</h4>
                    <div className="feedback-form">
                        <textarea 
                            placeholder="Add your feedback..."
                            className="feedback-input"
                        ></textarea>
                        <button 
                            className="submit-feedback-btn"
                            onClick={() => {
                                if (collaborationSession) {
                                    collaborationSystem.addFeedback(collaborationSession.id, {
                                        author: 'Current User',
                                        message: 'Great design work!',
                                        type: 'positive'
                                    });
                                }
                            }}
                        >
                            Submit Feedback
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderPrototypeSystem = () => {
        const prototypeSystem = designSystem.getPrototypeSystem();

        return (
            <div className="prototype-system">
                <h3>📋 Prototype System (Balsamiq.com)</h3>
                
                <div className="template-gallery">
                    <h4>Wireframe Templates</h4>
                    <div className="template-grid">
                        {Array.from(prototypeSystem.templates.keys()).map(templateName => (
                            <div key={templateName} className="template-card">
                                <h5>{prototypeSystem.templates.get(templateName).name}</h5>
                                <div className="template-details">
                                    <span>Components: {prototypeSystem.templates.get(templateName).components.length}</span>
                                    <span>Layout: {prototypeSystem.templates.get(templateName).layout}</span>
                                </div>
                                <button 
                                    className="use-template-btn"
                                    onClick={() => {
                                        const wireframe = prototypeSystem.createWireframe(templateName, {
                                            responsive: true,
                                            accessibility: true
                                        });
                                        console.log('Wireframe created:', wireframe);
                                    }}
                                >
                                    Use Template
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="user-flow-creation">
                    <h4>User Flow Creation</h4>
                    <button 
                        className="create-flow-btn"
                        onClick={() => {
                            const userFlow = prototypeSystem.createUserFlow('Game Onboarding', [
                                { id: 'welcome', name: 'Welcome Screen' },
                                { id: 'tutorial', name: 'Tutorial' },
                                { id: 'gameplay', name: 'Start Game' }
                            ]);
                            console.log('User flow created:', userFlow);
                        }}
                    >
                        Create User Flow
                    </button>
                </div>
            </div>
        );
    };

    const renderComponentLibrary = () => {
        const componentLibrary = designSystem.getComponentLibrary();
        const categories = Array.from(componentLibrary.categories.keys());

        return (
            <div className="component-library">
                <h3>📚 Component Library (Stacksorted.com)</h3>
                
                <div className="category-overview">
                    <h4>Component Categories</h4>
                    <div className="category-list">
                        {categories.map(category => (
                            <div key={category} className="category-item">
                                <h5>{componentLibrary.categories.get(category).name}</h5>
                                <p>{componentLibrary.categories.get(category).description}</p>
                                <div className="component-count">
                                    {componentLibrary.categories.get(category).components.length} components
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="component-creation">
                    <h4>Create New Component</h4>
                    <div className="create-component-form">
                        <select className="category-select">
                            <option value="">Select Category</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {componentLibrary.categories.get(category).name}
                                </option>
                            ))}
                        </select>
                        <input 
                            type="text" 
                            placeholder="Component Name"
                            className="component-name-input"
                        />
                        <button 
                            className="create-component-btn"
                            onClick={() => {
                                const component = componentLibrary.createComponent('buttons', 'custom', {
                                    variant: 'primary',
                                    size: 'medium'
                                });
                                console.log('Component created:', component);
                            }}
                        >
                            Create Component
                        </button>
                    </div>
                </div>

                <div className="component-list">
                    <h4>Recent Components</h4>
                    <div className="components-grid">
                        {componentLibrary.getAllComponents().slice(0, 6).map(component => (
                            <div key={component.id} className="component-card">
                                <h5>{component.name}</h5>
                                <span className="component-category">{component.category}</span>
                                <span className="component-version">v{component.version}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="design-system-interface">
            <div className="interface-header">
                <h2>🎨 Enhanced Design System</h2>
                <p>Integrated design tools: RealtimeColors, Icons8, Spline, Freehand, Balsamiq, Stacksorted</p>
                <div className="system-status">
                    Status: <span className={`status ${systemStatus}`}>{systemStatus}</span>
                </div>
            </div>
            
            <div className="interface-content">
                <div className="tab-navigation">
                    <button 
                        className={`tab-btn ${activeTab === 'colors' ? 'active' : ''}`}
                        onClick={() => setActiveTab('colors')}
                    >
                        🎨 Colors
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'icons' ? 'active' : ''}`}
                        onClick={() => setActiveTab('icons')}
                    >
                        🎯 Icons
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === '3d' ? 'active' : ''}`}
                        onClick={() => setActiveTab('3d')}
                    >
                        🎮 3D
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'collaboration' ? 'active' : ''}`}
                        onClick={() => setActiveTab('collaboration')}
                    >
                        🤝 Collaboration
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'prototype' ? 'active' : ''}`}
                        onClick={() => setActiveTab('prototype')}
                    >
                        📋 Prototype
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'components' ? 'active' : ''}`}
                        onClick={() => setActiveTab('components')}
                    >
                        📚 Components
                    </button>
                </div>
                
                <div className="tab-content">
                    {activeTab === 'colors' && renderColorSystem()}
                    {activeTab === 'icons' && renderIconSystem()}
                    {activeTab === '3d' && render3DSystem()}
                    {activeTab === 'collaboration' && renderCollaborationSystem()}
                    {activeTab === 'prototype' && renderPrototypeSystem()}
                    {activeTab === 'components' && renderComponentLibrary()}
                </div>
            </div>
            
            <style jsx>{`
                .design-system-interface {
                    padding: 20px;
                    background: #1a1a1a;
                    color: #ffffff;
                    min-height: 100vh;
                }
                
                .interface-header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                
                .system-status {
                    margin-top: 10px;
                    font-size: 14px;
                }
                
                .status.initializing { color: #ffaa00; }
                .status.ready { color: #00ff00; }
                
                .interface-content {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .tab-navigation {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 30px;
                    flex-wrap: wrap;
                }
                
                .tab-btn {
                    background: #2a2a2a;
                    color: #ffffff;
                    border: 1px solid #555;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .tab-btn:hover {
                    background: #333;
                }
                
                .tab-btn.active {
                    background: #00ff00;
                    color: #000000;
                    border-color: #00ff00;
                }
                
                .tab-content {
                    background: #2a2a2a;
                    padding: 30px;
                    border-radius: 8px;
                    border: 1px solid #333;
                }
                
                .theme-selector {
                    margin-bottom: 30px;
                }
                
                .theme-buttons {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                
                .theme-btn {
                    background: #333;
                    color: #ffffff;
                    border: 1px solid #555;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .theme-btn:hover {
                    background: #444;
                }
                
                .theme-btn.active {
                    background: #00ff00;
                    color: #000000;
                    border-color: #00ff00;
                }
                
                .color-palette {
                    margin-bottom: 30px;
                }
                
                .color-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                }
                
                .color-item {
                    background: #1a1a1a;
                    padding: 15px;
                    border-radius: 6px;
                    text-align: center;
                }
                
                .color-swatch {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    margin: 0 auto 10px;
                    border: 2px solid #333;
                }
                
                .color-name {
                    display: block;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                
                .color-value {
                    display: block;
                    font-size: 12px;
                    color: #888;
                }
                
                .accessibility-check {
                    margin-bottom: 30px;
                }
                
                .accessibility-status {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 15px;
                    padding: 10px;
                    border-radius: 4px;
                }
                
                .accessibility-status.valid {
                    background: #1a2a1a;
                    border: 1px solid #00ff00;
                }
                
                .accessibility-status.invalid {
                    background: #2a1a1a;
                    border: 1px solid #ff4444;
                }
                
                .contrast-ratios {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 10px;
                }
                
                .contrast-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 5px 10px;
                    background: #1a1a1a;
                    border-radius: 4px;
                }
                
                .icon-categories {
                    margin-bottom: 30px;
                }
                
                .category-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                }
                
                .category-card {
                    background: #1a1a1a;
                    padding: 20px;
                    border-radius: 6px;
                    border: 1px solid #333;
                }
                
                .icon-preview {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-top: 15px;
                }
                
                .icon-item {
                    text-align: center;
                    padding: 10px;
                    background: #2a2a2a;
                    border-radius: 4px;
                }
                
                .icon-display {
                    width: 32px;
                    height: 32px;
                    margin: 0 auto 5px;
                    fill: #00ff00;
                }
                
                .icon-name {
                    font-size: 12px;
                    color: #888;
                }
                
                .icon-animations {
                    margin-bottom: 30px;
                }
                
                .animation-demo {
                    display: flex;
                    gap: 20px;
                    margin-top: 15px;
                }
                
                .animation-item {
                    text-align: center;
                    padding: 20px;
                    background: #1a1a1a;
                    border-radius: 6px;
                    border: 1px solid #333;
                }
                
                .animated-icon {
                    width: 48px;
                    height: 48px;
                    margin: 0 auto 10px;
                    fill: #00ff00;
                }
                
                .animated-icon.pulse {
                    animation: pulse 2s infinite;
                }
                
                .animated-icon.rotate {
                    animation: rotate 3s linear infinite;
                }
                
                .animated-icon.bounce {
                    animation: bounce 1s infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
                
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                
                .performance-metrics {
                    margin-bottom: 30px;
                }
                
                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                    margin-top: 15px;
                }
                
                .metric-card {
                    background: #1a1a1a;
                    padding: 20px;
                    border-radius: 6px;
                    text-align: center;
                    border: 1px solid #333;
                }
                
                .metric-label {
                    display: block;
                    font-size: 14px;
                    color: #888;
                    margin-bottom: 5px;
                }
                
                .metric-value {
                    display: block;
                    font-size: 24px;
                    font-weight: bold;
                    color: #00ff00;
                }
                
                .scene-management {
                    margin-bottom: 30px;
                }
                
                .scene-list {
                    display: grid;
                    gap: 15px;
                    margin-top: 15px;
                }
                
                .scene-item {
                    background: #1a1a1a;
                    padding: 15px;
                    border-radius: 6px;
                    border: 1px solid #333;
                }
                
                .scene-details {
                    display: flex;
                    gap: 20px;
                    margin-top: 10px;
                    font-size: 14px;
                    color: #888;
                }
                
                .create-3d-btn {
                    background: #0088ff;
                    color: #ffffff;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                }
                
                .session-management {
                    margin-bottom: 30px;
                }
                
                .create-session-btn {
                    background: #00ff00;
                    color: #000000;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    margin-bottom: 20px;
                }
                
                .active-session {
                    background: #1a1a1a;
                    padding: 20px;
                    border-radius: 6px;
                    border: 1px solid #333;
                }
                
                .session-details {
                    display: flex;
                    gap: 20px;
                    margin-top: 10px;
                    font-size: 14px;
                    color: #888;
                }
                
                .feedback-system {
                    margin-bottom: 30px;
                }
                
                .feedback-form {
                    margin-top: 15px;
                }
                
                .feedback-input {
                    width: 100%;
                    height: 100px;
                    background: #1a1a1a;
                    border: 1px solid #555;
                    color: #ffffff;
                    padding: 10px;
                    border-radius: 4px;
                    margin-bottom: 10px;
                    resize: vertical;
                }
                
                .submit-feedback-btn {
                    background: #ff8800;
                    color: #ffffff;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .template-gallery {
                    margin-bottom: 30px;
                }
                
                .template-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-top: 15px;
                }
                
                .template-card {
                    background: #1a1a1a;
                    padding: 20px;
                    border-radius: 6px;
                    border: 1px solid #333;
                }
                
                .template-details {
                    display: flex;
                    gap: 15px;
                    margin: 10px 0;
                    font-size: 14px;
                    color: #888;
                }
                
                .use-template-btn {
                    background: #0088ff;
                    color: #ffffff;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .create-flow-btn {
                    background: #00ff00;
                    color: #000000;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                }
                
                .category-overview {
                    margin-bottom: 30px;
                }
                
                .category-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-top: 15px;
                }
                
                .category-item {
                    background: #1a1a1a;
                    padding: 20px;
                    border-radius: 6px;
                    border: 1px solid #333;
                }
                
                .component-count {
                    font-size: 14px;
                    color: #00ff00;
                    margin-top: 10px;
                }
                
                .component-creation {
                    margin-bottom: 30px;
                }
                
                .create-component-form {
                    display: flex;
                    gap: 10px;
                    margin-top: 15px;
                    flex-wrap: wrap;
                }
                
                .category-select, .component-name-input {
                    background: #1a1a1a;
                    border: 1px solid #555;
                    color: #ffffff;
                    padding: 8px 12px;
                    border-radius: 4px;
                }
                
                .create-component-btn {
                    background: #00ff00;
                    color: #000000;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                }
                
                .component-list {
                    margin-bottom: 30px;
                }
                
                .components-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-top: 15px;
                }
                
                .component-card {
                    background: #1a1a1a;
                    padding: 15px;
                    border-radius: 6px;
                    border: 1px solid #333;
                }
                
                .component-category {
                    display: block;
                    font-size: 12px;
                    color: #888;
                    margin: 5px 0;
                }
                
                .component-version {
                    display: block;
                    font-size: 12px;
                    color: #00ff00;
                }
            `}</style>
        </div>
    );
};

export default DesignSystemInterface; 