const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const { receiptUploadLimiter } = require('../middleware/rateLimiter');
const receiptController = require('../controllers/receiptController');

router.use(authenticate);

router.post('/upload', receiptUploadLimiter, upload.single('receipt'), handleMulterError, receiptController.uploadReceipt);
router.post('/upload-buffer', receiptUploadLimiter, upload.single('receipt'), handleMulterError, receiptController.uploadReceiptBuffer);
router.get('/', receiptController.getReceipts);
router.get('/stats', receiptController.getReceiptStats);
router.get('/:id', receiptController.getReceipt);
router.put('/:id', receiptController.updateReceipt);
router.delete('/:id', receiptController.deleteReceipt);
router.post('/:id/reprocess', receiptController.reprocessReceipt);
router.get('/:id/pdf', receiptController.downloadReceiptPdf);

module.exports = router;
