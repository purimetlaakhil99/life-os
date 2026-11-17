import mongoose from 'mongoose';

const timetableSlotSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number, // 1 = Monday, 7 = Sunday
    required: true,
  },
  subjectName: {
    type: String,
    required: true,
  },
  subjectCode: {
    type: String,
    default: '',
  },
  faculty: {
    type: String,
    default: '',
  },
  classroom: {
    type: String,
    default: '',
  },
  startTime: {
    type: String, // HH:MM
    required: true,
  },
  endTime: {
    type: String, // HH:MM
    required: true,
  },
});

const studentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  university: {
    type: String,
    default: 'National Institute of Technology',
  },
  course: {
    type: String,
    default: 'B.Tech',
  },
  branch: {
    type: String,
    default: 'Computer Science and Engineering',
  },
  semester: {
    type: Number,
    default: 5,
  },
  academicYear: {
    type: String,
    default: '2026-2027',
  },
  attendanceTarget: {
    type: Number,
    default: 75,
  },
  gradingSystem: {
    scale: {
      type: String,
      enum: ['10-point', '4-point', 'percentage'],
      default: '10-point',
    },
    gradePoints: [
      { grade: { type: String, default: 'O' }, points: { type: Number, default: 10 } },
      { grade: { type: String, default: 'A+' }, points: { type: Number, default: 9 } },
      { grade: { type: String, default: 'A' }, points: { type: Number, default: 8 } },
      { grade: { type: String, default: 'B+' }, points: { type: Number, default: 7 } },
      { grade: { type: String, default: 'B' }, points: { type: Number, default: 6 } },
      { grade: { type: String, default: 'C' }, points: { type: Number, default: 5 } },
      { grade: { type: String, default: 'F' }, points: { type: Number, default: 0 } },
    ],
  },
  timetable: [timetableSlotSchema],
}, {
  timestamps: true,
});

export const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
