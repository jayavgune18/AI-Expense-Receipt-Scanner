const Expense = require('../models/Expense');
const mongoose = require('mongoose');

const getExpenses = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, merchant, startDate, endDate, minAmount, maxAmount, search, sort = '-date' } = req.query;
    const query = { userId: req.user._id };

    if (category) query.category = category;
    if (merchant) query.merchantName = { $regex: merchant, $options: 'i' };
    if (search) {
      query.$or = [
        { merchantName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('receiptId', 'imageUrl thumbnailUrl')
      .lean();

    res.json({
      success: true,
      data: {
        expenses,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('receiptId');
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, data: { expense } });
  } catch (error) {
    next(error);
  }
};

const createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, data: { expense } });
  } catch (error) {
    next(error);
  }
};

const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, data: { expense } });
  } catch (error) {
    next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
};

const getExpenseStats = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear(), month } = req.query;
    const match = { userId: new mongoose.Types.ObjectId(req.user._id) };

    if (month) {
      match.date = {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0, 23, 59, 59),
      };
    } else {
      match.date = {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31, 23, 59, 59),
      };
    }

    const [categoryStats, monthlyTrends, merchantStats] = await Promise.all([
      Expense.aggregate([
        { $match: match },
        { $group: { _id: '$category', totalAmount: { $sum: '$amount' }, count: { $sum: 1 }, avgAmount: { $avg: '$amount' } } },
        { $sort: { totalAmount: -1 } },
      ]),
      Expense.aggregate([
        { $match: match },
        { $group: { _id: { $month: '$date' }, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Expense.aggregate([
        { $match: match },
        { $group: { _id: '$merchantName', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { totalAmount: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const totalSpending = categoryStats.reduce((s, c) => s + c.totalAmount, 0);
    const totalTransactions = categoryStats.reduce((s, c) => s + c.count, 0);

    res.json({
      success: true,
      data: {
        totalSpending,
        totalTransactions,
        averageTransaction: totalTransactions > 0 ? totalSpending / totalTransactions : 0,
        categoryStats,
        monthlyTrends,
        merchantStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getExpenses, getExpense, createExpense, updateExpense, deleteExpense, getExpenseStats };