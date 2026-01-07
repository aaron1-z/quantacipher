const Data = require('../models/Data');
const { QuantumResistantEncryption } = require('../utils/encryption');

const encryption = new QuantumResistantEncryption();

exports.retrieveData = async (req, res) => {
  try {
    await encryption.initialize();
    
    const isAnonymous = req.user.type === 'anonymous';
    const userIdentifier = isAnonymous ? { anonymousId: req.user.id } : { userId: req.user.id };
    
    // If key provided, hash it to search
    let query = { ...userIdentifier };
    if (req.query.key) {
      const keyHash = await encryption.hash(req.query.key);
      query.keyHash = keyHash;
    }

    const userData = await Data.find(query)
      .select('encryptedKey encryptedValue encryptionNonce keyHash createdAt updatedAt')
      .sort({ createdAt: -1 });

    let responseData;

    if (!isAnonymous) {
      // Traditional users - decrypt on the server using user ID as key
      const userKey = req.user.id.toString();

      responseData = await Promise.all(
        userData.map(async (item) => {
          try {
            const keyData = JSON.parse(item.encryptedKey);
            const valueData = JSON.parse(item.encryptedValue);

            const decryptedKey = await encryption.decryptSymmetric(
              keyData.encrypted,
              keyData.nonce,
              userKey
            );

            const decryptedValue = await encryption.decryptSymmetric(
              valueData.encrypted,
              valueData.nonce,
              userKey
            );

            return {
              id: item._id,
              key: decryptedKey,
              value: decryptedValue,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            };
          } catch (e) {
            // Fallback: return as encrypted if decryption fails
            return {
              id: item._id,
              key: '[Encrypted]',
              value: '[Encrypted]',
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            };
          }
        })
      );
    } else {
      // Anonymous users - return encrypted data (client decrypts with master key)
      responseData = userData.map((item) => ({
        id: item._id,
        encryptedKey: item.encryptedKey,
        encryptedValue: item.encryptedValue,
        encryptionNonce: item.encryptionNonce,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
    }

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving data',
      error: error.message
    });
  }
};

exports.deleteData = async (req, res) => {
  try {
    const isAnonymous = req.user.type === 'anonymous';
    const userIdentifier = isAnonymous ? { anonymousId: req.user.id } : { userId: req.user.id };
    const { id } = req.params;

    const data = await Data.findOne({ _id: id, ...userIdentifier });
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Data not found or you do not have permission to delete it'
      });
    }

    // Crypto-shredding: overwrite with random data before deletion
    // In production, implement secure deletion
    await Data.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Data deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting data',
      error: error.message
    });
  }
};
