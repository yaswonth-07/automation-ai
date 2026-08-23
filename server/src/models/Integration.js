import mongoose from 'mongoose';

const integrationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: String,
      enum: ['gmail', 'slack', 'google-sheets', 'discord', 'openrouter', 'gemini'],
      required: true,
    },
    isConnected: {
      type: Boolean,
      default: false,
    },
    scopes: {
      type: [String],
      default: [],
    },
    encryptedTokens: {
      type: String, // Encrypted with AES-256-GCM
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}, // Account name, email, workspace name etc.
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

integrationSchema.index({ owner: 1, provider: 1 }, { unique: true });

export const Integration = mongoose.models.Integration || mongoose.model('Integration', integrationSchema);
