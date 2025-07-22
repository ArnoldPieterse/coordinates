/**
 * Simple Working App Component
 * Renders the main application without complex dependencies
 */

import React, { useState, useEffect } from 'react';
import SpecificationInterface from './components/SpecificationInterface.jsx';
import MLInterface from './components/MLInterface.jsx';
import UITeamInterface from './components/UITeamInterface.jsx';
import DesignSystemInterface from './components/DesignSystemInterface.jsx';
import WebScrapingAIInterface from './components/WebScrapingAIInterface.jsx';
import MCPInterface from './components/MCPInterface.jsx';

const App = ({ errorHandler, securityFixer }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [status, setStatus] = useState('initializing');
    const [currentView, setCurrentView] = useState('main'); // 'main', 'specification', 'ml', 'ui-team', 'design-system', 'web-scraping-ai', or 'mcp'

    useEffect(() => {
        const initializeApp = async () => {
            try {
                setStatus('loading');
                
                // Simulate app initialization
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                setStatus('ready');
                setIsLoaded(true);
                
                console.log('[APP] Application loaded successfully');
                
            } catch (error) {
                console.error('[APP] Failed to initialize:', error);
                setStatus('error');
                
                if (errorHandler) {
                    errorHandler.handleError(error, { provider: 'app' });
                }
            }
        };

        initializeApp();
    }, [errorHandler]);

    if (!isLoaded) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#1a1a1a',
                color: '#ffffff',
                fontFamily: 'Arial, sans-serif'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h1>🎯 Rekursing</h1>
                    <p>Recursive AI Gaming Platform</p>
                    <div style={{ marginTop: '20px' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            border: '3px solid #333',
                            borderTop: '3px solid #00ff00',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto'
                        }}></div>
                        <p style={{ marginTop: '10px' }}>Initializing... {status}</p>
                    </div>
                </div>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // Render specific interfaces based on current view
    if (currentView === 'specification') {
        return <SpecificationInterface />;
    }

    if (currentView === 'ml') {
        return <MLInterface />;
    }

    if (currentView === 'ui-team') {
        return <UITeamInterface />;
    }

    if (currentView === 'design-system') {
        return <DesignSystemInterface />;
    }

    if (currentView === 'web-scraping-ai') {
        return <WebScrapingAIInterface />;
    }

    if (currentView === 'mcp') {
        return <MCPInterface />;
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        }}>
            {/* Header */}
            <header style={{
                backgroundColor: '#2a2a2a',
                padding: '20px',
                borderBottom: '1px solid #333'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h1 style={{ margin: 0, color: '#00ff00' }}>🎯 Rekursing</h1>
                    <nav>
                        <ul style={{
                            listStyle: 'none',
                            display: 'flex',
                            gap: '20px',
                            margin: 0,
                            padding: 0
                        }}>
                            <li><a href="#" onClick={() => setCurrentView('main')} style={{ color: '#ffffff', textDecoration: 'none' }}>Home</a></li>
                            <li><a href="#" onClick={() => setCurrentView('specification')} style={{ color: '#ffffff', textDecoration: 'none' }}>Spec-Driven Dev</a></li>
                            <li><a href="#" onClick={() => setCurrentView('ml')} style={{ color: '#ffffff', textDecoration: 'none' }}>Machine Learning</a></li>
                            <li><a href="#" onClick={() => setCurrentView('ui-team')} style={{ color: '#ffffff', textDecoration: 'none' }}>UI Team</a></li>
                            <li><a href="#" onClick={() => setCurrentView('design-system')} style={{ color: '#ffffff', textDecoration: 'none' }}>Design System</a></li>
                            <li><a href="#" onClick={() => setCurrentView('web-scraping-ai')} style={{ color: '#ffffff', textDecoration: 'none' }}>Web Scraping & AI</a></li>
                            <li><a href="#" onClick={() => setCurrentView('mcp')} style={{ color: '#ffffff', textDecoration: 'none' }}>MCP System</a></li>
                            <li><a href="#" style={{ color: '#ffffff', textDecoration: 'none' }}>AI Gaming</a></li>
                            <li><a href="#" style={{ color: '#ffffff', textDecoration: 'none' }}>About</a></li>
                        </ul>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '40px 20px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ color: '#00ff00', marginBottom: '20px' }}>
                        Welcome to Rekursing
                    </h2>
                    <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
                        Advanced AI-powered recursive gaming platform with specification-driven development, machine learning, specialized UI team, integrated design tools, web scraping capabilities, and Model Context Protocol (MCP) integration
                    </p>
                </div>

                {/* Status Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px',
                    marginBottom: '40px'
                }}>
                    <div style={{
                        backgroundColor: '#2a2a2a',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #333'
                    }}>
                        <h3 style={{ color: '#00ff00', marginTop: 0 }}>🚀 System Status</h3>
                        <p>✅ Application Loaded</p>
                        <p>✅ Security Fixes Applied</p>
                        <p>✅ Error Handling Active</p>
                    </div>

                    <div style={{
                        backgroundColor: '#2a2a2a',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #333'
                    }}>
                        <h3 style={{ color: '#00ff00', marginTop: 0 }}>🔧 Features</h3>
                        <p>🎮 AI Gaming Platform</p>
                        <p>🤖 Advanced AI Coordination</p>
                        <p>📋 Spec-Driven Development</p>
                        <p>🧠 Machine Learning System</p>
                        <p>🎨 UI Developer Team</p>
                        <p>🎨 Enhanced Design System</p>
                        <p>🕷️ Web Scraping & AI</p>
                        <p>🌐 MCP System</p>
                    </div>

                    <div style={{
                        backgroundColor: '#2a2a2a',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #333'
                    }}>
                        <h3 style={{ color: '#00ff00', marginTop: 0 }}>📊 Performance</h3>
                        <p>⚡ Fast Loading</p>
                        <p>🔒 Secure Connection</p>
                        <p>🎯 Optimized Rendering</p>
                        <p>🧠 ML Pipeline Ready</p>
                        <p>🎨 UI Team Active</p>
                        <p>🎨 Design Tools Integrated</p>
                        <p>🕷️ Scraping & AI Active</p>
                        <p>🌐 MCP Web Access</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ textAlign: 'center' }}>
                    <button 
                        style={{
                            backgroundColor: '#00ff00',
                            color: '#000000',
                            border: 'none',
                            padding: '15px 30px',
                            borderRadius: '5px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            margin: '0 10px',
                            fontWeight: 'bold'
                        }}
                        onClick={() => setCurrentView('specification')}
                    >
                        📋 Spec-Driven Dev
                    </button>
                    <button 
                        style={{
                            backgroundColor: '#0088ff',
                            color: '#ffffff',
                            border: 'none',
                            padding: '15px 30px',
                            borderRadius: '5px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            margin: '0 10px',
                            fontWeight: 'bold'
                        }}
                        onClick={() => setCurrentView('ml')}
                    >
                        🧠 Machine Learning
                    </button>
                    <button 
                        style={{
                            backgroundColor: '#ff8800',
                            color: '#ffffff',
                            border: 'none',
                            padding: '15px 30px',
                            borderRadius: '5px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            margin: '0 10px',
                            fontWeight: 'bold'
                        }}
                        onClick={() => setCurrentView('ui-team')}
                    >
                        🎨 UI Team
                    </button>
                    <button 
                        style={{
                            backgroundColor: '#ff0088',
                            color: '#ffffff',
                            border: 'none',
                            padding: '15px 30px',
                            borderRadius: '5px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            margin: '0 10px',
                            fontWeight: 'bold'
                        }}
                        onClick={() => setCurrentView('design-system')}
                    >
                        🎨 Design System
                    </button>
                    <button 
                        style={{
                            backgroundColor: '#8800ff',
                            color: '#ffffff',
                            border: 'none',
                            padding: '15px 30px',
                            borderRadius: '5px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            margin: '0 10px',
                            fontWeight: 'bold'
                        }}
                        onClick={() => setCurrentView('web-scraping-ai')}
                    >
                        🕷️ Web Scraping & AI
                    </button>
                    <button 
                        style={{
                            backgroundColor: '#00ffff',
                            color: '#000000',
                            border: 'none',
                            padding: '15px 30px',
                            borderRadius: '5px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            margin: '0 10px',
                            fontWeight: 'bold'
                        }}
                        onClick={() => setCurrentView('mcp')}
                    >
                        🌐 MCP System
                    </button>
                    <button style={{
                        backgroundColor: 'transparent',
                        color: '#00ff00',
                        border: '2px solid #00ff00',
                        padding: '15px 30px',
                        borderRadius: '5px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        margin: '0 10px'
                    }}>
                        🎮 Start Gaming
                    </button>
                </div>

                {/* New Features Section */}
                <div style={{ marginTop: '40px' }}>
                    <h3 style={{ color: '#00ff00', textAlign: 'center', marginBottom: '30px' }}>
                        🆕 Latest Enhancements
                    </h3>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '20px'
                    }}>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #333'
                        }}>
                            <h4 style={{ color: '#00ff00', marginTop: 0 }}>📋 Specification-Driven Development</h4>
                            <p>Create specifications and generate code automatically with AI-powered templates for game mechanics, AI systems, and UI components.</p>
                        </div>

                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #333'
                        }}>
                            <h4 style={{ color: '#00ff00', marginTop: 0 }}>🧠 Machine Learning System</h4>
                            <p>Complete ML pipeline with classification, regression, and clustering algorithms inspired by scikit-learn simplified repository.</p>
                        </div>

                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #333'
                        }}>
                            <h4 style={{ color: '#00ff00', marginTop: 0 }}>🎨 UI Developer Team</h4>
                            <p>10 specialized UI personas working collaboratively on architecture, design, performance, accessibility, and quality assurance.</p>
                        </div>

                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #333'
                        }}>
                            <h4 style={{ color: '#00ff00', marginTop: 0 }}>🎨 Enhanced Design System</h4>
                            <p>Integrated design tools: RealtimeColors, Icons8, Spline, Freehand, Balsamiq, and Stacksorted for professional design workflows.</p>
                        </div>

                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #333'
                        }}>
                            <h4 style={{ color: '#00ff00', marginTop: 0 }}>🕷️ Web Scraping & AI</h4>
                            <p>Instagram web scraping with Selenium and Custom GPT AI using Google Gemini for trend analysis and content generation.</p>
                        </div>

                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #333'
                        }}>
                            <h4 style={{ color: '#00ff00', marginTop: 0 }}>🌐 Model Context Protocol (MCP)</h4>
                            <p>Real-time web access and data collection with Bright Data integration for enhanced AI workflows and external resource access.</p>
                        </div>
                    </div>
                </div>

                {/* MCP System Showcase */}
                <div style={{ marginTop: '40px' }}>
                    <h3 style={{ color: '#00ff00', textAlign: 'center', marginBottom: '30px' }}>
                        🌐 MCP System Capabilities
                    </h3>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px'
                    }}>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>🌐 Model Context Protocol</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Real-time Web Access</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>🔧 Bright Data MCP</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Web Scraping & Data Collection</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>🕷️ Anti-Bot Detection</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Advanced Web Scraping</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>🔍 Social Media</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>LinkedIn & X Scraping</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>🌐 Browser API</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Browser Automation</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>📊 Data Extraction</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Structured Data Collection</p>
                        </div>
                    </div>
                </div>

                {/* Web Scraping & AI Showcase */}
                <div style={{ marginTop: '40px' }}>
                    <h3 style={{ color: '#00ff00', textAlign: 'center', marginBottom: '30px' }}>
                        🕷️ Web Scraping & AI Capabilities
                    </h3>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px'
                    }}>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>🕷️ Instagram Scraping</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Hashtag, Profile & Trending Data</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>🤖 Custom GPT AI</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Google Gemini Integration</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>📊 Trend Analysis</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Real-time Trend Insights</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>🎨 Content Generation</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>AI-Powered Content Creation</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>🔗 Combined Analysis</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Scraping + AI Integration</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>⚡ Real-time Processing</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Live Data & AI Analysis</p>
                        </div>
                    </div>
                </div>

                {/* Design Tools Showcase */}
                <div style={{ marginTop: '40px' }}>
                    <h3 style={{ color: '#00ff00', textAlign: 'center', marginBottom: '30px' }}>
                        🛠️ Integrated Design Tools
                    </h3>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px'
                    }}>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>🎨 RealtimeColors</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Dynamic Color Generation</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>🎯 Icons8</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Icon Library & Animations</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>🎮 Spline</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>3D Design & Prototyping</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>🤝 Freehand</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Collaborative Design</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>📋 Balsamiq</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Wireframing & Prototyping</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>📚 Stacksorted</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Design System Management</p>
                        </div>
                    </div>
                </div>

                {/* UI Team Showcase */}
                <div style={{ marginTop: '40px' }}>
                    <h3 style={{ color: '#00ff00', textAlign: 'center', marginBottom: '30px' }}>
                        🎨 Meet the UI Developer Team
                    </h3>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px'
                    }}>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>🎯 Sarah Chen</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>UI Architect</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>🎨 Marcus Rodriguez</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Visual Designer</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>⚡ Alex Thompson</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Performance Engineer</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>📱 Priya Patel</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Responsive Specialist</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>♿ David Kim</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Accessibility Expert</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>🎭 Emma Wilson</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Animation Specialist</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>🔧 James Liu</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Component Engineer</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>🌐 Sofia Martinez</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Internationalization Expert</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>🔒 Ryan O'Connor</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Security Specialist</p>
                        </div>
                        <div style={{
                            backgroundColor: '#2a2a2a',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <h5 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>🧪 Lisa Johnson</h5>
                            <p style={{ fontSize: '12px', margin: 0 }}>Testing Expert</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{
                backgroundColor: '#2a2a2a',
                padding: '20px',
                borderTop: '1px solid #333',
                textAlign: 'center',
                marginTop: '40px'
            }}>
                <p style={{ margin: 0, color: '#888' }}>
                    © 2024 Rekursing - Recursive AI Gaming Platform
                </p>
            </footer>
        </div>
    );
};

export default App; 