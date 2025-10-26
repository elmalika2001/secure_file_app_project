const express = require('express');
const contactController = require('../controllers/contactController');

const router = express.Router();

// POST /api/contact - Send contact message
router.post('/', contactController.sendMessage);

module.exports = router;
