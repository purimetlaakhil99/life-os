import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly', 'one_time'],
    default: 'monthly',
  },
  nextBillingDate: {
    type: Date,
    required: true,
    index: true,
  },
  category: {
    type: String,
    enum: ['entertainment', 'software', 'education', 'utilities', 'other'],
    default: 'software',
  },
  reminderDaysBefore: {
    type: Number,
    default: 3,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
