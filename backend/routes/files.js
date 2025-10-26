const express = require('express');
const multer = require('multer');
const File = require('../models/File');
const { authenticateToken, requireMFA } = require('../middleware/auth');
const { isUser } = require('../middleware/rbac');
const { encryptFile, decryptFile, generateAESKey, generateHash, verifyHash, encryptWithRSA, decryptWithRSA } = require('../utils/crypto');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Basic file type validation
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Upload file
router.post('/upload', authenticateToken, requireMFA, isUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { buffer, originalname, mimetype, size } = req.file;

    // Generate AES key for encryption
    const aesKey = generateAESKey();

    // Encrypt file data
    const encryptedData = encryptFile(buffer, aesKey);

    // Generate hash for integrity
    const hash = generateHash(buffer);

    // Encrypt AES key with user's public key for secure storage
    const encryptedAESKey = encryptWithRSA(aesKey, req.user.publicKey);

    // Create file record
    const file = new File({
      filename: `${Date.now()}-${originalname}`,
      originalName: originalname,
      mimetype,
      size,
      encryptedData,
      encryptionKey: encryptedAESKey, // Store encrypted AES key
      hash,
      uploadedBy: req.user._id
    });

    await file.save();

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: file._id,
        filename: file.originalName,
        size: file.size,
        uploadedAt: file.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Download file
router.get('/download/:id', authenticateToken, requireMFA, isUser, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user has access (owner or shared with)
    if (file.uploadedBy.toString() !== req.user._id.toString() &&
        !file.sharedWith.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Decrypt AES key using user's private key
    const aesKey = decryptWithRSA(file.encryptionKey, req.user.privateKey);

    // Decrypt file data
    const decryptedData = decryptFile(file.encryptedData, aesKey);

    // Verify integrity
    const computedHash = generateHash(decryptedData);
    if (computedHash !== file.hash) {
      return res.status(500).json({ message: 'File integrity check failed' });
    }

    res.set({
      'Content-Type': file.mimetype,
      'Content-Disposition': `attachment; filename="${file.originalName}"`
    });

    res.send(decryptedData);
  } catch (error) {
    res.status(500).json({ message: 'Download failed', error: error.message });
  }
});

// Get user's files
router.get('/', authenticateToken, requireMFA, isUser, async (req, res) => {
  try {
    const files = await File.find({
      $or: [
        { uploadedBy: req.user._id },
        { sharedWith: req.user._id }
      ]
    }).populate('uploadedBy', 'username').sort({ createdAt: -1 });

    const fileList = files.map(file => ({
      id: file._id,
      filename: file.originalName,
      size: file.size,
      uploadedBy: file.uploadedBy.username,
      uploadedAt: file.createdAt,
      shared: file.sharedWith.length > 0
    }));

    res.json(fileList);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve files', error: error.message });
  }
});

// Share file with another user (admin only or file owner)
router.post('/:id/share', authenticateToken, requireMFA, isUser, async (req, res) => {
  try {
    const { userId } = req.body;
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Only file owner or admin can share
    if (file.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if user exists
    const User = require('../models/User');
    const userToShare = await User.findById(userId);
    if (!userToShare) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add user to shared list if not already there
    if (!file.sharedWith.includes(userId)) {
      file.sharedWith.push(userId);
      await file.save();
    }

    res.json({ message: 'File shared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to share file', error: error.message });
  }
});

// Delete file
router.delete('/:id', authenticateToken, requireMFA, isUser, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Only file owner or admin can delete
    if (file.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await File.findByIdAndDelete(req.params.id);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete file', error: error.message });
  }
});

module.exports = router;
