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

const getAccountDetails = async (params, token) => {
  logger.info('Método GetAccountDetails chamado');
  await getSalsaCredentials();

  if (!validateHashSalsa(params, token)) {
    logger.error('Hash inválido');
    return showError('GetAccountDetails', 'Invalid Hash', '7000');
  }

  const tokenDec = DecToken(token);
  if (!tokenDec.status) {
    logger.error('Erro ao decodificar token');
    return showError('GetAccountDetails', 'Error retrieving Token', '1');
  }

  const agent = await Agent.findOne({ where: { agent_code: tokenDec.agent_code, agent_token: tokenDec.agent_token } });
  if (!agent || !agent.endpoint) {
    logger.error('Agente ou endpoint não encontrado');
    return showError('GetAccountDetails', 'Error retrieving Token', '1');
  }

  const response = await SendSeamlessPost(
    { method: 'account_details', game: tokenDec.game, agent_code: agent.agent_code, user_id: tokenDec.user_id },
    agent.endpoint,
    agent.agent_secret_post,
    tokenDec.agent_token,
    tokenDec.user_id,
    agent.agent_secret_key
  );

  if (!response) {
    logger.error('Erro na resposta do endpoint');
    return showError('GetAccountDetails', 'Error retrieving Token', '1');
  }

  const currency = agent.currency;
  const country = currency === 'BRL' ? 'BR' : 'USA';
  const email = response.email;
  const date = response.date;

  logger.info('Detalhes da conta retornados com sucesso');
  return `
    <PKT>
      <Result Name="GetAccountDetails" Success="1">
        <Returnset>
          <Token Type="string" Value="${token}" />
          <LoginName Type="string" Value="${email}" />
          <Currency Type="string" Value="${currency}" />
          <Country Type="string" Value="${country}" />
          <Birthdate Type="date" Value="1988-08-02" />
          <Registration Type="date" Value="${date}" />
          <Gender Type="string" Value="m" />
        </Returnset>
      </Result>
    </PKT>
  `;
};

module.exports = { getAccountDetails };