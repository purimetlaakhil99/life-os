import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
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
  description: {
    type: String,
    default: '',
  },
  startTime: {
    type: Date,
    required: true,
    index: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  allDay: {
    type: Boolean,
    default: false,
  },
  location: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['class', 'exam', 'personal', 'meeting', 'routine', 'focus_session'],
    default: 'personal',
  },
  recurrence: {
    type: String,
    default: 'none',
  },
  googleEventId: {
    type: String,
    default: null,
  },
  syncStatus: {
    type: String,
    enum: ['local', 'synced'],
    default: 'local',
  },
}, {
  timestamps: true,
});

export const Event = mongoose.model('Event', eventSchema);
