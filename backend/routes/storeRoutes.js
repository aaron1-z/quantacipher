const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const authMiddleware = require('../middleware/authMiddleware');

// Store data - POST /api/store
router.post('/', authMiddleware, storeController.storeData);

// Retrieve data by key - GET /api/store?key=<key>
router.get('/', authMiddleware, storeController.retrieveByKey);

module.exports = router;
