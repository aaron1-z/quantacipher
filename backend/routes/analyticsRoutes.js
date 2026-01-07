const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/log', authMiddleware, analyticsController.logEvent);
router.get('/user', authMiddleware, analyticsController.getUserAnalytics);
router.get('/platform', analyticsController.getPlatformAnalytics);

module.exports = router;

