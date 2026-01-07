const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Model for multi-device sync
const DeviceSchema = new Schema({
  // User identifier
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
  // Device information
  deviceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  deviceName: {
    type: String,
    required: true
  },
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'other'],
    default: 'other'
  },
  // Encrypted sync key (encrypted with device-specific key)
  encryptedSyncKey: {
    type: String,
    required: true
  },
  // Device public key for secure communication
  devicePublicKey: {
    type: String,
    required: true
  },
  // Last sync timestamp
  lastSynced: {
    type: Date,
    default: Date.now
  },
  // Device status
  isActive: {
    type: Boolean,
    default: true
  },
  // Trust level (for security)
  trustLevel: {
    type: Number,
    default: 1,
    min: 0,
    max: 5
  }
}, {
  timestamps: true
});

// Indexes
DeviceSchema.index({ userId: 1, isActive: 1 });
DeviceSchema.index({ anonymousId: 1, isActive: 1 });
DeviceSchema.index({ deviceId: 1 });

const Device = mongoose.model('Device', DeviceSchema);

module.exports = Device;

