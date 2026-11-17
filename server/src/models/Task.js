import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
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
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  dueDate: {
    type: Date,
    default: null,
  },
  reminderTime: {
    type: Date,
    default: null,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurrenceRule: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom', 'none'],
    default: 'none',
  },
  category: {
    type: String,
    enum: ['personal', 'academic', 'career', 'health', 'finance', 'routine'],
    default: 'personal',
  },
  tags: [{ type: String }],
  completedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

export const Task = mongoose.model('Task', taskSchema);
