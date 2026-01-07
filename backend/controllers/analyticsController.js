const Analytics = require('../models/Analytics');
const { QuantumResistantEncryption } = require('../utils/encryption');

const encryption = new QuantumResistantEncryption();

// Log analytics event (privacy-preserving)
exports.logEvent = async (req, res) => {
  try {
    await encryption.initialize();
    
    const { eventType, metadata, deviceType } = req.body;
    const isAnonymous = req.user.type === 'anonymous';
    const userId = req.user.id;

    // Hash user ID for privacy (no personal data stored)
    const userHash = await encryption.hash(userId + 'analytics_salt');

    // Create analytics record
    const analytics = new Analytics({
      userHash,
      eventType,
      metadata: metadata || {},
      deviceType: deviceType || 'unknown',
      timestamp: new Date()
    });

    await analytics.save();

    res.json({
      success: true,
      message: 'Event logged'
    });
  } catch (error) {
    console.error('Error logging analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log event',
      error: error.message
    });
  }
};

// Get user analytics (privacy-preserving, aggregated)
exports.getUserAnalytics = async (req, res) => {
  try {
    await encryption.initialize();
    
    const isAnonymous = req.user.type === 'anonymous';
    const userId = req.user.id;
    const userHash = await encryption.hash(userId + 'analytics_salt');

    // Get events for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Aggregate by event type
    const events = await Analytics.aggregate([
      {
        $match: {
          userHash,
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          lastOccurrence: { $max: '$timestamp' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get daily activity
    const dailyActivity = await Analytics.aggregate([
      {
        $match: {
          userHash,
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get device type distribution
    const deviceDistribution = await Analytics.aggregate([
      {
        $match: {
          userHash,
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$deviceType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        eventTypes: events,
        dailyActivity,
        deviceDistribution,
        totalEvents: events.reduce((sum, e) => sum + e.count, 0)
      }
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error.message
    });
  }
};

// Get platform-wide analytics (aggregated, no personal data)
exports.getPlatformAnalytics = async (req, res) => {
  try {
    // Only return aggregated, anonymized data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const platformStats = await Analytics.aggregate([
      {
        $match: {
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalUsers = await Analytics.distinct('userHash', {
      timestamp: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      platformStats: {
        eventTypes: platformStats,
        totalUsers: totalUsers.length,
        totalEvents: platformStats.reduce((sum, e) => sum + e.count, 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get platform analytics',
      error: error.message
    });
  }
};

