const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    milestoneId: { type: mongoose.Schema.Types.ObjectId },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: {
      type: String,
      enum: [
        'poor_quality',
        'missed_deadline',
        'unresponsive',
        'scope_creep',
        'non_payment',
        'other',
      ],
      required: true,
    },
    description: { type: String, required: true },
    amountInDispute: { type: Number, required: true },
    evidence: [{ filename: String, url: String }],
    status: {
      type: String,
      enum: [
        'open',
        'under_investigation',
        'resolved_refund_client',
        'resolved_release_freelancer',
        'closed',
      ],
      default: 'open',
    },
    adminDecision: String,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dispute', disputeSchema);
