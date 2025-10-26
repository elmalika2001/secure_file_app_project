const express = require('express');
const fileController = require('../controllers/fileController');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// POST /api/files/upload - Upload file
router.post('/upload', upload.single('file'), fileController.uploadFile);

// GET /api/files - Get user's files
router.get('/', fileController.getFiles);

// GET /api/files/download/:id - Download file
router.get('/download/:id', fileController.downloadFile);

// DELETE /api/files/:id - Delete file
router.delete('/:id', fileController.deleteFile);

module.exports = router;
