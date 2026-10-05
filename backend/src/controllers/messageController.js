const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const { findOrCreateConversation } = require('../services/conversationService');
const { parseObjectId } = require('../utils/objectId');

exports.getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate('participants', 'name avatar username lastActive')
    .populate('lastMessage')
    .populate('project', 'title')
    .sort('-lastMessageAt');
  res.json({ success: true, conversations });
});

exports.getOrCreateConversation = asyncHandler(async (req, res) => {
  const recipientId = parseObjectId(req.body.recipientId, 'recipient ID');
  const projectId = req.body.projectId
    ? parseObjectId(req.body.projectId, 'project ID')
    : null;

  if (recipientId === req.user._id.toString()) {
    throw new ApiError(400, 'Cannot message yourself');
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) throw new ApiError(404, 'Recipient not found');

  const conversation = await findOrCreateConversation(
    req.user._id,
    recipientId,
    projectId
  );

  await conversation.populate([
    { path: 'participants', select: 'name avatar username' },
    { path: 'project', select: 'title' },
  ]);
  res.json({ success: true, conversation });
});

exports.getMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.conversationId);
  if (!conversation) throw new ApiError(404, 'Conversation not found');
  if (!conversation.participants.some((p) => p.toString() === req.user._id.toString())) {
    throw new ApiError(403, 'Not authorized');
  }

  const { page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const messages = await Message.find({ conversation: conversation._id })
    .populate('sender', 'name avatar')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  await Message.updateMany(
    {
      conversation: conversation._id,
      receiver: req.user._id,
      read: false,
    },
    { read: true, readAt: new Date() }
  );

  res.json({ success: true, messages: messages.reverse() });
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.conversationId);
  if (!conversation) throw new ApiError(404, 'Conversation not found');
  if (!conversation.participants.some((p) => p.toString() === req.user._id.toString())) {
    throw new ApiError(403, 'Not authorized');
  }

  const receiverId = conversation.participants.find(
    (p) => p.toString() !== req.user._id.toString()
  );

  let attachments = [];
  if (req.files?.length) {
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, 'chat');
      attachments.push({
        url: result.url,
        publicId: result.publicId,
        filename: file.originalname,
        mimetype: file.mimetype,
      });
    }
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    receiver: receiverId,
    content: req.body.content || '',
    attachments,
  });

  conversation.lastMessage = message._id;
  conversation.lastMessageAt = new Date();
  await conversation.save();

  await message.populate('sender', 'name avatar');

  const io = req.app.get('io');
  if (io) {
    io.to(`user:${receiverId}`).emit('receive-message', message);
    io.to(`conversation:${conversation._id}`).emit('receive-message', message);
  }

  res.status(201).json({ success: true, message });
});
