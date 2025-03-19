const express = require('express');
const router = express.Router();
const { authentication } = require('../controllers/authController');

router.post('/authentication', authentication);

module.exports = router;