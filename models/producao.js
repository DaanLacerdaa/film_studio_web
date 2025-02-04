const { DataTypes } = require("sequelize");
const sequelize = require("../database/database");

const Producao = sequelize.define(
  "Producao",
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
    tableName: "producao",
    timestamps: false,
  }
);

// Garante que apenas PRODUTORES possam ser inseridos na Produção
Producao.beforeCreate(async (producao, options) => {
  const pessoa = await sequelize.models.Pessoa.findByPk(producao.pessoa_id);
  if (!pessoa || pessoa.tipo !== "PRODUTOR") {
    throw new Error("A pessoa deve ser do tipo PRODUTOR para ser adicionada à Produção.");
  }
});


// Relacionamentos
Producao.belongsTo(Pessoa, { foreignKey: "pessoa_id", as: "produtor" });
Producao.belongsTo(Filme, { foreignKey: "filme_id", as: "filme" });


module.exports = Producao;
