const Data = require('../models/Data');
const mongoose = require('mongoose');
const { encryptData } = require('../utils/encryptionUtils');

exports.storeData = async (req, res) => {
  try {
    const { key, value } = req.body;
    const userId = req.user.id; // Assumes the user ID is available in req.user

    // Encrypt the sensitive value before storing
    const encryptedValue = encryptData(value);

    const newData = new Data({
      key,
      value: encryptedValue
    });

    await newData.save();

    res.status(201).json({
      success: true,
      message: 'Data stored successfully',
      data: {
        key: newData.key,
        // Never return the encrypted value or original value in the response
        id: newData._id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while storing data',
      error: error.message
    });
  }
};
