const { body, query } = require('express-validator');

const createProjectValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('budget').isFloat({ min: 0 }).withMessage('Valid budget is required'),
  body('category').optional().isString(),
  body('skillsRequired').optional().isArray(),
  body('deadline').optional().isISO8601(),
];

const bidValidation = [
  body('amount').isFloat({ min: 0 }).withMessage('Valid bid amount is required'),
  body('proposal').trim().notEmpty().withMessage('Proposal is required'),
  body('estimatedDelivery').isInt({ min: 1 }).withMessage('Estimated delivery days required'),
];

const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('comment').optional().trim(),
  body('type').isIn(['freelancer', 'client']).withMessage('Review type required'),
];

const searchValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
];

module.exports = {
  createProjectValidation,
  bidValidation,
  reviewValidation,
  searchValidation,
};
