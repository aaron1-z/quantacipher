const Data = require('../models/Data');
const mongoose = require('mongoose');

/**
 * Store encrypted key-value pair
 * POST /api/store
 * Requires authentication via JWT token
 */
exports.storeData = async (req, res) => {
  try {
    const { key, value } = req.body;
    const userId = req.user.id; // Assumes the user ID is available in req.user

    const newData = new Data({
      key,
      value
    });

    await newData.save();

    res.status(201).json({
      success: true,
      message: 'Data stored successfully',
      data: newData
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

/**
 * Retrieve and decrypt value by key
 * GET /api/store?key=<key>
 * Requires authentication via JWT token
 */
exports.retrieveByKey = async (req, res) => {
  try {
    const { key } = req.query;
    const userId = req.user.id; // User ID from JWT token

    // Validate input
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Key parameter is required'
      });
    }

    // Find the data for this user and key
    const data = await Data.findOne({ userId, key });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'No data found for the specified key'
      });
    }

    // Decrypt the value before returning
    const decryptedValue = authUtils.decryptData({
      encrypted: data.encryptedValue,
      iv: data.iv
    });

    res.status(200).json({
      success: true,
      data: {
        key: data.key,
        value: decryptedValue, // Return only the decrypted value
        createdAt: data.createdAt
      }
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
