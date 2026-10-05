const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  url: String,
  publicId: String,
  filename: String,
  mimetype: String,
});

const deliverableSchema = new mongoose.Schema({
  notes: { type: String, required: true },
  attachments: [{ filename: String, url: String }],
  submittedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['submitted', 'revision_requested', 'approved'],
    default: 'submitted',
  },
  revisionComment: String,
  reviewedAt: Date,
});

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'funded', 'in_progress', 'submitted', 'revision_requested', 'completed', 'released'],
    default: 'pending',
  },
  dueDate: Date,
  deliverables: [deliverableSchema],
});

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: [
        'web-development',
        'mobile-development',
        'design',
        'writing',
        'marketing',
        'data-science',
        'video-editing',
        'other',
      ],
      default: 'other',
    },
    skillsRequired: [{ type: String, trim: true }],
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hiredFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['draft', 'open', 'in_progress', 'completed', 'cancelled', 'closed'],
      default: 'draft',
    },
    deadline: Date,
    attachments: [attachmentSchema],
    deliverables: [deliverableSchema],
    milestones: [milestoneSchema],
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    },
    paidAt: Date,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    escrow: {
      totalAmount: { type: Number, default: 0 },
      fundedAmount: { type: Number, default: 0 },
      releasedAmount: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ['unfunded', 'partial', 'funded', 'released'],
        default: 'unfunded',
      },
    },
    projectType: { type: String, enum: ['fixed', 'hourly'], default: 'fixed' },
  },
  { timestamps: true }
);

projectSchema.index({ title: 'text', description: 'text' });
projectSchema.index({ status: 1, category: 1, budget: 1 });

module.exports = mongoose.model('Project', projectSchema);
