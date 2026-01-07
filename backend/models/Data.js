// models/Data.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define your schema - now supports both regular and anonymous users
const DataSchema = new Schema({
  // Support both user types
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
  // Encrypted key and value
  encryptedKey: {
    type: String,
    required: true
  },
  encryptedValue: {
    type: String,
    required: true
  },
  // Encryption metadata
  encryptionNonce: {
    type: String,
    required: true
  },
  // Hash of key for searching (without revealing key)
  keyHash: {
    type: String,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
DataSchema.index({ userId: 1, keyHash: 1 });
DataSchema.index({ anonymousId: 1, keyHash: 1 });
DataSchema.index({ createdAt: -1 });

// Create a model based on schema
const Data = mongoose.model('Data', DataSchema);

module.exports = Data;
