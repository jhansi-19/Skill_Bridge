const express = require('express');
const projectController = require('../controllers/projectController');
const bidController = require('../controllers/bidController');
const reviewController = require('../controllers/reviewController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const {
  createProjectValidation,
  bidValidation,
  reviewValidation,
  searchValidation,
} = require('../validations/projectValidation');

const router = express.Router();

router.get('/', searchValidation, validate, optionalAuth, projectController.getProjects);
router.get('/my/list', protect, authorize('client', 'admin'), projectController.getMyProjects);
router.get('/my/hired', protect, authorize('student', 'admin'), projectController.getMyHiredProjects);
router.post(
  '/',
  protect,
  authorize('client', 'admin'),
  createProjectValidation,
  validate,
  projectController.createProject
);
router.get('/:id', optionalAuth, projectController.getProject);
router.patch(
  '/:id',
  protect,
  authorize('client', 'admin'),
  projectController.updateProject
);
router.delete('/:id', protect, authorize('client', 'admin'), projectController.deleteProject);
router.post(
  '/:id/attachments',
  protect,
  authorize('client', 'admin'),
  upload.array('files', 5),
  projectController.uploadAttachments
);
router.post('/:id/publish', protect, authorize('client', 'admin'), projectController.publishProject);
router.post('/:id/hire', protect, authorize('client', 'admin'), projectController.hireFreelancer);

router.post(
  '/:projectId/bids',
  protect,
  authorize('student', 'admin'),
  bidValidation,
  validate,
  bidController.createBid
);
router.get('/:projectId/bids', protect, bidController.getProjectBids);

router.post(
  '/:projectId/reviews',
  protect,
  reviewValidation,
  validate,
  reviewController.createReview
);

module.exports = router;
