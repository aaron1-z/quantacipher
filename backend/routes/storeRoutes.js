const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const retrieveController = require('../controllers/retrieveController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/store', authMiddleware, storeController.storeData);

module.exports = router;
