/**
 * Web Search Tool
 * Query search engines and return specified number of results
 * Supports multiple search engines and result formatting
 */

class WebSearchTool {
    constructor() {
        this.name = 'Web Search Tool';
        this.visible = false;
        this.searchEngines = {
            google: {
                name: 'Google',
                baseUrl: 'https://www.google.com/search',
                icon: '🔍'
            },
            bing: {
                name: 'Bing',
                baseUrl: 'https://www.bing.com/search',
                icon: '🔎'
            },
            duckduckgo: {
                name: 'DuckDuckGo',
                baseUrl: 'https://duckduckgo.com/',
                icon: '🦆'
            },
            youtube: {
                name: 'YouTube',
                baseUrl: 'https://www.youtube.com/results',
                icon: '📺'
            },
            github: {
                name: 'GitHub',
                baseUrl: 'https://github.com/search',
                icon: '💻'
            }
        };
        this.currentEngine = 'google';
        this.maxResults = 10;
        this.searchHistory = [];
        this.init();
    }

    init() {
        this.createUI();
        this.bindEvents();
        console.log('🔍 Web Search Tool initialized');
    }

    createUI() {
        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'webSearchTool';
        this.container.className = 'tool-container';
        this.container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 800px;
            max-width: 90vw;
            max-height: 80vh;
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            z-index: 10000;
            display: none;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: white;
            overflow: hidden;
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-bottom: 1px solid rgba(255,255,255,0.2);
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        header.innerHTML = `
            <h2 style="margin: 0; font-size: 24px;">🔍 Web Search Tool</h2>
            <button id="closeWebSearch" style="
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 8px 16px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            ">✕ Close</button>
        `;

        // Search controls
        const searchControls = document.createElement('div');
        searchControls.style.cssText = `
            padding: 20px;
            background: rgba(255,255,255,0.05);
        `;

        searchControls.innerHTML = `
            <div style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 200px;">
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Search Engine:</label>
                    <select id="searchEngine" style="
                        width: 100%;
                        padding: 10px;
                        border: none;
                        border-radius: 5px;
                        background: rgba(255,255,255,0.9);
                        color: #333;
                        font-size: 14px;
                    ">
                        ${Object.entries(this.searchEngines).map(([key, engine]) => 
                            `<option value="${key}">${engine.icon} ${engine.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div style="min-width: 120px;">
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Results:</label>
                    <input type="number" id="maxResults" value="${this.maxResults}" min="1" max="50" style="
                        width: 100%;
                        padding: 10px;
                        border: none;
                        border-radius: 5px;
                        background: rgba(255,255,255,0.9);
                        color: #333;
                        font-size: 14px;
                    ">
                </div>
            </div>
            <div style="display: flex; gap: 10px;">
                <input type="text" id="searchQuery" placeholder="Enter your search query..." style="
                    flex: 1;
                    padding: 12px;
                    border: none;
                    border-radius: 5px;
                    background: rgba(255,255,255,0.9);
                    color: #333;
                    font-size: 16px;
                ">
                <button id="performSearch" style="
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    border: none;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                ">🔍 Search</button>
            </div>
        `;

        // Results container
        this.resultsContainer = document.createElement('div');
        this.resultsContainer.style.cssText = `
            padding: 20px;
            max-height: 400px;
            overflow-y: auto;
            background: rgba(255,255,255,0.02);
        `;

        // Status bar
        this.statusBar = document.createElement('div');
        this.statusBar.style.cssText = `
            padding: 10px 20px;
            background: rgba(255,255,255,0.1);
            border-top: 1px solid rgba(255,255,255,0.2);
            font-size: 12px;
            color: rgba(255,255,255,0.8);
        `;
        this.statusBar.textContent = 'Ready to search';

        // Assemble the tool
        this.container.appendChild(header);
        this.container.appendChild(searchControls);
        this.container.appendChild(this.resultsContainer);
        this.container.appendChild(this.statusBar);

        document.body.appendChild(this.container);
    }

    bindEvents() {
        // Close button
        document.getElementById('closeWebSearch').addEventListener('click', () => {
            this.hide();
        });

        // Search button
        document.getElementById('performSearch').addEventListener('click', () => {
            this.performSearch();
        });

        // Enter key in search input
        document.getElementById('searchQuery').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Search engine change
        document.getElementById('searchEngine').addEventListener('change', (e) => {
            this.currentEngine = e.target.value;
        });

        // Max results change
        document.getElementById('maxResults').addEventListener('change', (e) => {
            this.maxResults = parseInt(e.target.value) || 10;
        });

        // Click outside to close
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.hide();
            }
        });
    }

    async performSearch() {
        const query = document.getElementById('searchQuery').value.trim();
        if (!query) {
            this.showStatus('Please enter a search query', 'error');
            return;
        }

        this.showStatus('Searching...', 'loading');
        this.resultsContainer.innerHTML = '<div style="text-align: center; padding: 20px;">🔍 Searching...</div>';

        try {
            const results = await this.searchWeb(query, this.currentEngine, this.maxResults);
            this.displayResults(results, query);
            this.addToHistory(query, results.length);
            this.showStatus(`Found ${results.length} results for "${query}"`, 'success');
        } catch (error) {
            console.error('Search error:', error);
            this.resultsContainer.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #ff6b6b;">
                    ❌ Search failed: ${error.message}
                </div>
            `;
            this.showStatus('Search failed', 'error');
        }
    }

    async searchWeb(query, engine, maxResults) {
        // For demo purposes, we'll simulate search results
        // In a real implementation, you would use actual search APIs
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

        const engineInfo = this.searchEngines[engine];
        const results = [];

        // Generate mock results based on the search engine
        for (let i = 1; i <= Math.min(maxResults, 10); i++) {
            results.push({
                title: `${engineInfo.name} Result ${i} for "${query}"`,
                url: `https://example${i}.com/search-result`,
                snippet: `This is a sample search result ${i} for the query "${query}" using ${engineInfo.name}. This would contain relevant information found by the search engine.`,
                engine: engine,
                rank: i
            });
        }

        return results;
    }

    displayResults(results, query) {
        if (results.length === 0) {
            this.resultsContainer.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #ffd93d;">
                    🔍 No results found for "${query}"
                </div>
            `;
            return;
        }

        const resultsHTML = results.map((result, index) => `
            <div style="
                background: rgba(255,255,255,0.05);
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 15px;
                border-left: 4px solid #4CAF50;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255,255,255,0.1)'" 
               onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <h3 style="margin: 0; font-size: 16px; color: #4CAF50;">
                        <a href="${result.url}" target="_blank" style="color: inherit; text-decoration: none;">
                            ${result.title}
                        </a>
                    </h3>
                    <span style="
                        background: rgba(255,255,255,0.2);
                        padding: 2px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                        color: rgba(255,255,255,0.8);
                    ">#${result.rank}</span>
                </div>
                <p style="margin: 0; font-size: 14px; line-height: 1.4; color: rgba(255,255,255,0.9);">
                    ${result.snippet}
                </p>
                <div style="margin-top: 8px; font-size: 12px; color: rgba(255,255,255,0.6);">
                    ${result.url} • ${this.searchEngines[result.engine].icon} ${this.searchEngines[result.engine].name}
                </div>
            </div>
        `).join('');

        this.resultsContainer.innerHTML = `
            <div style="margin-bottom: 15px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px;">
                <strong>Search Results for:</strong> "${query}" 
                <span style="float: right; font-size: 12px;">
                    ${this.searchEngines[this.currentEngine].icon} ${this.searchEngines[this.currentEngine].name}
                </span>
            </div>
            ${resultsHTML}
        `;
    }

    addToHistory(query, resultCount) {
        this.searchHistory.unshift({
            query: query,
            engine: this.currentEngine,
            resultCount: resultCount,
            timestamp: new Date().toISOString()
        });

        // Keep only last 10 searches
        if (this.searchHistory.length > 10) {
            this.searchHistory = this.searchHistory.slice(0, 10);
        }
    }

    showStatus(message, type = 'info') {
        const colors = {
            info: 'rgba(255,255,255,0.8)',
            success: '#4CAF50',
            error: '#f44336',
            loading: '#FF9800'
        };

        this.statusBar.style.color = colors[type];
        this.statusBar.textContent = message;
    }

    show() {
        this.visible = true;
        this.container.style.display = 'block';
        document.getElementById('searchQuery').focus();
        console.log('🔍 Web Search Tool shown');
    }

    hide() {
        this.visible = false;
        this.container.style.display = 'none';
        console.log('🔍 Web Search Tool hidden');
    }

    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        console.log('🔍 Web Search Tool destroyed');
    }

    // Public API for external use
    async search(query, engine = 'google', maxResults = 10) {
        return await this.searchWeb(query, engine, maxResults);
    }

    getSearchHistory() {
        return this.searchHistory;
    }

    getAvailableEngines() {
        return Object.keys(this.searchEngines);
    }
}

export default WebSearchTool; 