const { Agent } = require('../../models');
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

const getBalance = async (params, token) => {
  logger.info('Método GetBalance chamado');
  await getSalsaCredentials();

  if (!validateHashSalsa(params, token)) {
    logger.error('Hash inválido');
    return showError('GetBalance', 'Invalid Hash', '7000');
  }

  const tokenDec = DecToken(token);
  if (!tokenDec.status) {
    logger.error('Erro ao decodificar token');
    return showError('GetBalance', 'Error retrieving Token', '1');
  }

  const agent = await Agent.findOne({ where: { agent_code: tokenDec.agent_code, agent_token: tokenDec.agent_token } });
  if (!agent) {
    logger.error('Agente não encontrado');
    return showError('GetBalance', 'Error retrieving Token', '1');
  }

  let balance;
  if (agent.endpoint) {
    const response = await SendSeamlessPost(
      { method: 'user_balance', game: tokenDec.game, agent_code: agent.agent_code, user_id: tokenDec.user_id },
      agent.endpoint,
      agent.agent_secret_post,
      tokenDec.agent_token,
      tokenDec.user_id,
      agent.agent_secret_key
    );
    balance = response ? response.balance * 100 : agent.balance * 100;
  } else {
    balance = agent.balance * 100;
  }

  logger.info(`Saldo retornado: ${balance}`);
  return `
    <PKT>
      <Result Name="GetBalance" Success="1">
        <Returnset>
          <Token Type="string" Value="${token}" />
          <Balance Type="int" Value="${balance}" />
          <Currency Type="string" Value="${agent.currency}" />
        </Returnset>
      </Result>
    </PKT>
  `;
};

module.exports = { getBalance };