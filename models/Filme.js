const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");
const Pessoa = require("./pessoa");
const Atuacao = require("./atuacao");
const Producao = require("./producao");

class Filme extends Model {}

Filme.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ano_lancamento: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    genero: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duracao: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idioma: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    diretor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "pessoa",  // Nome da tabela no banco de dados
        key: "id", // Chave primária da tabela pessoa
      },
    },
  },
  {
    sequelize, // Passando a instância do sequelize
    modelName: "Filme", // Nome do modelo
    tableName: "filme", // Nome da tabela
    timestamps: false, // Desabilita a criação de campos de data
  }
);



module.exports = Filme;
