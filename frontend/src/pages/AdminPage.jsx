import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Receipt, DollarSign, Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { adminAPI } from '../api/auth';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../utils/formatters';

const AdminPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user?.role === 'admin') loadAdminData(); }, [user]);

  const loadAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([adminAPI.getStats(), adminAPI.getUsers({ limit: 10 })]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data.users);
    } catch (err) { toast.error('Failed to load admin data'); }
    finally { setLoading(false); }
  };

  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-purple-500" />
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5"><p className="text-sm text-gray-500">Total Users</p><p className="text-2xl font-bold mt-1">{stats?.totalUsers || 0}</p></div>
        <div className="glass-card p-5"><p className="text-sm text-gray-500">Total Receipts</p><p className="text-2xl font-bold mt-1">{stats?.totalReceipts || 0}</p></div>
        <div className="glass-card p-5"><p className="text-sm text-gray-500">Total Expenses</p><p className="text-2xl font-bold mt-1">{stats?.totalExpenses || 0}</p></div>
        <div className="glass-card p-5"><p className="text-sm text-gray-500">Total Spending</p><p className="text-2xl font-bold mt-1">{formatCurrency(stats?.totalSpending || 0)}</p></div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Users</h2>
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs">{u.name?.charAt(0)}</div>
                <div><p className="text-sm font-medium">{u.name}</p><p className="text-xs text-gray-500">{u.email}</p></div>
              </div>
              <span className="text-xs text-gray-400">{formatDate(u.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPage;