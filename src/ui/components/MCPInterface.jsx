/**
 * MCP Interface
 * Integrates Model Context Protocol and Bright Data capabilities
 */

import React, { useState, useEffect } from 'react';
import MCPSystem from '../../core/MCPSystem.js';

const MCPInterface = () => {
    const [mcpSystem] = useState(new MCPSystem());
    const [activeTab, setActiveTab] = useState('overview');
    const [systemStatus, setSystemStatus] = useState('initializing');
    const [selectedServer, setSelectedServer] = useState('brightdata-mcp');
    const [selectedTool, setSelectedTool] = useState('');
    const [toolParameters, setToolParameters] = useState({});
    const [connections, setConnections] = useState([]);
    const [executionResults, setExecutionResults] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [brightDataConfig, setBrightDataConfig] = useState({
        apiToken: '',
        webUnlockerZone: '',
        browserZone: ''
    });

    useEffect(() => {
        setupMCPSystem();
    }, []);

    const setupMCPSystem = async () => {
        // Initialize MCP system
        mcpSystem.on('initialized', (data) => {
            console.log('[MCP-INTERFACE] MCP system ready:', data);
            setSystemStatus('ready');
        });

        mcpSystem.on('connection-established', (connection) => {
            console.log('[MCP-INTERFACE] Connection established:', connection);
            setConnections(prev => [...prev, connection]);
        });

        mcpSystem.on('tool-execution-started', (request) => {
            console.log('[MCP-INTERFACE] Tool execution started:', request);
        });

        mcpSystem.on('tool-execution-completed', (request) => {
            console.log('[MCP-INTERFACE] Tool execution completed:', request);
            setExecutionResults(prev => [request, ...prev.slice(0, 9)]);
        });

        mcpSystem.on('brightdata-configured', (server) => {
            console.log('[MCP-INTERFACE] Bright Data configured:', server);
        });

        // Initialize MCP system
        await mcpSystem.initialize();
    };

    const handleConfigureBrightData = async () => {
        setIsProcessing(true);
        
        try {
            await mcpSystem.initialize({
                brightData: {
                    apiToken: brightDataConfig.apiToken,
                    webUnlockerZone: brightDataConfig.webUnlockerZone,
                    browserZone: brightDataConfig.browserZone
                }
            });
            
            console.log('[MCP-INTERFACE] Bright Data configured successfully');
        } catch (error) {
            console.error('[MCP-INTERFACE] Bright Data configuration failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCreateConnection = async () => {
        setIsProcessing(true);
        
        try {
            const connection = await mcpSystem.createMCPConnection(selectedServer);
            console.log('[MCP-INTERFACE] Connection created:', connection);
        } catch (error) {
            console.error('[MCP-INTERFACE] Connection creation failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExecuteTool = async () => {
        if (!selectedTool || connections.length === 0) return;
        
        setIsProcessing(true);
        
        try {
            const connection = connections[0]; // Use first connection for simplicity
            const result = await mcpSystem.executeMCPTool(connection.id, selectedTool, toolParameters);
            
            console.log('[MCP-INTERFACE] Tool execution result:', result);
        } catch (error) {
            console.error('[MCP-INTERFACE] Tool execution failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const renderOverview = () => {
        const status = mcpSystem.getStatus();
        const servers = mcpSystem.getMCPServers();
        
        return (
            <div className="mcp-overview">
                <h3>🌐 MCP System Overview</h3>
                
                <div className="system-status">
                    <h4>System Status</h4>
                    <div className="status-grid">
                        <div className="status-card">
                            <span className="status-label">Status</span>
                            <span className={`status-value ${systemStatus}`}>{systemStatus}</span>
                        </div>
                        <div className="status-card">
                            <span className="status-label">MCP Servers</span>
                            <span className="status-value">{status.mcpServers}</span>
                        </div>
                        <div className="status-card">
                            <span className="status-label">Active Connections</span>
                            <span className="status-value">{status.activeConnections}</span>
                        </div>
                        <div className="status-card">
                            <span className="status-label">Rate Limit</span>
                            <span className="status-value">{status.rateLimits.remaining}/{status.rateLimits.maxRequests}</span>
                        </div>
                        <div className="status-card">
                            <span className="status-label">Bright Data</span>
                            <span className={`status-value ${status.brightDataConfigured ? 'configured' : 'not-configured'}`}>
                                {status.brightDataConfigured ? 'Configured' : 'Not Configured'}
                            </span>
                        </div>
                        <div className="status-card">
                            <span className="status-label">Web Data Cache</span>
                            <span className="status-value">{status.webDataCacheSize} items</span>
                        </div>
                    </div>
                </div>

                <div className="mcp-servers">
                    <h4>Available MCP Servers</h4>
                    <div className="servers-grid">
                        {servers.map(server => (
                            <div key={server.id} className="server-card">
                                <h5>{server.name}</h5>
                                <p>{server.description}</p>
                                <div className="server-capabilities">
                                    <h6>Capabilities:</h6>
                                    <div className="capabilities-list">
                                        {server.capabilities.map(cap => (
                                            <span key={cap} className="capability-tag">{cap}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="server-tools">
                                    <h6>Tools:</h6>
                                    <div className="tools-list">
                                        {server.tools.map(tool => (
                                            <span key={tool} className="tool-tag">{tool}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="server-status">
                                    <span className={`status ${server.status}`}>{server.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderBrightDataConfig = () => {
        return (
            <div className="brightdata-config">
                <h3>🔧 Bright Data Configuration</h3>
                
                <div className="config-description">
                    <p>Configure Bright Data MCP server for web scraping and data collection capabilities.</p>
                </div>

                <div className="config-form">
                    <div className="form-group">
                        <label>API Token:</label>
                        <input
                            type="password"
                            value={brightDataConfig.apiToken}
                            onChange={(e) => setBrightDataConfig(prev => ({ ...prev, apiToken: e.target.value }))}
                            placeholder="Enter your Bright Data API token"
                            className="config-input"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Web Unlocker Zone (Optional):</label>
                        <input
                            type="text"
                            value={brightDataConfig.webUnlockerZone}
                            onChange={(e) => setBrightDataConfig(prev => ({ ...prev, webUnlockerZone: e.target.value }))}
                            placeholder="Enter Web Unlocker zone name"
                            className="config-input"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Browser Zone (Optional):</label>
                        <input
                            type="text"
                            value={brightDataConfig.browserZone}
                            onChange={(e) => setBrightDataConfig(prev => ({ ...prev, browserZone: e.target.value }))}
                            placeholder="Enter Browser zone name"
                            className="config-input"
                        />
                    </div>
                    
                    <button
                        onClick={handleConfigureBrightData}
                        disabled={isProcessing || !brightDataConfig.apiToken}
                        className="config-btn"
                    >
                        {isProcessing ? 'Configuring...' : 'Configure Bright Data'}
                    </button>
                </div>

                <div className="brightdata-info">
                    <h4>Bright Data MCP Features</h4>
                    <div className="features-grid">
                        <div className="feature-card">
                            <h5>🕷️ Web Scraping</h5>
                            <p>Advanced web scraping with anti-bot detection</p>
                        </div>
                        <div className="feature-card">
                            <h5>🔍 Social Media</h5>
                            <p>LinkedIn and X (Twitter) data extraction</p>
                        </div>
                        <div className="feature-card">
                            <h5>🌐 Browser API</h5>
                            <p>Browser automation and screenshot capture</p>
                        </div>
                        <div className="feature-card">
                            <h5>📊 Data Extraction</h5>
                            <p>Structured data extraction from websites</p>
                        </div>
                        <div className="feature-card">
                            <h5>🔎 Search Engine</h5>
                            <p>Search engine results and analysis</p>
                        </div>
                        <div className="feature-card">
                            <h5>🛡️ Anti-Bot</h5>
                            <p>Advanced anti-bot detection bypass</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderConnections = () => {
        return (
            <div className="mcp-connections">
                <h3>🔗 MCP Connections</h3>
                
                <div className="connection-controls">
                    <div className="connection-form">
                        <div className="form-group">
                            <label>Select MCP Server:</label>
                            <select
                                value={selectedServer}
                                onChange={(e) => setSelectedServer(e.target.value)}
                                className="server-select"
                            >
                                {mcpSystem.getMCPServers().map(server => (
                                    <option key={server.id} value={server.id}>
                                        {server.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <button
                            onClick={handleCreateConnection}
                            disabled={isProcessing}
                            className="connect-btn"
                        >
                            {isProcessing ? 'Connecting...' : 'Create Connection'}
                        </button>
                    </div>
                </div>

                <div className="connections-list">
                    <h4>Active Connections</h4>
                    
                    {connections.length === 0 ? (
                        <div className="no-connections">
                            <p>No active connections. Create a connection to get started.</p>
                        </div>
                    ) : (
                        <div className="connections-grid">
                            {connections.map(connection => (
                                <div key={connection.id} className="connection-card">
                                    <div className="connection-header">
                                        <h5>{connection.server.name}</h5>
                                        <span className={`status ${connection.status}`}>{connection.status}</span>
                                    </div>
                                    
                                    <div className="connection-details">
                                        <span>ID: {connection.id}</span>
                                        <span>Requests: {connection.requests}</span>
                                        <span>Errors: {connection.errors}</span>
                                        <span>Last Activity: {new Date(connection.lastActivity).toLocaleTimeString()}</span>
                                    </div>
                                    
                                    <div className="connection-actions">
                                        <button
                                            onClick={() => mcpSystem.closeConnection(connection.id)}
                                            className="close-btn"
                                        >
                                            Close Connection
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderToolExecution = () => {
        const servers = mcpSystem.getMCPServers();
        const selectedServerData = servers.find(s => s.id === selectedServer);
        
        return (
            <div className="tool-execution">
                <h3>🛠️ MCP Tool Execution</h3>
                
                <div className="tool-selection">
                    <div className="form-group">
                        <label>Select MCP Server:</label>
                        <select
                            value={selectedServer}
                            onChange={(e) => {
                                setSelectedServer(e.target.value);
                                setSelectedTool('');
                            }}
                            className="server-select"
                        >
                            {servers.map(server => (
                                <option key={server.id} value={server.id}>
                                    {server.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {selectedServerData && (
                        <div className="form-group">
                            <label>Select Tool:</label>
                            <select
                                value={selectedTool}
                                onChange={(e) => setSelectedTool(e.target.value)}
                                className="tool-select"
                            >
                                <option value="">Choose a tool...</option>
                                {selectedServerData.tools.map(tool => (
                                    <option key={tool} value={tool}>
                                        {tool}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {selectedTool && (
                    <div className="tool-parameters">
                        <h4>Tool Parameters</h4>
                        
                        {selectedTool === 'web_unlocker' && (
                            <div className="form-group">
                                <label>URL:</label>
                                <input
                                    type="url"
                                    value={toolParameters.url || ''}
                                    onChange={(e) => setToolParameters(prev => ({ ...prev, url: e.target.value }))}
                                    placeholder="https://example.com"
                                    className="parameter-input"
                                />
                            </div>
                        )}
                        
                        {selectedTool === 'browser_api' && (
                            <>
                                <div className="form-group">
                                    <label>URL:</label>
                                    <input
                                        type="url"
                                        value={toolParameters.url || ''}
                                        onChange={(e) => setToolParameters(prev => ({ ...prev, url: e.target.value }))}
                                        placeholder="https://example.com"
                                        className="parameter-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Actions (JSON):</label>
                                    <textarea
                                        value={toolParameters.actions || ''}
                                        onChange={(e) => setToolParameters(prev => ({ ...prev, actions: e.target.value }))}
                                        placeholder='[{"type": "click", "selector": "button"}]'
                                        className="parameter-textarea"
                                        rows="3"
                                    />
                                </div>
                            </>
                        )}
                        
                        {selectedTool === 'linkedin_scraper' && (
                            <>
                                <div className="form-group">
                                    <label>Profile URL:</label>
                                    <input
                                        type="url"
                                        value={toolParameters.profile_url || ''}
                                        onChange={(e) => setToolParameters(prev => ({ ...prev, profile_url: e.target.value }))}
                                        placeholder="https://linkedin.com/in/username"
                                        className="parameter-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Fields (comma-separated):</label>
                                    <input
                                        type="text"
                                        value={toolParameters.fields || ''}
                                        onChange={(e) => setToolParameters(prev => ({ ...prev, fields: e.target.value }))}
                                        placeholder="name,headline,experience"
                                        className="parameter-input"
                                    />
                                </div>
                            </>
                        )}
                        
                        {selectedTool === 'x_scraper' && (
                            <>
                                <div className="form-group">
                                    <label>Username:</label>
                                    <input
                                        type="text"
                                        value={toolParameters.username || ''}
                                        onChange={(e) => setToolParameters(prev => ({ ...prev, username: e.target.value }))}
                                        placeholder="username"
                                        className="parameter-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tweet Count:</label>
                                    <input
                                        type="number"
                                        value={toolParameters.tweet_count || 10}
                                        onChange={(e) => setToolParameters(prev => ({ ...prev, tweet_count: parseInt(e.target.value) }))}
                                        min="1"
                                        max="100"
                                        className="parameter-input"
                                    />
                                </div>
                            </>
                        )}
                        
                        {selectedTool === 'search_engine' && (
                            <>
                                <div className="form-group">
                                    <label>Query:</label>
                                    <input
                                        type="text"
                                        value={toolParameters.query || ''}
                                        onChange={(e) => setToolParameters(prev => ({ ...prev, query: e.target.value }))}
                                        placeholder="Search query"
                                        className="parameter-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Limit:</label>
                                    <input
                                        type="number"
                                        value={toolParameters.limit || 10}
                                        onChange={(e) => setToolParameters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                                        min="1"
                                        max="50"
                                        className="parameter-input"
                                    />
                                </div>
                            </>
                        )}
                        
                        {selectedTool === 'data_extractor' && (
                            <>
                                <div className="form-group">
                                    <label>URL:</label>
                                    <input
                                        type="url"
                                        value={toolParameters.url || ''}
                                        onChange={(e) => setToolParameters(prev => ({ ...prev, url: e.target.value }))}
                                        placeholder="https://example.com"
                                        className="parameter-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Selectors (JSON):</label>
                                    <textarea
                                        value={toolParameters.selectors || ''}
                                        onChange={(e) => setToolParameters(prev => ({ ...prev, selectors: e.target.value }))}
                                        placeholder='{"title": "h1", "price": ".price"}'
                                        className="parameter-textarea"
                                        rows="3"
                                    />
                                </div>
                            </>
                        )}
                        
                        <button
                            onClick={handleExecuteTool}
                            disabled={isProcessing || !selectedTool || connections.length === 0}
                            className="execute-btn"
                        >
                            {isProcessing ? 'Executing...' : 'Execute Tool'}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderResults = () => {
        return (
            <div className="execution-results">
                <h3>📊 Execution Results</h3>
                
                {executionResults.length === 0 ? (
                    <div className="no-results">
                        <p>No execution results yet. Execute a tool to see results here.</p>
                    </div>
                ) : (
                    <div className="results-grid">
                        {executionResults.map((result, index) => (
                            <div key={result.id} className="result-card">
                                <div className="result-header">
                                    <h5>{result.toolName}</h5>
                                    <span className={`status ${result.status}`}>{result.status}</span>
                                </div>
                                
                                <div className="result-details">
                                    <span>Duration: {result.duration}ms</span>
                                    <span>Connection: {result.connectionId}</span>
                                </div>
                                
                                {result.result && (
                                    <div className="result-data">
                                        <h6>Result:</h6>
                                        <pre className="result-json">
                                            {JSON.stringify(result.result, null, 2)}
                                        </pre>
                                    </div>
                                )}
                                
                                {result.error && (
                                    <div className="result-error">
                                        <h6>Error:</h6>
                                        <p>{result.error}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="mcp-interface">
            <div className="interface-header">
                <h2>🌐 Model Context Protocol (MCP) System</h2>
                <p>Real-time web access and data collection with Bright Data integration</p>
                <div className="system-status-overview">
                    <span className={`status ${systemStatus}`}>MCP: {systemStatus}</span>
                </div>
            </div>
            
            <div className="interface-content">
                <div className="tab-navigation">
                    <button 
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        📊 Overview
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'brightdata' ? 'active' : ''}`}
                        onClick={() => setActiveTab('brightdata')}
                    >
                        🔧 Bright Data Config
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'connections' ? 'active' : ''}`}
                        onClick={() => setActiveTab('connections')}
                    >
                        🔗 Connections
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'tools' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tools')}
                    >
                        🛠️ Tool Execution
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
                        onClick={() => setActiveTab('results')}
                    >
                        📊 Results
                    </button>
                </div>
                
                <div className="tab-content">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'brightdata' && renderBrightDataConfig()}
                    {activeTab === 'connections' && renderConnections()}
                    {activeTab === 'tools' && renderToolExecution()}
                    {activeTab === 'results' && renderResults()}
                </div>
            </div>
            
            <style jsx>{`
                .mcp-interface {
                    padding: 20px;
                    background: #1a1a1a;
                    color: #ffffff;
                    min-height: 100vh;
                }
                
                .interface-header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                
                .system-status-overview {
                    margin-top: 10px;
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                }
                
                .status.initializing { color: #ffaa00; }
                .status.ready { color: #00ff00; }
                .status.configured { color: #00ff00; }
                .status.not-configured { color: #ff4444; }
                
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
                
                .system-status {
                    margin-bottom: 30px;
                }
                
                .status-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-top: 15px;
                }
                
                .status-card {
                    background: #1a1a1a;
                    padding: 15px;
                    border-radius: 6px;
                    border: 1px solid #333;
                    text-align: center;
                }
                
                .status-label {
                    display: block;
                    font-size: 12px;
                    color: #888;
                    margin-bottom: 5px;
                }
                
                .status-value {
                    display: block;
                    font-size: 18px;
                    font-weight: bold;
                    color: #00ff00;
                }
                
                .mcp-servers {
                    margin-bottom: 30px;
                }
                
                .servers-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                    margin-top: 15px;
                }
                
                .server-card {
                    background: #1a1a1a;
                    padding: 20px;
                    border-radius: 6px;
                    border: 1px solid #333;
                }
                
                .server-card h5 {
                    margin: 0 0 10px 0;
                    color: #00ff00;
                }
                
                .server-card p {
                    margin: 0 0 15px 0;
                    color: #888;
                }
                
                .server-capabilities, .server-tools {
                    margin-bottom: 15px;
                }
                
                .server-capabilities h6, .server-tools h6 {
                    margin: 0 0 10px 0;
                    color: #00ff00;
                    font-size: 14px;
                }
                
                .capabilities-list, .tools-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;
                }
                
                .capability-tag, .tool-tag {
                    background: #333;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    color: #00ff00;
                }
                
                .server-status {
                    text-align: right;
                }
                
                .status.ready { color: #00ff00; }
                .status.connecting { color: #ffaa00; }
                .status.connected { color: #00ff00; }
                .status.failed { color: #ff4444; }
                .status.closed { color: #888; }
                
                .brightdata-config {
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                .config-description {
                    margin-bottom: 30px;
                    text-align: center;
                    color: #888;
                }
                
                .config-form {
                    background: #1a1a1a;
                    padding: 20px;
                    border-radius: 6px;
                    border: 1px solid #333;
                    margin-bottom: 30px;
                }
                
                .form-group {
                    margin-bottom: 20px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    color: #00ff00;
                    font-weight: bold;
                }
                
                .config-input, .parameter-input, .server-select, .tool-select {
                    width: 100%;
                    background: #333;
                    border: 1px solid #555;
                    color: #ffffff;
                    padding: 10px;
                    border-radius: 4px;
                    font-size: 14px;
                }
                
                .parameter-textarea {
                    width: 100%;
                    background: #333;
                    border: 1px solid #555;
                    color: #ffffff;
                    padding: 10px;
                    border-radius: 4px;
                    font-size: 14px;
                    font-family: monospace;
                }
                
                .config-btn, .connect-btn, .execute-btn {
                    background: #0088ff;
                    color: #ffffff;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 14px;
                }
                
                .config-btn:hover, .connect-btn:hover, .execute-btn:hover {
                    background: #0066cc;
                }
                
                .config-btn:disabled, .connect-btn:disabled, .execute-btn:disabled {
                    background: #666;
                    cursor: not-allowed;
                }
                
                .brightdata-info {
                    margin-top: 30px;
                }
                
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-top: 15px;
                }
                
                .feature-card {
                    background: #1a1a1a;
                    padding: 15px;
                    border-radius: 6px;
                    border: 1px solid #333;
                    text-align: center;
                }
                
                .feature-card h5 {
                    margin: 0 0 10px 0;
                    color: #00ff00;
                }
                
                .feature-card p {
                    margin: 0;
                    font-size: 12px;
                    color: #888;
                }
                
                .connection-controls {
                    margin-bottom: 30px;
                }
                
                .connection-form {
                    display: flex;
                    gap: 15px;
                    align-items: end;
                    background: #1a1a1a;
                    padding: 20px;
                    border-radius: 6px;
                    border: 1px solid #333;
                }
                
                .connections-grid {
                    display: grid;
                    gap: 15px;
                    margin-top: 15px;
                }
                
                .connection-card {
                    background: #1a1a1a;
                    padding: 20px;
                    border-radius: 6px;
                    border: 1px solid #333;
                }
                
                .connection-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                
                .connection-header h5 {
                    margin: 0;
                    color: #00ff00;
                }
                
                .connection-details {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 10px;
                    margin-bottom: 15px;
                    font-size: 12px;
                    color: #888;
                }
                
                .connection-actions {
                    text-align: right;
                }
                
                .close-btn {
                    background: #ff4444;
                    color: #ffffff;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }
                
                .close-btn:hover {
                    background: #cc3333;
                }
                
                .tool-selection {
                    background: #1a1a1a;
                    padding: 20px;
                    border-radius: 6px;
                    border: 1px solid #333;
                    margin-bottom: 30px;
                }
                
                .tool-parameters {
                    background: #1a1a1a;
                    padding: 20px;
                    border-radius: 6px;
                    border: 1px solid #333;
                }
                
                .no-connections, .no-results {
                    text-align: center;
                    padding: 40px;
                    color: #888;
                }
                
                .results-grid {
                    display: grid;
                    gap: 15px;
                    margin-top: 15px;
                }
                
                .result-card {
                    background: #1a1a1a;
                    padding: 20px;
                    border-radius: 6px;
                    border: 1px solid #333;
                }
                
                .result-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                
                .result-header h5 {
                    margin: 0;
                    color: #00ff00;
                }
                
                .result-details {
                    display: flex;
                    gap: 20px;
                    font-size: 14px;
                    color: #888;
                    margin-bottom: 15px;
                }
                
                .result-data, .result-error {
                    background: #333;
                    padding: 15px;
                    border-radius: 4px;
                    margin-top: 15px;
                }
                
                .result-data h6, .result-error h6 {
                    margin: 0 0 10px 0;
                    color: #00ff00;
                }
                
                .result-json {
                    background: #1a1a1a;
                    padding: 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    overflow-x: auto;
                    white-space: pre-wrap;
                }
                
                .result-error p {
                    margin: 0;
                    color: #ff4444;
                }
                
                .status.processing { color: #ffaa00; }
                .status.completed { color: #00ff00; }
                .status.failed { color: #ff4444; }
            `}</style>
        </div>
    );
};

export default MCPInterface; 