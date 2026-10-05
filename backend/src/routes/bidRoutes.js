const express = require('express');
const bidController = require('../controllers/bidController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/my', protect, authorize('student', 'admin'), bidController.getMyBids);
router.patch('/:id/status', protect, authorize('client', 'admin'), bidController.updateBidStatus);
router.delete('/:id', protect, authorize('student', 'admin'), bidController.withdrawBid);

module.exports = router;
