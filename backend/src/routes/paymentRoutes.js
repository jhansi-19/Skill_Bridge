const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// ── Invoices & Payments List ──
router.get('/', paymentController.getPayments);
router.get('/invoices/:id', paymentController.getInvoiceById);

// ── Razorpay Gateway Endpoints ──
router.post('/razorpay/order', authorize('client', 'admin'), paymentController.createRazorpayOrder);
router.post('/razorpay/verify', authorize('client', 'admin'), paymentController.verifyAndTransferRazorpay);

// ── Work Deliverables & Revisions ──
router.post('/:projectId/deliverables', authorize('student', 'admin'), paymentController.submitDeliverable);
router.post('/:projectId/revisions', authorize('client', 'admin'), paymentController.requestRevision);

// ── Legacy Compatibility ──
router.post('/:projectId/approve', authorize('client', 'admin'), paymentController.approveDeliverable);
router.post('/:projectId/release', authorize('client', 'admin'), paymentController.releasePayment);
router.post('/:projectId/fund', authorize('client', 'admin'), paymentController.fundProject);
router.post('/:projectId/milestones/:milestoneId/fund', authorize('client', 'admin'), paymentController.fundMilestone);
router.post('/:projectId/complete', authorize('client', 'admin'), paymentController.completeProject);
router.post('/:projectId/milestones', authorize('client', 'admin'), paymentController.addMilestone);

module.exports = router;
