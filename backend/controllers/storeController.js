const Data = require('../models/Data');
const { QuantumResistantEncryption } = require('../utils/encryption');
const mongoose = require('mongoose');

const encryption = new QuantumResistantEncryption();

exports.storeData = async (req, res) => {
  try {
    await encryption.initialize();
    
    const { key, value, encryptedKey, encryptedValue, encryptionNonce, masterKey } = req.body;
    
    // Support both encrypted (client-side) and unencrypted (server-side encryption)
    let finalEncryptedKey, finalEncryptedValue, finalNonce;
    
    // Determine user type
    const isAnonymous = req.user.type === 'anonymous';
    
    if (encryptedKey && encryptedValue && encryptionNonce) {
      // Client already encrypted (anonymous users)
      finalEncryptedKey = encryptedKey;
      finalEncryptedValue = encryptedValue;
      finalNonce = encryptionNonce;
    } else if (key && value && masterKey) {
      // Server-side encryption with master key (anonymous users)
      const keyEnc = await encryption.encryptSymmetric(key, masterKey);
      const valueEnc = await encryption.encryptSymmetric(value, masterKey);
      finalEncryptedKey = JSON.stringify(keyEnc);
      finalEncryptedValue = JSON.stringify(valueEnc);
      finalNonce = keyEnc.nonce;
    } else if (key && value && !isAnonymous) {
      // Traditional users - encrypt server-side with user ID as key
      const userKey = req.user.id.toString();
      const keyEnc = await encryption.encryptSymmetric(key, userKey);
      const valueEnc = await encryption.encryptSymmetric(value, userKey);
      finalEncryptedKey = JSON.stringify(keyEnc);
      finalEncryptedValue = JSON.stringify(valueEnc);
      finalNonce = keyEnc.nonce;
    } else {
      return res.status(400).json({
        success: false,
        message: isAnonymous 
          ? 'Either (encryptedKey, encryptedValue, encryptionNonce) or (key, value, masterKey) required'
          : 'Key and value are required'
      });
    }

    // Generate key hash for searching (without revealing key)
    // For traditional users, use the actual key; for anonymous, use encrypted key
    const keyForHash = key || encryptedKey || '';
    const keyHash = await encryption.hash(keyForHash);

    // User identifier
    const userIdentifier = isAnonymous ? { anonymousId: req.user.id } : { userId: req.user.id };

    // Check if key already exists
    const existingData = await Data.findOne({ ...userIdentifier, keyHash });
    if (existingData) {
      // Update existing data
      existingData.encryptedKey = finalEncryptedKey;
      existingData.encryptedValue = finalEncryptedValue;
      existingData.encryptionNonce = finalNonce;
      await existingData.save();
      return res.status(200).json({
        success: true,
        message: 'Data updated successfully',
        dataId: existingData._id
      });
    }

    // Create new data
    const newData = new Data({
      ...userIdentifier,
      encryptedKey: finalEncryptedKey,
      encryptedValue: finalEncryptedValue,
      encryptionNonce: finalNonce,
      keyHash
    });

    await newData.save();

    res.status(201).json({
      success: true,
      message: 'Data stored successfully',
      dataId: newData._id
    });
  } catch (error) {
    console.error('Error storing data:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while storing data',
      error: error.message
    });
  }
};
