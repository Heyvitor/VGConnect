const app = require('./src/app');
const sequelize = require('./src/config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Adicionar tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promessa rejeitada não tratada:', reason);
});

console.log('Iniciando servidor...');
console.log(`Porta configurada: ${PORT}`);
console.log(`Host do banco de dados: ${process.env.DB_HOST}`);

// Iniciar o servidor independentemente da conexão com o banco de dados
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Tentar sincronizar o banco de dados, mas não bloquear a inicialização do servidor
sequelize.sync().then(() => {
  console.log('Banco de dados sincronizado com sucesso!');
}).catch((error) => {
  console.error('Erro ao conectar ao banco de dados:', error);
});