import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['goal', 'habit', 'routine', 'dsa_tracker', 'focus_session'],
    default: 'goal',
  },
  category: {
    type: String,
    enum: ['personal', 'academic', 'career', 'health', 'coding'],
    default: 'personal',
  },
  targetMetric: {
    current: { type: Number, default: 0 },
    target: { type: Number, default: 100 },
    unit: { type: String, default: '%' },
  },
  habitFrequency: {
    type: String,
    enum: ['daily', 'weekdays', 'weekly'],
    default: 'daily',
  },
  streak: {
    type: Number,
    default: 0,
  },
  lastCompletedDate: {
    type: String, // YYYY-MM-DD
    default: null,
  },
  history: [{
    date: String,
    completed: Boolean,
    note: String,
  }],
}, {
  timestamps: true,
});

export const Goal = mongoose.model('Goal', goalSchema);
