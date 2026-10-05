const express = require('express');
const userController = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/freelancers', optionalAuth, userController.searchFreelancers);
router.get('/dashboard/stats', protect, userController.getDashboardStats);
router.get('/:id/reviews', userController.getUserReviews);
router.get('/:id', userController.getProfile);
router.patch('/profile', protect, userController.updateProfile);
router.post('/avatar', protect, upload.single('avatar'), userController.uploadAvatar);
router.post('/resume', protect, upload.single('resume'), userController.uploadResume);

module.exports = router;
