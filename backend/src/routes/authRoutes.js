const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/github', authController.redirectToGitHub);
router.get('/callback', authController.handleGitHubCallback);

module.exports = router;
