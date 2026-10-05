const express = require('express');
const disputeController = require('../controllers/disputeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', disputeController.createDispute);
router.get('/', disputeController.getDisputes);
router.get('/:id', disputeController.getDisputeById);
router.post('/:id/resolve', authorize('admin'), disputeController.resolveDispute);

module.exports = router;
