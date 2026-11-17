import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['reminder', 'birthday', 'academic', 'system', 'briefing'],
    default: 'system',
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  actionUrl: {
    type: String,
    default: null,
  },
  snoozedUntil: {
    type: Date,
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

export const Notification = mongoose.model('Notification', notificationSchema);
