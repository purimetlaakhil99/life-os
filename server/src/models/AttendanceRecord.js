import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  subjectName: {
    type: String,
    required: true,
    trim: true,
  },
  subjectCode: {
    type: String,
    default: '',
    trim: true,
  },
  totalClasses: {
    type: Number,
    default: 0,
    min: 0,
  },
  attendedClasses: {
    type: Number,
    default: 0,
    min: 0,
  },
  targetPercentage: {
    type: Number,
    default: 75,
  },
  history: [{
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'cancelled'],
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
  }],
}, {
  timestamps: true,
});

attendanceRecordSchema.index({ userId: 1, subjectName: 1 }, { unique: true });

export const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);
