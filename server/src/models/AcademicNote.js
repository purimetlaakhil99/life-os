import mongoose from 'mongoose';

const academicNoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  topic: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  unit: {
    type: String,
    default: '',
  },
  university: {
    type: String,
    default: '',
  },
  semester: {
    type: Number,
    default: null,
  },
  style: {
    type: String,
    enum: ['short', 'detailed', 'exam_oriented', 'beginner_friendly', 'revision'],
    default: 'exam_oriented',
  },
  sections: {
    introduction: { type: String, default: '' },
    definitions: [{ type: String }],
    detailedExplanations: { type: String, default: '' },
    importantConcepts: [{ type: String }],
    examples: [{ type: String }],
    diagramsDescription: { type: String, default: '' },
    comparisonsTables: { type: String, default: '' },
    advantagesDisadvantages: { type: String, default: '' },
    applications: [{ type: String }],
    examImportantPoints: [{ type: String }],
    shortRevisionNotes: { type: String, default: '' },
    longAnswerExamPrep: { type: String, default: '' },
  },
  tags: [{ type: String }],
  isBookmarked: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

academicNoteSchema.index({ subject: 'text', topic: 'text' });

export const AcademicNote = mongoose.model('AcademicNote', academicNoteSchema);
