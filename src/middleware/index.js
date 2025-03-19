const authMiddleware = require('./authMiddleware');
const rateLimitMiddleware = require('./rateLimitMiddleware');

module.exports = {
  authMiddleware,
  rateLimitMiddleware,
};