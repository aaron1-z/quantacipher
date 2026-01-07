const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Model for IPFS-stored data (decentralized storage)
const IPFSDataSchema = new Schema({
  // User identifier (anonymous or regular)
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  anonymousId: {
    type: String,
    index: true,
    required: false
  },
  // IPFS Content Identifier (CID)
  ipfsCID: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Encrypted key for this data entry
  encryptedKey: {
    type: String,
    required: true
  },
  // Key hash for searching
  keyHash: {
    type: String,
    index: true
  },
  // Encryption metadata
  encryptionNonce: {
    type: String,
    required: true
  },
  // IPFS metadata
  ipfsSize: {
    type: Number
  },
  ipfsPath: {
    type: String
  },
  // Pinning status
  isPinned: {
    type: Boolean,
    default: true
  },
  // Blockchain-like features
  previousCID: {
    type: String // For creating a chain of data versions
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
IPFSDataSchema.index({ userId: 1, keyHash: 1 });
IPFSDataSchema.index({ anonymousId: 1, keyHash: 1 });
IPFSDataSchema.index({ ipfsCID: 1 });
IPFSDataSchema.index({ timestamp: -1 });

const IPFSData = mongoose.model('IPFSData', IPFSDataSchema);

module.exports = IPFSData;

