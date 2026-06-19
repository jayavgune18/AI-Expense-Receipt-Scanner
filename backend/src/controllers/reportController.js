const Report = require('../models/Report');
const reportService = require('../services/reportService');
const Expense = require('../models/Expense');
const logger = require('../utils/logger');

const generateReport = async (req, res, next) => {
  try {
    const { type = 'monthly', format = 'pdf', startDate, endDate } = req.body;

    let dateRange;
    if (startDate && endDate) {
      dateRange = { start: new Date(startDate), end: new Date(endDate) };
    } else {
      const now = new Date();
      switch (type) {
        case 'monthly':
          dateRange = {
            start: new Date(now.getFullYear(), now.getMonth(), 1),
            end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
          };
          break;
        case 'quarterly':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          dateRange = {
            start: new Date(now.getFullYear(), quarterStart, 1),
            end: now,
          };
          break;
        case 'yearly':
          dateRange = {
            start: new Date(now.getFullYear(), 0, 1),
            end: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
          };
          break;
        default:
          dateRange = {
            start: new Date(now.getFullYear(), now.getMonth(), 1),
            end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
          };
      }
    }

    let buffer;
    if (format === 'pdf') {
      buffer = await reportService.generatePDFReport(req.user._id, dateRange, type);
    } else {
      buffer = await reportService.generateExcelReport(req.user._id, dateRange, type);
    }

    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: dateRange.start, $lte: dateRange.end },
    }).lean();

    const totalSpending = expenses.reduce((s, e) => s + e.amount, 0);
    const categoryBreakdown = [];
    const categoryMap = {};
    expenses.forEach((e) => {
      if (!categoryMap[e.category]) categoryMap[e.category] = { amount: 0, count: 0 };
      categoryMap[e.category].amount += e.amount;
      categoryMap[e.category].count += 1;
    });
    Object.entries(categoryMap).forEach(([cat, data]) => {
      categoryBreakdown.push({
        category: cat,
        amount: data.amount,
        percentage: totalSpending > 0 ? ((data.amount / totalSpending) * 100) : 0,
        count: data.count,
      });
    });

    const report = await Report.create({
      userId: req.user._id,
      type,
      format,
      dateRange,
      data: {
        totalSpending,
        categoryBreakdown,
        generatedAt: new Date(),
      },
    });

    const filename = `expense-report-${type}-${Date.now()}.${format}`;
    res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json({ success: true, data: { reports } });
  } catch (error) {
    next(error);
  }
};

const getReport = async (req, res, next) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, data: { report } });
  } catch (error) {
    next(error);
  }
};

const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, message: 'Report deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateReport, getReports, getReport, deleteReport };