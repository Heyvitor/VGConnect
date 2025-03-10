const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');

const Agent = sequelize.define('Agent', {
  agent_sponsor_id: { type: DataTypes.INTEGER, allowNull: false },
  agent_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  agent_code: { type: DataTypes.STRING, allowNull: false, unique: true },
  agent_token: { type: DataTypes.STRING, allowNull: false },
  agent_secret_key: { type: DataTypes.STRING, allowNull: false },
  agent_ip_auth: { type: DataTypes.STRING, allowNull: false },
  agent_type: { type: DataTypes.ENUM('reseller', 'agent'), allowNull: false },
  agent_secret_post: { type: DataTypes.STRING, allowNull: false },
  agent_status: { type: DataTypes.ENUM('active', 'inactive'), allowNull: false },
  api_type: { type: DataTypes.STRING, defaultValue: 'seamless' },
  balance: { type: DataTypes.FLOAT, defaultValue: 0 },
  ggr: { type: DataTypes.FLOAT, defaultValue: 0 },
  currency: { type: DataTypes.STRING, allowNull: false },
  endpoint: { type: DataTypes.STRING },
}, {
  tableName: 'agents',
  timestamps: true,
});

module.exports = Agent;