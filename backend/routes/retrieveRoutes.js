const express = require('express');
const router = express.Router();
const retrieveController = require('../controllers/retrieveController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/retrieve', authMiddleware, retrieveController.retrieveData);
router.delete('/retrieve/:id', authMiddleware, retrieveController.deleteData);

module.exports = router;
