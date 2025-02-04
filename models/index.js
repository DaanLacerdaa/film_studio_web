const sequelize = require("../database/database");
const Pessoa = require("./pessoa");
const Filme = require("./filme");
const Atuacao = require("./atuacao");
const Producao = require("./producao");

// Relacionamentos

// Filme - Diretor (1:N)
Filme.belongsTo(Pessoa, {
  foreignKey: "diretor_id",
  as: "diretor",
});

Pessoa.hasMany(Filme, {
  foreignKey: "diretor_id",
  as: "filmes_dirigidos",
});

// Filme - Atores (N:N)
Filme.belongsToMany(Pessoa, {
  through: Atuacao,
  foreignKey: "filme_id",
  otherKey: "pessoa_id",
  as: "elenco",
});

Pessoa.belongsToMany(Filme, {
  through: Atuacao,
  foreignKey: "pessoa_id",
  otherKey: "filme_id",
  as: "atuacoes",
});

// Filme - Produtores (N:N)
Filme.belongsToMany(Pessoa, {
  through: Producao,
  foreignKey: "filme_id",
  otherKey: "pessoa_id",
  as: "produtores",
});

Pessoa.belongsToMany(Filme, {
  through: Producao,
  foreignKey: "pessoa_id",
  otherKey: "filme_id",
  as: "filmes_produzidos",
});

// Exportação dos modelos
module.exports = {
  sequelize,
  Pessoa,
  Filme,
  Atuacao,
  Producao,
};
