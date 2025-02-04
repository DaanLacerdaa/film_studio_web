const { DataTypes } = require('sequelize');
const sequelize = require('../database/database'); // Conexão ao banco de dados

const Ator = sequelize.define('Ator', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  data_nascimento: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  sexo: {
    type: DataTypes.ENUM('Masculino', 'Feminino', 'Outro'),
    allowNull: false,
  },
  nacionalidade: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'atores',
  timestamps: false,
});

module.exports = Ator;
