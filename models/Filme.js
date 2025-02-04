const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");
const Pessoa = require("./Pessoa");
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
    campo_imagem: {
      type: DataTypes.STRING,
      allowNull: true,
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

// Definição dos relacionamentos
Filme.belongsTo(Pessoa, {
  foreignKey: "diretor_id", // Relacionamento com a chave estrangeira
  as: "diretor", // Alias para acessar o diretor
});

Filme.belongsToMany(Pessoa, {
  through: Atuacao,
  foreignKey: "filme_id",
  otherKey: "pessoa_id",
  as: "elenco", // Alias para acessar os atores
});

Filme.belongsToMany(Pessoa, {
  through: Producao,
  foreignKey: "filme_id",
  otherKey: "pessoa_id",
  as: "produtores", // Alias para acessar os produtores
});

module.exports = Filme;
