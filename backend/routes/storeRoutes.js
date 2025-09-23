const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const retrieveController = require('../controllers/retrieveController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /store - Store encrypted data (key+value)
router.post('/store', authMiddleware, storeController.storeData);

// GET /store?key=... - Retrieve decrypted data by key
router.get('/store', authMiddleware, retrieveController.retrieveData);

module.exports = router;
