const Notification = require('../models/Notification');

const createNotification = async ({ userId, title, message, type = 'system', link, metadata, io }) => {
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
    link,
    metadata,
  });

  if (io) {
    io.to(`user:${userId}`).emit('notification', {
      _id: notification._id,
      title,
      message,
      type,
      link,
      read: false,
      createdAt: notification.createdAt,
    });
  }

  return notification;
};

module.exports = { createNotification };
