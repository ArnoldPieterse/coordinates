/**
 * Payment Processor
 * Handles earnings, withdrawals, and payment processing for GPU providers
 */

import { EventEmitter } from 'events';

export class PaymentProcessor extends EventEmitter {
  constructor() {
    super();
    this.balances = new Map();
    this.transactions = new Map();
    this.paymentMethods = new Map();
    this.nextTransactionId = 1;
    
    // Payment processing settings
    this.settings = {
      minimumWithdrawal: 10.00, // $10 minimum
      processingFee: 0.029, // 2.9% processing fee
      processingFeeFixed: 0.30, // $0.30 fixed fee
      autoPayoutThreshold: 50.00, // Auto-payout at $50
      payoutSchedule: 'weekly' // weekly, bi-weekly, monthly
    };
    
    // Supported payment methods
    this.supportedMethods = {
      paypal: { fee: 0.029, fixedFee: 0.30, minAmount: 1.00 },
      stripe: { fee: 0.029, fixedFee: 0.30, minAmount: 0.50 },
      bank_transfer: { fee: 0.01, fixedFee: 0.00, minAmount: 10.00 },
      crypto: { fee: 0.02, fixedFee: 0.00, minAmount: 5.00 }
    };
  }

  async addEarnings(providerId, amount, source = 'inference') {
    if (amount <= 0) return;
    
    const currentBalance = this.balances.get(providerId) || 0;
    const newBalance = currentBalance + amount;
    
    this.balances.set(providerId, newBalance);
    
    // Record transaction
    const transactionId = `tx_${this.nextTransactionId++}`;
    const transaction = {
      id: transactionId,
      providerId,
      type: 'credit',
      amount,
      source,
      timestamp: new Date(),
      balance: newBalance,
      status: 'completed'
    };
    
    this.transactions.set(transactionId, transaction);
    
    console.log(`💰 Added $${amount.toFixed(4)} to provider ${providerId} (balance: $${newBalance.toFixed(2)})`);
    
    // Check for auto-payout
    if (newBalance >= this.settings.autoPayoutThreshold) {
      await this.processAutoPayout(providerId);
    }
    
    this.emit('balance:updated', { providerId, balance: newBalance, change: amount });
    return transactionId;
  }

  async processWithdrawal(providerId, amount, paymentMethod) {
    const currentBalance = this.balances.get(providerId) || 0;
    
    if (amount > currentBalance) {
      throw new Error('Insufficient balance');
    }
    
    if (amount < this.settings.minimumWithdrawal) {
      throw new Error(`Minimum withdrawal amount is $${this.settings.minimumWithdrawal}`);
    }
    
    const methodConfig = this.supportedMethods[paymentMethod];
    if (!methodConfig) {
      throw new Error('Unsupported payment method');
    }
    
    if (amount < methodConfig.minAmount) {
      throw new Error(`Minimum amount for ${paymentMethod} is $${methodConfig.minAmount}`);
    }
    
    // Calculate fees
    const processingFee = (amount * methodConfig.fee) + methodConfig.fixedFee;
    const netAmount = amount - processingFee;
    
    // Process payment
    const transactionId = `tx_${this.nextTransactionId++}`;
    const transaction = {
      id: transactionId,
      providerId,
      type: 'debit',
      amount: -amount,
      netAmount,
      processingFee,
      paymentMethod,
      timestamp: new Date(),
      status: 'processing'
    };
    
    try {
      // Simulate payment processing
      await this.simulatePaymentProcessing(transaction);
      
      // Update balance
      const newBalance = currentBalance - amount;
      this.balances.set(providerId, newBalance);
      
      // Update transaction status
      transaction.status = 'completed';
      transaction.balance = newBalance;
      this.transactions.set(transactionId, transaction);
      
      console.log(`💳 Processed withdrawal: $${amount.toFixed(2)} for provider ${providerId}`);
      console.log(`   Net amount: $${netAmount.toFixed(2)} (fees: $${processingFee.toFixed(2)})`);
      
      this.emit('payment:processed', transaction);
      this.emit('balance:updated', { providerId, balance: newBalance, change: -amount });
      
      return transaction;
      
    } catch (error) {
      transaction.status = 'failed';
      transaction.error = error.message;
      this.transactions.set(transactionId, transaction);
      
      throw error;
    }
  }

  async processAutoPayout(providerId) {
    const balance = this.balances.get(providerId) || 0;
    const paymentMethod = this.paymentMethods.get(providerId);
    
    if (!paymentMethod || balance < this.settings.autoPayoutThreshold) {
      return;
    }
    
    console.log(`🔄 Processing auto-payout for provider ${providerId}: $${balance.toFixed(2)}`);
    
    try {
      await this.processWithdrawal(providerId, balance, paymentMethod.method);
    } catch (error) {
      console.error(`Auto-payout failed for provider ${providerId}:`, error.message);
    }
  }

  async simulatePaymentProcessing(transaction) {
    // Simulate processing delay
    const processingTime = 1000 + Math.random() * 2000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Simulate occasional failures
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error('Payment processing failed - please try again');
    }
  }

  getBalance(providerId) {
    return {
      balance: this.balances.get(providerId) || 0,
      pending: this.getPendingAmount(providerId),
      totalEarned: this.getTotalEarned(providerId),
      lastPayout: this.getLastPayout(providerId)
    };
  }

  getPendingAmount(providerId) {
    const pendingTransactions = Array.from(this.transactions.values())
      .filter(tx => tx.providerId === providerId && tx.status === 'processing');
    
    return pendingTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  }

  getTotalEarned(providerId) {
    const creditTransactions = Array.from(this.transactions.values())
      .filter(tx => tx.providerId === providerId && tx.type === 'credit' && tx.status === 'completed');
    
    return creditTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  }

  getLastPayout(providerId) {
    const payoutTransactions = Array.from(this.transactions.values())
      .filter(tx => tx.providerId === providerId && tx.type === 'debit' && tx.status === 'completed')
      .sort((a, b) => b.timestamp - a.timestamp);
    
    return payoutTransactions[0] || null;
  }

  getTransactionHistory(providerId, limit = 50) {
    const transactions = Array.from(this.transactions.values())
      .filter(tx => tx.providerId === providerId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
    
    return transactions;
  }

  setPaymentMethod(providerId, method, details) {
    this.paymentMethods.set(providerId, {
      method,
      details,
      updatedAt: new Date()
    });
    
    console.log(`💳 Payment method set for provider ${providerId}: ${method}`);
  }

  getPaymentMethod(providerId) {
    return this.paymentMethods.get(providerId);
  }

  getSupportedPaymentMethods() {
    return Object.keys(this.supportedMethods).map(method => ({
      method,
      ...this.supportedMethods[method]
    }));
  }

  calculateFees(amount, paymentMethod) {
    const methodConfig = this.supportedMethods[paymentMethod];
    if (!methodConfig) return null;
    
    const processingFee = (amount * methodConfig.fee) + methodConfig.fixedFee;
    const netAmount = amount - processingFee;
    
    return {
      amount,
      processingFee,
      netAmount,
      feePercentage: methodConfig.fee * 100,
      fixedFee: methodConfig.fixedFee
    };
  }

  getSystemStats() {
    const totalBalance = Array.from(this.balances.values()).reduce((sum, balance) => sum + balance, 0);
    const totalTransactions = this.transactions.size;
    const totalProviders = this.balances.size;
    
    const recentTransactions = Array.from(this.transactions.values())
      .filter(tx => tx.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
      .length;
    
    return {
      totalBalance,
      totalTransactions,
      totalProviders,
      recentTransactions,
      settings: this.settings
    };
  }

  getRevenueAnalytics() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    const todayTransactions = Array.from(this.transactions.values())
      .filter(tx => tx.timestamp.toDateString() === today && tx.type === 'credit');
    
    const yesterdayTransactions = Array.from(this.transactions.values())
      .filter(tx => tx.timestamp.toDateString() === yesterday && tx.type === 'credit');
    
    const todayRevenue = todayTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const yesterdayRevenue = yesterdayTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    return {
      today: todayRevenue,
      yesterday: yesterdayRevenue,
      total: Array.from(this.transactions.values())
        .filter(tx => tx.type === 'credit')
        .reduce((sum, tx) => sum + tx.amount, 0),
      topProviders: this.getTopProviders()
    };
  }

  getTopProviders() {
    const providerEarnings = new Map();
    
    for (const [providerId, balance] of this.balances) {
      const totalEarned = this.getTotalEarned(providerId);
      providerEarnings.set(providerId, totalEarned);
    }
    
    return Array.from(providerEarnings.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([providerId, earnings]) => ({
        providerId,
        earnings,
        balance: this.balances.get(providerId) || 0
      }));
  }

  updateSettings(newSettings) {
    this.settings = {
      ...this.settings,
      ...newSettings
    };
    
    console.log('⚙️ Payment processor settings updated');
  }

  getSettings() {
    return this.settings;
  }
} 