/**
 * Financial System Integration Tests
 * Comprehensive testing for Maybe Finance integration
 */

import FinancialSystem from '../../src/financial/FinancialSystem.js';

// Mock game engine
const mockGameEngine = {
    on: jest.fn(),
    emit: jest.fn()
};

describe('Financial System Integration', () => {
    let financialSystem;

    beforeEach(() => {
        financialSystem = new FinancialSystem(mockGameEngine);
        jest.clearAllMocks();
    });

    afterEach(() => {
        if (financialSystem) {
            financialSystem.destroy();
        }
    });

    describe('Initialization', () => {
        test('should initialize financial system correctly', () => {
            expect(financialSystem).toBeDefined();
            expect(financialSystem.accounts).toBeInstanceOf(Map);
            expect(financialSystem.transactions).toBeInstanceOf(Map);
            expect(financialSystem.budgets).toBeInstanceOf(Map);
            expect(financialSystem.currency).toBe('USD');
        });

        test('should set up event listeners', () => {
            expect(mockGameEngine.on).toHaveBeenCalledWith('player:join', expect.any(Function));
            expect(mockGameEngine.on).toHaveBeenCalledWith('player:earn', expect.any(Function));
            expect(mockGameEngine.on).toHaveBeenCalledWith('player:spend', expect.any(Function));
        });

        test('should initialize game economy', () => {
            expect(financialSystem.gameCurrency).toBeDefined();
            expect(financialSystem.gameCurrency.name).toBe('Game Credits');
            expect(financialSystem.gameCurrency.symbol).toBe('GC');
            expect(financialSystem.economicSimulation).toBeDefined();
        });
    });

    describe('Account Management', () => {
        test('should create account successfully', () => {
            const accountData = {
                id: 'test-account',
                name: 'Test Account',
                balance: 1000,
                currency: 'USD',
                type: 'checking'
            };

            const account = financialSystem.createAccount(accountData);

            expect(account).toBeDefined();
            expect(account.id).toBe('test-account');
            expect(account.name).toBe('Test Account');
            expect(account.balance).toBe(1000);
            expect(financialSystem.accounts.has('test-account')).toBe(true);
        });

        test('should create player account on player join', () => {
            const player = { id: 'player1', name: 'TestPlayer' };
            
            // Simulate player join event
            const playerJoinHandler = mockGameEngine.on.mock.calls.find(
                call => call[0] === 'player:join'
            )[1];
            
            playerJoinHandler(player);

            const account = financialSystem.getAccount('player-player1');
            expect(account).toBeDefined();
            expect(account.name).toBe("TestPlayer's Game Account");
            expect(account.balance).toBe(1000);
            expect(account.currency).toBe('GC');
        });

        test('should get account by ID', () => {
            const accountData = {
                id: 'test-account',
                name: 'Test Account',
                balance: 1000
            };

            financialSystem.createAccount(accountData);
            const account = financialSystem.getAccount('test-account');

            expect(account).toBeDefined();
            expect(account.id).toBe('test-account');
        });

        test('should get all accounts', () => {
            const account1 = financialSystem.createAccount({
                id: 'account1',
                name: 'Account 1',
                balance: 1000
            });

            const account2 = financialSystem.createAccount({
                id: 'account2',
                name: 'Account 2',
                balance: 2000
            });

            const allAccounts = financialSystem.getAllAccounts();
            expect(allAccounts).toHaveLength(2);
            expect(allAccounts).toContain(account1);
            expect(allAccounts).toContain(account2);
        });
    });

    describe('Transaction Processing', () => {
        let testAccount;

        beforeEach(() => {
            testAccount = financialSystem.createAccount({
                id: 'test-account',
                name: 'Test Account',
                balance: 1000,
                currency: 'USD'
            });
        });

        test('should process valid transaction', () => {
            const transactionData = {
                id: 'tx-1',
                accountId: 'test-account',
                amount: 100,
                type: 'income',
                description: 'Test income',
                date: new Date()
            };

            const transaction = financialSystem.processTransaction(transactionData);

            expect(transaction).toBeDefined();
            expect(transaction.id).toBe('tx-1');
            expect(transaction.amount).toBe(100);
            
            // Check account balance was updated
            const updatedAccount = financialSystem.getAccount('test-account');
            expect(updatedAccount.balance).toBe(1100);
        });

        test('should process expense transaction', () => {
            const transactionData = {
                id: 'tx-2',
                accountId: 'test-account',
                amount: -50,
                type: 'expense',
                description: 'Test expense',
                date: new Date()
            };

            const transaction = financialSystem.processTransaction(transactionData);

            expect(transaction).toBeDefined();
            expect(transaction.amount).toBe(-50);
            
            // Check account balance was updated
            const updatedAccount = financialSystem.getAccount('test-account');
            expect(updatedAccount.balance).toBe(950);
        });

        test('should reject invalid transaction', () => {
            const transactionData = {
                id: 'tx-3',
                accountId: 'non-existent-account',
                amount: 100,
                description: 'Invalid transaction'
            };

            expect(() => {
                financialSystem.processTransaction(transactionData);
            }).toThrow('Account not found');
        });

        test('should reject transaction with insufficient funds', () => {
            const transactionData = {
                id: 'tx-4',
                accountId: 'test-account',
                amount: -2000, // More than balance
                type: 'expense',
                description: 'Overdraft attempt'
            };

            expect(() => {
                financialSystem.processTransaction(transactionData);
            }).toThrow('Invalid transaction');
        });

        test('should calculate transaction fees', () => {
            const transactionData = {
                id: 'tx-5',
                accountId: 'test-account',
                amount: 1000,
                type: 'income',
                description: 'Large transaction'
            };

            const transaction = financialSystem.processTransaction(transactionData);
            const fees = transaction.fees;

            expect(fees).toHaveLength(1);
            expect(fees[0].amount).toBe(10); // 1% of 1000
            expect(fees[0].type).toBe('transaction_fee');
        });

        test('should get account transactions', () => {
            // Create multiple transactions
            financialSystem.processTransaction({
                id: 'tx-1',
                accountId: 'test-account',
                amount: 100,
                description: 'Transaction 1'
            });

            financialSystem.processTransaction({
                id: 'tx-2',
                accountId: 'test-account',
                amount: -50,
                description: 'Transaction 2'
            });

            const transactions = financialSystem.getAccountTransactions('test-account');
            expect(transactions).toHaveLength(2);
            expect(transactions[0].description).toBe('Transaction 1');
            expect(transactions[1].description).toBe('Transaction 2');
        });
    });

    describe('Game Integration', () => {
        test('should process game earning', () => {
            const player = { id: 'player1', name: 'TestPlayer' };
            
            // Create player account first
            const playerJoinHandler = mockGameEngine.on.mock.calls.find(
                call => call[0] === 'player:join'
            )[1];
            playerJoinHandler(player);

            // Simulate game earning
            const earningData = {
                playerId: 'player1',
                amount: 500,
                description: 'Kill bonus'
            };

            const earnHandler = mockGameEngine.on.mock.calls.find(
                call => call[0] === 'player:earn'
            )[1];
            
            earnHandler(earningData);

            const account = financialSystem.getAccount('player-player1');
            expect(account.balance).toBe(1500); // 1000 initial + 500 earning
        });

        test('should process game spending', () => {
            const player = { id: 'player1', name: 'TestPlayer' };
            
            // Create player account first
            const playerJoinHandler = mockGameEngine.on.mock.calls.find(
                call => call[0] === 'player:join'
            )[1];
            playerJoinHandler(player);

            // Simulate game spending
            const spendingData = {
                playerId: 'player1',
                amount: 200,
                description: 'Weapon purchase'
            };

            const spendHandler = mockGameEngine.on.mock.calls.find(
                call => call[0] === 'player:spend'
            )[1];
            
            spendHandler(spendingData);

            const account = financialSystem.getAccount('player-player1');
            expect(account.balance).toBe(800); // 1000 initial - 200 spending
        });
    });

    describe('Budget Management', () => {
        test('should create budget successfully', () => {
            const budgetData = {
                id: 'budget-1',
                familyId: 'family-1',
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-01-31'),
                currency: 'USD',
                budgetedSpending: 5000
            };

            const budget = financialSystem.createBudget(budgetData);

            expect(budget).toBeDefined();
            expect(budget.id).toBe('budget-1');
            expect(budget.budgetedSpending).toBe(5000);
            expect(financialSystem.budgets.has('budget-1')).toBe(true);
        });

        test('should initialize budget categories', () => {
            const budget = financialSystem.createBudget({
                id: 'budget-1',
                familyId: 'family-1',
                startDate: new Date(),
                endDate: new Date()
            });

            const summary = budget.getSummary();
            expect(summary.totalBudgeted).toBe(0);
            expect(summary.totalSpent).toBe(0);
            expect(summary.remaining).toBe(0);
        });
    });

    describe('Net Worth Calculation', () => {
        test('should calculate net worth correctly', () => {
            // Create asset account
            financialSystem.createAccount({
                id: 'asset-1',
                name: 'Asset Account',
                balance: 5000,
                classification: 'asset'
            });

            // Create liability account
            financialSystem.createAccount({
                id: 'liability-1',
                name: 'Liability Account',
                balance: -2000,
                classification: 'liability'
            });

            financialSystem.updateNetWorth();

            expect(financialSystem.totalAssets).toBe(5000);
            expect(financialSystem.totalLiabilities).toBe(2000);
            expect(financialSystem.netWorth).toBe(3000);
        });

        test('should get financial summary', () => {
            financialSystem.createAccount({
                id: 'account-1',
                name: 'Account 1',
                balance: 1000
            });

            financialSystem.processTransaction({
                id: 'tx-1',
                accountId: 'account-1',
                amount: 500,
                description: 'Test transaction'
            });

            const summary = financialSystem.getFinancialSummary();

            expect(summary.netWorth).toBe(1500);
            expect(summary.totalAssets).toBe(1500);
            expect(summary.totalLiabilities).toBe(0);
            expect(summary.accountCount).toBe(1);
            expect(summary.transactionCount).toBe(1);
        });
    });

    describe('Real-time Synchronization', () => {
        test('should perform synchronization', () => {
            // Create some data
            financialSystem.createAccount({
                id: 'sync-test',
                name: 'Sync Test',
                balance: 1000
            });

            // Mock emit function to capture sync events
            const emitSpy = jest.spyOn(financialSystem, 'emit');

            // Trigger sync
            financialSystem.performSync();

            // Check if sync event was emitted
            expect(emitSpy).toHaveBeenCalledWith('sync:changes', expect.any(Object));
        });

        test('should emit events on account creation', () => {
            const emitSpy = jest.spyOn(financialSystem, 'emit');

            financialSystem.createAccount({
                id: 'event-test',
                name: 'Event Test',
                balance: 1000
            });

            expect(emitSpy).toHaveBeenCalledWith('account:created', expect.any(Object));
        });

        test('should emit events on transaction processing', () => {
            const account = financialSystem.createAccount({
                id: 'event-test',
                name: 'Event Test',
                balance: 1000
            });

            const emitSpy = jest.spyOn(financialSystem, 'emit');

            financialSystem.processTransaction({
                id: 'tx-event',
                accountId: 'event-test',
                amount: 100,
                description: 'Event test'
            });

            expect(emitSpy).toHaveBeenCalledWith('transaction:processed', expect.any(Object));
        });
    });

    describe('Error Handling', () => {
        test('should handle invalid account data', () => {
            expect(() => {
                financialSystem.createAccount(null);
            }).toThrow();
        });

        test('should handle invalid transaction data', () => {
            expect(() => {
                financialSystem.processTransaction(null);
            }).toThrow();
        });

        test('should handle missing account in transaction', () => {
            expect(() => {
                financialSystem.processTransaction({
                    id: 'tx-error',
                    accountId: 'non-existent',
                    amount: 100
                });
            }).toThrow('Account not found');
        });
    });

    describe('Cleanup', () => {
        test('should cleanup resources on destroy', () => {
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
            const removeAllListenersSpy = jest.spyOn(financialSystem, 'removeAllListeners');

            financialSystem.destroy();

            expect(clearIntervalSpy).toHaveBeenCalled();
            expect(removeAllListenersSpy).toHaveBeenCalled();
        });
    });
}); 