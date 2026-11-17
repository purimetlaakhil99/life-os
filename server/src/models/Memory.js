import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['preference', 'routine', 'relationship', 'personal_info', 'student_fact', 'idea', 'reference'],
    default: 'personal_info',
  },
  tags: [{ type: String }],
  source: {
    type: String,
    enum: ['manual', 'chat_extracted', 'universal_capture'],
    default: 'manual',
  },
  importance: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
  },
}, {
  timestamps: true,
});

memorySchema.index({ userId: 1, title: 'text', content: 'text', tags: 'text' });

export const Memory = mongoose.model('Memory', memorySchema);
