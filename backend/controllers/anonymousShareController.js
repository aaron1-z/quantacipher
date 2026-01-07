const crypto = require('crypto');
const SharedData = require('../models/SharedData');
const AnonymousUser = require('../models/AnonymousUser');
const { QuantumResistantEncryption } = require('../utils/encryption');

const encryption = new QuantumResistantEncryption();

  // Share data anonymously with another user
exports.shareData = async (req, res) => {
  try {
    await encryption.initialize();
    const senderAnonymousId = req.user.id;
    const { recipientPublicKey, data, metadata, shareType, expiresIn, maxViews, timeLimit } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Data is required'
      });
    }
    
    // Get sender's private key (would need to be passed or decrypted)
    // For now, we'll use symmetric encryption with a generated key
    const shareKey = await encryption.generateSymmetricKey();
    const encryptedData = await encryption.encryptSymmetric(data, shareKey);
    
    // If recipient provided, encrypt share key with their public key
    let encryptedKey = null;
    if (recipientPublicKey) {
      // Get sender's private key from request (decrypted by client)
      const senderPrivateKey = req.body.senderPrivateKey;
      if (!senderPrivateKey) {
        return res.status(400).json({
          success: false,
          message: 'Sender private key required for sharing'
        });
      }
      
      const keyEncryption = await encryption.encryptAsymmetric(
        shareKey,
        recipientPublicKey,
        senderPrivateKey
      );
      encryptedKey = JSON.stringify(keyEncryption);
    } else {
      // Public share - encrypt key with itself (temporary solution)
      // In production, use a different mechanism
      encryptedKey = await encryption.encryptSymmetric(shareKey, shareKey);
    }
    
    // Encrypt metadata if provided
    let encryptedMetadata = null;
    if (metadata) {
      const metadataEnc = await encryption.encryptSymmetric(
        JSON.stringify(metadata),
        shareKey
      );
      encryptedMetadata = JSON.stringify(metadataEnc);
    }
    
    // Generate share ID
    const shareId = crypto.randomUUID().replace(/-/g, '');
    
    // Calculate expiration
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn * 1000);
    } else if (timeLimit) {
      expiresAt = new Date(Date.now() + timeLimit * 1000);
    } else if (shareType === 'temporary') {
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours default
    }
    
    // Get recipient anonymous ID if public key provided
    let recipientAnonymousId = null;
    if (recipientPublicKey) {
      const recipient = await AnonymousUser.findOne({ publicKey: recipientPublicKey });
      if (recipient) {
        recipientAnonymousId = recipient.anonymousId;
      }
    }
    
    const sharedData = new SharedData({
      shareId,
      senderAnonymousId,
      recipientAnonymousId,
      encryptedData: JSON.stringify(encryptedData),
      encryptedKey,
      nonce: encryptedData.nonce,
      encryptedMetadata,
      shareType: shareType || 'direct',
      expiresAt,
      maxViews: maxViews || null,
      viewCount: 0,
      timeLimit: timeLimit || null,
      shareCreatedAt: new Date()
    });
    
    await sharedData.save();
    
    res.status(201).json({
      success: true,
      shareId,
      message: 'Data shared anonymously',
      expiresAt
    });
  } catch (error) {
    console.error('Error sharing data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share data',
      error: error.message
    });
  }
};

// Retrieve shared data
exports.getSharedData = async (req, res) => {
  try {
    await encryption.initialize();
    const { shareId } = req.params;
    const recipientAnonymousId = req.user.id;
    
    const sharedData = await SharedData.findOne({ shareId });
    
    if (!sharedData) {
      return res.status(404).json({
        success: false,
        message: 'Shared data not found'
      });
    }
    
    // Check expiration
    if (sharedData.expiresAt && new Date() > sharedData.expiresAt) {
      await SharedData.deleteOne({ shareId });
      return res.status(410).json({
        success: false,
        message: 'Shared data has expired'
      });
    }
    
    // Check time limit
    if (sharedData.timeLimit) {
      const timeElapsed = (new Date() - sharedData.shareCreatedAt) / 1000;
      if (timeElapsed > sharedData.timeLimit) {
        await SharedData.deleteOne({ shareId });
        return res.status(410).json({
          success: false,
          message: 'Time limit exceeded'
        });
      }
    }
    
    // Check view count limit
    if (sharedData.maxViews !== null && sharedData.viewCount >= sharedData.maxViews) {
      await SharedData.deleteOne({ shareId });
      return res.status(410).json({
        success: false,
        message: 'Maximum view count reached'
      });
    }
    
    // Check access permissions
    if (sharedData.shareType === 'direct' && 
        sharedData.recipientAnonymousId !== recipientAnonymousId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Update access count and view count
    sharedData.accessCount += 1;
    sharedData.viewCount += 1;
    sharedData.accessedAt = new Date();
    await sharedData.save();
    
    // Return encrypted data (client will decrypt)
    res.json({
      success: true,
      encryptedData: JSON.parse(sharedData.encryptedData),
      encryptedKey: sharedData.encryptedKey,
      encryptedMetadata: sharedData.encryptedMetadata ? JSON.parse(sharedData.encryptedMetadata) : null,
      senderPublicKey: null, // Would need to get from sender's anonymous ID
      shareType: sharedData.shareType
    });
  } catch (error) {
    console.error('Error retrieving shared data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve shared data',
      error: error.message
    });
  }
};

// Get all shares for current user
exports.getMyShares = async (req, res) => {
  try {
    const anonymousId = req.user.id;
    
    const sentShares = await SharedData.find({ senderAnonymousId: anonymousId })
      .select('shareId shareType createdAt expiresAt accessCount')
      .sort({ createdAt: -1 })
      .limit(50);
    
    const receivedShares = await SharedData.find({ recipientAnonymousId: anonymousId })
      .select('shareId shareType createdAt expiresAt')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      sent: sentShares,
      received: receivedShares
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get shares',
      error: error.message
    });
  }
};

// Delete a share
exports.deleteShare = async (req, res) => {
  try {
    const { shareId } = req.params;
    const anonymousId = req.user.id;
    
    const sharedData = await SharedData.findOne({ shareId, senderAnonymousId: anonymousId });
    
    if (!sharedData) {
      return res.status(404).json({
        success: false,
        message: 'Share not found or access denied'
      });
    }
    
    await SharedData.deleteOne({ shareId });
    
    res.json({
      success: true,
      message: 'Share deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete share',
      error: error.message
    });
  }
};

