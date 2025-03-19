const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const MakeToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const DecToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { status: true, ...decoded };
  } catch (error) {
    return { status: false, message: 'Token inválido' };
  }
};

const GenerateHashSalsa = (paramsValue, key) => {
  return crypto.createHash('sha256').update(paramsValue + key).digest('hex');
};

module.exports = { MakeToken, DecToken, GenerateHashSalsa };