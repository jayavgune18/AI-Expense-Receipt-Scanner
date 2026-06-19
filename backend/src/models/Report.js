const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly', 'custom'],
      required: true,
    },
    format: {
      type: String,
      enum: ['pdf', 'excel'],
      default: 'pdf',
    },
    dateRange: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    data: {
      totalSpending: { type: Number, default: 0 },
      categoryBreakdown: [
        {
          category: String,
          amount: Number,
          percentage: Number,
          count: Number,
        },
      ],
      topMerchants: [
        {
          name: String,
          amount: Number,
          count: Number,
        },
      ],
      trends: [
        {
          month: String,
          amount: Number,
        },
      ],
      aiInsights: [String],
    },
    fileUrl: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);