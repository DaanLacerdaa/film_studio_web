const { DataTypes } = require("sequelize");
const sequelize = require("../database/database");
const Filme = require("./filme");
const Pessoa = require("./pessoa");

const Atuacao = sequelize.define(
  "Atuacao",
  {
    filme_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "filme",
        key: "id",
      },
      primaryKey: true, // Definindo como parte da chave primária composta
    },
    pessoa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "pessoa",
        key: "id",
      },
      primaryKey: true, // Definindo como parte da chave primária composta
    },
    is_principal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "atuacao",
    timestamps: false,
    indexes: [
      {
        unique: true, // Combinando filme_id + pessoa_id como única
        fields: ["filme_id", "pessoa_id"],
      },
    ],
  }
);

module.exports = Atuacao;
