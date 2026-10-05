const mongoose = require('mongoose');

const packageTierSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 5 },
  deliveryDays: { type: Number, required: true, min: 1 },
  revisions: { type: Number, default: 2 },
  features: [{ type: String }],
});

const gigSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
      default: 'web-development',
    },
    description: { type: String, required: true },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
    },
    gallery: [{ type: String }],
    tags: [{ type: String, trim: true }],
    packages: {
      basic: { type: packageTierSchema, required: true },
      standard: { type: packageTierSchema, required: true },
      premium: { type: packageTierSchema, required: true },
    },
    ratings: {
      average: { type: Number, default: 5.0 },
      count: { type: Number, default: 0 },
    },
    ordersCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'paused', 'draft'],
      default: 'active',
    },
  },
  { timestamps: true }
);

gigSchema.index({ title: 'text', description: 'text', tags: 'text' });
gigSchema.index({ category: 1, 'ratings.average': -1, status: 1 });

module.exports = mongoose.model('Gig', gigSchema);
