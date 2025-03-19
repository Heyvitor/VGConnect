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

const refundBet = async (params, token) => {
  logger.info('Método RefundBet chamado');
  await getSalsaCredentials();

  const transactionId = params.TransactionID[0].$.Value;
  const betReferenceNum = params.BetReferenceNum[0].$.Value;
  const preparedToken = transactionId + betReferenceNum + token;

  if (!validateHashSalsa(params, preparedToken)) {
    logger.error('Hash inválido');
    return showError('RefundBet', 'Invalid Hash', '7000');
  }

  const tokenDec = DecToken(token);
  if (!tokenDec.status) {
    logger.error('Erro ao decodificar token');
    return showError('RefundBet', 'Error retrieving Token', '1');
  }

  const transaction = await Transaction.findOne({ where: { transaction_id: transactionId, type: 'bet', refunded: false } });
  if (!transaction) {
    logger.error('Transação não encontrada ou já reembolsada');
    return showError('RefundBet', 'Transaction not found', '7');
  }

  const refundAmount = parseFloat(params.RefundAmount[0].$.Value / 100);
  const agent = await Agent.findOne({ where: { agent_code: tokenDec.agent_code, agent_token: tokenDec.agent_token } });

  const responseSeamless = await SendSeamlessPost(
    {
      method: 'refund',
      game: tokenDec.game,
      agent_code: agent.agent_code,
      transaction_id: transactionId,
      bet: refundAmount,
      win: 0,
      type: 'refund',
      user_id: tokenDec.user_id,
    },
    agent.endpoint,
    agent.agent_secret_post,
    tokenDec.agent_token,
    tokenDec.user_id,
    agent.agent_secret_key
  );

  if (responseSeamless) {
    await agent.increment('balance', refundAmount);
    await transaction.update({ refunded: true });

    const balanceResponse = await SendSeamlessPost(
      { method: 'user_balance', game: tokenDec.game, agent_code: agent.agent_code, user_id: tokenDec.user_id },
      agent.endpoint,
      agent.agent_secret_post,
      tokenDec.agent_token,
      tokenDec.user_id,
      agent.agent_secret_key
    );

    const balanceTotal = balanceResponse ? balanceResponse.balance * 100 : agent.balance * 100;
    logger.info(`Reembolso realizado - Transação ID: ${transaction.id}`);
    return `
      <PKT>
        <Result Name="RefundBet" Success="1">
          <Returnset>
            <Token Type="string" Value="${token}" />
            <Balance Type="int" Value="${balanceTotal}" />
            <Currency Type="string" Value="${agent.currency}" />
            <ExtTransactionID Type="long" Value="${transaction.id}" />
            <AlreadyProcessed Type="bool" Value="true" />
          </Returnset>
        </Result>
      </PKT>
    `;
  }

  logger.error('Erro no reembolso');
  return showError('RefundBet', 'Unspecified Error', '6000');
};

module.exports = { refundBet };