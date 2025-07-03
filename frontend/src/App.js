import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Form states
  const [incomeForm, setIncomeForm] = useState({
    amount: '',
    source: 'trading',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: 'wifi',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [journalForm, setJournalForm] = useState({
    title: '',
    content: '',
    mood: 'neutral',
    date: new Date().toISOString().split('T')[0]
  });

  const incomeSourceOptions = [
    { value: 'trading', label: '📈 Trading' },
    { value: 'freelancing', label: '💻 Freelancing' },
    { value: 'selling_phones', label: '📱 Selling Phones' },
    { value: 'other', label: '💼 Other' }
  ];

  const expenseCategoryOptions = [
    { value: 'wifi', label: '🌐 WiFi' },
    { value: 'gym', label: '🏋️ Gym' },
    { value: 'trading_accounts', label: '📊 Trading Accounts' },
    { value: 'tuition_deposits', label: '🎓 Tuition Deposits' },
    { value: 'food', label: '🍕 Food' },
    { value: 'transport', label: '🚗 Transport' },
    { value: 'other', label: '💳 Other' }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/dashboard`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/income`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(incomeForm),
      });

      if (!response.ok) {
        throw new Error('Failed to add income');
      }

      // Reset form and refresh data
      setIncomeForm({
        amount: '',
        source: 'trading',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddIncome(false);
      fetchDashboardData();
    } catch (error) {
      console.error('Error adding income:', error);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseForm),
      });

      if (!response.ok) {
        throw new Error('Failed to add expense');
      }

      // Reset form and refresh data
      setExpenseForm({
        amount: '',
        category: 'wifi',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddExpense(false);
      fetchDashboardData();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleAddJournal = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/journal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(journalForm),
      });

      if (!response.ok) {
        throw new Error('Failed to add journal entry');
      }

      // Reset form
      setJournalForm({
        title: '',
        content: '',
        mood: 'neutral',
        date: new Date().toISOString().split('T')[0]
      });
      alert('Journal entry added successfully!');
    } catch (error) {
      console.error('Error adding journal entry:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BW', {
      style: 'currency',
      currency: 'BWP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-BW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const ProgressBar = ({ current, target, className = "" }) => {
    const percentage = Math.min((current / target) * 100, 100);
    
    return (
      <div className={`relative ${className}`}>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-800">
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your financial roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🎯 Mission: UCT</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">July - December 2025</p>
              <p className="text-xs text-gray-500">P2M Goal</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: '📊 Dashboard' },
              { id: 'income', label: '💰 Income' },
              { id: 'expenses', label: '💸 Expenses' },
              { id: 'milestones', label: '🏆 Milestones' },
              { id: 'journal', label: '📝 Journal' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress to P2M Goal</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Progress</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(dashboardData?.net_progress || 0)}
                  </span>
                </div>
                <ProgressBar 
                  current={dashboardData?.net_progress || 0} 
                  target={dashboardData?.goal_amount || 2000000}
                  className="mb-4"
                />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Income</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(dashboardData?.total_income || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Expenses</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(dashboardData?.total_expenses || 0)}
                    </p>
                  </div>
                </div>
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    Remaining: {formatCurrency((dashboardData?.goal_amount || 2000000) - (dashboardData?.net_progress || 0))}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowAddIncome(true)}
                className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-4 text-center transition-colors"
              >
                <div className="text-2xl mb-2">💰</div>
                <div className="font-medium">Add Income</div>
              </button>
              <button 
                onClick={() => setShowAddExpense(true)}
                className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-4 text-center transition-colors"
              >
                <div className="text-2xl mb-2">💸</div>
                <div className="font-medium">Add Expense</div>
              </button>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
              <div className="space-y-3">
                {dashboardData?.recent_income?.slice(0, 3).map((entry, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <div>
                      <p className="font-medium text-green-700">
                        {incomeSourceOptions.find(opt => opt.value === entry.source)?.label || entry.source}
                      </p>
                      <p className="text-sm text-gray-600">{formatDate(entry.date)}</p>
                    </div>
                    <span className="text-green-600 font-bold">+{formatCurrency(entry.amount)}</span>
                  </div>
                ))}
                {dashboardData?.recent_expenses?.slice(0, 2).map((entry, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded">
                    <div>
                      <p className="font-medium text-red-700">
                        {expenseCategoryOptions.find(opt => opt.value === entry.category)?.label || entry.category}
                      </p>
                      <p className="text-sm text-gray-600">{formatDate(entry.date)}</p>
                    </div>
                    <span className="text-red-600 font-bold">-{formatCurrency(entry.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Milestones</h2>
              <div className="space-y-4">
                {dashboardData?.milestones?.map((milestone, index) => {
                  const isAchieved = (dashboardData?.net_progress || 0) >= milestone.target_amount;
                  const progress = Math.min(((dashboardData?.net_progress || 0) / milestone.target_amount) * 100, 100);
                  
                  return (
                    <div key={index} className={`p-4 rounded-lg border-2 ${
                      isAchieved 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">{milestone.title}</h3>
                          <p className="text-sm text-gray-600">{milestone.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold">
                            {formatCurrency(milestone.target_amount)}
                          </span>
                          {isAchieved && (
                            <div className="text-green-600 text-xl">🎉</div>
                          )}
                        </div>
                      </div>
                      <ProgressBar 
                        current={dashboardData?.net_progress || 0} 
                        target={milestone.target_amount}
                        className="mt-2"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'journal' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Journal Entry</h2>
              <form onSubmit={handleAddJournal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={journalForm.title}
                    onChange={(e) => setJournalForm({...journalForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={journalForm.content}
                    onChange={(e) => setJournalForm({...journalForm, content: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
                    <select
                      value={journalForm.mood}
                      onChange={(e) => setJournalForm({...journalForm, mood: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="positive">😊 Positive</option>
                      <option value="neutral">😐 Neutral</option>
                      <option value="negative">😔 Negative</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={journalForm.date}
                      onChange={(e) => setJournalForm({...journalForm, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Add Journal Entry
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Add Income Modal */}
      {showAddIncome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add Income</h3>
            <form onSubmit={handleAddIncome} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (BWP)</label>
                <input
                  type="number"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({...incomeForm, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  value={incomeForm.source}
                  onChange={(e) => setIncomeForm({...incomeForm, source: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {incomeSourceOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={incomeForm.description}
                  onChange={(e) => setIncomeForm({...incomeForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm({...incomeForm, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Add Income
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddIncome(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (BWP)</label>
                <input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {expenseCategoryOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Add Expense
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;