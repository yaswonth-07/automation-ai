import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      default: null,
    },
    executionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Execution',
      default: null,
    },
    type: {
      type: String,
      enum: ['success', 'failure', 'escalation', 'warning', 'info'],
      default: 'info',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ owner: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
