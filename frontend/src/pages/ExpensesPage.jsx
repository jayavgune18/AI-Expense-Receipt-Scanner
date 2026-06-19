import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Trash2, Edit2 } from 'lucide-react';
import { expenseAPI } from '../api/auth';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate, getCategoryColor } from '../utils/formatters';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', sort: '-date' });

  useEffect(() => { loadExpenses(); }, [search, filters]);

  const loadExpenses = async () => {
    try {
      const { data } = await expenseAPI.getAll({ search, ...filters, limit: 50 });
      setExpenses(data.data.expenses);
    } catch (err) { toast.error('Failed to load expenses'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try { await expenseAPI.delete(id); toast.success('Expense deleted'); loadExpenses(); }
    catch (err) { toast.error('Delete failed'); }
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Expenses</h1><p className="text-sm text-gray-500 mt-1">{expenses.length} transactions · {formatCurrency(total)} total</p></div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="input-field pl-9 py-2 text-sm w-full sm:w-64" /></div>
          <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})} className="input-field py-2 text-sm w-32"><option value="">All</option><option value="Food & Dining">Food</option><option value="Transport">Transport</option><option value="Shopping">Shopping</option></select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-left p-4 font-medium">Merchant</th>
                <th className="text-left p-4 font-medium">Category</th>
                <th className="text-right p-4 font-medium">Amount</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, i) => (
                <tr key={expense._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="p-4 text-gray-500">{formatDate(expense.date)}</td>
                  <td className="p-4 font-medium">{expense.merchantName}</td>
                  <td className="p-4"><span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: getCategoryColor(expense.category) + '20', color: getCategoryColor(expense.category) }}>{expense.category}</span></td>
                  <td className="p-4 text-right font-semibold">{formatCurrency(expense.amount)}</td>
                  <td className="p-4 text-right"><button onClick={() => handleDelete(expense._id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
              {!loading && expenses.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">No expenses found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default ExpensesPage;