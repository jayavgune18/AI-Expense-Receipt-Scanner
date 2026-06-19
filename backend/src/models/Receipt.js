const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    rawText: {
      type: String,
      default: '',
    },
    extractedData: {
      merchantName: { type: String, default: '' },
      date: { type: Date, default: null },
      totalAmount: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      subtotal: { type: Number, default: 0 },
      receiptNumber: { type: String, default: '' },
      currency: { type: String, default: 'USD' },
      items: [
        {
          name: { type: String, default: '' },
          quantity: { type: Number, default: 1 },
          price: { type: Number, default: 0 },
          category: { type: String, default: '' },
        },
      ],
    },
    aiClassification: {
      category: {
        type: String,
        enum: [
          'Food & Dining',
          'Transport',
          'Shopping',
          'Healthcare',
          'Education',
          'Entertainment',
          'Travel',
          'Utilities',
          'Others',
        ],
        default: 'Others',
      },
      confidence: { type: Number, default: 0 },
      tags: [{ type: String }],
      isDuplicate: { type: Boolean, default: false },
      duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Receipt', default: null },
      isFraudulent: { type: Boolean, default: false },
      fraudScore: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

receiptSchema.index({ userId: 1, createdAt: -1 });
receiptSchema.index({ 'extractedData.merchantName': 'text', rawText: 'text' });

module.exports = mongoose.model('Receipt', receiptSchema);