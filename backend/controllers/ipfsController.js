const IPFSData = require('../models/IPFSData');
const ipfsService = require('../utils/ipfsService');
const { QuantumResistantEncryption } = require('../utils/encryption');

const encryption = new QuantumResistantEncryption();

// Store data on IPFS (decentralized)
exports.storeOnIPFS = async (req, res) => {
  try {
    await encryption.initialize();
    
    const { key, value, encryptedKey, encryptedValue, encryptionNonce, masterKey } = req.body;
    const isAnonymous = req.user.type === 'anonymous';
    const userIdentifier = isAnonymous 
      ? { anonymousId: req.user.id } 
      : { userId: req.user.id };

    // Prepare data for IPFS
    let dataToStore;
    let finalEncryptedKey, finalEncryptedValue, finalNonce;

    // Generate key hash first (needed for both paths)
    const keyHash = await encryption.hash(key || encryptedKey);

    if (encryptedKey && encryptedValue && encryptionNonce) {
      // Client already encrypted
      finalEncryptedKey = encryptedKey;
      finalEncryptedValue = encryptedValue;
      finalNonce = encryptionNonce;
      dataToStore = {
        encryptedKey,
        encryptedValue,
        encryptionNonce
      };
    } else if (key && value && masterKey) {
      // Server-side encryption
      const keyEnc = await encryption.encryptSymmetric(key, masterKey);
      const valueEnc = await encryption.encryptSymmetric(value, masterKey);
      finalEncryptedKey = JSON.stringify(keyEnc);
      finalEncryptedValue = JSON.stringify(valueEnc);
      finalNonce = keyEnc.nonce;
      
      dataToStore = {
        encryptedKey: finalEncryptedKey,
        encryptedValue: finalEncryptedValue,
        encryptionNonce: finalNonce
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either (encryptedKey, encryptedValue, encryptionNonce) or (key, value, masterKey) required'
      });
    }

    // Upload to IPFS
    const ipfsResult = await ipfsService.uploadEncryptedData(JSON.stringify(dataToStore));

    // Check if key already exists
    const existingData = await IPFSData.findOne({ ...userIdentifier, keyHash });
    let previousCID = null;
    
    if (existingData) {
      previousCID = existingData.ipfsCID;
      // Update existing record
      existingData.ipfsCID = ipfsResult.cid;
      existingData.ipfsSize = ipfsResult.size;
      existingData.ipfsPath = ipfsResult.path;
      existingData.previousCID = previousCID;
      existingData.encryptedKey = finalEncryptedKey;
      existingData.encryptionNonce = finalNonce;
      await existingData.save();
    } else {
      // Create new record
      const ipfsData = new IPFSData({
        ...userIdentifier,
        ipfsCID: ipfsResult.cid,
        ipfsSize: ipfsResult.size,
        ipfsPath: ipfsResult.path,
        encryptedKey: finalEncryptedKey,
        encryptionNonce: finalNonce,
        keyHash,
        previousCID,
        isPinned: true
      });
      await ipfsData.save();
    }

    // Pin the content
    await ipfsService.pinContent(ipfsResult.cid);

    res.status(201).json({
      success: true,
      message: 'Data stored on IPFS (decentralized)',
      cid: ipfsResult.cid,
      gatewayURL: ipfsService.getGatewayURL(ipfsResult.cid),
      size: ipfsResult.size,
      previousCID
    });
  } catch (error) {
    console.error('Error storing on IPFS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store data on IPFS',
      error: error.message
    });
  }
};

// Retrieve data from IPFS
exports.retrieveFromIPFS = async (req, res) => {
  try {
    const isAnonymous = req.user.type === 'anonymous';
    const userIdentifier = isAnonymous 
      ? { anonymousId: req.user.id } 
      : { userId: req.user.id };

    const { key } = req.query;
    let query = { ...userIdentifier };

    // If key provided, hash it to search
    if (key) {
      await encryption.initialize();
      const keyHash = await encryption.hash(key);
      query.keyHash = keyHash;
    }

    const ipfsRecords = await IPFSData.find(query)
      .select('ipfsCID encryptedKey encryptionNonce keyHash createdAt previousCID')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: ipfsRecords.map(record => ({
        id: record._id,
        cid: record.ipfsCID,
        gatewayURL: ipfsService.getGatewayURL(record.ipfsCID),
        encryptedKey: record.encryptedKey,
        encryptionNonce: record.encryptionNonce,
        previousCID: record.previousCID,
        createdAt: record.createdAt
      }))
    });
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve data from IPFS',
      error: error.message
    });
  }
};

// Get data directly from IPFS by CID
exports.getIPFSContent = async (req, res) => {
  try {
    const { cid } = req.params;
    
    // Verify user has access to this CID
    const isAnonymous = req.user.type === 'anonymous';
    const userIdentifier = isAnonymous 
      ? { anonymousId: req.user.id } 
      : { userId: req.user.id };
    
    const ipfsRecord = await IPFSData.findOne({ ipfsCID: cid, ...userIdentifier });
    
    if (!ipfsRecord) {
      return res.status(404).json({
        success: false,
        message: 'IPFS content not found or access denied'
      });
    }

    // Retrieve from IPFS
    const content = await ipfsService.retrieveData(cid);
    const parsedContent = JSON.parse(content);

    res.json({
      success: true,
      cid,
      data: parsedContent, // Return full encrypted data
      gatewayURL: ipfsService.getGatewayURL(cid)
    });
  } catch (error) {
    console.error('Error getting IPFS content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve IPFS content',
      error: error.message
    });
  }
};

// Delete data from IPFS (unpin)
exports.deleteFromIPFS = async (req, res) => {
  try {
    const { id } = req.params;
    const isAnonymous = req.user.type === 'anonymous';
    const userIdentifier = isAnonymous 
      ? { anonymousId: req.user.id } 
      : { userId: req.user.id };

    const ipfsRecord = await IPFSData.findOne({ _id: id, ...userIdentifier });
    
    if (!ipfsRecord) {
      return res.status(404).json({
        success: false,
        message: 'IPFS record not found or access denied'
      });
    }

    // Unpin from IPFS
    try {
      await ipfsService.unpinContent(ipfsRecord.ipfsCID);
    } catch (error) {
      console.warn('Failed to unpin from IPFS:', error.message);
    }

    // Delete record
    await IPFSData.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Data deleted from IPFS'
    });
  } catch (error) {
    console.error('Error deleting from IPFS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete IPFS data',
      error: error.message
    });
  }
};

// Get IPFS stats
exports.getIPFSStats = async (req, res) => {
  try {
    const isAnonymous = req.user.type === 'anonymous';
    const userIdentifier = isAnonymous 
      ? { anonymousId: req.user.id } 
      : { userId: req.user.id };

    const totalRecords = await IPFSData.countDocuments(userIdentifier);
    const totalSize = await IPFSData.aggregate([
      { $match: userIdentifier },
      { $group: { _id: null, total: { $sum: '$ipfsSize' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalRecords,
        totalSize: totalSize[0]?.total || 0,
        averageSize: totalSize[0]?.total / totalRecords || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get IPFS stats',
      error: error.message
    });
  }
};

