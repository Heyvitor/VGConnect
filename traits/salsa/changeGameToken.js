const { DecToken, GenerateHashSalsa, getSalsaCredentials, logger } = require('./salsaTrait');

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

const changeGameToken = async (params, token) => {
  logger.info('Método ChangeGameToken chamado');
  await getSalsaCredentials();

  const newGameReference = params.NewGameReference[0].$.Value;
  const preparedToken = newGameReference + token;

  if (!validateHashSalsa(params, preparedToken)) {
    logger.error('Hash inválido');
    return showError('ChangeGameToken', 'Invalid Hash', '7000');
  }

  const tokenDec = DecToken(token);
  if (!tokenDec.status) {
    logger.error('Erro ao decodificar token');
    return showError('ChangeGameToken', 'Error retrieving Token', '1');
  }

  logger.info('Token de jogo alterado com sucesso');
  return `
    <PKT>
      <Result Name="ChangeGameToken" Success="1">
        <Returnset>
          <NewToken Type="string" Value="${token}" />
        </Returnset>
      </Result>
    </PKT>
  `;
};

module.exports = { changeGameToken };