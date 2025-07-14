// Autoregressive Mesh Generator - Implementation based on detailed specifications
// Implements autoregressive Transformer for mesh generation with tree-structured sequences

import * as THREE from './three.module.js';

// ============================================================================
// 1. AUTOREGRESSIVE TRANSFORMER ARCHITECTURE
// ============================================================================

class AutoregressiveTransformer {
  constructor(config = {}) {
    this.config = {
      dModel: config.dModel || 512,
      nHeads: config.nHeads || 8,
      nLayers: config.nLayers || 6,
      dFF: config.dFF || 2048,
      maxSeqLength: config.maxSeqLength || 1024,
      vocabSize: config.vocabSize || 1000,
      dropout: config.dropout || 0.1,
      ...config
    };
    
    this.layers = [];
    this.embedding = null;
    this.positionalEncoding = null;
    this.outputProjection = null;
    
    this.initializeLayers();
  }

  initializeLayers() {
    // Token embedding layer
    this.embedding = new TokenEmbedding(this.config.vocabSize, this.config.dModel);
    
    // Positional encoding
    this.positionalEncoding = new PositionalEncoding(this.config.dModel, this.config.maxSeqLength);
    
    // Transformer layers
    for (let i = 0; i < this.config.nLayers; i++) {
      this.layers.push(new TransformerLayer(this.config));
    }
    
    // Output projection
    this.outputProjection = new LinearLayer(this.config.dModel, this.config.vocabSize);
  }

  forward(input, mask = null) {
    let x = this.embedding.forward(input);
    x = this.positionalEncoding.forward(x);
    
    // Apply transformer layers
    for (const layer of this.layers) {
      x = layer.forward(x, mask);
    }
    
    // Project to vocabulary
    const output = this.outputProjection.forward(x);
    
    return output;
  }

  generate(initialSequence, maxLength = 100, temperature = 1.0) {
    let sequence = [...initialSequence];
    
    for (let i = 0; i < maxLength; i++) {
      // Create attention mask for autoregressive generation
      const mask = this.createCausalMask(sequence.length);
      
      // Forward pass
      const logits = this.forward(sequence, mask);
      
      // Get next token probabilities
      const lastLogits = logits[logits.length - 1];
      const probabilities = this.softmax(lastLogits, temperature);
      
      // Sample next token
      const nextToken = this.sampleToken(probabilities);
      sequence.push(nextToken);
      
      // Check for end token
      if (nextToken === this.config.endToken) {
        break;
      }
    }
    
    return sequence;
  }

  createCausalMask(seqLength) {
    const mask = new Array(seqLength).fill(0).map(() => new Array(seqLength).fill(0));
    
    for (let i = 0; i < seqLength; i++) {
      for (let j = 0; j < seqLength; j++) {
        mask[i][j] = j <= i ? 1 : 0; // Causal mask: can only attend to previous tokens
      }
    }
    
    return mask;
  }

  softmax(logits, temperature = 1.0) {
    const scaledLogits = logits.map(logit => logit / temperature);
    const maxLogit = Math.max(...scaledLogits);
    const expLogits = scaledLogits.map(logit => Math.exp(logit - maxLogit));
    const sumExpLogits = expLogits.reduce((sum, exp) => sum + exp, 0);
    
    return expLogits.map(exp => exp / sumExpLogits);
  }

  sampleToken(probabilities) {
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < probabilities.length; i++) {
      cumulative += probabilities[i];
      if (random <= cumulative) {
        return i;
      }
    }
    
    return probabilities.length - 1; // Fallback to last token
  }
}

class TokenEmbedding {
  constructor(vocabSize, dModel) {
    this.vocabSize = vocabSize;
    this.dModel = dModel;
    this.embeddingMatrix = this.initializeEmbeddings();
  }

  initializeEmbeddings() {
    // Initialize embedding matrix with random values
    const matrix = [];
    for (let i = 0; i < this.vocabSize; i++) {
      const embedding = [];
      for (let j = 0; j < this.dModel; j++) {
        embedding.push((Math.random() - 0.5) * 0.1);
      }
      matrix.push(embedding);
    }
    return matrix;
  }

  forward(tokens) {
    return tokens.map(token => this.embeddingMatrix[token] || this.embeddingMatrix[0]);
  }
}

class PositionalEncoding {
  constructor(dModel, maxLength) {
    this.dModel = dModel;
    this.maxLength = maxLength;
    this.encodingMatrix = this.computePositionalEncoding();
  }

  computePositionalEncoding() {
    const encoding = [];
    
    for (let pos = 0; pos < this.maxLength; pos++) {
      const encodingRow = [];
      for (let i = 0; i < this.dModel; i++) {
        if (i % 2 === 0) {
          encodingRow.push(Math.sin(pos / Math.pow(10000, i / this.dModel)));
        } else {
          encodingRow.push(Math.cos(pos / Math.pow(10000, (i - 1) / this.dModel)));
        }
      }
      encoding.push(encodingRow);
    }
    
    return encoding;
  }

  forward(embeddings) {
    return embeddings.map((embedding, pos) => {
      const positional = this.encodingMatrix[pos] || this.encodingMatrix[0];
      return embedding.map((val, i) => val + positional[i]);
    });
  }
}

class TransformerLayer {
  constructor(config) {
    this.config = config;
    this.selfAttention = new MultiHeadAttention(config);
    this.feedForward = new FeedForward(config);
    this.layerNorm1 = new LayerNormalization(config.dModel);
    this.layerNorm2 = new LayerNormalization(config.dModel);
    this.dropout = config.dropout;
  }

  forward(x, mask = null) {
    // Self-attention with residual connection
    const attentionOutput = this.selfAttention.forward(x, x, x, mask);
    const residual1 = this.addResidual(x, attentionOutput);
    const normalized1 = this.layerNorm1.forward(residual1);
    
    // Feed-forward with residual connection
    const ffOutput = this.feedForward.forward(normalized1);
    const residual2 = this.addResidual(normalized1, ffOutput);
    const normalized2 = this.layerNorm2.forward(residual2);
    
    return normalized2;
  }

  addResidual(x, y) {
    return x.map((row, i) => row.map((val, j) => val + y[i][j]));
  }
}

class MultiHeadAttention {
  constructor(config) {
    this.config = config;
    this.dModel = config.dModel;
    this.nHeads = config.nHeads;
    this.dHead = Math.floor(config.dModel / config.nHeads);
    
    this.wq = new LinearLayer(config.dModel, config.dModel);
    this.wk = new LinearLayer(config.dModel, config.dModel);
    this.wv = new LinearLayer(config.dModel, config.dModel);
    this.wo = new LinearLayer(config.dModel, config.dModel);
  }

  forward(query, key, value, mask = null) {
    const batchSize = query.length;
    const seqLength = query[0].length;
    
    // Linear transformations
    const Q = this.wq.forward(query);
    const K = this.wk.forward(key);
    const V = this.wv.forward(value);
    
    // Reshape for multi-head attention
    const QHeads = this.reshapeForHeads(Q);
    const KHeads = this.reshapeForHeads(K);
    const VHeads = this.reshapeForHeads(V);
    
    // Compute attention for each head
    const attentionOutputs = [];
    for (let head = 0; head < this.nHeads; head++) {
      const attentionOutput = this.computeAttention(
        QHeads[head], KHeads[head], VHeads[head], mask
      );
      attentionOutputs.push(attentionOutput);
    }
    
    // Concatenate heads
    const concatenated = this.concatenateHeads(attentionOutputs);
    
    // Final linear transformation
    return this.wo.forward(concatenated);
  }

  reshapeForHeads(x) {
    const heads = [];
    for (let head = 0; head < this.nHeads; head++) {
      const headData = x.map(row => 
        row.slice(head * this.dHead, (head + 1) * this.dHead)
      );
      heads.push(headData);
    }
    return heads;
  }

  computeAttention(Q, K, V, mask = null) {
    const seqLength = Q.length;
    
    // Compute attention scores
    const scores = [];
    for (let i = 0; i < seqLength; i++) {
      const rowScores = [];
      for (let j = 0; j < seqLength; j++) {
        const score = this.dotProduct(Q[i], K[j]);
        rowScores.push(score);
      }
      scores.push(rowScores);
    }
    
    // Apply mask if provided
    if (mask) {
      for (let i = 0; i < seqLength; i++) {
        for (let j = 0; j < seqLength; j++) {
          if (mask[i][j] === 0) {
            scores[i][j] = -Infinity;
          }
        }
      }
    }
    
    // Apply softmax
    const attentionWeights = scores.map(row => this.softmax(row));
    
    // Apply attention weights to values
    const output = [];
    for (let i = 0; i < seqLength; i++) {
      const weightedSum = new Array(this.dHead).fill(0);
      for (let j = 0; j < seqLength; j++) {
        for (let k = 0; k < this.dHead; k++) {
          weightedSum[k] += attentionWeights[i][j] * V[j][k];
        }
      }
      output.push(weightedSum);
    }
    
    return output;
  }

  dotProduct(a, b) {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  }

  softmax(logits) {
    const maxLogit = Math.max(...logits);
    const expLogits = logits.map(logit => Math.exp(logit - maxLogit));
    const sumExpLogits = expLogits.reduce((sum, exp) => sum + exp, 0);
    
    return expLogits.map(exp => exp / sumExpLogits);
  }

  concatenateHeads(heads) {
    const seqLength = heads[0].length;
    const concatenated = [];
    
    for (let i = 0; i < seqLength; i++) {
      const row = [];
      for (const head of heads) {
        row.push(...head[i]);
      }
      concatenated.push(row);
    }
    
    return concatenated;
  }
}

class FeedForward {
  constructor(config) {
    this.config = config;
    this.linear1 = new LinearLayer(config.dModel, config.dFF);
    this.linear2 = new LinearLayer(config.dFF, config.dModel);
    this.activation = this.relu;
  }

  forward(x) {
    const hidden = this.linear1.forward(x);
    const activated = hidden.map(row => row.map(val => this.activation(val)));
    return this.linear2.forward(activated);
  }

  relu(x) {
    return Math.max(0, x);
  }
}

class LinearLayer {
  constructor(inputSize, outputSize) {
    this.inputSize = inputSize;
    this.outputSize = outputSize;
    this.weights = this.initializeWeights();
    this.bias = new Array(outputSize).fill(0).map(() => (Math.random() - 0.5) * 0.1);
  }

  initializeWeights() {
    const weights = [];
    for (let i = 0; i < this.outputSize; i++) {
      const row = [];
      for (let j = 0; j < this.inputSize; j++) {
        row.push((Math.random() - 0.5) * 0.1);
      }
      weights.push(row);
    }
    return weights;
  }

  forward(x) {
    const output = [];
    
    for (let i = 0; i < x.length; i++) {
      const row = [];
      for (let j = 0; j < this.outputSize; j++) {
        let sum = this.bias[j];
        for (let k = 0; k < this.inputSize; k++) {
          sum += this.weights[j][k] * x[i][k];
        }
        row.push(sum);
      }
      output.push(row);
    }
    
    return output;
  }
}

class LayerNormalization {
  constructor(dModel) {
    this.dModel = dModel;
    this.gamma = new Array(dModel).fill(1);
    this.beta = new Array(dModel).fill(0);
    this.epsilon = 1e-6;
  }

  forward(x) {
    return x.map(row => {
      const mean = row.reduce((sum, val) => sum + val, 0) / this.dModel;
      const variance = row.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / this.dModel;
      const std = Math.sqrt(variance + this.epsilon);
      
      return row.map((val, i) => 
        this.gamma[i] * (val - mean) / std + this.beta[i]
      );
    });
  }
}

// ============================================================================
// 2. TREE-STRUCTURED SEQUENCE ENCODING
// ============================================================================

class TreeSequenceEncoder {
  constructor(vocabSize) {
    this.vocabSize = vocabSize;
    this.tokenizer = new MeshTokenization();
    this.sequenceBuilder = new TreeSequenceBuilder();
  }

  encodeTree(branch) {
    const sequence = this.sequenceBuilder.buildSequence(branch);
    const tokens = this.tokenizer.tokenize(sequence);
    return tokens;
  }

  decodeSequence(tokens) {
    const sequence = this.tokenizer.detokenize(tokens);
    const mesh = this.sequenceBuilder.buildMesh(sequence);
    return mesh;
  }
}

class MeshTokenization {
  constructor() {
    this.vocabulary = this.buildVocabulary();
    this.tokenMap = new Map();
    this.reverseTokenMap = new Map();
    
    // Build token mappings
    for (let i = 0; i < this.vocabulary.length; i++) {
      this.tokenMap.set(this.vocabulary[i], i);
      this.reverseTokenMap.set(i, this.vocabulary[i]);
    }
  }

  buildVocabulary() {
    const vocab = [];
    
    // Special tokens
    vocab.push('<START>', '<END>', '<PAD>', '<UNK>');
    
    // Branch types
    vocab.push('TRUNK', 'BRANCH', 'LEAF', 'ROOT');
    
    // Geometric primitives
    vocab.push('CYLINDER', 'SPHERE', 'CONE', 'CUBE');
    
    // Properties
    for (let i = 0; i <= 100; i++) {
      vocab.push(`RADIUS_${i}`, `LENGTH_${i}`, `ANGLE_${i}`);
    }
    
    // Directions
    vocab.push('UP', 'DOWN', 'LEFT', 'RIGHT', 'FORWARD', 'BACK');
    
    // Materials
    vocab.push('WOOD', 'BARK', 'LEAF_MATERIAL', 'ROOT_MATERIAL');
    
    // Operations
    vocab.push('SPLIT', 'MERGE', 'BEND', 'TAPER', 'TEXTURE');
    
    return vocab;
  }

  tokenize(sequence) {
    const tokens = [];
    
    for (const item of sequence) {
      if (typeof item === 'string') {
        const token = this.tokenMap.get(item);
        tokens.push(token !== undefined ? token : this.tokenMap.get('<UNK>'));
      } else if (typeof item === 'number') {
        // Quantize continuous values
        const quantized = Math.round(item * 10);
        const tokenName = `VALUE_${Math.max(0, Math.min(100, quantized + 50))}`;
        const token = this.tokenMap.get(tokenName);
        tokens.push(token !== undefined ? token : this.tokenMap.get('<UNK>'));
      }
    }
    
    return tokens;
  }

  detokenize(tokens) {
    const sequence = [];
    
    for (const token of tokens) {
      const item = this.reverseTokenMap.get(token);
      if (item && item !== '<PAD>' && item !== '<UNK>') {
        if (item.startsWith('VALUE_')) {
          const value = (parseInt(item.split('_')[1]) - 50) / 10;
          sequence.push(value);
        } else {
          sequence.push(item);
        }
      }
    }
    
    return sequence;
  }
}

class TreeSequenceBuilder {
  constructor() {
    this.sequence = [];
  }

  buildSequence(branch) {
    this.sequence = [];
    this.sequence.push('<START>');
    this.processBranch(branch);
    this.sequence.push('<END>');
    return this.sequence;
  }

  processBranch(branch) {
    // Add branch type
    this.sequence.push(branch.type || 'BRANCH');
    
    // Add geometric properties
    this.sequence.push('CYLINDER');
    this.sequence.push(branch.radius || 1.0);
    this.sequence.push(branch.length || 10.0);
    
    // Add position and direction
    if (branch.position) {
      this.sequence.push(branch.position.x, branch.position.y, branch.position.z);
    }
    
    if (branch.direction) {
      this.sequence.push(branch.direction.x, branch.direction.y, branch.direction.z);
    }
    
    // Add material
    this.sequence.push(branch.material || 'WOOD');
    
    // Process children
    if (branch.children && branch.children.length > 0) {
      this.sequence.push('SPLIT');
      this.sequence.push(branch.children.length);
      
      for (const child of branch.children) {
        this.processBranch(child);
      }
    }
  }

  buildMesh(sequence) {
    const meshBuilder = new MeshBuilder();
    let index = 0;
    
    while (index < sequence.length) {
      const token = sequence[index];
      
      if (token === '<START>') {
        index++;
      } else if (token === '<END>') {
        break;
      } else if (token === 'TRUNK' || token === 'BRANCH' || token === 'LEAF' || token === 'ROOT') {
        const mesh = this.buildBranchMesh(sequence, index);
        meshBuilder.addMesh(mesh);
        index = mesh.nextIndex;
      } else {
        index++;
      }
    }
    
    return meshBuilder.build();
  }

  buildBranchMesh(sequence, startIndex) {
    let index = startIndex;
    const branchType = sequence[index++];
    
    // Parse geometric properties
    const primitive = sequence[index++];
    const radius = sequence[index++];
    const length = sequence[index++];
    
    // Parse position and direction
    const position = new THREE.Vector3(
      sequence[index++], sequence[index++], sequence[index++]
    );
    const direction = new THREE.Vector3(
      sequence[index++], sequence[index++], sequence[index++]
    );
    
    // Parse material
    const material = sequence[index++];
    
    // Create geometry
    let geometry;
    if (primitive === 'CYLINDER') {
      geometry = new THREE.CylinderGeometry(radius, radius * 0.8, length, 8);
    } else if (primitive === 'SPHERE') {
      geometry = new THREE.SphereGeometry(radius, 8, 6);
    } else {
      geometry = new THREE.CylinderGeometry(radius, radius * 0.8, length, 8);
    }
    
    // Create material
    const threeMaterial = this.createMaterial(material);
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, threeMaterial);
    mesh.position.copy(position);
    
    // Orient mesh
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(up, direction);
    mesh.quaternion.copy(quaternion);
    
    return { mesh, nextIndex: index };
  }

  createMaterial(materialType) {
    switch (materialType) {
      case 'WOOD':
        return new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      case 'BARK':
        return new THREE.MeshLambertMaterial({ color: 0xA0522D });
      case 'LEAF_MATERIAL':
        return new THREE.MeshLambertMaterial({ color: 0x228B22 });
      case 'ROOT_MATERIAL':
        return new THREE.MeshLambertMaterial({ color: 0x654321 });
      default:
        return new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    }
  }
}

class MeshBuilder {
  constructor() {
    this.meshes = [];
  }

  addMesh(meshData) {
    this.meshes.push(meshData.mesh);
  }

  build() {
    const group = new THREE.Group();
    this.meshes.forEach(mesh => group.add(mesh));
    return group;
  }
}

// ============================================================================
// 3. AUTOREGRESSIVE MESH GENERATOR MAIN CLASS
// ============================================================================

export class AutoregressiveMeshGenerator {
  constructor(config = {}) {
    this.transformer = new AutoregressiveTransformer(config);
    this.encoder = new TreeSequenceEncoder(config.vocabSize || 1000);
    this.trainingData = [];
    this.isTrained = false;
  }

  train(trainingData, epochs = 100, learningRate = 0.001) {
    console.log('Training autoregressive mesh generator...');
    
    // Prepare training data
    const sequences = trainingData.map(tree => this.encoder.encodeTree(tree));
    
    // Training loop (simplified)
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;
      
      for (const sequence of sequences) {
        // Create training pairs
        const input = sequence.slice(0, -1);
        const target = sequence.slice(1);
        
        // Forward pass
        const output = this.transformer.forward(input);
        
        // Calculate loss (simplified)
        const loss = this.calculateLoss(output, target);
        totalLoss += loss;
        
        // Backward pass (simplified - in real implementation, would use gradients)
        this.updateWeights(loss, learningRate);
      }
      
      if (epoch % 10 === 0) {
        console.log(`Epoch ${epoch}, Average Loss: ${totalLoss / sequences.length}`);
      }
    }
    
    this.isTrained = true;
    console.log('Training completed!');
  }

  calculateLoss(output, target) {
    // Simplified cross-entropy loss
    let loss = 0;
    
    for (let i = 0; i < output.length && i < target.length; i++) {
      const predicted = output[i];
      const actual = target[i];
      
      // Find predicted token
      const predictedToken = predicted.indexOf(Math.max(...predicted));
      
      // Calculate loss
      if (predictedToken !== actual) {
        loss += 1;
      }
    }
    
    return loss / Math.max(output.length, target.length);
  }

  updateWeights(loss, learningRate) {
    // Simplified weight update (in real implementation, would use gradients)
    // This is a placeholder for actual backpropagation
    console.log(`Updating weights with loss: ${loss}, learning rate: ${learningRate}`);
  }

  generateMesh(initialSequence = [], maxLength = 100, temperature = 1.0) {
    if (!this.isTrained) {
      console.warn('Model not trained. Using random generation.');
      return this.generateRandomMesh();
    }
    
    // Generate sequence
    const generatedTokens = this.transformer.generate(
      initialSequence, 
      maxLength, 
      temperature
    );
    
    // Decode to mesh
    const mesh = this.encoder.decodeSequence(generatedTokens);
    
    return mesh;
  }

  generateRandomMesh() {
    // Fallback random mesh generation
    const geometry = new THREE.CylinderGeometry(1, 0.8, 10, 8);
    const material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const mesh = new THREE.Mesh(geometry, material);
    
    const group = new THREE.Group();
    group.add(mesh);
    
    return group;
  }

  generateConditionalMesh(conditions) {
    // Generate mesh based on specific conditions
    const initialSequence = this.buildConditionalSequence(conditions);
    return this.generateMesh(initialSequence);
  }

  buildConditionalSequence(conditions) {
    const sequence = ['<START>'];
    
    if (conditions.type) {
      sequence.push(conditions.type.toUpperCase());
    }
    
    if (conditions.radius !== undefined) {
      sequence.push(conditions.radius);
    }
    
    if (conditions.length !== undefined) {
      sequence.push(conditions.length);
    }
    
    if (conditions.material) {
      sequence.push(conditions.material.toUpperCase());
    }
    
    return sequence;
  }

  saveModel(filename) {
    const modelData = {
      config: this.transformer.config,
      weights: this.extractWeights(),
      vocabulary: this.encoder.tokenizer.vocabulary
    };
    
    const blob = new Blob([JSON.stringify(modelData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'autoregressive_mesh_model.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  loadModel(modelData) {
    try {
      const data = typeof modelData === 'string' ? JSON.parse(modelData) : modelData;
      
      // Reconstruct transformer
      this.transformer = new AutoregressiveTransformer(data.config);
      this.loadWeights(data.weights);
      
      // Reconstruct encoder
      this.encoder = new TreeSequenceEncoder(data.vocabulary.length);
      this.encoder.tokenizer.vocabulary = data.vocabulary;
      
      this.isTrained = true;
      console.log('Model loaded successfully!');
      
    } catch (error) {
      console.error('Error loading model:', error);
    }
  }

  extractWeights() {
    // Extract weights from transformer (simplified)
    return {
      embedding: this.transformer.embedding.embeddingMatrix,
      layers: this.transformer.layers.map(layer => ({
        attention: {
          wq: layer.selfAttention.wq.weights,
          wk: layer.selfAttention.wk.weights,
          wv: layer.selfAttention.wv.weights,
          wo: layer.selfAttention.wo.weights
        },
        feedForward: {
          linear1: layer.feedForward.linear1.weights,
          linear2: layer.feedForward.linear2.weights
        }
      })),
      output: this.transformer.outputProjection.weights
    };
  }

  loadWeights(weights) {
    // Load weights into transformer (simplified)
    if (weights.embedding) {
      this.transformer.embedding.embeddingMatrix = weights.embedding;
    }
    
    if (weights.layers) {
      weights.layers.forEach((layerWeights, i) => {
        const layer = this.transformer.layers[i];
        if (layer && layerWeights.attention) {
          layer.selfAttention.wq.weights = layerWeights.attention.wq;
          layer.selfAttention.wk.weights = layerWeights.attention.wk;
          layer.selfAttention.wv.weights = layerWeights.attention.wv;
          layer.selfAttention.wo.weights = layerWeights.attention.wo;
        }
        if (layer && layerWeights.feedForward) {
          layer.feedForward.linear1.weights = layerWeights.feedForward.linear1;
          layer.feedForward.linear2.weights = layerWeights.feedForward.linear2;
        }
      });
    }
    
    if (weights.output) {
      this.transformer.outputProjection.weights = weights.output;
    }
  }
}

// Export individual classes for specific use cases
export {
  AutoregressiveTransformer,
  TreeSequenceEncoder,
  MeshTokenization,
  TreeSequenceBuilder
}; 