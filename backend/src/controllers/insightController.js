const aiService = require('../services/aiService');
const Expense = require('../models/Expense');
const ChatMessage = require('../models/ChatMessage');
const Notification = require('../models/Notification');

const getInsights = async (req, res, next) => {
  try {
    const insights = await aiService.generateInsights(req.user._id);
    res.json({ success: true, data: { insights } });
  } catch (error) {
    next(error);
  }
};

const getSpendingHabits = async (req, res, next) => {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 2, 1);
    
    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 }).lean();

    const dailyTotals = {};
    const weekdayTotals = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const categoryTotals = {};
    let totalSpending = 0;

    expenses.forEach((e) => {
      const day = new Date(e.date).toLocaleDateString();
      dailyTotals[day] = (dailyTotals[day] || 0) + e.amount;
      
      const weekday = new Date(e.date).getDay();
      weekdayTotals[weekday] = (weekdayTotals[weekday] || 0) + e.amount;
      
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      totalSpending += e.amount;
    });

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const highestSpendingDay = Object.entries(weekdayTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([day]) => weekdays[parseInt(day)])[0] || 'N/A';

    res.json({
      success: true,
      data: {
        totalSpending,
        averageDaily: expenses.length > 0 ? totalSpending / expenses.length : 0,
        highestSpendingDay,
        dailyTotals,
        weekdayTotals: Object.fromEntries(
          Object.entries(weekdayTotals).map(([day, amount]) => [weekdays[parseInt(day)], amount])
        ),
        categoryTotals,
        transactionCount: expenses.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getBudgetSuggestions = async (req, res, next) => {
  try {
    const recentExpenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    }).lean();

    const user = req.user;
    const monthlyBudget = user.preferences?.monthlyBudget || 0;
    const currentSpending = recentExpenses.reduce((s, e) => s + e.amount, 0);

    const categoryTotals = {};
    recentExpenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const suggestions = [];
    if (monthlyBudget > 0) {
      const remaining = monthlyBudget - currentSpending;
      const pctUsed = (currentSpending / monthlyBudget) * 100;
      suggestions.push({
        type: pctUsed > 80 ? 'warning' : 'info',
        title: pctUsed > 80 ? 'Budget Nearly Exhausted' : 'Budget Status',
        description: `You've used ${pctUsed.toFixed(0)}% of your monthly budget. $${remaining.toFixed(2)} remaining.`,
        percentage: Math.round(pctUsed),
        remaining,
      });
    }

    // Suggest budgets for top categories
    Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .forEach(([cat, amount]) => {
        suggestions.push({
          type: 'suggestion',
          title: `${cat} Budget Suggestion`,
          description: `Consider setting a $${(amount * 1.1).toFixed(0)} monthly budget for ${cat} based on your spending.`,
          suggestedBudget: Math.round(amount * 1.1),
          category: cat,
        });
      });

    res.json({ success: true, data: { suggestions, currentSpending, monthlyBudget } });
  } catch (error) {
    next(error);
  }
};

const getAnomalies = async (req, res, next) => {
  try {
    const anomalies = await aiService.detectAnomalies(req.user._id);
    res.json({ success: true, data: { anomalies } });
  } catch (error) {
    next(error);
  }
};

const getSavingsRecommendations = async (req, res, next) => {
  try {
    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1) },
    }).lean();

    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const recommendations = [];
    Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, amount]) => {
        if (amount > 200) {
          const savingGoal = amount * 0.15;
          recommendations.push({
            category: cat,
            currentSpending: amount,
            potentialSaving: Math.round(savingGoal),
            tip: getSavingTip(cat),
            priority: amount > 500 ? 'high' : 'medium',
          });
        }
      });

    res.json({ success: true, data: { recommendations } });
  } catch (error) {
    next(error);
  }
};

const getSavingTip = (category) => {
  const tips = {
    'Food & Dining': 'Consider meal prepping and cooking at home more often. Try using discount apps like Too Good To Go.',
    'Transport': 'Use public transport or carpool. Consider biking for short distances.',
    'Shopping': 'Wait 24 hours before making non-essential purchases. Use price tracking tools.',
    'Healthcare': 'Review your insurance coverage and consider generic alternatives for medications.',
    'Entertainment': 'Rotate streaming subscriptions instead of keeping all active simultaneously.',
    'Travel': 'Book in advance and use incognito mode when searching for flights.',
    'Utilities': 'Unplug electronics when not in use and switch to LED bulbs.',
  };
  return tips[category] || 'Review this expense category for potential savings opportunities.';
};

const chatWithAI = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    // Save user message
    await ChatMessage.create({ userId: req.user._id, role: 'user', content: message });

    // Get chat history
    const history = await ChatMessage.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const response = await aiService.getChatbotResponse(
      req.user._id,
      message,
      history.reverse()
    );

    // Save assistant response
    await ChatMessage.create({ userId: req.user._id, role: 'assistant', content: response });

    res.json({ success: true, data: { message: response } });
  } catch (error) {
    next(error);
  }
};

const getChatHistory = async (req, res, next) => {
  try {
    const messages = await ChatMessage.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ success: true, data: { messages: messages.reverse() } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInsights, getSpendingHabits, getBudgetSuggestions,
  getAnomalies, getSavingsRecommendations, chatWithAI, getChatHistory,
};