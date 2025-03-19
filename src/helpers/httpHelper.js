const axios = require('axios');
const crypto = require('crypto');

const SendSeamlessPost = async (data, endpoint, agentSecretPost, tokenAgent, userId, agentSecretKey) => {
  try {
    const hashPost = crypto.createHmac('sha256', `${agentSecretPost}:${tokenAgent}:${userId}:${agentSecretKey}`).digest('hex');
    const response = await axios.post(endpoint, { ...data, hash: hashPost });
    return response.data;
  } catch (error) {
    throw new Error(`Erro na requisição: ${error.message}`);
  }
};

module.exports = { SendSeamlessPost };