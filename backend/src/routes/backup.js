const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const backupController = require('../controllers/backupController');

router.use(authenticate);

router.post('/', backupController.createBackup);
router.get('/', backupController.getBackupHistory);
router.get('/latest', backupController.getLatestBackup);
router.delete('/:id', backupController.deleteBackup);

module.exports = router;