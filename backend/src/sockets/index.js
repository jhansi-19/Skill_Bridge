const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { createNotification } = require('../services/notificationService');

const onlineUsers = new Map();

const socketAuth = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) return next(new Error('Authentication required'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.isBanned) return next(new Error('Unauthorized'));

    socket.user = user;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
};

const initializeSockets = (io) => {
  io.use(socketAuth);

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);

    User.findByIdAndUpdate(userId, { lastActive: new Date() }).exec();

    io.emit('user-online', { userId, online: true });

    socket.on('join-conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('send-message', async (data) => {
      try {
        const { conversationId, content, attachments = [] } = data;
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;
        if (!conversation.participants.some((p) => p.toString() === userId)) return;

        const receiverId = conversation.participants.find((p) => p.toString() !== userId);

        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          receiver: receiverId,
          content: content || '',
          attachments,
        });

        conversation.lastMessage = message._id;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        await message.populate('sender', 'name avatar');

        io.to(`conversation:${conversationId}`).emit('receive-message', message);
        io.to(`user:${receiverId}`).emit('receive-message', message);

        await createNotification({
          userId: receiverId,
          title: 'New Message',
          message: `${socket.user.name} sent you a message`,
          type: 'message',
          link: '/messages',
          io,
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', ({ conversationId, recipientId }) => {
      io.to(`user:${recipientId}`).emit('typing', {
        conversationId,
        userId,
        name: socket.user.name,
      });
    });

    socket.on('stop-typing', ({ conversationId, recipientId }) => {
      io.to(`user:${recipientId}`).emit('stop-typing', { conversationId, userId });
    });

    socket.on('mark-read', async ({ conversationId }) => {
      await Message.updateMany(
        { conversation: conversationId, receiver: userId, read: false },
        { read: true, readAt: new Date() }
      );
      socket.to(`conversation:${conversationId}`).emit('messages-read', { userId, conversationId });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('user-online', { userId, online: false });
    });
  });
};

module.exports = { initializeSockets, onlineUsers };
