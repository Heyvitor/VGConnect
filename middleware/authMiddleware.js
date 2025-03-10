const jwt = require('jsonwebtoken');
const { ReturnErrorApi } = require('../helpers/errorHelper');

const authMiddleware = (req, res, next) => {
  const token = req.header('VG-Hash');
  if (!token) return ReturnErrorApi(res, 'Nenhum token fornecido', 401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    ReturnErrorApi(res, 'Token inválido', 401);
  }
};

module.exports = authMiddleware;