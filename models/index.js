const sequelize = require("../database/database");
const Pessoa = require("./pessoa");
const Filme = require("./filme");
const Atuacao = require("./atuacao");
const Producao = require("./producao");

// Defina todos os modelos primeiro
const models = {
  Pessoa,
  Filme,
  Atuacao,
  Producao,
};

// Carregar modelos para o sequelize
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(sequelize.models);
  }
});

// Defina as associações AQUI (sem usar imports diretos)
Filme.belongsTo(sequelize.models.Pessoa, {
  foreignKey: "diretor_id",
  as: "diretor",
});

sequelize.models.Pessoa.hasMany(Filme, {
  foreignKey: "diretor_id",
  as: "filmes_dirigidos",
});

// Filme - Atores (N:N)
Filme.belongsToMany(sequelize.models.Pessoa, {
  through: Atuacao,
  foreignKey: "filme_id",
  otherKey: "pessoa_id",
  as: "elenco",
});

sequelize.models.Pessoa.belongsToMany(Filme, {
  through: Atuacao,
  foreignKey: "pessoa_id",
  otherKey: "filme_id",
  as: "atuacoes",
});

// Filme - Produtores (N:N)
Filme.belongsToMany(sequelize.models.Pessoa, {
  through: Producao,
  foreignKey: "filme_id",
  otherKey: "pessoa_id",
  as: "produtores",
});


sequelize.models.Pessoa.belongsToMany(Filme, {
  through: Producao,
  foreignKey: "pessoa_id",
  otherKey: "filme_id",
  as: "filmes_produzidos",
});

// Sincronização
sequelize.sync({ force: false })
  .then(() => console.log("Banco de dados sincronizado"))
  .catch((err) => console.error("Erro ao sincronizar:", err));


  
module.exports = {
  sequelize,
  ...sequelize.models,
};