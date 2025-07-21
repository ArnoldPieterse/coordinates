import React, { useState, useEffect } from 'react';
import './ContextDashboard.css';

const ContextDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [contextStats, setContextStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    // Load context statistics
    loadContextStats();
  }, []);

  const loadContextStats = async () => {
    try {
      // This would be loaded from the actual context system
      const stats = {
        totalFiles: 156,
        totalCodeItems: 89,
        totalDocsItems: 34,
        totalTestsItems: 33,
        totalMemoryItems: 247,
        totalGraphNodes: 189,
        totalGraphEdges: 312,
        recentActivity: [
          { type: 'file-indexed', file: 'src/core/context/ContextIndexer.js', timestamp: Date.now() - 1000 },
          { type: 'test-generated', file: 'src/ai/thinking/ThoughtFrames.test.js', timestamp: Date.now() - 5000 },
          { type: 'docs-generated', file: 'docs/code/ContextAutomation.md', timestamp: Date.now() - 10000 }
        ]
      };
      setContextStats(stats);
    } catch (error) {
      console.error('Failed to load context stats:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // This would search the actual context system
      const results = [
        { type: 'code', id: 'src/core/context/ContextIndexer.js', title: 'ContextIndexer', relevance: 0.95 },
        { type: 'docs', id: 'docs/context-system.md', title: 'Context System Documentation', relevance: 0.87 },
        { type: 'test', id: 'src/core/context/__tests__/ContextIndexer.test.js', title: 'ContextIndexer Tests', relevance: 0.82 }
      ].filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const renderOverview = () => (
    <div className="overview-section">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Files Indexed</h3>
          <div className="stat-number">{contextStats.totalFiles}</div>
          <div className="stat-breakdown">
            <span>Code: {contextStats.totalCodeItems}</span>
            <span>Docs: {contextStats.totalDocsItems}</span>
            <span>Tests: {contextStats.totalTestsItems}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <h3>Knowledge Graph</h3>
          <div className="stat-number">{contextStats.totalGraphNodes}</div>
          <div className="stat-breakdown">
            <span>Nodes: {contextStats.totalGraphNodes}</span>
            <span>Edges: {contextStats.totalGraphEdges}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <h3>Memory Items</h3>
          <div className="stat-number">{contextStats.totalMemoryItems}</div>
          <div className="stat-breakdown">
            <span>Decisions: {Math.floor(contextStats.totalMemoryItems * 0.3)}</span>
            <span>Executions: {Math.floor(contextStats.totalMemoryItems * 0.4)}</span>
            <span>Snapshots: {Math.floor(contextStats.totalMemoryItems * 0.3)}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <h3>Recent Activity</h3>
          <div className="stat-number">{contextStats.recentActivity?.length || 0}</div>
          <div className="stat-breakdown">
            <span>Last 24h</span>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {contextStats.recentActivity?.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon">
                {activity.type === 'file-indexed' && '📄'}
                {activity.type === 'test-generated' && '🧪'}
                {activity.type === 'docs-generated' && '📚'}
              </div>
              <div className="activity-content">
                <div className="activity-title">{activity.file}</div>
                <div className="activity-type">{activity.type}</div>
              </div>
              <div className="activity-time">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="search-section">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search code, docs, tests, or memory..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Search Results ({searchResults.length})</h3>
          {searchResults.map((result, index) => (
            <div 
              key={index} 
              className="search-result-item"
              onClick={() => setSelectedItem(result)}
            >
              <div className="result-icon">
                {result.type === 'code' && '💻'}
                {result.type === 'docs' && '📚'}
                {result.type === 'test' && '🧪'}
              </div>
              <div className="result-content">
                <div className="result-title">{result.title}</div>
                <div className="result-path">{result.id}</div>
                <div className="result-relevance">Relevance: {Math.round(result.relevance * 100)}%</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <div className="selected-item-details">
          <h3>Item Details</h3>
          <div className="item-details">
            <div><strong>Type:</strong> {selectedItem.type}</div>
            <div><strong>ID:</strong> {selectedItem.id}</div>
            <div><strong>Title:</strong> {selectedItem.title}</div>
            <div><strong>Relevance:</strong> {Math.round(selectedItem.relevance * 100)}%</div>
          </div>
        </div>
      )}
    </div>
  );

  const renderKnowledgeGraph = () => (
    <div className="knowledge-graph-section">
      <div className="graph-controls">
        <button className="graph-control-btn">Show Code Dependencies</button>
        <button className="graph-control-btn">Show Test Coverage</button>
        <button className="graph-control-btn">Show Documentation Links</button>
      </div>
      
      <div className="graph-visualization">
        <div className="graph-placeholder">
          <h3>Knowledge Graph Visualization</h3>
          <p>Interactive graph showing relationships between:</p>
          <ul>
            <li>Code files and their imports/exports</li>
            <li>Tests and the code they cover</li>
            <li>Documentation and related code</li>
            <li>Thought frames and their implementations</li>
          </ul>
          <div className="graph-stats">
            <div>Nodes: {contextStats.totalGraphNodes}</div>
            <div>Edges: {contextStats.totalGraphEdges}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMemory = () => (
    <div className="memory-section">
      <div className="memory-filters">
        <select defaultValue="all">
          <option value="all">All Types</option>
          <option value="decision">Decisions</option>
          <option value="execution">Executions</option>
          <option value="snapshot">Snapshots</option>
        </select>
        <input type="date" />
        <button>Filter</button>
      </div>

      <div className="memory-timeline">
        <div className="timeline-item">
          <div className="timeline-date">Today</div>
          <div className="timeline-content">
            <div className="memory-item">
              <div className="memory-icon">🚀</div>
              <div className="memory-content">
                <div className="memory-title">System Upgrade Frame Created</div>
                <div className="memory-description">Created new thought frame for comprehensive system upgrade</div>
                <div className="memory-tags">
                  <span className="tag">thought-frame</span>
                  <span className="tag">system-upgrade</span>
                </div>
              </div>
              <div className="memory-time">2 hours ago</div>
            </div>
          </div>
        </div>

        <div className="timeline-item">
          <div className="timeline-date">Yesterday</div>
          <div className="timeline-content">
            <div className="memory-item">
              <div className="memory-icon">📄</div>
              <div className="memory-content">
                <div className="memory-title">ContextIndexer.js Indexed</div>
                <div className="memory-description">Automatically indexed new context management file</div>
                <div className="memory-tags">
                  <span className="tag">automation</span>
                  <span className="tag">indexing</span>
                </div>
              </div>
              <div className="memory-time">1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="context-dashboard">
      <div className="dashboard-header">
        <h1>Context Dashboard</h1>
        <p>Comprehensive view of project context, knowledge graph, and memory</p>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Search & Explore
        </button>
        <button 
          className={`tab ${activeTab === 'graph' ? 'active' : ''}`}
          onClick={() => setActiveTab('graph')}
        >
          Knowledge Graph
        </button>
        <button 
          className={`tab ${activeTab === 'memory' ? 'active' : ''}`}
          onClick={() => setActiveTab('memory')}
        >
          Memory Timeline
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'search' && renderSearch()}
        {activeTab === 'graph' && renderKnowledgeGraph()}
        {activeTab === 'memory' && renderMemory()}
      </div>
    </div>
  );
};

export default ContextDashboard; 