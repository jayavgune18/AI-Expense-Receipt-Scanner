const User = require('../models/User');
const Receipt = require('../models/Receipt');
const Expense = require('../models/Expense');
const Notification = require('../models/Notification');

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.name = { $regex: search, $options: 'i' };

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-refreshToken -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({ success: true, data: { users, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } } });
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-refreshToken -resetPasswordToken -resetPasswordExpires')
      .lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const [receiptCount, expenseCount, totalSpending] = await Promise.all([
      Receipt.countDocuments({ userId: user._id }),
      Expense.countDocuments({ userId: user._id }),
      Expense.aggregate([{ $match: { userId: user._id } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    res.json({
      success: true,
      data: { user, stats: { receiptCount, expenseCount, totalSpending: totalSpending[0]?.total || 0 } },
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, role, emailVerified } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { name, role, emailVerified } },
      { new: true, runValidators: true }
    ).select('-refreshToken -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await Promise.all([
      Receipt.deleteMany({ userId: user._id }),
      Expense.deleteMany({ userId: user._id }),
      Notification.deleteMany({ userId: user._id }),
    ]);
    res.json({ success: true, message: 'User and all associated data deleted' });
  } catch (error) {
    next(error);
  }
};

const getSystemStats = async (req, res, next) => {
  try {
    const [totalUsers, totalReceipts, totalExpenses, spendingData] = await Promise.all([
      User.countDocuments(),
      Receipt.countDocuments(),
      Expense.countDocuments(),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' }, avg: { $avg: '$amount' } } }]),
    ]);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt').lean();
    const categoryStats = await Expense.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalReceipts,
        totalExpenses,
        totalSpending: spendingData[0]?.total || 0,
        averageExpense: spendingData[0]?.avg || 0,
        recentUsers,
        categoryStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUser, updateUser, deleteUser, getSystemStats };