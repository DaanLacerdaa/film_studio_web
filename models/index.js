const sequelize = require("../database/database"); // IMPORTA PRIMEIRO O SEQUELIZE
const Pessoa = require("./pessoa");
const Filme = require("./Filme");
const Atuacao = require("./atuacao");
const Producao = require("./producao");

// Definição de Associações
Pessoa.hasMany(Filme, { foreignKey: "diretor_id", as: "filmes_dirigidos" });
Filme.belongsTo(Pessoa, { foreignKey: "diretor_id", as: "diretor" });

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
  otherKey: "produtor_id",
  as: "produtores",
});

Pessoa.belongsToMany(Filme, {
  through: Producao,
  foreignKey: "pessoa_id",
  otherKey: "filme_id",
  as: "filmes_produzidos",
});

// Testa conexão antes de sincronizar
sequelize
  .authenticate()
  .then(() => console.log("✅ Conexão com o banco de dados bem-sucedida!"))
  .catch((err) => console.error("❌ Erro na conexão com o banco:", err));

// Sincroniza banco de dados
sequelize
  .sync({ force: false })
  .then(() => console.log("✅ Banco de dados sincronizado"))
  .catch((err) => console.error("❌ Erro ao sincronizar:", err));

module.exports = { sequelize, Pessoa, Filme, Atuacao, Producao };
