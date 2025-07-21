import React, { useState, useEffect } from 'react';
import { useAppContext } from '../App';
import './TradingDashboard.css';

const TradingDashboard = () => {
  const { transformerTrading, addNotification } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [modelTrained, setModelTrained] = useState(false);
  const [signals, setSignals] = useState([]);
  const [dataStats, setDataStats] = useState(null);
  const [modelStats, setModelStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (transformerTrading) {
      loadInitialData();
    }
  }, [transformerTrading]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Load real data
      const data = await transformerTrading.loadRealData();
      setDataLoaded(true);
      
      // Get data statistics
      const stats = transformerTrading.getDataStats();
      setDataStats(stats);
      
      // Get model statistics
      const modelStats = transformerTrading.getModelStats();
      setModelStats(modelStats);
      
      // Prepare chart data (last 100 points)
      const chartPoints = data.slice(-100).map((point, index) => ({
        time: new Date(point.timestamp).toLocaleDateString(),
        price: point.close,
        index
      }));
      setChartData(chartPoints);
      
      addNotification({
        type: 'success',
        title: 'Data Loaded',
        message: `Successfully loaded ${data.length} data points`,
        duration: 3000
      });
      
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Data Loading Error',
        message: error.message,
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const trainModel = async () => {
    if (!dataLoaded) {
      addNotification({
        type: 'warning',
        title: 'No Data',
        message: 'Please load data first',
        duration: 3000
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Prepare training data
      transformerTrading.prepareTrainingData(transformerTrading.processedData);
      
      // Train model
      await transformerTrading.trainModel(20, 16);
      setModelTrained(true);
      
      // Update model stats
      const stats = transformerTrading.getModelStats();
      setModelStats(stats);
      
      addNotification({
        type: 'success',
        title: 'Model Trained',
        message: 'Transformer model training completed successfully',
        duration: 3000
      });
      
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Training Error',
        message: error.message,
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSignals = async () => {
    if (!modelTrained) {
      addNotification({
        type: 'warning',
        title: 'Model Not Trained',
        message: 'Please train the model first',
        duration: 3000
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Generate signals
      const newSignals = transformerTrading.generateSignals(transformerTrading.processedData);
      setSignals(newSignals);
      
      addNotification({
        type: 'success',
        title: 'Signals Generated',
        message: `Generated ${newSignals.length} trading signals`,
        duration: 3000
      });
      
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Signal Generation Error',
        message: error.message,
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSignalColor = (signal) => {
    switch (signal) {
      case 'BUY': return 'var(--success)';
      case 'SELL': return 'var(--error)';
      case 'HOLD': return 'var(--warning)';
      default: return 'var(--text-muted)';
    }
  };

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="trading-dashboard">
      <div className="dashboard-header">
        <h1>🤖 AI Trading Dashboard</h1>
        <p>Advanced transformer-based trading system with real-time signal generation</p>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button
          className={`btn ${dataLoaded ? 'btn-success' : 'btn-primary'}`}
          onClick={loadInitialData}
          disabled={isLoading}
        >
          {isLoading ? '🔄 Loading...' : dataLoaded ? '✅ Data Loaded' : '📊 Load Data'}
        </button>
        
        <button
          className={`btn ${modelTrained ? 'btn-success' : 'btn-primary'}`}
          onClick={trainModel}
          disabled={!dataLoaded || isLoading}
        >
          {isLoading ? '🔄 Training...' : modelTrained ? '✅ Model Trained' : '🎯 Train Model'}
        </button>
        
        <button
          className="btn btn-primary"
          onClick={generateSignals}
          disabled={!modelTrained || isLoading}
        >
          {isLoading ? '🔄 Generating...' : '📈 Generate Signals'}
        </button>
      </div>

      {/* Dashboard Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'signals' ? 'active' : ''}`}
          onClick={() => setActiveTab('signals')}
        >
          📈 Signals ({signals.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'model' ? 'active' : ''}`}
          onClick={() => setActiveTab('model')}
        >
          🤖 Model
        </button>
        <button
          className={`tab-button ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          📋 Data
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="grid grid-3">
              {/* System Status */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">System Status</h3>
                </div>
                <div className="status-grid">
                  <div className="status-item">
                    <span className="status-label">Data Loaded</span>
                    <span className={`status-value ${dataLoaded ? 'success' : 'error'}`}>
                      {dataLoaded ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Model Trained</span>
                    <span className={`status-value ${modelTrained ? 'success' : 'error'}`}>
                      {modelTrained ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Signals Generated</span>
                    <span className="status-value">{signals.length}</span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Performance</h3>
                </div>
                <div className="metrics-grid">
                  {modelStats && (
                    <>
                      <div className="metric-item">
                        <span className="metric-label">Model Accuracy</span>
                        <span className="metric-value">
                          {((1 - modelStats.trainingState?.bestLoss || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Training Epochs</span>
                        <span className="metric-value">{modelStats.trainingState?.epoch || 0}</span>
                      </div>
                    </>
                  )}
                  {dataStats && (
                    <div className="metric-item">
                      <span className="metric-label">Data Quality</span>
                      <span className="metric-value">{dataStats.dataQuality}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Recent Activity</h3>
                </div>
                <div className="activity-list">
                  {signals.slice(-5).reverse().map((signal, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon" style={{ color: getSignalColor(signal.signal) }}>
                        {signal.signal === 'BUY' ? '📈' : signal.signal === 'SELL' ? '📉' : '➡️'}
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">{signal.signal}</div>
                        <div className="activity-subtitle">
                          ${signal.price.toFixed(4)} • {(signal.confidence * 100).toFixed(1)}% confidence
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'signals' && (
          <div className="signals-tab">
            <div className="signals-header">
              <h3>Trading Signals</h3>
              <div className="signals-filters">
                <select className="form-select" defaultValue="all">
                  <option value="all">All Signals</option>
                  <option value="BUY">Buy Signals</option>
                  <option value="SELL">Sell Signals</option>
                  <option value="HOLD">Hold Signals</option>
                </select>
              </div>
            </div>
            
            <div className="signals-grid">
              {signals.map((signal, index) => (
                <div key={index} className="signal-card">
                  <div className="signal-header">
                    <div 
                      className="signal-type"
                      style={{ backgroundColor: getSignalColor(signal.signal) }}
                    >
                      {signal.signal}
                    </div>
                    <div className="signal-confidence">
                      {getConfidenceLevel(signal.confidence)}
                    </div>
                  </div>
                  
                  <div className="signal-content">
                    <div className="signal-price">
                      <span className="price-label">Price:</span>
                      <span className="price-value">${signal.price.toFixed(4)}</span>
                    </div>
                    
                    {signal.predictedPrice && (
                      <div className="signal-prediction">
                        <span className="prediction-label">Predicted:</span>
                        <span className="prediction-value">${signal.predictedPrice.toFixed(4)}</span>
                        <span className={`prediction-change ${signal.priceChange > 0 ? 'positive' : 'negative'}`}>
                          {(signal.priceChange * 100).toFixed(2)}%
                        </span>
                      </div>
                    )}
                    
                    <div className="signal-sources">
                      <span className="sources-label">Sources:</span>
                      <div className="sources-tags">
                        {signal.sources?.map((source, idx) => (
                          <span key={idx} className="source-tag">{source}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="signal-footer">
                    <span className="signal-time">
                      {new Date(signal.timestamp).toLocaleString()}
                    </span>
                    <span className="signal-confidence-value">
                      {(signal.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'model' && (
          <div className="model-tab">
            <div className="grid grid-2">
              {/* Model Configuration */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Model Configuration</h3>
                </div>
                {modelStats && (
                  <div className="model-config">
                    <div className="config-item">
                      <span className="config-label">Sequence Length</span>
                      <span className="config-value">{modelStats.sequenceLength}</span>
                    </div>
                    <div className="config-item">
                      <span className="config-label">Prediction Length</span>
                      <span className="config-value">{modelStats.predictionLength}</span>
                    </div>
                    <div className="config-item">
                      <span className="config-label">Feature Count</span>
                      <span className="config-value">{modelStats.featureCount}</span>
                    </div>
                    <div className="config-item">
                      <span className="config-label">Model Dimension</span>
                      <span className="config-value">{modelStats.config?.dModel}</span>
                    </div>
                    <div className="config-item">
                      <span className="config-label">Attention Heads</span>
                      <span className="config-value">{modelStats.config?.nHead}</span>
                    </div>
                    <div className="config-item">
                      <span className="config-label">Layers</span>
                      <span className="config-value">{modelStats.config?.nLayer}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Training Statistics */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Training Statistics</h3>
                </div>
                {modelStats && (
                  <div className="training-stats">
                    <div className="stat-item">
                      <span className="stat-label">Current Loss</span>
                      <span className="stat-value">{modelStats.trainingState?.loss?.toFixed(6) || 'N/A'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Best Loss</span>
                      <span className="stat-value">{modelStats.trainingState?.bestLoss?.toFixed(6) || 'N/A'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Training Epochs</span>
                      <span className="stat-value">{modelStats.trainingState?.epoch || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Learning Rate</span>
                      <span className="stat-value">{modelStats.trainingState?.learningRate || 'N/A'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Optimizer</span>
                      <span className="stat-value">{modelStats.trainingState?.optimizer || 'N/A'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="data-tab">
            <div className="grid grid-2">
              {/* Data Statistics */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Data Statistics</h3>
                </div>
                {dataStats && (
                  <div className="data-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total Points</span>
                      <span className="stat-value">{dataStats.totalPoints.toLocaleString()}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Date Range</span>
                      <span className="stat-value">
                        {dataStats.dateRange.start.toLocaleDateString()} - {dataStats.dateRange.end.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Price Range</span>
                      <span className="stat-value">
                        ${dataStats.priceStats.min.toFixed(4)} - ${dataStats.priceStats.max.toFixed(4)}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Volatility</span>
                      <span className="stat-value">{(dataStats.volatility * 100).toFixed(2)}%</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Data Quality</span>
                      <span className="stat-value">{dataStats.dataQuality}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Chart */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Price Chart (Last 100 Points)</h3>
                </div>
                <div className="price-chart">
                  {chartData.length > 0 ? (
                    <div className="chart-container">
                      <svg width="100%" height="200" className="price-svg">
                        <polyline
                          fill="none"
                          stroke="var(--accent)"
                          strokeWidth="2"
                          points={chartData.map((point, index) => 
                            `${(index / (chartData.length - 1)) * 100},${200 - (point.price - Math.min(...chartData.map(p => p.price))) / (Math.max(...chartData.map(p => p.price)) - Math.min(...chartData.map(p => p.price))) * 180}`
                          ).join(' ')}
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="no-data">No chart data available</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingDashboard; 