const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const projectRoutes = require('./projectRoutes');
const bidRoutes = require('./bidRoutes');
const gigRoutes = require('./gigRoutes');
const quizRoutes = require('./quizRoutes');
const disputeRoutes = require('./disputeRoutes');
const messageRoutes = require('./messageRoutes');
const notificationRoutes = require('./notificationRoutes');
const paymentRoutes = require('./paymentRoutes');
const adminRoutes = require('./adminRoutes');
const reportRoutes = require('./reportRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/bids', bidRoutes);
router.use('/gigs', gigRoutes);
router.use('/quizzes', quizRoutes);
router.use('/disputes', disputeRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRoutes);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'SkillBridge API is running with all advanced marketplace features' });
});

module.exports = router;

