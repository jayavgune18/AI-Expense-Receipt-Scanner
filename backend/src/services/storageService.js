const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const logger = require('../utils/logger');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure upload directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir(UPLOAD_DIR);
ensureDir(path.join(UPLOAD_DIR, 'receipts'));
ensureDir(path.join(UPLOAD_DIR, 'thumbnails'));

const uploadReceipt = async (filePath, userId) => {
  try {
    const ext = path.extname(filePath);
    const filename = `${userId}-${Date.now()}${ext}`;
    const destPath = path.join(UPLOAD_DIR, 'receipts', filename);

    // Copy file to receipts directory
    fs.copyFileSync(filePath, destPath);

    // Generate thumbnail
    const thumbnailFilename = `thumb-${filename}`;
    const thumbnailPath = path.join(UPLOAD_DIR, 'thumbnails', thumbnailFilename);

    try {
      await sharp(filePath)
        .resize(300, 300, { fit: 'cover', position: 'centre' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
    } catch (sharpErr) {
      // If not an image (e.g. PDF), just copy as thumbnail
      fs.copyFileSync(filePath, thumbnailPath);
    }

    // Clean up original temp file if different from dest
    if (filePath !== destPath) {
      try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    }

    return {
      url: `/uploads/receipts/${filename}`,
      publicId: filename,
      thumbnailUrl: `/uploads/thumbnails/${thumbnailFilename}`,
      size: fs.statSync(destPath).size,
      format: ext.replace('.', ''),
    };
  } catch (error) {
    logger.error('Local upload error:', error);
    throw Object.assign(new Error('Failed to upload file'), { statusCode: 500 });
  }
};

const uploadFromBuffer = (buffer, userId) => {
  return new Promise((resolve, reject) => {
    try {
      const ext = '.jpg';
      const filename = `${userId}-${Date.now()}${ext}`;
      const destPath = path.join(UPLOAD_DIR, 'receipts', filename);

      fs.writeFileSync(destPath, buffer);

      const thumbnailFilename = `thumb-${filename}`;
      const thumbnailPath = path.join(UPLOAD_DIR, 'thumbnails', thumbnailFilename);

      sharp(buffer)
        .resize(300, 300, { fit: 'cover', position: 'centre' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath)
        .then(() => {
          resolve({
            url: `/uploads/receipts/${filename}`,
            publicId: filename,
            thumbnailUrl: `/uploads/thumbnails/${thumbnailFilename}`,
            size: buffer.length,
            format: 'jpg',
          });
        })
        .catch(() => {
          // Thumbnail failed, just use as is
          resolve({
            url: `/uploads/receipts/${filename}`,
            publicId: filename,
            thumbnailUrl: `/uploads/receipts/${filename}`,
            size: buffer.length,
            format: 'jpg',
          });
        });
    } catch (error) {
      logger.error('Local buffer upload error:', error);
      reject(Object.assign(new Error('Failed to upload file'), { statusCode: 500 }));
    }
  });
};

const deleteFile = async (publicId) => {
  try {
    const filePath = path.join(UPLOAD_DIR, 'receipts', publicId);
    const thumbPath = path.join(UPLOAD_DIR, 'thumbnails', `thumb-${publicId}`);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
  } catch (error) {
    logger.error('Local delete error:', error);
  }
};

const getFileUrl = (publicId, options = {}) => {
  return `/uploads/receipts/${publicId}`;
};

const createBackup = async (userId, files) => {
  try {
    const backupFolder = path.join(UPLOAD_DIR, 'backups', userId.toString(), Date.now().toString());
    ensureDir(backupFolder);

    const results = [];
    for (const file of files) {
      const sourcePath = path.join(UPLOAD_DIR, 'receipts', file.publicId || path.basename(file.url));
      if (fs.existsSync(sourcePath)) {
        const destPath = path.join(backupFolder, path.basename(sourcePath));
        fs.copyFileSync(sourcePath, destPath);
        results.push({
          url: `/uploads/backups/${userId}/${path.basename(backupFolder)}/${path.basename(destPath)}`,
          publicId: path.basename(destPath),
          size: fs.statSync(destPath).size,
        });
      }
    }

    return {
      folder: backupFolder,
      files: results,
      totalSize: results.reduce((sum, f) => sum + f.size, 0),
    };
  } catch (error) {
    logger.error('Backup error:', error);
    throw error;
  }
};

module.exports = {
  uploadReceipt,
  uploadFromBuffer,
  deleteFile,
  getFileUrl,
  createBackup,
};