const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ['fund', 'release', 'refund', 'milestone', 'razorpay', 'direct'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'mock_completed'],
      default: 'pending',
    },
    milestoneId: mongoose.Schema.Types.ObjectId,
    invoiceNumber: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    stripePaymentIntentId: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
