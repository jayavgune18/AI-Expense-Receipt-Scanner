import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { User, Moon, Sun, DollarSign, Bell, Shield, LogOut } from 'lucide-react';
import { logout, updateProfile } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import toast from 'react-hot-toast';
import { CURRENCIES } from '../utils/constants';
import { authAPI } from '../api/auth';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const [saving, setSaving] = useState(false);

  const handleSave = async (field, value) => {
    setSaving(true);
    try {
      const updates = { preferences: { ...user?.preferences, [field]: value } };
      await authAPI.updateProfile(updates);
      dispatch(updateProfile(updates));
      toast.success('Settings updated');
    } catch (err) { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="glass-card p-6 space-y-6">
        <h2 className="text-lg font-semibold flex items-center gap-2"><User className="w-5 h-5" /> Profile</h2>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-lg">{user?.name?.charAt(0)}</div>
          <div><p className="font-medium">{user?.name}</p><p className="text-sm text-gray-500">{user?.email}</p></div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-6">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Sun className="w-5 h-5" /> Appearance</h2>
        <button onClick={() => dispatch(toggleTheme())} className="flex items-center justify-between w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-3">
            {mode === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span>Theme</span>
          </div>
          <span className="text-sm capitalize px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-600">{mode}</span>
        </button>
      </div>

      <div className="glass-card p-6 space-y-6">
        <h2 className="text-lg font-semibold flex items-center gap-2"><DollarSign className="w-5 h-5" /> Currency & Budget</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Currency</label>
            <select value={user?.preferences?.currency || 'USD'} onChange={(e) => handleSave('currency', e.target.value)} className="input-field">
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} - {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Monthly Budget</label>
            <input type="number" defaultValue={user?.preferences?.monthlyBudget || 0} onBlur={(e) => handleSave('monthlyBudget', parseFloat(e.target.value) || 0)} className="input-field" min="0" />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-6">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</h2>
        {['email', 'push', 'budgetAlerts'].map((key) => (
          <label key={key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 cursor-pointer">
            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <input type="checkbox" defaultChecked={user?.preferences?.notifications?.[key]} onChange={(e) => {
              const prefs = { ...user?.preferences?.notifications, [key]: e.target.checked };
              handleSave('notifications', prefs);
            }} className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500" />
          </label>
        ))}
      </div>

      <button onClick={() => dispatch(logout())} className="btn-danger w-full flex items-center justify-center gap-2"><LogOut className="w-4 h-4" /> Sign Out</button>
    </motion.div>
  );
};

export default SettingsPage;