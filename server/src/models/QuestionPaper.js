import mongoose from 'mongoose';

const questionPaperSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // null means standard public library paper
  },
  university: {
    type: String,
    required: true,
    index: true,
  },
  course: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
    index: true,
  },
  subject: {
    type: String,
    required: true,
    index: true,
  },
  year: {
    type: Number,
    required: true,
    index: true,
  },
  source: {
    type: String,
    default: 'Official University Archives',
  },
  fileUrl: {
    type: String,
    default: '',
  },
  isUserUploaded: {
    type: Boolean,
    default: false,
  },
  parsedQuestions: [{
    questionText: String,
    unit: String,
    marks: Number,
    frequencyCount: { type: Number, default: 1 },
    topics: [String],
  }],
}, {
  timestamps: true,
});

questionPaperSchema.index({ subject: 'text', university: 'text' });

export const QuestionPaper = mongoose.model('QuestionPaper', questionPaperSchema);
