import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    default: '',
  },
  relationship: {
    type: String,
    enum: ['family', 'friend', 'colleague', 'mentor', 'classmate', 'other'],
    default: 'friend',
  },
  birthday: {
    type: Date,
    required: true,
    index: true,
  },
  preferredLanguage: {
    type: String,
    enum: ['en', 'hi', 'te'],
    default: 'en',
  },
  messageStyle: {
    type: String,
    enum: ['friendly', 'emotional', 'heartfelt', 'funny', 'simple', 'personalized'],
    default: 'heartfelt',
  },
  personalNotes: {
    type: String,
    default: '',
  },
  autoBirthdayEmail: {
    type: Boolean,
    default: false,
  },
  birthdaySendTime: {
    type: String,
    default: '09:00', // HH:MM in user's timezone
  },
  approvedCustomMessage: {
    type: String,
    default: '',
  },
  lastWishSentYear: {
    type: Number,
    default: 0,
  },
  deliveryStatus: {
    lastSentAt: Date,
    status: { type: String, enum: ['idle', 'scheduled', 'sent', 'failed'], default: 'idle' },
    error: String,
  },
}, {
  timestamps: true,
});

export const Contact = mongoose.model('Contact', contactSchema);
