const Backup = require('../models/Backup');
const Receipt = require('../models/Receipt');
const storageService = require('../services/storageService');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

const createBackup = async (req, res, next) => {
  try {
    const backup = await Backup.create({
      userId: req.user._id,
      type: req.body.type || 'manual',
      status: 'in_progress',
    });

    res.json({ success: true, data: { backup, message: 'Backup started' } });

    // Process backup in background
    processBackup(backup, req.user._id).catch((err) => logger.error('Backup error:', err));
  } catch (error) {
    next(error);
  }
};

const processBackup = async (backup, userId) => {
  try {
    const receipts = await Receipt.find({ userId }).lean();
    const backupResult = await storageService.createBackup(userId, receipts);

    backup.fileCount = receipts.length;
    backup.totalSize = backupResult.totalSize;
    backup.backupUrl = backupResult.folder;
    backup.status = 'completed';
    backup.completedAt = new Date();
    backup.metadata = { files: backupResult.files };
    await backup.save();

    await Notification.create({
      userId,
      type: 'backup_complete',
      title: 'Backup Complete',
      message: `Successfully backed up ${receipts.length} receipts.`,
      data: { backupId: backup._id },
    });
  } catch (error) {
    logger.error('Backup processing error:', error);
    backup.status = 'failed';
    backup.errorMessage = error.message;
    await backup.save();
  }
};

const getBackupHistory = async (req, res, next) => {
  try {
    const backups = await Backup.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json({ success: true, data: { backups } });
  } catch (error) {
    next(error);
  }
};

const getLatestBackup = async (req, res, next) => {
  try {
    const backup = await Backup.findOne({ userId: req.user._id, status: 'completed' })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: { backup } });
  } catch (error) {
    next(error);
  }
};

const deleteBackup = async (req, res, next) => {
  try {
    const backup = await Backup.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!backup) return res.status(404).json({ success: false, message: 'Backup not found' });
    res.json({ success: true, message: 'Backup deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBackup, getBackupHistory, getLatestBackup, deleteBackup };