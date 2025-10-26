const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const File = require('../models/file');
const { encryptFile, decryptFile } = require('../utils/crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Upload file
exports.uploadFile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { originalName, size, mimetype, hash, encryptionKey } = req.body;

    // Encrypt file
    const fileBuffer = fs.readFileSync(req.file.path);
    const encryptedData = encryptFile(fileBuffer, encryptionKey);

    // Save encrypted file
    const encryptedFileName = `${Date.now()}_${req.file.filename}`;
    const encryptedFilePath = path.join('uploads', 'encrypted', encryptedFileName);
    fs.mkdirSync(path.dirname(encryptedFilePath), { recursive: true });
    fs.writeFileSync(encryptedFilePath, encryptedData);

    // Save file metadata
    const file = new File({
      filename: originalName,
      encryptedFilename: encryptedFileName,
      size: parseInt(size),
      mimetype,
      hash,
      encryptionKey,
      userId
    });

    await file.save();

    // Remove temp file
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: file._id,
        filename: file.filename,
        size: file.size,
        uploadedAt: file.uploadedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's files
exports.getFiles = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const files = await File.find({ userId }).sort({ uploadedAt: -1 });

    res.json(files.map(file => ({
      id: file._id,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      hash: file.hash,
      uploadedAt: file.uploadedAt
    })));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Download file
exports.downloadFile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    const fileId = req.params.id;

    const file = await File.findOne({ _id: fileId, userId });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const encryptedFilePath = path.join('uploads', 'encrypted', file.encryptedFilename);
    if (!fs.existsSync(encryptedFilePath)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    // Decrypt file
    const encryptedData = fs.readFileSync(encryptedFilePath);
    const decryptedData = decryptFile(encryptedData, file.encryptionKey);

    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.send(decryptedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete file
exports.deleteFile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    const fileId = req.params.id;

    const file = await File.findOneAndDelete({ _id: fileId, userId });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete encrypted file from disk
    const encryptedFilePath = path.join('uploads', 'encrypted', file.encryptedFilename);
    if (fs.existsSync(encryptedFilePath)) {
      fs.unlinkSync(encryptedFilePath);
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
