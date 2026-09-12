import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import {
  User, Moon, Sun, DollarSign, Bell, Shield, LogOut,
  Globe, Calendar, Layout, Tag, AlertTriangle, Download,
  Trash2, ChevronDown, ChevronUp, Eye, EyeOff, Save,
  Edit3, X, Check, Key
} from 'lucide-react';
import { logout, updateProfile } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import toast from 'react-hot-toast';
import { CURRENCIES, LANGUAGES, DATE_FORMATS, WEEK_START_DAYS, DISPLAY_DENSITIES, CATEGORIES } from '../utils/constants';
import { authAPI, backupAPI } from '../api/auth';

const SettingSection = ({ title, icon, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-6 pb-6 space-y-5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const [saving, setSaving] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || '');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const prefs = user?.preferences || {};

  const handleSave = async (field, value) => {
    setSaving(true);
    try {
      const updates = { preferences: { ...prefs, [field]: value } };
      await authAPI.updateProfile(updates);
      dispatch(updateProfile(updates));
      toast.success('Settings updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveName = async () => {
    if (!nameValue.trim() || nameValue.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    setSaving(true);
    try {
      await authAPI.updateProfile({ name: nameValue.trim() });
      dispatch(updateProfile({ name: nameValue.trim() }));
      toast.success('Name updated');
      setEditingName(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const notificationPrefs = prefs.notifications || {};

  const settingRowClass = 'flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        {saving && (
          <span className="text-sm text-gray-500 animate-pulse">Saving...</span>
        )}
      </div>

      {/* Profile Section */}
      <SettingSection title="Profile" icon={<User className="w-5 h-5" />} defaultOpen={true}>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className="input-field flex-1"
                  autoFocus
                  minLength={2}
                  maxLength={50}
                />
                <button
                  onClick={handleSaveName}
                  className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                  disabled={saving}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setEditingName(false); setNameValue(user?.name || ''); }}
                  className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={() => { setEditingName(true); setNameValue(user?.name || ''); }}
                  className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ml-auto"
                  title="Edit name"
                >
                  <Edit3 className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Member Since</label>
            <input
              type="text"
              value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              disabled
            />
          </div>
        </div>
      </SettingSection>

      {/* Appearance Section */}
      <SettingSection title="Appearance" icon={<Sun className="w-5 h-5" />} defaultOpen={true}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Theme</label>
            <button
              onClick={() => dispatch(toggleTheme())}
              className="flex items-center justify-between w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                {mode === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <span>Theme</span>
              </div>
              <span className="text-sm capitalize px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-600">
                {mode}
              </span>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Display Density</label>
            <select
              value={prefs.displayDensity || 'comfortable'}
              onChange={(e) => handleSave('displayDensity', e.target.value)}
              className="input-field"
            >
              {DISPLAY_DENSITIES.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>
      </SettingSection>

      {/* Language & Region Section */}
      <SettingSection title="Language & Region" icon={<Globe className="w-5 h-5" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Language</label>
            <select
              value={prefs.language || 'en'}
              onChange={(e) => handleSave('language', e.target.value)}
              className="input-field"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Date Format</label>
            <select
              value={prefs.dateFormat || 'MM/DD/YYYY'}
              onChange={(e) => handleSave('dateFormat', e.target.value)}
              className="input-field"
            >
              {DATE_FORMATS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Currency</label>
            <select
              value={prefs.currency || 'USD'}
              onChange={(e) => handleSave('currency', e.target.value)}
              className="input-field"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.symbol} - {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Week Starts On</label>
            <select
              value={prefs.weekStartDay || 'monday'}
              onChange={(e) => handleSave('weekStartDay', e.target.value)}
              className="input-field"
            >
              {WEEK_START_DAYS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>
      </SettingSection>

      {/* Budget & Defaults Section */}
      <SettingSection title="Budget & Defaults" icon={<DollarSign className="w-5 h-5" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Monthly Budget</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                {CURRENCIES.find((c) => c.code === prefs.currency)?.symbol || '$'}
              </span>
              <input
                type="number"
                defaultValue={prefs.monthlyBudget || 0}
                onBlur={(e) => handleSave('monthlyBudget', parseFloat(e.target.value) || 0)}
                className="input-field pl-8"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Budget Alert Threshold (%
              <span className="text-gray-500"> = {prefs.budgetAlertThreshold || 80}%</span>)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={prefs.budgetAlertThreshold || 80}
                onChange={(e) => handleSave('budgetAlertThreshold', parseInt(e.target.value))}
                className="flex-1 accent-primary-500"
              />
              <span className="text-sm font-medium w-10 text-center">{prefs.budgetAlertThreshold || 80}%</span>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Default Category</label>
          <select
            value={prefs.defaultCategory || 'others'}
            onChange={(e) => handleSave('defaultCategory', e.target.value)}
            className="input-field"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            New expenses will default to this category
          </p>
        </div>
      </SettingSection>

      {/* Notifications Section */}
      <SettingSection title="Notifications" icon={<Bell className="w-5 h-5" />}>
        {['email', 'push', 'budgetAlerts'].map((key) => (
          <label key={key} className={settingRowClass + ' cursor-pointer'}>
            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <div className="flex items-center gap-3">
              <span className={`text-xs ${notificationPrefs[key] ? 'text-green-500' : 'text-gray-400'}`}>
                {notificationPrefs[key] ? 'On' : 'Off'}
              </span>
              <input
                type="checkbox"
                defaultChecked={notificationPrefs[key]}
                onChange={(e) => {
                  const updated = { ...notificationPrefs, [key]: e.target.checked };
                  handleSave('notifications', updated);
                }}
                className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500"
              />
            </div>
          </label>
        ))}
      </SettingSection>

      {/* Security Section */}
      <SettingSection title="Security" icon={<Shield className="w-5 h-5" />}>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Key className="w-4 h-4" /> Change Password
          </h3>
          {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1.5 capitalize">
                {field.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <div className="relative">
                <input
                  type={showPasswords[field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm'] ? 'text' : 'password'}
                  value={passwordForm[field]}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }))}
                  className="input-field pr-10"
                  required
                  minLength={8}
                  placeholder={
                    field === 'currentPassword' ? 'Enter current password' :
                    field === 'newPassword' ? 'Enter new password (min 8 chars)' :
                    'Confirm new password'
                  }
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility(
                    field === 'currentPassword' ? 'current' :
                    field === 'newPassword' ? 'new' : 'confirm'
                  )}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords[field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm']
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>
          ))}
          <button
            type="submit"
            disabled={changingPassword}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {changingPassword ? (
              <span className="animate-pulse">Changing...</span>
            ) : (
              <>
                <Key className="w-4 h-4" /> Change Password
              </>
            )}
          </button>
        </form>
      </SettingSection>

      {/* Data & Privacy Section */}
      <SettingSection title="Data & Privacy" icon={<Download className="w-5 h-5" />}>
        <div className="space-y-4">
          <div className={settingRowClass}>
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium">Export Your Data</p>
                <p className="text-sm text-gray-500">Download all your receipts and expenses</p>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  await backupAPI.create();
                  toast.success('Export started. Check the backup page.');
                } catch (err) {
                  toast.error('Export failed. Please try again.');
                }
              }}
              className="btn-secondary text-sm px-4 py-2"
            >
              Export
            </button>
          </div>

          <div className={settingRowClass}>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
              </div>
            </div>
            <button
              onClick={() => {
                const confirmed = window.confirm(
                  'Are you sure you want to delete your account? This action is irreversible and will delete all your data permanently.'
                );
                if (confirmed) {
                  toast.error('Account deletion not implemented yet. Contact support.');
                }
              }}
              className="text-sm px-4 py-2 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </SettingSection>

      {/* Sign Out */}
      <button
        onClick={() => dispatch(logout())}
        className="btn-danger w-full flex items-center justify-center gap-2 py-3"
      >
        <LogOut className="w-4 h-4" /> Sign Out
      </button>
    </motion.div>
  );
};

export default SettingsPage;