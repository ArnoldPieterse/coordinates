/**
 * Transformer Trading System - Advanced AI-powered trading
 * Integrates transformer models with technical analysis for enhanced trading decisions
 * Based on concepts from Transformers_Trading_01 repository
 */

import { MeanReversionRSI } from './MeanReversionRSI.js';
import { DataLoader } from './DataLoader.js';

export class TransformerTrading {
  constructor() {
    this.meanReversionRSI = new MeanReversionRSI();
    this.dataLoader = new DataLoader();
    this.model = null;
    this.scaler = null;
    this.featureColumns = [
      'open', 'high', 'low', 'close', 'volume',
      'rsi', 'bb_high', 'bb_low', 'ma_20', 'ma_20_slope',
      'macd', 'macd_signal', 'macd_histogram',
      'stoch_k', 'stoch_d', 'atr'
    ];
    this.sequenceLength = 60; // Number of time steps to look back
    this.predictionLength = 5; // Number of future steps to predict
    this.isModelLoaded = false;
    this.trainingData = [];
    this.validationData = [];
    this.processedData = [];
  }

  // Initialize the transformer trading system
  async initialize() {
    console.log('🤖 Initializing Transformer Trading System...');
    
    try {
      // Initialize mean reversion RSI as base strategy
      await this.meanReversionRSI.initialize();
      
      // Load or create transformer model
      await this.loadOrCreateModel();
      
      // Initialize scaler for data normalization
      this.initializeScaler();
      
      this.isModelLoaded = true;
      console.log('✅ Transformer Trading System initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize Transformer Trading System:', error);
      throw error;
    }
  }

  // Load existing model or create new one
  async loadOrCreateModel() {
    try {
      // Try to load existing model from localStorage
      const savedModel = localStorage.getItem('transformerTradingModel');
      if (savedModel) {
        this.model = JSON.parse(savedModel);
        console.log('📥 Loaded existing transformer model');
      } else {
        // Create new model
        this.model = this.createTransformerModel();
        console.log('🆕 Created new transformer model');
      }
    } catch (error) {
      console.warn('⚠️ Could not load model, creating new one:', error);
      this.model = this.createTransformerModel();
    }
  }

  // Create transformer model architecture
  createTransformerModel() {
    return {
      // Model configuration
      config: {
        dModel: 128, // Model dimension
        nHead: 8, // Number of attention heads
        nLayer: 6, // Number of transformer layers
        dropout: 0.1,
        sequenceLength: this.sequenceLength,
        featureCount: this.featureColumns.length,
        predictionLength: this.predictionLength
      },
      
      // Model weights (simplified for browser)
      weights: {
        // Embedding layer
        embedding: this.initializeWeights(this.sequenceLength, this.featureColumns.length),
        
        // Transformer layers
        transformerLayers: Array(this.config.nLayer).fill(null).map(() => ({
          attention: {
            query: this.initializeWeights(this.config.dModel, this.config.dModel),
            key: this.initializeWeights(this.config.dModel, this.config.dModel),
            value: this.initializeWeights(this.config.dModel, this.config.dModel)
          },
          feedForward: {
            linear1: this.initializeWeights(this.config.dModel * 4, this.config.dModel),
            linear2: this.initializeWeights(this.config.dModel, this.config.dModel * 4)
          },
          layerNorm1: this.initializeWeights(this.config.dModel, 1),
          layerNorm2: this.initializeWeights(this.config.dModel, 1)
        })),
        
        // Output layer
        output: this.initializeWeights(this.config.predictionLength, this.config.dModel)
      },
      
      // Training state
      trainingState: {
        epoch: 0,
        loss: Infinity,
        bestLoss: Infinity,
        learningRate: 0.001,
        optimizer: 'adam'
      }
    };
  }

  // Initialize weights with Xavier/Glorot initialization
  initializeWeights(rows, cols) {
    const weights = [];
    const scale = Math.sqrt(2.0 / (rows + cols));
    
    for (let i = 0; i < rows; i++) {
      weights[i] = [];
      for (let j = 0; j < cols; j++) {
        weights[i][j] = (Math.random() - 0.5) * 2 * scale;
      }
    }
    
    return weights;
  }

  // Initialize data scaler
  initializeScaler() {
    this.scaler = {
      min: new Array(this.featureColumns.length).fill(Infinity),
      max: new Array(this.featureColumns.length).fill(-Infinity),
      fitted: false
    };
  }

  // Fit scaler to data
  fitScaler(data) {
    if (!data || data.length === 0) return;
    
    // Find min and max for each feature
    for (let i = 0; i < this.featureColumns.length; i++) {
      for (let j = 0; j < data.length; j++) {
        const value = data[j][i];
        if (value < this.scaler.min[i]) this.scaler.min[i] = value;
        if (value > this.scaler.max[i]) this.scaler.max[i] = value;
      }
    }
    
    this.scaler.fitted = true;
  }

  // Scale data using fitted scaler
  scaleData(data) {
    if (!this.scaler.fitted) {
      this.fitScaler(data);
    }
    
    return data.map(row => 
      row.map((value, i) => {
        const range = this.scaler.max[i] - this.scaler.min[i];
        return range === 0 ? 0 : (value - this.scaler.min[i]) / range;
      })
    );
  }

  // Inverse scale data
  inverseScaleData(data) {
    return data.map(row => 
      row.map((value, i) => {
        const range = this.scaler.max[i] - this.scaler.min[i];
        return value * range + this.scaler.min[i];
      })
    );
  }

  // Add technical indicators to price data
  addTechnicalIndicators(data) {
    return data.map((candle, index) => {
      const indicators = {};
      
      // RSI
      indicators.rsi = this.calculateRSI(data, index, 14);
      
      // Bollinger Bands
      const bb = this.calculateBollingerBands(data, index, 20, 2);
      indicators.bb_high = bb.upper;
      indicators.bb_low = bb.lower;
      
      // Moving Averages
      indicators.ma_20 = this.calculateSMA(data, index, 20);
      indicators.ma_20_slope = this.calculateSlope(data, index, 20);
      
      // MACD
      const macd = this.calculateMACD(data, index);
      indicators.macd = macd.macd;
      indicators.macd_signal = macd.signal;
      indicators.macd_histogram = macd.histogram;
      
      // Stochastic
      const stoch = this.calculateStochastic(data, index, 14);
      indicators.stoch_k = stoch.k;
      indicators.stoch_d = stoch.d;
      
      // ATR (Average True Range)
      indicators.atr = this.calculateATR(data, index, 14);
      
      return {
        ...candle,
        ...indicators
      };
    });
  }

  // Calculate RSI
  calculateRSI(data, index, period) {
    if (index < period) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = index - period + 1; i <= index; i++) {
      const change = data[i].close - data[i - 1].close;
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // Calculate Bollinger Bands
  calculateBollingerBands(data, index, period, stdDev) {
    if (index < period - 1) return { upper: data[index].close, lower: data[index].close };
    
    const prices = [];
    for (let i = index - period + 1; i <= index; i++) {
      prices.push(data[i].close);
    }
    
    const sma = prices.reduce((sum, price) => sum + price, 0) / period;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const std = Math.sqrt(variance);
    
    return {
      upper: sma + (stdDev * std),
      lower: sma - (stdDev * std)
    };
  }

  // Calculate Simple Moving Average
  calculateSMA(data, index, period) {
    if (index < period - 1) return data[index].close;
    
    let sum = 0;
    for (let i = index - period + 1; i <= index; i++) {
      sum += data[i].close;
    }
    
    return sum / period;
  }

  // Calculate slope of moving average
  calculateSlope(data, index, period) {
    if (index < period) return 0;
    
    const currentSMA = this.calculateSMA(data, index, period);
    const previousSMA = this.calculateSMA(data, index - 1, period);
    
    return currentSMA - previousSMA;
  }

  // Calculate MACD
  calculateMACD(data, index) {
    if (index < 26) return { macd: 0, signal: 0, histogram: 0 };
    
    const ema12 = this.calculateEMA(data, index, 12);
    const ema26 = this.calculateEMA(data, index, 26);
    const macd = ema12 - ema26;
    
    // For simplicity, we'll use a simple average for signal line
    const signal = this.calculateEMA([...Array(index - 25).fill(0), macd], index, 9);
    const histogram = macd - signal;
    
    return { macd, signal, histogram };
  }

  // Calculate Exponential Moving Average
  calculateEMA(data, index, period) {
    if (index < period - 1) return data[index].close;
    
    const multiplier = 2 / (period + 1);
    let ema = data[index - period + 1].close;
    
    for (let i = index - period + 2; i <= index; i++) {
      ema = (data[i].close * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  // Calculate Stochastic Oscillator
  calculateStochastic(data, index, period) {
    if (index < period - 1) return { k: 50, d: 50 };
    
    const prices = [];
    for (let i = index - period + 1; i <= index; i++) {
      prices.push(data[i].high);
      prices.push(data[i].low);
      prices.push(data[i].close);
    }
    
    const highestHigh = Math.max(...prices);
    const lowestLow = Math.min(...prices);
    const currentClose = data[index].close;
    
    const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    const d = this.calculateSMA([...Array(index - period + 1).fill(50), k], index, 3);
    
    return { k, d };
  }

  // Calculate Average True Range
  calculateATR(data, index, period) {
    if (index < period) return 0;
    
    let trSum = 0;
    for (let i = index - period + 1; i <= index; i++) {
      const high = data[i].high;
      const low = data[i].low;
      const prevClose = i > 0 ? data[i - 1].close : data[i].close;
      
      const tr1 = high - low;
      const tr2 = Math.abs(high - prevClose);
      const tr3 = Math.abs(low - prevClose);
      
      trSum += Math.max(tr1, tr2, tr3);
    }
    
    return trSum / period;
  }

  // Prepare training data
  prepareTrainingData(priceData) {
    console.log('📊 Preparing training data...');
    
    // Add technical indicators
    const dataWithIndicators = this.addTechnicalIndicators(priceData);
    
    // Convert to feature matrix
    const features = dataWithIndicators.map(candle => 
      this.featureColumns.map(col => candle[col] || 0)
    );
    
    // Scale the data
    const scaledFeatures = this.scaleData(features);
    
    // Create sequences for training
    const sequences = [];
    const targets = [];
    
    for (let i = this.sequenceLength; i < scaledFeatures.length - this.predictionLength; i++) {
      const sequence = scaledFeatures.slice(i - this.sequenceLength, i);
      const target = scaledFeatures.slice(i, i + this.predictionLength).map(row => row[3]); // Close price
      
      sequences.push(sequence);
      targets.push(target);
    }
    
    // Split into training and validation
    const splitIndex = Math.floor(sequences.length * 0.8);
    this.trainingData = {
      sequences: sequences.slice(0, splitIndex),
      targets: targets.slice(0, splitIndex)
    };
    this.validationData = {
      sequences: sequences.slice(splitIndex),
      targets: targets.slice(splitIndex)
    };
    
    console.log(`✅ Prepared ${sequences.length} training sequences`);
    console.log(`   Training: ${this.trainingData.sequences.length}`);
    console.log(`   Validation: ${this.validationData.sequences.length}`);
    
    return { sequences, targets };
  }

  // Train the transformer model
  async trainModel(epochs = 50, batchSize = 32) {
    console.log('🎯 Training transformer model...');
    
    if (!this.trainingData.sequences.length) {
      throw new Error('No training data available. Call prepareTrainingData first.');
    }
    
    const { sequences, targets } = this.trainingData;
    const { valSequences, valTargets } = this.validationData;
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;
      let batchCount = 0;
      
      // Training
      for (let i = 0; i < sequences.length; i += batchSize) {
        const batchSequences = sequences.slice(i, i + batchSize);
        const batchTargets = targets.slice(i, i + batchSize);
        
        const loss = this.trainBatch(batchSequences, batchTargets);
        totalLoss += loss;
        batchCount++;
      }
      
      const avgLoss = totalLoss / batchCount;
      
      // Validation
      let valLoss = 0;
      if (valSequences.length > 0) {
        for (let i = 0; i < valSequences.length; i += batchSize) {
          const batchSequences = valSequences.slice(i, i + batchSize);
          const batchTargets = valTargets.slice(i, i + batchSize);
          
          valLoss += this.validateBatch(batchSequences, batchTargets);
        }
        valLoss /= Math.ceil(valSequences.length / batchSize);
      }
      
      // Update model state
      this.model.trainingState.epoch = epoch + 1;
      this.model.trainingState.loss = avgLoss;
      
      if (avgLoss < this.model.trainingState.bestLoss) {
        this.model.trainingState.bestLoss = avgLoss;
        this.saveModel();
      }
      
      // Log progress
      if (epoch % 10 === 0 || epoch === epochs - 1) {
        console.log(`Epoch ${epoch + 1}/${epochs}: Loss=${avgLoss.toFixed(6)}, Val=${valLoss.toFixed(6)}`);
      }
    }
    
    console.log('✅ Model training completed');
  }

  // Train a single batch
  trainBatch(sequences, targets) {
    // Simplified training for browser environment
    // In a real implementation, this would use proper backpropagation
    
    let totalLoss = 0;
    
    for (let i = 0; i < sequences.length; i++) {
      const sequence = sequences[i];
      const target = targets[i];
      
      // Forward pass (simplified)
      const prediction = this.forwardPass(sequence);
      
      // Calculate loss
      const loss = this.calculateLoss(prediction, target);
      totalLoss += loss;
      
      // Simplified backpropagation (gradient descent)
      this.updateWeights(sequence, prediction, target);
    }
    
    return totalLoss / sequences.length;
  }

  // Validate a single batch
  validateBatch(sequences, targets) {
    let totalLoss = 0;
    
    for (let i = 0; i < sequences.length; i++) {
      const sequence = sequences[i];
      const target = targets[i];
      
      const prediction = this.forwardPass(sequence);
      const loss = this.calculateLoss(prediction, target);
      totalLoss += loss;
    }
    
    return totalLoss / sequences.length;
  }

  // Forward pass through the model
  forwardPass(sequence) {
    // Simplified transformer forward pass
    // In a real implementation, this would use proper attention mechanisms
    
    let hidden = sequence;
    
    // Apply transformer layers
    for (let layer = 0; layer < this.model.config.nLayer; layer++) {
      hidden = this.applyTransformerLayer(hidden, layer);
    }
    
    // Take the last time step output
    const lastStep = hidden[hidden.length - 1];
    
    // Apply output layer
    const output = this.applyLinear(lastStep, this.model.weights.output);
    
    return output;
  }

  // Apply a transformer layer
  applyTransformerLayer(hidden, layerIndex) {
    const layer = this.model.weights.transformerLayers[layerIndex];
    
    // Simplified self-attention
    const attended = this.applySelfAttention(hidden, layer.attention);
    
    // Add residual connection and layer norm
    const residual1 = this.add(hidden, attended);
    const normalized1 = this.applyLayerNorm(residual1, layer.layerNorm1);
    
    // Feed forward
    const ffOutput = this.applyFeedForward(normalized1, layer.feedForward);
    
    // Add residual connection and layer norm
    const residual2 = this.add(normalized1, ffOutput);
    const normalized2 = this.applyLayerNorm(residual2, layer.layerNorm2);
    
    return normalized2;
  }

  // Apply self-attention (simplified)
  applySelfAttention(hidden, attentionWeights) {
    // Simplified attention mechanism
    const query = this.applyLinear(hidden, attentionWeights.query);
    const key = this.applyLinear(hidden, attentionWeights.key);
    const value = this.applyLinear(hidden, attentionWeights.value);
    
    // Calculate attention scores
    const scores = this.matmul(query, this.transpose(key));
    const attention = this.softmax(scores);
    
    // Apply attention to values
    return this.matmul(attention, value);
  }

  // Apply feed forward network
  applyFeedForward(hidden, ffWeights) {
    const ff1 = this.applyLinear(hidden, ffWeights.linear1);
    const activated = this.relu(ff1);
    const ff2 = this.applyLinear(activated, ffWeights.linear2);
    
    return ff2;
  }

  // Apply linear transformation
  applyLinear(input, weights) {
    return this.matmul(input, weights);
  }

  // Apply layer normalization
  applyLayerNorm(input, weights) {
    // Simplified layer normalization
    return input.map(row => 
      row.map((val, i) => val * weights[i][0])
    );
  }

  // Matrix multiplication
  matmul(a, b) {
    const result = [];
    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < b[0].length; j++) {
        result[i][j] = 0;
        for (let k = 0; k < a[0].length; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    return result;
  }

  // Transpose matrix
  transpose(matrix) {
    const result = [];
    for (let i = 0; i < matrix[0].length; i++) {
      result[i] = [];
      for (let j = 0; j < matrix.length; j++) {
        result[i][j] = matrix[j][i];
      }
    }
    return result;
  }

  // Softmax function
  softmax(matrix) {
    return matrix.map(row => {
      const max = Math.max(...row);
      const exp = row.map(val => Math.exp(val - max));
      const sum = exp.reduce((a, b) => a + b, 0);
      return exp.map(val => val / sum);
    });
  }

  // ReLU activation
  relu(matrix) {
    return matrix.map(row => row.map(val => Math.max(0, val)));
  }

  // Add matrices
  add(a, b) {
    return a.map((row, i) => row.map((val, j) => val + b[i][j]));
  }

  // Calculate loss (MSE)
  calculateLoss(prediction, target) {
    let loss = 0;
    for (let i = 0; i < prediction.length; i++) {
      loss += Math.pow(prediction[i] - target[i], 2);
    }
    return loss / prediction.length;
  }

  // Update weights (simplified gradient descent)
  updateWeights(sequence, prediction, target) {
    // Simplified weight update
    // In a real implementation, this would use proper backpropagation
    const learningRate = this.model.trainingState.learningRate;
    
    // Update output weights
    for (let i = 0; i < this.model.weights.output.length; i++) {
      for (let j = 0; j < this.model.weights.output[i].length; j++) {
        const gradient = (prediction[i] - target[i]) * learningRate;
        this.model.weights.output[i][j] -= gradient;
      }
    }
  }

  // Generate trading signals
  generateSignals(priceData) {
    if (!this.isModelLoaded) {
      throw new Error('Model not loaded. Call initialize() first.');
    }
    
    console.log('📈 Generating transformer trading signals...');
    
    // Get base signals from mean reversion RSI
    const baseSignals = this.meanReversionRSI.generateSignals(priceData);
    
    // Add transformer predictions
    const transformerSignals = this.generateTransformerSignals(priceData);
    
    // Combine signals
    const combinedSignals = this.combineSignals(baseSignals, transformerSignals);
    
    console.log(`✅ Generated ${combinedSignals.length} combined signals`);
    
    return combinedSignals;
  }

  // Generate signals using transformer model
  generateTransformerSignals(priceData) {
    const signals = [];
    
    // Add technical indicators
    const dataWithIndicators = this.addTechnicalIndicators(priceData);
    
    // Convert to features
    const features = dataWithIndicators.map(candle => 
      this.featureColumns.map(col => candle[col] || 0)
    );
    
    // Scale features
    const scaledFeatures = this.scaleData(features);
    
    // Generate predictions for each point
    for (let i = this.sequenceLength; i < scaledFeatures.length; i++) {
      const sequence = scaledFeatures.slice(i - this.sequenceLength, i);
      const prediction = this.forwardPass(sequence);
      
      // Inverse scale prediction
      const dummyFeatures = new Array(this.featureColumns.length).fill(0);
      dummyFeatures[3] = prediction[0]; // Close price index
      const unscaledPrediction = this.inverseScaleData([dummyFeatures])[0][3];
      
      const currentPrice = priceData[i].close;
      const priceChange = (unscaledPrediction - currentPrice) / currentPrice;
      
      // Generate signal based on prediction
      let signal = 'HOLD';
      if (priceChange > 0.02) signal = 'BUY'; // 2% predicted increase
      else if (priceChange < -0.02) signal = 'SELL'; // 2% predicted decrease
      
      signals.push({
        timestamp: priceData[i].timestamp,
        price: currentPrice,
        predictedPrice: unscaledPrediction,
        priceChange: priceChange,
        signal: signal,
        confidence: Math.abs(priceChange),
        source: 'transformer'
      });
    }
    
    return signals;
  }

  // Combine base and transformer signals
  combineSignals(baseSignals, transformerSignals) {
    const combined = [];
    
    // Create a map of transformer signals by timestamp
    const transformerMap = new Map();
    transformerSignals.forEach(signal => {
      transformerMap.set(signal.timestamp, signal);
    });
    
    // Combine signals
    baseSignals.forEach(baseSignal => {
      const transformerSignal = transformerMap.get(baseSignal.timestamp);
      
      if (transformerSignal) {
        // Both signals exist - combine them
        const combinedSignal = this.combineSignalPair(baseSignal, transformerSignal);
        combined.push(combinedSignal);
      } else {
        // Only base signal exists
        combined.push({
          ...baseSignal,
          confidence: baseSignal.confidence * 0.7, // Reduce confidence
          sources: ['mean-reversion-rsi']
        });
      }
    });
    
    // Add transformer-only signals
    transformerSignals.forEach(transformerSignal => {
      const hasBaseSignal = baseSignals.some(base => base.timestamp === transformerSignal.timestamp);
      if (!hasBaseSignal) {
        combined.push({
          ...transformerSignal,
          confidence: transformerSignal.confidence * 0.8, // Reduce confidence
          sources: ['transformer']
        });
      }
    });
    
    // Sort by timestamp
    combined.sort((a, b) => a.timestamp - b.timestamp);
    
    return combined;
  }

  // Combine a pair of signals
  combineSignalPair(baseSignal, transformerSignal) {
    const baseWeight = 0.6;
    const transformerWeight = 0.4;
    
    // Weighted average of confidences
    const combinedConfidence = (baseSignal.confidence * baseWeight) + 
                              (transformerSignal.confidence * transformerWeight);
    
    // Determine combined signal
    let combinedSignal = 'HOLD';
    if (baseSignal.signal === 'BUY' && transformerSignal.signal === 'BUY') {
      combinedSignal = 'BUY';
    } else if (baseSignal.signal === 'SELL' && transformerSignal.signal === 'SELL') {
      combinedSignal = 'SELL';
    } else if (baseSignal.signal !== 'HOLD' && transformerSignal.signal === 'HOLD') {
      combinedSignal = baseSignal.signal;
    } else if (transformerSignal.signal !== 'HOLD' && baseSignal.signal === 'HOLD') {
      combinedSignal = transformerSignal.signal;
    }
    
    return {
      timestamp: baseSignal.timestamp,
      price: baseSignal.price,
      signal: combinedSignal,
      confidence: combinedConfidence,
      sources: ['mean-reversion-rsi', 'transformer'],
      baseSignal: baseSignal.signal,
      transformerSignal: transformerSignal.signal,
      predictedPrice: transformerSignal.predictedPrice,
      priceChange: transformerSignal.priceChange
    };
  }

  // Save model to localStorage
  saveModel() {
    try {
      localStorage.setItem('transformerTradingModel', JSON.stringify(this.model));
      console.log('💾 Model saved to localStorage');
    } catch (error) {
      console.warn('⚠️ Could not save model:', error);
    }
  }

  // Get model statistics
  getModelStats() {
    if (!this.model) return null;
    
    return {
      isLoaded: this.isModelLoaded,
      config: this.model.config,
      trainingState: this.model.trainingState,
      trainingDataSize: this.trainingData.sequences.length,
      validationDataSize: this.validationData.sequences.length,
      featureCount: this.featureColumns.length,
      sequenceLength: this.sequenceLength,
      predictionLength: this.predictionLength
    };
  }

  // Get trading statistics
  getTradingStats() {
    const baseStats = this.meanReversionRSI.getStatistics();
    
    return {
      ...baseStats,
      modelType: 'Transformer + Mean Reversion RSI',
      transformerEnabled: this.isModelLoaded,
      modelAccuracy: this.model?.trainingState?.bestLoss || 0,
      trainingEpochs: this.model?.trainingState?.epoch || 0
    };
  }

  // Load real EURUSD data
  async loadRealData() {
    console.log('📊 Loading real EURUSD data...');
    
    try {
      const rawData = await this.dataLoader.loadEURUSDSampleData();
      this.processedData = this.dataLoader.processDataForTrading(rawData);
      
      console.log(`✅ Loaded ${this.processedData.length} real data points`);
      return this.processedData;
      
    } catch (error) {
      console.error('❌ Failed to load real data:', error);
      throw error;
    }
  }

  // Get data statistics
  getDataStats() {
    return this.dataLoader.getDataStats();
  }
}

export default TransformerTrading; 