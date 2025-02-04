const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");
const Filme = require("./filme");
const Atuacao = require("./atuacao");
const Producao = require("./producao");

class Pessoa extends Model {}

Pessoa.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data_nascimento: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    sexo: {
      type: DataTypes.ENUM("Masculino", "Feminino", "Outro"),
      allowNull: false,
    },
    nacionalidade: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.ENUM("ATOR", "DIRETOR", "PRODUTOR"),
      allowNull: false,
    },
  },
  {
    sequelize, // Passando a instância do sequelize
    modelName: "Pessoa", // Nome do modelo
    tableName: "pessoa", // Nome da tabela
    timestamps: false, // Desabilita a criação de campos de data
  }
);


module.exports = Pessoa;
