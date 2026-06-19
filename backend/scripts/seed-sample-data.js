const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Receipt = require('../src/models/Receipt');
const Expense = require('../src/models/Expense');
const Notification = require('../src/models/Notification');
const Category = require('../src/models/Category');

const UPLOAD_DIR = path.join(__dirname, '../uploads');
const RECEIPTS_DIR = path.join(UPLOAD_DIR, 'receipts');
const THUMBS_DIR = path.join(UPLOAD_DIR, 'thumbnails');

// Ensure dirs exist
[UPLOAD_DIR, RECEIPTS_DIR, THUMBS_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const SAMPLE_RECEIPTS = [
  {
    merchantName: 'Starbucks Coffee',
    category: 'Food & Dining',
    amount: 12.50,
    date: new Date('2026-06-15'),
    items: [
      { name: 'Cappuccino Grande', quantity: 1, price: 5.50 },
      { name: 'Blueberry Muffin', quantity: 1, price: 3.75 },
      { name: 'Bottled Water', quantity: 1, price: 3.25 },
    ],
  },
  {
    merchantName: 'Shell Gas Station',
    category: 'Transport',
    amount: 45.00,
    date: new Date('2026-06-14'),
    items: [
      { name: 'Premium Gasoline', quantity: 1, price: 45.00 },
    ],
  },
  {
    merchantName: 'Amazon.com',
    category: 'Shopping',
    amount: 89.97,
    date: new Date('2026-06-13'),
    items: [
      { name: 'Wireless Mouse', quantity: 1, price: 29.99 },
      { name: 'USB-C Hub', quantity: 1, price: 39.99 },
      { name: 'Screen Protector', quantity: 2, price: 9.99 },
    ],
  },
  {
    merchantName: 'Walmart Supercenter',
    category: 'Shopping',
    amount: 156.32,
    date: new Date('2026-06-12'),
    items: [
      { name: 'Groceries', quantity: 1, price: 98.50 },
      { name: 'Household Supplies', quantity: 1, price: 35.82 },
      { name: 'Snacks', quantity: 1, price: 22.00 },
    ],
  },
  {
    merchantName: 'Uber Ride',
    category: 'Transport',
    amount: 18.75,
    date: new Date('2026-06-11'),
    items: [
      { name: 'Trip: Downtown to Airport', quantity: 1, price: 18.75 },
    ],
  },
  {
    merchantName: 'McDonald\'s',
    category: 'Food & Dining',
    amount: 22.45,
    date: new Date('2026-06-10'),
    items: [
      { name: 'Big Mac Meal', quantity: 1, price: 9.99 },
      { name: 'Chicken McNuggets', quantity: 1, price: 7.49 },
      { name: 'McFlurry', quantity: 1, price: 4.97 },
    ],
  },
  {
    merchantName: 'CVS Pharmacy',
    category: 'Healthcare',
    amount: 34.50,
    date: new Date('2026-06-09'),
    items: [
      { name: 'Vitamin C Supplements', quantity: 1, price: 14.99 },
      { name: 'Bandages', quantity: 2, price: 5.99 },
      { name: 'Pain Relief', quantity: 1, price: 7.53 },
    ],
  },
  {
    merchantName: 'Netflix',
    category: 'Entertainment',
    amount: 15.99,
    date: new Date('2026-06-08'),
    items: [
      { name: 'Monthly Premium Subscription', quantity: 1, price: 15.99 },
    ],
  },
  {
    merchantName: 'Local Restaurant',
    category: 'Food & Dining',
    amount: 67.80,
    date: new Date('2026-06-07'),
    items: [
      { name: 'Grilled Salmon', quantity: 1, price: 24.99 },
      { name: 'Caesar Salad', quantity: 1, price: 14.99 },
      { name: 'Pasta Primavera', quantity: 1, price: 18.99 },
      { name: 'Iced Tea', quantity: 2, price: 4.42 },
    ],
  },
  {
    merchantName: 'Electric Company',
    category: 'Utilities',
    amount: 95.00,
    date: new Date('2026-06-06'),
    items: [],
  },
  {
    merchantName: 'Coursera',
    category: 'Education',
    amount: 49.00,
    date: new Date('2026-06-05'),
    items: [
      { name: 'Machine Learning Course', quantity: 1, price: 49.00 },
    ],
  },
  {
    merchantName: 'Delta Airlines',
    category: 'Travel',
    amount: 350.00,
    date: new Date('2026-06-04'),
    items: [
      { name: 'Round Trip Flight', quantity: 1, price: 350.00 },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-scanner');
    console.log('Connected to MongoDB');

    await Category.seedDefaults();
    console.log('Categories seeded');

    // Find the demo user or create one
    let user = await User.findOne({ email: 'demo@example.com' });
    if (!user) {
      user = await User.create({
        name: 'Demo User',
        email: 'demo@example.com',
        password: 'Demo1234!',
        preferences: {
          currency: 'USD',
          theme: 'dark',
          notifications: { email: false, push: true, budgetAlerts: true },
          monthlyBudget: 2000,
          language: 'en',
        },
      });
      console.log('Created demo user: demo@example.com / Demo1234!');
    } else {
      console.log('Using existing demo user');
      // Clean old data
      await Receipt.deleteMany({ userId: user._id });
      await Expense.deleteMany({ userId: user._id });
      await Notification.deleteMany({ userId: user._id });
    }

    const totalAmount = SAMPLE_RECEIPTS.reduce((s, r) => s + r.amount, 0);
    console.log(`Creating ${SAMPLE_RECEIPTS.length} sample receipts (Total: $${totalAmount.toFixed(2)})...`);

    for (const sample of SAMPLE_RECEIPTS) {
      const receipt = await Receipt.create({
        userId: user._id,
        imageUrl: '/placeholder-receipt.svg',
        publicId: '',
        thumbnailUrl: '',
        rawText: `Receipt from ${sample.merchantName} on ${sample.date.toLocaleDateString()} - $${sample.amount.toFixed(2)}`,
        extractedData: {
          merchantName: sample.merchantName,
          date: sample.date,
          totalAmount: sample.amount,
          taxAmount: sample.amount * 0.08,
          subtotal: sample.amount * 0.92,
          receiptNumber: `RCP-${String(1000 + Math.floor(Math.random() * 9000))}`,
          currency: 'USD',
          items: sample.items,
        },
        aiClassification: {
          category: sample.category,
          confidence: 0.85 + Math.random() * 0.15,
          tags: [sample.category.toLowerCase().replace(' & ', '_'), 'verified'],
          isDuplicate: false,
          isFraudulent: false,
          fraudScore: 0,
        },
        status: 'completed',
        processedAt: new Date(),
        createdAt: sample.date,
      });

      await Expense.create({
        userId: user._id,
        receiptId: receipt._id,
        merchantName: sample.merchantName,
        amount: sample.amount,
        taxAmount: sample.amount * 0.08,
        currency: 'USD',
        category: sample.category,
        description: `Receipt - ${sample.merchantName} (#${receipt._id})`,
        date: sample.date,
      });

      console.log(`  ✓ ${sample.merchantName}: $${sample.amount.toFixed(2)} (${sample.category})`);
    }

    console.log('\n✅ Sample data seeded successfully!');
    console.log('   Login with: demo@example.com / Demo1234!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();