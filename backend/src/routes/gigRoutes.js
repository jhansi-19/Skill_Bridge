const express = require('express');
const gigController = require('../controllers/gigController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', gigController.getGigs);
router.get('/:id', gigController.getGigById);

router.use(protect);

router.post('/', authorize('student', 'admin'), gigController.createGig);
router.put('/:id', gigController.updateGig);
router.delete('/:id', gigController.deleteGig);
router.post('/:id/order', authorize('client', 'admin'), gigController.orderGig);

module.exports = router;
