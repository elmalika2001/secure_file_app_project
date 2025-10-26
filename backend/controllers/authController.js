const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password, mfaToken } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check MFA if enabled
    if (user.mfaEnabled) {
      if (!mfaToken) {
        return res.json({ mfaRequired: true });
      }

      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: mfaToken
      });

      if (!verified) {
        return res.status(400).json({ message: 'Invalid MFA token' });
      }
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mfaEnabled: user.mfaEnabled
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Setup MFA
exports.setupMFA = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate MFA secret
    const secret = speakeasy.generateSecret({
      name: `SecureShare (${user.email})`,
      issuer: 'SecureShare'
    });

    user.mfaSecret = secret.base32;
    await user.save();

    // Generate QR code
    const qrCodeUrl = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: `SecureShare (${user.email})`,
      issuer: 'SecureShare'
    });

    qrcode.toDataURL(qrCodeUrl, (err, dataUrl) => {
      if (err) {
        return res.status(500).json({ message: 'Error generating QR code' });
      }

      res.json({
        secret: secret.base32,
        qrCodeUrl: dataUrl
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password -mfaSecret');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
