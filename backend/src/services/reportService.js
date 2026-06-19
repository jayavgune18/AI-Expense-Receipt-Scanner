const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Expense = require('../models/Expense');
const logger = require('../utils/logger');

const generatePDFReport = async (userId, dateRange, type) => {
  return new Promise(async (resolve, reject) => {
    try {
      const expenses = await Expense.find({
        userId,
        date: { $gte: dateRange.start, $lte: dateRange.end },
      }).sort({ date: -1 }).lean();

      const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);
      const categoryTotals = {};
      expenses.forEach((e) => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      });

      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('Expense Scanner', { align: 'center' });
      doc.fontSize(12).font('Helvetica').text(`Expense Report - ${type}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Period: ${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(2);

      // Summary
      doc.fontSize(14).font('Helvetica-Bold').text('Summary');
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text(`Total Expenses: ${expenses.length}`);
      doc.text(`Total Amount: $${totalSpending.toFixed(2)}`);
      doc.text(`Average per Transaction: $${expenses.length > 0 ? (totalSpending / expenses.length).toFixed(2) : '0.00'}`);
      doc.moveDown();

      // Category Breakdown
      doc.fontSize(14).font('Helvetica-Bold').text('Category Breakdown');
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, amount]) => {
          const pct = ((amount / totalSpending) * 100).toFixed(1);
          doc.text(`${cat}: $${amount.toFixed(2)} (${pct}%)`);
        });
      doc.moveDown();

      // Transactions
      doc.fontSize(14).font('Helvetica-Bold').text('Transactions');
      doc.moveDown(0.5);
      expenses.slice(0, 50).forEach((expense, i) => {
        doc.fontSize(9).font('Helvetica');
        doc.text(
          `${i + 1}. ${new Date(expense.date).toLocaleDateString()} | ${expense.merchantName.padEnd(25)} | ${expense.category.padEnd(15)} | $${expense.amount.toFixed(2)}`,
          { indent: 10 }
        );
      });

      if (expenses.length > 50) {
        doc.moveDown(0.5).fontSize(9).text(`... and ${expenses.length - 50} more transactions`, { align: 'center' });
      }

      doc.end();
    } catch (error) {
      logger.error('PDF generation error:', error);
      reject(error);
    }
  });
};

const generateExcelReport = async (userId, dateRange, type) => {
  try {
    const expenses = await Expense.find({
      userId,
      date: { $gte: dateRange.start, $lte: dateRange.end },
    }).sort({ date: -1 }).lean();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Expense Scanner';
    workbook.created = new Date();

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    const totalSpending = expenses.reduce((s, e) => s + e.amount, 0);
    summarySheet.addRows([
      { metric: 'Report Type', value: type },
      { metric: 'Period', value: `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}` },
      { metric: 'Total Transactions', value: expenses.length },
      { metric: 'Total Amount', value: `$${totalSpending.toFixed(2)}` },
      { metric: 'Average per Transaction', value: `$${expenses.length > 0 ? (totalSpending / expenses.length).toFixed(2) : '0.00'}` },
    ]);
    summarySheet.getRow(1).font = { bold: true };

    // Category Breakdown Sheet
    const categorySheet = workbook.addWorksheet('Category Breakdown');
    categorySheet.columns = [
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Percentage', key: 'percentage', width: 15 },
      { header: 'Count', key: 'count', width: 10 },
    ];

    const categoryData = {};
    expenses.forEach((e) => {
      if (!categoryData[e.category]) categoryData[e.category] = { amount: 0, count: 0 };
      categoryData[e.category].amount += e.amount;
      categoryData[e.category].count += 1;
    });

    Object.entries(categoryData)
      .sort((a, b) => b[1].amount - a[1].amount)
      .forEach(([cat, data]) => {
        categorySheet.addRow({
          category: cat,
          amount: data.amount,
          percentage: `${((data.amount / totalSpending) * 100).toFixed(1)}%`,
          count: data.count,
        });
      });
    categorySheet.getRow(1).font = { bold: true };

    // Transactions Sheet
    const transactionSheet = workbook.addWorksheet('Transactions');
    transactionSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Merchant', key: 'merchant', width: 25 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Description', key: 'description', width: 30 },
    ];

    expenses.forEach((e) => {
      transactionSheet.addRow({
        date: new Date(e.date).toLocaleDateString(),
        merchant: e.merchantName,
        category: e.category,
        amount: e.amount,
        description: e.description,
      });
    });
    transactionSheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    logger.error('Excel generation error:', error);
    throw error;
  }
};

module.exports = { generatePDFReport, generateExcelReport };