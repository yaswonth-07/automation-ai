import mongoose from 'mongoose';

const agentMemorySchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
      index: true,
    },
    executionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Execution',
      required: true,
      index: true,
    },
    agentId: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    confidenceScore: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 1,
    },
  },
  { timestamps: true }
);

agentMemorySchema.index({ executionId: 1, key: 1 });

export const AgentMemory = mongoose.models.AgentMemory || mongoose.model('AgentMemory', agentMemorySchema);
