/**
 * Financial System - Core Engine
 * Integration of Maybe Finance capabilities into Coordinates project
 * Converts Rails models to JavaScript classes with real-time synchronization
 */

import { EventEmitter } from 'events';

class FinancialSystem extends EventEmitter {
    constructor(gameEngine) {
        super();
        this.gameEngine = gameEngine;
        this.accounts = new Map();
        this.transactions = new Map();
        this.budgets = new Map();
        this.categories = new Map();
        this.families = new Map();
        this.users = new Map();
        
        // Financial state
        this.totalAssets = 0;
        this.totalLiabilities = 0;
        this.netWorth = 0;
        this.currency = 'USD';
        
        // Real-time synchronization
        this.syncInterval = null;
        this.lastSyncTime = Date.now();
        
        this.initialize();
    }

    /**
     * Initialize the financial system
     */
    initialize() {
        console.log('💰 Financial System: Initializing...');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start real-time synchronization
        this.startSync();
        
        // Initialize with game economy
        this.initializeGameEconomy();
        
        console.log('💰 Financial System: Initialized successfully');
        this.emit('initialized');
    }

    /**
     * Set up event listeners for game integration
     */
    setupEventListeners() {
        // Listen for game events
        this.gameEngine.on('player:join', (player) => {
            this.createPlayerAccount(player);
        });

        this.gameEngine.on('player:earn', (data) => {
            this.processGameEarning(data);
        });

        this.gameEngine.on('player:spend', (data) => {
            this.processGameSpending(data);
        });

        // Listen for financial events
        this.on('account:created', (account) => {
            this.updateNetWorth();
            this.emit('game:financial-update', { type: 'account-created', account });
        });

        this.on('transaction:processed', (transaction) => {
            this.updateNetWorth();
            this.emit('game:financial-update', { type: 'transaction-processed', transaction });
        });
    }

    /**
     * Initialize game economy integration
     */
    initializeGameEconomy() {
        // Create virtual currency system
        this.gameCurrency = {
            name: 'Game Credits',
            symbol: 'GC',
            exchangeRate: 1.0, // 1 GC = 1 USD
            inflationRate: 0.02 // 2% monthly inflation
        };

        // Set up economic simulation
        this.economicSimulation = {
            marketVolatility: 0.05,
            interestRate: 0.03,
            taxRate: 0.15,
            transactionFee: 0.01
        };
    }

    /**
     * Create a new account
     * @param {Object} accountData - Account creation data
     * @returns {Account} Created account
     */
    createAccount(accountData) {
        const account = new Account(accountData);
        this.accounts.set(account.id, account);
        
        // Update family accounts
        if (account.familyId) {
            const family = this.families.get(account.familyId);
            if (family) {
                family.addAccount(account);
            }
        }

        this.emit('account:created', account);
        return account;
    }

    /**
     * Process a financial transaction
     * @param {Object} transactionData - Transaction data
     * @returns {Transaction} Processed transaction
     */
    processTransaction(transactionData) {
        const transaction = new Transaction(transactionData);
        
        // Validate transaction
        if (!this.validateTransaction(transaction)) {
            throw new Error('Invalid transaction');
        }

        // Process the transaction
        const account = this.accounts.get(transaction.accountId);
        if (!account) {
            throw new Error('Account not found');
        }

        // Update account balance
        account.updateBalance(transaction.amount, transaction.type);
        
        // Apply transaction fees
        const fee = this.calculateTransactionFee(transaction);
        if (fee > 0) {
            transaction.addFee(fee);
        }

        // Store transaction
        this.transactions.set(transaction.id, transaction);
        
        // Update budget if applicable
        this.updateBudget(transaction);
        
        // Emit events
        this.emit('transaction:processed', transaction);
        
        return transaction;
    }

    /**
     * Create a budget for a family
     * @param {Object} budgetData - Budget data
     * @returns {Budget} Created budget
     */
    createBudget(budgetData) {
        const budget = new Budget(budgetData);
        this.budgets.set(budget.id, budget);
        
        // Initialize budget categories
        budget.initializeCategories();
        
        this.emit('budget:created', budget);
        return budget;
    }

    /**
     * Update budget based on transaction
     * @param {Transaction} transaction - Transaction to apply to budget
     */
    updateBudget(transaction) {
        if (!transaction.categoryId) return;

        const budget = this.getCurrentBudget(transaction.familyId);
        if (!budget) return;

        const budgetCategory = budget.getCategory(transaction.categoryId);
        if (budgetCategory) {
            budgetCategory.addTransaction(transaction);
            this.emit('budget:updated', budget);
        }
    }

    /**
     * Get current budget for a family
     * @param {string} familyId - Family ID
     * @returns {Budget|null} Current budget
     */
    getCurrentBudget(familyId) {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        return Array.from(this.budgets.values()).find(budget => 
            budget.familyId === familyId && 
            budget.period === currentMonth
        );
    }

    /**
     * Create player account for game integration
     * @param {Object} player - Player data
     */
    createPlayerAccount(player) {
        const accountData = {
            id: `player-${player.id}`,
            name: `${player.name}'s Game Account`,
            type: 'game',
            balance: 1000, // Starting balance
            currency: 'GC',
            familyId: `family-${player.id}`,
            status: 'active'
        };

        const account = this.createAccount(accountData);
        
        // Create family for player
        const family = new Family({
            id: `family-${player.id}`,
            name: `${player.name}'s Family`,
            currency: 'GC',
            ownerId: player.id
        });
        
        this.families.set(family.id, family);
        
        console.log(`💰 Created game account for player: ${player.name}`);
    }

    /**
     * Process game earning
     * @param {Object} data - Earning data
     */
    processGameEarning(data) {
        const transactionData = {
            id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            accountId: `player-${data.playerId}`,
            amount: data.amount,
            type: 'income',
            category: 'game-earnings',
            description: data.description || 'Game earnings',
            date: new Date(),
            familyId: `family-${data.playerId}`
        };

        this.processTransaction(transactionData);
    }

    /**
     * Process game spending
     * @param {Object} data - Spending data
     */
    processGameSpending(data) {
        const transactionData = {
            id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            accountId: `player-${data.playerId}`,
            amount: -Math.abs(data.amount), // Negative for spending
            type: 'expense',
            category: 'game-purchases',
            description: data.description || 'Game purchase',
            date: new Date(),
            familyId: `family-${data.playerId}`
        };

        this.processTransaction(transactionData);
    }

    /**
     * Validate transaction
     * @param {Transaction} transaction - Transaction to validate
     * @returns {boolean} Validation result
     */
    validateTransaction(transaction) {
        // Basic validation
        if (!transaction.accountId || !transaction.amount) {
            return false;
        }

        // Check account exists
        const account = this.accounts.get(transaction.accountId);
        if (!account) {
            return false;
        }

        // Check sufficient funds for expenses
        if (transaction.amount < 0 && account.balance + transaction.amount < 0) {
            return false;
        }

        return true;
    }

    /**
     * Calculate transaction fee
     * @param {Transaction} transaction - Transaction
     * @returns {number} Transaction fee
     */
    calculateTransactionFee(transaction) {
        return Math.abs(transaction.amount) * this.economicSimulation.transactionFee;
    }

    /**
     * Update net worth calculation
     */
    updateNetWorth() {
        this.totalAssets = 0;
        this.totalLiabilities = 0;

        for (const account of this.accounts.values()) {
            if (account.classification === 'asset') {
                this.totalAssets += account.balance;
            } else if (account.classification === 'liability') {
                this.totalLiabilities += Math.abs(account.balance);
            }
        }

        this.netWorth = this.totalAssets - this.totalLiabilities;
        this.emit('net-worth:updated', { netWorth: this.netWorth, assets: this.totalAssets, liabilities: this.totalLiabilities });
    }

    /**
     * Start real-time synchronization
     */
    startSync() {
        this.syncInterval = setInterval(() => {
            this.performSync();
        }, 5000); // Sync every 5 seconds
    }

    /**
     * Perform synchronization
     */
    performSync() {
        const now = Date.now();
        const changes = {
            accounts: [],
            transactions: [],
            budgets: [],
            timestamp: now
        };

        // Collect changes since last sync
        for (const account of this.accounts.values()) {
            if (account.updatedAt > this.lastSyncTime) {
                changes.accounts.push(account.toJSON());
            }
        }

        for (const transaction of this.transactions.values()) {
            if (transaction.createdAt > this.lastSyncTime) {
                changes.transactions.push(transaction.toJSON());
            }
        }

        // Emit sync event
        if (changes.accounts.length > 0 || changes.transactions.length > 0) {
            this.emit('sync:changes', changes);
        }

        this.lastSyncTime = now;
    }

    /**
     * Get financial summary
     * @returns {Object} Financial summary
     */
    getFinancialSummary() {
        return {
            netWorth: this.netWorth,
            totalAssets: this.totalAssets,
            totalLiabilities: this.totalLiabilities,
            currency: this.currency,
            accountCount: this.accounts.size,
            transactionCount: this.transactions.size,
            budgetCount: this.budgets.size
        };
    }

    /**
     * Get account by ID
     * @param {string} accountId - Account ID
     * @returns {Account|null} Account
     */
    getAccount(accountId) {
        return this.accounts.get(accountId);
    }

    /**
     * Get all accounts
     * @returns {Array} Array of accounts
     */
    getAllAccounts() {
        return Array.from(this.accounts.values());
    }

    /**
     * Get transactions for account
     * @param {string} accountId - Account ID
     * @returns {Array} Array of transactions
     */
    getAccountTransactions(accountId) {
        return Array.from(this.transactions.values()).filter(tx => tx.accountId === accountId);
    }

    /**
     * Cleanup and shutdown
     */
    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        this.removeAllListeners();
        console.log('💰 Financial System: Shutdown complete');
    }
}

/**
 * Account Class - Converted from Rails Account model
 */
class Account {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.balance = data.balance || 0;
        this.currency = data.currency || 'USD';
        this.type = data.type || 'checking';
        this.subtype = data.subtype;
        this.classification = data.classification || 'asset';
        this.status = data.status || 'active';
        this.familyId = data.familyId;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        
        // Account-specific data
        this.metadata = data.metadata || {};
    }

    /**
     * Update account balance
     * @param {number} amount - Amount to add/subtract
     * @param {string} type - Transaction type
     */
    updateBalance(amount, type) {
        this.balance += amount;
        this.updatedAt = new Date();
    }

    /**
     * Get account classification
     * @returns {string} Classification
     */
    getClassification() {
        return this.classification;
    }

    /**
     * Convert to JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            balance: this.balance,
            currency: this.currency,
            type: this.type,
            classification: this.classification,
            status: this.status,
            familyId: this.familyId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

/**
 * Transaction Class - Converted from Rails Transaction model
 */
class Transaction {
    constructor(data) {
        this.id = data.id;
        this.accountId = data.accountId;
        this.amount = data.amount;
        this.type = data.type || 'standard';
        this.category = data.category;
        this.categoryId = data.categoryId;
        this.description = data.description;
        this.date = data.date || new Date();
        this.familyId = data.familyId;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        
        // Transaction metadata
        this.metadata = data.metadata || {};
        this.fees = [];
    }

    /**
     * Add transaction fee
     * @param {number} fee - Fee amount
     */
    addFee(fee) {
        this.fees.push({
            amount: fee,
            type: 'transaction_fee',
            date: new Date()
        });
    }

    /**
     * Get total amount including fees
     * @returns {number} Total amount
     */
    getTotalAmount() {
        const feeTotal = this.fees.reduce((sum, fee) => sum + fee.amount, 0);
        return this.amount + feeTotal;
    }

    /**
     * Convert to JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            id: this.id,
            accountId: this.accountId,
            amount: this.amount,
            type: this.type,
            category: this.category,
            categoryId: this.categoryId,
            description: this.description,
            date: this.date,
            familyId: this.familyId,
            fees: this.fees,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

/**
 * Budget Class - Converted from Rails Budget model
 */
class Budget {
    constructor(data) {
        this.id = data.id;
        this.familyId = data.familyId;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.currency = data.currency || 'USD';
        this.budgetedSpending = data.budgetedSpending || 0;
        this.expectedIncome = data.expectedIncome || 0;
        this.categories = new Map();
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Initialize budget categories
     */
    initializeCategories() {
        const defaultCategories = [
            'food', 'transportation', 'entertainment', 'utilities',
            'housing', 'healthcare', 'education', 'shopping'
        ];

        defaultCategories.forEach(category => {
            this.categories.set(category, {
                id: category,
                name: category,
                budgeted: 0,
                spent: 0,
                transactions: []
            });
        });
    }

    /**
     * Get category by ID
     * @param {string} categoryId - Category ID
     * @returns {Object|null} Category
     */
    getCategory(categoryId) {
        return this.categories.get(categoryId);
    }

    /**
     * Add transaction to category
     * @param {Transaction} transaction - Transaction
     */
    addTransaction(transaction) {
        const category = this.getCategory(transaction.categoryId);
        if (category) {
            category.transactions.push(transaction);
            category.spent += Math.abs(transaction.amount);
            this.updatedAt = new Date();
        }
    }

    /**
     * Get budget summary
     * @returns {Object} Budget summary
     */
    getSummary() {
        const totalBudgeted = this.budgetedSpending;
        const totalSpent = Array.from(this.categories.values())
            .reduce((sum, cat) => sum + cat.spent, 0);
        const remaining = totalBudgeted - totalSpent;

        return {
            totalBudgeted,
            totalSpent,
            remaining,
            percentUsed: totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0
        };
    }
}

/**
 * Family Class - Converted from Rails Family model
 */
class Family {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.currency = data.currency || 'USD';
        this.ownerId = data.ownerId;
        this.accounts = new Map();
        this.members = new Map();
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Add account to family
     * @param {Account} account - Account to add
     */
    addAccount(account) {
        this.accounts.set(account.id, account);
        this.updatedAt = new Date();
    }

    /**
     * Add member to family
     * @param {Object} member - Member data
     */
    addMember(member) {
        this.members.set(member.id, member);
        this.updatedAt = new Date();
    }
}

export default FinancialSystem; 