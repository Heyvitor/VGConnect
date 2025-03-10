const { Agent, ProviderKey } = require('../../models');
const { SendSeamlessPost, DecToken, GenerateHashSalsa } = require('../../helpers');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({ filename: 'logs/salsa.log' }),
  ],
});

let baseUrl, pn, key;

const getSalsaCredentials = async () => {
  const setting = await ProviderKey.findOne();
  if (!setting) throw new Error('Credenciais Salsa não encontradas');
  baseUrl = setting.salsa_url;
  pn = setting.salsa_pn;
  key = setting.salsa_key;
  return true;
};

const playGameSalsa = async (type, currency, lang, gameId, agentCode, agentToken, userId) => {
  await getSalsaCredentials();
  const token = MakeToken({ game: gameId, agent_code: agentCode, agent_token: agentToken, user_id: userId });
  const gameUrl = `${baseUrl}/game?token=${token}&type=${type}&currency=${currency}&lang=${lang}`;
  logger.info(`URL de jogo Salsa gerada: ${gameUrl}`);
  return gameUrl;
};

module.exports = { playGameSalsa, getSalsaCredentials, GenerateHashSalsa, DecToken, SendSeamlessPost, logger, baseUrl, pn, key };