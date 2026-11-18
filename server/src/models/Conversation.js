import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'assistant'], required: true },
  text: { type: String, required: true },
  mode: { type: String, enum: ['chat', 'voice'], default: 'chat' },
  language: { type: String, default: 'en' },
  executedActions: [{ type: mongoose.Schema.Types.Mixed }],
  memoryRetrieved: [{ type: String }],
  timestamp: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    default: 'LIFE OS Conversation',
  },
  messages: [messageSchema],
}, {
  timestamps: true,
});

export const Conversation = mongoose.model('Conversation', conversationSchema);
