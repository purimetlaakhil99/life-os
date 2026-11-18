import mongoose from 'mongoose';

const digitalFileSchema = new mongoose.Schema({
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
  originalName: {
    type: String,
    required: true,
  },
  storedPath: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  sizeBytes: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ['personal_reference', 'study_material', 'question_paper', 'resume', 'travel', 'receipt'],
    default: 'personal_reference',
  },
  subject: {
    type: String,
    default: '',
  },
  extractedText: {
    type: String,
    default: '',
  },
  tags: [{ type: String }],
}, {
  timestamps: true,
});

digitalFileSchema.index({ userId: 1, title: 'text', extractedText: 'text', tags: 'text' });

export const DigitalFile = mongoose.model('DigitalFile', digitalFileSchema);
