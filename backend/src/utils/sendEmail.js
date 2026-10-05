const nodemailer = require('nodemailer');
const logger = require('./logger');

const createTransporter = () => {
  if (!process.env.SMTP_USER) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  if (!transporter) {
    logger.warn(`Email not sent (SMTP not configured): ${subject} -> ${to}`);
    return { mock: true };
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'SkillBridge <noreply@skillbridge.com>',
    to,
    subject,
    html,
  });
  return { sent: true };
};

module.exports = sendEmail;
