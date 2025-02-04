const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Diretor = sequelize.define('Diretor', {
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
  tableName: 'diretores',
  timestamps: false,
});

module.exports = Diretor;
