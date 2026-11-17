import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
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
  subjectName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['assignment', 'exam', 'quiz', 'project', 'lab_record'],
    default: 'assignment',
  },
  dueDate: {
    type: Date,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'submitted', 'graded'],
    default: 'pending',
  },
  totalMarks: {
    type: Number,
    default: 100,
  },
  obtainedMarks: {
    type: Number,
    default: null,
  },
  syllabusUnits: [{ type: String }],
  description: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export const Assignment = mongoose.model('Assignment', assignmentSchema);
