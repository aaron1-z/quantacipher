const crypto = require('crypto');
const Device = require('../models/Device');
const { QuantumResistantEncryption } = require('../utils/encryption');

const encryption = new QuantumResistantEncryption();

// Register a new device
exports.registerDevice = async (req, res) => {
  try {
    await encryption.initialize();
    
    const { deviceName, deviceType, devicePublicKey, encryptedSyncKey } = req.body;
    const isAnonymous = req.user.type === 'anonymous';
    const userIdentifier = isAnonymous 
      ? { anonymousId: req.user.id } 
      : { userId: req.user.id };

    if (!deviceName || !devicePublicKey) {
      return res.status(400).json({
        success: false,
        message: 'Device name and public key are required'
      });
    }

    // Generate unique device ID
    const deviceId = crypto.randomUUID();

    // Create device record
    const device = new Device({
      ...userIdentifier,
      deviceId,
      deviceName,
      deviceType: deviceType || 'other',
      devicePublicKey,
      encryptedSyncKey: encryptedSyncKey || '',
      isActive: true,
      trustLevel: 1
    });

    await device.save();

    res.status(201).json({
      success: true,
      deviceId,
      message: 'Device registered successfully'
    });
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register device',
      error: error.message
    });
  }
};

// Get all devices for user
exports.getDevices = async (req, res) => {
  try {
    const isAnonymous = req.user.type === 'anonymous';
    const userIdentifier = isAnonymous 
      ? { anonymousId: req.user.id } 
      : { userId: req.user.id };

    const devices = await Device.find({ ...userIdentifier, isActive: true })
      .select('deviceId deviceName deviceType lastSynced trustLevel createdAt')
      .sort({ lastSynced: -1 });

    res.json({
      success: true,
      devices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get devices',
      error: error.message
    });
  }
};

// Sync data across devices
exports.syncData = async (req, res) => {
  try {
    const { deviceId, syncData } = req.body;
    const isAnonymous = req.user.type === 'anonymous';
    const userIdentifier = isAnonymous 
      ? { anonymousId: req.user.id } 
      : { userId: req.user.id };

    // Verify device belongs to user
    const device = await Device.findOne({ 
      deviceId, 
      ...userIdentifier,
      isActive: true 
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found or access denied'
      });
    }

    // Update last synced
    device.lastSynced = new Date();
    await device.save();

    res.json({
      success: true,
      message: 'Data synced successfully',
      lastSynced: device.lastSynced
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to sync data',
      error: error.message
    });
  }
};

// Remove device
exports.removeDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const isAnonymous = req.user.type === 'anonymous';
    const userIdentifier = isAnonymous 
      ? { anonymousId: req.user.id } 
      : { userId: req.user.id };

    const device = await Device.findOne({ deviceId, ...userIdentifier });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    device.isActive = false;
    await device.save();

    res.json({
      success: true,
      message: 'Device removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove device',
      error: error.message
    });
  }
};

// Generate sync key for device
exports.generateSyncKey = async (req, res) => {
  try {
    await encryption.initialize();
    
    const syncKey = await encryption.generateSymmetricKey();
    
    res.json({
      success: true,
      syncKey
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate sync key',
      error: error.message
    });
  }
};

