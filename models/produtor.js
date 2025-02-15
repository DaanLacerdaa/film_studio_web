const { DataTypes } = require("sequelize");
const sequelize = require("../database/database");
const Pessoa = require("./pessoa");

const Produtor = sequelize.define(
  "Produtor",
  {},
  {
    tableName: "pessoa", // Usa a mesma tabela de Pessoa
    timestamps: false,
  }
);

// Configurando associação para filtrar apenas PRODUTORES
Produtor.hasOne(Pessoa, {
  foreignKey: "id",
  sourceKey: "id",
  constraints: false,
  scope: {
    tipo: "PRODUTOR",
  },
});

module.exports = Produtor;
