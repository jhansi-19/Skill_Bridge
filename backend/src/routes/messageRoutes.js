const express = require('express');
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.get('/conversations', messageController.getConversations);
router.post('/conversations', messageController.getOrCreateConversation);
router.get('/:conversationId', messageController.getMessages);
router.post(
  '/:conversationId',
  upload.array('files', 3),
  messageController.sendMessage
);

module.exports = router;
