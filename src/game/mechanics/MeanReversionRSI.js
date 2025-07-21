/**
 * Mean Reversion RSI Strategy Implementation
 * Based on https://jesse.trade/strategies/meanreversionrsi
 * RSI-based mean reversion trading strategy for game mechanics
 */

export class MeanReversionRSI {
  constructor(config = {}) {
    this.config = {
      rsiPeriod: config.rsiPeriod || 14,
      rsiOverbought: config.rsiOverbought || 70,
      rsiOversold: config.rsiOversold || 30,
      smaPeriod: config.smaPeriod || 20,
      bollingerPeriod: config.bollingerPeriod || 20,
      bollingerStdDev: config.bollingerStdDev || 2,
      riskRewardRatio: config.riskRewardRatio || 2,
      ...config
    };

    this.prices = [];
    this.rsiValues = [];
    this.smaValues = [];
    this.bollingerValues = [];
    this.signals = [];
    this.positions = [];
  }

  // Calculate RSI (Relative Strength Index)
  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) {
      return null;
    }

    let gains = 0;
    let losses = 0;

    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calculate RSI for remaining periods
    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      let currentGain = 0;
      let currentLoss = 0;

      if (change > 0) {
        currentGain = change;
      } else {
        currentLoss = Math.abs(change);
      }

      avgGain = (avgGain * (period - 1) + currentGain) / period;
      avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
    }

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    return rsi;
  }

  // Calculate Simple Moving Average
  calculateSMA(prices, period) {
    if (prices.length < period) {
      return null;
    }

    const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
    return sum / period;
  }

  // Calculate Bollinger Bands
  calculateBollingerBands(prices, period, stdDev) {
    if (prices.length < period) {
      return null;
    }

    const sma = this.calculateSMA(prices, period);
    const slice = prices.slice(-period);
    
    const variance = slice.reduce((acc, price) => {
      return acc + Math.pow(price - sma, 2);
    }, 0) / period;
    
    const standardDeviation = Math.sqrt(variance);
    
    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev)
    };
  }

  // Add new price data
  addPrice(price) {
    this.prices.push(price);
    
    // Calculate indicators
    const rsi = this.calculateRSI(this.prices, this.config.rsiPeriod);
    const sma = this.calculateSMA(this.prices, this.config.smaPeriod);
    const bollinger = this.calculateBollingerBands(
      this.prices, 
      this.config.bollingerPeriod, 
      this.config.bollingerStdDev
    );

    if (rsi !== null) this.rsiValues.push(rsi);
    if (sma !== null) this.smaValues.push(sma);
    if (bollinger !== null) this.bollingerValues.push(bollinger);

    // Generate signals
    const signal = this.generateSignal(price, rsi, sma, bollinger);
    if (signal) {
      this.signals.push(signal);
    }

    return {
      price,
      rsi,
      sma,
      bollinger,
      signal
    };
  }

  // Generate trading signals based on mean reversion strategy
  generateSignal(price, rsi, sma, bollinger) {
    if (!rsi || !sma || !bollinger) {
      return null;
    }

    const signal = {
      timestamp: Date.now(),
      price,
      rsi,
      sma,
      bollinger,
      action: null,
      confidence: 0,
      reasoning: []
    };

    // Entry conditions for long position (oversold)
    const rsiOversold = rsi < this.config.rsiOversold;
    const priceBelowSMA = price < sma;
    const priceNearBollingerLower = price <= bollinger.lower * 1.02; // Within 2% of lower band

    // Entry conditions for short position (overbought)
    const rsiOverbought = rsi > this.config.rsiOverbought;
    const priceAboveSMA = price > sma;
    const priceNearBollingerUpper = price >= bollinger.upper * 0.98; // Within 2% of upper band

    // Long entry signal
    if (rsiOversold && priceBelowSMA && priceNearBollingerLower) {
      signal.action = 'BUY';
      signal.confidence = this.calculateConfidence(rsi, price, sma, bollinger, 'long');
      signal.reasoning = [
        `RSI oversold (${rsi.toFixed(2)} < ${this.config.rsiOversold})`,
        `Price below SMA (${price.toFixed(2)} < ${sma.toFixed(2)})`,
        `Price near lower Bollinger Band (${price.toFixed(2)} ≈ ${bollinger.lower.toFixed(2)})`
      ];
    }
    // Short entry signal
    else if (rsiOverbought && priceAboveSMA && priceNearBollingerUpper) {
      signal.action = 'SELL';
      signal.confidence = this.calculateConfidence(rsi, price, sma, bollinger, 'short');
      signal.reasoning = [
        `RSI overbought (${rsi.toFixed(2)} > ${this.config.rsiOverbought})`,
        `Price above SMA (${price.toFixed(2)} > ${sma.toFixed(2)})`,
        `Price near upper Bollinger Band (${price.toFixed(2)} ≈ ${bollinger.upper.toFixed(2)})`
      ];
    }

    return signal.action ? signal : null;
  }

  // Calculate signal confidence
  calculateConfidence(rsi, price, sma, bollinger, direction) {
    let confidence = 0;

    if (direction === 'long') {
      // RSI confidence (lower RSI = higher confidence)
      const rsiConfidence = Math.max(0, (this.config.rsiOversold - rsi) / this.config.rsiOversold);
      
      // SMA confidence (further below SMA = higher confidence)
      const smaConfidence = Math.max(0, (sma - price) / sma);
      
      // Bollinger confidence (closer to lower band = higher confidence)
      const bollingerConfidence = Math.max(0, (bollinger.lower - price) / bollinger.lower);
      
      confidence = (rsiConfidence + smaConfidence + bollingerConfidence) / 3;
    } else {
      // RSI confidence (higher RSI = higher confidence)
      const rsiConfidence = Math.max(0, (rsi - this.config.rsiOverbought) / (100 - this.config.rsiOverbought));
      
      // SMA confidence (further above SMA = higher confidence)
      const smaConfidence = Math.max(0, (price - sma) / sma);
      
      // Bollinger confidence (closer to upper band = higher confidence)
      const bollingerConfidence = Math.max(0, (price - bollinger.upper) / bollinger.upper);
      
      confidence = (rsiConfidence + smaConfidence + bollingerConfidence) / 3;
    }

    return Math.min(1, Math.max(0, confidence));
  }

  // Execute trade based on signal
  executeTrade(signal, positionSize = 1) {
    if (!signal || !signal.action) {
      return null;
    }

    const trade = {
      id: 'trade-' + Date.now(),
      timestamp: signal.timestamp,
      action: signal.action,
      price: signal.price,
      size: positionSize,
      confidence: signal.confidence,
      reasoning: signal.reasoning,
      status: 'open',
      entryPrice: signal.price,
      stopLoss: null,
      takeProfit: null
    };

    // Calculate stop loss and take profit based on risk-reward ratio
    if (signal.action === 'BUY') {
      const risk = signal.price - signal.bollinger.lower;
      trade.stopLoss = signal.price - risk;
      trade.takeProfit = signal.price + (risk * this.config.riskRewardRatio);
    } else {
      const risk = signal.bollinger.upper - signal.price;
      trade.stopLoss = signal.price + risk;
      trade.takeProfit = signal.price - (risk * this.config.riskRewardRatio);
    }

    this.positions.push(trade);
    return trade;
  }

  // Check for exit signals
  checkExitSignals(currentPrice) {
    const exits = [];

    for (const position of this.positions) {
      if (position.status !== 'open') continue;

      let shouldExit = false;
      let exitReason = '';

      // Check stop loss
      if (position.action === 'BUY' && currentPrice <= position.stopLoss) {
        shouldExit = true;
        exitReason = 'Stop Loss';
      } else if (position.action === 'SELL' && currentPrice >= position.stopLoss) {
        shouldExit = true;
        exitReason = 'Stop Loss';
      }

      // Check take profit
      if (position.action === 'BUY' && currentPrice >= position.takeProfit) {
        shouldExit = true;
        exitReason = 'Take Profit';
      } else if (position.action === 'SELL' && currentPrice <= position.takeProfit) {
        shouldExit = true;
        exitReason = 'Take Profit';
      }

      // Check RSI exit conditions
      const currentRSI = this.rsiValues[this.rsiValues.length - 1];
      if (currentRSI) {
        if (position.action === 'BUY' && currentRSI > this.config.rsiOverbought) {
          shouldExit = true;
          exitReason = 'RSI Overbought';
        } else if (position.action === 'SELL' && currentRSI < this.config.rsiOversold) {
          shouldExit = true;
          exitReason = 'RSI Oversold';
        }
      }

      if (shouldExit) {
        position.status = 'closed';
        position.exitPrice = currentPrice;
        position.exitReason = exitReason;
        position.exitTimestamp = Date.now();
        position.pnl = position.action === 'BUY' 
          ? (currentPrice - position.entryPrice) * position.size
          : (position.entryPrice - currentPrice) * position.size;

        exits.push(position);
      }
    }

    return exits;
  }

  // Get strategy statistics
  getStats() {
    const closedPositions = this.positions.filter(p => p.status === 'closed');
    const openPositions = this.positions.filter(p => p.status === 'open');

    const totalTrades = closedPositions.length;
    const winningTrades = closedPositions.filter(p => p.pnl > 0).length;
    const losingTrades = closedPositions.filter(p => p.pnl < 0).length;

    const totalPnL = closedPositions.reduce((sum, p) => sum + p.pnl, 0);
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate: winRate.toFixed(2) + '%',
      totalPnL: totalPnL.toFixed(2),
      openPositions: openPositions.length,
      averageConfidence: this.signals.length > 0 
        ? (this.signals.reduce((sum, s) => sum + s.confidence, 0) / this.signals.length).toFixed(3)
        : 0
    };
  }

  // Get current market state
  getMarketState() {
    const currentPrice = this.prices[this.prices.length - 1];
    const currentRSI = this.rsiValues[this.rsiValues.length - 1];
    const currentSMA = this.smaValues[this.smaValues.length - 1];
    const currentBollinger = this.bollingerValues[this.bollingerValues.length - 1];

    return {
      price: currentPrice,
      rsi: currentRSI,
      sma: currentSMA,
      bollinger: currentBollinger,
      trend: currentPrice > currentSMA ? 'bullish' : 'bearish',
      volatility: currentBollinger ? 
        ((currentBollinger.upper - currentBollinger.lower) / currentBollinger.middle * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }
}

export default MeanReversionRSI; 