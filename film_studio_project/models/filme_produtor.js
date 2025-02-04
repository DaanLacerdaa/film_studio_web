const { DataTypes } = require("sequelize");
const sequelize = require("../database/database");
const Pessoa = require("./pessoa"); // Importe o modelo Pessoa para a validação
const FilmeProdutor = sequelize.define(
  "filme_produtors",
  {
    filme_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "filme",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    pessoa_id: {
      // Substituindo produtor_id por pessoa_id
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "pessoa",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    timestamps: false,
  }
);

// Garantir que só PRODUTORES possam ser inseridos
FilmeProdutor.beforeCreate(async (filmeProdutor, options) => {
  const pessoa = await sequelize.models.pessoa.findByPk(
    filmeProdutor.pessoa_id
  );
  if (!pessoa || pessoa.tipo !== "PRODUTOR") {
    throw new Error(
      "A pessoa deve ser do tipo PRODUTOR para ser adicionada a Filme_Produtor."
    );
  }
});

module.exports = FilmeProdutor;
