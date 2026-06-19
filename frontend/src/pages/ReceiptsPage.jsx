import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Search, Filter, Trash2, Eye, RefreshCw, Camera, Download } from 'lucide-react';
import { receiptAPI } from '../api/auth';
import toast from 'react-hot-toast';
import { RECEIPT_STATUS } from '../utils/constants';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

const ReceiptsPage = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [preview, setPreview] = useState(null);

  const loadReceipts = useCallback(async (page = 1) => {
    try {
      const { data } = await receiptAPI.getAll({ page, limit: 20, search });
      setReceipts(data.data.receipts);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { loadReceipts(); }, [loadReceipts]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      const { data } = await receiptAPI.upload(formData);
      toast.success('Receipt uploaded! Processing...');
      loadReceipts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this receipt?')) return;
    try {
      await receiptAPI.delete(id);
      toast.success('Receipt deleted');
      loadReceipts();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleDownloadPdf = async (id, merchantName) => {
    try {
      const response = await receiptAPI.downloadPdf(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${merchantName || id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error('Failed to download PDF');
    }
  };

  const handleReprocess = async (id) => {
    try {
      await receiptAPI.reprocess(id);
      toast.success('Reprocessing started');
    } catch (err) {
      toast.error('Failed to reprocess');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Receipts</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search receipts..." className="input-field pl-9 py-2 text-sm w-full sm:w-64" />
          </div>
          <label className="btn-primary cursor-pointer">
            <Camera className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload'}
            <input type="file" accept="image/*,.pdf" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {receipts.map((receipt, i) => (
          <motion.div key={receipt._id} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }} className="glass-card-hover overflow-hidden">
            <div className="relative h-40 bg-gray-100 dark:bg-gray-800 cursor-pointer" onClick={() => setPreview(receipt)}>
              {receipt.thumbnailUrl ? (
                <img src={receipt.thumbnailUrl} alt="Receipt" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400"><Camera className="w-12 h-12" /></div>
              )}
              <span className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium ${RECEIPT_STATUS[receipt.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                {receipt.status}
              </span>
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-semibold truncate">{receipt.extractedData?.merchantName || 'Unknown Merchant'}</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{formatDate(receipt.extractedData?.date)}</span>
                <span className="font-bold">{formatCurrency(receipt.extractedData?.totalAmount)}</span>
              </div>
              {receipt.aiClassification?.category && (
                <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                  {receipt.aiClassification.category}
                </span>
              )}
              <div className="flex gap-2 pt-2">
                <button onClick={() => setPreview(receipt)} className="btn-secondary text-xs py-1.5 px-3"><Eye className="w-3 h-3 mr-1" /> View</button>
                {receipt.status === 'failed' && (
                  <button onClick={() => handleReprocess(receipt._id)} className="btn-secondary text-xs py-1.5 px-3"><RefreshCw className="w-3 h-3 mr-1" /> Retry</button>
                )}
                <button onClick={() => handleDownloadPdf(receipt._id, receipt.extractedData?.merchantName)} className="btn-secondary text-xs py-1.5 px-3"><Download className="w-3 h-3 mr-1" /> PDF</button>
                <button onClick={() => handleDelete(receipt._id)} className="btn-danger text-xs py-1.5 px-3"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          </motion.div>
        ))}
        {!loading && receipts.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No receipts yet</p>
            <p className="text-sm mt-1">Upload your first receipt to get started</p>
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }).map((_, i) => (
            <button key={i} onClick={() => loadReceipts(i + 1)} className={`px-3 py-1.5 rounded-lg text-sm ${pagination.page === i + 1 ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="glass-card max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <img src={preview.imageUrl} alt="Receipt" className="w-full rounded-xl mb-4 max-h-64 object-contain bg-gray-100" />
            <div className="space-y-2 text-sm">
              <p><strong>Merchant:</strong> {preview.extractedData?.merchantName || 'N/A'}</p>
              <p><strong>Date:</strong> {formatDate(preview.extractedData?.date)}</p>
              <p><strong>Amount:</strong> {formatCurrency(preview.extractedData?.totalAmount)}</p>
              <p><strong>Category:</strong> {preview.aiClassification?.category || 'N/A'}</p>
              <p><strong>Status:</strong> {preview.status}</p>
              <p><strong>Processed:</strong> {formatDateTime(preview.processedAt)}</p>
            </div>
            <button onClick={() => setPreview(null)} className="btn-secondary w-full mt-4">Close</button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ReceiptsPage;