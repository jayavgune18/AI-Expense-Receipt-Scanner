const Receipt = require('../models/Receipt');
const Expense = require('../models/Expense');
const Notification = require('../models/Notification');
const ocrService = require('../services/ocrService');
const aiService = require('../services/aiService');
const storageService = require('../services/storageService');
const duplicateService = require('../services/duplicateService');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

const uploadReceipt = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Use local storage service instead of Cloudinary
    const uploadResult = await storageService.uploadReceipt(req.file.path, req.user._id);

    const receipt = await Receipt.create({
      userId: req.user._id,
      imageUrl: uploadResult.url,
      publicId: uploadResult.publicId,
      thumbnailUrl: uploadResult.thumbnailUrl,
      status: 'processing',
    });

    // Send initial response
    res.status(201).json({ success: true, data: { receipt, message: 'Receipt uploaded. Processing...' } });

    // Process in background
    processReceipt(receipt, req.user).catch((err) => logger.error('Background processing error:', err));
  } catch (error) {
    next(error);
  }
};

const uploadReceiptBuffer = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const uploadResult = await storageService.uploadFromBuffer(req.file.buffer, req.user._id);

    const receipt = await Receipt.create({
      userId: req.user._id,
      imageUrl: uploadResult.url,
      publicId: uploadResult.publicId,
      thumbnailUrl: uploadResult.thumbnailUrl,
      status: 'processing',
    });

    res.status(201).json({ success: true, data: { receipt, message: 'Receipt uploaded. Processing...' } });

    processReceipt(receipt, req.user).catch((err) => logger.error('Background processing error:', err));
  } catch (error) {
    next(error);
  }
};

const processReceipt = async (receipt, user) => {
  try {
    let extractedData = null;
    let ocrText = '';

    // OCR Processing (graceful failure)
    try {
      const ocrResult = await ocrService.extractTextFromImage(receipt.imageUrl);
      ocrText = ocrResult.text || '';
      receipt.rawText = ocrText;
    } catch (ocrErr) {
      logger.warn(`OCR failed for receipt ${receipt._id}: ${ocrErr.message}`);
    }

    // AI Extraction (graceful failure)
    try {
      if (ocrText) {
        extractedData = await aiService.extractReceiptData(ocrText);
      }
    } catch (aiErr) {
      logger.warn(`AI extraction failed for receipt ${receipt._id}: ${aiErr.message}`);
    }

    // Use extracted data or defaults
    const data = extractedData || {};
    receipt.extractedData = {
      merchantName: data.merchantName || 'Unknown Merchant',
      date: data.date || null,
      totalAmount: data.totalAmount || 0,
      taxAmount: data.taxAmount || 0,
      subtotal: data.subtotal || 0,
      receiptNumber: data.receiptNumber || '',
      currency: data.currency || 'USD',
      items: (data.items || []).map((item) => ({
        name: item.name || '',
        quantity: item.quantity || 1,
        price: item.price || 0,
        category: item.category || '',
      })),
    };

    receipt.aiClassification = {
      category: data.category || 'Others',
      confidence: data.confidence || 0.5,
      tags: [],
    };

    // Duplicate Detection
    try {
      const duplicateCheck = await duplicateService.checkForDuplicate(
        user._id,
        receipt.extractedData.merchantName,
        receipt.extractedData.totalAmount,
        receipt.extractedData.date
      );
      if (duplicateCheck.isDuplicate) {
        receipt.aiClassification.isDuplicate = true;
        receipt.aiClassification.duplicateOf = duplicateCheck.duplicateOf;
      }
    } catch (dupErr) {
      logger.warn(`Duplicate check failed: ${dupErr.message}`);
    }

    receipt.status = 'completed';
    receipt.processedAt = new Date();
    await receipt.save();

    // Create expense entry
    await Expense.create({
      userId: user._id,
      receiptId: receipt._id,
      merchantName: receipt.extractedData.merchantName,
      amount: receipt.extractedData.totalAmount,
      taxAmount: receipt.extractedData.taxAmount,
      currency: receipt.extractedData.currency,
      category: receipt.aiClassification.category,
      description: `Receipt - ${receipt.extractedData.merchantName}`,
      date: receipt.extractedData.date || new Date(),
    });

    // Create notification
    await Notification.create({
      userId: user._id,
      type: 'receipt_processed',
      title: 'Receipt Processed',
      message: `Receipt from ${receipt.extractedData.merchantName} for $${receipt.extractedData.totalAmount.toFixed(2)} has been processed.`,
      data: { receiptId: receipt._id },
    });
  } catch (error) {
    logger.error('Receipt processing error:', error);
    receipt.status = 'failed';
    await receipt.save();
  }
};

const getReceipts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category, startDate, endDate, search, sort = '-createdAt' } = req.query;
    const query = { userId: req.user._id };

    if (status) query.status = status;
    if (category) query['aiClassification.category'] = category;
    if (search) {
      query.$or = [
        { 'extractedData.merchantName': { $regex: search, $options: 'i' } },
        { rawText: { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await Receipt.countDocuments(query);
    const receipts = await Receipt.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: {
        receipts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findOne({ _id: req.params.id, userId: req.user._id });
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }
    res.json({ success: true, data: { receipt } });
  } catch (error) {
    next(error);
  }
};

const updateReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }
    res.json({ success: true, data: { receipt } });
  } catch (error) {
    next(error);
  }
};

const deleteReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findOne({ _id: req.params.id, userId: req.user._id });
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    // Delete from cloud storage
    if (receipt.publicId) {
      await storageService.deleteFile(receipt.publicId).catch(() => {});
    }

    // Delete associated expense
    await Expense.deleteMany({ receiptId: receipt._id });
    await receipt.deleteOne();

    res.json({ success: true, message: 'Receipt deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const reprocessReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findOne({ _id: req.params.id, userId: req.user._id });
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    receipt.status = 'processing';
    await receipt.save();
    res.json({ success: true, message: 'Reprocessing started' });

    const user = req.user;
    processReceipt(receipt, user).catch((err) => logger.error('Reprocessing error:', err));
  } catch (error) {
    next(error);
  }
};

const getReceiptStats = async (req, res, next) => {
  try {
    const stats = await Receipt.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: { $ifNull: ['$extractedData.totalAmount', 0] } },
        },
      },
    ]);

    const categoryStats = await Receipt.aggregate([
      { $match: { userId: req.user._id, status: 'completed' } },
      {
        $group: {
          _id: '$aiClassification.category',
          count: { $sum: 1 },
          totalAmount: { $sum: { $ifNull: ['$extractedData.totalAmount', 0] } },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.json({ success: true, data: { stats, categoryStats } });
  } catch (error) {
    next(error);
  }
};

const downloadReceiptPdf = async (req, res, next) => {
  try {
    const receipt = await Receipt.findOne({ _id: req.params.id, userId: req.user._id });
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const filename = `receipt-${receipt._id}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    });

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('Expense Scanner', { align: 'center' });
    doc.fontSize(14).text('Receipt Details', { align: 'center' });
    doc.moveDown(2);

    // Receipt Info
    doc.fontSize(12).font('Helvetica-Bold').text('Receipt Information');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Receipt ID: ${receipt._id}`);
    doc.text(`Status: ${receipt.status}`);
    doc.text(`Uploaded: ${receipt.createdAt ? new Date(receipt.createdAt).toLocaleString() : 'N/A'}`);
    doc.text(`Processed: ${receipt.processedAt ? new Date(receipt.processedAt).toLocaleString() : 'N/A'}`);
    doc.moveDown();

    // Extracted Data
    if (receipt.extractedData) {
      doc.fontSize(12).font('Helvetica-Bold').text('Extracted Information');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Merchant: ${receipt.extractedData.merchantName || 'N/A'}`);
      doc.text(`Date: ${receipt.extractedData.date ? new Date(receipt.extractedData.date).toLocaleDateString() : 'N/A'}`);
      doc.text(`Total Amount: ${receipt.extractedData.currency || '$'}${(receipt.extractedData.totalAmount || 0).toFixed(2)}`);
      if (receipt.extractedData.subtotal) doc.text(`Subtotal: ${(receipt.extractedData.subtotal).toFixed(2)}`);
      if (receipt.extractedData.taxAmount) doc.text(`Tax: ${(receipt.extractedData.taxAmount).toFixed(2)}`);
      if (receipt.extractedData.receiptNumber) doc.text(`Receipt #: ${receipt.extractedData.receiptNumber}`);
      doc.moveDown();

      // Items
      if (receipt.extractedData.items && receipt.extractedData.items.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').text('Line Items');
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica');
        receipt.extractedData.items.forEach((item, i) => {
          doc.text(`${i + 1}. ${item.name || 'Item'} - Qty: ${item.quantity || 1} x $${(item.price || 0).toFixed(2)} = $${((item.quantity || 1) * (item.price || 0)).toFixed(2)}`);
        });
        doc.moveDown();
      }
    }

    // AI Classification
    if (receipt.aiClassification) {
      doc.fontSize(12).font('Helvetica-Bold').text('AI Classification');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Category: ${receipt.aiClassification.category || 'N/A'}`);
      doc.text(`Confidence: ${((receipt.aiClassification.confidence || 0) * 100).toFixed(1)}%`);
      if (receipt.aiClassification.isDuplicate) doc.text('⚠ Duplicate Receipt Detected');
      if (receipt.aiClassification.isFraudulent) doc.text('⚠ Fraud Alert!');
      doc.moveDown();
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).font('Helvetica').text('Generated by Expense Scanner', { align: 'center' });
    doc.fontSize(8).text(`Downloaded: ${new Date().toLocaleString()}`, { align: 'center' });

    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadReceipt,
  uploadReceiptBuffer,
  getReceipts,
  getReceipt,
  updateReceipt,
  deleteReceipt,
  reprocessReceipt,
  getReceiptStats,
  downloadReceiptPdf,
};
