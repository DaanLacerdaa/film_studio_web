const { DataTypes } = require("sequelize");
const sequelize = require("../database/database");

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
      type: DataTypes.ENUM("Ator", "Diretor", "Produtor"),
      allowNull: false,
    },
  },
  {
    tableName: "pessoa",
    timestamps: false,
  }
);
module.exports = (sequelize, DataTypes) => {
  const Pessoa = sequelize.define("Pessoa", {
    nome: DataTypes.STRING,
    data_nascimento: DataTypes.DATE,
    sexo: DataTypes.STRING,
    nacionalidade: DataTypes.STRING,
    tipo: DataTypes.STRING, // Ex: "Ator", "Diretor", "Produtor"
  });

  // Relacionamento com Filmes como Diretor
  Pessoa.hasMany(Filme, {
    foreignKey: "diretor_id",
    as: "filmes_dirigidos", // Alias para acessar os filmes dirigidos pela pessoa
  });

  // Relacionamento com Filmes como Atores (Elenco)
  Pessoa.belongsToMany(Filme, {
    through: "Atuacao",
    foreignKey: "pessoa_id",
    otherKey: "filme_id",
    as: "filmes", // Alias para acessar os filmes em que a pessoa atuou
  });

  // Relacionamento com Filmes como Produtores
  Pessoa.belongsToMany(Filme, {
    through: "FilmeProdutor",
    foreignKey: "pessoa_id",
    otherKey: "filme_id",
    as: "filmes_produzidos", // Alias para acessar os filmes produzidos pela pessoa
  });

  return Pessoa;
};

module.exports = Pessoa;
