const openai = require('../config/openai');
const Receipt = require('../models/Receipt');
const Expense = require('../models/Expense');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');
const env = require('../config/env');

const CATEGORIES = [
  'Food & Dining', 'Transport', 'Shopping', 'Healthcare',
  'Education', 'Entertainment', 'Travel', 'Utilities', 'Others',
];

const extractReceiptData = async (rawText) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert receipt parser. Extract structured data from receipt OCR text. 
Return a valid JSON object with:
- merchantName: string
- date: YYYY-MM-DD or null
- totalAmount: number or 0
- taxAmount: number or 0
- subtotal: number or 0
- receiptNumber: string or ""
- currency: string (default "USD")
- items: array of {name, quantity, price}
- category: one of ${CATEGORIES.join(', ')}
- confidence: number 0-1

Return ONLY the JSON object, no other text.`,
        },
        { role: 'user', content: `Parse this receipt text:\n\n${rawText}` },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No AI response');

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    return {
      merchantName: parsed.merchantName || '',
      date: parsed.date || null,
      totalAmount: parsed.totalAmount || 0,
      taxAmount: parsed.taxAmount || 0,
      subtotal: parsed.subtotal || 0,
      receiptNumber: parsed.receiptNumber || '',
      currency: parsed.currency || 'USD',
      items: (parsed.items || []).map((item) => ({
        name: item.name || '',
        quantity: item.quantity || 1,
        price: item.price || 0,
        category: item.category || '',
      })),
      category: CATEGORIES.includes(parsed.category) ? parsed.category : 'Others',
      confidence: parsed.confidence || 0,
    };
  } catch (error) {
    logger.error('AI extraction error:', error);
    // Fallback: simple text parsing
    return fallbackExtraction(rawText);
  }
};

const fallbackExtraction = (text) => {
  const lines = text.split('\n').filter((l) => l.trim());
  const numbers = text.match(/\d+\.?\d*/g)?.map(Number) || [];
  const total = numbers.length > 0 ? Math.max(...numbers) : 0;

  return {
    merchantName: lines[0] || '',
    date: null,
    totalAmount: total,
    taxAmount: 0,
    subtotal: 0,
    receiptNumber: '',
    currency: 'USD',
    items: [],
    category: 'Others',
    confidence: 0.5,
  };
};

const generateInsights = async (userId) => {
  try {
    const expenses = await Expense.find({ userId })
      .sort({ date: -1 })
      .limit(100)
      .lean();

    const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);
    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    const monthlyAverage = expenses.length > 0 ? totalSpending / Math.max(1, Math.ceil(expenses.length / 30)) : 0;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a financial advisor. Analyze expense data and provide 3-4 actionable insights. Be specific and personalized. Return JSON array of objects with: {title, description, type: "saving"|"warning"|"insight"|"budget", priority: "high"|"medium"|"low"}`,
        },
        {
          role: 'user',
          content: `Total spending: $${totalSpending.toFixed(2)}
Monthly average: $${monthlyAverage.toFixed(2)}
Top category: ${topCategory?.[0] || 'N/A'} ($${(topCategory?.[1] || 0).toFixed(2)})
Category breakdown: ${JSON.stringify(categoryTotals)}
Expense count: ${expenses.length}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return getDefaultInsights(totalSpending, topCategory);

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : getDefaultInsights(totalSpending, topCategory);
  } catch (error) {
    logger.error('AI insights error:', error);
    return getDefaultInsights(0, null);
  }
};

const getDefaultInsights = (totalSpending, topCategory) => {
  const insights = [];
  if (totalSpending > 0) {
    insights.push({
      title: 'Spending Overview',
      description: `Your total spending is $${totalSpending.toFixed(2)}. Consider setting a monthly budget.`,
      type: 'insight',
      priority: 'medium',
    });
  }
  if (topCategory) {
    insights.push({
      title: `High Spending on ${topCategory[0]}`,
      description: `You've spent $${topCategory[1].toFixed(2)} on ${topCategory[0]}. Look for ways to reduce this.`,
      type: 'warning',
      priority: 'high',
    });
  }
  insights.push({
    title: 'Track Recurring Expenses',
    description: 'Set up recurring expense tracking to better predict monthly spending.',
    type: 'saving',
    priority: 'low',
  });
  return insights;
};

const detectAnomalies = async (userId) => {
  try {
    const expenses = await Expense.find({ userId })
      .sort({ date: -1 })
      .limit(50)
      .lean();

    const categoryAverages = {};
    const merchantTotals = {};

    expenses.forEach((e) => {
      if (!categoryAverages[e.category]) categoryAverages[e.category] = [];
      categoryAverages[e.category].push(e.amount);
      
      merchantTotals[e.merchantName] = (merchantTotals[e.merchantName] || 0) + e.amount;
    });

    const anomalies = [];
    const avgByCategory = {};
    Object.entries(categoryAverages).forEach(([cat, amounts]) => {
      const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
      avgByCategory[cat] = avg;

      amounts.forEach((amount) => {
        if (amount > avg * 3) {
          anomalies.push({
            type: 'unusual_spending',
            category: cat,
            amount,
            average: avg,
            description: `Unusual spending detected: $${amount.toFixed(2)} (${(amount / avg).toFixed(1)}x average for ${cat})`,
            severity: amount > avg * 5 ? 'high' : 'medium',
          });
        }
      });
    });

    return anomalies;
  } catch (error) {
    logger.error('Anomaly detection error:', error);
    return [];
  }
};

const getChatbotResponse = async (userId, message, chatHistory) => {
  try {
    const expenses = await Expense.find({ userId })
      .sort({ date: -1 })
      .limit(20)
      .lean();

    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
    const categorySummary = {};
    expenses.forEach((e) => {
      categorySummary[e.category] = (categorySummary[e.category] || 0) + e.amount;
    });

    const messages = [
      {
        role: 'system',
        content: `You are an AI financial assistant for the Expense Scanner app. 
You help users understand their spending, provide financial advice, and answer questions.
Current user context:
- Total expenses tracked: ${expenses.length}
- Total amount spent: $${totalSpent.toFixed(2)}
- Categories: ${JSON.stringify(categorySummary)}
Be concise, helpful, and friendly. Keep responses under 150 words.`,
      },
      ...chatHistory.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || 'I apologize, but I am unable to process your request at the moment.';
  } catch (error) {
    logger.error('Chatbot error:', error);
    return 'I apologize, but I encountered an error. Please try again later.';
  }
};

const detectFraud = async (receiptData) => {
  try {
    const recentReceipts = await Receipt.find({
      'extractedData.merchantName': receiptData.merchantName,
      'extractedData.totalAmount': { $gte: receiptData.totalAmount * 0.9, $lte: receiptData.totalAmount * 1.1 },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (recentReceipts.length >= 3) {
      return { isFraudulent: true, fraudScore: 0.9, reason: 'Duplicate receipts detected within 24 hours' };
    }

    // Check for unusually high amounts
    if (receiptData.totalAmount > 10000) {
      return { isFraudulent: true, fraudScore: 0.7, reason: 'Unusually high receipt amount' };
    }

    return { isFraudulent: false, fraudScore: 0 };
  } catch (error) {
    logger.error('Fraud detection error:', error);
    return { isFraudulent: false, fraudScore: 0 };
  }
};

module.exports = {
  extractReceiptData,
  generateInsights,
  detectAnomalies,
  getChatbotResponse,
  detectFraud,
};