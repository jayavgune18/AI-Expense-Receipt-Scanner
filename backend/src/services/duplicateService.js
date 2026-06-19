const Receipt = require('../models/Receipt');
const logger = require('../utils/logger');

const checkForDuplicate = async (userId, merchantName, totalAmount, date) => {
  try {
    if (!merchantName || !totalAmount) return { isDuplicate: false };

    const timeWindow = date ? new Date(date) : new Date();
    const threeDaysBefore = new Date(timeWindow.getTime() - 3 * 24 * 60 * 60 * 1000);
    const threeDaysAfter = new Date(timeWindow.getTime() + 3 * 24 * 60 * 60 * 1000);

    const potentialDuplicates = await Receipt.find({
      userId,
      'extractedData.merchantName': { $regex: new RegExp(merchantName, 'i') },
      'extractedData.totalAmount': {
        $gte: totalAmount * 0.95,
        $lte: totalAmount * 1.05,
      },
      createdAt: { $gte: threeDaysBefore, $lte: threeDaysAfter },
      status: 'completed',
    }).limit(5);

    if (potentialDuplicates.length > 0) {
      return {
        isDuplicate: true,
        duplicateOf: potentialDuplicates[0]._id,
        confidence: potentialDuplicates.length >= 2 ? 0.95 : 0.8,
        existingReceipt: potentialDuplicates[0],
      };
    }

    return { isDuplicate: false };
  } catch (error) {
    logger.error('Duplicate check error:', error);
    return { isDuplicate: false };
  }
};

const getDuplicateReceipts = async (userId) => {
  try {
    const receipts = await Receipt.find({
      userId,
      'aiClassification.isDuplicate': true,
    })
      .populate('aiClassification.duplicateOf')
      .sort({ createdAt: -1 })
      .limit(50);

    return receipts;
  } catch (error) {
    logger.error('Get duplicates error:', error);
    return [];
  }
};

module.exports = { checkForDuplicate, getDuplicateReceipts };