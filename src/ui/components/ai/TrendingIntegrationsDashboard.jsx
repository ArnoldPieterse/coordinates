/**
 * Trending Integrations Dashboard
 * Comprehensive UI for all trending GitHub repository integrations
 */

import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import './TrendingIntegrationsDashboard.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement);

const TrendingIntegrationsDashboard = ({ integrationsManager, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [integrationStatus, setIntegrationStatus] = useState({});
    const [healthStatus, setHealthStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [aiResponse, setAiResponse] = useState(null);
    const [researchResults, setResearchResults] = useState(null);
    const [gameReport, setGameReport] = useState(null);
    const dashboardRef = useRef(null);

    useEffect(() => {
        initializeDashboard();
        return () => cleanup();
    }, [integrationsManager]);

    const initializeDashboard = async () => {
        if (!integrationsManager) return;

        try {
            // Get integration status
            const status = integrationsManager.getIntegrationStatus();
            setIntegrationStatus(status);

            // Perform health check
            const health = await integrationsManager.performHealthCheck();
            setHealthStatus(health);

            setIsLoading(false);
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
            setIsLoading(false);
        }
    };

    const cleanup = () => {
        // Cleanup if needed
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleAIRequest = async (prompt) => {
        try {
            const response = await integrationsManager.assistGameDevelopment(prompt);
            setAiResponse(response);
        } catch (error) {
            console.error('AI request failed:', error);
        }
    };

    const handleResearchRequest = async (topic) => {
        try {
            const results = await integrationsManager.researchGameTopic(topic);
            setResearchResults(results);
        } catch (error) {
            console.error('Research request failed:', error);
        }
    };

    const handleGenerateReport = async () => {
        try {
            const report = await integrationsManager.generateGameReport('comprehensive');
            setGameReport(report);
        } catch (error) {
            console.error('Report generation failed:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ready':
            case 'healthy':
                return '#4CAF50';
            case 'warning':
                return '#FF9800';
            case 'error':
            case 'critical':
                return '#F44336';
            default:
                return '#9E9E9E';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ready':
            case 'healthy':
                return '✅';
            case 'warning':
                return '⚠️';
            case 'error':
            case 'critical':
                return '❌';
            default:
                return '⏳';
        }
    };

    if (isLoading) {
        return (
            <div className="trending-dashboard loading">
                <div className="loading-spinner">🚀</div>
                <p>Initializing Trending Integrations...</p>
            </div>
        );
    }

    return (
        <div className="trending-dashboard" ref={dashboardRef}>
            {/* Header */}
            <div className="dashboard-header">
                <h2>🚀 Trending Integrations Dashboard</h2>
                <button className="close-button" onClick={onClose}>×</button>
            </div>

            {/* Navigation Tabs */}
            <div className="dashboard-tabs">
                <button
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => handleTabChange('overview')}
                >
                    Overview
                </button>
                <button
                    className={`tab ${activeTab === 'integrations' ? 'active' : ''}`}
                    onClick={() => handleTabChange('integrations')}
                >
                    Integrations
                </button>
                <button
                    className={`tab ${activeTab === 'ai-assistant' ? 'active' : ''}`}
                    onClick={() => handleTabChange('ai-assistant')}
                >
                    AI Assistant
                </button>
                <button
                    className={`tab ${activeTab === 'research' ? 'active' : ''}`}
                    onClick={() => handleTabChange('research')}
                >
                    Research
                </button>
                <button
                    className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => handleTabChange('analytics')}
                >
                    Analytics
                </button>
                <button
                    className={`tab ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => handleTabChange('security')}
                >
                    Security
                </button>
            </div>

            {/* Content Area */}
            <div className="dashboard-content">
                {activeTab === 'overview' && (
                    <OverviewTab 
                        integrationStatus={integrationStatus}
                        healthStatus={healthStatus}
                        getStatusColor={getStatusColor}
                        getStatusIcon={getStatusIcon}
                    />
                )}
                {activeTab === 'integrations' && (
                    <IntegrationsTab 
                        integrationStatus={integrationStatus}
                        getStatusColor={getStatusColor}
                        getStatusIcon={getStatusIcon}
                    />
                )}
                {activeTab === 'ai-assistant' && (
                    <AIAssistantTab 
                        integrationsManager={integrationsManager}
                        aiResponse={aiResponse}
                        onAIRequest={handleAIRequest}
                    />
                )}
                {activeTab === 'research' && (
                    <ResearchTab 
                        integrationsManager={integrationsManager}
                        researchResults={researchResults}
                        onResearchRequest={handleResearchRequest}
                    />
                )}
                {activeTab === 'analytics' && (
                    <AnalyticsTab 
                        integrationsManager={integrationsManager}
                        gameReport={gameReport}
                        onGenerateReport={handleGenerateReport}
                    />
                )}
                {activeTab === 'security' && (
                    <SecurityTab 
                        integrationsManager={integrationsManager}
                    />
                )}
            </div>
        </div>
    );
};

// Overview Tab Component
const OverviewTab = ({ integrationStatus, healthStatus, getStatusColor, getStatusIcon }) => {
    const totalIntegrations = Object.keys(integrationStatus).length;
    const readyIntegrations = Object.values(integrationStatus).filter(i => i.isReady).length;
    const healthPercentage = healthStatus ? (readyIntegrations / totalIntegrations) * 100 : 0;

    const chartData = {
        labels: ['Ready', 'Not Ready'],
        datasets: [{
            data: [readyIntegrations, totalIntegrations - readyIntegrations],
            backgroundColor: ['#4CAF50', '#F44336'],
            borderWidth: 0
        }]
    };

    return (
        <div className="overview-tab">
            {/* System Health Card */}
            <div className="card system-health-card">
                <h3>System Health</h3>
                <div className="health-indicator">
                    <div className="health-percentage">{Math.round(healthPercentage)}%</div>
                    <div className="health-status" style={{ color: getStatusColor(healthStatus?.overall) }}>
                        {getStatusIcon(healthStatus?.overall)} {healthStatus?.overall || 'Unknown'}
                    </div>
                </div>
                <div className="health-breakdown">
                    <div className="breakdown-item">
                        <span className="label">Total Integrations:</span>
                        <span className="value">{totalIntegrations}</span>
                    </div>
                    <div className="breakdown-item">
                        <span className="label">Ready:</span>
                        <span className="value positive">{readyIntegrations}</span>
                    </div>
                    <div className="breakdown-item">
                        <span className="label">Not Ready:</span>
                        <span className="value negative">{totalIntegrations - readyIntegrations}</span>
                    </div>
                </div>
            </div>

            {/* Integration Status Chart */}
            <div className="card integration-chart-card">
                <h3>Integration Status</h3>
                <div className="chart-container">
                    <Doughnut
                        data={chartData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'bottom'
                                }
                            }
                        }}
                    />
                </div>
            </div>

            {/* Trending Repositories */}
            <div className="card trending-repos-card">
                <h3>Trending GitHub Repositories</h3>
                <div className="repos-list">
                    {Object.entries(integrationStatus).map(([name, status]) => (
                        <div key={name} className="repo-item">
                            <div className="repo-icon">
                                {name === 'claude-code' && '🤖'}
                                {name === 'deep-research' && '🔍'}
                                {name === 'financial-system' && '💰'}
                                {name === 'knowledge-graph' && '🧠'}
                                {name === 'sql-chat' && '💬'}
                                {name === 'document-converter' && '📄'}
                                {name === 'security-scanner' && '🔒'}
                            </div>
                            <div className="repo-details">
                                <div className="repo-name">{status.name || name}</div>
                                <div className="repo-description">{status.description}</div>
                            </div>
                            <div className="repo-status" style={{ color: getStatusColor(status.isReady ? 'ready' : 'error') }}>
                                {getStatusIcon(status.isReady ? 'ready' : 'error')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Integrations Tab Component
const IntegrationsTab = ({ integrationStatus, getStatusColor, getStatusIcon }) => {
    return (
        <div className="integrations-tab">
            <div className="card integrations-list">
                <h3>Integration Details</h3>
                <div className="integration-items">
                    {Object.entries(integrationStatus).map(([name, status]) => (
                        <div key={name} className="integration-item">
                            <div className="integration-header">
                                <div className="integration-icon">
                                    {name === 'claude-code' && '🤖'}
                                    {name === 'deep-research' && '🔍'}
                                    {name === 'financial-system' && '💰'}
                                    {name === 'knowledge-graph' && '🧠'}
                                    {name === 'sql-chat' && '💬'}
                                    {name === 'document-converter' && '📄'}
                                    {name === 'security-scanner' && '🔒'}
                                </div>
                                <div className="integration-info">
                                    <div className="integration-name">{status.name || name}</div>
                                    <div className="integration-description">{status.description}</div>
                                </div>
                                <div className="integration-status" style={{ color: getStatusColor(status.isReady ? 'ready' : 'error') }}>
                                    {getStatusIcon(status.isReady ? 'ready' : 'error')} {status.isReady ? 'Ready' : 'Not Ready'}
                                </div>
                            </div>
                            <div className="integration-details">
                                <div className="detail-item">
                                    <span className="label">Status:</span>
                                    <span className="value">{status.isReady ? 'Active' : 'Inactive'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Initialized:</span>
                                    <span className="value">{status.isInitialized ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// AI Assistant Tab Component
const AIAssistantTab = ({ integrationsManager, aiResponse, onAIRequest }) => {
    const [prompt, setPrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsProcessing(true);
        await onAIRequest(prompt);
        setIsProcessing(false);
    };

    const quickPrompts = [
        'How can I optimize Three.js performance?',
        'Suggest multiplayer game mechanics',
        'Debug Socket.IO synchronization issues',
        'Generate game balance algorithms'
    ];

    return (
        <div className="ai-assistant-tab">
            <div className="card ai-chat-card">
                <h3>🤖 AI Development Assistant</h3>
                <div className="ai-chat-interface">
                    <form onSubmit={handleSubmit} className="prompt-form">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ask about game development, optimization, or debugging..."
                            className="prompt-input"
                            disabled={isProcessing}
                        />
                        <button type="submit" className="submit-button" disabled={isProcessing}>
                            {isProcessing ? 'Processing...' : 'Ask AI'}
                        </button>
                    </form>

                    <div className="quick-prompts">
                        <h4>Quick Prompts:</h4>
                        <div className="prompt-buttons">
                            {quickPrompts.map((quickPrompt, index) => (
                                <button
                                    key={index}
                                    onClick={() => setPrompt(quickPrompt)}
                                    className="quick-prompt-button"
                                >
                                    {quickPrompt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {aiResponse && (
                        <div className="ai-response">
                            <h4>AI Response:</h4>
                            <div className="response-content">
                                <div className="response-provider">
                                    Provider: {aiResponse.provider}
                                </div>
                                <div className="response-model">
                                    Model: {aiResponse.model}
                                </div>
                                <div className="response-text">
                                    {aiResponse.content}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Research Tab Component
const ResearchTab = ({ integrationsManager, researchResults, onResearchRequest }) => {
    const [topic, setTopic] = useState('');
    const [isResearching, setIsResearching] = useState(false);

    const handleResearch = async (researchTopic) => {
        setIsResearching(true);
        await onResearchRequest(researchTopic);
        setIsResearching(false);
    };

    const researchTopics = [
        'game-mechanics',
        'multiplayer-gaming',
        'real-time-systems',
        'three-js-optimization',
        'socket-io-synchronization',
        'educational-gaming',
        'financial-literacy-games',
        'ai-in-gaming'
    ];

    return (
        <div className="research-tab">
            <div className="card research-interface">
                <h3>🔍 Deep Research System</h3>
                
                <div className="research-topics">
                    <h4>Available Research Topics:</h4>
                    <div className="topic-grid">
                        {researchTopics.map((researchTopic) => (
                            <button
                                key={researchTopic}
                                onClick={() => handleResearch(researchTopic)}
                                className="research-topic-button"
                                disabled={isResearching}
                            >
                                {researchTopic}
                            </button>
                        ))}
                    </div>
                </div>

                {isResearching && (
                    <div className="research-progress">
                        <div className="progress-spinner">🔍</div>
                        <p>Conducting deep research...</p>
                    </div>
                )}

                {researchResults && (
                    <div className="research-results">
                        <h4>Research Results: {researchResults.topic}</h4>
                        <div className="results-summary">
                            <div className="result-item">
                                <span className="label">Duration:</span>
                                <span className="value">{Math.round(researchResults.duration / 1000)}s</span>
                            </div>
                            <div className="result-item">
                                <span className="label">Findings:</span>
                                <span className="value">{researchResults.findings.length}</span>
                            </div>
                            <div className="result-item">
                                <span className="label">Recommendations:</span>
                                <span className="value">{researchResults.recommendations.length}</span>
                            </div>
                        </div>
                        
                        <div className="findings-section">
                            <h5>Key Findings:</h5>
                            {researchResults.findings.map((finding, index) => (
                                <div key={index} className="finding-item">
                                    <div className="finding-type">{finding.type}</div>
                                    <div className="finding-content">{finding.content}</div>
                                    <div className="finding-confidence">Confidence: {Math.round(finding.confidence * 100)}%</div>
                                </div>
                            ))}
                        </div>

                        <div className="recommendations-section">
                            <h5>Recommendations:</h5>
                            <ul className="recommendations-list">
                                {researchResults.recommendations.map((rec, index) => (
                                    <li key={index} className="recommendation-item">{rec}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Analytics Tab Component
const AnalyticsTab = ({ integrationsManager, gameReport, onGenerateReport }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        await onGenerateReport();
        setIsGenerating(false);
    };

    return (
        <div className="analytics-tab">
            <div className="card analytics-interface">
                <h3>📊 Game Analytics & Reports</h3>
                
                <div className="report-controls">
                    <button
                        onClick={handleGenerate}
                        className="generate-report-button"
                        disabled={isGenerating}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Comprehensive Report'}
                    </button>
                </div>

                {gameReport && (
                    <div className="game-report">
                        <h4>Game Report: {gameReport.type}</h4>
                        <div className="report-timestamp">
                            Generated: {new Date(gameReport.timestamp).toLocaleString()}
                        </div>
                        
                        {gameReport.sections.financial && (
                            <div className="report-section">
                                <h5>💰 Financial Data</h5>
                                <div className="financial-summary">
                                    <div className="summary-item">
                                        <span className="label">Net Worth:</span>
                                        <span className="value">${gameReport.sections.financial.netWorth}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Total Assets:</span>
                                        <span className="value">${gameReport.sections.financial.totalAssets}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Accounts:</span>
                                        <span className="value">{gameReport.sections.financial.accountCount}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {gameReport.sections.analytics && (
                            <div className="report-section">
                                <h5>📈 Game Analytics</h5>
                                <div className="analytics-summary">
                                    <div className="summary-item">
                                        <span className="label">Total Players:</span>
                                        <span className="value">{gameReport.sections.analytics.data.totalPlayers}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Average Score:</span>
                                        <span className="value">{gameReport.sections.analytics.data.averageScore}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Top Player:</span>
                                        <span className="value">{gameReport.sections.analytics.data.topPlayer}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {gameReport.markdown && (
                            <div className="report-section">
                                <h5>📄 Markdown Report</h5>
                                <pre className="markdown-content">{gameReport.markdown.output}</pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Security Tab Component
const SecurityTab = ({ integrationsManager }) => {
    const [securityScan, setSecurityScan] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    const handleSecurityScan = async () => {
        setIsScanning(true);
        try {
            const scan = await integrationsManager.scanGameCodebase();
            setSecurityScan(scan);
        } catch (error) {
            console.error('Security scan failed:', error);
        }
        setIsScanning(false);
    };

    return (
        <div className="security-tab">
            <div className="card security-interface">
                <h3>🔒 Security Scanner</h3>
                
                <div className="security-controls">
                    <button
                        onClick={handleSecurityScan}
                        className="scan-button"
                        disabled={isScanning}
                    >
                        {isScanning ? 'Scanning...' : 'Scan Codebase'}
                    </button>
                </div>

                {securityScan && (
                    <div className="security-results">
                        <h4>Security Scan Results</h4>
                        <div className="scan-summary">
                            <div className="summary-item">
                                <span className="label">Status:</span>
                                <span className={`value ${securityScan.status}`}>
                                    {securityScan.status === 'clean' ? '✅ Clean' : '⚠️ Issues Found'}
                                </span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Vulnerabilities:</span>
                                <span className="value">{securityScan.vulnerabilities.length}</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Secrets Found:</span>
                                <span className="value">{securityScan.secrets.length}</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Scan Time:</span>
                                <span className="value">{new Date(securityScan.scanTime).toLocaleString()}</span>
                            </div>
                        </div>

                        {securityScan.recommendations.length > 0 && (
                            <div className="security-recommendations">
                                <h5>Security Recommendations:</h5>
                                <ul className="recommendations-list">
                                    {securityScan.recommendations.map((rec, index) => (
                                        <li key={index} className="recommendation-item">{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrendingIntegrationsDashboard; 