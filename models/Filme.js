const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");
const Pessoa = require("./pessoa");
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
        model: "pessoa",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Filme",
    tableName: "filme",
    timestamps: false,
  }
);

// Definição das associações




module.exports = Filme;
