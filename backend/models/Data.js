// models/Data.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schema for secure data storage with encryption
const DataSchema = new Schema({
  key: {
    type: String,
    required: true,
    index: true // Add index for faster key-based queries
  },
  // Store encrypted value and its metadata
  encryptedValue: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true
  },
  // Associate data with user who stored it
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for efficient user-specific key lookups
DataSchema.index({ userId: 1, key: 1 }, { unique: true });

// Create a model based on schema
const Data = mongoose.model('Data', DataSchema);

module.exports = Data;
