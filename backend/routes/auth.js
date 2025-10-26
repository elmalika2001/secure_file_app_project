const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken, requireMFA } = require('../middleware/auth');
const { generateMFASecret, generateQRCode, verifyMFAToken } = require('../utils/mfa');
const { generateRSAKeyPair } = require('../utils/crypto');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate RSA key pair
    const { publicKey, privateKey } = generateRSAKeyPair();

    // Create user
    const user = new User({
      username,
      email,
      password,
      publicKey,
      privateKey
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      publicKey
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, mfaToken } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check MFA if enabled
    if (user.mfaEnabled) {
      if (!mfaToken) {
        return res.status(401).json({ message: 'MFA token required' });
      }

      const isMFAValid = verifyMFAToken(user.mfaSecret, mfaToken);
      if (!isMFAValid) {
        return res.status(401).json({ message: 'Invalid MFA token' });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        mfaEnabled: user.mfaEnabled
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Setup MFA
router.post('/setup-mfa', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    if (user.mfaEnabled) {
      return res.status(400).json({ message: 'MFA already enabled' });
    }

    const secret = generateMFASecret();
    const qrCode = await generateQRCode(secret);

    // Save secret temporarily (will be confirmed later)
    user.mfaSecret = secret.ascii;
    await user.save();

    res.json({
      secret: secret.ascii,
      qrCode
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify and enable MFA
router.post('/verify-mfa', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body;
    const user = req.user;

    if (!user.mfaSecret) {
      return res.status(400).json({ message: 'MFA setup not initiated' });
    }

    const isValid = verifyMFAToken(user.mfaSecret, token);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid MFA token' });
    }

    user.mfaEnabled = true;
    await user.save();

    res.json({ message: 'MFA enabled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -privateKey');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
