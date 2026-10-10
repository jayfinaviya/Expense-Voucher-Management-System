const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);
router.get('/demo-users', authController.getDemoUsers);
router.post('/signature', authenticate, upload.single('signatureFile'), authController.updateSignature);

module.exports = router;
