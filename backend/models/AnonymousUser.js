const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Anonymous user model - no personal information stored
const AnonymousUserSchema = new Schema({
  anonymousId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  publicKey: {
    type: String,
    required: true
  },
  encryptedPrivateKey: {
    type: String,
    required: true
  },
  // Encrypted master key for data encryption
  encryptedMasterKey: {
    type: String,
    required: true
  },
  // No email, username, or any identifying information
  // Only cryptographic keys and anonymous ID
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster lookups
AnonymousUserSchema.index({ anonymousId: 1 });
AnonymousUserSchema.index({ createdAt: -1 });

const AnonymousUser = mongoose.model('AnonymousUser', AnonymousUserSchema);

module.exports = AnonymousUser;

