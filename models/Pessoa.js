const { DataTypes } = require("sequelize");
const sequelize = require("../database/database");
const Filme = require("./Filme");
const Atuacao = require("./atuacao");
const Producao = require("./producao");

const Pessoa = sequelize.define(
  "Pessoa",
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
    tableName: "pessoa",
    timestamps: false,
  }
);

// Relacionamentos
Pessoa.hasMany(Filme, {
  foreignKey: "diretor_id",
  as: "filmes_dirigidos",
});

Pessoa.belongsToMany(Filme, {
  through: Atuacao,
  foreignKey: "pessoa_id",
  otherKey: "filme_id",
  as: "atuacoes",
});

Pessoa.belongsToMany(Filme, {
  through: Producao,
  foreignKey: "pessoa_id",
  otherKey: "filme_id",
  as: "filmes_produzidos",
});

module.exports = Pessoa;
