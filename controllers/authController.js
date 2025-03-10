const { Agent, User } = require('../models');
const { ReturnErrorApi } = require('../helpers/errorHelper');
const jwt = require('jsonwebtoken');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({ filename: 'logs/auth.log' }),
  ],
});

const authentication = async (req, res) => {
  const token = req.header('VG-Hash');
  const clientIp = req.ip;

  logger.info(`Requisição recebida - Token: ${token}, IP: ${clientIp}`);

  if (!token) {
    logger.error('Token não fornecido');
    return ReturnErrorApi(res, 'INVALID_TOKEN');
  }

  try {
    const decToken = Buffer.from(token, 'base64').toString('ascii');
    const [agentToken, agentCode, agentSecretKey] = decToken.split(':');

    if (!agentToken || !agentCode || !agentSecretKey) {
      logger.error('Formato de token inválido');
      return ReturnErrorApi(res, 'INVALID_TOKEN');
    }

    const agent = await Agent.findOne({
      where: { agent_token: agentToken, agent_code: agentCode, agent_secret_key: agentSecretKey },
    });

    if (!agent) {
      logger.error('Agente não encontrado');
      return ReturnErrorApi(res, 'INVALID_AGENT');
    }

    if (agent.agent_ip_auth !== clientIp) {
      logger.error(`IP não autorizado - Esperado: ${agent.agent_ip_auth}, Recebido: ${clientIp}`);
      return ReturnErrorApi(res, 'IP_NOT_AUTHORIZED', 403);
    }

    const user = await User.findByPk(agent.agent_id);
    if (!user) {
      logger.error('Usuário do agente não encontrado');
      return ReturnErrorApi(res, 'INVALID_AGENT');
    }

    const jwtToken = jwt.sign({ id: user.id, agent_code: agent.agent_code, agent_token: agent.agent_token }, process.env.JWT_SECRET, { expiresIn: '1h' });

    logger.info(`Autenticação bem-sucedida - Usuário ID: ${user.id}`);
    res.json({
      access_hash: jwtToken,
      type_hash: 'VG-Hash',
    });
  } catch (error) {
    logger.error(`Erro na autenticação: ${error.message}`);
    ReturnErrorApi(res, 'INTERNAL_SERVER_ERROR', 500);
  }
};

module.exports = { authentication };