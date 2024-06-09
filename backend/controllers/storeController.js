const Data = require('../models/Data');
const mongoose = require('mongoose');

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
    res.status(500).json({
      success: false,
      message: 'An error occurred while storing data',
      error: error.message
    });
  }
};
