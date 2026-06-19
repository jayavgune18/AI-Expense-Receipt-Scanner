const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const insightController = require('../controllers/insightController');

router.use(authenticate);

router.get('/', insightController.getInsights);
router.get('/spending-habits', insightController.getSpendingHabits);
router.get('/budget-suggestions', insightController.getBudgetSuggestions);
router.get('/anomalies', insightController.getAnomalies);
router.get('/savings', insightController.getSavingsRecommendations);
router.post('/chat', insightController.chatWithAI);
router.get('/chat/history', insightController.getChatHistory);

module.exports = router;