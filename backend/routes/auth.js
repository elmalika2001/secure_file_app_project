const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/register - User registration
router.post('/register', authController.register);

// POST /api/auth/login - User login
router.post('/login', authController.login);

// POST /api/auth/setup-mfa - Setup MFA
router.post('/setup-mfa', authController.setupMFA);

// GET /api/auth/profile - Get user profile
router.get('/profile', authController.getProfile);

module.exports = router;
