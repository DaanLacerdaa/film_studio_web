const sequelize = require("../database/database");
const Pessoa = require("./pessoa");
const Filme = require("./filme");
const Atuacao = require("./atuacao");
const Producao = require("./producao");

// Relacionamentos

// Filme - Diretor (1:N)
Filme.belongsTo(Pessoa, {
  foreignKey: "diretor_id",
  as: "diretor", // Alias para o relacionamento
});

Pessoa.hasMany(Filme, {
  foreignKey: "diretor_id",
  as: "filmes_dirigidos", // Alias para o relacionamento
});

// Filme - Atores (N:N)
Filme.belongsToMany(Pessoa, {
  through: Atuacao,
  foreignKey: "filme_id",
  otherKey: "pessoa_id",
  as: "elenco", // Alias para o relacionamento
});

Pessoa.belongsToMany(Filme, {
  through: Atuacao,
  foreignKey: "pessoa_id",
  otherKey: "filme_id",
  as: "atuacoes", // Alias para o relacionamento
});

// Filme - Produtores (N:N)
Filme.belongsToMany(Pessoa, {
  through: Producao,
  foreignKey: "filme_id",
  otherKey: "pessoa_id",
  as: "produtores", // Alias para o relacionamento
});

Pessoa.belongsToMany(Filme, {
  through: Producao,
  foreignKey: "pessoa_id",
  otherKey: "filme_id",
  as: "filmes_produzidos", // Alias para o relacionamento
});

// Sincronização dos modelos
sequelize.sync({ force: false })  // Use force: true apenas se for necessário para reescrever o banco de dados
  .then(() => console.log("Banco de dados sincronizado"))
  .catch((err) => console.error("Erro ao sincronizar o banco de dados", err));

// Exportação dos modelos e da instância sequelize
module.exports = {
  sequelize,
  Pessoa,
  Filme,
  Atuacao,
  Producao,
};
