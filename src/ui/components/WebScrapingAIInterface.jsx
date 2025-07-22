/**
 * Web Scraping & AI Interface
 * Integrates Instagram scraping and Custom GPT AI capabilities
 */

import React, { useState, useEffect } from 'react';
import InstagramScrapingSystem from '../../core/InstagramScrapingSystem.js';
import CustomGPTSystem from '../../core/CustomGPTSystem.js';

const WebScrapingAIInterface = () => {
    const [instagramSystem] = useState(new InstagramScrapingSystem());
    const [gptSystem] = useState(new CustomGPTSystem());
    const [activeTab, setActiveTab] = useState('instagram');
    const [instagramStatus, setInstagramStatus] = useState('initializing');
    const [gptStatus, setGptStatus] = useState('initializing');
    const [scrapingResults, setScrapingResults] = useState([]);
    const [aiResponses, setAiResponses] = useState([]);
    const [selectedGPT, setSelectedGPT] = useState('trend-analyzer');
    const [userInput, setUserInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        setupSystems();
    }, []);

    const setupSystems = async () => {
        // Initialize Instagram scraping system
        instagramSystem.on('initialized', (data) => {
            console.log('[INTERFACE] Instagram system ready:', data);
            setInstagramStatus('ready');
        });

        instagramSystem.on('scrape-started', (scrape) => {
            console.log('[INTERFACE] Scrape started:', scrape);
        });

        instagramSystem.on('scrape-completed', (scrape) => {
            console.log('[INTERFACE] Scrape completed:', scrape);
            setScrapingResults(prev => [scrape, ...prev.slice(0, 9)]);
        });

        instagramSystem.on('trending-data-collected', (data) => {
            console.log('[INTERFACE] Trending data collected:', data);
        });

        // Initialize Custom GPT system
        gptSystem.on('initialized', (data) => {
            console.log('[INTERFACE] GPT system ready:', data);
            setGptStatus('ready');
        });

        gptSystem.on('request-started', (request) => {
            console.log('[INTERFACE] AI request started:', request);
        });

        gptSystem.on('request-completed', (request) => {
            console.log('[INTERFACE] AI request completed:', request);
            setAiResponses(prev => [request, ...prev.slice(0, 9)]);
        });

        // Initialize both systems
        await Promise.all([
            instagramSystem.initialize(),
            gptSystem.initialize()
        ]);
    };

    const handleInstagramScraping = async (type, target, limit = 50) => {
        setIsProcessing(true);
        
        try {
            const result = await instagramSystem.scrapeInstagramData({
                type,
                target,
                limit
            });
            
            console.log('[INTERFACE] Scraping result:', result);
        } catch (error) {
            console.error('[INTERFACE] Scraping failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAIRequest = async () => {
        if (!userInput.trim()) return;
        
        setIsProcessing(true);
        
        try {
            const response = await gptSystem.generateResponse(selectedGPT, userInput, {
                instagramData: scrapingResults[0]?.data,
                trendingData: instagramSystem.getTrendingData()
            });
            
            console.log('[INTERFACE] AI response:', response);
            setUserInput('');
        } catch (error) {
            console.error('[INTERFACE] AI request failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const renderInstagramScraping = () => {
        const status = instagramSystem.getStatus();
        
        return (
            <div className="instagram-scraping">
                <h3>🕷️ Instagram Web Scraping</h3>
                
                <div className="system-status">
                    <h4>System Status</h4>
                    <div className="status-grid">
                        <div className="status-card">
                            <span className="status-label">Status</span>
                            <span className={`status-value ${instagramStatus}`}>{instagramStatus}</span>
                        </div>
                        <div className="status-card">
                            <span className="status-label">Active Scrapes</span>
                            <span className="status-value">{status.activeScrapes}</span>
                        </div>
                        <div className="status-card">
                            <span className="status-label">Rate Limit</span>
                            <span className="status-value">{status.rateLimits.remaining}/{status.rateLimits.maxRequests}</span>
                        </div>
                        <div className="status-card">
                            <span className="status-label">Trending Data</span>
                            <span className="status-value">{status.trendingDataSize} hashtags</span>
                        </div>
                    </div>
                </div>

                <div className="scraping-controls">
                    <h4>Scraping Controls</h4>
                    
                    <div className="scraping-options">
                        <div className="scraping-option">
                            <h5>Hashtag Scraping</h5>
                            <div className="input-group">
                                <input 
                                    type="text" 
                                    placeholder="Enter hashtag (without #)"
                                    id="hashtag-input"
                                    className="scraping-input"
                                />
                                <input 
                                    type="number" 
                                    placeholder="Limit (max 50)"
                                    id="hashtag-limit"
                                    className="scraping-input"
                                    min="1"
                                    max="50"
                                    defaultValue="20"
                                />
                                <button 
                                    className="scrape-btn"
                                    onClick={() => {
                                        const hashtag = document.getElementById('hashtag-input').value;
                                        const limit = parseInt(document.getElementById('hashtag-limit').value);
                                        if (hashtag) {
                                            handleInstagramScraping('hashtag', hashtag, limit);
                                        }
                                    }}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? 'Scraping...' : 'Scrape Hashtag'}
                                </button>
                            </div>
                        </div>

                        <div className="scraping-option">
                            <h5>Profile Scraping</h5>
                            <div className="input-group">
                                <input 
                                    type="text" 
                                    placeholder="Enter username"
                                    id="profile-input"
                                    className="scraping-input"
                                />
                                <input 
                                    type="number" 
                                    placeholder="Limit (max 30)"
                                    id="profile-limit"
                                    className="scraping-input"
                                    min="1"
                                    max="30"
                                    defaultValue="15"
                                />
                                <button 
                                    className="scrape-btn"
                                    onClick={() => {
                                        const username = document.getElementById('profile-input').value;
                                        const limit = parseInt(document.getElementById('profile-limit').value);
                                        if (username) {
                                            handleInstagramScraping('profile', username, limit);
                                        }
                                    }}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? 'Scraping...' : 'Scrape Profile'}
                                </button>
                            </div>
                        </div>

                        <div className="scraping-option">
                            <h5>Trending Content</h5>
                            <div className="input-group">
                                <input 
                                    type="number" 
                                    placeholder="Limit (max 20)"
                                    id="trending-limit"
                                    className="scraping-input"
                                    min="1"
                                    max="20"
                                    defaultValue="10"
                                />
                                <button 
                                    className="scrape-btn"
                                    onClick={() => {
                                        const limit = parseInt(document.getElementById('trending-limit').value);
                                        handleInstagramScraping('trending', null, limit);
                                    }}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? 'Scraping...' : 'Scrape Trending'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="scraping-results">
                    <h4>Recent Scraping Results</h4>
                    
                    {scrapingResults.length === 0 ? (
                        <div className="no-results">
                            <p>No scraping results yet. Start scraping to see results here.</p>
                        </div>
                    ) : (
                        <div className="results-grid">
                            {scrapingResults.map((result, index) => (
                                <div key={result.id} className="result-card">
                                    <div className="result-header">
                                        <h5>{result.type.toUpperCase()} - {result.target || 'Trending'}</h5>
                                        <span className={`status ${result.status}`}>{result.status}</span>
                                    </div>
                                    
                                    <div className="result-details">
                                        <span>Duration: {result.duration}ms</span>
                                        <span>Data: {result.data ? 'Available' : 'None'}</span>
                                    </div>
                                    
                                    {result.data && (
                                        <div className="result-data">
                                            {result.type === 'hashtag' && (
                                                <div>
                                                    <p>Posts: {result.data.totalPosts}</p>
                                                    <p>Avg Likes: {Math.round(result.data.metadata.averageLikes)}</p>
                                                    <p>Engagement: {result.data.metadata.engagementRate.toFixed(2)}%</p>
                                                </div>
                                            )}
                                            {result.type === 'profile' && (
                                                <div>
                                                    <p>Followers: {result.data.profile.followers.toLocaleString()}</p>
                                                    <p>Posts: {result.data.totalPosts}</p>
                                                    <p>Engagement: {result.data.metadata.engagementRate.toFixed(2)}%</p>
                                                </div>
                                            )}
                                            {result.type === 'trending' && (
                                                <div>
                                                    <p>Trending Hashtags: {result.data.hashtags.length}</p>
                                                    <p>Trending Posts: {result.data.posts.length}</p>
                                                    <p>Trending Users: {result.data.users.length}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderCustomGPT = () => {
        const status = gptSystem.getStatus();
        const allGPTs = gptSystem.getAllGPTs();
        
        return (
            <div className="custom-gpt">
                <h3>🤖 Custom GPT AI System</h3>
                
                <div className="system-status">
                    <h4>System Status</h4>
                    <div className="status-grid">
                        <div className="status-card">
                            <span className="status-label">Status</span>
                            <span className={`status-value ${gptStatus}`}>{gptStatus}</span>
                        </div>
                        <div className="status-card">
                            <span className="status-label">Total GPTs</span>
                            <span className="status-value">{status.totalGPTs}</span>
                        </div>
                        <div className="status-card">
                            <span className="status-label">Rate Limit</span>
                            <span className="status-value">{status.rateLimits.remaining}/{status.rateLimits.maxRequests}</span>
                        </div>
                        <div className="status-card">
                            <span className="status-label">Models</span>
                            <span className="status-value">{status.models.length}</span>
                        </div>
                    </div>
                </div>

                <div className="gpt-selection">
                    <h4>Select Custom GPT</h4>
                    <div className="gpt-grid">
                        {allGPTs.map(gpt => (
                            <div 
                                key={gpt.id}
                                className={`gpt-card ${selectedGPT === gpt.id ? 'selected' : ''}`}
                                onClick={() => setSelectedGPT(gpt.id)}
                            >
                                <h5>{gpt.name}</h5>
                                <p>{gpt.description}</p>
                                <div className="gpt-capabilities">
                                    {gpt.capabilities.slice(0, 3).map(cap => (
                                        <span key={cap} className="capability-tag">{cap}</span>
                                    ))}
                                </div>
                                <div className="gpt-usage">
                                    <span>Requests: {gpt.usage.totalRequests}</span>
                                    <span>Tokens: {gpt.usage.totalTokens.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="ai-interaction">
                    <h4>AI Interaction</h4>
                    
                    <div className="selected-gpt-info">
                        {allGPTs.find(gpt => gpt.id === selectedGPT) && (
                            <div className="gpt-info">
                                <h5>{allGPTs.find(gpt => gpt.id === selectedGPT).name}</h5>
                                <p>{allGPTs.find(gpt => gpt.id === selectedGPT).description}</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="input-section">
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Ask your Custom GPT anything..."
                            className="ai-input"
                            rows="4"
                        />
                        <button 
                            className="ai-submit-btn"
                            onClick={handleAIRequest}
                            disabled={isProcessing || !userInput.trim()}
                        >
                            {isProcessing ? 'Processing...' : 'Ask AI'}
                        </button>
                    </div>
                </div>

                <div className="ai-responses">
                    <h4>Recent AI Responses</h4>
                    
                    {aiResponses.length === 0 ? (
                        <div className="no-results">
                            <p>No AI responses yet. Ask a question to see responses here.</p>
                        </div>
                    ) : (
                        <div className="responses-grid">
                            {aiResponses.map((response, index) => (
                                <div key={response.id} className="response-card">
                                    <div className="response-header">
                                        <h5>{gptSystem.getGPT(response.gptId)?.name}</h5>
                                        <span className={`status ${response.status}`}>{response.status}</span>
                                    </div>
                                    
                                    <div className="response-details">
                                        <span>Duration: {response.duration}ms</span>
                                        <span>Tokens: {response.tokens}</span>
                                    </div>
                                    
                                    {response.response && (
                                        <div className="response-content">
                                            <h6>User Input:</h6>
                                            <p className="user-input">{response.userInput}</p>
                                            <h6>AI Response:</h6>
                                            <div className="ai-response">
                                                {response.response.content.split('\n').map((line, i) => (
                                                    <p key={i}>{line}</p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {response.error && (
                                        <div className="response-error">
                                            <p>Error: {response.error}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderCombinedAnalysis = () => {
        return (
            <div className="combined-analysis">
                <h3>🔗 Combined Analysis</h3>
                
                <div className="analysis-description">
                    <p>Combine Instagram scraping data with Custom GPT AI analysis for comprehensive insights.</p>
                </div>

                <div className="analysis-workflow">
                    <h4>Analysis Workflow</h4>
                    
                    <div className="workflow-steps">
                        <div className="workflow-step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h5>Scrape Instagram Data</h5>
                                <p>Use the Instagram scraping tools to collect hashtag, profile, or trending data.</p>
                            </div>
                        </div>
                        
                        <div className="workflow-step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h5>Select Custom GPT</h5>
                                <p>Choose the appropriate Custom GPT for your analysis needs.</p>
                            </div>
                        </div>
                        
                        <div className="workflow-step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h5>Generate AI Analysis</h5>
                                <p>Ask the AI to analyze the scraped data and provide insights.</p>
                            </div>
                        </div>
                        
                        <div className="workflow-step">
                            <div className="step-number">4</div>
                            <div className="step-content">
                                <h5>Review Results</h5>
                                <p>Review the combined scraping and AI analysis results.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="quick-analysis">
                    <h4>Quick Analysis</h4>
                    
                    <div className="quick-actions">
                        <button 
                            className="quick-btn"
                            onClick={() => {
                                handleInstagramScraping('trending', null, 10);
                                setTimeout(() => {
                                    setSelectedGPT('trend-analyzer');
                                    setUserInput('Analyze the trending data and provide insights for content strategy.');
                                    setTimeout(handleAIRequest, 1000);
                                }, 2000);
                            }}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing...' : 'Trend Analysis'}
                        </button>
                        
                        <button 
                            className="quick-btn"
                            onClick={() => {
                                handleInstagramScraping('hashtag', 'fashion', 20);
                                setTimeout(() => {
                                    setSelectedGPT('content-generator');
                                    setUserInput('Generate content ideas based on the fashion hashtag data.');
                                    setTimeout(handleAIRequest, 1000);
                                }, 2000);
                            }}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing...' : 'Content Generation'}
                        </button>
                        
                        <button 
                            className="quick-btn"
                            onClick={() => {
                                handleInstagramScraping('hashtag', 'design', 15);
                                setTimeout(() => {
                                    setSelectedGPT('design-advisor');
                                    setUserInput('Provide design recommendations based on the design hashtag trends.');
                                    setTimeout(handleAIRequest, 1000);
                                }, 2000);
                            }}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing...' : 'Design Analysis'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="web-scraping-ai-interface">
            <div className="interface-header">
                <h2>🕷️ Web Scraping & AI Integration</h2>
                <p>Instagram web scraping + Custom GPT AI analysis powered by Google Gemini</p>
                <div className="system-status-overview">
                    <span className={`status ${instagramStatus}`}>Instagram: {instagramStatus}</span>
                    <span className={`status ${gptStatus}`}>Custom GPT: {gptStatus}</span>
                </div>
            </div>
            
            <div className="interface-content">
                <div className="tab-navigation">
                    <button 
                        className={`tab-btn ${activeTab === 'instagram' ? 'active' : ''}`}
                        onClick={() => setActiveTab('instagram')}
                    >
                        🕷️ Instagram Scraping
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'gpt' ? 'active' : ''}`}
                        onClick={() => setActiveTab('gpt')}
                    >
                        🤖 Custom GPT AI
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'combined' ? 'active' : ''}`}
                        onClick={() => setActiveTab('combined')}
                    >
                        🔗 Combined Analysis
                    </button>
                </div>
                
                <div className="tab-content">
                    {activeTab === 'instagram' && renderInstagramScraping()}
                    {activeTab === 'gpt' && renderCustomGPT()}
                    {activeTab === 'combined' && renderCombinedAnalysis()}
                </div>
            </div>
            
            <style jsx>{`
                .web-scraping-ai-interface {
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
                
                .scraping-controls, .gpt-selection, .ai-interaction {
                    margin-bottom: 30px;
                }
                
                .scraping-options {
                    display: grid;
                    gap: 20px;
                    margin-top: 15px;
                }
                
                .scraping-option {
                    background: #1a1a1a;
                    padding: 20px;
                    border-radius: 6px;
                    border: 1px solid #333;
                }
                
                .input-group {
                    display: flex;
                    gap: 10px;
                    margin-top: 10px;
                    flex-wrap: wrap;
                }
                
                .scraping-input, .ai-input {
                    background: #333;
                    border: 1px solid #555;
                    color: #ffffff;
                    padding: 8px 12px;
                    border-radius: 4px;
                    flex: 1;
                    min-width: 150px;
                }
                
                .scrape-btn, .ai-submit-btn {
                    background: #0088ff;
                    color: #ffffff;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                }
                
                .scrape-btn:hover, .ai-submit-btn:hover {
                    background: #0066cc;
                }
                
                .scrape-btn:disabled, .ai-submit-btn:disabled {
                    background: #666;
                    cursor: not-allowed;
                }
                
                .gpt-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 15px;
                    margin-top: 15px;
                }
                
                .gpt-card {
                    background: #1a1a1a;
                    padding: 20px;
                    border-radius: 6px;
                    border: 1px solid #333;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .gpt-card:hover {
                    border-color: #00ff00;
                }
                
                .gpt-card.selected {
                    border-color: #00ff00;
                    background: #2a2a2a;
                }
                
                .gpt-card h5 {
                    margin: 0 0 10px 0;
                    color: #00ff00;
                }
                
                .gpt-card p {
                    margin: 0 0 15px 0;
                    font-size: 14px;
                    color: #888;
                }
                
                .gpt-capabilities {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;
                    margin-bottom: 15px;
                }
                
                .capability-tag {
                    background: #333;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    color: #00ff00;
                }
                
                .gpt-usage {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: #888;
                }
                
                .selected-gpt-info {
                    background: #1a1a1a;
                    padding: 15px;
                    border-radius: 6px;
                    border: 1px solid #333;
                    margin-bottom: 20px;
                }
                
                .input-section {
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                }
                
                .ai-input {
                    flex: 1;
                    resize: vertical;
                    min-height: 100px;
                }
                
                .ai-submit-btn {
                    padding: 12px 24px;
                    white-space: nowrap;
                }
                
                .scraping-results, .ai-responses {
                    margin-bottom: 30px;
                }
                
                .no-results {
                    text-align: center;
                    padding: 40px;
                    color: #888;
                }
                
                .results-grid, .responses-grid {
                    display: grid;
                    gap: 15px;
                    margin-top: 15px;
                }
                
                .result-card, .response-card {
                    background: #1a1a1a;
                    padding: 20px;
                    border-radius: 6px;
                    border: 1px solid #333;
                }
                
                .result-header, .response-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                
                .result-header h5, .response-header h5 {
                    margin: 0;
                    color: #00ff00;
                }
                
                .status.pending { color: #ffaa00; }
                .status.running { color: #0088ff; }
                .status.completed { color: #00ff00; }
                .status.failed { color: #ff4444; }
                .status.processing { color: #0088ff; }
                
                .result-details, .response-details {
                    display: flex;
                    gap: 20px;
                    font-size: 14px;
                    color: #888;
                    margin-bottom: 15px;
                }
                
                .result-data, .response-content {
                    background: #333;
                    padding: 15px;
                    border-radius: 4px;
                }
                
                .result-data p, .response-content p {
                    margin: 5px 0;
                }
                
                .user-input {
                    background: #2a2a2a;
                    padding: 10px;
                    border-radius: 4px;
                    margin: 10px 0;
                    font-style: italic;
                }
                
                .ai-response {
                    background: #2a2a2a;
                    padding: 10px;
                    border-radius: 4px;
                    margin: 10px 0;
                }
                
                .ai-response p {
                    margin: 5px 0;
                    line-height: 1.5;
                }
                
                .response-error {
                    background: #2a1a1a;
                    border: 1px solid #ff4444;
                    padding: 10px;
                    border-radius: 4px;
                    color: #ff4444;
                }
                
                .combined-analysis {
                    text-align: center;
                }
                
                .analysis-description {
                    margin-bottom: 30px;
                    font-size: 16px;
                    color: #888;
                }
                
                .workflow-steps {
                    display: grid;
                    gap: 20px;
                    margin: 30px 0;
                }
                
                .workflow-step {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    background: #1a1a1a;
                    padding: 20px;
                    border-radius: 6px;
                    border: 1px solid #333;
                }
                
                .step-number {
                    background: #00ff00;
                    color: #000000;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 18px;
                }
                
                .step-content h5 {
                    margin: 0 0 10px 0;
                    color: #00ff00;
                }
                
                .step-content p {
                    margin: 0;
                    color: #888;
                }
                
                .quick-analysis {
                    margin-top: 40px;
                }
                
                .quick-actions {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin-top: 20px;
                }
                
                .quick-btn {
                    background: #ff8800;
                    color: #ffffff;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s ease;
                }
                
                .quick-btn:hover:not(:disabled) {
                    background: #cc6600;
                }
                
                .quick-btn:disabled {
                    background: #666;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default WebScrapingAIInterface; 