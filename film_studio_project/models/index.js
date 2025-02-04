const sequelize = require("../database/database");
const Pessoa = require("./pessoa");
const Filme = require("./filme");
const Atuacao = require("./atuacao");
const FilmeProdutor = require("./filme_produtor");

// Definindo o modelo Atuacao
module.exports = (sequelize, DataTypes) => {
  const Atuacao = sequelize.define("Atuacao", {
    is_principal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  Atuacao.associate = (models) => {
    // Associações entre Atuacao, Pessoa e Filme
    Atuacao.belongsTo(models.Pessoa, { foreignKey: "pessoa_id" });
    Atuacao.belongsTo(models.Filme, { foreignKey: "filme_id" });
  };

  return Atuacao;
};

// Relacionamentos

// Relacionamento N:N entre Filme e Pessoa (Elenco)
Filme.belongsToMany(Pessoa, {
  through: Atuacao,
  foreignKey: "filme_id",
  otherKey: "pessoa_id",
  as: "elenco", // Alias 'elenco' para acessar os atores
});

Pessoa.belongsToMany(Filme, {
  through: Atuacao,
  foreignKey: "pessoa_id",
  otherKey: "filme_id",
  as: "atuacoes", // Alias 'atuacoes' para acessar filmes em que a pessoa atuou
});

// Relacionamento N:N entre Filme e Pessoa (Produtores)
Filme.belongsToMany(Pessoa, {
  through: FilmeProdutor,
  foreignKey: "filme_id",
  otherKey: "pessoa_id",
  as: "produtores", // Alias 'produtores' para acessar os produtores de um filme
});

Pessoa.belongsToMany(Filme, {
  through: FilmeProdutor,
  foreignKey: "pessoa_id",
  otherKey: "filme_id",
  as: "filmes_produzidos", // Alias 'filmes_produzidos' para acessar filmes produzidos pela pessoa
});

// Relacionamento 1:N entre Filme e Pessoa (Diretor)
Filme.belongsTo(Pessoa, {
  foreignKey: "diretor_id",
  as: "diretor", // Alias 'diretor' para acessar o diretor de um filme
});

Pessoa.hasMany(Filme, {
  foreignKey: "diretor_id",
  as: "filmes_dirigidos", // Alias 'filmes_dirigidos' para acessar filmes que a pessoa dirigiu
});

// Não é necessário redefinir `Pessoa.associate` aqui, pois as associações já foram feitas acima

// Exportação dos modelos
module.exports = {
  sequelize,
  Pessoa,
  Filme,
  Atuacao,
  FilmeProdutor,
};
