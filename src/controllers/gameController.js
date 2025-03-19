const { ProviderGame } = require('../models');
const { ReturnErrorApi } = require('../helpers/errorHelper');
const { playGameSalsa } = require('../traits/salsa/salsaTrait');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({ filename: 'logs/games.log' }),
  ],
});

const launchGames = async (req, res) => {
  const { agent_code, game_id, type, currency, lang, user_id, username } = req.query;

  logger.info(`Requisição recebida - Params: ${JSON.stringify(req.query)}`);

  const requiredFields = { agent_code, game_id, type, currency, lang, user_id, username };
  const missingFields = Object.keys(requiredFields).filter(key => !requiredFields[key]);
  if (missingFields.length > 0) {
    logger.error(`Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
    return ReturnErrorApi(res, `Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
  }

  try {
    const game = await ProviderGame.findOne({ where: { game_id, status: 1 } });
    if (!game) {
      logger.error(`Jogo não encontrado - game_id: ${game_id}`);
      return res.status(400).sendFile('error.html', { root: './public' }, { error: 'INVALID_GAME' });
    }

    let gameUrl;
    if (game.distribution === 'salsa') {
      gameUrl = await playGameSalsa(type, currency, lang, game_id, agent_code, req.user.agent_token, user_id);
    } else {
      logger.error(`Distribuição não suportada: ${game.distribution}`);
      return res.status(400).sendFile('error.html', { root: './public' }, { error: 'INVALID_DISTRIBUTION' });
    }

    logger.info(`Jogo lançado com sucesso - game_id: ${game_id}, URL: ${gameUrl}`);
    res.json({
      game: {
        game_id: game.game_id,
        game_name: game.game_name,
        game_code: game.game_code,
        game_type: game.game_type,
        description: game.description,
        cover: game.cover,
        has_lobby: game.has_lobby,
        is_mobile: game.is_mobile,
        has_freespins: game.has_freespins,
        has_tables: game.has_tables,
        only_demo: game.only_demo,
      },
      game_url: gameUrl,
    });
  } catch (error) {
    logger.error(`Erro ao lançar jogo: ${error.message}`);
    ReturnErrorApi(res, 'INTERNAL_SERVER_ERROR', 500);
  }
};

module.exports = { launchGames };