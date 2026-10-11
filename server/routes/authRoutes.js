const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);
router.get('/demo-users', authController.getDemoUsers);
router.post('/signature', authenticate, upload.single('signatureFile'), authController.updateSignature);

// Strict protection against role escalation or profile tampering (Scenario 6)
router.all('/role', authenticate, (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Forbidden: Roles are strictly managed by system administrators. Changing roles via API requests is prohibited.'
  });
});

router.put('/me', authenticate, (req, res) => {
  if (req.body && req.body.role && req.body.role !== req.user.role) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Role elevation or modification through API requests is strictly prohibited.'
    });
  }
  return res.status(403).json({
    success: false,
    message: 'Forbidden: Direct profile modification is restricted.'
  });
});

module.exports = router;
