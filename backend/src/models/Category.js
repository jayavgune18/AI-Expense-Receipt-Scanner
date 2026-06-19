const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: '📁',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    keywords: [{
      type: String,
      trim: true,
    }],
    budgetLimit: {
      type: Number,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ userId: 1, name: 1 }, { unique: true });
categorySchema.index({ isDefault: 1 });

const defaultCategories = [
  { name: 'Food & Dining', icon: '🍽️', color: '#EF4444', keywords: ['restaurant', 'cafe', 'food', 'dining', 'grocery', 'supermarket', 'meal', 'lunch', 'dinner', 'breakfast', 'pizza', 'burger', 'coffee'], isDefault: true },
  { name: 'Transport', icon: '🚗', color: '#F59E0B', keywords: ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'metro', 'bus', 'train', 'parking', 'toll', 'transport'], isDefault: true },
  { name: 'Shopping', icon: '🛍️', color: '#EC4899', keywords: ['mall', 'store', 'shop', 'amazon', 'walmart', 'target', 'clothing', 'electronics', 'retail'], isDefault: true },
  { name: 'Healthcare', icon: '🏥', color: '#10B981', keywords: ['hospital', 'clinic', 'doctor', 'pharmacy', 'medical', 'health', 'insurance', 'dentist', 'medicine'], isDefault: true },
  { name: 'Education', icon: '📚', color: '#3B82F6', keywords: ['school', 'college', 'university', 'course', 'tuition', 'books', 'education', 'training', 'online course'], isDefault: true },
  { name: 'Entertainment', icon: '🎬', color: '#8B5CF6', keywords: ['movie', 'netflix', 'spotify', 'game', 'concert', 'theater', 'entertainment', 'subscription', 'music'], isDefault: true },
  { name: 'Travel', icon: '✈️', color: '#06B6D4', keywords: ['hotel', 'flight', 'airbnb', 'booking', 'travel', 'vacation', 'resort', 'luggage', 'airline'], isDefault: true },
  { name: 'Utilities', icon: '💡', color: '#F97316', keywords: ['electricity', 'water', 'internet', 'phone', 'utility', 'bill', 'power', 'gas bill', 'rent'], isDefault: true },
  { name: 'Others', icon: '📦', color: '#6B7280', keywords: ['other', 'misc', 'general'], isDefault: true },
];

categorySchema.statics.seedDefaults = async function () {
  const count = await this.countDocuments({ isDefault: true });
  if (count === 0) {
    await this.insertMany(defaultCategories);
    console.log('Default categories seeded successfully');
  }
};

module.exports = mongoose.model('Category', categorySchema);