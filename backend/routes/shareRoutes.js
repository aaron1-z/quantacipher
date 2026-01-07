const express = require('express');
const router = express.Router();
const shareController = require('../controllers/anonymousShareController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/share', authMiddleware, shareController.shareData);
router.get('/share/:shareId', authMiddleware, shareController.getSharedData);
router.get('/my-shares', authMiddleware, shareController.getMyShares);
router.delete('/share/:shareId', authMiddleware, shareController.deleteShare);

module.exports = router;

