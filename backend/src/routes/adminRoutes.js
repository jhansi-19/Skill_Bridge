const express = require('express');
const adminController = require('../controllers/adminController');
const reviewController = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/analytics', adminController.getAnalytics);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/ban', adminController.banUser);
router.get('/reports', adminController.getReports);
router.patch('/reports/:id', adminController.updateReport);
router.get('/reviews', adminController.getReviewsForModeration);
router.patch('/reviews/:id', reviewController.moderateReview);

module.exports = router;
