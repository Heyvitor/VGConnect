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

const placeBet = async (params, token) => {
  logger.info('Método PlaceBet chamado');
  await getSalsaCredentials();

  const transactionId = params.TransactionID[0].$.Value;
  const betReferenceNum = params.BetReferenceNum[0].$.Value;
  const preparedToken = transactionId + betReferenceNum + token;

  if (!validateHashSalsa(params, preparedToken)) {
    logger.error('Hash inválido');
    return showError('PlaceBet', 'Invalid Hash', '7000');
  }

  const tokenDec = DecToken(token);
  if (!tokenDec.status) {
    logger.error('Erro ao decodificar token');
    return showError('PlaceBet', 'Error retrieving Token', '1');
  }

  const agent = await Agent.findOne({ where: { agent_code: tokenDec.agent_code, agent_token: tokenDec.agent_token } });
  if (!agent) {
    logger.error('Agente não encontrado');
    return showError('PlaceBet', 'Wrong data type', '5');
  }

  const betAmount = parseFloat(params.BetAmount[0].$.Value / 100);
  const balanceAgent = agent.balance * 100;
  if (betAmount > balanceAgent) {
    logger.error('Fundos insuficientes');
    return showError('PlaceBet', 'Insufficient funds', '6');
  }

  const checkTransaction = await Transaction.findOne({ where: { type: 'bet', transaction_id: transactionId } });
  if (checkTransaction) {
    const responseSeamless = await SendSeamlessPost(
      { method: 'user_balance', game: tokenDec.game, agent_code: agent.agent_code, user_id: tokenDec.user_id },
      agent.endpoint,
      agent.agent_secret_post,
      tokenDec.agent_token,
      tokenDec.user_id,
      agent.agent_secret_key
    );
    const balanceTotal = responseSeamless ? responseSeamless.balance * 100 : 0;
    logger.info('Transação já processada');
    return `
      <PKT>
        <Result Name="PlaceBet" Success="1">
          <Returnset>
            <Token Type="string" Value="${token}"/>
            <Currency Type="string" Value="${agent.currency}"/>
            <Balance Type="int" Value="${balanceTotal}"/>
            <ExtTransactionID Type="long" Value="${checkTransaction.id}"/>
            <AlreadyProcessed Type="bool" Value="true"/>
          </Returnset>
        </Result>
      </PKT>
    `;
  }

  const transaction = await createSalsaTransactions(agent.agent_id, betReferenceNum, transactionId, 'bet', betAmount, 0, 0, tokenDec.game, tokenDec.game);
  if (!transaction) {
    logger.error('Erro ao criar transação');
    return showError('PlaceBet', 'Transaction not found', '7');
  }

  await agent.decrement('balance', betAmount);
  const responseSeamless = await SendSeamlessPost(
    {
      method: 'transaction',
      game: tokenDec.game,
      agent_code: agent.agent_code,
      transaction_id: transaction.id,
      bet: betAmount,
      win: 0,
      type: 'bet',
      user_id: tokenDec.user_id,
    },
    agent.endpoint,
    agent.agent_secret_post,
    tokenDec.agent_token,
    tokenDec.user_id,
    agent.agent_secret_key
  );

  const balance = responseSeamless ? responseSeamless.balance * 100 : agent.balance * 100;
  logger.info(`Aposta realizada - Transação ID: ${transaction.id}`);
  return `
    <PKT>
      <Result Name="PlaceBet" Success="1">
        <Returnset>
          <Token Value="${token}" />
          <Balance Type="int" Value="${balance}" />
          <Currency Type="string" Value="${agent.currency}" />
          <ExtTransactionID Type="long" Value="${transaction.id}" />
          <AlreadyProcessed Type="bool" Value="false" />
        </Returnset>
      </Result>
    </PKT>
  `;
};

module.exports = { placeBet };