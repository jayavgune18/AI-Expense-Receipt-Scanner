import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Trash2, Calendar } from 'lucide-react';
import { reportAPI } from '../api/auth';
import toast from 'react-hot-toast';
import { formatDate, formatDateTime } from '../utils/formatters';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [type, setType] = useState('monthly');
  const [format, setFormat] = useState('pdf');

  useEffect(() => { loadReports(); }, []);

  const loadReports = async () => {
    try { const { data } = await reportAPI.getAll(); setReports(data.data.reports); }
    catch (err) { toast.error('Failed to load reports'); }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const response = await reportAPI.generate({ type, format });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expense-report-${type}-${Date.now()}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report generated!');
      loadReports();
    } catch (err) { toast.error('Failed to generate report'); }
    finally { setGenerating(false); }
  };

  const deleteReport = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try { await reportAPI.delete(id); toast.success('Report deleted'); loadReports(); }
    catch (err) { toast.error('Delete failed'); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Generate Report</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1.5">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="input-field py-2">
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className="input-field py-2">
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
          </div>
          <button onClick={generateReport} disabled={generating} className="btn-primary">
            {generating ? 'Generating...' : <><Download className="w-4 h-4 mr-2" /> Generate Report</>}
          </button>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Report History</h2>
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-950"><FileText className="w-5 h-5 text-primary-500" /></div>
                <div>
                  <p className="font-medium text-sm capitalize">{report.type} Report</p>
                  <p className="text-xs text-gray-500">{formatDate(report.dateRange?.start)} - {formatDate(report.dateRange?.end)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700">{report.format}</span>
                <span className="text-xs text-gray-400">{formatDateTime(report.createdAt)}</span>
                <button onClick={() => deleteReport(report._id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {reports.length === 0 && <p className="text-center text-gray-400 py-8">No reports generated yet</p>}
        </div>
      </div>
    </motion.div>
  );
};

export default ReportsPage;