const express = require('express');
const router = express.Router();
const torService = require('../utils/torService');

// Check Tor availability
router.get('/status', async (req, res) => {
  try {
    const status = await torService.verifyTorConnection();
    res.json({
      success: true,
      available: torService.isAvailable,
      ...status
    });
  } catch (error) {
    res.json({
      success: false,
      available: false,
      error: error.message
    });
  }
});

// Get IP through Tor
router.get('/ip', async (req, res) => {
  try {
    const ipInfo = await torService.getTorIP();
    res.json({
      success: true,
      ...ipInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get IP through Tor',
      error: error.message
    });
  }
});

module.exports = router;

