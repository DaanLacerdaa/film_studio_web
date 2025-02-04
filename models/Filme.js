const { DataTypes } = require("sequelize");
const sequelize = require("../database/database");
const Pessoa = require("./pessoa");
const Atuacao = require("./atuacao");
const Producao = require("./producao");

const Filme = sequelize.define(
  "Filme",
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
    campo_imagem: {
      type: DataTypes.STRING,
      allowNull: true,
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
    tableName: "filme",
    timestamps: false,
  }
);

// Definição dos relacionamentos
Filme.belongsTo(Pessoa, {
  foreignKey: "diretor_id",
  as: "diretor",
});

Filme.belongsToMany(Pessoa, {
  through: Atuacao,
  foreignKey: "filme_id",
  otherKey: "pessoa_id",
  as: "elenco",
});

Filme.belongsToMany(Pessoa, {
  through: Producao,
  foreignKey: "filme_id",
  otherKey: "pessoa_id",
  as: "produtores",
});

module.exports = Filme;
