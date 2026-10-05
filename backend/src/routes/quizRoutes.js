const express = require('express');
const quizController = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', quizController.getQuizzes);
router.get('/:topic', quizController.getQuizByTopic);

router.use(protect);
router.post('/:topic/submit', quizController.submitQuiz);

module.exports = router;
