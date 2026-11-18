import mongoose from 'mongoose';

const careerItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['project', 'internship', 'dsa_problem', 'campus_event', 'scholarship', 'expense'],
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  organization: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: 'active',
  },
  date: {
    type: Date,
    default: null,
  },
  amount: {
    type: Number,
    default: 0,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'na'],
    default: 'na',
  },
  notes: {
    type: String,
    default: '',
  },
  link: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export const CareerItem = mongoose.model('CareerItem', careerItemSchema);
