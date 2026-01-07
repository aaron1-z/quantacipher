const express = require('express');
const router = express.Router();
const anonymousAuthController = require('../controllers/anonymousAuthController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', anonymousAuthController.createAnonymousAccount);
router.post('/login', anonymousAuthController.loginAnonymous);
router.get('/info', authMiddleware, anonymousAuthController.getAnonymousInfo);

module.exports = router;

