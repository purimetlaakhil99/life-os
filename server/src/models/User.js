import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'student'],
    default: 'student',
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata',
  },
  preferredLanguage: {
    type: String,
    enum: ['en', 'hi', 'te'],
    default: 'en',
  },
  googleAuth: {
    connected: { type: Boolean, default: false },
    encryptedRefreshToken: { type: String, default: null },
    scope: [{ type: String }],
    expiryDate: { type: Date, default: null },
    gmailSendAuthorized: { type: Boolean, default: false },
  },
  settings: {
    voiceEnabled: { type: Boolean, default: true },
    autoSpeechOutput: { type: Boolean, default: false },
    dailyBriefingTime: { type: String, default: '08:00' },
    eveningRecapTime: { type: String, default: '20:00' },
    attendanceTarget: { type: Number, default: 75 },
  },
  pushSubscription: {
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String,
    },
  },
}, {
  timestamps: true,
});

export const User = mongoose.model('User', userSchema);
