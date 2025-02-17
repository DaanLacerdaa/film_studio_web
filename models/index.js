const sequelize = require("../database/database"); // Conexão
const Pessoa = require("./pessoa");
const Filme = require("./Filme");
const Atuacao = require("./atuacao");
const Producao = require("./producao");
const Direcao = require("./direcao");

Filme.belongsToMany(Pessoa, {
  through: "direcao", // Nome da tabela intermediária
  as: "diretores",
  foreignKey: "filme_id",
  otherKey: "diretor_id",
});

Pessoa.belongsToMany(Filme, {
  through: "direcao",
  as: "filmesDirigidos",
  foreignKey: "diretor_id",
  otherKey: "filme_id",
});
// Relacionamento Ator - Filme (N:N)
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
  scope: { tipo: "ATOR" },
});

// Relacionamento Produtor - Filme (N:N)
Filme.belongsToMany(Pessoa, {
  through: Producao,
  foreignKey: "filme_id",
  otherKey: "pessoa_id",
  as: "produtores",
});
Pessoa.belongsToMany(Filme, {
  through: Producao,
  foreignKey: "produtorId",
  otherKey: "filme_id",
  as: "filmes_produzidos",
  scope: { tipo: "PRODUTOR" },
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

module.exports = { sequelize, Pessoa, Filme, Atuacao, Producao, Direcao };
