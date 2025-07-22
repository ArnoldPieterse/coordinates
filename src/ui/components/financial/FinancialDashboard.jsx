/**
 * Financial Dashboard Component
 * Real-time financial data visualization integrated with game mechanics
 */

import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import './FinancialDashboard.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const FinancialDashboard = ({ financialSystem, playerId, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [financialData, setFinancialData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(null);
    const dashboardRef = useRef(null);

    useEffect(() => {
        initializeDashboard();
        return () => cleanup();
    }, [financialSystem, playerId]);

    const initializeDashboard = () => {
        if (!financialSystem) return;

        // Get initial financial data
        updateFinancialData();

        // Set up real-time updates
        const interval = setInterval(updateFinancialData, 2000);
        setRefreshInterval(interval);

        // Listen for financial events
        financialSystem.on('transaction:processed', handleTransactionUpdate);
        financialSystem.on('account:created', handleAccountUpdate);
        financialSystem.on('net-worth:updated', handleNetWorthUpdate);

        setIsLoading(false);
    };

    const cleanup = () => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
        if (financialSystem) {
            financialSystem.off('transaction:processed', handleTransactionUpdate);
            financialSystem.off('account:created', handleAccountUpdate);
            financialSystem.off('net-worth:updated', handleNetWorthUpdate);
        }
    };

    const updateFinancialData = () => {
        if (!financialSystem) return;

        const summary = financialSystem.getFinancialSummary();
        const playerAccount = financialSystem.getAccount(`player-${playerId}`);
        const transactions = playerAccount ? financialSystem.getAccountTransactions(`player-${playerId}`) : [];

        setFinancialData({
            summary,
            playerAccount,
            transactions: transactions.slice(-10), // Last 10 transactions
            recentActivity: generateRecentActivity(transactions),
            budgetData: generateBudgetData(),
            spendingTrends: generateSpendingTrends(transactions)
        });
    };

    const handleTransactionUpdate = (transaction) => {
        if (transaction.accountId === `player-${playerId}`) {
            updateFinancialData();
        }
    };

    const handleAccountUpdate = (account) => {
        if (account.id === `player-${playerId}`) {
            updateFinancialData();
        }
    };

    const handleNetWorthUpdate = (data) => {
        updateFinancialData();
    };

    const generateRecentActivity = (transactions) => {
        return transactions.slice(-5).map(tx => ({
            id: tx.id,
            type: tx.amount > 0 ? 'income' : 'expense',
            amount: Math.abs(tx.amount),
            description: tx.description,
            date: new Date(tx.date).toLocaleDateString(),
            category: tx.category
        }));
    };

    const generateBudgetData = () => {
        const categories = ['food', 'transportation', 'entertainment', 'utilities', 'housing'];
        return {
            labels: categories,
            datasets: [{
                data: categories.map(() => Math.random() * 1000),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        };
    };

    const generateSpendingTrends = (transactions) => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        }).reverse();

        const spendingByDay = last7Days.map(date => {
            const dayTransactions = transactions.filter(tx => 
                new Date(tx.date).toISOString().split('T')[0] === date
            );
            return dayTransactions.reduce((sum, tx) => sum + Math.abs(Math.min(0, tx.amount)), 0);
        });

        return {
            labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [{
                label: 'Daily Spending',
                data: spendingByDay,
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                tension: 0.4
            }]
        };
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const formatCurrency = (amount, currency = 'GC') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const getAccountStatusColor = (balance) => {
        if (balance > 1000) return '#4CAF50';
        if (balance > 500) return '#FF9800';
        return '#F44336';
    };

    if (isLoading) {
        return (
            <div className="financial-dashboard loading">
                <div className="loading-spinner">💰</div>
                <p>Loading financial data...</p>
            </div>
        );
    }

    if (!financialData) {
        return (
            <div className="financial-dashboard error">
                <p>Unable to load financial data</p>
            </div>
        );
    }

    return (
        <div className="financial-dashboard" ref={dashboardRef}>
            {/* Header */}
            <div className="dashboard-header">
                <h2>💰 Financial Dashboard</h2>
                <button className="close-button" onClick={onClose}>×</button>
            </div>

            {/* Navigation Tabs */}
            <div className="dashboard-tabs">
                <button 
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => handleTabChange('overview')}
                >
                    Overview
                </button>
                <button 
                    className={`tab ${activeTab === 'accounts' ? 'active' : ''}`}
                    onClick={() => handleTabChange('accounts')}
                >
                    Accounts
                </button>
                <button 
                    className={`tab ${activeTab === 'budget' ? 'active' : ''}`}
                    onClick={() => handleTabChange('budget')}
                >
                    Budget
                </button>
                <button 
                    className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
                    onClick={() => handleTabChange('transactions')}
                >
                    Transactions
                </button>
                <button 
                    className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => handleTabChange('analytics')}
                >
                    Analytics
                </button>
            </div>

            {/* Content Area */}
            <div className="dashboard-content">
                {activeTab === 'overview' && (
                    <OverviewTab financialData={financialData} formatCurrency={formatCurrency} />
                )}
                {activeTab === 'accounts' && (
                    <AccountsTab financialData={financialData} formatCurrency={formatCurrency} />
                )}
                {activeTab === 'budget' && (
                    <BudgetTab financialData={financialData} formatCurrency={formatCurrency} />
                )}
                {activeTab === 'transactions' && (
                    <TransactionsTab financialData={financialData} formatCurrency={formatCurrency} />
                )}
                {activeTab === 'analytics' && (
                    <AnalyticsTab financialData={financialData} formatCurrency={formatCurrency} />
                )}
            </div>
        </div>
    );
};

// Overview Tab Component
const OverviewTab = ({ financialData, formatCurrency }) => {
    const { summary, playerAccount, recentActivity } = financialData;

    return (
        <div className="overview-tab">
            {/* Net Worth Card */}
            <div className="card net-worth-card">
                <h3>Net Worth</h3>
                <div className="net-worth-amount">
                    {formatCurrency(summary.netWorth)}
                </div>
                <div className="net-worth-breakdown">
                    <div className="breakdown-item">
                        <span className="label">Assets:</span>
                        <span className="value positive">{formatCurrency(summary.totalAssets)}</span>
                    </div>
                    <div className="breakdown-item">
                        <span className="label">Liabilities:</span>
                        <span className="value negative">{formatCurrency(summary.totalLiabilities)}</span>
                    </div>
                </div>
            </div>

            {/* Account Balance Card */}
            <div className="card account-balance-card">
                <h3>Game Account Balance</h3>
                <div className="balance-amount" style={{ color: getAccountStatusColor(playerAccount?.balance || 0) }}>
                    {formatCurrency(playerAccount?.balance || 0)}
                </div>
                <div className="account-info">
                    <p>Account: {playerAccount?.name || 'Game Account'}</p>
                    <p>Status: {playerAccount?.status || 'Active'}</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card recent-activity-card">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                    {recentActivity.map(activity => (
                        <div key={activity.id} className="activity-item">
                            <div className="activity-icon">
                                {activity.type === 'income' ? '💰' : '💸'}
                            </div>
                            <div className="activity-details">
                                <div className="activity-description">{activity.description}</div>
                                <div className="activity-meta">
                                    <span className="activity-category">{activity.category}</span>
                                    <span className="activity-date">{activity.date}</span>
                                </div>
                            </div>
                            <div className={`activity-amount ${activity.type}`}>
                                {activity.type === 'income' ? '+' : '-'}{formatCurrency(activity.amount)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Accounts Tab Component
const AccountsTab = ({ financialData, formatCurrency }) => {
    const { summary } = financialData;

    return (
        <div className="accounts-tab">
            <div className="card accounts-summary">
                <h3>Accounts Summary</h3>
                <div className="accounts-stats">
                    <div className="stat-item">
                        <span className="stat-label">Total Accounts:</span>
                        <span className="stat-value">{summary.accountCount}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Total Assets:</span>
                        <span className="stat-value positive">{formatCurrency(summary.totalAssets)}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Total Liabilities:</span>
                        <span className="stat-value negative">{formatCurrency(summary.totalLiabilities)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Budget Tab Component
const BudgetTab = ({ financialData, formatCurrency }) => {
    const { budgetData } = financialData;

    return (
        <div className="budget-tab">
            <div className="card budget-overview">
                <h3>Budget Overview</h3>
                <div className="budget-chart">
                    <Doughnut 
                        data={budgetData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'bottom'
                                }
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

// Transactions Tab Component
const TransactionsTab = ({ financialData, formatCurrency }) => {
    const { transactions } = financialData;

    return (
        <div className="transactions-tab">
            <div className="card transactions-list">
                <h3>Recent Transactions</h3>
                <div className="transaction-items">
                    {transactions.map(transaction => (
                        <div key={transaction.id} className="transaction-item">
                            <div className="transaction-icon">
                                {transaction.amount > 0 ? '💰' : '💸'}
                            </div>
                            <div className="transaction-details">
                                <div className="transaction-description">{transaction.description}</div>
                                <div className="transaction-meta">
                                    <span className="transaction-category">{transaction.category}</span>
                                    <span className="transaction-date">
                                        {new Date(transaction.date).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className={`transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                                {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Analytics Tab Component
const AnalyticsTab = ({ financialData, formatCurrency }) => {
    const { spendingTrends } = financialData;

    return (
        <div className="analytics-tab">
            <div className="card spending-trends">
                <h3>Spending Trends (Last 7 Days)</h3>
                <div className="trends-chart">
                    <Line 
                        data={spendingTrends}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    display: false
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        callback: function(value) {
                                            return formatCurrency(value);
                                        }
                                    }
                                }
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

// Helper function for account status color
const getAccountStatusColor = (balance) => {
    if (balance > 1000) return '#4CAF50';
    if (balance > 500) return '#FF9800';
    return '#F44336';
};

export default FinancialDashboard; 