const express = require('express');
const router = express.Router();
const xml2js = require('xml2js');
const { webhookSalsa } = require('../traits/salsa/salsaTrait');
const { getAccountDetails } = require('../traits/salsa/getAccountDetails');
const { getBalance } = require('../traits/salsa/getBalance');
const { placeBet } = require('../traits/salsa/placeBet');
const { awardWinnings } = require('../traits/salsa/awardWinnings');
const { refundBet } = require('../traits/salsa/refundBet');
const { changeGameToken } = require('../traits/salsa/changeGameToken');
const { logger } = require('../traits/salsa/salsaTrait');

const webhookSalsaHandler = async (req, res) => {
  try {
    const xmlstring = req.body;
    const parser = new xml2js.Parser();
    const array = await parser.parseStringPromise(xmlstring);

    const method = array.PKT.Method[0].$.Name;
    const params = array.PKT.Method[0].Params[0];
    const token = params.Token[0].$.Value;

    logger.info(`Webhook Salsa - Método: ${method}, Params: ${JSON.stringify(params)}`);

    let response;
    switch (method) {
      case 'GetAccountDetails':
        response = await getAccountDetails(params, token);
        break;
      case 'GetBalance':
        response = await getBalance(params, token);
        break;
      case 'PlaceBet':
        response = await placeBet(params, token);
        break;
      case 'AwardWinnings':
        response = await awardWinnings(params, token);
        break;
      case 'RefundBet':
        response = await refundBet(params, token);
        break;
      case 'ChangeGameToken':
        response = await changeGameToken(params, token);
        break;
      default:
        response = 'Método não encontrado';
    }

    res.set('Content-Type', 'application/xml');
    res.send(response);
  } catch (error) {
    logger.error(`Erro no webhook Salsa: ${error.message}`);
    res.status(500).send('<PKT><Result Success="0"><Returnset><Error Type="string" Value="Erro interno" /></Returnset></Result></PKT>');
  }
};

router.post('/hooksalsa', webhookSalsaHandler);

module.exports = router;