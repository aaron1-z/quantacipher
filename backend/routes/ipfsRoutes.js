const express = require('express');
const router = express.Router();
const ipfsController = require('../controllers/ipfsController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/store', authMiddleware, ipfsController.storeOnIPFS);
router.get('/retrieve', authMiddleware, ipfsController.retrieveFromIPFS);
router.get('/content/:cid', authMiddleware, ipfsController.getIPFSContent);
router.delete('/delete/:id', authMiddleware, ipfsController.deleteFromIPFS);
router.get('/stats', authMiddleware, ipfsController.getIPFSStats);

module.exports = router;

