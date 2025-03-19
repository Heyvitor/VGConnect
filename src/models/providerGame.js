const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProviderGame = sequelize.define('ProviderGame', {
  provider_id: { type: DataTypes.INTEGER, allowNull: false },
  game_server_url: { type: DataTypes.STRING },
  game_id: { type: DataTypes.STRING, allowNull: false },
  game_name: { type: DataTypes.STRING, allowNull: false },
  game_code: { type: DataTypes.STRING },
  game_type: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  cover: { type: DataTypes.STRING },
  technology: { type: DataTypes.STRING },
  has_lobby: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_mobile: { type: DataTypes.BOOLEAN, defaultValue: false },
  has_freespins: { type: DataTypes.BOOLEAN, defaultValue: false },
  has_tables: { type: DataTypes.BOOLEAN, defaultValue: false },
  only_demo: { type: DataTypes.BOOLEAN, defaultValue: false },
  distribution: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.INTEGER, defaultValue: 1 },
}, {
  tableName: 'provider_games',
  timestamps: true,
});

module.exports = ProviderGame;