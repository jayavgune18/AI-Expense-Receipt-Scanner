const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number'),
  handleValidationErrors,
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const receiptUploadValidation = [
  body('category').optional().isString(),
  handleValidationErrors,
];

const expenseValidation = [
  body('merchantName').trim().notEmpty().withMessage('Merchant name is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category').isIn([
    'Food & Dining', 'Transport', 'Shopping', 'Healthcare',
    'Education', 'Entertainment', 'Travel', 'Utilities', 'Others',
  ]).withMessage('Invalid category'),
  body('date').isISO8601().withMessage('Valid date required'),
  handleValidationErrors,
];

const profileUpdateValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('preferences').optional().isObject(),
  handleValidationErrors,
];

module.exports = {
  registerValidation,
  loginValidation,
  receiptUploadValidation,
  expenseValidation,
  profileUpdateValidation,
};