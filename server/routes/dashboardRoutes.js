const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get role-tailored dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;
