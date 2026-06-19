import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Receipt, Wallet, TrendingDown } from 'lucide-react';
import { expenseAPI } from '../api/auth';
import { StatsCardSkeleton, ChartSkeleton } from '../components/common/Skeleton';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

const COLORS = ['#EF4444', '#F59E0B', '#EC4899', '#10B981', '#3B82F6', '#8B5CF6', '#06B6D4', '#F97316', '#6B7280'];

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data } = await expenseAPI.getStats({ year: new Date().getFullYear() });
      setStats(data.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <StatsCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendData = stats?.monthlyTrends?.map((t) => ({
    month: monthNames[t._id - 1] || `M${t._id}`,
    amount: t.totalAmount,
    transactions: t.count,
  })) || [];

  const pieData = stats?.categoryStats?.map((c) => ({
    name: c._id,
    value: c.totalAmount,
  })) || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Spending', value: stats?.totalSpending || 0, icon: DollarSign, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
          { label: 'Transactions', value: stats?.totalTransactions || 0, icon: Receipt, color: 'from-green-500 to-green-600', bg: 'bg-green-50 dark:bg-green-950' },
          { label: 'Average', value: stats?.averageTransaction || 0, icon: TrendingUp, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
          { label: 'Categories', value: stats?.categoryStats?.length || 0, icon: Wallet, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
        ].map((card, i) => (
          <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="glass-card-hover p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className={`text-2xl font-bold mt-1 ${['value', 'average'].includes(card.label.toLowerCase()) ? 'text-gray-900 dark:text-gray-100' : ''}`}>
                  {card.label === 'Transactions' ? formatNumber(card.value) : formatCurrency(card.value)}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${card.bg}`}>
                <card.icon className={`w-6 h-6 bg-gradient-to-br ${card.color} text-transparent bg-clip-text`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', background: 'white' }}
                formatter={(value) => [formatCurrency(value), 'Amount']}
              />
              <Area type="monotone" dataKey="amount" stroke="#6366f1" fill="url(#spendingGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.slice(0, 6).map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-gray-600 dark:text-gray-400 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Merchants */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Top Merchants</h3>
        <div className="space-y-3">
          {stats?.merchantStats?.slice(0, 5).map((merchant, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                  {merchant._id.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm">{merchant._id}</p>
                  <p className="text-xs text-gray-500">{merchant.count} transactions</p>
                </div>
              </div>
              <p className="font-semibold text-sm">{formatCurrency(merchant.totalAmount)}</p>
            </div>
          ))}
          {(!stats?.merchantStats || stats.merchantStats.length === 0) && (
            <p className="text-center text-gray-400 py-8">No merchant data yet. Upload your first receipt!</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;