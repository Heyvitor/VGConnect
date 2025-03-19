const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProviderKey = sequelize.define('ProviderKey', {
  salsa_url: { type: DataTypes.STRING },
  salsa_pn: { type: DataTypes.STRING },
  salsa_key: { type: DataTypes.STRING },
  play_gaming_hall: { type: DataTypes.STRING },
  play_gaming_key: { type: DataTypes.STRING },
  play_gaming_login: { type: DataTypes.STRING },
}, {
  tableName: 'provider_keys',
  timestamps: true,
});

module.exports = ProviderKey;