const { Agent, Transaction } = require('../../models');
const { SendSeamlessPost, DecToken, GenerateHashSalsa, getSalsaCredentials, logger } = require('./salsaTrait');

const showError = (method, error, errorCode) => `
  <PKT>
    <Result Name="${method}" Success="0">
      <Returnset>
        <Error Type="string" Value="${error}" />
        <ErrorCode Type="string" Value="${errorCode}" />
      </Returnset>
    </Result>
  </PKT>
`;

const validateHashSalsa = (params, token) => {
  const hash = params.Hash[0].$.Value;
  if (hash === ':hash') return false;
  const generatedHash = GenerateHashSalsa(token, key);
  return hash === generatedHash;
};

const createSalsaTransactions = async (playerId, betReferenceNum, transactionId, type, bet, win, status, game, pn) => {
  const transaction = await Transaction.create({
    user_id: playerId,
    session_id: betReferenceNum,
    transaction_id: transactionId,
    type,
    bet,
    win,
    provider: 'Salsa',
    status,
    game,
    game_uuid: pn,
    round_id: '1',
  });
  return transaction || false;
};

const awardWinnings = async (params, token) => {
  logger.info('Método AwardWinnings chamado');
  await getSalsaCredentials();

  const transactionId = params.TransactionID[0].$.Value;
  const winReferenceNum = params.WinReferenceNum[0].$.Value;
  const preparedToken = transactionId + winReferenceNum + token;

  if (!validateHashSalsa(params, preparedToken)) {
    logger.error('Hash inválido');
    return showError('AwardWinnings', 'Invalid Hash', '7000');
  }

  const tokenDec = DecToken(token);
  if (!tokenDec.status) {
    logger.error('Erro ao decodificar token');
    return showError('AwardWinnings', 'Error retrieving Token', '1');
  }

  const agent = await Agent.findOne({ where: { agent_code: tokenDec.agent_code, agent_token: tokenDec.agent_token } });
  const transaction = await Transaction.findOne({ where: { transaction_id: transactionId, type: 'bet' } });
  if (!transaction) {
    logger.error('Transação não encontrada');
    return showError('AwardWinnings', 'Transaction not found', '7');
  }

  const winAmount = parseFloat(params.WinAmount[0].$.Value / 100);
  if (winAmount > 0) {
    const checkTransaction = await Transaction.findOne({ where: { session_id: winReferenceNum } });
    if (checkTransaction) {
      logger.error('Transação de ganho já existe');
      return showError('AwardWinnings', 'Transaction not found', '7');
    }

    await agent.increment('balance', winAmount);
    await createSalsaTransactions(agent.agent_id, winReferenceNum, transactionId, 'win', 0, winAmount, 1, tokenDec.game, tokenDec.game);

    await SendSeamlessPost(
      {
        method: 'transaction',
        game: tokenDec.game,
        agent_code: agent.agent_code,
        transaction_id: transactionId,
        transaction_id_old: transaction.id,
        bet: transaction.bet,
        win: winAmount,
        type: 'win',
        user_id: tokenDec.user_id,
      },
      agent.endpoint,
      agent.agent_secret_post,
      tokenDec.agent_token,
      tokenDec.user_id,
      agent.agent_secret_key
    );
  }

  const responseSeamless = await SendSeamlessPost(
    { method: 'user_balance', game: tokenDec.game, agent_code: agent.agent_code, user_id: tokenDec.user_id },
    agent.endpoint,
    agent.agent_secret_post,
    tokenDec.agent_token,
    tokenDec.user_id,
    agent.agent_secret_key
  );

  const balanceTotal = responseSeamless ? responseSeamless.balance * 100 : agent.balance * 100;
  logger.info(`Ganhos atribuídos - Transação ID: ${transaction.id}`);
  return `
    <PKT>
      <Result Name="AwardWinnings" Success="1">
        <Returnset>
          <Token Type="string" Value="${token}" />
          <Balance Type="int" Value="${balanceTotal}" />
          <Currency Type="string" Value="${agent.currency}" />
          <ExtTransactionID Type="long" Value="${transaction.id}" />
          <AlreadyProcessed Type="bool" Value="false" />
        </Returnset>
      </Result>
    </PKT>
  `;
};

module.exports = { awardWinnings };