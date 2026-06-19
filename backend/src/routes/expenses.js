const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const expenseController = require('../controllers/expenseController');

router.use(authenticate);

router.get('/', expenseController.getExpenses);
router.get('/stats', expenseController.getExpenseStats);
router.get('/:id', expenseController.getExpense);
router.post('/', expenseController.createExpense);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;