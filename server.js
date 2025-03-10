const app = require('./app');
const sequelize = require('src/config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}).catch((error) => {
  console.error('Erro ao conectar ao banco de dados:', error);
});