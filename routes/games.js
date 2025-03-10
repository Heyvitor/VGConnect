const express = require('express');
const router = express.Router();
const { launchGames } = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/game_launch', authMiddleware, launchGames);

module.exports = router;