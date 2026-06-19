import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Upload, History, CheckCircle, XCircle, Clock } from 'lucide-react';
import { backupAPI } from '../api/auth';
import toast from 'react-hot-toast';
import { formatDateTime } from '../utils/formatters';

const BackupPage = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backingUp, setBackingUp] = useState(false);

  useEffect(() => { loadBackups(); }, []);

  const loadBackups = async () => {
    try { const { data } = await backupAPI.getHistory(); setBackups(data.data.backups); }
    catch (err) { toast.error('Failed to load backups'); }
    finally { setLoading(false); }
  };

  const triggerBackup = async () => {
    setBackingUp(true);
    try {
      const { data } = await backupAPI.create();
      toast.success('Backup started!');
      setTimeout(loadBackups, 2000);
    } catch (err) { toast.error('Backup failed'); }
    finally { setBackingUp(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">Cloud Backup</h1>

      <div className="glass-card p-6 text-center">
        <Cloud className="w-16 h-16 mx-auto text-primary-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Secure Cloud Backup</h2>
        <p className="text-gray-500 mb-6">Back up your receipts and expense data to the cloud securely.</p>
        <button onClick={triggerBackup} disabled={backingUp} className="btn-primary">
          {backingUp ? <><Clock className="w-4 h-4 mr-2 animate-spin" /> Backing up...</> : <><Cloud className="w-4 h-4 mr-2" /> Start Backup</>}
        </button>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><History className="w-5 h-5" /> Backup History</h2>
        <div className="space-y-3">
          {backups.map((backup) => (
            <div key={backup._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                {backup.status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-500" /> : backup.status === 'failed' ? <XCircle className="w-5 h-5 text-red-500" /> : <Clock className="w-5 h-5 text-yellow-500 animate-spin" />}
                <div>
                  <p className="text-sm font-medium capitalize">{backup.type} Backup</p>
                  <p className="text-xs text-gray-500">{backup.fileCount || 0} files · {formatDateTime(backup.createdAt)}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${backup.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : backup.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{backup.status}</span>
            </div>
          ))}
          {!loading && backups.length === 0 && <p className="text-center text-gray-400 py-8">No backups yet</p>}
        </div>
      </div>
    </motion.div>
  );
};

export default BackupPage;