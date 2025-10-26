const express = require('express');
const aboutController = require('../controllers/aboutController');

const router = express.Router();

// GET /api/about - Get about information
router.get('/', aboutController.getAbout);

module.exports = router;
