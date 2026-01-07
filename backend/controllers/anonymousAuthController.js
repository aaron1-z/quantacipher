const crypto = require('crypto');
const AnonymousUser = require('../models/AnonymousUser');
const { QuantumResistantEncryption } = require('../utils/encryption');
const authUtils = require('../utils/authUtils');

const encryption = new QuantumResistantEncryption();

// Create anonymous account - no personal info required
exports.createAnonymousAccount = async (req, res) => {
  try {
    await encryption.initialize();
    
    // Generate key pair for user
    const keyPair = await encryption.generateKeyPair();
    
    // Generate master key for data encryption
    const masterKey = await encryption.generateSymmetricKey();
    
    // Generate anonymous ID
    const seed = keyPair.publicKey + Date.now().toString();
    const anonymousId = await encryption.generateAnonymousId(seed);
    
    // Encrypt private key with a passphrase (if provided) or generate one
    const passphrase = req.body.passphrase || crypto.randomUUID();
    const encryptedPrivateKey = await encryption.encryptSymmetric(
      keyPair.privateKey,
      passphrase
    );
    
    // Encrypt master key with passphrase
    const encryptedMasterKey = await encryption.encryptSymmetric(
      masterKey,
      passphrase
    );
    
    // Create anonymous user
    const anonymousUser = new AnonymousUser({
      anonymousId,
      publicKey: keyPair.publicKey,
      encryptedPrivateKey: JSON.stringify(encryptedPrivateKey),
      encryptedMasterKey: JSON.stringify(encryptedMasterKey)
    });
    
    await anonymousUser.save();
    
    // Generate token for session
    const token = authUtils.generateToken({ id: anonymousId, type: 'anonymous' });
    
    res.status(201).json({
      success: true,
      anonymousId,
      publicKey: keyPair.publicKey,
      token,
      // Return encrypted keys (user must decrypt with passphrase)
      encryptedPrivateKey: encryptedPrivateKey.encrypted,
      encryptedMasterKey: encryptedMasterKey.encrypted,
      // Return passphrase only if not provided by user
      passphrase: req.body.passphrase ? undefined : passphrase,
      message: 'Anonymous account created successfully. Save your passphrase securely!'
    });
  } catch (error) {
    console.error('Error creating anonymous account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create anonymous account',
      error: error.message
    });
  }
};

// Login to anonymous account using anonymous ID and passphrase
exports.loginAnonymous = async (req, res) => {
  try {
    const { anonymousId, passphrase } = req.body;
    
    if (!anonymousId || !passphrase) {
      return res.status(400).json({
        success: false,
        message: 'Anonymous ID and passphrase are required'
      });
    }
    
    const anonymousUser = await AnonymousUser.findOne({ anonymousId });
    if (!anonymousUser) {
      return res.status(404).json({
        success: false,
        message: 'Anonymous account not found'
      });
    }
    
    // Try to decrypt private key to verify passphrase
    try {
      await encryption.initialize();
      const encryptedPrivateKey = JSON.parse(anonymousUser.encryptedPrivateKey);
      await encryption.decryptSymmetric(
        encryptedPrivateKey.encrypted,
        encryptedPrivateKey.nonce,
        passphrase
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid passphrase'
      });
    }
    
    // Update last active
    anonymousUser.lastActive = new Date();
    await anonymousUser.save();
    
    // Generate token
    const token = authUtils.generateToken({ id: anonymousId, type: 'anonymous' });
    
    res.json({
      success: true,
      anonymousId,
      publicKey: anonymousUser.publicKey,
      token
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message
    });
  }
};

// Get anonymous user info (public only)
exports.getAnonymousInfo = async (req, res) => {
  try {
    const anonymousId = req.user.id;
    const anonymousUser = await AnonymousUser.findOne({ anonymousId });
    
    if (!anonymousUser) {
      return res.status(404).json({
        success: false,
        message: 'Anonymous account not found'
      });
    }
    
    res.json({
      success: true,
      anonymousId: anonymousUser.anonymousId,
      publicKey: anonymousUser.publicKey,
      createdAt: anonymousUser.createdAt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get account info',
      error: error.message
    });
  }
};

