const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Model for anonymously shared data between users
const SharedDataSchema = new Schema({
  shareId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Anonymous IDs (not real user IDs)
  senderAnonymousId: {
    type: String,
    required: true,
    index: true
  },
  recipientAnonymousId: {
    type: String,
    index: true // Optional - can be null for public shares
  },
  // Encrypted data
  encryptedData: {
    type: String,
    required: true
  },
  encryptedKey: {
    type: String,
    required: true
  },
  nonce: {
    type: String,
    required: true
  },
  // Metadata (also encrypted)
  encryptedMetadata: {
    type: String
  },
  // Share type: 'direct', 'public', 'temporary'
  shareType: {
    type: String,
    enum: ['direct', 'public', 'temporary'],
    default: 'direct'
  },
  // Expiration for temporary shares
  expiresAt: {
    type: Date,
    index: true
  },
  // View count limit
  maxViews: {
    type: Number,
    default: null // null = unlimited
  },
  // Current view count
  viewCount: {
    type: Number,
    default: 0
  },
  // Access count (for analytics without revealing identity)
  accessCount: {
    type: Number,
    default: 0
  },
  accessedAt: {
    type: Date
  },
  // Time-limited share (in seconds from creation)
  timeLimit: {
    type: Number, // seconds
    default: null
  },
  // Share created timestamp
  shareCreatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
SharedDataSchema.index({ shareId: 1 });
SharedDataSchema.index({ senderAnonymousId: 1 });
SharedDataSchema.index({ recipientAnonymousId: 1 });
SharedDataSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SharedData = mongoose.model('SharedData', SharedDataSchema);

module.exports = SharedData;

