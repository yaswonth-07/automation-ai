import mongoose from 'mongoose';

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'archived'],
      default: 'draft',
    },
    triggerConfig: {
      type: mongoose.Schema.Types.Mixed,
      default: { type: 'manual', config: {} },
    },
    nodes: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    edges: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    version: {
      type: Number,
      default: 1,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

workflowSchema.index({ owner: 1, createdAt: -1 });
workflowSchema.index({ tags: 1 });

export const Workflow = mongoose.models.Workflow || mongoose.model('Workflow', workflowSchema);
