const Data = require('../models/Data');
const { decryptData } = require('../utils/encryptionUtils');

exports.retrieveData = async (req, res) => {
  try {
    const { key } = req.query; // Support query parameter for specific key retrieval
    let userData;

    if (key) {
      // Retrieve specific data by key
      userData = await Data.findOne({ key });
      if (!userData) {
        return res.status(404).json({
          success: false,
          message: 'Data not found for the specified key'
        });
      }
      
      // Decrypt the value before returning
      const decryptedValue = decryptData(userData.value);
      
      res.status(200).json({
        success: true,
        data: {
          key: userData.key,
          value: decryptedValue,
          id: userData._id
        }
      });
    } else {
      // Retrieve all data (decrypt each value)
      userData = await Data.find({});
      
      const decryptedData = userData.map(item => ({
        key: item.key,
        value: decryptData(item.value),
        id: item._id
      }));
      
      res.status(200).json({
        success: true,
        data: decryptedData
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving data',
      error: error.message
    });
  }
};
