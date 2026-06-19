import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Receipt, Camera, Brain, Cloud, BarChart3, Shield, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  { icon: Camera, title: 'Smart Receipt Scanning', description: 'Upload receipts via drag-and-drop. Our OCR extracts all expense data automatically.' },
  { icon: Brain, title: 'AI-Powered Categorization', description: 'GPT-4 automatically categorizes expenses and detects anomalies in your spending.' },
  { icon: BarChart3, title: 'Interactive Dashboard', description: 'Beautiful charts and insights to understand your spending patterns at a glance.' },
  { icon: Cloud, title: 'Cloud Backup', description: 'All your receipts and data are securely backed up to the cloud.' },
  { icon: Shield, title: 'Fraud Detection', description: 'AI detects duplicate receipts and suspicious transactions automatically.' },
  { icon: Receipt, title: 'Export & Reports', description: 'Generate PDF and Excel reports for accounting and tax purposes.' },
];

const LandingPage = () => (
  <div className="min-h-screen bg-gradient-to-b from-gray-50 via-primary-50/20 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
    {/* Nav */}
    <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center"><Receipt className="w-4 h-4 text-white" /></div>
        <span className="font-bold text-xl gradient-text">ScanExpense</span>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
        <Link to="/register" className="btn-primary text-sm">Get Started</Link>
      </div>
    </nav>

    {/* Hero */}
    <section className="max-w-7xl mx-auto px-6 py-20 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="px-3 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium mb-6 inline-block">Powered by AI</span>
        <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
          Scan, Organize & Analyze<br />
          <span className="gradient-text">Your Expenses with AI</span>
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Digitize receipts, automatically extract expense data, categorize spending, and get AI-powered financial insights — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/register" className="btn-primary text-lg px-8 py-3">Start Free Trial <ArrowRight className="w-5 h-5 ml-2" /></Link>
          <Link to="/login" className="btn-outline text-lg px-8 py-3">Sign In</Link>
        </div>
      </motion.div>
    </section>

    {/* Features */}
    <section className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-center mb-12">Everything you need to manage expenses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="glass-card-hover p-6">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4"><feature.icon className="w-6 h-6 text-white" /></div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="max-w-4xl mx-auto px-6 py-20 text-center">
      <div className="glass-card p-12">
        <h2 className="text-3xl font-bold mb-4">Ready to take control of your expenses?</h2>
        <p className="text-gray-500 mb-8 max-w-xl mx-auto">Join thousands of users who save time and money with AI-powered expense management.</p>
        <Link to="/register" className="btn-primary text-lg px-10 py-3">Get Started Free <ArrowRight className="w-5 h-5 ml-2" /></Link>
      </div>
    </section>

    {/* Footer */}
    <footer className="text-center py-8 text-sm text-gray-400">
      <p>© 2026 ScanExpense. All rights reserved.</p>
    </footer>
  </div>
);

export default LandingPage;