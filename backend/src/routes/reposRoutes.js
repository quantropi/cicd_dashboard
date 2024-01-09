const express = require('express');
const router = express.Router();
const repoController = require('../controllers/reposController');

router.get('/repos', repoController.getRepositories);

module.exports = router;