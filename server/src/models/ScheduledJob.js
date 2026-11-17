import mongoose from 'mongoose';

const scheduledJobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  jobType: {
    type: String,
    enum: ['birthday_email', 'task_reminder', 'class_reminder', 'event_reminder', 'daily_briefing', 'bill_reminder'],
    required: true,
    index: true,
  },
  scheduledFor: {
    type: Date,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  idempotencyKey: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  attempts: {
    type: Number,
    default: 0,
  },
  maxAttempts: {
    type: Number,
    default: 3,
  },
  lastError: {
    type: String,
    default: null,
  },
  lockedAt: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

export const ScheduledJob = mongoose.model('ScheduledJob', scheduledJobSchema);
