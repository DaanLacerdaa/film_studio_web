const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");
const Filme = require("./Filme");
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

// Relacionamentos
Pessoa.hasMany(Filme, {
  foreignKey: "diretor_id", // Relacionamento com a chave estrangeira
  as: "filmes_dirigidos", // Alias para acessar os filmes dirigidos
});

Pessoa.belongsToMany(Filme, {
  through: Atuacao,
  foreignKey: "pessoa_id",
  otherKey: "filme_id",
  as: "atuacoes", // Alias para acessar os filmes nos quais a pessoa atuou
});

Pessoa.belongsToMany(Filme, {
  through: Producao,
  foreignKey: "pessoa_id",
  otherKey: "filme_id",
  as: "filmes_produzidos", // Alias para acessar os filmes produzidos
});

module.exports = Pessoa;
