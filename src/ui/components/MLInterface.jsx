/**
 * Machine Learning Interface
 * Inspired by scikit-learn simplified repository
 * https://github.com/MariyaSha/scikit_learn_simplified
 */

import React, { useState, useEffect } from 'react';
import MLSystem from '../../ai/MLSystem.js';

const MLInterface = () => {
    const [mlSystem] = useState(new MLSystem());
    const [datasets, setDatasets] = useState([]);
    const [selectedDataset, setSelectedDataset] = useState(null);
    const [selectedModel, setSelectedModel] = useState('logistic_regression');
    const [selectedWorkflow, setSelectedWorkflow] = useState('classification_pipeline');
    const [results, setResults] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [sampleData, setSampleData] = useState(null);

    useEffect(() => {
        loadDatasets();
        generateSampleData();
        setupEventListeners();
    }, []);

    const setupEventListeners = () => {
        mlSystem.on('dataset-created', (dataset) => {
            setDatasets(prev => [...prev, dataset]);
        });

        mlSystem.on('model-trained', ({ model, type }) => {
            console.log(`[ML] Model trained: ${type}`);
        });

        mlSystem.on('pipeline-completed', ({ type, results }) => {
            setResults(results);
            setIsProcessing(false);
            console.log(`[ML] Pipeline completed: ${type}`, results);
        });
    };

    const loadDatasets = () => {
        const allDatasets = mlSystem.getAllDatasets();
        setDatasets(allDatasets);
    };

    const generateSampleData = () => {
        // Generate sample data for demonstration
        const sampleFeatures = Array.from({ length: 100 }, () => 
            Array.from({ length: 5 }, () => Math.random() * 10)
        );
        
        const sampleTargets = sampleFeatures.map(features => 
            features[0] + features[1] * 2 + features[2] * 0.5 > 15 ? 1 : 0
        );

        setSampleData({ features: sampleFeatures, targets: sampleTargets });
    };

    const handleCreateDataset = async () => {
        if (!sampleData) return;

        try {
            const dataset = await mlSystem.createDataset(
                'Sample Classification Dataset',
                sampleData.features,
                sampleData.targets
            );
            setSelectedDataset(dataset);
            console.log('[ML] Dataset created:', dataset);
        } catch (error) {
            console.error('[ML] Failed to create dataset:', error);
        }
    };

    const handleRunWorkflow = async () => {
        if (!selectedDataset) {
            alert('Please select a dataset first');
            return;
        }

        setIsProcessing(true);
        setResults(null);

        try {
            let workflowResults;
            
            if (selectedWorkflow === 'classification_pipeline') {
                workflowResults = await mlSystem.executeClassificationPipeline(
                    selectedDataset.data,
                    selectedDataset.target,
                    selectedModel
                );
            } else if (selectedWorkflow === 'regression_pipeline') {
                workflowResults = await mlSystem.executeRegressionPipeline(
                    selectedDataset.data,
                    selectedDataset.target,
                    selectedModel
                );
            } else if (selectedWorkflow === 'clustering_pipeline') {
                workflowResults = await mlSystem.executeClusteringPipeline(
                    selectedDataset.data,
                    selectedModel
                );
            }

            setResults(workflowResults);
        } catch (error) {
            console.error('[ML] Workflow failed:', error);
            setIsProcessing(false);
        }
    };

    const renderDatasetInfo = () => {
        if (!selectedDataset) return null;

        return (
            <div className="dataset-info">
                <h3>Dataset: {selectedDataset.name}</h3>
                <div className="dataset-stats">
                    <div className="stat">
                        <span className="label">Samples:</span>
                        <span className="value">{selectedDataset.samples}</span>
                    </div>
                    <div className="stat">
                        <span className="label">Features:</span>
                        <span className="value">{selectedDataset.features}</span>
                    </div>
                    <div className="stat">
                        <span className="label">Created:</span>
                        <span className="value">{new Date(selectedDataset.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderModelSelection = () => {
        const models = mlSystem.getAvailableModels();
        const workflows = mlSystem.getAvailableWorkflows();

        return (
            <div className="model-selection">
                <div className="selection-group">
                    <label>Workflow:</label>
                    <select 
                        value={selectedWorkflow} 
                        onChange={(e) => setSelectedWorkflow(e.target.value)}
                    >
                        {workflows.map(workflow => (
                            <option key={workflow} value={workflow}>
                                {mlSystem.workflows.get(workflow).name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="selection-group">
                    <label>Model:</label>
                    <select 
                        value={selectedModel} 
                        onChange={(e) => setSelectedModel(e.target.value)}
                    >
                        {models.map(model => (
                            <option key={model} value={model}>
                                {mlSystem.models.get(model).name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        );
    };

    const renderResults = () => {
        if (!results) return null;

        return (
            <div className="results-section">
                <h3>Results</h3>
                
                <div className="metrics-grid">
                    {results.metrics && Object.entries(results.metrics).map(([metric, value]) => (
                        <div key={metric} className="metric-card">
                            <span className="metric-name">{metric.replace('_', ' ').toUpperCase()}</span>
                            <span className="metric-value">{value.toFixed(4)}</span>
                        </div>
                    ))}
                </div>

                {results.predictions && (
                    <div className="predictions-section">
                        <h4>Predictions (First 10)</h4>
                        <div className="predictions-list">
                            {results.predictions.slice(0, 10).map((pred, i) => (
                                <span key={i} className="prediction">
                                    {typeof pred === 'number' ? pred.toFixed(3) : pred}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {results.clusters && (
                    <div className="clusters-section">
                        <h4>Clusters</h4>
                        <div className="clusters-info">
                            <p>Number of clusters: {new Set(results.clusters).size}</p>
                            <p>Cluster distribution: {JSON.stringify(
                                results.clusters.reduce((acc, cluster) => {
                                    acc[cluster] = (acc[cluster] || 0) + 1;
                                    return acc;
                                }, {})
                            )}</p>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderDatasetsList = () => {
        return (
            <div className="datasets-section">
                <h3>Datasets ({datasets.length})</h3>
                
                {datasets.length === 0 && (
                    <div className="no-datasets">
                        <p>No datasets available. Create a sample dataset to get started.</p>
                        <button 
                            className="create-dataset-btn"
                            onClick={handleCreateDataset}
                        >
                            Create Sample Dataset
                        </button>
                    </div>
                )}

                <div className="datasets-grid">
                    {datasets.map(dataset => (
                        <div 
                            key={dataset.name}
                            className={`dataset-card ${selectedDataset?.name === dataset.name ? 'selected' : ''}`}
                            onClick={() => setSelectedDataset(dataset)}
                        >
                            <h4>{dataset.name}</h4>
                            <div className="dataset-meta">
                                <span>Samples: {dataset.samples}</span>
                                <span>Features: {dataset.features}</span>
                            </div>
                            <div className="dataset-date">
                                {new Date(dataset.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="ml-interface">
            <div className="interface-header">
                <h2>🧠 Machine Learning System</h2>
                <p>Powered by scikit-learn inspired algorithms</p>
            </div>
            
            <div className="interface-content">
                <div className="left-panel">
                    {renderDatasetsList()}
                    
                    {selectedDataset && (
                        <>
                            {renderDatasetInfo()}
                            {renderModelSelection()}
                            
                            <div className="workflow-controls">
                                <button 
                                    className={`run-workflow-btn ${isProcessing ? 'processing' : ''}`}
                                    onClick={handleRunWorkflow}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? 'Processing...' : 'Run Workflow'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
                
                <div className="right-panel">
                    {isProcessing && (
                        <div className="processing-indicator">
                            <div className="spinner"></div>
                            <p>Running {selectedWorkflow.replace('_', ' ')}...</p>
                        </div>
                    )}
                    
                    {renderResults()}
                </div>
            </div>
            
            <style jsx>{`
                .ml-interface {
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
                
                .left-panel, .right-panel {
                    background: #2a2a2a;
                    padding: 20px;
                    border-radius: 8px;
                    border: 1px solid #333;
                }
                
                .datasets-section {
                    margin-bottom: 30px;
                }
                
                .no-datasets {
                    text-align: center;
                    padding: 20px;
                    background: #333;
                    border-radius: 6px;
                }
                
                .create-dataset-btn {
                    background: #00ff00;
                    color: #000000;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    margin-top: 10px;
                }
                
                .datasets-grid {
                    display: grid;
                    gap: 15px;
                }
                
                .dataset-card {
                    background: #333;
                    padding: 15px;
                    border-radius: 6px;
                    border: 1px solid #555;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .dataset-card:hover {
                    border-color: #00ff00;
                }
                
                .dataset-card.selected {
                    border-color: #00ff00;
                    background: #2a2a2a;
                }
                
                .dataset-meta {
                    display: flex;
                    gap: 15px;
                    font-size: 12px;
                    color: #888;
                    margin: 10px 0;
                }
                
                .dataset-date {
                    font-size: 12px;
                    color: #666;
                }
                
                .dataset-info {
                    background: #333;
                    padding: 15px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                }
                
                .dataset-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-top: 10px;
                }
                
                .stat {
                    text-align: center;
                }
                
                .stat .label {
                    display: block;
                    font-size: 12px;
                    color: #888;
                }
                
                .stat .value {
                    display: block;
                    font-size: 16px;
                    font-weight: bold;
                    color: #00ff00;
                }
                
                .model-selection {
                    background: #333;
                    padding: 15px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                }
                
                .selection-group {
                    margin-bottom: 15px;
                }
                
                .selection-group label {
                    display: block;
                    margin-bottom: 5px;
                    color: #00ff00;
                }
                
                .selection-group select {
                    width: 100%;
                    padding: 8px;
                    background: #1a1a1a;
                    border: 1px solid #555;
                    color: #ffffff;
                    border-radius: 4px;
                }
                
                .workflow-controls {
                    text-align: center;
                }
                
                .run-workflow-btn {
                    background: #0088ff;
                    color: #ffffff;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                    transition: all 0.3s ease;
                }
                
                .run-workflow-btn:hover:not(:disabled) {
                    background: #0066cc;
                }
                
                .run-workflow-btn.processing {
                    background: #666;
                    cursor: not-allowed;
                }
                
                .processing-indicator {
                    text-align: center;
                    padding: 40px;
                }
                
                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 3px solid #333;
                    border-top: 3px solid #00ff00;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .results-section {
                    background: #333;
                    padding: 20px;
                    border-radius: 6px;
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
                
                .predictions-section, .clusters-section {
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #555;
                }
                
                .predictions-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-top: 10px;
                }
                
                .prediction {
                    background: #1a1a1a;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 12px;
                }
                
                .clusters-info {
                    background: #1a1a1a;
                    padding: 15px;
                    border-radius: 4px;
                    margin-top: 10px;
                }
                
                .clusters-info p {
                    margin: 5px 0;
                    font-family: monospace;
                    font-size: 12px;
                }
            `}</style>
        </div>
    );
};

export default MLInterface; 