const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Privacy-preserving analytics (no personal data)
const AnalyticsSchema = new Schema({
  // Anonymous user identifier (hashed)
  userHash: {
    type: String,
    required: true,
    index: true
  },
  // Event type
  eventType: {
    type: String,
    required: true,
    enum: ['data_stored', 'data_retrieved', 'data_shared', 'data_deleted', 'ipfs_upload', 'ipfs_download', 'tor_used', 'login', 'sync']
  },
  // Event metadata (encrypted/anonymized)
  metadata: {
    type: Schema.Types.Mixed
  },
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  // Device type (anonymized)
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'other', 'unknown']
  },
  // No IP, no location, no personal data
}, {
  timestamps: false
});

// Indexes for analytics queries
AnalyticsSchema.index({ userHash: 1, eventType: 1, timestamp: -1 });
AnalyticsSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsSchema.index({ timestamp: -1 });

// TTL index - auto-delete after 90 days for privacy
AnalyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

const Analytics = mongoose.model('Analytics', AnalyticsSchema);

module.exports = Analytics;

