const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceSyncController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authMiddleware, deviceController.registerDevice);
router.get('/list', authMiddleware, deviceController.getDevices);
router.post('/sync', authMiddleware, deviceController.syncData);
router.delete('/remove/:deviceId', authMiddleware, deviceController.removeDevice);
router.get('/sync-key', authMiddleware, deviceController.generateSyncKey);

module.exports = router;

