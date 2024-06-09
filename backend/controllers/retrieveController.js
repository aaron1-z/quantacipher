const Data = require('../models/Data');

exports.retrieveData = async (req, res) => {
  try {
    const userData = await Data.find({}); // Adjusted to retrieve all data

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving data',
      error: error.message
    });
  }
};
