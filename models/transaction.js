const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');

const Transaction = sequelize.define('Transaction', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  provider_id: { type: DataTypes.INTEGER },
  session_id: { type: DataTypes.STRING },
  transaction_id: { type: DataTypes.STRING, allowNull: false },
  provider: { type: DataTypes.STRING },
  game: { type: DataTypes.STRING },
  game_uuid: { type: DataTypes.STRING },
  type: { type: DataTypes.STRING, allowNull: false },
  bet: { type: DataTypes.FLOAT, defaultValue: 0 },
  win: { type: DataTypes.FLOAT, defaultValue: 0 },
  refunded: { type: DataTypes.BOOLEAN, defaultValue: false },
  round_id: { type: DataTypes.STRING },
  hash: { type: DataTypes.STRING },
  status: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'transactions',
  timestamps: true,
});

module.exports = Transaction;