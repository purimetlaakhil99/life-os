import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    default: null,
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  resource: {
    type: String,
    default: '',
  },
  ipAddress: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['success', 'denied', 'failed'],
    default: 'success',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
