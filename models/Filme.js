const { DataTypes } = require("sequelize");
const sequelize = require("../database/database");

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
    // models/filme.js (trecho relevante)
    ano_lancamento: {
      type: DataTypes.INTEGER, // Tipo deve ser INTEGER
      allowNull: false, // Ou true, dependendo do caso
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
    }, // No modelo Filme
    campo_imagem: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    diretor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "pessoa", // Nome correto da tabela no banco
        key: "id",
      },
    },
  },
  {
    tableName: "filme",
    timestamps: false,
  }
);
module.exports = (sequelize, DataTypes) => {
  const Filme = sequelize.define("Filme", {
    titulo: DataTypes.STRING,
    ano_lancamento: DataTypes.INTEGER,
    genero: DataTypes.STRING,
    duracao: DataTypes.INTEGER,
    idioma: DataTypes.STRING,
  });

  // Relacionamento com Diretor
  Filme.belongsTo(Pessoa, {
    foreignKey: "diretor_id", // Chave estrangeira
    as: "diretor", // Alias para acessar o diretor do filme
  });

  // Relacionamento com Atores (Elenco)
  Filme.belongsToMany(Pessoa, {
    through: "Atuacao", // Relacionamento através da tabela "Atuacao"
    foreignKey: "filme_id", // Chave estrangeira no modelo Atuacao
    otherKey: "pessoa_id", // Chave estrangeira para a pessoa no modelo Atuacao
    as: "elenco", // Alias para acessar o elenco do filme
  });

  // Relacionamento com Produtores
  Filme.belongsToMany(Pessoa, {
    through: "FilmeProdutor", // Relacionamento através da tabela "FilmeProdutor"
    foreignKey: "filme_id",
    otherKey: "pessoa_id",
    as: "produtores", // Alias para acessar os produtores
  });

  return Filme;
};

module.exports = Filme;
